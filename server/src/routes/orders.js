// server/src/routes/orders.js
import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

// POST /api/orders
// body: { customer_name, phone, city, address, notes, payment_method, items: [{ productId, variantId, qty }] }
router.post('/', async (req, res, next) => {
  const { customer_name, phone, city, address, notes, payment_method, items } = req.body || {};

  if (!customer_name || !phone || !city || !address) {
    return res.status(400).json({ error: 'Name, phone, city and address are required' });
  }
  if (!['telebirr', 'chapa', 'cod'].includes(payment_method)) {
    return res.status(400).json({ error: 'Invalid payment method' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    let total = 0;
    const lines = [];
    for (const item of items) {
      const qty = Math.max(1, parseInt(item.qty, 10) || 1);
      // Always read the price from the database, never trust the client.
      const [[product]] = await conn.query(
        'SELECT id, price, stock FROM products WHERE id = ? AND is_active = 1 FOR UPDATE',
        [item.productId]
      );
      if (!product) throw Object.assign(new Error('Product not found'), { status: 400 });
      if (product.stock < qty) throw Object.assign(new Error('Not enough stock'), { status: 409 });
      total += Number(product.price) * qty;
      lines.push({ productId: product.id, variantId: item.variantId || null, qty, price: product.price });
    }

    const [orderResult] = await conn.query(
      `INSERT INTO orders (customer_name, phone, city, address, notes, payment_method, total)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [customer_name, phone, city, address, notes || null, payment_method, total]
    );

    for (const l of lines) {
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, variant_id, qty, unit_price) VALUES (?, ?, ?, ?, ?)',
        [orderResult.insertId, l.productId, l.variantId, l.qty, l.price]
      );
      await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [l.qty, l.productId]);
    }

    await conn.commit();
    res.status(201).json({ orderId: orderResult.insertId, total });
  } catch (err) {
    await conn.rollback();
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  } finally {
    conn.release();
  }
});

export default router;