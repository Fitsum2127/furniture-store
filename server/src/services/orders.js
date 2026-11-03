import crypto from 'crypto';
import pool from '../config/db.js';
import { HttpError, cleanText, isEmail, normalizePhone, toInt } from '../middleware/validate.js';
import { calcDeliveryFee, getSettings } from './settings.js';
import { syncProductStock } from './inventory.js';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const ORDER_NUMBER_RE = /^BF-[A-HJ-NP-Z2-9]{8}$/;
const PAYMENT_METHODS = ['cod', 'chapa', 'telebirr'];

export function newOrderNumber() {
  let s = '';
  for (let i = 0; i < 8; i += 1) s += ALPHABET[crypto.randomInt(ALPHABET.length)];
  return `BF-${s}`;
}

export const newAccessToken = () => crypto.randomBytes(24).toString('base64url');
export const hashToken = (token) => crypto.createHash('sha256').update(String(token)).digest('hex');

export function tokenMatches(token, hash) {
  if (!token || !hash) return false;
  const a = Buffer.from(hashToken(token), 'hex');
  const b = Buffer.from(String(hash), 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Validates everything the browser sent. Prices are never read from the browser.
export function parseOrderInput(body) {
  const b = body || {};
  const name = cleanText(b.customer_name);
  const phone = normalizePhone(b.phone);
  const email = cleanText(b.email).toLowerCase();
  const city = cleanText(b.city);
  const address = cleanText(b.address);
  const notes = cleanText(b.notes);
  const method = String(b.payment_method || '');

  if (name.length < 2 || name.length > 100) throw new HttpError(400, 'Please enter your full name');
  if (!phone) throw new HttpError(400, 'Enter a valid Ethiopian mobile number, for example 09XXXXXXXX');
  if (email && (!isEmail(email) || email.length > 190)) throw new HttpError(400, 'Invalid email address');
  if (city.length < 2 || city.length > 100) throw new HttpError(400, 'Please choose your city');
  if (address.length < 3 || address.length > 255) throw new HttpError(400, 'Please enter your delivery address');
  if (notes.length > 500) throw new HttpError(400, 'Order notes are too long (500 characters maximum)');
  if (!PAYMENT_METHODS.includes(method)) throw new HttpError(400, 'Invalid payment method');

  if (!Array.isArray(b.items) || b.items.length < 1 || b.items.length > 50) {
    throw new HttpError(400, 'Your cart is empty or too large');
  }

  // Merge duplicate cart lines so stock is checked against the real total quantity.
  const merged = new Map();
  for (const item of b.items) {
    const productId = toInt(item && item.productId, { min: 1 });
    const hasVariant = item && item.variantId !== null && item.variantId !== undefined && item.variantId !== 0 && item.variantId !== '0' && item.variantId !== '';
    const variantId = hasVariant ? toInt(item.variantId, { min: 1 }) : null;
    const qty = toInt(item && item.qty, { min: 1, max: 100 });
    if (!productId || !qty || (hasVariant && !variantId)) throw new HttpError(400, 'Your cart contains an invalid item');
    const key = `${productId}:${variantId || 0}`;
    const existing = merged.get(key);
    if (existing) {
      existing.qty += qty;
      if (existing.qty > 100) throw new HttpError(400, 'Quantity is too large for one item');
    } else {
      merged.set(key, { productId, variantId, qty });
    }
  }
  const lines = Array.from(merged.values()).sort(
    (a, c) => a.productId - c.productId || (a.variantId || 0) - (c.variantId || 0)
  );

  return { customer: { name, phone, email: email || null, city, address, notes: notes || null }, method, lines };
}

async function runOrder(input, customerId, settings) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const prepared = [];
    let subtotalCents = 0;

    for (const line of input.lines) {
      const [[product]] = await conn.query(
        'SELECT id, sku, name_en, name_am, price, stock, is_active FROM products WHERE id = ? FOR UPDATE',
        [line.productId]
      );
      if (!product || !product.is_active) {
        throw new HttpError(409, 'A product in your cart is no longer available');
      }

      const [variants] = await conn.query(
        'SELECT id, name_en, name_am, stock FROM product_variants WHERE product_id = ? AND is_active = 1 FOR UPDATE',
        [product.id]
      );

      let variant = null;
      if (variants.length > 0) {
        if (!line.variantId) throw new HttpError(400, `Please choose an option for ${product.name_en}`);
        variant = variants.find((v) => v.id === line.variantId);
        if (!variant) throw new HttpError(409, `That option is no longer available for ${product.name_en}`);
        if (variant.stock < line.qty) {
          throw new HttpError(
            409,
            variant.stock > 0
              ? `Only ${variant.stock} left of ${product.name_en} (${variant.name_en})`
              : `${product.name_en} (${variant.name_en}) is sold out`
          );
        }
        const [update] = await conn.query(
          'UPDATE product_variants SET stock = stock - ? WHERE id = ? AND stock >= ?',
          [line.qty, variant.id, line.qty]
        );
        if (update.affectedRows !== 1) throw new HttpError(409, 'Stock changed. Please review your cart.');
        await syncProductStock(conn, product.id);
      } else {
        if (line.variantId) throw new HttpError(400, 'Invalid option selected');
        if (product.stock < line.qty) {
          throw new HttpError(
            409,
            product.stock > 0 ? `Only ${product.stock} left of ${product.name_en}` : `${product.name_en} is sold out`
          );
        }
        const [update] = await conn.query('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?', [
          line.qty,
          product.id,
          line.qty,
        ]);
        if (update.affectedRows !== 1) throw new HttpError(409, 'Stock changed. Please review your cart.');
      }

      const [[image]] = await conn.query(
        'SELECT url FROM product_images WHERE product_id = ? ORDER BY (variant_id <=> ?) DESC, sort_order, id LIMIT 1',
        [product.id, variant ? variant.id : null]
      );

      const priceCents = Math.round(Number(product.price) * 100);
      subtotalCents += priceCents * line.qty;
      prepared.push({
        productId: product.id,
        variantId: variant ? variant.id : null,
        qty: line.qty,
        unitPrice: priceCents / 100,
        nameEn: product.name_en,
        nameAm: product.name_am,
        sku: product.sku,
        variantEn: variant ? variant.name_en : null,
        variantAm: variant ? variant.name_am : null,
        image: image ? image.url : null,
      });
    }

    const subtotal = subtotalCents / 100;
    const deliveryFee = calcDeliveryFee(settings, { city: input.customer.city, subtotal });
    const total = (subtotalCents + Math.round(deliveryFee * 100)) / 100;

    const token = newAccessToken();
    let orderId = null;
    let orderNumber = null;
    for (let attempt = 0; attempt < 5 && !orderId; attempt += 1) {
      orderNumber = newOrderNumber();
      try {
        const [result] = await conn.query(
          `INSERT INTO orders (order_number, access_token_hash, customer_id, customer_name, phone, email, city, address,
                               notes, payment_method, payment_status, status, subtotal, delivery_fee, total)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'new', ?, ?, ?)`,
          [
            orderNumber, hashToken(token), customerId, input.customer.name, input.customer.phone, input.customer.email,
            input.customer.city, input.customer.address, input.customer.notes, input.method, subtotal, deliveryFee, total,
          ]
        );
        orderId = result.insertId;
      } catch (err) {
        if (err.code !== 'ER_DUP_ENTRY' || attempt === 4) throw err;
      }
    }

    for (const p of prepared) {
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, variant_id, qty, unit_price, product_name_en, product_name_am,
                                  sku, variant_name_en, variant_name_am, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, p.productId, p.variantId, p.qty, p.unitPrice, p.nameEn, p.nameAm, p.sku, p.variantEn, p.variantAm, p.image]
      );
    }

    await conn.query("INSERT INTO payments (order_id, provider, amount, status) VALUES (?, ?, ?, 'pending')", [
      orderId, input.method, total,
    ]);

    await conn.commit();
    return {
      orderId,
      orderNumber,
      accessToken: token, // shown once; only its hash is stored
      subtotal,
      deliveryFee,
      total,
      paymentMethod: input.method,
      paymentStatus: 'pending',
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function createOrder(input, { customerId = null } = {}) {
  const settings = await getSettings({ fresh: true });
  if (settings[`payment_${input.method}_enabled`] !== '1') {
    throw new HttpError(400, 'This payment method is not available');
  }
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await runOrder(input, customerId, settings);
    } catch (err) {
      if (err.code === 'ER_LOCK_DEADLOCK' && attempt === 0) continue;
      throw err;
    }
  }
  throw new HttpError(503, 'The shop is busy. Please try again.');
}

