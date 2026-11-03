import { Router } from 'express';
import pool from '../config/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { HttpError, cleanText, toInt } from '../middleware/validate.js';

// Public: /api/content/pages/:slug and /api/content/faqs
const router = Router();

router.get('/pages/:slug', async (req, res) => {
  const slug = String(req.params.slug || '');
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) throw new HttpError(404, 'Page not found');
  const [[page]] = await pool.query(
    'SELECT slug, title_en, title_am, body_en, body_am, updated_at FROM pages WHERE slug = ? AND is_active = 1',
    [slug]
  );
  if (!page) throw new HttpError(404, 'Page not found');
  res.json(page);
});

router.get('/faqs', async (_req, res) => {
  const [rows] = await pool.query(
    'SELECT id, question_en, question_am, answer_en, answer_am FROM faqs WHERE is_active = 1 ORDER BY sort_order, id'
  );
  res.json(rows);
});

// Admin: /api/admin/content/...
export const adminContentRouter = Router();
adminContentRouter.use(requireAdmin);

adminContentRouter.get('/pages', async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM pages ORDER BY id');
  res.json(rows);
});

adminContentRouter.put('/pages/:slug', async (req, res) => {
  const slug = String(req.params.slug || '');
  const b = req.body || {};
  const title_en = cleanText(b.title_en);
  const title_am = cleanText(b.title_am) || null;
  const body_en = String(b.body_en == null ? '' : b.body_en).trim();
  const body_am = String(b.body_am == null ? '' : b.body_am).trim() || null;
  const active = b.is_active === 1 || b.is_active === true || b.is_active === '1' ? 1 : 0;

  if (!title_en || title_en.length > 200) throw new HttpError(400, 'The English title is required (200 characters maximum)');
  if (!body_en || body_en.length > 20000 || (body_am && body_am.length > 20000)) {
    throw new HttpError(400, 'The English text is required (20000 characters maximum)');
  }
  if (active && /^DRAFT\b/i.test(body_en)) {
    throw new HttpError(400, 'Replace the draft text with the real policy before publishing this page');
  }
  const [result] = await pool.query(
    'UPDATE pages SET title_en = ?, title_am = ?, body_en = ?, body_am = ?, is_active = ? WHERE slug = ?',
    [title_en, title_am, body_en, body_am, active, slug]
  );
  if (!result.affectedRows) throw new HttpError(404, 'Page not found');
  res.json({ ok: true });
});

function readFaq(b) {
  const data = {
    question_en: cleanText(b.question_en),
    question_am: cleanText(b.question_am) || null,
    answer_en: String(b.answer_en == null ? '' : b.answer_en).trim(),
    answer_am: String(b.answer_am == null ? '' : b.answer_am).trim() || null,
    sort_order: toInt(b.sort_order === undefined || b.sort_order === '' ? 0 : b.sort_order, { min: 0, max: 10000 }),
    is_active: b.is_active === 0 || b.is_active === false || b.is_active === '0' ? 0 : 1,
  };
  if (!data.question_en || data.question_en.length > 300) throw new HttpError(400, 'The English question is required (300 characters maximum)');
  if (!data.answer_en || data.answer_en.length > 5000) throw new HttpError(400, 'The English answer is required (5000 characters maximum)');
  if (data.sort_order === null) throw new HttpError(400, 'Invalid order number');
  return data;
}

adminContentRouter.get('/faqs', async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM faqs ORDER BY sort_order, id');
  res.json(rows);
});

adminContentRouter.post('/faqs', async (req, res) => {
  const d = readFaq(req.body || {});
  const [result] = await pool.query(
    'INSERT INTO faqs (question_en, question_am, answer_en, answer_am, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?)',
    [d.question_en, d.question_am, d.answer_en, d.answer_am, d.sort_order, d.is_active]
  );
  res.status(201).json({ id: result.insertId });
});

adminContentRouter.put('/faqs/:id', async (req, res) => {
  const id = toInt(req.params.id, { min: 1 });
  const d = readFaq(req.body || {});
  const [result] = await pool.query(
    `UPDATE faqs SET question_en = ?, question_am = ?, answer_en = ?, answer_am = ?, sort_order = ?, is_active = ?
      WHERE id = ?`,
    [d.question_en, d.question_am, d.answer_en, d.answer_am, d.sort_order, d.is_active, id]
  );
  if (!result.affectedRows) throw new HttpError(404, 'Question not found');
  res.json({ ok: true });
});

adminContentRouter.delete('/faqs/:id', async (req, res) => {
  await pool.query('DELETE FROM faqs WHERE id = ?', [toInt(req.params.id, { min: 1 })]);
  res.json({ ok: true });
});

export default router;