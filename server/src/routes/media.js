import { Router } from 'express';
import { getMedia } from '../services/media.js';

const router = Router();

// GET /uploads/<name>: sends a photo stored in the database. Anything else falls through to the old disk folder.
router.get('/:name', async (req, res, next) => {
  const { name } = req.params;
  if (!/^[a-f0-9-]{36}\.(jpg|png|webp)$/.test(name)) return next();
  const media = await getMedia(name);
  if (!media) return next();
  res.set({
    'Content-Type': media.mime,
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
    'Cross-Origin-Resource-Policy': 'cross-origin',
  });
  return res.send(media.data);
});

export default router;