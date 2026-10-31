import bcrypt from 'bcryptjs';
import pool from '../src/config/db.js';

const [email, password, ...nameParts] = process.argv.slice(2);

if (!email || !password) {
  console.log("Usage: node scripts/createAdmin.js email 'password' Name");
  process.exit(1);
}
if (password.length < 8) {
  console.log('The password must have at least 8 characters.');
  process.exit(1);
}

const name = nameParts.join(' ') || 'Admin';
const hash = await bcrypt.hash(password, 12);

await pool.query(
  `INSERT INTO admins (name, email, password_hash) VALUES (?, ?, ?)
   ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash)`,
  [name, email.trim().toLowerCase(), hash]
);

console.log(`Admin saved: ${email}`);
await pool.end();