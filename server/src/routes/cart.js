import { Router } from 'express';
import pool from '../config/db.js';
import { HttpError, toInt } from '../middleware/validate.js';

const router = Router();

// Re-checks every cart line against the database: price, availability and stock.
router.post('/validate', async (req, res) => {
  const items = req.body && req.body.items;
  if (!Array.isArray(items) || items.length > 50) throw new HttpError(400, 'Invalid cart');

  const out = [];
  for (const raw of items) {
    const productId = toInt(raw && raw.productId, { min: 1 });
    const variantId = raw && raw.variantId ? toInt(raw.variantId, { min: 1 }) : 0;
    const echo = { productId: productId || 0, variantId: variantId || 0 };

    if (!productId || variantId === null) {
      out.push({ ...echo, ok: false, issue: 'unavailable', maxQty: 0 });
      continue;
    }

    const [[p]] = await pool.query(
      `SELECT p.id, p.name_en, p.name_am, p.price, p.old_price, p.stock
         FROM products p JOIN categories c ON c.id = p.category_id
        WHERE p.id = ? AND p.is_active = 1 AND c.is_active = 1`,
      [productId]
    );
    if (!p) {
      out.push({ ...echo, ok: false, issue: 'unavailable', maxQty: 0 });
      continue;
    }

    const [variants] = await pool.query(
      'SELECT id, name_en, name_am, stock FROM product_variants WHERE product_id = ? AND is_active = 1',
      [productId]
    );

    let issue = null;
    let available = p.stock;
    let variant = null;
    if (variants.length > 0) {
      if (!variantId) issue = 'option_required';
      else {
        variant = variants.find((v) => v.id === variantId) || null;
        if (!variant) issue = 'option_unavailable';
        else available = variant.stock;
      }
    } else if (variantId) {
      issue = 'option_unavailable';
    }
    if (!issue && available <= 0) issue = 'sold_out';

    const [[img]] = await pool.query(
      'SELECT url FROM product_images WHERE product_id = ? ORDER BY (variant_id <=> ?) DESC, sort_order, id LIMIT 1',
      [productId, variant ? variant.id : null]
    );

    out.push({
      ...echo,
      ok: !issue,
      issue,
      price: Number(p.price),
      oldPrice: p.old_price == null ? null : Number(p.old_price),
      maxQty: issue ? 0 : Math.min(available, 100),
      name: { en: p.name_en, am: p.name_am },
      variantName: variant ? { en: variant.name_en, am: variant.name_am } : null,
      image: img ? img.url : null,
    });
  }
  res.json({ items: out });
});

export default router;