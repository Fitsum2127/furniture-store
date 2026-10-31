import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import pool from '../config/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { uploadImages, uploadsDir } from '../middleware/upload.js';

const router = Router();

/* ---------- helpers ---------- */
function unlinkUpload(url) {
  if (url && url.startsWith('/uploads/')) {
    fs.unlink(path.join(uploadsDir, path.basename(url)), () => {});
  }
}

const loginAttempts = new Map();
const tooMany = (ip) => {
  const now = Date.now();
  const rec = (loginAttempts.get(ip) || []).filter((t) => now - t < 15 * 60 * 1000);
  loginAttempts.set(ip, rec);
  return rec.length >= 8;
};
const noteFail = (ip) => loginAttempts.set(ip, [...(loginAttempts.get(ip) || []), Date.now()]);

function readProduct(body) {
  const num = (v) => (v === '' || v == null ? null : Number(v));
  const data = {
    sku: String(body.sku || '').trim(),
    category_id: Number(body.category_id),
    name_en: String(body.name_en || '').trim(),
    name_am: String(body.name_am || '').trim(),
    tagline_en: String(body.tagline_en || '').trim() || null,
    tagline_am: String(body.tagline_am || '').trim() || null,
    description_en: String(body.description_en || '').trim() || null,
    description_am: String(body.description_am || '').trim() || null,
    price: num(body.price),
    old_price: num(body.old_price),
    stock: parseInt(body.stock, 10) || 0,
    is_active: body.is_active === 0 || body.is_active === '0' || body.is_active === false ? 0 : 1,
  };
  const errors = [];
  if (!data.sku) errors.push('SKU is required');
  if (!Number.isInteger(data.category_id) || data.category_id < 1) errors.push('Choose a category');
  if (!data.name_en || !data.name_am) errors.push('Name is required in English and Amharic');
  if (data.price == null || Number.isNaN(data.price) || data.price < 0) errors.push('Enter a valid price');
  if (data.old_price != null && (Number.isNaN(data.old_price) || data.old_price <= data.price)) {
    errors.push('Old price must be higher than the price (or leave it empty)');
  }
  if (data.stock < 0) errors.push('Stock cannot be negative');
  return { data, errors };
}

/* ---------- login (public) ---------- */
router.post('/login', async (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) return res.status(500).json({ error: 'JWT_SECRET is missing in server/.env' });
    if (tooMany(req.ip)) return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });

    const email = String((req.body && req.body.email) || '').trim().toLowerCase();
    const password = String((req.body && req.body.password) || '');
    const [[admin]] = await pool.query('SELECT * FROM admins WHERE email = ?', [email]);
    const ok = admin && (await bcrypt.compare(password, admin.password_hash));
    if (!ok) {
      noteFail(req.ip);
      return res.status(401).json({ error: 'Wrong email or password' });
    }
    const info = { id: admin.id, name: admin.name, email: admin.email };
    const token = jwt.sign(info, process.env.JWT_SECRET, { expiresIn: '12h' });
    res.json({ token, admin: info });
  } catch (err) { next(err); }
});

/* ---------- everything below needs login ---------- */
router.use(requireAdmin);

router.get('/me', (req, res) => res.json({ admin: req.admin }));

/* ---------- dashboard ---------- */
router.get('/stats', async (_req, res, next) => {
  try {
    const one = async (sql) => (await pool.query(sql))[0][0].n;
    const [low] = await pool.query(
      'SELECT id, name_en, stock FROM products WHERE is_active = 1 AND stock <= 5 ORDER BY stock ASC LIMIT 8'
    );
    const [recent] = await pool.query(
      'SELECT id, customer_name, total, status, created_at FROM orders ORDER BY id DESC LIMIT 5'
    );
    res.json({
      products: await one('SELECT COUNT(*) AS n FROM products WHERE is_active = 1'),
      newOrders: await one("SELECT COUNT(*) AS n FROM orders WHERE status = 'new'"),
      revenue: Number(await one("SELECT COALESCE(SUM(total), 0) AS n FROM orders WHERE status <> 'cancelled'")),
      subscribers: await one('SELECT COUNT(*) AS n FROM subscribers'),
      newMessages: await one("SELECT COUNT(*) AS n FROM messages WHERE status = 'new'"),
      pendingReviews: await one('SELECT COUNT(*) AS n FROM reviews WHERE is_approved = 0'),
      lowStock: low,
      recentOrders: recent,
    });
  } catch (err) { next(err); }
});

