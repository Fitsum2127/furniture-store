import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, title_en, title_am, body_en, body_am, image_url
         FROM about_sections
        WHERE is_active = 1
        ORDER BY sort_order, id`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

export default router;