import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pool from './config/db.js';
import productsRouter from './routes/products.js';
import categoriesRouter from './routes/categories.js';
import ordersRouter from './routes/orders.js';
import reviewsRouter from './routes/reviews.js';
import newsletterRouter from './routes/newsletter.js';
import messagesRouter from './routes/messages.js';
import aboutRouter from './routes/about.js';
import adminAboutRouter from './routes/adminAbout.js';
import adminRouter from './routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET is missing in server/.env. Admin login will not work.');
}

const app = express();
app.set('trust proxy', 1);
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(uploadsDir));

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/newsletter', newsletterRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/about', aboutRouter);
app.use('/api/admin/about', adminAboutRouter); // must stay above /api/admin
app.use('/api/admin', adminRouter);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));