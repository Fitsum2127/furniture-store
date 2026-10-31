import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const email = String((req.body && req.body.email) || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 190) {
      return res.status(400).json({ error: 'Invalid email' });
    }
    await pool.query('INSERT IGNORE INTO subscribers (email) VALUES (?)', [email]);
    res.status(201).json({ ok: true });
  } catch (err) { next(err); }
});

export default router;