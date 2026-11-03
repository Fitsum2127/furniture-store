export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export const cleanText = (v) => String(v == null ? '' : v).replace(CONTROL, '').trim();

// Ethiopian mobile numbers only (09XXXXXXXX or 07XXXXXXXX). Returns +2519XXXXXXXX or null.
export function normalizePhone(raw) {
  const s = String(raw == null ? '' : raw).replace(/[\s\-().]/g, '');
  const m = /^(?:\+251|251|0)?([79]\d{8})$/.exec(s);
  return m ? `+251${m[1]}` : null;
}

// Looser check for the contact form (allows foreign numbers).
export const looksLikePhone = (raw) => /^\+?[0-9][0-9\s\-().]{5,19}$/.test(String(raw == null ? '' : raw).trim());

export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v == null ? '' : v));

export function toInt(v, { min = -Infinity, max = Infinity } = {}) {
  let n = NaN;
  if (typeof v === 'number') n = v;
  else if (typeof v === 'string' && /^-?\d+$/.test(v.trim())) n = Number(v.trim());
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
}

// Returns a number with 2 decimals, null for empty, NaN for invalid.
export function toMoney(v) {
  if (v === '' || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && n < 1e9 ? Math.round(n * 100) / 100 : NaN;
}

export const escapeLike = (s) => String(s).replace(/[\\%_]/g, '\\$&');

export function isHttpUrl(s) {
  try {
    const u = new URL(String(s));
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch (err) {
    return false;
  }
}