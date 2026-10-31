// client/src/components/ProductReviews.jsx
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Star, Camera, BadgeCheck, X } from 'lucide-react';
import { useLang } from '../context/LanguageContext.jsx';

const KEYS = ['quality', 'comfort', 'value', 'delivery'];
const LABEL = { quality: 'rateQuality', comfort: 'rateComfort', value: 'rateValue', delivery: 'rateDelivery' };

function Stars({ value, size = 16 }) {
  return (
    <span className="inline-flex" aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-sand-300 dark:text-stone-600'}
        />
      ))}
    </span>
  );
}

function StarInput({ value, onChange, label }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm">{label}</span>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => onChange(n)} aria-label={`${n}`} className="p-0.5">
            <Star
              size={24}
              className={n <= value ? 'fill-amber-400 text-amber-400' : 'text-sand-300 dark:text-stone-600'}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ProductReviews({ productId, initialReviews }) {
  const { t, tr, lang } = useLang();
  const [reviews, setReviews] = useState(initialReviews);
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [ratings, setRatings] = useState({ quality: 5, comfort: 5, value: 5, delivery: 5 });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [done, setDone] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);

  // Local preview URLs for chosen photos; revoked on change/unmount.
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const stats = useMemo(() => {
    const avg = (key) => reviews.reduce((s, r) => s + r.ratings[key], 0) / (reviews.length || 1);
    const perKey = Object.fromEntries(KEYS.map((k) => [k, avg(k)]));
    const overall = KEYS.reduce((s, k) => s + perKey[k], 0) / KEYS.length;
    const dist = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: reviews.filter((r) => Math.round(KEYS.reduce((s, k) => s + r.ratings[k], 0) / KEYS.length) === star).length,
    }));
    return { perKey, overall, dist };
  }, [reviews]);

  const pickFiles = (e) => {
    const chosen = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'));
    setFiles((prev) => [...prev, ...chosen].slice(0, 4));
    e.target.value = '';
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !body.trim()) return;

    // Try saving to the API. If the server is not running yet, the review still shows locally.
    try {
      const fd = new FormData();
      fd.append('productId', productId);
      fd.append('author_name', name.trim());
      fd.append('body', body.trim());
      KEYS.forEach((k) => fd.append(k, ratings[k]));
      files.forEach((f) => fd.append('photos', f));
      await fetch('/api/reviews', { method: 'POST', body: fd });
    } catch (err) { /* offline or API not running: keep local copy */ }

    setReviews((prev) => [
      {
        id: Date.now(),
        author: name.trim(),
        date: new Date().toISOString().slice(0, 10),
        ratings,
        body: { en: body.trim(), am: body.trim() },
        photos: [...previews],
      },
      ...prev,
    ]);
    setName(''); setBody(''); setFiles([]); setRatings({ quality: 5, comfort: 5, value: 5, delivery: 5 });
    setDone(true);
    setTimeout(() => setDone(false), 6000);
  };

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString(lang === 'am' ? 'am-ET' : 'en-GB', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <h2 className="text-center text-3xl font-semibold sm:text-4xl">{t('reviewsTitle')}</h2>
      <div className="mx-auto mt-3 h-0.5 w-12 bg-sand-400" />

      <div className="mt-10 grid gap-8 lg:grid-cols-[360px_1fr]">
        {/* Summary + form */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-sand-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-center gap-4">
              <span className="font-display text-5xl font-semibold">{stats.overall.toFixed(1)}</span>
              <div>
                <Stars value={stats.overall} size={20} />
                <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{t('basedOn', { n: reviews.length })}</p>
              </div>
            </div>
            <div className="mt-4 space-y-1.5">
              {stats.dist.map(({ star, count }) => (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-3">{star}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-sand-100 dark:bg-stone-800">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${(count / (reviews.length || 1)) * 100}%` }} />
                  </div>
                  <span className="w-4 text-right text-stone-500">{count}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-2 border-t border-sand-200 pt-4 dark:border-stone-800">
              {KEYS.map((k) => (
                <div key={k} className="flex items-center justify-between text-sm">
                  <span>{t(LABEL[k])}</span>
                  <span className="flex items-center gap-2">
                    <Stars value={stats.perKey[k]} size={14} />
                    <span className="w-7 text-right font-medium">{stats.perKey[k].toFixed(1)}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4 rounded-3xl border border-sand-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
            <h3 className="text-lg font-semibold">{t('writeReview')}</h3>
            {KEYS.map((k) => (
              <StarInput key={k} label={t(LABEL[k])} value={ratings[k]} onChange={(n) => setRatings((r) => ({ ...r, [k]: n }))} />
            ))}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('yourName')}
              required
              maxLength={100}
              className="w-full rounded-xl border border-sand-300 bg-transparent px-4 py-3 text-sm outline-none focus:border-olive dark:border-stone-700"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t('yourReview')}
              required
              rows={4}
              maxLength={2000}
              className="w-full resize-none rounded-xl border border-sand-300 bg-transparent px-4 py-3 text-sm outline-none focus:border-olive dark:border-stone-700"
            />
            <div>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-olive">
                <Camera size={18} /> {t('addPhotos')}
                <input type="file" accept="image/*" multiple onChange={pickFiles} className="hidden" />
              </label>
              {previews.length > 0 && (
                <div className="mt-3 flex gap-2">
                  {previews.map((src, i) => (
                    <div key={src} className="relative h-16 w-16">
                      <img src={src} alt="" className="h-full w-full rounded-lg object-cover" />
                      <button
                        type="button"
                        onClick={() => setFiles((f) => f.filter((_, idx) => idx !== i))}
                        aria-label={t('remove')}
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-stone-800 text-white"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" className="w-full rounded-full bg-olive py-3 text-sm font-semibold text-white transition hover:bg-olive-dark">
              {t('submit')}
            </button>
            <AnimatePresence>
              {done && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-olive">
                  {t('thanks')}
                </motion.p>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* Review list */}
        <ul className="space-y-4">
          <AnimatePresence initial={false}>
            {reviews.map((r) => {
              const avg = KEYS.reduce((s, k) => s + r.ratings[k], 0) / KEYS.length;
              return (
                <motion.li
                  key={r.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl border border-sand-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-olive/15 font-semibold text-olive">
                        {r.author.charAt(0)}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{r.author}</p>
                        <p className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
                          <BadgeCheck size={13} className="text-olive" /> {t('verified')} · {fmtDate(r.date)}
                        </p>
                      </div>
                    </div>
                    <Stars value={avg} />
                  </div>
                  <p className="mt-4 text-sm leading-relaxed">{tr(r.body)}</p>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
                    {KEYS.map((k) => (
                      <span key={k}>{t(LABEL[k])}: <b className="text-stone-800 dark:text-stone-200">{r.ratings[k]}/5</b></span>
                    ))}
                  </div>
                  {r.photos.length > 0 && (
                    <div className="mt-4 flex gap-2">
                      {r.photos.map((src) => (
                        <button key={src} onClick={() => setLightboxSrc(src)} aria-label={t('viewImage')}>
                          <img src={src} alt="" loading="lazy" className="h-20 w-20 rounded-xl object-cover transition hover:opacity-85" />
                        </button>
                      ))}
                    </div>
                  )}
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </div>

      <AnimatePresence>
        {lightboxSrc && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxSrc(null)}
          >
            <img src={lightboxSrc} alt="" className="max-h-full max-w-full rounded-xl object-contain" />
            <button
              onClick={() => setLightboxSrc(null)}
              aria-label={t('close')}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"
            >
              <X size={22} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}