import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { requireAdmin, signAdminToken } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimit.js';
import { deleteUploadedFile } from '../middleware/upload.js';
import { HttpError, cleanText, escapeLike, toInt } from '../middleware/validate.js';
import { syncProductStock } from '../services/inventory.js';

const router = Router();
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);
const STATUSES = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const PAYMENTS = ['pending', 'paid', 'failed'];

/* ---------- login (public) ---------- */
router.post('/login', loginLimiter, async (req, res) => {
  const email = cleanText(req.body && req.body.email).toLowerCase();
  const password = String((req.body && req.body.password) || '');
  const [[admin]] = await pool.query('SELECT * FROM admins WHERE email = ?', [email]);
  const ok = await bcrypt.compare(password, admin ? admin.password_hash : DUMMY_HASH);
  if (!admin || !ok) throw new HttpError(401, 'Wrong email or password');
  res.json({
    token: signAdminToken(admin),
    admin: { id: admin.id, name: admin.name, email: admin.email },
  });
});

/* ---------- everything below needs an admin login ---------- */
router.use(requireAdmin);

router.get('/me', (req, res) => {
  res.json({ admin: { id: req.admin.id, name: req.admin.name, email: req.admin.email } });
});

router.post('/password', async (req, res) => {
  const b = req.body || {};
  const next = String(b.newPassword == null ? '' : b.newPassword);
  if (next.length < 10) throw new HttpError(400, 'The new password must have at least 10 characters');
  if (Buffer.byteLength(next) > 72) throw new HttpError(400, 'The new password is too long (72 characters maximum)');
  const [[admin]] = await pool.query('SELECT * FROM admins WHERE id = ?', [req.admin.id]);
  const ok = admin && (await bcrypt.compare(String(b.currentPassword || ''), admin.password_hash));
  if (!ok) throw new HttpError(400, 'Your current password is wrong');
  await pool.query('UPDATE admins SET password_hash = ? WHERE id = ?', [await bcrypt.hash(next, 12), admin.id]);
  res.json({ ok: true });
});

/* ---------- dashboard ---------- */
const scalar = async (sql) => Number((await pool.query(sql))[0][0].n);

router.get('/stats', async (_req, res) => {
  const [low] = await pool.query(
    'SELECT id, name_en, stock FROM products WHERE is_active = 1 AND stock <= 5 ORDER BY stock ASC, id ASC LIMIT 8'
  );
  const [recent] = await pool.query(
    'SELECT id, order_number, customer_name, total, status, created_at FROM orders ORDER BY id DESC LIMIT 5'
  );
  const [byStatus] = await pool.query('SELECT status, COUNT(*) AS c FROM orders GROUP BY status');
  const sales = (since) =>
    scalar(`SELECT COALESCE(SUM(total), 0) AS n FROM orders WHERE status <> 'cancelled' AND created_at >= ${since}`);

  res.json({
    products: await scalar('SELECT COUNT(*) AS n FROM products WHERE is_active = 1'),
    newOrders: await scalar("SELECT COUNT(*) AS n FROM orders WHERE status = 'new'"),
    totalOrders: await scalar('SELECT COUNT(*) AS n FROM orders'),
    revenue: await scalar("SELECT COALESCE(SUM(total), 0) AS n FROM orders WHERE status <> 'cancelled'"),
    paidRevenue: await scalar(
      "SELECT COALESCE(SUM(total), 0) AS n FROM orders WHERE status <> 'cancelled' AND payment_status = 'paid'"
    ),
    salesToday: await sales('CURDATE()'),
    salesWeek: await sales('DATE_SUB(CURDATE(), INTERVAL 6 DAY)'),
    salesMonth: await sales('DATE_SUB(CURDATE(), INTERVAL 29 DAY)'),
    subscribers: await scalar('SELECT COUNT(*) AS n FROM subscribers'),
    customers: await scalar('SELECT COUNT(*) AS n FROM customers'),
    newMessages: await scalar("SELECT COUNT(*) AS n FROM messages WHERE status = 'new'"),
    pendingReviews: await scalar('SELECT COUNT(*) AS n FROM reviews WHERE is_approved = 0'),
    ordersByStatus: Object.fromEntries(byStatus.map((r) => [r.status, Number(r.c)])),
    lowStock: low,
    recentOrders: recent.map((o) => ({ ...o, total: Number(o.total) })),
  });
});

