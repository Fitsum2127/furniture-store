import { Link, useParams } from 'react-router-dom';
import PageTransition from '../components/PageTransition.jsx';
import { useLang } from '../context/LanguageContext.jsx';
import useFetch from '../hooks/useFetch.js';
import useDocumentMeta from '../hooks/useDocumentMeta.js';
import { api } from '../lib/api.js';
import { useSettings } from '../context/SettingsContext.jsx';

export default function PolicyPage() {
  const { slug } = useParams();
  const { t, tr } = useLang();
  const { settings } = useSettings();
  const { data, loading, error } = useFetch(() => api(`/content/pages/${slug}`), [slug]);
  const title = data ? tr({ en: data.title_en, am: data.title_am || data.title_en }) : '';
  useDocumentMeta(title ? `${title} | ${settings.business_name}` : settings.business_name);

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl px-4 py-14">
        {loading ? <p className="text-center text-sm text-stone-500">...</p> : error || !data ? (
          <div className="text-center">
            <h1 className="text-2xl font-semibold">{t('pageNotFound')}</h1>
            <Link to="/" className="mt-4 inline-block text-olive underline">{t('home')}</Link>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
            <div className="mt-6 space-y-4 leading-relaxed text-stone-700 dark:text-stone-300">
              {tr({ en: data.body_en, am: data.body_am || data.body_en }).split(/\n+/).filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </>
        )}
      </div>
    </PageTransition>
  );
}