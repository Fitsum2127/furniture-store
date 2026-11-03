import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { HttpError, toInt } from '../middleware/validate.js';

// Public: list of published policy pages (used by the footer)
export const publicExtraRouter = Router();
publicExtraRouter.get('/pages', async (_req, res) => {
  const [rows] = await pool.query('SELECT slug, title_en, title_am FROM pages WHERE is_active = 1 ORDER BY id');
  res.json(rows);
});

// Admin: set a temporary password for a customer who forgot theirs
export const adminExtraRouter = Router();
adminExtraRouter.use(requireAdmin);
adminExtraRouter.post('/customers/:id/password', async (req, res) => {
  const id = toInt(req.params.id, { min: 1 });
  const password = String((req.body && req.body.newPassword) || '');
  if (password.length < 8) throw new HttpError(400, 'The temporary password must have at least 8 characters');
  if (Buffer.byteLength(password) > 72) throw new HttpError(400, 'The password is too long (72 characters maximum)');
  const [result] = await pool.query('UPDATE customers SET password_hash = ? WHERE id = ?', [await bcrypt.hash(password, 12), id]);
  if (!result.affectedRows) throw new HttpError(404, 'Customer not found');
  res.json({ ok: true });
});