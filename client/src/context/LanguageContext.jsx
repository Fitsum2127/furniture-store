import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { translations } from '../i18n/translations.js';

// Every file inside src/i18n/extra/ is merged automatically. New text goes there, not into translations.js.
const extraModules = import.meta.glob('../i18n/extra/*.js', { eager: true });
const merged = { en: { ...translations.en }, am: { ...translations.am } };
Object.values(extraModules).forEach((m) => {
  const extra = m.default;
  if (extra) {
    Object.assign(merged.en, extra.en);
    Object.assign(merged.am, extra.am);
  }
});

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('lang') === 'am' ? 'am' : 'en';
    } catch (e) {
      return 'en';
    }
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem('lang', lang);
    } catch (e) {
      /* ignore */
    }
  }, [lang]);

  // t('key', { n: 5 }) -> UI text
  const t = useCallback(
    (key, vars = {}) => {
      let str = merged[lang][key] ?? merged.en[key] ?? key;
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, v);
      });
      return str;
    },
    [lang]
  );

  // tr({ en: '...', am: '...' }) -> bilingual data from the database
  const tr = useCallback((obj) => (obj ? obj[lang] || obj.en || '' : ''), [lang]);

  const money = useCallback(
    (n) => (lang === 'am' ? `${Number(n).toLocaleString('en-US')} ብር` : `ETB ${Number(n).toLocaleString('en-US')}`),
    [lang]
  );

  const toggleLang = useCallback(() => setLang((l) => (l === 'en' ? 'am' : 'en')), []);
  const value = useMemo(() => ({ lang, toggleLang, t, tr, money }), [lang, toggleLang, t, tr, money]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLang = () => useContext(LanguageContext);