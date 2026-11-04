import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useLang } from '../../context/LanguageContext.jsx';
import useFetch from '../../hooks/useFetch.js';
import { api, assetUrl } from '../../lib/api.js';

const SLIDE_MS = 5000; // 5 seconds per slide
const LABEL = {
  pause: { en: 'Pause slideshow', am: 'ስላይዱን አቁም' },
  play: { en: 'Play slideshow', am: 'ስላይዱን ቀጥል' },
  goTo: { en: 'Go to slide', am: 'ወደ ስላይድ' },
};
const circleBtn = 'flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-stone-800 shadow backdrop-blur transition hover:bg-white dark:bg-stone-800/80 dark:text-stone-100 dark:hover:bg-stone-800';
const external = (u) => /^https?:\/\//i.test(u);
const heroHeight = 'h-[430px] sm:h-[490px] lg:h-[560px]';

export default function Hero() {
  const { tr, t } = useLang();
  const reduced = useReducedMotion();
  const { data, error } = useFetch(() => api('/home/hero'), []);
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState([]);
  const [hover, setHover] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const paused = hover || userPaused;

  const baseSlides = useMemo(() => {
    if (data && data.length) {
      return data.map((s) => ({
        id: s.id,
        image: assetUrl(s.image_url),
        to: s.link_url || '/shop',
        title: { en: s.title_en, am: s.title_am || s.title_en },
        text: { en: s.text_en || '', am: s.text_am || s.text_en || '' },
        button: { en: s.button_en || t('shopNow'), am: s.button_am || s.button_en || t('shopNow') },
      }));
    }
    // Used only when the admin has no slides yet.
    return [{
      id: 0,
      image: null,
      to: '/shop',
      title: { en: t('heroTitle'), am: t('heroTitle') },
      text: { en: t('heroText'), am: t('heroText') },
      button: { en: t('exploreCollection'), am: t('exploreCollection') },
    }];
  }, [data, t]);

  const markFailed = useCallback((id) => setFailed((prev) => (prev.includes(id) ? prev : [...prev, id])), []);
  const slides = useMemo(() => {
    const ok = baseSlides.filter((x) => !failed.includes(x.id));
    return ok.length ? ok : [{ ...baseSlides[0], image: null }];
  }, [baseSlides, failed]);
  const count = slides.length;
  const current = index % count;
  const slide = slides[current];
  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);

  useEffect(() => {
    if (count < 2) return;
    const upcoming = slides[(current + 1) % count];
    if (!upcoming.image) return;
    const pre = new Image();
    pre.onerror = () => markFailed(upcoming.id);
    pre.src = upcoming.image;
  }, [current, count, slides, markFailed]);

  // Wait for the slides so the page does not flash a different slide first.
  if (!data && !error) return <section className={`${heroHeight} bg-sand-100 dark:bg-stone-900`} aria-hidden="true" />;

  const btnClass = 'mt-7 inline-flex items-center gap-3 rounded-full bg-sand-500 py-2.5 pl-6 pr-2.5 text-sm font-medium text-white transition hover:bg-sand-400';
  const btnInner = (
    <>
      {tr(slide.button)}
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/25"><ArrowRight size={16} /></span>
    </>
  );

  return (
    <section
      className={`relative ${heroHeight} overflow-hidden`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      aria-roledescription="carousel"
    >
      <AnimatePresence initial={false}>
        <motion.div key={slide.id} className="absolute inset-0 bg-sand-200 dark:bg-stone-900" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 1.2, ease: 'easeInOut' }}>
          {slide.image && (
            <motion.img
              src={slide.image}
              alt=""
              onError={() => markFailed(slide.id)}
              fetchpriority={current === 0 ? 'high' : 'auto'}
              className="h-full w-full object-cover object-right"
              initial={{ scale: reduced ? 1 : 1.12 }}
              animate={{ scale: 1 }}
              transition={{ duration: (SLIDE_MS + 1500) / 1000, ease: 'linear' }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-r from-sand-50 via-sand-50/80 to-sand-50/10 dark:from-stone-950 dark:via-stone-950/80 dark:to-stone-950/20" />

      <motion.div
        className="absolute inset-0"
        style={{ touchAction: 'pan-y' }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={(_e, { offset, velocity }) => {
          if (offset.x < -60 || velocity.x < -400) next();
          else if (offset.x > 60 || velocity.x > 400) prev();
        }}
      />

      <div className="pointer-events-none relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 pb-16 sm:px-6 lg:px-8">
        <div className="pointer-events-auto max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] } }}
              exit={{ opacity: 0, y: -16, transition: { duration: 0.4 } }}
              aria-live="polite"
            >
              {count > 1 && (
                <p className="mb-3 text-xs font-semibold tracking-[0.25em] text-olive">
                  {String(current + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
                </p>
              )}
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">{tr(slide.title)}</h1>
              {tr(slide.text) && <p className="mt-4 text-sm leading-relaxed text-stone-700 dark:text-stone-300 sm:text-base">{tr(slide.text)}</p>}
              {external(slide.to) ? (
                <a href={slide.to} target="_blank" rel="noreferrer" className={btnClass}>{btnInner}</a>
              ) : (
                <Link to={slide.to} className={btnClass}>{btnInner}</Link>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {count > 1 && (
        <>
          <style>{'@keyframes heroProgress{from{transform:scaleX(0)}to{transform:scaleX(1)}}'}</style>
          <div className="absolute inset-x-0 bottom-[4.5rem] z-20 mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1.5">
              {slides.map((x, i) => (
                <button
                  key={x.id}
                  onClick={() => setIndex(i)}
                  aria-label={`${tr(LABEL.goTo)} ${i + 1}`}
                  aria-current={i === current}
                  className="relative h-1.5 overflow-hidden rounded-full bg-stone-500/40 transition-all duration-300"
                  style={{ width: i === current ? 48 : 14 }}
                >
                  {i === current && (
                    <span
                      key={slide.id}
                      className="absolute inset-0 origin-left rounded-full bg-olive"
                      style={reduced ? { transform: 'scaleX(1)' } : { animation: `heroProgress ${SLIDE_MS}ms linear forwards`, animationPlayState: paused ? 'paused' : 'running' }}
                      onAnimationEnd={next}
                    />
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setUserPaused((p) => !p)} aria-label={tr(userPaused ? LABEL.play : LABEL.pause)} className={circleBtn}>
                {userPaused ? <Play size={15} /> : <Pause size={15} />}
              </button>
              <button onClick={prev} aria-label={t('previous')} className={circleBtn}><ChevronLeft size={18} /></button>
              <button onClick={next} aria-label={t('next')} className={circleBtn}><ChevronRight size={18} /></button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}