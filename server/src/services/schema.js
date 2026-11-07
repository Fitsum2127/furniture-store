import pool from '../config/db.js';

// Makes sure the tables and columns added after the first release exist. Safe to run many times.
let running = null;

async function run() {
  await pool.query(`CREATE TABLE IF NOT EXISTS media (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE,
    mime VARCHAR(40) NOT NULL,
    size INT NOT NULL,
    data LONGBLOB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);

  const [tables] = await pool.query("SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'admins'");
  if (tables.length) {
    const [cols] = await pool.query(
      "SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'admins' AND COLUMN_NAME = 'avatar_url'"
    );
    if (cols.length === 0) await pool.query('ALTER TABLE admins ADD COLUMN avatar_url VARCHAR(500) NULL');
  }
}

export function ensureSchema() {
  if (!running) {
    running = run().catch((err) => {
      running = null; // try again on the next call
      console.error('Schema check failed:', err.message);
    });
  }
  return running;
}

ensureSchema();