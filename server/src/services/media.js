import pool from '../config/db.js';
import { ensureSchema } from './schema.js';

// Photos are stored in the database, so they survive host restarts.
export async function saveMedia({ name, mime, buffer }) {
  await ensureSchema();
  await pool.query('INSERT INTO media (name, mime, size, data) VALUES (?, ?, ?, ?)', [name, mime, buffer.length, buffer]);
}

export async function getMedia(name) {
  await ensureSchema();
  const [rows] = await pool.query('SELECT mime, data FROM media WHERE name = ?', [name]);
  return rows[0] || null;
}

export async function deleteMedia(name) {
  await ensureSchema();
  await pool.query('DELETE FROM media WHERE name = ?', [name]);
}