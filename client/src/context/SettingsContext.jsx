import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import useFetch from '../hooks/useFetch.js';
import { api, assetUrl } from '../lib/api.js';

const DEFAULTS = {
  business_name: 'Bete Furniture', phone: '', whatsapp: '', email: '', telegram: '', facebook: '', instagram: '', tiktok: '',
  address_en: '', address_am: '', hours_en: '', hours_am: '', map_query: '', currency: 'ETB', delivery_fee: '0',
  free_delivery_cities: '', free_delivery_min_subtotal: '', payment_cod_enabled: '1', payment_chapa_enabled: '0', payment_telebirr_enabled: '0',
  logo_url: '', favicon_url: '',
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

const SettingsContext = createContext({ settings: DEFAULTS, loaded: false, reload: () => {} });

export function SettingsProvider({ children }) {
  const { data, retry } = useFetch(() => api('/settings'), []);
  const [bad, setBad] = useState([]); // image addresses whose file is missing

  // Check that the logo and the icon files really exist.
  useEffect(() => {
    if (!data) return;
    ['logo_url', 'favicon_url'].forEach((key) => {
      const raw = data[key];
      const url = assetUrl(raw);
      if (!url) return;
      const img = new Image();
      img.onerror = () => setBad((prev) => (prev.includes(raw) ? prev : [...prev, raw]));
      img.src = url;
    });
  }, [data]);

  const settings = useMemo(() => {
    const s = { ...DEFAULTS, ...(data || {}) };
    if (bad.includes(s.logo_url)) s.logo_url = '';
    if (bad.includes(s.favicon_url)) s.favicon_url = '';
    return s;
  }, [data, bad]);

  // The icon in the browser tab comes from the settings (the admin can change it).
  useEffect(() => {
    const href = assetUrl(settings.favicon_url || settings.logo_url);
    if (!href) return;
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.removeAttribute('type');
    link.href = href;
  }, [settings.favicon_url, settings.logo_url]);

  const value = useMemo(() => ({ settings, loaded: Boolean(data), reload: retry }), [settings, data, retry]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);