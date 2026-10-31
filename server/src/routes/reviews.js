// server/src/routes/reviews.js
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import pool from '../config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'uploads'),
  filename: (_req, file, cb) =>
    cb(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 4 },
  fileFilter: (_req, file, cb) =>
    cb(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)),
});

const router = Router();

// POST /api/reviews  (multipart/form-data, field "photos" for up to 4 images)
// Reviews are saved as is_approved = 0 and shown after you approve them in the DB.
router.post('/', upload.array('photos', 4), async (req, res, next) => {
  try {
    const { productId, author_name, body, quality, comfort, value, delivery } = req.body;
    const r = (v) => Math.min(5, Math.max(1, parseInt(v, 10) || 5));
    if (!productId || !author_name || !body) {
      return res.status(400).json({ error: 'Name and review text are required' });
    }
    const q = r(quality), c = r(comfort), v = r(value), d = r(delivery);
    const overall = Math.round((q + c + v + d) / 4);

    const [result] = await pool.query(
      `INSERT INTO reviews (product_id, author_name, rating_overall, rating_quality, rating_comfort,
                            rating_value, rating_delivery, body)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [productId, author_name.slice(0, 100), overall, q, c, v, d, body.slice(0, 2000)]
    );

    for (const f of req.files || []) {
      await pool.query('INSERT INTO review_photos (review_id, url) VALUES (?, ?)', [
        result.insertId,
        `/uploads/${f.filename}`,
      ]);
    }
    res.status(201).json({ id: result.insertId, pendingApproval: true });
  } catch (err) { next(err); }
});

export default router;