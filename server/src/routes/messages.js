import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();
const sent = new Map(); // simple spam limit: 5 messages per hour per IP

router.post('/', async (req, res, next) => {
  try {
    const now = Date.now();
    const recent = (sent.get(req.ip) || []).filter((t) => now - t < 60 * 60 * 1000);
    if (recent.length >= 5) return res.status(429).json({ error: 'Too many messages. Please try again later.' });

    const b = req.body || {};
    const name = String(b.name || '').trim();
    const phone = String(b.phone || '').trim();
    const email = String(b.email || '').trim().toLowerCase();
    const body = String(b.body || '').trim();

    if (name.length < 2) return res.status(400).json({ error: 'Please enter your name' });
    if (body.length < 5) return res.status(400).json({ error: 'Please write your message' });
    if (!phone && !email) return res.status(400).json({ error: 'Please enter a phone number or email' });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email' });

    await pool.query('INSERT INTO messages (name, phone, email, body) VALUES (?, ?, ?, ?)', [
      name.slice(0, 100),
      phone.slice(0, 30) || null,
      email.slice(0, 190) || null,
      body.slice(0, 2000),
    ]);
    recent.push(now);
    sent.set(req.ip, recent);
    res.status(201).json({ ok: true });
  } catch (err) { next(err); }
});

export default router;