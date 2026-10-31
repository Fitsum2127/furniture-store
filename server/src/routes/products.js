import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

// GET /api/products?category=lighting&minPrice=500&maxPrice=5000&q=lamp&sort=price_asc
router.get('/', async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, q, sort } = req.query;
    const where = ['p.is_active = 1'];
    const params = [];

    if (category) { where.push('c.slug = ?'); params.push(String(category)); }
    if (minPrice && !Number.isNaN(Number(minPrice))) { where.push('p.price >= ?'); params.push(Number(minPrice)); }
    if (maxPrice && !Number.isNaN(Number(maxPrice))) { where.push('p.price <= ?'); params.push(Number(maxPrice)); }
    if (q) {
      where.push('(p.name_en LIKE ? OR p.name_am LIKE ?)');
      params.push(`%${q}%`, `%${q}%`);
    }

    const orderBy = {
      price_asc: 'p.price ASC',
      price_desc: 'p.price DESC',
      newest: 'p.created_at DESC, p.id DESC',
    }[sort] || 'p.created_at DESC, p.id DESC';

    const [rows] = await pool.query(
      `SELECT p.id, p.sku, p.name_en, p.name_am, p.price, p.old_price, p.stock,
              c.slug AS category_slug, c.name_en AS category_en, c.name_am AS category_am,
              (SELECT url FROM product_images i WHERE i.product_id = p.id
                 ORDER BY i.sort_order ASC, i.id ASC LIMIT 1) AS thumbnail,
              (SELECT ROUND(AVG(r.rating_overall), 1) FROM reviews r
                 WHERE r.product_id = p.id AND r.is_approved = 1) AS rating
         FROM products p
         JOIN categories c ON c.id = p.category_id
        WHERE ${where.join(' AND ')}
        ORDER BY ${orderBy}`,
      params
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(404).json({ error: 'Product not found' });

    const [[product]] = await pool.query(
      `SELECT p.*, c.slug AS category_slug, c.name_en AS category_en, c.name_am AS category_am
         FROM products p JOIN categories c ON c.id = p.category_id
        WHERE p.id = ? AND p.is_active = 1`,
      [id]
    );
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const [variants] = await pool.query('SELECT * FROM product_variants WHERE product_id = ?', [id]);
    const [images] = await pool.query(
      'SELECT variant_id, url FROM product_images WHERE product_id = ? ORDER BY sort_order, id',
      [id]
    );
    const [reviews] = await pool.query(
      'SELECT * FROM reviews WHERE product_id = ? AND is_approved = 1 ORDER BY created_at DESC',
      [id]
    );
    const reviewIds = reviews.map((r) => r.id);
    let photos = [];
    if (reviewIds.length) {
      [photos] = await pool.query('SELECT review_id, url FROM review_photos WHERE review_id IN (?)', [reviewIds]);
    }

    res.json({
      ...product,
      images: images.filter((i) => !i.variant_id).map((i) => i.url),
      variants: variants.map((v) => ({
        ...v,
        images: images.filter((i) => i.variant_id === v.id).map((i) => i.url),
      })),
      reviews: reviews.map((r) => ({
        ...r,
        photos: photos.filter((p) => p.review_id === r.id).map((p) => p.url),
      })),
    });
  } catch (err) { next(err); }
});

export default router;