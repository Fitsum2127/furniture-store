import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Store, ShoppingBag, Phone, Info } from 'lucide-react';
import { useLang } from '../context/LanguageContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { CategorySheet } from './ShopMenus.jsx';

export default function BottomNav() {
  const { t } = useLang();
  const { count, setOpen } = useCart();
  const { pathname } = useLocation();
  const [sheet, setSheet] = useState(false);

  const item = ({ isActive }) =>
    `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
      isActive ? 'text-olive' : 'text-stone-500 dark:text-stone-400'
    }`;

  const shopActive = pathname.startsWith('/shop');

  return (
    <>
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 flex border-t border-sand-200 bg-sand-50/95 backdrop-blur-md dark:border-stone-800 dark:bg-stone-950/95 md:hidden">
        <NavLink to="/" end className={item}><Home size={21} />{t('home')}</NavLink>

        {/* Tapping Shop opens the list of sections */}
        <button
          onClick={() => setSheet(true)}
          aria-haspopup="dialog"
          className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
            shopActive ? 'text-olive' : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <Store size={21} />
          {t('shop')}
        </button>

        <button
          onClick={() => setOpen(true)}
          className="relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-stone-500 dark:text-stone-400"
        >
          <ShoppingBag size={21} />
          {t('cart')}
          {count > 0 && (
            <span className="absolute right-[28%] top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-olive px-1 text-[10px] font-bold text-white">
              {count}
            </span>
          )}
        </button>

        <NavLink to="/about" className={item}><Info size={21} />{t('about')}</NavLink>
        <NavLink to="/contact" className={item}><Phone size={21} />{t('contact')}</NavLink>
      </nav>

      <CategorySheet open={sheet} onClose={() => setSheet(false)} />
    </>
  );
}