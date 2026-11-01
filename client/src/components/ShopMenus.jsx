import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronDown, X } from 'lucide-react';
import { useLang } from '../context/LanguageContext.jsx';
import useCategories from '../hooks/useCategories.js';
import { onImgError } from '../lib/api.js';
import { EASE } from '../lib/motion.js';

/* ---------- Desktop: hover dropdown under "Shop" ---------- */
export function ShopDropdown() {
  const { t, tr } = useLang();
  const categories = useCategories();
  const { pathname, search } = useLocation();
  const [open, setOpen] = useState(false);
  const timer = useRef(null);

  const show = () => {
    clearTimeout(timer.current);
    setOpen(true);
  };
  const hide = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 200); // small delay so the menu does not flicker
  };

  // Close when the page changes.
  useEffect(() => {
    clearTimeout(timer.current);
    setOpen(false);
  }, [pathname, search]);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div
      className="relative"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) hide();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') setOpen(false);
      }}
    >
      <NavLink
        to="/shop"
        aria-haspopup="true"
        aria-expanded={open}
        className={({ isActive }) =>
          `flex items-center gap-1 py-5 text-sm font-medium transition-colors hover:text-olive ${
            isActive ? 'text-olive' : 'text-stone-600 dark:text-stone-300'
          }`
        }
      >
        {t('shop')}
        <ChevronDown size={15} className={`transition-transform duration-500 ${open ? 'rotate-180' : ''}`} />
      </NavLink>

      <AnimatePresence>
        {open && (
          <div className="absolute left-1/2 top-full z-50 w-[580px] -translate-x-1/2 pt-1">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8, transition: { duration: 0.2 } }}
              transition={{ duration: 0.4, ease: EASE }}
              className="rounded-2xl border border-sand-200 bg-white p-5 shadow-2xl shadow-stone-900/10 dark:border-stone-800 dark:bg-stone-900"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sand-500">{t('browseByRoom')}</p>
                <Link
                  to="/shop"
                  className="group flex items-center gap-1.5 text-sm font-medium text-olive transition-all duration-500 hover:gap-3"
                >
                  {t('allProducts')} <ArrowRight size={14} />
                </Link>
              </div>

              <ul className="grid grid-cols-2 gap-1">
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link
                      to={`/shop?category=${c.slug}`}
                      className="group flex items-center gap-3 rounded-xl p-2 transition-colors duration-500 hover:bg-sand-100 dark:hover:bg-stone-800"
                    >
                      <span className="h-12 w-12 flex-none overflow-hidden rounded-lg bg-sand-100 dark:bg-stone-800">
                        <img
                          src={c.image}
                          alt=""
                          loading="lazy"
                          onError={onImgError}
                          className="h-full w-full object-cover transition duration-[1400ms] ease-out group-hover:scale-125"
                        />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium transition-colors duration-500 group-hover:text-olive">
                          {tr(c.name)}
                        </span>
                        {Number.isFinite(c.count) && (
                          <span className="block text-xs text-stone-500 dark:text-stone-400">
                            {t('resultsN', { n: c.count })}
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Phone: bottom sheet opened from the bottom bar ---------- */
export function CategorySheet({ open, onClose }) {
  const { t, tr } = useLang();
  const categories = useCategories();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            className="fixed inset-0 z-50 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            role="dialog"
            aria-label={t('browseByRoom')}
            className="pb-safe fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5 dark:bg-stone-900"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 32 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">{t('browseByRoom')}</h2>
              <button
                onClick={onClose}
                aria-label={t('close')}
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-sand-100 dark:hover:bg-stone-800"
              >
                <X size={20} />
              </button>
            </div>

            <Link
              to="/shop"
              onClick={onClose}
              className="mb-4 flex items-center justify-between rounded-xl bg-olive px-4 py-3 text-sm font-semibold text-white"
            >
              {t('allProducts')} <ArrowRight size={16} />
            </Link>

            <ul className="grid grid-cols-2 gap-3">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link to={`/shop?category=${c.slug}`} onClick={onClose} className="group block">
                    <span className="block overflow-hidden rounded-xl bg-sand-100 dark:bg-stone-800">
                      <img
                        src={c.image}
                        alt=""
                        loading="lazy"
                        onError={onImgError}
                        className="aspect-[4/3] w-full object-cover"
                      />
                    </span>
                    <span className="mt-2 block text-sm font-medium">{tr(c.name)}</span>
                    {Number.isFinite(c.count) && (
                      <span className="block text-xs text-stone-500 dark:text-stone-400">
                        {t('resultsN', { n: c.count })}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}