/* ---------- orders ---------- */
router.get('/orders', async (req, res) => {
  const where = [];
  const params = [];
  const status = String(req.query.status || '');
  if (STATUSES.includes(status)) {
    where.push('o.status = ?');
    params.push(status);
  }
  const q = cleanText(req.query.q).slice(0, 60);
  if (q) {
    where.push('(o.order_number LIKE ? OR o.customer_name LIKE ? OR o.phone LIKE ?)');
    const like = `%${escapeLike(q)}%`;
    params.push(like, like, like);
  }
  const [rows] = await pool.query(
    `SELECT o.id, o.order_number, o.customer_name, o.phone, o.city, o.total, o.status, o.payment_method,
            o.payment_status, o.created_at, o.customer_id,
            (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS items_count
       FROM orders o ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY o.id DESC LIMIT 200`,
    params
  );
  res.json(rows.map((o) => ({ ...o, total: Number(o.total) })));
});

router.get('/orders/:id', async (req, res) => {
  const id = toInt(req.params.id, { min: 1 });
  const [[order]] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
  if (!order) throw new HttpError(404, 'Order not found');
  const [items] = await pool.query(
    `SELECT oi.id, oi.product_id, oi.variant_id, oi.qty, oi.unit_price,
            COALESCE(oi.product_name_en, p.name_en) AS name_en, COALESCE(oi.sku, p.sku) AS sku,
            oi.variant_name_en, oi.image_url AS thumbnail
       FROM order_items oi LEFT JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ? ORDER BY oi.id`,
    [id]
  );
  const [payments] = await pool.query(
    'SELECT id, provider, provider_ref, amount, status, created_at FROM payments WHERE order_id = ? ORDER BY id',
    [id]
  );
  const { access_token_hash: _hidden, ...safe } = order;
  res.json({
    ...safe,
    subtotal: Number(order.subtotal),
    delivery_fee: Number(order.delivery_fee),
    total: Number(order.total),
    items: items.map((i) => ({ ...i, unit_price: Number(i.unit_price) })),
    payments: payments.map((p) => ({ ...p, amount: Number(p.amount) })),
  });
});

