import { Link } from 'react-router-dom';
import { Phone, Mail, MessageCircle } from 'lucide-react';
import { useLang } from '../context/LanguageContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import useFetch from '../hooks/useFetch.js';
import { api } from '../lib/api.js';

export default function Footer() {
  const { t, tr } = useLang();
  const { settings: s } = useSettings();
  const pages = useFetch(() => api('/content/pages'), []).data || [];
  const social = [['Telegram', s.telegram], ['Facebook', s.facebook], ['Instagram', s.instagram], ['TikTok', s.tiktok]].filter(([, url]) => url);
  const wa = String(s.whatsapp || '').replace(/\D/g, '');
  const [first, ...rest] = String(s.business_name).split(' ');

  return (
    <footer className="border-t border-sand-200 bg-sand-100 pb-24 pt-12 dark:border-stone-800 dark:bg-stone-900 md:pb-10">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <p className="font-display text-xl font-semibold">
            {first} {rest.length > 0 && <span className="text-olive">{rest.join(' ')}</span>}
          </p>
          {social.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-600 dark:text-stone-400">
              {social.map(([name, url]) => (
                <li key={name}><a href={url} target="_blank" rel="noreferrer" className="hover:text-olive">{name}</a></li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">{t('quickLinks')}</p>
          <ul className="space-y-2 text-sm text-stone-600 dark:text-stone-400">
            <li><Link to="/" className="hover:text-olive">{t('home')}</Link></li>
            <li><Link to="/shop" className="hover:text-olive">{t('shop')}</Link></li>
            <li><Link to="/about" className="hover:text-olive">{t('about')}</Link></li>
            <li><Link to="/contact" className="hover:text-olive">{t('contact')}</Link></li>
            <li><Link to="/faq" className="hover:text-olive">{t('faq')}</Link></li>
            <li><Link to="/track" className="hover:text-olive">{t('trackOrder')}</Link></li>
          </ul>
        </div>
        <div>
          {pages.length > 0 && (
            <>
              <p className="mb-3 text-sm font-semibold">{t('policiesLabel')}</p>
              <ul className="space-y-2 text-sm text-stone-600 dark:text-stone-400">
                {pages.map((p) => (
                  <li key={p.slug}><Link to={`/policies/${p.slug}`} className="hover:text-olive">{tr({ en: p.title_en, am: p.title_am })}</Link></li>
                ))}
              </ul>
            </>
          )}
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">{t('contactUs')}</p>
          <ul className="space-y-2 text-sm text-stone-600 dark:text-stone-400">
            {s.phone && <li><a href={`tel:${s.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 hover:text-olive"><Phone size={15} /> {s.phone}</a></li>}
            {wa && <li><a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-olive"><MessageCircle size={15} /> WhatsApp</a></li>}
            {s.email && <li><a href={`mailto:${s.email}`} className="flex items-center gap-2 hover:text-olive"><Mail size={15} /> {s.email}</a></li>}
            {tr({ en: s.address_en, am: s.address_am || s.address_en }) && <li>{tr({ en: s.address_en, am: s.address_am || s.address_en })}</li>}
          </ul>
        </div>
      </div>
      <p className="mt-10 text-center text-xs text-stone-500">© {new Date().getFullYear()} {s.business_name}. {t('footerRights')}</p>
    </footer>
  );
}