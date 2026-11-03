import multer from 'multer';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// On a real host, point UPLOADS_DIR at a permanent disk (see the deployment guide at the end).
export const uploadsDir = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

const raw = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${EXT[file.mimetype]}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
  fileFilter: (_req, file, cb) => cb(null, Boolean(EXT[file.mimetype])),
});

function detectType(buf) {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buf.length >= 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return null;
}

async function readHead(filePath) {
  const handle = await fsp.open(filePath, 'r');
  try {
    const buf = Buffer.alloc(12);
    const { bytesRead } = await handle.read(buf, 0, 12, 0);
    return buf.subarray(0, bytesRead);
  } finally {
    await handle.close();
  }
}

export function removeFiles(files) {
  (files || []).forEach((f) => fs.unlink(f.path, () => {}));
}

export function deleteUploadedFile(url) {
  if (url && String(url).startsWith('/uploads/')) {
    fs.unlink(path.join(uploadsDir, path.basename(url)), () => {});
  }
}

function collectFiles(req) {
  if (req.files) return Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
  return req.file ? [req.file] : [];
}

async function verify(req, res, next) {
  try {
    const files = collectFiles(req);
    for (const f of files) {
      const type = detectType(await readHead(f.path));
      if (!type || type !== f.mimetype) {
        removeFiles(files);
        return res.status(400).json({ error: 'Only real JPG, PNG or WebP images are allowed.' });
      }
    }
    return next();
  } catch (err) {
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

export const uploadImages = {
  single: (field) => [guard(raw.single(field)), verify],
  array: (field, max = 8) => [guard(raw.array(field, max)), verify],
};