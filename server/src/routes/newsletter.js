import { Router } from 'express';
import pool from '../config/db.js';
import { newsletterLimiter } from '../middleware/rateLimit.js';
import { HttpError, cleanText, isEmail } from '../middleware/validate.js';

const router = Router();

router.post('/', newsletterLimiter, async (req, res) => {
  const email = cleanText(req.body && req.body.email).toLowerCase();
  if (!isEmail(email) || email.length > 190) throw new HttpError(400, 'Invalid email');
  await pool.query('INSERT IGNORE INTO subscribers (email) VALUES (?)', [email]);
  res.status(201).json({ ok: true });
});

export default router;