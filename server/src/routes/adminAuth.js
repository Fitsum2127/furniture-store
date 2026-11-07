import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { requireAdmin, signAdminToken } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimit.js';
import { deleteUploadedFile, removeFiles, uploadImages } from '../middleware/upload.js';
import { HttpError, cleanText } from '../middleware/validate.js';
import { ensureSchema } from '../services/schema.js';

const router = Router();
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);
const USERNAME_RE = /^[a-z0-9._-]{3,40}$/;
const view = (a) => ({ id: a.id, name: a.name, username: a.username, avatarUrl: a.avatar_url || null });
const findAdmin = async (id) => (await pool.query('SELECT * FROM admins WHERE id = ?', [id]))[0][0];

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
  const admin = await findAdmin(req.admin.id);
  if (!admin) throw new HttpError(401, 'Login required');
  res.json({ admin: view(admin) });
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
  const updated = await findAdmin(req.admin.id);
  res.json({ admin: view(updated), token: signAdminToken(updated) });
});

// Add or change the profile photo. The login check runs before the upload is accepted.
router.post('/profile/photo', requireAdmin, uploadImages.single('image'), async (req, res) => {
  try {
    await ensureSchema();
    if (!req.file) throw new HttpError(400, 'Please choose a JPG, PNG or WebP photo (up to 5 MB).');
    const current = await findAdmin(req.admin.id);
    if (!current) throw new HttpError(401, 'Login required');
    await pool.query('UPDATE admins SET avatar_url = ? WHERE id = ?', [`/uploads/${req.file.filename}`, req.admin.id]);
    deleteUploadedFile(current.avatar_url);
    res.json({ admin: view(await findAdmin(req.admin.id)) });
  } catch (err) {
    removeFiles(req.file ? [req.file] : []);
    throw err;
  }
});

router.delete('/profile/photo', requireAdmin, async (req, res) => {
  await ensureSchema();
  const current = await findAdmin(req.admin.id);
  if (!current) throw new HttpError(401, 'Login required');
  await pool.query('UPDATE admins SET avatar_url = NULL WHERE id = ?', [req.admin.id]);
  deleteUploadedFile(current.avatar_url);
  res.json({ admin: view(await findAdmin(req.admin.id)) });
});

export default router;