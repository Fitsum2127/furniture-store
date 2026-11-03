import { Router } from 'express';
import pool from '../config/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { deleteUploadedFile, removeFiles, uploadImages } from '../middleware/upload.js';
import { HttpError, cleanText, toInt, toMoney } from '../middleware/validate.js';
import { syncProductStock } from '../services/inventory.js';

const router = Router();
router.use(requireAdmin);

const flag = (v, fallback) => (v === undefined ? fallback : v === 1 || v === true || v === '1' || v === 'true' ? 1 : 0);

function parseDetails(value) {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  let obj = value;
  if (typeof value === 'string') {
    try {
      obj = JSON.parse(value);
    } catch (err) {
      throw new HttpError(400, 'Product details must be valid JSON');
    }
  }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new HttpError(400, 'Product details must be an object');
  const text = JSON.stringify(obj);
  if (text.length > 20000) throw new HttpError(400, 'Product details are too large');
  return text;
}

function readProduct(body, hasVariants) {
  const b = body || {};
  const errors = [];
  const text = (v, max, label) => {
    const s = cleanText(v);
    if (s.length > max) errors.push(`${label} is too long`);
    return s;
  };
  const data = {
    sku: text(b.sku, 60, 'SKU'),
    category_id: toInt(b.category_id, { min: 1 }),
    name_en: text(b.name_en, 200, 'English name'),
    name_am: text(b.name_am, 200, 'Amharic name'),
    tagline_en: text(b.tagline_en, 255, 'English tagline') || null,
    tagline_am: text(b.tagline_am, 255, 'Amharic tagline') || null,
    description_en: String(b.description_en == null ? '' : b.description_en).trim().slice(0, 5000) || null,
    description_am: String(b.description_am == null ? '' : b.description_am).trim().slice(0, 5000) || null,
    price: toMoney(b.price),
    old_price: toMoney(b.old_price),
    stock: toInt(b.stock === '' || b.stock == null ? 0 : b.stock, { min: 0, max: 1000000 }),
    is_active: flag(b.is_active, 1),
    is_featured: flag(b.is_featured, undefined),
    details: parseDetails(b.details),
  };
  if (!/^[A-Za-z0-9._-]{1,60}$/.test(data.sku)) errors.push('SKU may only contain letters, numbers, dots, dashes and underscores');
  if (!data.category_id) errors.push('Choose a category');
  if (!data.name_en || !data.name_am) errors.push('Name is required in English and Amharic');
  if (data.price == null || Number.isNaN(data.price)) errors.push('Enter a valid price');
  if (Number.isNaN(data.old_price)) errors.push('Enter a valid old price or leave it empty');
  else if (data.old_price != null && data.price != null && data.old_price <= data.price) {
    errors.push('Old price must be higher than the price (or leave it empty)');
  }
  if (!hasVariants && data.stock === null) errors.push('Stock must be a whole number from 0 upward');
  return { data, errors };
}

async function activeVariantCount(productId) {
  const [[row]] = await pool.query(
    'SELECT COUNT(*) AS n FROM product_variants WHERE product_id = ? AND is_active = 1',
    [productId]
  );
  return Number(row.n);
}

/* ---------- products ---------- */
router.get('/products', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT p.id, p.sku, p.name_en, p.price, p.stock, p.is_active, p.is_featured, c.name_en AS category_en,
            (SELECT url FROM product_images i WHERE i.product_id = p.id ORDER BY i.sort_order ASC, i.id ASC LIMIT 1) AS thumbnail,
            (SELECT COUNT(*) FROM product_variants v WHERE v.product_id = p.id AND v.is_active = 1) AS variants_count
       FROM products p JOIN categories c ON c.id = p.category_id
      ORDER BY p.id DESC`
  );
  res.json(rows.map((r) => ({ ...r, price: Number(r.price), variants_count: Number(r.variants_count) })));
});

router.get('/products/:id', async (req, res) => {
  const id = toInt(req.params.id, { min: 1 });
  const [[product]] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
  if (!product) throw new HttpError(404, 'Product not found');
  const [images] = await pool.query(
    'SELECT id, url, sort_order, variant_id FROM product_images WHERE product_id = ? ORDER BY sort_order, id',
    [id]
  );
  const [variants] = await pool.query(
    'SELECT id, name_en, name_am, hex_color, stock, is_active FROM product_variants WHERE product_id = ? ORDER BY id',
    [id]
  );
  res.json({ ...product, images, variants });
});

router.post('/products', async (req, res) => {
  const { data, errors } = readProduct(req.body, false);
  if (errors.length) throw new HttpError(400, errors.join('. '));
  try {
    const [result] = await pool.query(
      `INSERT INTO products (sku, category_id, name_en, name_am, tagline_en, tagline_am, description_en, description_am,
                             price, old_price, stock, is_active, is_featured, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.sku, data.category_id, data.name_en, data.name_am, data.tagline_en, data.tagline_am,
        data.description_en, data.description_am, data.price, data.old_price, data.stock, data.is_active,
        data.is_featured || 0, data.details === undefined ? null : data.details,
      ]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') throw new HttpError(409, 'This SKU already exists');
    throw err;
  }
});

