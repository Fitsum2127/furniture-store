import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLang } from '../../context/LanguageContext.jsx';
import { onImgError } from '../../lib/api.js';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1800&q=80',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1800&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1800&q=80',
  'https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=1800&q=80',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1800&q=80',
];

const SLIDE_MS = 5000;

export default function Hero() {
  const { t } = useLang();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % HERO_IMAGES.length);
    }, SLIDE_MS);
    return () => clearInterval(id);
  }, [index]); // resets the timer when a dot is clicked

  return (
    <section className="relative h-[460px] overflow-hidden sm:h-[520px] lg:h-[600px]">
      <AnimatePresence>
        <motion.img
          key={index}
          src={HERO_IMAGES[index]}
          alt=""
          onError={onImgError}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          className="absolute inset-0 h-full w-full object-cover object-right"
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-r from-sand-50 via-sand-50/80 to-sand-50/10 dark:from-stone-950 dark:via-stone-950/80 dark:to-stone-950/20" />
      <div className="relative mx-auto flex h-full max-w-7xl items-center px-4 pb-10 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="max-w-md"
        >
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">{t('heroTitle')}</h1>
          <p className="mt-4 text-sm leading-relaxed text-stone-700 dark:text-stone-300 sm:text-base">
            {t('heroText')}
          </p>
          <Link
            to="/shop"
            className="mt-7 inline-flex items-center gap-3 rounded-full bg-sand-500 py-2.5 pl-6 pr-2.5 text-sm font-medium text-white transition hover:bg-sand-400"
          >
            {t('exploreCollection')}
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/25">
              <ArrowRight size={16} />
            </span>
          </Link>
        </motion.div>
      </div>

      {/* slide indicators */}
      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
        {HERO_IMAGES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all ${
              i === index ? 'w-6 bg-sand-500' : 'w-2 bg-stone-400/60'
            }`}
          />
        ))}
      </div>
    </section>
  );
}