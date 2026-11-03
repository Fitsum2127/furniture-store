import { createContext, useContext, useMemo } from 'react';
import useFetch from '../hooks/useFetch.js';
import { api } from '../lib/api.js';

const DEFAULTS = {
  business_name: 'Bete Furniture', phone: '', whatsapp: '', email: '', telegram: '', facebook: '', instagram: '', tiktok: '',
  address_en: '', address_am: '', hours_en: '', hours_am: '', currency: 'ETB', delivery_fee: '0',
  free_delivery_cities: '', free_delivery_min_subtotal: '', payment_cod_enabled: '1', payment_chapa_enabled: '0', payment_telebirr_enabled: '0',
};

export const splitList = (s) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean);

// Same rule as the server. The server calculates the real fee when the order is placed.
export function calcDeliveryFee(settings, { city, subtotal }) {
  if (city && splitList(settings.free_delivery_cities).map((c) => c.toLowerCase()).includes(String(city).trim().toLowerCase())) return 0;
  const min = Number(settings.free_delivery_min_subtotal);
  if (Number.isFinite(min) && min > 0 && subtotal >= min) return 0;
  const fee = Number(settings.delivery_fee);
  return Number.isFinite(fee) && fee > 0 ? fee : 0;
}

const SettingsContext = createContext({ settings: DEFAULTS, loaded: false });

export function SettingsProvider({ children }) {
  const { data } = useFetch(() => api('/settings'), []);
  const value = useMemo(() => ({ settings: { ...DEFAULTS, ...(data || {}) }, loaded: Boolean(data) }), [data]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);