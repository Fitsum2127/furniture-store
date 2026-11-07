import multer from 'multer';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { deleteMedia, saveMedia } from '../services/media.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Old photos saved on the server disk before the database storage existed (still served if present).
export const uploadsDir = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(__dirname, '..', '..', 'uploads');
try {
  fs.mkdirSync(uploadsDir, { recursive: true });
} catch (e) {
  /* a read-only disk is fine: new photos go to the database */
}

// The file extension is chosen by the server from the verified type, never from the uploaded file name.
const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

const raw = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
  fileFilter: (_req, file, cb) => cb(null, Boolean(EXT[file.mimetype])),
});

function detectType(buf) {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buf.length >= 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return null;
}

function collectFiles(req) {
  if (req.files) return Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
  return req.file ? [req.file] : [];
}

// Removes photos from the database (used when a request fails after the upload).
export function removeFiles(files) {
  (files || []).forEach((f) => {
    if (f && f.filename) deleteMedia(f.filename).catch(() => {});
  });
}

// Deletes a stored photo by its address, for example /uploads/abc.jpg
export function deleteUploadedFile(url) {
  if (url && String(url).startsWith('/uploads/')) {
    const name = path.basename(String(url));
    deleteMedia(name).catch(() => {});
    fs.unlink(path.join(uploadsDir, name), () => {});
  }
}

// Checks the real file content (not only the type sent by the browser), then saves it in the database.
async function verifyAndStore(req, res, next) {
  const saved = [];
  try {
    const files = collectFiles(req);
    for (const f of files) {
      const type = f.buffer ? detectType(f.buffer) : null;
      if (!type || type !== f.mimetype) {
        return res.status(400).json({ error: 'Only real JPG, PNG or WebP images are allowed.' });
      }
    }
    for (const f of files) {
      const name = `${crypto.randomUUID()}${EXT[f.mimetype]}`;
      await saveMedia({ name, mime: f.mimetype, buffer: f.buffer });
      saved.push(name);
      f.filename = name; // the routes use this name to build /uploads/<name>
      f.buffer = undefined; // free the memory
    }
    return next();
  } catch (err) {
    await Promise.all(saved.map((n) => deleteMedia(n).catch(() => {})));
    return next(err);
  }
}

function guard(middleware) {
  return (req, res, next) =>
    middleware(req, res, (err) => {
      if (!err) return next();
      if (err instanceof multer.MulterError) {
        const message =
          err.code === 'LIMIT_FILE_SIZE'
            ? 'Each image must be 5 MB or smaller.'
            : err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE'
              ? 'Too many images.'
              : 'Upload failed.';
        return res.status(400).json({ error: message });
      }
      return next(err);
    });
}

// router.post('/', uploadImages.single('image'), handler)
export const uploadImages = {
  single: (field) => [guard(raw.single(field)), verifyAndStore],
  array: (field, max = 8) => [guard(raw.array(field, max)), verifyAndStore],
};