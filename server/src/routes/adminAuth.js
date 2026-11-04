import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { requireAdmin, signAdminToken } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimit.js';
import { HttpError, cleanText } from '../middleware/validate.js';

const router = Router();
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);
const USERNAME_RE = /^[a-z0-9._-]{3,40}$/;
const view = (a) => ({ id: a.id, name: a.name, username: a.username });

// Login with the username (the old email still works too).
router.post('/login', loginLimiter, async (req, res) => {
  const b = req.body || {};
  const id = cleanText(b.username || b.email).toLowerCase();
  const password = String(b.password || '');
  const admin = id ? (await pool.query('SELECT * FROM admins WHERE username = ? OR email = ? LIMIT 1', [id, id]))[0][0] : null;
  const ok = await bcrypt.compare(password, admin ? admin.password_hash : DUMMY_HASH);
  if (!admin || !ok) throw new HttpError(401, 'Wrong username or password');
  res.json({ token: signAdminToken(admin), admin: view(admin) });
});

router.get('/me', requireAdmin, async (req, res) => {
  const [rows] = await pool.query('SELECT id, name, username FROM admins WHERE id = ?', [req.admin.id]);
  if (!rows[0]) throw new HttpError(401, 'Login required');
  res.json({ admin: view(rows[0]) });
});

router.put('/profile', requireAdmin, async (req, res) => {
  const b = req.body || {};
  const name = cleanText(b.name);
  const username = cleanText(b.username).toLowerCase();
  if (name.length < 2 || name.length > 100) throw new HttpError(400, 'Name must be 2 to 100 characters');
  if (!USERNAME_RE.test(username)) throw new HttpError(400, 'Username must be 3 to 40 characters: letters, numbers, dots, dashes or underscores');
  try {
    await pool.query('UPDATE admins SET name = ?, username = ? WHERE id = ?', [name, username, req.admin.id]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') throw new HttpError(409, 'This username is already used');
    throw err;
  }
  const updated = (await pool.query('SELECT id, name, username FROM admins WHERE id = ?', [req.admin.id]))[0][0];
  res.json({ admin: view(updated), token: signAdminToken(updated) });
});

export default router;