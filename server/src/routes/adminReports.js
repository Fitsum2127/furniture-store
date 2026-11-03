import { Router } from 'express';
import pool from '../config/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { HttpError, cleanText, escapeLike, toInt } from '../middleware/validate.js';

const router = Router();
router.use(requireAdmin);

// All SQL pieces below are fixed text chosen from a whitelist, never taken from the request.
const PERIODS = {
  day: {
    label: "DATE_FORMAT(created_at, '%Y-%m-%d')",
    since: 'DATE_SUB(CURDATE(), INTERVAL 29 DAY)',
  },
  week: {
    label: "DATE_FORMAT(DATE_SUB(DATE(created_at), INTERVAL WEEKDAY(created_at) DAY), '%Y-%m-%d')",
    since: 'DATE_SUB(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 11 WEEK)',
  },
  month: {
    label: "DATE_FORMAT(created_at, '%Y-%m')",
    since: "DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 11 MONTH)",
  },
};

router.get('/reports/sales', async (req, res) => {
  const p = PERIODS[req.query.period] || PERIODS.day;
  const [rows] = await pool.query(
    `SELECT ${p.label} AS label,
            COUNT(*) AS orders,
            COALESCE(SUM(CASE WHEN status <> 'cancelled' THEN total END), 0) AS revenue,
            COALESCE(SUM(CASE WHEN status <> 'cancelled' AND payment_status = 'paid' THEN total END), 0) AS paid,
            COALESCE(SUM(status = 'cancelled'), 0) AS cancelled
       FROM orders
      WHERE created_at >= ${p.since}
      GROUP BY label
      ORDER BY label`
  );
  res.json(
    rows.map((r) => ({
      label: r.label,
      orders: Number(r.orders),
      revenue: Number(r.revenue),
      paid: Number(r.paid),
      cancelled: Number(r.cancelled),
    }))
  );
});

router.get('/reports/top-products', async (req, res) => {
  const days = toInt(req.query.days, { min: 1, max: 365 }) || 30;
  const [rows] = await pool.query(
    `SELECT oi.product_id, COALESCE(oi.product_name_en, p.name_en) AS name_en,
            SUM(oi.qty) AS units, SUM(oi.qty * oi.unit_price) AS revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       LEFT JOIN products p ON p.id = oi.product_id
      WHERE o.status <> 'cancelled' AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY oi.product_id, name_en
      ORDER BY units DESC
      LIMIT 10`,
    [days]
  );
  res.json(rows.map((r) => ({ ...r, units: Number(r.units), revenue: Number(r.revenue) })));
});

/* ---------- customers ---------- */
router.get('/customers', async (req, res) => {
  const q = cleanText(req.query.q).slice(0, 60);
  const like = `%${escapeLike(q)}%`;
  const [rows] = await pool.query(
    `SELECT c.id, c.name, c.phone, c.email, c.is_active, c.created_at, c.last_login_at,
            COUNT(o.id) AS orders_count,
            COALESCE(SUM(CASE WHEN o.status <> 'cancelled' THEN o.total END), 0) AS total_spent
       FROM customers c LEFT JOIN orders o ON o.customer_id = c.id
      ${q ? 'WHERE c.name LIKE ? OR c.phone LIKE ? OR c.email LIKE ?' : ''}
      GROUP BY c.id
      ORDER BY c.id DESC
      LIMIT 300`,
    q ? [like, like, like] : []
  );
  res.json(rows.map((r) => ({ ...r, orders_count: Number(r.orders_count), total_spent: Number(r.total_spent) })));
});

router.get('/customers/:id', async (req, res) => {
  const id = toInt(req.params.id, { min: 1 });
  const [[customer]] = await pool.query(
    'SELECT id, name, phone, email, default_city, default_address, is_active, created_at, last_login_at FROM customers WHERE id = ?',
    [id]
  );
  if (!customer) throw new HttpError(404, 'Customer not found');
  const [orders] = await pool.query(
    'SELECT id, order_number, status, payment_status, total, created_at FROM orders WHERE customer_id = ? ORDER BY id DESC LIMIT 100',
    [id]
  );
  res.json({ ...customer, orders: orders.map((o) => ({ ...o, total: Number(o.total) })) });
});

router.patch('/customers/:id/active', async (req, res) => {
  const active = req.body && (req.body.is_active === 1 || req.body.is_active === true) ? 1 : 0;
  await pool.query('UPDATE customers SET is_active = ? WHERE id = ?', [active, toInt(req.params.id, { min: 1 })]);
  res.json({ ok: true });
});

export default router;