router.put('/products/:id', async (req, res) => {
  const id = toInt(req.params.id, { min: 1 });
  const hasVariants = (await activeVariantCount(id)) > 0;
  const { data, errors } = readProduct(req.body, hasVariants);
  if (errors.length) throw new HttpError(400, errors.join('. '));

  const sets = [
    'sku = ?', 'category_id = ?', 'name_en = ?', 'name_am = ?', 'tagline_en = ?', 'tagline_am = ?',
    'description_en = ?', 'description_am = ?', 'price = ?', 'old_price = ?', 'is_active = ?',
  ];
  const vals = [
    data.sku, data.category_id, data.name_en, data.name_am, data.tagline_en, data.tagline_am,
    data.description_en, data.description_am, data.price, data.old_price, data.is_active,
  ];
  if (!hasVariants) {
    sets.push('stock = ?');
    vals.push(data.stock);
  }
  if (data.is_featured !== undefined) {
    sets.push('is_featured = ?');
    vals.push(data.is_featured);
  }
  if (data.details !== undefined) {
    sets.push('details = ?');
    vals.push(data.details);
  }
  try {
    const [result] = await pool.query(`UPDATE products SET ${sets.join(', ')} WHERE id = ?`, [...vals, id]);
    if (!result.affectedRows) throw new HttpError(404, 'Product not found');
    res.json({ ok: true });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') throw new HttpError(409, 'This SKU already exists');
    throw err;
  }
});

router.patch('/products/:id/active', async (req, res) => {
  const active = req.body && (req.body.is_active === 1 || req.body.is_active === true) ? 1 : 0;
  await pool.query('UPDATE products SET is_active = ? WHERE id = ?', [active, toInt(req.params.id, { min: 1 })]);
  res.json({ ok: true });
});

router.patch('/products/:id/featured', async (req, res) => {
  const featured = req.body && (req.body.is_featured === 1 || req.body.is_featured === true) ? 1 : 0;
  await pool.query('UPDATE products SET is_featured = ? WHERE id = ?', [featured, toInt(req.params.id, { min: 1 })]);
  res.json({ ok: true });
});

// A product that was ordered before is hidden instead of deleted, so old orders stay correct.
router.delete('/products/:id', async (req, res) => {
  const id = toInt(req.params.id, { min: 1 });
  const [[used]] = await pool.query('SELECT COUNT(*) AS n FROM order_items WHERE product_id = ?', [id]);
  if (used.n > 0) {
    await pool.query('UPDATE products SET is_active = 0 WHERE id = ?', [id]);
    return res.json({ softDeleted: true });
  }
  const [imgs] = await pool.query('SELECT url FROM product_images WHERE product_id = ?', [id]);
  const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
  if (!result.affectedRows) throw new HttpError(404, 'Product not found');
  imgs.forEach((i) => deleteUploadedFile(i.url));
  return res.json({ deleted: true });
});

/* ---------- variants ---------- */
function readVariant(body) {
  const b = body || {};
  const name_en = cleanText(b.name_en);
  const name_am = cleanText(b.name_am) || name_en;
  const hex = cleanText(b.hex_color);
  const stock = toInt(b.stock === '' || b.stock == null ? 0 : b.stock, { min: 0, max: 1000000 });
  if (!name_en || name_en.length > 100 || name_am.length > 100) throw new HttpError(400, 'Variant name is required (100 characters maximum)');
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) throw new HttpError(400, 'Choose a valid color');
  if (stock === null) throw new HttpError(400, 'Stock must be a whole number from 0 upward');
  return { name_en, name_am, hex_color: hex.toLowerCase(), stock, is_active: flag(b.is_active, 1) };
}

