import { Router } from 'express';
import pool from '../config/db.js';
import { HttpError, cleanText, escapeLike, toInt, toMoney } from '../middleware/validate.js';

const router = Router();

const SORTS = {
  newest: 'p.created_at DESC, p.id DESC',
  price_asc: 'p.price ASC, p.id ASC',
  price_desc: 'p.price DESC, p.id ASC',
  name: 'p.name_en ASC, p.id ASC',
};

const LIST_SELECT = `
  SELECT p.id, p.sku, p.name_en, p.name_am, p.price, p.old_price, p.stock, p.is_featured,
         c.slug AS category_slug, c.name_en AS category_en, c.name_am AS category_am,
         (SELECT url FROM product_images i WHERE i.product_id = p.id ORDER BY i.sort_order ASC, i.id ASC LIMIT 1) AS thumbnail,
         (SELECT COUNT(*) FROM product_variants v WHERE v.product_id = p.id AND v.is_active = 1) AS variants_count,
         (SELECT ROUND(AVG(r.rating_overall), 1) FROM reviews r WHERE r.product_id = p.id AND r.is_approved = 1) AS rating,
         (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id AND r.is_approved = 1) AS review_count
    FROM products p JOIN categories c ON c.id = p.category_id`;

const shape = (r) => ({
  ...r,
  price: Number(r.price),
  old_price: r.old_price == null ? null : Number(r.old_price),
  variants_count: Number(r.variants_count),
  review_count: Number(r.review_count),
  is_featured: Boolean(r.is_featured),
});

// GET /api/products?category=lighting&minPrice=500&maxPrice=5000&q=lamp&sort=price_asc&featured=1&limit=20
router.get('/', async (req, res) => {
  const q = req.query;
  const where = ['p.is_active = 1', 'c.is_active = 1'];
  const params = [];

  if (q.category) {
    where.push('c.slug = ?');
    params.push(String(q.category).slice(0, 80));
  }
  const min = toMoney(q.minPrice);
  const max = toMoney(q.maxPrice);
  if (min != null && !Number.isNaN(min)) {
    where.push('p.price >= ?');
    params.push(min);
  }
  if (max != null && !Number.isNaN(max)) {
    where.push('p.price <= ?');
    params.push(max);
  }
  const text = cleanText(q.q).slice(0, 100);
  if (text) {
    where.push('(p.name_en LIKE ? OR p.name_am LIKE ? OR p.sku LIKE ?)');
    const like = `%${escapeLike(text)}%`;
    params.push(like, like, like);
  }
  if (q.featured === '1') where.push('p.is_featured = 1');

  const order = SORTS[q.sort] || SORTS.newest;
  const limit = toInt(q.limit, { min: 1, max: 200 }) || 200;

  const [rows] = await pool.query(`${LIST_SELECT} WHERE ${where.join(' AND ')} ORDER BY ${order} LIMIT ?`, [
    ...params,
    limit,
  ]);
  res.json(rows.map(shape));
});

// GET /api/products/:id  (everything comes from MySQL)
router.get('/:id', async (req, res) => {
  const id = toInt(req.params.id, { min: 1 });
  if (!id) throw new HttpError(404, 'Product not found');

  const [[product]] = await pool.query(
    `SELECT p.id, p.sku, p.name_en, p.name_am, p.tagline_en, p.tagline_am, p.description_en, p.description_am,
            p.price, p.old_price, p.stock, p.is_featured, p.details,
            c.id AS category_id, c.slug AS category_slug, c.name_en AS category_en, c.name_am AS category_am
       FROM products p JOIN categories c ON c.id = p.category_id
      WHERE p.id = ? AND p.is_active = 1 AND c.is_active = 1`,
    [id]
  );
  if (!product) throw new HttpError(404, 'Product not found');

  const [variants] = await pool.query(
    'SELECT id, name_en, name_am, hex_color, stock FROM product_variants WHERE product_id = ? AND is_active = 1 ORDER BY id',
    [id]
  );
  const [images] = await pool.query(
    'SELECT variant_id, url FROM product_images WHERE product_id = ? ORDER BY sort_order, id',
    [id]
  );
  const [reviews] = await pool.query(
    `SELECT id, author_name, rating_overall, rating_quality, rating_comfort, rating_value, rating_delivery,
            body, created_at, is_verified_purchase
       FROM reviews WHERE product_id = ? AND is_approved = 1 ORDER BY created_at DESC LIMIT 100`,
    [id]
  );
  const reviewIds = reviews.map((r) => r.id);
  let photos = [];
  if (reviewIds.length) {
    [photos] = await pool.query('SELECT review_id, url FROM review_photos WHERE review_id IN (?)', [reviewIds]);
  }
  const [related] = await pool.query(
    `${LIST_SELECT} WHERE p.category_id = ? AND p.id <> ? AND p.is_active = 1 AND c.is_active = 1
      ORDER BY p.is_featured DESC, p.created_at DESC LIMIT 4`,
    [product.category_id, id]
  );
  const [[stats]] = await pool.query(
    'SELECT ROUND(AVG(rating_overall), 1) AS rating, COUNT(*) AS n FROM reviews WHERE product_id = ? AND is_approved = 1',
    [id]
  );

  let details = product.details;
  if (typeof details === 'string') {
    try {
      details = JSON.parse(details);
    } catch (err) {
      details = null;
    }
  }

  res.json({
    ...product,
    price: Number(product.price),
    old_price: product.old_price == null ? null : Number(product.old_price),
    is_featured: Boolean(product.is_featured),
    details: details || null,
    rating: stats.rating == null ? null : Number(stats.rating),
    review_count: Number(stats.n),
    images: images.filter((i) => !i.variant_id).map((i) => i.url),
    variants: variants.map((v) => ({
      ...v,
      images: images.filter((i) => i.variant_id === v.id).map((i) => i.url),
    })),
    reviews: reviews.map((r) => ({
      ...r,
      is_verified_purchase: Boolean(r.is_verified_purchase),
      photos: photos.filter((p) => p.review_id === r.id).map((p) => p.url),
    })),
    related: related.map(shape),
  });
});

export default router;