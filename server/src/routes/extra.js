import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { HttpError, cleanText, escapeLike, toInt } from '../middleware/validate.js';
import { getSettings } from '../services/settings.js';

// Public: list of published policy pages (used by the footer)
export const publicExtraRouter = Router();
publicExtraRouter.get('/pages', async (_req, res) => {
  const [rows] = await pool.query('SELECT slug, title_en, title_am FROM pages WHERE is_active = 1 ORDER BY id');
  res.json(rows);
});

export const adminExtraRouter = Router();
adminExtraRouter.use(requireAdmin);

// Admin sets a temporary password for a customer who forgot theirs
adminExtraRouter.post('/customers/:id/password', async (req, res) => {
  const id = toInt(req.params.id, { min: 1 });
  const password = String((req.body && req.body.newPassword) || '');
  if (password.length < 8) throw new HttpError(400, 'The temporary password must have at least 8 characters');
  if (Buffer.byteLength(password) > 72) throw new HttpError(400, 'The password is too long (72 characters maximum)');
  const [result] = await pool.query('UPDATE customers SET password_hash = ? WHERE id = ?', [await bcrypt.hash(password, 12), id]);
  if (!result.affectedRows) throw new HttpError(404, 'Customer not found');
  res.json({ ok: true });
});

// Search box of the admin panel: finds products, orders, customers and messages.
adminExtraRouter.get('/search', async (req, res) => {
  const q = cleanText(req.query.q).slice(0, 60);
  if (q.length < 2) return res.json({ products: [], orders: [], customers: [], messages: [] });
  const like = `%${escapeLike(q)}%`;
  const [products] = await pool.query(
    'SELECT id, name_en, name_am, sku FROM products WHERE name_en LIKE ? OR name_am LIKE ? OR sku LIKE ? ORDER BY id DESC LIMIT 5',
    [like, like, like]
  );
  const [orders] = await pool.query(
    'SELECT id, order_number, customer_name FROM orders WHERE order_number LIKE ? OR customer_name LIKE ? OR phone LIKE ? ORDER BY id DESC LIMIT 5',
    [like, like, like]
  );
  const [customers] = await pool.query(
    'SELECT id, name, phone, email FROM customers WHERE name LIKE ? OR phone LIKE ? OR email LIKE ? ORDER BY id DESC LIMIT 5',
    [like, like, like]
  );
  const [messages] = await pool.query(
    'SELECT id, name, LEFT(body, 80) AS snippet FROM messages WHERE name LIKE ? OR body LIKE ? ORDER BY id DESC LIMIT 5',
    [like, like]
  );
  return res.json({ products, orders, customers, messages });
});

const one = async (sql) => (await pool.query(sql))[0][0];
const pct = (cur, prev) => (prev > 0 ? Math.round(((cur - prev) / prev) * 1000) / 10 : null);
const WIN = 'created_at >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)';
const PREV = 'created_at >= DATE_SUB(CURDATE(), INTERVAL 59 DAY) AND created_at < DATE_SUB(CURDATE(), INTERVAL 29 DAY)';

