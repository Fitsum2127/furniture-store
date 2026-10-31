import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLang } from '../../context/LanguageContext.jsx';
import useFetch from '../../hooks/useFetch.js';
import { api, normalizeProduct } from '../../lib/api.js';
import ProductCard from '../ProductCard.jsx';

export default function CustomerFavorites() {
  const { t } = useLang();
  const { data, loading, error, retry } = useFetch(() => api('/products?sort=price_asc'), []);
  const products = (data || []).slice(0, 5).map(normalizeProduct);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sand-500">{t('bestSellers')}</p>
        <h2 className="mt-2 text-3xl font-semibold">{t('customerFavorites')}</h2>
        <div className="mx-auto mt-3 h-0.5 w-10 bg-sand-400" />
      </div>

      {error ? (
        <div className="mt-10 text-center text-sm text-stone-600 dark:text-stone-400">
          <p>{t('errorLoad')}</p>
          <button onClick={retry} className="mt-3 font-medium text-olive underline">{t('retry')}</button>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square rounded-2xl bg-sand-100 dark:bg-stone-900" />
                  <div className="mt-3 h-3 w-2/3 rounded bg-sand-100 dark:bg-stone-900" />
                </div>
              ))
            : products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      )}

      <div className="mt-10 text-center">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2.5 rounded-lg bg-olive px-6 py-3 text-sm font-medium text-white transition hover:bg-olive-dark"
        >
          {t('viewAll')}
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/25">
            <ArrowRight size={14} />
          </span>
        </Link>
      </div>
    </section>
  );
}