import { Link, NavLink } from 'react-router-dom';
import { Sun, Moon, ShoppingBag, Languages, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useLang } from '../context/LanguageContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useCustomerAuth } from '../context/CustomerAuthContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { assetUrl } from '../lib/api.js';
import { ShopDropdown } from './ShopMenus.jsx';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang, t } = useLang();
  const { count, setOpen } = useCart();
  const { customer } = useCustomerAuth();
  const { settings } = useSettings();
  const [first, ...rest] = String(settings.business_name).split(' ');
  const logo = assetUrl(settings.logo_url);

  const linkClass = ({ isActive }) => `text-sm font-medium transition-colors hover:text-olive ${isActive ? 'text-olive' : 'text-stone-600 dark:text-stone-300'}`;
  const iconBtn = 'flex h-10 w-10 items-center justify-center rounded-full hover:bg-sand-100 dark:hover:bg-stone-800';

  return (
    <header className="sticky top-0 z-40 border-b border-sand-200/70 bg-sand-50/85 backdrop-blur-md dark:border-stone-800 dark:bg-stone-950/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 font-display text-xl font-semibold tracking-tight">
          {logo && <img src={logo} alt="" className="h-9 w-auto max-w-[8rem] object-contain" />}
          <span>
            {first} {rest.length > 0 && <span className="text-olive">{rest.join(' ')}</span>}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/" className={linkClass} end>{t('home')}</NavLink>
          <ShopDropdown />
          <NavLink to="/about" className={linkClass}>{t('about')}</NavLink>
          <NavLink to="/contact" className={linkClass}>{t('contact')}</NavLink>
        </nav>

        <div className="flex items-center gap-1.5">
          <button onClick={toggleLang} aria-label={t('language')} className="flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium hover:bg-sand-100 dark:hover:bg-stone-800">
            <Languages size={18} />
            <span>{lang === 'en' ? 'አማርኛ' : 'EN'}</span>
          </button>
          <button onClick={toggleTheme} aria-label={t('theme')} className={iconBtn}>{theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}</button>
          <Link to={customer ? '/account' : '/login'} aria-label={customer ? t('myAccount') : t('login')} className={`${iconBtn} ${customer ? 'text-olive' : ''}`}><User size={19} /></Link>
          <button onClick={() => setOpen(true)} aria-label={t('cart')} className={`relative ${iconBtn}`}>
            <ShoppingBag size={20} />
            {count > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-olive px-1 text-[11px] font-semibold text-white">{count}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}