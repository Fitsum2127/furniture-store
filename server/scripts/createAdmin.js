import bcrypt from 'bcryptjs';
import pool from '../src/config/db.js';

const [username, email, password, ...nameParts] = process.argv.slice(2);

if (!username || !email || !password) {
  console.log("Usage: node scripts/createAdmin.js USERNAME EMAIL 'PASSWORD' Name");
  process.exit(1);
}
if (!/^[a-z0-9._-]{3,40}$/.test(username)) {
  console.log('The username must be 3 to 40 characters: lowercase letters, numbers, dots, dashes or underscores.');
  process.exit(1);
}
if (!email.includes('@')) {
  console.log('Please give a valid email address as the second value.');
  process.exit(1);
}
if (password.length < 10) {
  console.log('The password must have at least 10 characters.');
  process.exit(1);
}

const name = nameParts.join(' ') || 'Admin';
const hash = await bcrypt.hash(password, 12);

await pool.query(
  `INSERT INTO admins (name, username, email, password_hash) VALUES (?, ?, ?, ?)
   ON DUPLICATE KEY UPDATE name = VALUES(name), username = VALUES(username), password_hash = VALUES(password_hash)`,
  [name, username.toLowerCase(), email.trim().toLowerCase(), hash]
);

console.log(`Admin saved: ${username}`);
await pool.end();