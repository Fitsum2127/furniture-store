import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

// Real customer reviews (approved, 4 stars or more) used as testimonials. Nothing is invented.
router.get('/testimonials', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT r.id, r.author_name, r.rating_overall, r.body, r.is_verified_purchase, r.created_at,
            p.id AS product_id, p.name_en, p.name_am
       FROM reviews r JOIN products p ON p.id = r.product_id
      WHERE r.is_approved = 1 AND r.rating_overall >= 4 AND p.is_active = 1
      ORDER BY r.is_verified_purchase DESC, r.created_at DESC
      LIMIT 8`
  );
  res.json(rows.map((r) => ({ ...r, is_verified_purchase: Boolean(r.is_verified_purchase) })));
});

// The slides of the home page hero. The admin edits them under Admin > Hero section.
router.get('/hero', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT id, title_en, title_am, text_en, text_am, button_en, button_am, link_url, image_url
       FROM hero_slides WHERE is_active = 1 ORDER BY sort_order, id`
  );
  res.json(rows);
});

export default router;