// Everything the dashboard shows, from real data. Cancelled orders are never counted as revenue.
adminExtraRouter.get('/dashboard', async (_req, res) => {
  const sums = (cond) => one(`SELECT COUNT(*) AS orders, COALESCE(SUM(total), 0) AS revenue FROM orders WHERE status <> 'cancelled' AND ${cond}`);
  const cur = await sums(WIN);
  const prev = await sums(PREV);
  const custCur = Number((await one(`SELECT COUNT(*) AS n FROM customers WHERE ${WIN}`)).n);
  const custPrev = Number((await one(`SELECT COUNT(*) AS n FROM customers WHERE ${PREV}`)).n);

  const curRevenue = Number(cur.revenue);
  const prevRevenue = Number(prev.revenue);
  const curAvg = cur.orders > 0 ? curRevenue / cur.orders : 0;
  const prevAvg = prev.orders > 0 ? prevRevenue / prev.orders : 0;

  const today = (await one("SELECT DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS d")).d;
  const labels = [];
  for (let i = 29; i >= 0; i -= 1) {
    const d = new Date(`${today}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - i);
    labels.push(d.toISOString().slice(0, 10));
  }
  const [orderDays] = await pool.query(
    `SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS d, COUNT(*) AS orders, COALESCE(SUM(total), 0) AS revenue
       FROM orders WHERE status <> 'cancelled' AND ${WIN} GROUP BY d`
  );
  const [custDays] = await pool.query(`SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS d, COUNT(*) AS n FROM customers WHERE ${WIN} GROUP BY d`);
  const byDay = Object.fromEntries(orderDays.map((r) => [r.d, r]));
  const custByDay = Object.fromEntries(custDays.map((r) => [r.d, Number(r.n)]));

  const [categories] = await pool.query(
    `SELECT c.name_en, c.name_am, COALESCE(SUM(oi.qty * oi.unit_price), 0) AS revenue
       FROM order_items oi JOIN orders o ON o.id = oi.order_id
       LEFT JOIN products p ON p.id = oi.product_id LEFT JOIN categories c ON c.id = p.category_id
      WHERE o.status <> 'cancelled' AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)
      GROUP BY c.id, c.name_en, c.name_am ORDER BY revenue DESC`
  );

  const [topProducts] = await pool.query(
    `SELECT oi.product_id,
            COALESCE(oi.product_name_en, p.name_en) AS name_en,
            COALESCE(oi.product_name_am, p.name_am) AS name_am,
            SUM(oi.qty) AS units, SUM(oi.qty * oi.unit_price) AS revenue,
            (SELECT url FROM product_images i WHERE i.product_id = oi.product_id ORDER BY i.sort_order, i.id LIMIT 1) AS thumbnail
       FROM order_items oi JOIN orders o ON o.id = oi.order_id LEFT JOIN products p ON p.id = oi.product_id
      WHERE o.status <> 'cancelled' AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)
      GROUP BY oi.product_id, oi.product_name_en, oi.product_name_am, p.name_en, p.name_am
      ORDER BY units DESC LIMIT 5`
  );

  const [recent] = await pool.query('SELECT id, order_number, customer_name, total, status, created_at FROM orders ORDER BY id DESC LIMIT 6');
  const [cities] = await pool.query(
    `SELECT city, COUNT(*) AS orders FROM orders
      WHERE status <> 'cancelled' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 89 DAY)
      GROUP BY city ORDER BY orders DESC LIMIT 6`
  );
  const [lowStock] = await pool.query('SELECT id, name_en, name_am, stock FROM products WHERE is_active = 1 AND stock <= 5 ORDER BY stock ASC, id ASC LIMIT 8');

  const count = async (sql) => Number((await one(sql)).n);
  const settings = await getSettings({ fresh: true });
  const policiesPublished = await count('SELECT COUNT(*) AS n FROM pages WHERE is_active = 1');
  const policiesTotal = await count('SELECT COUNT(*) AS n FROM pages');
  const activeProducts = await count('SELECT COUNT(*) AS n FROM products WHERE is_active = 1');
  const noImages = await count('SELECT COUNT(*) AS n FROM products p WHERE p.is_active = 1 AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id)');
  const aboutCount = await count('SELECT COUNT(*) AS n FROM about_sections WHERE is_active = 1');
  const faqCount = await count('SELECT COUNT(*) AS n FROM faqs WHERE is_active = 1');
  const fee = Number(settings.delivery_fee);

  res.json({
    kpis: {
      revenue: { value: curRevenue, change: pct(curRevenue, prevRevenue) },
      orders: { value: Number(cur.orders), change: pct(Number(cur.orders), Number(prev.orders)) },
      customers: { value: custCur, change: pct(custCur, custPrev) },
      avgOrder: { value: Math.round(curAvg), change: pct(curAvg, prevAvg) },
    },
    series: {
      labels,
      revenue: labels.map((d) => (byDay[d] ? Number(byDay[d].revenue) : 0)),
      orders: labels.map((d) => (byDay[d] ? Number(byDay[d].orders) : 0)),
      customers: labels.map((d) => custByDay[d] || 0),
    },
    categories: categories.map((c) => ({ name_en: c.name_en, name_am: c.name_am, revenue: Number(c.revenue) })),
    topProducts: topProducts.map((p) => ({ ...p, units: Number(p.units), revenue: Number(p.revenue) })),
    recentOrders: recent.map((o) => ({ ...o, total: Number(o.total) })),
    cities: cities.map((c) => ({ city: c.city, orders: Number(c.orders) })),
    lowStock,
    checklist: [
      { key: 'phone', done: Boolean(settings.phone || settings.whatsapp), to: '/admin/settings' },
      { key: 'address', done: Boolean(settings.address_en && settings.hours_en), to: '/admin/settings' },
      { key: 'delivery', done: (Number.isFinite(fee) && fee > 0) || Boolean(settings.free_delivery_cities) || Boolean(settings.free_delivery_min_subtotal), to: '/admin/settings' },
      { key: 'policies', done: policiesTotal > 0 && policiesPublished >= policiesTotal, to: '/admin/content' },
      { key: 'products', done: activeProducts > 0 && noImages === 0, to: '/admin/products' },
      { key: 'about', done: aboutCount > 0, to: '/admin/about' },
      { key: 'faq', done: faqCount > 0, to: '/admin/content' },
    ],
  });
});