import 'dotenv/config';
import crypto from 'crypto';
import pool from '../src/config/db.js';
import { DEFAULTS } from '../src/services/settings.js';

const DB_NAME = process.env.DB_NAME;
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomOrderNumber() {
  let s = '';
  for (let i = 0; i < 8; i += 1) s += ALPHABET[crypto.randomInt(ALPHABET.length)];
  return `BF-${s}`;
}

const ph = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1800&q=80`;

// The 10 slides the home page showed before the admin could edit them.
const HERO_SEED = [
  ['Elevate Your Lifestyle', 'ኑሮዎን ያሳምሩ', 'Discover furniture and home decor that blends style, comfort and elegance.', 'ዘይቤን፣ ምቾትንና ውበትን ያጣመሩ የቤት ዕቃዎችና ማስዋቢያዎችን ያግኙ።', 'Explore Collection', 'ስብስቡን ይመልከቱ', '/shop', ph('photo-1616486338812-3dadae4b4ace')],
  ['Rest in Calm Comfort', 'በተረጋጋ ምቾት ዕረፍት ያድርጉ', 'Beds and soft textures for restful nights.', 'ለእረፍት ምሽቶች አልጋዎችና ለስላሳ ጨርቆች።', 'Shop Bedroom', 'መኝታ ቤት ይግዙ', '/shop?category=bedroom', ph('photo-1505693416388-ac5ce068fe85')],
  ['Gather Around the Table', 'በጠረጴዛ ዙሪያ ይሰባሰቡ', 'Dining sets for family meals and long conversations.', 'ለቤተሰብ ምግብና ለረጅም ጭውውት የመመገቢያ ስብስቦች።', 'Shop Dining', 'የመመገቢያ ክፍል ይግዙ', '/shop?category=dining', ph('photo-1556228453-efd6c1ff04f6')],
  ['Light Up Every Corner', 'ጥግ ሁሉ ይብራ', 'Pendants and lamps that fill your home with a soft glow.', 'ቤትዎን በለስላሳ ብርሃን የሚሞሉ መብራቶች።', 'Shop Lighting', 'መብራቶችን ይግዙ', '/shop?category=lighting', ph('photo-1513694203232-719a280e022f')],
  ['Details That Tell Your Story', 'ታሪክዎን የሚናገሩ ዝርዝሮች', 'Wall art, mirrors and vases that bring personality to every room.', 'ለእያንዳንዱ ክፍል ባህሪ የሚሰጡ የግድግዳ ጥበብ፣ መስተዋቶችና የአበባ ማስቀመጫዎች።', 'Shop Wall Decor', 'ማስዋቢያ ይግዙ', '/shop?category=wall-decor', ph('photo-1618220179428-22790b461013')],
  ['Modern Living, Made Warm', 'ዘመናዊ ኑሮ፣ ሞቅ ያለ ገጽታ', 'Sofas and chairs with clean lines and everyday comfort.', 'ንጹህ መስመሮችና የዕለት ምቾት ያላቸው ሶፋዎችና ወንበሮች።', 'Shop Living Room', 'ሳሎን ይግዙ', '/shop?category=living-room', ph('photo-1600210492486-724fe5c67fb0')],
  ['Work in Style', 'በውበት ይሥሩ', 'Desks and office pieces for a calm, organized workspace.', 'የተረጋጋና የተደራጀ የሥራ ቦታ የሚፈጥሩ ጠረጴዛዎችና የቢሮ ዕቃዎች።', 'Shop Office', 'የቢሮ ዕቃ ይግዙ', '/shop?category=office', ph('photo-1518455027359-f3f8164ba6bd')],
  ['Natural Textures, Timeless Look', 'ተፈጥሯዊ ሸካራነት፣ ጊዜ የማይሽረው ገጽታ', 'Wood, linen and ceramic in earthy tones.', 'በምድራዊ ቀለም የተሠሩ እንጨት፣ ሊነንና ሴራሚክ።', 'Browse All', 'ሁሉንም ይመልከቱ', '/shop', ph('photo-1586023492125-27b2c045efd7')],
  ['Make Every Room Yours', 'እያንዳንዱን ክፍል የእርስዎ ያድርጉ', 'Cushions, plants and small touches that turn a house into a home.', 'ቤትን መኖሪያ የሚያደርጉ ትራሶች፣ ተክሎችና ትናንሽ ጌጦች።', 'Shop Home Decor', 'የቤት ማስዋቢያ ይግዙ', '/shop?category=home-decor', ph('photo-1600607687939-ce8a6c25118c')],
  ['Furniture for Every Room', 'ለእያንዳንዱ ክፍል የቤት ዕቃ', 'Browse the full collection and find the pieces that fit your home.', 'ሙሉውን ስብስብ ይመልከቱ፣ ለቤትዎ የሚስማሙትን ያግኙ።', 'Start Shopping', 'ግዢ ይጀምሩ', '/shop', ph('photo-1493663284031-b7e3aefcae8e')],
].map((row, i) => [...row, i]);

const db = {
  async exists(sql, params) {
    const [rows] = await pool.query(sql, params);
    return rows.length > 0;
  },
  hasColumn(table, column) {
    return this.exists(
      'SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
      [DB_NAME, table, column]
    );
  },
  hasIndex(table, name) {
    return this.exists(
      'SELECT 1 FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?',
      [DB_NAME, table, name]
    );
  },
  hasConstraint(table, name) {
    return this.exists(
      'SELECT 1 FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND CONSTRAINT_NAME = ?',
      [DB_NAME, table, name]
    );
  },
  async addColumn(table, column, definition) {
    if (await this.hasColumn(table, column)) return;
    await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  },
  async addIndex(table, name, columns, unique = false) {
    if (await this.hasIndex(table, name)) return;
    await pool.query(`CREATE ${unique ? 'UNIQUE ' : ''}INDEX ${name} ON ${table} (${columns})`);
  },
  async addForeignKey(table, name, column, refTable, refColumn, onDelete) {
    if (await this.hasConstraint(table, name)) return;
    await pool.query(
      `ALTER TABLE ${table} ADD CONSTRAINT ${name} FOREIGN KEY (${column}) REFERENCES ${refTable} (${refColumn}) ON DELETE ${onDelete}`
    );
  },
  async addCheck(table, name, expression) {
    if (await this.hasConstraint(table, name)) return;
    await pool.query(`ALTER TABLE ${table} ADD CONSTRAINT ${name} CHECK (${expression})`);
  },
};

const migrations = [
  {
    name: '001_settings',
    async up() {
      await pool.query(`CREATE TABLE IF NOT EXISTS settings (
        setting_key VARCHAR(80) NOT NULL PRIMARY KEY,
        setting_value TEXT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`);
      await pool.query('INSERT IGNORE INTO settings (setting_key, setting_value) VALUES ?', [Object.entries(DEFAULTS)]);
    },
  },
  {
    name: '002_products_featured_details',
    async up() {
      await db.addColumn('products', 'is_featured', 'TINYINT(1) NOT NULL DEFAULT 0');
      await db.addColumn('products', 'details', 'JSON NULL');
      await db.addIndex('products', 'idx_products_featured', 'is_featured');
    },
  },
  {
    name: '003_variants_and_stock_safety',
    async up() {
      await db.addColumn('product_variants', 'is_active', 'TINYINT(1) NOT NULL DEFAULT 1');
      await pool.query('UPDATE product_variants SET stock = 0 WHERE stock < 0');
      await pool.query('UPDATE products SET stock = 0 WHERE stock < 0');
      await pool.query(`UPDATE products p
        SET p.stock = (SELECT COALESCE(SUM(v.stock), 0) FROM product_variants v WHERE v.product_id = p.id AND v.is_active = 1)
        WHERE EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.is_active = 1)`);
      await db.addCheck('products', 'chk_products_stock', 'stock >= 0');
      await db.addCheck('product_variants', 'chk_variants_stock', 'stock >= 0');
      await pool.query(`UPDATE order_items SET variant_id = NULL
        WHERE variant_id IS NOT NULL AND variant_id NOT IN (SELECT id FROM product_variants)`);
      await db.addForeignKey('order_items', 'fk_order_items_variant', 'variant_id', 'product_variants', 'id', 'SET NULL');
    },
  },
  {
    name: '004_customers',
    async up() {
      await pool.query(`CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(190) NULL,
        password_hash VARCHAR(255) NOT NULL,
        default_city VARCHAR(100) NULL,
        default_address VARCHAR(255) NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_login_at TIMESTAMP NULL DEFAULT NULL,
        UNIQUE KEY uq_customers_phone (phone),
        UNIQUE KEY uq_customers_email (email)
      )`);
    },
  },
  {
    name: '005_orders_tracking_and_totals',
    async up() {
      await db.addColumn('orders', 'order_number', 'VARCHAR(24) NULL');
      await db.addColumn('orders', 'access_token_hash', 'CHAR(64) NULL');
      await db.addColumn('orders', 'customer_id', 'INT NULL');
      await db.addColumn('orders', 'subtotal', 'DECIMAL(12,2) NULL');
      await db.addColumn('orders', 'delivery_fee', 'DECIMAL(10,2) NOT NULL DEFAULT 0');
      await db.addColumn('orders', 'email', 'VARCHAR(190) NULL');
      await db.addColumn('orders', 'paid_at', 'TIMESTAMP NULL DEFAULT NULL');
      await db.addColumn('orders', 'payment_reference', 'VARCHAR(120) NULL');
      await db.addIndex('orders', 'uq_orders_number', 'order_number', true);

      const [rows] = await pool.query('SELECT id FROM orders WHERE order_number IS NULL');
      for (const row of rows) {
        for (let tries = 0; tries < 10; tries += 1) {
          try {
            await pool.query('UPDATE orders SET order_number = ? WHERE id = ?', [randomOrderNumber(), row.id]);
            break;
          } catch (err) {
            if (err.code !== 'ER_DUP_ENTRY') throw err;
          }
        }
      }
      await pool.query('UPDATE orders SET subtotal = total WHERE subtotal IS NULL');
      await pool.query("UPDATE orders SET paid_at = created_at WHERE payment_status = 'paid' AND paid_at IS NULL");
      await pool.query('ALTER TABLE orders MODIFY order_number VARCHAR(24) NOT NULL');
      await pool.query('ALTER TABLE orders MODIFY subtotal DECIMAL(12,2) NOT NULL');
      await db.addIndex('orders', 'idx_orders_customer', 'customer_id');
      await db.addForeignKey('orders', 'fk_orders_customer', 'customer_id', 'customers', 'id', 'SET NULL');
    },
  },
  {
    name: '006_order_items_snapshots',
    async up() {
      await db.addColumn('order_items', 'product_name_en', 'VARCHAR(200) NULL');
      await db.addColumn('order_items', 'product_name_am', 'VARCHAR(200) NULL');
      await db.addColumn('order_items', 'sku', 'VARCHAR(60) NULL');
      await db.addColumn('order_items', 'variant_name_en', 'VARCHAR(100) NULL');
      await db.addColumn('order_items', 'variant_name_am', 'VARCHAR(100) NULL');
      await db.addColumn('order_items', 'image_url', 'VARCHAR(500) NULL');
      await pool.query(`UPDATE order_items oi JOIN products p ON p.id = oi.product_id
        SET oi.product_name_en = p.name_en, oi.product_name_am = p.name_am, oi.sku = p.sku,
            oi.image_url = (SELECT url FROM product_images i WHERE i.product_id = p.id ORDER BY i.sort_order, i.id LIMIT 1)
        WHERE oi.product_name_en IS NULL`);
      await pool.query(`UPDATE order_items oi JOIN product_variants v ON v.id = oi.variant_id
        SET oi.variant_name_en = v.name_en, oi.variant_name_am = v.name_am
        WHERE oi.variant_name_en IS NULL`);
    },
  },
  {
    name: '007_payments',
    async up() {
      await pool.query(`CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        provider ENUM('cod','chapa','telebirr','manual') NOT NULL,
        provider_ref VARCHAR(120) NULL,
        amount DECIMAL(12,2) NOT NULL,
        status ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
        raw_payload JSON NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_payments_provider_ref (provider, provider_ref),
        KEY idx_payments_order (order_id),
        CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )`);
      await pool.query(`INSERT INTO payments (order_id, provider, amount, status)
        SELECT o.id, o.payment_method, o.total, o.payment_status FROM orders o
        WHERE NOT EXISTS (SELECT 1 FROM payments p WHERE p.order_id = o.id)`);
    },
  },
  {
    name: '008_reviews_verified',
    async up() {
      await db.addColumn('reviews', 'is_verified_purchase', 'TINYINT(1) NOT NULL DEFAULT 0');
      await db.addColumn('reviews', 'customer_id', 'INT NULL');
      await db.addIndex('reviews', 'idx_reviews_customer', 'customer_id');
      await db.addForeignKey('reviews', 'fk_reviews_customer', 'customer_id', 'customers', 'id', 'SET NULL');
    },
  },
  {
    name: '009_categories_admin_fields',
    async up() {
      await db.addColumn('categories', 'is_active', 'TINYINT(1) NOT NULL DEFAULT 1');
      await db.addColumn('categories', 'sort_order', 'INT NOT NULL DEFAULT 0');
      await db.addColumn('categories', 'image_url', 'VARCHAR(500) NULL');
      await pool.query('UPDATE categories SET sort_order = id WHERE sort_order = 0');
    },
  },
  {
    name: '010_pages_and_faqs',
    async up() {
      await pool.query(`CREATE TABLE IF NOT EXISTS pages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(80) NOT NULL UNIQUE,
        title_en VARCHAR(200) NOT NULL,
        title_am VARCHAR(200) NULL,
        body_en TEXT NOT NULL,
        body_am TEXT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 0,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`);
      await pool.query(`CREATE TABLE IF NOT EXISTS faqs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question_en VARCHAR(300) NOT NULL,
        question_am VARCHAR(300) NULL,
        answer_en TEXT NOT NULL,
        answer_am TEXT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        is_active TINYINT(1) NOT NULL DEFAULT 1
      )`);
      const draftEn = 'DRAFT. The business has not written this policy yet.';
      const draftAm = 'ረቂቅ። የንግዱ ባለቤት ይህን ፖሊሲ ገና አልጻፈም።';
      const pages = [
        ['delivery-policy', 'Delivery Policy', 'የማድረስ ፖሊሲ'],
        ['return-policy', 'Return and Refund Policy', 'የመመለስና ገንዘብ መመለሻ ፖሊሲ'],
        ['warranty-policy', 'Warranty Policy', 'የዋስትና ፖሊሲ'],
        ['privacy-policy', 'Privacy Policy', 'የግላዊነት ፖሊሲ'],
        ['terms', 'Terms and Conditions', 'ውሎችና ሁኔታዎች'],
      ].map(([slug, en, am]) => [slug, en, am, draftEn, draftAm, 0]);
      await pool.query('INSERT IGNORE INTO pages (slug, title_en, title_am, body_en, body_am, is_active) VALUES ?', [pages]);
    },
  },
  {
    name: '011_hero_slides',
    async up() {
      await pool.query(`CREATE TABLE IF NOT EXISTS hero_slides (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title_en VARCHAR(200) NOT NULL,
        title_am VARCHAR(200) NULL,
        text_en VARCHAR(500) NULL,
        text_am VARCHAR(500) NULL,
        button_en VARCHAR(80) NULL,
        button_am VARCHAR(80) NULL,
        link_url VARCHAR(300) NOT NULL DEFAULT '/shop',
        image_url VARCHAR(500) NOT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_hero_order (sort_order)
      )`);
      const [[row]] = await pool.query('SELECT COUNT(*) AS n FROM hero_slides');
      if (Number(row.n) === 0) {
        await pool.query(
          'INSERT INTO hero_slides (title_en, title_am, text_en, text_am, button_en, button_am, link_url, image_url, sort_order) VALUES ?',
          [HERO_SEED]
        );
      }
    },
  },
  {
    name: '012_admin_usernames',
    async up() {
      await db.addColumn('admins', 'username', 'VARCHAR(40) NULL');
      const [rows] = await pool.query('SELECT id, email FROM admins WHERE username IS NULL ORDER BY id');
      const taken = (await pool.query('SELECT username FROM admins WHERE username IS NOT NULL'))[0];
      const used = new Set(taken.map((r) => r.username));
      for (const r of rows) {
        let base = String(r.email || '').split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, 30);
        if (base.length < 3) base = `${base}admin`.slice(0, 30);
        let name = base;
        let n = 1;
        while (used.has(name)) {
          n += 1;
          name = `${base}${n}`;
        }
        used.add(name);
        await pool.query('UPDATE admins SET username = ? WHERE id = ?', [name, r.id]);
      }
      await pool.query('ALTER TABLE admins MODIFY username VARCHAR(40) NOT NULL');
      await db.addIndex('admins', 'uq_admins_username', 'username', true);
    },
  },
];

async function main() {
  await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    name VARCHAR(120) NOT NULL PRIMARY KEY,
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  const [done] = await pool.query('SELECT name FROM schema_migrations');
  const applied = new Set(done.map((r) => r.name));

  for (const m of migrations) {
    if (applied.has(m.name)) {
      console.log(`skip   ${m.name}`);
      continue;
    }
    console.log(`apply  ${m.name}`);
    await m.up();
    await pool.query('INSERT INTO schema_migrations (name) VALUES (?)', [m.name]);
  }
  console.log('Migrations finished.');
}

main()
  .catch((err) => {
    console.error('Migration failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());