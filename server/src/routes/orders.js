import { Router } from 'express';
import { optionalCustomer } from '../middleware/customerAuth.js';
import { orderLimiter, trackLimiter } from '../middleware/rateLimit.js';
import { HttpError, normalizePhone } from '../middleware/validate.js';
import { createOrder, findOrderByNumber, loadOrderView, parseOrderInput, tokenMatches } from '../services/orders.js';

const router = Router();

// Place an order (guest or logged-in customer). Prices and totals are always calculated here.
router.post('/', orderLimiter, optionalCustomer, async (req, res) => {
  const input = parseOrderInput(req.body);
  const result = await createOrder(input, { customerId: req.customer ? req.customer.id : null });
  res.status(201).json(result);
});

// Guest tracking with order number + the phone number used on the order.
router.post('/lookup', trackLimiter, async (req, res) => {
  const body = req.body || {};
  const number = String(body.orderNumber || '').trim().toUpperCase();
  const phone = normalizePhone(body.phone);
  const order = phone ? await findOrderByNumber(number) : null;
  if (!order || normalizePhone(order.phone) !== phone) {
    throw new HttpError(404, 'No order found with those details');
  }
  res.json(await loadOrderView(order));
});

// Tracking with the secret link: the token is sent in the X-Order-Token header.
router.get('/:orderNumber', trackLimiter, async (req, res) => {
  const order = await findOrderByNumber(String(req.params.orderNumber || '').toUpperCase());
  if (!order || !tokenMatches(req.get('x-order-token'), order.access_token_hash)) {
    throw new HttpError(404, 'Order not found');
  }
  res.json(await loadOrderView(order));
});

export default router;