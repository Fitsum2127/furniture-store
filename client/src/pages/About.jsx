import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition.jsx';
import { useLang } from '../context/LanguageContext.jsx';
import useFetch from '../hooks/useFetch.js';
import { api, onImgError } from '../lib/api.js';
import { slow, slower } from '../lib/motion.js';

function Section({ section, index }) {
  const { tr } = useLang();
  const title = tr({ en: section.title_en, am: section.title_am || section.title_en });
  const body = tr({ en: section.body_en, am: section.body_am || section.body_en });
  const paragraphs = body.split(/\n+/).filter(Boolean);
  const hasImage = Boolean(section.image_url);
  const flip = index % 2 === 1;

  const text = (
    <div className={hasImage ? '' : 'mx-auto max-w-3xl text-center'}>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={slow(0)}
        className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sand-500"
      >
        {String(index + 1).padStart(2, '0')}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={slow(0.2)}
        className="mt-2 text-3xl font-semibold sm:text-4xl"
      >
        {title}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={slow(0.5)}
        className={`mt-4 h-0.5 w-10 bg-sand-400 ${hasImage ? 'origin-left' : 'mx-auto'}`}
      />
      <div className="mt-5 space-y-4">
        {paragraphs.map((p, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={slow(0.6 + i * 0.25)}
            className="leading-relaxed text-stone-600 dark:text-stone-300"
          >
            {p}
          </motion.p>
        ))}
      </div>
    </div>
  );

  if (!hasImage) {
    return <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">{text}</section>;
  }

  return (
    <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:gap-14 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={slower(0)}
        className={flip ? 'md:order-2' : ''}
      >
        <div className="group overflow-hidden rounded-3xl bg-sand-100 shadow-lg shadow-stone-900/5 dark:bg-stone-900">
          <img
            src={section.image_url}
            alt={title}
            loading="lazy"
            onError={onImgError}
            className="aspect-[4/3] w-full object-cover transition duration-[2200ms] ease-out group-hover:scale-105"
          />
        </div>
      </motion.div>
      {text}
    </section>
  );
}

export default function About() {
  const { t } = useLang();
  const { data, loading, error, retry } = useFetch(() => api('/about'), []);
  const sections = data || [];

  return (
    <PageTransition>
      <header className="bg-sand-100 px-4 py-16 text-center dark:bg-stone-900">
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={slower(0.2)}
          className="text-4xl font-semibold sm:text-5xl"
        >
          {t('aboutTitle')}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={slow(0.6)}
          className="mx-auto mt-4 max-w-xl text-stone-600 dark:text-stone-400"
        >
          {t('aboutSub')}
        </motion.p>
      </header>

      {loading ? (
        <p className="py-20 text-center text-sm text-stone-500">...</p>
      ) : error ? (
        <div className="py-20 text-center text-sm">
          <p>{t('errorLoad')}</p>
          <button onClick={retry} className="mt-3 font-medium text-olive underline">{t('retry')}</button>
        </div>
      ) : sections.length === 0 ? (
        <p className="py-20 text-center text-stone-500">{t('aboutEmpty')}</p>
      ) : (
        sections.map((s, i) => <Section key={s.id} section={s} index={i} />)
      )}

      <section className="bg-olive py-14 text-center text-white">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-3xl font-semibold">{t('aboutCtaTitle')}</h2>
          <p className="mt-2 text-sm text-white/80">{t('aboutCtaText')}</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/shop" className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-olive-dark transition hover:bg-sand-100">
              {t('shopNow')}
            </Link>
            <Link to="/contact" className="rounded-full border border-white/60 px-8 py-3 text-sm font-semibold transition hover:bg-white/10">
              {t('contactUs')}
            </Link>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}