import { Router } from 'express';
import pool from '../config/db.js';
import { messageLimiter } from '../middleware/rateLimit.js';
import { HttpError, cleanText, isEmail, looksLikePhone } from '../middleware/validate.js';

const router = Router();

router.post('/', messageLimiter, async (req, res) => {
  const b = req.body || {};
  const name = cleanText(b.name);
  const phone = cleanText(b.phone);
  const email = cleanText(b.email).toLowerCase();
  const body = cleanText(b.body);

  if (name.length < 2 || name.length > 100) throw new HttpError(400, 'Please enter your name');
  if (body.length < 5 || body.length > 2000) throw new HttpError(400, 'Please write your message (5 to 2000 characters)');
  if (!phone && !email) throw new HttpError(400, 'Please enter a phone number or email');
  if (phone && !looksLikePhone(phone)) throw new HttpError(400, 'Invalid phone number');
  if (email && (!isEmail(email) || email.length > 190)) throw new HttpError(400, 'Invalid email address');

  await pool.query('INSERT INTO messages (name, phone, email, body) VALUES (?, ?, ?, ?)', [
    name, phone || null, email || null, body,
  ]);
  res.status(201).json({ ok: true });
});

export default router;