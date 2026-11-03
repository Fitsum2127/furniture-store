import pool from '../config/db.js';

// Business settings. Empty values mean "the client has not provided this yet".
export const DEFAULTS = {
  business_name: 'Bete Furniture',
  phone: '',
  whatsapp: '',
  email: '',
  telegram: '',
  facebook: '',
  instagram: '',
  tiktok: '',
  address_en: '',
  address_am: '',
  hours_en: '',
  hours_am: '',
  currency: 'ETB',
  delivery_fee: '0',
  free_delivery_cities: '',
  free_delivery_min_subtotal: '',
  payment_cod_enabled: '1',
  payment_chapa_enabled: '0',
  payment_telebirr_enabled: '0',
};

let cache = { at: 0, data: null };

export async function getSettings({ fresh = false } = {}) {
  if (!fresh && cache.data && Date.now() - cache.at < 15000) return cache.data;
  const [rows] = await pool.query('SELECT setting_key, setting_value FROM settings');
  const data = { ...DEFAULTS };
  rows.forEach((r) => {
    if (Object.prototype.hasOwnProperty.call(DEFAULTS, r.setting_key)) {
      data[r.setting_key] = r.setting_value == null ? '' : String(r.setting_value);
    }
  });
  cache = { at: Date.now(), data };
  return data;
}

export function clearSettingsCache() {
  cache = { at: 0, data: null };
}

// Delivery rules set by the business: free in listed cities, free above a minimum, otherwise a flat fee.
export function calcDeliveryFee(settings, { city, subtotal }) {
  const freeCities = String(settings.free_delivery_cities || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (city && freeCities.includes(String(city).trim().toLowerCase())) return 0;

  const min = Number(settings.free_delivery_min_subtotal);
  if (Number.isFinite(min) && min > 0 && subtotal >= min) return 0;

  const fee = Number(settings.delivery_fee);
  return Number.isFinite(fee) && fee > 0 ? Math.round(fee * 100) / 100 : 0;
}