import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useLang } from '../../context/LanguageContext.jsx';
import useFetch from '../../hooks/useFetch.js';
import { api } from '../../lib/api.js';

// Real, approved customer reviews only. If there are none, this section is not shown at all.
export default function Testimonials() {
  const { t, tr } = useLang();
  const ref = useRef(null);
  const { data } = useFetch(() => api('/home/testimonials'), []);
  if (!data || data.length === 0) return null;

  const scrollByDir = (dir) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' });
  };

  return (
    <section className="bg-sand-100/60 py-16 dark:bg-stone-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sand-500">{t('whatCustomersSay')}</p>
          <h2 className="mt-2 text-3xl font-semibold">{t('customerReviews')}</h2>
          <div className="mx-auto mt-3 h-0.5 w-10 bg-sand-400" />
        </div>

        <div className="relative mt-10">
          <button onClick={() => scrollByDir(-1)} aria-label={t('previous')} className="absolute -left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md hover:bg-sand-100 dark:bg-stone-800 md:flex lg:-left-5">
            <ChevronLeft size={18} />
          </button>
          <div ref={ref} className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth">
            {data.map((r) => (
              <figure key={r.id} className="w-[85%] flex-none snap-start rounded-xl bg-white p-6 shadow-sm dark:bg-stone-900 sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={14} className={n <= r.rating_overall ? 'fill-amber-400 text-amber-400' : 'text-sand-300 dark:text-stone-600'} />
                  ))}
                </div>
                <blockquote className="mt-3 line-clamp-5 whitespace-pre-wrap text-sm leading-relaxed text-stone-700 dark:text-stone-300">“{r.body}”</blockquote>
                <figcaption className="mt-5">
                  <span className="flex items-center gap-1.5 text-sm font-semibold">
                    {r.author_name}
                    {r.is_verified_purchase && <BadgeCheck size={15} className="text-olive" />}
                  </span>
                  <Link to={`/product/${r.product_id}`} className="text-xs text-stone-500 hover:text-olive dark:text-stone-400">
                    {t('reviewOn', { product: tr({ en: r.name_en, am: r.name_am }) })}
                  </Link>
                </figcaption>
              </figure>
            ))}
          </div>
          <button onClick={() => scrollByDir(1)} aria-label={t('next')} className="absolute -right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md hover:bg-sand-100 dark:bg-stone-800 md:flex lg:-right-5">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}