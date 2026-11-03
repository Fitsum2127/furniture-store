import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { requireCustomer, signCustomerToken } from '../middleware/customerAuth.js';
import { loginLimiter, registerLimiter } from '../middleware/rateLimit.js';
import { HttpError, cleanText, isEmail, normalizePhone } from '../middleware/validate.js';
import { ORDER_NUMBER_RE, loadOrderView } from '../services/orders.js';

const router = Router();
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

const view = (c) => ({
  id: c.id,
  name: c.name,
  phone: c.phone,
  email: c.email,
  defaultCity: c.default_city,
  defaultAddress: c.default_address,
});

function readPassword(value) {
  const p = String(value == null ? '' : value);
  if (p.length < 8) throw new HttpError(400, 'Password must have at least 8 characters');
  if (Buffer.byteLength(p) > 72) throw new HttpError(400, 'Password is too long (72 characters maximum)');
  return p;
}

async function findOne(sql, params) {
  const [rows] = await pool.query(sql, params);
  return rows[0] || null;
}

function readProfile(body) {
  const name = cleanText(body.name);
  const email = cleanText(body.email).toLowerCase() || null;
  const city = cleanText(body.city !== undefined ? body.city : body.defaultCity) || null;
  const address = cleanText(body.address !== undefined ? body.address : body.defaultAddress) || null;
  if (name.length < 2 || name.length > 100) throw new HttpError(400, 'Please enter your full name');
  if (email && (!isEmail(email) || email.length > 190)) throw new HttpError(400, 'Invalid email address');
  if (city && city.length > 100) throw new HttpError(400, 'City is too long');
  if (address && address.length > 255) throw new HttpError(400, 'Address is too long');
  return { name, email, city, address };
}

router.post('/register', registerLimiter, async (req, res) => {
  const body = req.body || {};
  const phone = normalizePhone(body.phone);
  if (!phone) throw new HttpError(400, 'Enter a valid Ethiopian mobile number, for example 09XXXXXXXX');
  const profile = readProfile(body);
  const password = readPassword(body.password);
  const hash = await bcrypt.hash(password, 12);

  let id;
  try {
    const [result] = await pool.query(
      `INSERT INTO customers (name, phone, email, password_hash, default_city, default_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [profile.name, phone, profile.email, hash, profile.city, profile.address]
    );
    id = result.insertId;
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      throw new HttpError(409, 'An account with this phone number or email already exists. Please log in.');
    }
    throw err;
  }
  const customer = await findOne('SELECT * FROM customers WHERE id = ?', [id]);
  res.status(201).json({ token: signCustomerToken(customer), customer: view(customer) });
});

router.post('/login', loginLimiter, async (req, res) => {
  const body = req.body || {};
  const identifier = cleanText(body.identifier);
  const password = String(body.password == null ? '' : body.password);
  const phone = normalizePhone(identifier);

  let customer = null;
  if (phone) customer = await findOne('SELECT * FROM customers WHERE phone = ?', [phone]);
  else if (isEmail(identifier)) customer = await findOne('SELECT * FROM customers WHERE email = ?', [identifier.toLowerCase()]);

  // Always compare against a hash so the response time does not reveal whether the account exists.
  const ok = await bcrypt.compare(password, customer ? customer.password_hash : DUMMY_HASH);
  if (!customer || !ok || !customer.is_active) throw new HttpError(401, 'Wrong phone, email or password');

  await pool.query('UPDATE customers SET last_login_at = NOW() WHERE id = ?', [customer.id]);
  res.json({ token: signCustomerToken(customer), customer: view(customer) });
});

router.get('/me', requireCustomer, (req, res) => {
  res.json({ customer: view(req.customer) });
});

router.put('/me', requireCustomer, async (req, res) => {
  const profile = readProfile(req.body || {});
  try {
    await pool.query(
      'UPDATE customers SET name = ?, email = ?, default_city = ?, default_address = ? WHERE id = ?',
      [profile.name, profile.email, profile.city, profile.address, req.customer.id]
    );
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') throw new HttpError(409, 'This email is already used by another account');
    throw err;
  }
  const customer = await findOne('SELECT * FROM customers WHERE id = ?', [req.customer.id]);
  res.json({ customer: view(customer) });
});

router.post('/password', requireCustomer, loginLimiter, async (req, res) => {
  const body = req.body || {};
  const customer = await findOne('SELECT * FROM customers WHERE id = ?', [req.customer.id]);
  const ok = await bcrypt.compare(String(body.currentPassword || ''), customer.password_hash);
  if (!ok) throw new HttpError(400, 'Your current password is wrong');
  const hash = await bcrypt.hash(readPassword(body.newPassword), 12);
  await pool.query('UPDATE customers SET password_hash = ? WHERE id = ?', [hash, customer.id]);
  res.json({ ok: true });
});

// Order history: only the logged-in customer's own orders.
router.get('/orders', requireCustomer, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT o.order_number, o.status, o.payment_method, o.payment_status, o.total, o.created_at,
            (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS items_count
       FROM orders o WHERE o.customer_id = ? ORDER BY o.id DESC LIMIT 100`,
    [req.customer.id]
  );
  res.json(
    rows.map((r) => ({
      orderNumber: r.order_number,
      status: r.status,
      paymentMethod: r.payment_method,
      paymentStatus: r.payment_status,
      total: Number(r.total),
      itemsCount: r.items_count,
      createdAt: r.created_at,
    }))
  );
});

router.get('/orders/:orderNumber', requireCustomer, async (req, res) => {
  const number = String(req.params.orderNumber || '').toUpperCase();
  const order = ORDER_NUMBER_RE.test(number)
    ? await findOne('SELECT * FROM orders WHERE order_number = ? AND customer_id = ?', [number, req.customer.id])
    : null;
  if (!order) throw new HttpError(404, 'Order not found');
  res.json(await loadOrderView(order));
});

export default router;