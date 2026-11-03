import { Router } from 'express';
import pool from '../config/db.js';
import { optionalCustomer } from '../middleware/customerAuth.js';
import { reviewLimiter } from '../middleware/rateLimit.js';
import { removeFiles, uploadImages } from '../middleware/upload.js';
import { HttpError, cleanText, toInt } from '../middleware/validate.js';

const router = Router();

// Reviews are saved as pending. They appear on the website only after the admin approves them.
router.post('/', reviewLimiter, optionalCustomer, uploadImages.array('photos', 4), async (req, res) => {
  try {
    const b = req.body || {};
    const productId = toInt(b.productId, { min: 1 });
    const author = cleanText(b.author_name);
    const body = cleanText(b.body);
    const rate = (v) => Math.min(5, Math.max(1, toInt(v, { min: 1, max: 5 }) || 5));

    if (!productId) throw new HttpError(400, 'Invalid product');
    if (author.length < 2 || author.length > 100) throw new HttpError(400, 'Please enter your name');
    if (body.length < 5 || body.length > 2000) throw new HttpError(400, 'Please write your review (5 to 2000 characters)');

    const [[product]] = await pool.query('SELECT id FROM products WHERE id = ? AND is_active = 1', [productId]);
    if (!product) throw new HttpError(404, 'Product not found');

    const quality = rate(b.quality);
    const comfort = rate(b.comfort);
    const value = rate(b.value);
    const delivery = rate(b.delivery);
    const overall = Math.round((quality + comfort + value + delivery) / 4);

    // "Verified" only when a logged-in customer really ordered this product (and did not cancel it).
    let verified = 0;
    if (req.customer) {
      const [rows] = await pool.query(
        `SELECT 1 FROM order_items oi JOIN orders o ON o.id = oi.order_id
          WHERE o.customer_id = ? AND oi.product_id = ? AND o.status <> 'cancelled' LIMIT 1`,
        [req.customer.id, productId]
      );
      verified = rows.length > 0 ? 1 : 0;
    }

    const [result] = await pool.query(
      `INSERT INTO reviews (product_id, author_name, rating_overall, rating_quality, rating_comfort, rating_value,
                            rating_delivery, body, is_verified_purchase, customer_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [productId, author, overall, quality, comfort, value, delivery, body, verified, req.customer ? req.customer.id : null]
    );

    for (const f of req.files || []) {
      await pool.query('INSERT INTO review_photos (review_id, url) VALUES (?, ?)', [result.insertId, `/uploads/${f.filename}`]);
    }
    res.status(201).json({ id: result.insertId, pendingApproval: true });
  } catch (err) {
    removeFiles(req.files);
    throw err;
  }
});

export default router;