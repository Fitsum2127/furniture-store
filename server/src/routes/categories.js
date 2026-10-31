import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.id, c.slug, c.name_en, c.name_am,
              (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.is_active = 1) AS count
         FROM categories c
        ORDER BY c.id`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

export default router;