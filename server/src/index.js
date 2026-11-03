import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pool from './config/db.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { uploadsDir } from './middleware/upload.js';
import productsRouter from './routes/products.js';
import categoriesRouter from './routes/categories.js';
import cartRouter from './routes/cart.js';
import ordersRouter from './routes/orders.js';
import customersRouter from './routes/customers.js';
import reviewsRouter from './routes/reviews.js';
import newsletterRouter from './routes/newsletter.js';
import messagesRouter from './routes/messages.js';
import aboutRouter from './routes/about.js';
import homeRouter from './routes/home.js';
import settingsRouter, { adminSettingsRouter } from './routes/settings.js';
import pagesRouter, { adminContentRouter } from './routes/pages.js';
import adminAboutRouter from './routes/adminAbout.js';
import adminRouter from './routes/admin.js';
import adminCatalogRouter from './routes/adminCatalog.js';
import adminReportsRouter from './routes/adminReports.js';

const isProd = process.env.NODE_ENV === 'production';

// Refuse to start in production with weak or missing secrets.
const problems = [];
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) problems.push('JWT_SECRET (at least 32 characters)');
if (!process.env.CUSTOMER_JWT_SECRET || process.env.CUSTOMER_JWT_SECRET.length < 32) problems.push('CUSTOMER_JWT_SECRET (at least 32 characters)');
if (process.env.JWT_SECRET && process.env.JWT_SECRET === process.env.CUSTOMER_JWT_SECRET) problems.push('JWT_SECRET and CUSTOMER_JWT_SECRET must be different');
if (isProd && !process.env.CLIENT_ORIGIN) problems.push('CLIENT_ORIGIN');
if (problems.length) {
  const text = `Problem in server/.env: ${problems.join('; ')}`;
  if (isProd) {
    console.error(text);
    process.exit(1);
  }
  console.warn(`WARNING. ${text}`);
}

const app = express();
app.set('trust proxy', Number(process.env.TRUST_PROXY || 0));

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim().replace(/\/$/, ''))
  .filter(Boolean);
app.use(
  cors({
    origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)),
  })
);

app.use(express.json({ limit: '200kb' }));

app.use(
  '/uploads',
  express.static(uploadsDir, {
    maxAge: '365d',
    immutable: true,
    index: false,
    dotfiles: 'deny',
    setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
  })
);

app.use('/api', apiLimiter);

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false });
  }
});

// Public API
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/customers', customersRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/newsletter', newsletterRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/about', aboutRouter);
app.use('/api/home', homeRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/content', pagesRouter);

// Admin API (every admin router checks the admin token itself)
app.use('/api/admin/about', adminAboutRouter);
app.use('/api/admin/settings', adminSettingsRouter);
app.use('/api/admin/content', adminContentRouter);
app.use('/api/admin', adminRouter);
app.use('/api/admin', adminCatalogRouter);
app.use('/api/admin', adminReportsRouter);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err, _req, res, next) => {
  if (res.headersSent) return next(err);
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid request' });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Request is too large' });
  if (err.status && err.status < 600 && err.expose !== false && typeof err.message === 'string') {
    return res.status(err.status).json({ error: err.message });
  }
  if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'This value already exists' });
  if (err.code === 'ER_NO_REFERENCED_ROW_2') return res.status(400).json({ error: 'Invalid reference' });
  if (err.code === 'ER_ROW_IS_REFERENCED_2') return res.status(409).json({ error: 'This item is still in use' });
  if (err.code === 'ER_DATA_TOO_LONG') return res.status(400).json({ error: 'A value is too long' });
  if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED') return res.status(409).json({ error: 'Stock cannot go below zero' });
  console.error(err);
  return res.status(500).json({ error: 'Server error' });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));