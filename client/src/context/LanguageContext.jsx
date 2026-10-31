// client/src/context/LanguageContext.jsx
import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { translations } from '../i18n/translations.js';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('lang') === 'am' ? 'am' : 'en'; } catch (e) { return 'en'; }
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem('lang', lang); } catch (e) { /* ignore */ }
  }, [lang]);

  // t('key', { n: 5 }) -> UI string
  const t = useCallback(
    (key, vars = {}) => {
      let str = translations[lang][key] ?? translations.en[key] ?? key;
      Object.entries(vars).forEach(([k, v]) => { str = str.replace(`{${k}}`, v); });
      return str;
    },
    [lang]
  );

  // tr({ en: '...', am: '...' }) -> bilingual data field
  const tr = useCallback((obj) => (obj ? obj[lang] ?? obj.en ?? '' : ''), [lang]);

  const money = useCallback(
    (n) => (lang === 'am' ? `${Number(n).toLocaleString('en-US')} ብር` : `ETB ${Number(n).toLocaleString('en-US')}`),
    [lang]
  );

  const toggleLang = useCallback(() => setLang((l) => (l === 'en' ? 'am' : 'en')), []);
  const value = useMemo(() => ({ lang, toggleLang, t, tr, money }), [lang, toggleLang, t, tr, money]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLang = () => useContext(LanguageContext);