export async function findOrderByNumber(number) {
  if (!ORDER_NUMBER_RE.test(String(number || ''))) return null;
  const [rows] = await pool.query('SELECT * FROM orders WHERE order_number = ?', [number]);
  return rows[0] || null;
}

export async function loadOrderView(order) {
  const [items] = await pool.query(
    `SELECT oi.product_id, oi.variant_id, oi.qty, oi.unit_price,
            COALESCE(oi.product_name_en, p.name_en) AS name_en,
            COALESCE(oi.product_name_am, p.name_am) AS name_am,
            COALESCE(oi.sku, p.sku) AS sku, oi.variant_name_en, oi.variant_name_am, oi.image_url
       FROM order_items oi LEFT JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ? ORDER BY oi.id`,
    [order.id]
  );
  return {
    orderNumber: order.order_number,
    status: order.status,
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    paidAt: order.paid_at,
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.delivery_fee),
    total: Number(order.total),
    createdAt: order.created_at,
    customer: {
      name: order.customer_name,
      phone: order.phone,
      email: order.email,
      city: order.city,
      address: order.address,
      notes: order.notes,
    },
    items: items.map((i) => ({
      productId: i.product_id,
      variantId: i.variant_id,
      name: { en: i.name_en, am: i.name_am },
      variantName: i.variant_name_en ? { en: i.variant_name_en, am: i.variant_name_am || i.variant_name_en } : null,
      sku: i.sku,
      qty: i.qty,
      unitPrice: Number(i.unit_price),
      lineTotal: Math.round(Number(i.unit_price) * i.qty * 100) / 100,
      image: i.image_url,
    })),
  };
}