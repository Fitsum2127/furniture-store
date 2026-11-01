import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import pool from '../config/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { uploadImages, uploadsDir } from '../middleware/upload.js';

const router = Router();
router.use(requireAdmin);

function unlinkUpload(url) {
  if (url && url.startsWith('/uploads/')) {
    fs.unlink(path.join(uploadsDir, path.basename(url)), () => {});
  }
}

function readSection(body) {
  const s = (v) => String(v == null ? '' : v).trim();
  const data = {
    title_en: s(body.title_en),
    title_am: s(body.title_am) || null,
    body_en: s(body.body_en),
    body_am: s(body.body_am) || null,
    is_active: body.is_active === '0' || body.is_active === 0 || body.is_active === false ? 0 : 1,
  };
  const errors = [];
  if (!data.title_en) errors.push('The English title is required');
  if (data.title_en.length > 200 || (data.title_am && data.title_am.length > 200)) errors.push('Titles must be 200 characters or fewer');
  if (!data.body_en) errors.push('The English text is required');
  if ((data.body_en && data.body_en.length > 5000) || (data.body_am && data.body_am.length > 5000)) errors.push('Text must be 5000 characters or fewer');
  return { data, errors };
}

router.get('/', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM about_sections ORDER BY sort_order, id');
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/', uploadImages.single('image'), async (req, res, next) => {
  try {
    const { data, errors } = readSection(req.body || {});
    if (errors.length) {
      if (req.file) unlinkUpload(`/uploads/${req.file.filename}`);
      return res.status(400).json({ error: errors.join('. ') });
    }
    const [[row]] = await pool.query('SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM about_sections');
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const [result] = await pool.query(
      `INSERT INTO about_sections (title_en, title_am, body_en, body_am, image_url, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [data.title_en, data.title_am, data.body_en, data.body_am, image, row.next, data.is_active]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) { next(err); }
});

router.put('/:id', uploadImages.single('image'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const body = req.body || {};
    const { data, errors } = readSection(body);
    if (errors.length) {
      if (req.file) unlinkUpload(`/uploads/${req.file.filename}`);
      return res.status(400).json({ error: errors.join('. ') });
    }
    const [[existing]] = await pool.query('SELECT image_url FROM about_sections WHERE id = ?', [id]);
    if (!existing) {
      if (req.file) unlinkUpload(`/uploads/${req.file.filename}`);
      return res.status(404).json({ error: 'Section not found' });
    }

    let image = existing.image_url;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
      unlinkUpload(existing.image_url);
    } else if (body.remove_image === '1') {
      image = null;
      unlinkUpload(existing.image_url);
    }

    await pool.query(
      `UPDATE about_sections
          SET title_en = ?, title_am = ?, body_en = ?, body_am = ?, image_url = ?, is_active = ?
        WHERE id = ?`,
      [data.title_en, data.title_am, data.body_en, data.body_am, image, data.is_active, id]
    );
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.patch('/:id/active', async (req, res, next) => {
  try {
    const active = req.body && (req.body.is_active === 1 || req.body.is_active === true) ? 1 : 0;
    await pool.query('UPDATE about_sections SET is_active = ? WHERE id = ?', [active, Number(req.params.id)]);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.patch('/:id/move', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const direction = req.body && req.body.direction;
    if (!['up', 'down'].includes(direction)) return res.status(400).json({ error: 'Invalid direction' });

    const [rows] = await pool.query('SELECT id FROM about_sections ORDER BY sort_order, id');
    const ids = rows.map((r) => r.id);
    const i = ids.indexOf(id);
    if (i === -1) return res.status(404).json({ error: 'Section not found' });

    const j = direction === 'up' ? i - 1 : i + 1;
    if (j < 0 || j >= ids.length) return res.json({ ok: true });

    [ids[i], ids[j]] = [ids[j], ids[i]];
    for (let k = 0; k < ids.length; k += 1) {
      await pool.query('UPDATE about_sections SET sort_order = ? WHERE id = ?', [k, ids[k]]);
    }
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [[existing]] = await pool.query('SELECT image_url FROM about_sections WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Section not found' });
    await pool.query('DELETE FROM about_sections WHERE id = ?', [id]);
    unlinkUpload(existing.image_url);
    res.json({ deleted: true });
  } catch (err) { next(err); }
});

export default router;