/* ---------- products ---------- */
router.get('/products', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name_en AS category_en,
              (SELECT url FROM product_images i WHERE i.product_id = p.id
                 ORDER BY i.sort_order ASC, i.id ASC LIMIT 1) AS thumbnail
         FROM products p JOIN categories c ON c.id = p.category_id
        ORDER BY p.id DESC`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.get('/products/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [[product]] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const [images] = await pool.query(
      'SELECT id, url, sort_order FROM product_images WHERE product_id = ? ORDER BY sort_order, id',
      [id]
    );
    res.json({ ...product, images });
  } catch (err) { next(err); }
});

router.post('/products', async (req, res, next) => {
  try {
    const { data, errors } = readProduct(req.body || {});
    if (errors.length) return res.status(400).json({ error: errors.join('. ') });
    const [result] = await pool.query(
      `INSERT INTO products (sku, category_id, name_en, name_am, tagline_en, tagline_am,
                             description_en, description_am, price, old_price, stock, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.sku, data.category_id, data.name_en, data.name_am, data.tagline_en, data.tagline_am,
       data.description_en, data.description_am, data.price, data.old_price, data.stock, data.is_active]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'This SKU already exists' });
    if (err.code === 'ER_NO_REFERENCED_ROW_2') return res.status(400).json({ error: 'Category not found' });
    next(err);
  }
});

router.put('/products/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { data, errors } = readProduct(req.body || {});
    if (errors.length) return res.status(400).json({ error: errors.join('. ') });
    const [result] = await pool.query(
      `UPDATE products SET sku = ?, category_id = ?, name_en = ?, name_am = ?, tagline_en = ?, tagline_am = ?,
              description_en = ?, description_am = ?, price = ?, old_price = ?, stock = ?, is_active = ?
        WHERE id = ?`,
      [data.sku, data.category_id, data.name_en, data.name_am, data.tagline_en, data.tagline_am,
       data.description_en, data.description_am, data.price, data.old_price, data.stock, data.is_active, id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Product not found' });
    res.json({ ok: true });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'This SKU already exists' });
    next(err);
  }
});

router.patch('/products/:id/active', async (req, res, next) => {
  try {
    const active = req.body && (req.body.is_active === 1 || req.body.is_active === true) ? 1 : 0;
    await pool.query('UPDATE products SET is_active = ? WHERE id = ?', [active, Number(req.params.id)]);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// Products that were ordered before are hidden instead of deleted, so old orders stay correct.
router.delete('/products/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [[used]] = await pool.query('SELECT COUNT(*) AS n FROM order_items WHERE product_id = ?', [id]);
    if (used.n > 0) {
      await pool.query('UPDATE products SET is_active = 0 WHERE id = ?', [id]);
      return res.json({ softDeleted: true });
    }
    const [imgs] = await pool.query('SELECT url FROM product_images WHERE product_id = ?', [id]);
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Product not found' });
    imgs.forEach((i) => unlinkUpload(i.url));
    res.json({ deleted: true });
  } catch (err) { next(err); }
});

router.post('/products/:id/images', uploadImages.array('images', 8), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No valid images. Use JPG, PNG or WebP up to 5 MB.' });
    }
    const [[row]] = await pool.query(
      'SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM product_images WHERE product_id = ?',
      [id]
    );
    let order = row.next;
    for (const f of req.files) {
      await pool.query('INSERT INTO product_images (product_id, variant_id, url, sort_order) VALUES (?, NULL, ?, ?)', [
        id, `/uploads/${f.filename}`, order++,
      ]);
    }
    res.status(201).json({ added: req.files.length });
  } catch (err) { next(err); }
});

