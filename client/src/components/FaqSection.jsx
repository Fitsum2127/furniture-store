import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';
import { useLang } from '../context/LanguageContext.jsx';
import useFetch from '../hooks/useFetch.js';
import { api } from '../lib/api.js';
import { EASE } from '../lib/motion.js';

// Questions and answers come from the database (Admin > Policies & FAQ). Nothing is invented here.
export default function FaqSection({ limit = 0, hideWhenEmpty = false, headingTag = 'h2' }) {
  const { t, tr } = useLang();
  const { data, loading, error } = useFetch(() => api('/content/faqs'), []);
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState(undefined); // undefined = the first question is open

  const Heading = headingTag;
  const all = useMemo(
    () =>
      (data || []).map((f) => ({
        id: f.id,
        question: tr({ en: f.question_en, am: f.question_am || f.question_en }),
        answer: tr({ en: f.answer_en, am: f.answer_am || f.answer_en }),
      })),
    [data, tr]
  );

  const query = q.trim().toLowerCase();
  const filtered = query ? all.filter((f) => `${f.question} ${f.answer}`.toLowerCase().includes(query)) : all;
  const shown = !query && limit > 0 ? filtered.slice(0, limit) : filtered;
  const hasMore = !query && limit > 0 && filtered.length > limit;
  const activeId = openId === undefined && shown.length > 0 ? shown[0].id : openId;

  if (hideWhenEmpty && (loading || error || all.length === 0)) return null;

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <span className="inline-block rounded-full border border-sand-300 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-olive dark:border-stone-700">
          {t('faq')}
        </span>
        <Heading className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">{t('faqHeading')}</Heading>
        <p className="mt-3 text-stone-500 dark:text-stone-400 sm:text-lg">{t('faqSub')}</p>
      </div>

      <div className="relative mt-10">
        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('faqSearchPh')}
          aria-label={t('faqSearchPh')}
          className="w-full rounded-full border border-sand-300 bg-transparent py-3.5 pl-12 pr-5 text-base outline-none transition focus:border-olive dark:border-stone-700"
        />
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-stone-500">...</p>
      ) : error ? (
        <p className="py-10 text-center text-sm text-stone-500">{t('errorLoad')}</p>
      ) : all.length === 0 ? (
        <p className="py-10 text-center text-sm text-stone-500">{t('faqEmpty')}</p>
      ) : shown.length === 0 ? (
        <p className="py-10 text-center text-sm text-stone-500">{t('faqNoMatch')}</p>
      ) : (
        <ul className="mt-6">
          {shown.map((f) => {
            const isOpen = activeId === f.id;
            return (
              <li key={f.id} className="border-b border-sand-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : f.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-${f.id}`}
                  className="flex w-full items-center justify-between gap-4 py-6 text-left text-lg font-semibold transition-colors hover:text-olive sm:text-xl"
                >
                  <span>{f.question}</span>
                  <ChevronDown size={20} className={`flex-none text-stone-400 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-${f.id}`}
                      role="region"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="whitespace-pre-line pb-6 text-base leading-relaxed text-stone-500 dark:text-stone-400 sm:text-lg">{f.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      )}

      {hasMore && (
        <div className="mt-8 text-center">
          <Link to="/faq" className="inline-block rounded-full border border-olive px-7 py-3 text-sm font-semibold text-olive transition hover:bg-olive hover:text-white">
            {t('faqViewAll')}
          </Link>
        </div>
      )}
    </section>
  );
}