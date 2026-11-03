import { Router } from 'express';
import pool from '../config/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { DEFAULTS, clearSettingsCache, getSettings } from '../services/settings.js';
import { HttpError, cleanText, isEmail, isHttpUrl, looksLikePhone } from '../middleware/validate.js';

const router = Router();

// Public: business information used by the storefront (contact details, delivery, enabled payment methods).
router.get('/', async (_req, res) => {
  res.set('Cache-Control', 'public, max-age=30');
  res.json(await getSettings());
});

export const adminSettingsRouter = Router();
adminSettingsRouter.use(requireAdmin);

adminSettingsRouter.get('/', async (_req, res) => {
  res.json(await getSettings({ fresh: true }));
});

const FLAG_KEYS = ['payment_cod_enabled', 'payment_chapa_enabled', 'payment_telebirr_enabled'];
const URL_KEYS = ['telegram', 'facebook', 'instagram', 'tiktok'];
const NUMBER_KEYS = ['delivery_fee', 'free_delivery_min_subtotal'];

// A gateway can only be switched on after its real credentials and integration exist.
const GATEWAY_ENV = {
  payment_chapa_enabled: ['CHAPA_SECRET_KEY', 'Chapa'],
  payment_telebirr_enabled: ['TELEBIRR_APP_KEY', 'Telebirr'],
};

function validateSetting(key, value) {
  const v = cleanText(value);

  if (FLAG_KEYS.includes(key)) {
    const on = value === true || value === 1 || v === '1' || v.toLowerCase() === 'true';
    const off = value === false || value === 0 || v === '0' || v.toLowerCase() === 'false';
    if (!on && !off) throw new HttpError(400, `Invalid value for ${key}`);
    if (on && GATEWAY_ENV[key] && !process.env[GATEWAY_ENV[key][0]]) {
      throw new HttpError(
        400,
        `${GATEWAY_ENV[key][1]} cannot be enabled yet: its real integration and credentials are not set up.`
      );
    }
    return on ? '1' : '0';
  }

  if (NUMBER_KEYS.includes(key)) {
    if (v === '') return '';
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0 || n > 1e7) throw new HttpError(400, `${key} must be a number from 0 upward`);
    return String(Math.round(n * 100) / 100);
  }

  if (URL_KEYS.includes(key)) {
    if (v === '') return '';
    if (v.length > 300 || !isHttpUrl(v)) throw new HttpError(400, `${key} must be a full link starting with https://`);
    return v;
  }

  switch (key) {
    case 'email':
      if (v !== '' && (!isEmail(v) || v.length > 190)) throw new HttpError(400, 'Invalid email address');
      return v.toLowerCase();
    case 'phone':
      if (v !== '' && !looksLikePhone(v)) throw new HttpError(400, 'Invalid phone number');
      return v;
    case 'whatsapp': {
      const digits = v.replace(/[\s\-()+]/g, '');
      if (digits !== '' && !/^\d{8,15}$/.test(digits)) {
        throw new HttpError(400, 'WhatsApp must be a phone number with country code, for example 2519XXXXXXXX');
      }
      return digits;
    }
    case 'currency':
      if (!/^[A-Z]{3}$/.test(v)) throw new HttpError(400, 'Currency must be a 3-letter code, for example ETB');
      return v;
    case 'business_name':
      if (v.length < 1 || v.length > 100) throw new HttpError(400, 'Business name must be 1 to 100 characters');
      return v;
    default:
      if (v.length > 500) throw new HttpError(400, `${key} must be 500 characters or fewer`);
      return v;
  }
}

adminSettingsRouter.put('/', async (req, res) => {
  const body = req.body || {};
  const entries = [];
  for (const key of Object.keys(DEFAULTS)) {
    if (Object.prototype.hasOwnProperty.call(body, key)) entries.push([key, validateSetting(key, body[key])]);
  }
  if (entries.length === 0) throw new HttpError(400, 'Nothing to update');

  await pool.query(
    'INSERT INTO settings (setting_key, setting_value) VALUES ? ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
    [entries]
  );
  clearSettingsCache();
  res.json(await getSettings({ fresh: true }));
});

export default router;