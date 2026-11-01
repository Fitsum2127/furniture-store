import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import PageTransition from '../components/PageTransition.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { useLang } from '../context/LanguageContext.jsx';
import useFetch from '../hooks/useFetch.js';
import { api, normalizeProduct } from '../lib/api.js';

export default function Shop() {
  const { t, tr, money } = useLang();
  const [params, setParams] = useSearchParams();

  const category = params.get('category') || '';
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';
  const q = params.get('q') || '';
  const sort = params.get('sort') || 'newest';

  const [qInput, setQInput] = useState(q);
  const [minIn, setMinIn] = useState(minPrice);
  const [maxIn, setMaxIn] = useState(maxPrice);
  const [sheet, setSheet] = useState(false);

  const setParam = (patch) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(patch).forEach(([k, v]) => {
          if (v === '' || v == null) next.delete(k);
          else next.set(k, String(v));
        });
        return next;
      },
      { replace: true }
    );

  // Search as you type (waits 400 ms after the last key press).
  useEffect(() => {
    const id = setTimeout(() => {
      if (qInput.trim() !== q) setParam({ q: qInput.trim() });
    }, 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qInput]);

  const queryString = params.toString();
  const { data, loading, error, retry } = useFetch(
    () => api(`/products${queryString ? `?${queryString}` : ''}`),
    [queryString]
  );
  const cats = useFetch(() => api('/categories'), []);
  const products = (data || []).map(normalizeProduct);
  const activeCat = (cats.data || []).find((c) => c.slug === category);

  const presets = [
    { id: 'any', min: '', max: '', label: t('anyPrice') },
    { id: 'p1', min: '', max: '1000', label: t('priceUnder', { x: money(1000) }) },
    { id: 'p2', min: '1000', max: '5000', label: t('priceBetween', { a: money(1000), b: money(5000) }) },
    { id: 'p3', min: '5000', max: '20000', label: t('priceBetween', { a: money(5000), b: money(20000) }) },
    { id: 'p4', min: '20000', max: '', label: t('priceOver', { x: money(20000) }) },
  ];

  const applyPreset = (p) => {
    setMinIn(p.min);
    setMaxIn(p.max);
    setParam({ minPrice: p.min, maxPrice: p.max });
  };

  const applyCustom = () => setParam({ minPrice: minIn, maxPrice: maxIn });

  const clearAll = () => {
    setQInput('');
    setMinIn('');
    setMaxIn('');
    setParams({}, { replace: true });
  };

  const hasFilters = Boolean(category || minPrice || maxPrice || q);

  const filtersPanel = (
    <div className="space-y-7">
      <div>
        <h3 className="mb-3 text-sm font-semibold">{t('category')}</h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => setParam({ category: '' })}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                !category ? 'bg-olive text-white' : 'hover:bg-sand-100 dark:hover:bg-stone-800'
              }`}
            >
              {t('allCategories')}
            </button>
          </li>
          {(cats.data || []).map((c) => (
            <li key={c.slug}>
              <button
                onClick={() => setParam({ category: c.slug })}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                  category === c.slug ? 'bg-olive text-white' : 'hover:bg-sand-100 dark:hover:bg-stone-800'
                }`}
              >
                <span>{tr({ en: c.name_en, am: c.name_am })}</span>
                <span className="text-xs opacity-70">{c.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold">{t('price')}</h3>
        <ul className="space-y-1">
          {presets.map((p) => {
            const on = p.min === minPrice && p.max === maxPrice;
            return (
              <li key={p.id}>
                <button
                  onClick={() => applyPreset(p)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                    on ? 'bg-olive text-white' : 'hover:bg-sand-100 dark:hover:bg-stone-800'
                  }`}
                >
                  {p.label}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={minIn}
            onChange={(e) => setMinIn(e.target.value)}
            placeholder={t('minPrice')}
            aria-label={t('minPrice')}
            className="w-full rounded-lg border border-sand-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-olive dark:border-stone-700"
          />
          <span className="text-stone-400">–</span>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={maxIn}
            onChange={(e) => setMaxIn(e.target.value)}
            placeholder={t('maxPrice')}
            aria-label={t('maxPrice')}
            className="w-full rounded-lg border border-sand-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-olive dark:border-stone-700"
          />
        </div>
        <button
          onClick={applyCustom}
          className="mt-2 w-full rounded-lg border border-olive py-2 text-sm font-medium text-olive transition hover:bg-olive hover:text-white"
        >
          {t('apply')}
        </button>
      </div>

      {hasFilters && (
        <button onClick={clearAll} className="text-sm font-medium text-olive underline">
          {t('clearFilters')}
        </button>
      )}
    </div>
  );

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold sm:text-4xl">
          {activeCat ? tr({ en: activeCat.name_en, am: activeCat.name_am }) : t('shopTitle')}
        </h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">{t('shopSub')}</p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              placeholder={t('searchPlaceholder')}
              aria-label={t('searchPlaceholder')}
              className="w-full rounded-full border border-sand-300 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-olive dark:border-stone-700 dark:bg-stone-900"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setSheet(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-sand-300 px-5 py-3 text-sm font-medium dark:border-stone-700 sm:flex-none lg:hidden"
            >
              <SlidersHorizontal size={16} /> {t('filters')}
            </button>
            <select
              value={sort}
              onChange={(e) => setParam({ sort: e.target.value === 'newest' ? '' : e.target.value })}
              aria-label={t('sortBy')}
              className="flex-1 rounded-full border border-sand-300 bg-white px-4 py-3 text-sm outline-none focus:border-olive dark:border-stone-700 dark:bg-stone-900 sm:flex-none"
            >
              <option value="newest">{t('sortNewest')}</option>
              <option value="price_asc">{t('sortPriceAsc')}</option>
              <option value="price_desc">{t('sortPriceDesc')}</option>
            </select>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[250px_1fr]">
          <aside className="hidden lg:block">{filtersPanel}</aside>

          <div>
            {!loading && !error && (
              <p className="mb-4 text-sm text-stone-500 dark:text-stone-400">{t('resultsN', { n: products.length })}</p>
            )}

            {error ? (
              <div className="rounded-2xl border border-sand-200 p-10 text-center text-sm dark:border-stone-800">
                <p>{t('errorLoad')}</p>
                <button onClick={retry} className="mt-3 font-medium text-olive underline">{t('retry')}</button>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square rounded-2xl bg-sand-100 dark:bg-stone-900" />
                    <div className="mt-3 h-3 w-2/3 rounded bg-sand-100 dark:bg-stone-900" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-sand-300 p-12 text-center dark:border-stone-700">
                <p className="text-stone-600 dark:text-stone-400">{t('noResults')}</p>
                <button onClick={clearAll} className="mt-3 text-sm font-medium text-olive underline">
                  {t('clearFilters')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {products.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter sheet */}
      <AnimatePresence>
        {sheet && (
          <>
            <motion.div
              key="overlay"
              className="fixed inset-0 z-50 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheet(false)}
            />
            <motion.div
              key="sheet"
              className="pb-safe fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-6 dark:bg-stone-900"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 36 }}
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-semibold">{t('filters')}</h2>
                <button
                  onClick={() => setSheet(false)}
                  aria-label={t('close')}
                  className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-sand-100 dark:hover:bg-stone-800"
                >
                  <X size={20} />
                </button>
              </div>
              {filtersPanel}
              <button
                onClick={() => setSheet(false)}
                className="mt-7 w-full rounded-full bg-olive py-3.5 font-semibold text-white"
              >
                {t('showResults')}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}