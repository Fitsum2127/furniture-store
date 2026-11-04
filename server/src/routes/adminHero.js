import { Router } from 'express';
import pool from '../config/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { deleteUploadedFile, removeFiles, uploadImages } from '../middleware/upload.js';
import { HttpError, cleanText, isHttpUrl, toInt } from '../middleware/validate.js';

const router = Router();
router.use(requireAdmin);

function readSlide(body) {
  const b = body || {};
  const data = {
    title_en: cleanText(b.title_en),
    title_am: cleanText(b.title_am) || null,
    text_en: cleanText(b.text_en) || null,
    text_am: cleanText(b.text_am) || null,
    button_en: cleanText(b.button_en) || null,
    button_am: cleanText(b.button_am) || null,
    link_url: cleanText(b.link_url) || '/shop',
    is_active: b.is_active === '0' || b.is_active === 0 || b.is_active === false ? 0 : 1,
  };
  const errors = [];
  if (!data.title_en || data.title_en.length > 200 || (data.title_am && data.title_am.length > 200)) errors.push('The English title is required (200 characters maximum)');
  if ((data.text_en && data.text_en.length > 500) || (data.text_am && data.text_am.length > 500)) errors.push('Text must be 500 characters or fewer');
  if ((data.button_en && data.button_en.length > 80) || (data.button_am && data.button_am.length > 80)) errors.push('Button text must be 80 characters or fewer');
  const internal = data.link_url.startsWith('/') && !data.link_url.startsWith('//') && !/\s/.test(data.link_url);
  if (data.link_url.length > 300 || !(internal || isHttpUrl(data.link_url))) errors.push('The button link must start with / (a page of your site) or https://');
  return { data, errors };
}

router.get('/', async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM hero_slides ORDER BY sort_order, id');
  res.json(rows);
});

router.post('/', uploadImages.single('image'), async (req, res) => {
  try {
    const { data, errors } = readSlide(req.body);
    if (errors.length) throw new HttpError(400, errors.join('. '));
    if (!req.file) throw new HttpError(400, 'Please choose a photo for the slide (JPG, PNG or WebP, up to 5 MB).');
    const [[row]] = await pool.query('SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM hero_slides');
    const [result] = await pool.query(
      `INSERT INTO hero_slides (title_en, title_am, text_en, text_am, button_en, button_am, link_url, image_url, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.title_en, data.title_am, data.text_en, data.text_am, data.button_en, data.button_am, data.link_url, `/uploads/${req.file.filename}`, row.next, data.is_active]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    removeFiles(req.file ? [req.file] : []);
    throw err;
  }
});

router.put('/:id', uploadImages.single('image'), async (req, res) => {
  try {
    const id = toInt(req.params.id, { min: 1 });
    const { data, errors } = readSlide(req.body);
    if (errors.length) throw new HttpError(400, errors.join('. '));
    const [[existing]] = await pool.query('SELECT image_url FROM hero_slides WHERE id = ?', [id]);
    if (!existing) throw new HttpError(404, 'Slide not found');

    const image = req.file ? `/uploads/${req.file.filename}` : existing.image_url;
    await pool.query(
      `UPDATE hero_slides SET title_en = ?, title_am = ?, text_en = ?, text_am = ?, button_en = ?, button_am = ?,
              link_url = ?, image_url = ?, is_active = ? WHERE id = ?`,
      [data.title_en, data.title_am, data.text_en, data.text_am, data.button_en, data.button_am, data.link_url, image, data.is_active, id]
    );
    if (req.file) deleteUploadedFile(existing.image_url);
    res.json({ ok: true });
  } catch (err) {
    removeFiles(req.file ? [req.file] : []);
    throw err;
  }
});

router.patch('/:id/active', async (req, res) => {
  const active = req.body && (req.body.is_active === 1 || req.body.is_active === true) ? 1 : 0;
  await pool.query('UPDATE hero_slides SET is_active = ? WHERE id = ?', [active, toInt(req.params.id, { min: 1 })]);
  res.json({ ok: true });
});

router.patch('/:id/move', async (req, res) => {
  const id = toInt(req.params.id, { min: 1 });
  const direction = req.body && req.body.direction;
  if (!['up', 'down'].includes(direction)) throw new HttpError(400, 'Invalid direction');
  const [rows] = await pool.query('SELECT id FROM hero_slides ORDER BY sort_order, id');
  const ids = rows.map((r) => r.id);
  const i = ids.indexOf(id);
  if (i === -1) throw new HttpError(404, 'Slide not found');
  const j = direction === 'up' ? i - 1 : i + 1;
  if (j < 0 || j >= ids.length) return res.json({ ok: true });
  [ids[i], ids[j]] = [ids[j], ids[i]];
  for (let k = 0; k < ids.length; k += 1) {
    await pool.query('UPDATE hero_slides SET sort_order = ? WHERE id = ?', [k, ids[k]]);
  }
  return res.json({ ok: true });
});

router.delete('/:id', async (req, res) => {
  const id = toInt(req.params.id, { min: 1 });
  const [[existing]] = await pool.query('SELECT image_url FROM hero_slides WHERE id = ?', [id]);
  if (!existing) throw new HttpError(404, 'Slide not found');
  await pool.query('DELETE FROM hero_slides WHERE id = ?', [id]);
  deleteUploadedFile(existing.image_url);
  res.json({ deleted: true });
});

export default router;