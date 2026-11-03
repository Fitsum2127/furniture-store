import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();
const esc = (s) => String(s).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
const site = () => (process.env.PUBLIC_SITE_URL || '').replace(/\/$/, '');

router.get('/robots.txt', (_req, res) => {
  const lines = ['User-agent: *', 'Disallow: /admin', 'Disallow: /account', 'Disallow: /checkout', 'Disallow: /order/', 'Disallow: /track'];
  if (site()) lines.push(`Sitemap: ${site()}/sitemap.xml`);
  res.type('text/plain').send(lines.join('\n'));
});

router.get('/sitemap.xml', async (_req, res) => {
  if (!site()) return res.status(503).type('text/plain').send('PUBLIC_SITE_URL is not set in server/.env');
  const [products] = await pool.query(
    'SELECT p.id FROM products p JOIN categories c ON c.id = p.category_id WHERE p.is_active = 1 AND c.is_active = 1 ORDER BY p.id'
  );
  const [cats] = await pool.query('SELECT slug FROM categories WHERE is_active = 1 ORDER BY id');
  const [pages] = await pool.query('SELECT slug FROM pages WHERE is_active = 1');
  const urls = ['/', '/shop', '/about', '/contact', '/faq'];
  cats.forEach((c) => urls.push(`/shop?category=${encodeURIComponent(c.slug)}`));
  products.forEach((p) => urls.push(`/product/${p.id}`));
  pages.forEach((p) => urls.push(`/policies/${encodeURIComponent(p.slug)}`));
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) => `  <url><loc>${esc(site() + u)}</loc></url>`).join('\n') +
    '\n</urlset>';
  return res.type('application/xml').send(xml);
});

export default router;