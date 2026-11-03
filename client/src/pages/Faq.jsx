import PageTransition from '../components/PageTransition.jsx';
import { useLang } from '../context/LanguageContext.jsx';
import useFetch from '../hooks/useFetch.js';
import { api } from '../lib/api.js';

export default function Faq() {
  const { t, tr } = useLang();
  const { data, loading } = useFetch(() => api('/content/faqs'), []);
  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl px-4 py-14">
        <h1 className="text-center text-3xl font-semibold sm:text-4xl">{t('faqTitle')}</h1>
        <div className="mt-8 space-y-3">
          {loading ? <p className="text-center text-sm text-stone-500">...</p> : !data || data.length === 0 ? (
            <p className="text-center text-sm text-stone-500">{t('faqEmpty')}</p>
          ) : (
            data.map((f) => (
              <details key={f.id} className="group rounded-2xl border border-sand-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
                <summary className="cursor-pointer list-none font-semibold">{tr({ en: f.question_en, am: f.question_am || f.question_en })}</summary>
                <p className="mt-3 whitespace-pre-line text-sm text-stone-600 dark:text-stone-300">{tr({ en: f.answer_en, am: f.answer_am || f.answer_en })}</p>
              </details>
            ))
          )}
        </div>
      </div>
    </PageTransition>
  );
}