router.delete('/products/:id/images/:imageId', async (req, res, next) => {
  try {
    const [[img]] = await pool.query('SELECT url FROM product_images WHERE id = ? AND product_id = ?', [
      Number(req.params.imageId), Number(req.params.id),
    ]);
    if (!img) return res.status(404).json({ error: 'Image not found' });
    await pool.query('DELETE FROM product_images WHERE id = ?', [Number(req.params.imageId)]);
    unlinkUpload(img.url);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.patch('/products/:id/images/:imageId/primary', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await pool.query('UPDATE product_images SET sort_order = sort_order + 1 WHERE product_id = ?', [id]);
    await pool.query('UPDATE product_images SET sort_order = 0 WHERE id = ? AND product_id = ?', [
      Number(req.params.imageId), id,
    ]);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

/* ---------- orders ---------- */
router.get('/orders', async (req, res, next) => {
  try {
    const status = String(req.query.status || '');
    const where = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(status) ? 'WHERE o.status = ?' : '';
    const [rows] = await pool.query(
      `SELECT o.*, (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS items_count
         FROM orders o ${where} ORDER BY o.id DESC LIMIT 200`,
      where ? [status] : []
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.get('/orders/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [[order]] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const [items] = await pool.query(
      `SELECT oi.qty, oi.unit_price, p.id AS product_id, p.name_en, p.sku,
              (SELECT url FROM product_images i WHERE i.product_id = p.id
                 ORDER BY i.sort_order ASC, i.id ASC LIMIT 1) AS thumbnail
         FROM order_items oi JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = ?`,
      [id]
    );
    res.json({ ...order, items });
  } catch (err) { next(err); }
});

router.patch('/orders/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  const { status, payment_status: pay } = req.body || {};
  if (status && !['new', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  if (pay && !['pending', 'paid', 'failed'].includes(pay)) {
    return res.status(400).json({ error: 'Invalid payment status' });
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[order]] = await conn.query('SELECT * FROM orders WHERE id = ? FOR UPDATE', [id]);
    if (!order) {
      await conn.rollback();
      return res.status(404).json({ error: 'Order not found' });
    }
    if (status && status !== order.status) {
      if (order.status === 'cancelled') {
        await conn.rollback();
        return res.status(409).json({ error: "Cancelled orders can't be reopened" });
      }
      if (status === 'cancelled') {
        const [items] = await conn.query('SELECT product_id, qty FROM order_items WHERE order_id = ?', [id]);
        for (const it of items) {
          await conn.query('UPDATE products SET stock = stock + ? WHERE id = ?', [it.qty, it.product_id]);
        }
      }
    }
    await conn.query('UPDATE orders SET status = ?, payment_status = ? WHERE id = ?', [
      status || order.status, pay || order.payment_status, id,
    ]);
    await conn.commit();
    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

/* ---------- subscribers ---------- */
router.get('/subscribers', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, email, created_at FROM subscribers ORDER BY id DESC');
    res.json(rows);
  } catch (err) { next(err); }
});

router.get('/subscribers/export', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT email, created_at FROM subscribers ORDER BY id DESC');
    const csv = ['email,subscribed_at', ...rows.map((r) => `${r.email},${new Date(r.created_at).toISOString()}`)].join('\n');
    res.type('text/csv').send(csv);
  } catch (err) { next(err); }
});

router.delete('/subscribers/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM subscribers WHERE id = ?', [Number(req.params.id)]);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

/* ---------- messages ---------- */
router.get('/messages', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM messages ORDER BY id DESC LIMIT 300');
    res.json(rows);
  } catch (err) { next(err); }
});

router.patch('/messages/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const b = req.body || {};
    const reply = typeof b.reply_text === 'string' ? b.reply_text.trim().slice(0, 4000) : null;
    if (reply) {
      await pool.query("UPDATE messages SET reply_text = ?, status = 'replied', replied_at = NOW() WHERE id = ?", [reply, id]);
    } else if (['new', 'replied', 'closed'].includes(b.status)) {
      await pool.query('UPDATE messages SET status = ? WHERE id = ?', [b.status, id]);
    } else {
      return res.status(400).json({ error: 'Nothing to update' });
    }
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.delete('/messages/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM messages WHERE id = ?', [Number(req.params.id)]);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

/* ---------- reviews ---------- */
router.get('/reviews', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, p.name_en AS product_name FROM reviews r
         JOIN products p ON p.id = r.product_id ORDER BY r.id DESC LIMIT 300`
    );
    const ids = rows.map((r) => r.id);
    let photos = [];
    if (ids.length) [photos] = await pool.query('SELECT review_id, url FROM review_photos WHERE review_id IN (?)', [ids]);
    res.json(rows.map((r) => ({ ...r, photos: photos.filter((p) => p.review_id === r.id).map((p) => p.url) })));
  } catch (err) { next(err); }
});

router.patch('/reviews/:id', async (req, res, next) => {
  try {
    const approved = req.body && (req.body.is_approved === 1 || req.body.is_approved === true) ? 1 : 0;
    await pool.query('UPDATE reviews SET is_approved = ? WHERE id = ?', [approved, Number(req.params.id)]);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.delete('/reviews/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [photos] = await pool.query('SELECT url FROM review_photos WHERE review_id = ?', [id]);
    await pool.query('DELETE FROM reviews WHERE id = ?', [id]);
    photos.forEach((p) => unlinkUpload(p.url));
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;