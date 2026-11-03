import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

// Customer tokens use their own secret, so they can never work on admin routes (and the reverse).
function customerSecret() {
  const secret = process.env.CUSTOMER_JWT_SECRET;
  if (!secret || secret.length < 32 || secret === process.env.JWT_SECRET) {
    throw new Error('CUSTOMER_JWT_SECRET is missing, shorter than 32 characters, or equal to JWT_SECRET');
  }
  return secret;
}

export function signCustomerToken(customer) {
  return jwt.sign({ id: customer.id, role: 'customer' }, customerSecret(), {
    expiresIn: '7d',
    algorithm: 'HS256',
  });
}

async function customerFromRequest(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  const payload = jwt.verify(token, customerSecret(), { algorithms: ['HS256'] });
  if (payload.role !== 'customer') return null;
  const [rows] = await pool.query(
    'SELECT id, name, phone, email, default_city, default_address, is_active FROM customers WHERE id = ?',
    [payload.id]
  );
  const customer = rows[0];
  return customer && customer.is_active ? customer : null;
}

export async function requireCustomer(req, res, next) {
  try {
    const customer = await customerFromRequest(req);
    if (!customer) return res.status(401).json({ error: 'Please log in' });
    req.customer = customer;
    return next();
  } catch (err) {
    if (['TokenExpiredError', 'JsonWebTokenError', 'NotBeforeError'].includes(err.name)) {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return next(err);
  }
}

// For checkout and reviews: a logged-in customer is recognised, but a guest is fine too.
export async function optionalCustomer(req, _res, next) {
  try {
    const customer = await customerFromRequest(req);
    if (customer) req.customer = customer;
  } catch (err) {
    // invalid or expired token: continue as a guest
  }
  next();
}