router.post('/products/:id/variants', async (req, res) => {
  const productId = toInt(req.params.id, { min: 1 });
  const [[p]] = await pool.query('SELECT id FROM products WHERE id = ?', [productId]);
  if (!p) throw new HttpError(404, 'Product not found');
  const v = readVariant(req.body);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      'INSERT INTO product_variants (product_id, name_en, name_am, hex_color, stock, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [productId, v.name_en, v.name_am, v.hex_color, v.stock, v.is_active]
    );
    await syncProductStock(conn, productId);
    await conn.commit();
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

router.put('/variants/:variantId', async (req, res) => {
  const variantId = toInt(req.params.variantId, { min: 1 });
  const v = readVariant(req.body);
  const [[row]] = await pool.query('SELECT product_id FROM product_variants WHERE id = ?', [variantId]);
  if (!row) throw new HttpError(404, 'Variant not found');
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      'UPDATE product_variants SET name_en = ?, name_am = ?, hex_color = ?, stock = ?, is_active = ? WHERE id = ?',
      [v.name_en, v.name_am, v.hex_color, v.stock, v.is_active, variantId]
    );
    await syncProductStock(conn, row.product_id);
    await conn.commit();
    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

router.delete('/variants/:variantId', async (req, res) => {
  const variantId = toInt(req.params.variantId, { min: 1 });
  const [[row]] = await pool.query('SELECT product_id FROM product_variants WHERE id = ?', [variantId]);
  if (!row) throw new HttpError(404, 'Variant not found');
  const [[used]] = await pool.query('SELECT COUNT(*) AS n FROM order_items WHERE variant_id = ?', [variantId]);

  const conn = await pool.getConnection();
  let imgs = [];
  try {
    await conn.beginTransaction();
    if (used.n > 0) {
      await conn.query('UPDATE product_variants SET is_active = 0 WHERE id = ?', [variantId]);
    } else {
      [imgs] = await conn.query('SELECT url FROM product_images WHERE variant_id = ?', [variantId]);
      await conn.query('DELETE FROM product_images WHERE variant_id = ?', [variantId]);
      await conn.query('DELETE FROM product_variants WHERE id = ?', [variantId]);
    }
    await syncProductStock(conn, row.product_id);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
  imgs.forEach((i) => deleteUploadedFile(i.url));
  res.json(used.n > 0 ? { softDeleted: true } : { deleted: true });
});

/* ---------- product images ---------- */
router.post('/products/:id/images', uploadImages.array('images', 8), async (req, res) => {
  try {
    const productId = toInt(req.params.id, { min: 1 });
    const [[p]] = await pool.query('SELECT id FROM products WHERE id = ?', [productId]);
    if (!p) throw new HttpError(404, 'Product not found');
    if (!req.files || req.files.length === 0) {
      throw new HttpError(400, 'No valid images. Use JPG, PNG or WebP up to 5 MB.');
    }

    const rawVariant = req.body && req.body.variant_id;
    const variantId = rawVariant ? toInt(rawVariant, { min: 1 }) : null;
    if (rawVariant && !variantId) throw new HttpError(400, 'Invalid variant');
    if (variantId) {
      const [[v]] = await pool.query('SELECT id FROM product_variants WHERE id = ? AND product_id = ?', [variantId, productId]);
      if (!v) throw new HttpError(400, 'That variant does not belong to this product');
    }

    const [[count]] = await pool.query('SELECT COUNT(*) AS n FROM product_images WHERE product_id = ?', [productId]);
    if (count.n + req.files.length > 40) throw new HttpError(400, 'A product can have at most 40 images');

    const [[row]] = await pool.query(
      'SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM product_images WHERE product_id = ? AND variant_id <=> ?',
      [productId, variantId]
    );
    let order = row.next;
    for (const f of req.files) {
      await pool.query('INSERT INTO product_images (product_id, variant_id, url, sort_order) VALUES (?, ?, ?, ?)', [
        productId, variantId, `/uploads/${f.filename}`, order,
      ]);
      order += 1;
    }
    res.status(201).json({ added: req.files.length });
  } catch (err) {
    removeFiles(req.files);
    throw err;
  }
});

router.delete('/products/:id/images/:imageId', async (req, res) => {
  const imageId = toInt(req.params.imageId, { min: 1 });
  const productId = toInt(req.params.id, { min: 1 });
  const [[img]] = await pool.query('SELECT url FROM product_images WHERE id = ? AND product_id = ?', [imageId, productId]);
  if (!img) throw new HttpError(404, 'Image not found');
  await pool.query('DELETE FROM product_images WHERE id = ?', [imageId]);
  deleteUploadedFile(img.url);
  res.json({ ok: true });
});

router.patch('/products/:id/images/:imageId/primary', async (req, res) => {
  const imageId = toInt(req.params.imageId, { min: 1 });
  const productId = toInt(req.params.id, { min: 1 });
  const [[img]] = await pool.query('SELECT variant_id FROM product_images WHERE id = ? AND product_id = ?', [imageId, productId]);
  if (!img) throw new HttpError(404, 'Image not found');
  await pool.query('UPDATE product_images SET sort_order = sort_order + 1 WHERE product_id = ? AND variant_id <=> ?', [
    productId, img.variant_id,
  ]);
  await pool.query('UPDATE product_images SET sort_order = 0 WHERE id = ?', [imageId]);
  res.json({ ok: true });
});

/* ---------- categories ---------- */
function readCategory(body) {
  const b = body || {};
  const slug = cleanText(b.slug).toLowerCase();
  const name_en = cleanText(b.name_en);
  const name_am = cleanText(b.name_am);
  const sort = toInt(b.sort_order === '' || b.sort_order == null ? 0 : b.sort_order, { min: 0, max: 10000 });
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug.length > 80) {
    throw new HttpError(400, 'The link name may only contain lowercase letters, numbers and dashes, for example kids-room');
  }
  if (!name_en || !name_am || name_en.length > 120 || name_am.length > 120) {
    throw new HttpError(400, 'Name is required in English and Amharic (120 characters maximum)');
  }
  if (sort === null) throw new HttpError(400, 'Invalid order number');
  return { slug, name_en, name_am, sort_order: sort, is_active: flag(b.is_active, 1) };
}

router.get('/categories', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS products_count
       FROM categories c ORDER BY c.sort_order, c.id`
  );
  res.json(rows.map((r) => ({ ...r, products_count: Number(r.products_count) })));
});

router.post('/categories', uploadImages.single('image'), async (req, res) => {
  try {
    const c = readCategory(req.body);
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const [result] = await pool.query(
      'INSERT INTO categories (slug, name_en, name_am, image_url, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [c.slug, c.name_en, c.name_am, image, c.sort_order, c.is_active]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    removeFiles(req.file ? [req.file] : []);
    if (err.code === 'ER_DUP_ENTRY') throw new HttpError(409, 'A category with this link name already exists');
    throw err;
  }
});

router.put('/categories/:id', uploadImages.single('image'), async (req, res) => {
  try {
    const id = toInt(req.params.id, { min: 1 });
    const c = readCategory(req.body);
    const [[existing]] = await pool.query('SELECT image_url FROM categories WHERE id = ?', [id]);
    if (!existing) throw new HttpError(404, 'Category not found');

    let image = existing.image_url;
    if (req.file) image = `/uploads/${req.file.filename}`;
    else if (req.body && req.body.remove_image === '1') image = null;

    await pool.query(
      'UPDATE categories SET slug = ?, name_en = ?, name_am = ?, image_url = ?, sort_order = ?, is_active = ? WHERE id = ?',
      [c.slug, c.name_en, c.name_am, image, c.sort_order, c.is_active, id]
    );
    if (image !== existing.image_url) deleteUploadedFile(existing.image_url);
    res.json({ ok: true });
  } catch (err) {
    removeFiles(req.file ? [req.file] : []);
    if (err.code === 'ER_DUP_ENTRY') throw new HttpError(409, 'A category with this link name already exists');
    throw err;
  }
});

router.delete('/categories/:id', async (req, res) => {
  const id = toInt(req.params.id, { min: 1 });
  const [[used]] = await pool.query('SELECT COUNT(*) AS n FROM products WHERE category_id = ?', [id]);
  if (used.n > 0) throw new HttpError(409, 'This category still has products. Move or delete them first.');
  const [[existing]] = await pool.query('SELECT image_url FROM categories WHERE id = ?', [id]);
  if (!existing) throw new HttpError(404, 'Category not found');
  await pool.query('DELETE FROM categories WHERE id = ?', [id]);
  deleteUploadedFile(existing.image_url);
  res.json({ deleted: true });
});

export default router;