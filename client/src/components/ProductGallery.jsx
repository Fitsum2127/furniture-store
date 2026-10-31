// client/src/components/ProductGallery.jsx
import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { useLang } from '../context/LanguageContext.jsx';

const SWIPE_DISTANCE = 60;
const SWIPE_VELOCITY = 400;

export default function ProductGallery({ images, alt }) {
  const { t } = useLang();
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoom, setZoom] = useState({ on: false, x: 50, y: 50 });

  // Reset to the first image whenever the color (image set) changes.
  useEffect(() => { setActive(0); }, [images]);

  const count = images.length;
  const next = useCallback(() => setActive((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setActive((i) => (i - 1 + count) % count), [count]);

  // Lightbox: keyboard control + body scroll lock.
  useEffect(() => {
    if (!lightbox) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightbox, next, prev]);

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({
      on: true,
      x: Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)),
      y: Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100)),
    });
  };

  const onDragEnd = (_e, { offset, velocity }) => {
    if (offset.x < -SWIPE_DISTANCE || velocity.x < -SWIPE_VELOCITY) next();
    else if (offset.x > SWIPE_DISTANCE || velocity.x > SWIPE_VELOCITY) prev();
  };

  return (
    <div>
      {/* Desktop: thumbnails + hover zoom lens */}
      <div className="hidden gap-3 md:flex">
        <div className="flex w-20 flex-none flex-col gap-3">
          {images.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActive(i)}
              aria-label={`${t('viewImage')} ${i + 1}`}
              className={`overflow-hidden rounded-xl border-2 transition ${
                i === active ? 'border-olive' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={src} alt="" loading="lazy" className="aspect-square w-full object-cover" />
            </button>
          ))}
        </div>

        <div
          className="relative aspect-[4/3] flex-1 cursor-zoom-in overflow-hidden rounded-2xl bg-sand-100 dark:bg-stone-900"
          onMouseMove={onMove}
          onMouseLeave={() => setZoom((z) => ({ ...z, on: false }))}
          onClick={() => setLightbox(true)}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={images[active]}
              src={images[active]}
              alt={alt}
              className="absolute inset-0 h-full w-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              draggable={false}
            />
          </AnimatePresence>

          {/* 2.6x magnified layer follows the cursor */}
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-150"
            style={{
              opacity: zoom.on ? 1 : 0,
              backgroundImage: `url(${images[active]})`,
              backgroundSize: '260%',
              backgroundPosition: `${zoom.x}% ${zoom.y}%`,
              backgroundRepeat: 'no-repeat',
            }}
          />
          {/* Lens ring */}
          <div
            className="pointer-events-none absolute h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80 shadow-lg transition-opacity duration-150"
            style={{ left: `${zoom.x}%`, top: `${zoom.y}%`, opacity: zoom.on ? 1 : 0 }}
          />
          <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs text-white backdrop-blur">
            <ZoomIn size={14} /> {active + 1}/{count}
          </span>
        </div>
      </div>

      {/* Mobile: swipeable carousel */}
      <div className="md:hidden">
        <div className="relative overflow-hidden rounded-2xl bg-sand-100 dark:bg-stone-900">
          <motion.div
            className="flex"
            animate={{ x: `-${active * 100}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 34 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={onDragEnd}
          >
            {images.map((src, i) => (
              <motion.img
                key={src + i}
                src={src}
                alt={`${alt} ${i + 1}`}
                loading={i === 0 ? 'eager' : 'lazy'}
                draggable={false}
                onTap={() => setLightbox(true)}
                className="aspect-[4/3] w-full flex-none select-none object-cover"
              />
            ))}
          </motion.div>
          <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs text-white backdrop-blur">
            <ZoomIn size={14} /> {active + 1}/{count}
          </span>
        </div>
        <div className="mt-3 flex justify-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`${t('viewImage')} ${i + 1}`}
              className={`h-2 rounded-full transition-all ${i === active ? 'w-6 bg-olive' : 'w-2 bg-sand-300 dark:bg-stone-600'}`}
            />
          ))}
        </div>
      </div>

      {/* Full-screen lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[100] flex flex-col bg-black/95"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between p-4 text-white">
              <span className="text-sm">{active + 1} / {count}</span>
              <button
                onClick={() => setLightbox(false)}
                aria-label={t('close')}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
              >
                <X size={22} />
              </button>
            </div>

            <div className="relative flex flex-1 items-center justify-center overflow-hidden px-2">
              <button
                onClick={prev}
                aria-label={t('previous')}
                className="absolute left-3 z-10 hidden h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 md:flex"
              >
                <ChevronLeft size={24} />
              </button>
              <AnimatePresence mode="wait">
                <motion.img
                  key={images[active]}
                  src={images[active]}
                  alt={alt}
                  className="max-h-full max-w-full select-none object-contain"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.2 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.3}
                  onDragEnd={onDragEnd}
                  draggable={false}
                />
              </AnimatePresence>
              <button
                onClick={next}
                aria-label={t('next')}
                className="absolute right-3 z-10 hidden h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 md:flex"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            <div className="no-scrollbar flex justify-center gap-2 overflow-x-auto p-4">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setActive(i)}
                  className={`h-14 w-14 flex-none overflow-hidden rounded-lg border-2 ${i === active ? 'border-white' : 'border-transparent opacity-60'}`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}