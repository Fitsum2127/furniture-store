import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

router.get('/', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT c.id, c.slug, c.name_en, c.name_am, c.image_url, c.sort_order,
            (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.is_active = 1) AS count
       FROM categories c
      WHERE c.is_active = 1
      ORDER BY c.sort_order, c.id`
  );
  res.json(rows.map((r) => ({ ...r, count: Number(r.count) })));
});

export default router;