import { Link } from 'react-router-dom';
import { Phone, Mail } from 'lucide-react';
import { useLang } from '../context/LanguageContext.jsx';
import { STORE } from '../config.js';

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="border-t border-sand-200 bg-sand-100 pb-24 pt-12 dark:border-stone-800 dark:bg-stone-900 md:pb-10">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="font-display text-xl font-semibold">
            Bete <span className="text-olive">Furniture</span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-stone-600 dark:text-stone-400">{t('footerAbout')}</p>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">{t('quickLinks')}</p>
          <ul className="space-y-2 text-sm text-stone-600 dark:text-stone-400">
            <li><Link to="/" className="hover:text-olive">{t('home')}</Link></li>
            <li><Link to="/shop" className="hover:text-olive">{t('shop')}</Link></li>
            <li><Link to="/about" className="hover:text-olive">{t('about')}</Link></li>
            <li><Link to="/contact" className="hover:text-olive">{t('contact')}</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">{t('contactUs')}</p>
          <ul className="space-y-2 text-sm text-stone-600 dark:text-stone-400">
            <li>
              <a href={`tel:${STORE.phone}`} className="flex items-center gap-2 hover:text-olive">
                <Phone size={15} /> {STORE.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${STORE.email}`} className="flex items-center gap-2 hover:text-olive">
                <Mail size={15} /> {STORE.email}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <p className="mt-10 text-center text-xs text-stone-500 dark:text-stone-500">
        © {new Date().getFullYear()} {STORE.name}. {t('footerRights')}
      </p>
    </footer>
  );
}