router.patch('/orders/:id', async (req, res) => {
  const id = toInt(req.params.id, { min: 1 });
  const { status, payment_status: pay } = req.body || {};
  if (!id) throw new HttpError(404, 'Order not found');
  if (status !== undefined && !STATUSES.includes(status)) throw new HttpError(400, 'Invalid status');
  if (pay !== undefined && !PAYMENTS.includes(pay)) throw new HttpError(400, 'Invalid payment status');
  if (status === undefined && pay === undefined) throw new HttpError(400, 'Nothing to update');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[order]] = await conn.query('SELECT * FROM orders WHERE id = ? FOR UPDATE', [id]);
    if (!order) throw new HttpError(404, 'Order not found');

    const newStatus = status !== undefined ? status : order.status;
    const newPay = pay !== undefined ? pay : order.payment_status;

    if (order.status === 'cancelled' && (newStatus !== 'cancelled' || newPay !== order.payment_status)) {
      throw new HttpError(409, "Cancelled orders can't be changed");
    }
    const cancelling = newStatus === 'cancelled' && order.status !== 'cancelled';
    if (cancelling && newPay === 'paid') {
      throw new HttpError(409, 'A paid order cannot be cancelled. Change the payment status first.');
    }

    if (cancelling) {
      const [items] = await conn.query(
        'SELECT product_id, variant_id, qty FROM order_items WHERE order_id = ? ORDER BY product_id, variant_id',
        [id]
      );
      for (const it of items) {
        if (it.variant_id) {
          await conn.query('UPDATE product_variants SET stock = stock + ? WHERE id = ?', [it.qty, it.variant_id]);
          await syncProductStock(conn, it.product_id);
        } else {
          await conn.query('UPDATE products SET stock = stock + ? WHERE id = ?', [it.qty, it.product_id]);
        }
      }
    }

    let paidAt = order.paid_at;
    if (newPay !== order.payment_status) {
      paidAt = newPay === 'paid' ? new Date() : null;
      await conn.query('UPDATE payments SET status = ? WHERE order_id = ? ORDER BY id DESC LIMIT 1', [newPay, id]);
    }
    await conn.query('UPDATE orders SET status = ?, payment_status = ?, paid_at = ? WHERE id = ?', [
      newStatus, newPay, paidAt, id,
    ]);
    await conn.commit();
    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

/* ---------- subscribers ---------- */
router.get('/subscribers', async (_req, res) => {
  const [rows] = await pool.query('SELECT id, email, created_at FROM subscribers ORDER BY id DESC');
  res.json(rows);
});

router.get('/subscribers/export', async (_req, res) => {
  const [rows] = await pool.query('SELECT email, created_at FROM subscribers ORDER BY id DESC');
  // A leading ' stops spreadsheet programs from running an email as a formula.
  const safe = (v) => (/^[=+\-@]/.test(v) ? `'${v}` : v);
  const csv = ['email,subscribed_at', ...rows.map((r) => `${safe(r.email)},${new Date(r.created_at).toISOString()}`)].join('\n');
  res.type('text/csv').send(csv);
});

router.delete('/subscribers/:id', async (req, res) => {
  await pool.query('DELETE FROM subscribers WHERE id = ?', [toInt(req.params.id, { min: 1 })]);
  res.json({ ok: true });
});

/* ---------- messages ---------- */
router.get('/messages', async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM messages ORDER BY id DESC LIMIT 300');
  res.json(rows);
});

router.patch('/messages/:id', async (req, res) => {
  const id = toInt(req.params.id, { min: 1 });
  const b = req.body || {};
  const reply = typeof b.reply_text === 'string' ? b.reply_text.trim().slice(0, 4000) : '';
  if (reply) {
    await pool.query("UPDATE messages SET reply_text = ?, status = 'replied', replied_at = NOW() WHERE id = ?", [reply, id]);
  } else if (['new', 'replied', 'closed'].includes(b.status)) {
    await pool.query('UPDATE messages SET status = ? WHERE id = ?', [b.status, id]);
  } else {
    throw new HttpError(400, 'Nothing to update');
  }
  res.json({ ok: true });
});

router.delete('/messages/:id', async (req, res) => {
  await pool.query('DELETE FROM messages WHERE id = ?', [toInt(req.params.id, { min: 1 })]);
  res.json({ ok: true });
});

/* ---------- reviews ---------- */
router.get('/reviews', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT r.*, p.name_en AS product_name FROM reviews r
       JOIN products p ON p.id = r.product_id ORDER BY r.id DESC LIMIT 300`
  );
  const ids = rows.map((r) => r.id);
  let photos = [];
  if (ids.length) [photos] = await pool.query('SELECT review_id, url FROM review_photos WHERE review_id IN (?)', [ids]);
  res.json(rows.map((r) => ({ ...r, photos: photos.filter((p) => p.review_id === r.id).map((p) => p.url) })));
});

router.patch('/reviews/:id', async (req, res) => {
  const approved = req.body && (req.body.is_approved === 1 || req.body.is_approved === true) ? 1 : 0;
  await pool.query('UPDATE reviews SET is_approved = ? WHERE id = ?', [approved, toInt(req.params.id, { min: 1 })]);
  res.json({ ok: true });
});

router.delete('/reviews/:id', async (req, res) => {
  const id = toInt(req.params.id, { min: 1 });
  const [photos] = await pool.query('SELECT url FROM review_photos WHERE review_id = ?', [id]);
  await pool.query('DELETE FROM reviews WHERE id = ?', [id]);
  photos.forEach((p) => deleteUploadedFile(p.url));
  res.json({ ok: true });
});

export default router;