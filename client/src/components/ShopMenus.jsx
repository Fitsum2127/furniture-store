import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronDown, X } from 'lucide-react';
import { useLang } from '../context/LanguageContext.jsx';
import useCategories from '../hooks/useCategories.js';
import { onImgError } from '../lib/api.js';
import { EASE } from '../lib/motion.js';

// One product in a category: go straight to that product's page. Several: open the category list.
const categoryTarget = (c) => (c.products.length === 1 ? `/product/${c.products[0].id}` : `/shop?category=${c.slug}`);

export function ShopDropdown() {
  const { t, tr, money } = useLang();
  const categories = useCategories().filter((c) => c.count !== 0);
  const { pathname, search } = useLocation();
  const [open, setOpen] = useState(false);
  const timer = useRef(null);

  const show = () => {
    clearTimeout(timer.current);
    setOpen(true);
  };
  const hide = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 200);
  };

  useEffect(() => {
    clearTimeout(timer.current);
    setOpen(false);
  }, [pathname, search]);
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div
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
          `flex items-center gap-1 py-5 text-sm font-medium transition-colors hover:text-olive ${isActive ? 'text-olive' : 'text-stone-600 dark:text-stone-300'}`
        }
      >
        {t('shop')}
        <ChevronDown size={15} className={`transition-transform duration-500 ${open ? 'rotate-180' : ''}`} />
      </NavLink>

      <AnimatePresence>
        {open && categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8, transition: { duration: 0.2 } }}
            transition={{ duration: 0.4, ease: EASE }}
            className="absolute inset-x-0 top-full z-50 max-h-[78vh] overflow-y-auto border-b border-sand-200 bg-white shadow-2xl shadow-stone-900/10 dark:border-stone-800 dark:bg-stone-900"
          >
            <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sand-500">{t('browseByRoom')}</p>
                <Link to="/shop" className="flex items-center gap-1.5 text-sm font-medium text-olive transition-all duration-500 hover:gap-3">
                  {t('allProducts')} <ArrowRight size={14} />
                </Link>
              </div>

              <ul className="grid gap-x-6 gap-y-5 md:grid-cols-3 lg:grid-cols-4">
                {categories.map((c) => {
                  const single = c.products.length === 1;
                  return (
                    <li key={c.slug}>
                      <Link
                        to={categoryTarget(c)}
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
                          <span className="block truncate text-sm font-semibold transition-colors duration-500 group-hover:text-olive">{tr(c.name)}</span>
                          <span className="block truncate text-xs text-stone-500 dark:text-stone-400">
                            {single ? tr(c.products[0].name) : t('resultsN', { n: c.count })}
                          </span>
                        </span>
                      </Link>
                      {!single && c.products.length > 0 && (
                        <ul className="ml-7 mt-1 space-y-0.5 border-l border-sand-200 pl-3 dark:border-stone-700">
                          {c.products.slice(0, 5).map((p) => (
                            <li key={p.id}>
                              <Link
                                to={`/product/${p.id}`}
                                className="flex items-center justify-between gap-2 py-1 text-sm text-stone-600 transition-colors duration-500 hover:text-olive dark:text-stone-300"
                              >
                                <span className="truncate">{tr(p.name)}</span>
                                <span className="flex-none text-xs text-stone-400">{money(p.price)}</span>
                              </Link>
                            </li>
                          ))}
                          {c.products.length > 5 && (
                            <li>
                              <Link to={`/shop?category=${c.slug}`} className="py-1 text-xs font-medium text-olive">
                                {t('viewAll')} ({c.products.length})
                              </Link>
                            </li>
                          )}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CategorySheet({ open, onClose }) {
  const { t, tr, money } = useLang();
  const categories = useCategories().filter((c) => c.count !== 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="overlay" className="fixed inset-0 z-50 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
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
              <button onClick={onClose} aria-label={t('close')} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-sand-100 dark:hover:bg-stone-800">
                <X size={20} />
              </button>
            </div>
            <Link to="/shop" onClick={onClose} className="mb-4 flex items-center justify-between rounded-xl bg-olive px-4 py-3 text-sm font-semibold text-white">
              {t('allProducts')} <ArrowRight size={16} />
            </Link>

            <ul className="space-y-5">
              {categories.map((c) => (
                <li key={c.slug}>
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-sm font-semibold">{tr(c.name)}</p>
                    {c.products.length > 1 && (
                      <Link to={`/shop?category=${c.slug}`} onClick={onClose} className="text-xs font-medium text-olive">
                        {t('viewAll')}
                      </Link>
                    )}
                  </div>
                  <ul className="space-y-1">
                    {c.products.map((p) => (
                      <li key={p.id}>
                        <Link to={`/product/${p.id}`} onClick={onClose} className="flex items-center gap-3 rounded-xl p-2 hover:bg-sand-100 dark:hover:bg-stone-800">
                          <img src={p.image} alt="" loading="lazy" onError={onImgError} className="h-12 w-12 flex-none rounded-lg object-cover" />
                          <span className="min-w-0 flex-1 truncate text-sm">{tr(p.name)}</span>
                          <span className="flex-none text-xs text-stone-500">{money(p.price)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}