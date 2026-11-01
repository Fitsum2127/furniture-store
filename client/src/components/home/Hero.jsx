import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useLang } from '../../context/LanguageContext.jsx';
import { onImgError } from '../../lib/api.js';

const SLIDE_MS = 5000; // time per slide in milliseconds (5000 = 5 seconds)

const photo = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1800&q=80`;

const SLIDES = [
  {
    image: photo('photo-1616486338812-3dadae4b4ace'),
    to: '/shop',
    title: { en: 'Elevate Your Lifestyle', am: 'ኑሮዎን ያሳምሩ' },
    text: {
      en: 'Discover thoughtfully curated home decor and furniture that blends style, comfort & elegance.',
      am: 'ዘይቤን፣ ምቾትንና ውበትን ያጣመሩ በጥንቃቄ የተመረጡ የቤት ዕቃዎችና ማስዋቢያዎችን ያግኙ።',
    },
    button: { en: 'Explore Collection', am: 'ስብስቡን ይመልከቱ' },
  },
  {
    image: photo('photo-1505693416388-ac5ce068fe85'),
    to: '/shop?category=bedroom',
    title: { en: 'Rest in Calm Comfort', am: 'በተረጋጋ ምቾት ዕረፍት ያድርጉ' },
    text: {
      en: 'Solid wood beds and soft textures for truly restful nights.',
      am: 'ለእረፍት ምሽቶች ጠንካራ የእንጨት አልጋዎችና ለስላሳ ጨርቆች።',
    },
    button: { en: 'Shop Bedroom', am: 'መኝታ ቤት ይግዙ' },
  },
  {
    image: photo('photo-1556228453-efd6c1ff04f6'),
    to: '/shop?category=dining',
    title: { en: 'Gather Around the Table', am: 'በጠረጴዛ ዙሪያ ይሰባሰቡ' },
    text: {
      en: 'Dining sets built for family meals and long conversations with guests.',
      am: 'ለቤተሰብ ምግብና ለእንግዶች ጭውውት የተሠሩ የመመገቢያ ስብስቦች።',
    },
    button: { en: 'Shop Dining', am: 'የመመገቢያ ክፍል ይግዙ' },
  },
  {
    image: photo('photo-1513694203232-719a280e022f'),
    to: '/shop?category=lighting',
    title: { en: 'Light Up Every Corner', am: 'ጥግ ሁሉ ይብራ' },
    text: {
      en: 'Warm pendants and lamps that fill your home with a soft glow.',
      am: 'ቤትዎን ሞቅ ባለ ለስላሳ ብርሃን የሚሞሉ መብራቶች።',
    },
    button: { en: 'Shop Lighting', am: 'መብራቶችን ይግዙ' },
  },
  {
    image: photo('photo-1618220179428-22790b461013'),
    to: '/shop?category=wall-decor',
    title: { en: 'Details That Tell Your Story', am: 'ታሪክዎን የሚናገሩ ዝርዝሮች' },
    text: {
      en: 'Wall art, mirrors and vases that bring personality to every room.',
      am: 'ለእያንዳንዱ ክፍል ባህሪ የሚሰጡ የግድግዳ ጥበብ፣ መስተዋቶችና የአበባ ማስቀመጫዎች።',
    },
    button: { en: 'Shop Wall Decor', am: 'ማስዋቢያ ይግዙ' },
  },
];

const LABEL = {
  pause: { en: 'Pause slideshow', am: 'ስላይዱን አቁም' },
  play: { en: 'Play slideshow', am: 'ስላይዱን ቀጥል' },
  goTo: { en: 'Go to slide', am: 'ወደ ስላይድ' },
};

export default function Hero() {
  const { tr, t } = useLang();
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const paused = hover || userPaused;

  const next = useCallback(() => setIndex((i) => (i + 1) % SLIDES.length), []);
  const prev = useCallback(() => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length), []);

  // Load the next photo in advance so the fade is smooth.
  useEffect(() => {
    const preload = new Image();
    preload.src = SLIDES[(index + 1) % SLIDES.length].image;
  }, [index]);

  const slide = SLIDES[index];

  return (
    <section
      className="relative h-[430px] overflow-hidden sm:h-[490px] lg:h-[560px]"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      aria-roledescription="carousel"
    >
      {/* Photos (cross-fade + slow zoom) */}
      <AnimatePresence initial={false}>
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 1.2, ease: 'easeInOut' }}
        >
          <motion.img
            src={slide.image}
            alt=""
            onError={onImgError}
            fetchpriority={index === 0 ? 'high' : 'auto'}
            className="h-full w-full object-cover object-right"
            initial={{ scale: reduced ? 1 : 1.12 }}
            animate={{ scale: 1 }}
            transition={{ duration: (SLIDE_MS + 1500) / 1000, ease: 'linear' }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Soft gradient so the text is easy to read */}
      <div className="absolute inset-0 bg-gradient-to-r from-sand-50 via-sand-50/80 to-sand-50/10 dark:from-stone-950 dark:via-stone-950/80 dark:to-stone-950/20" />

      {/* Swipe area for phones */}
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

      {/* Text */}
      <div className="pointer-events-none relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 pb-16 sm:px-6 lg:px-8">
        <div className="pointer-events-auto max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              aria-live="polite"
            >
              <p className="mb-3 text-xs font-semibold tracking-[0.25em] text-olive">
                {String(index + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
              </p>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">{tr(slide.title)}</h1>
              <p className="mt-4 text-sm leading-relaxed text-stone-700 dark:text-stone-300 sm:text-base">
                {tr(slide.text)}
              </p>
              <Link
                to={slide.to}
                className="mt-7 inline-flex items-center gap-3 rounded-full bg-sand-500 py-2.5 pl-6 pr-2.5 text-sm font-medium text-white transition hover:bg-sand-400"
              >
                {tr(slide.button)}
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/25">
                  <ArrowRight size={16} />
                </span>
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Controls: dots with a 5-second progress bar */}
      <style>{'@keyframes heroProgress{from{transform:scaleX(0)}to{transform:scaleX(1)}}'}</style>
      <div className="absolute inset-x-0 bottom-[4.5rem] z-20 mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`${tr(LABEL.goTo)} ${i + 1}`}
              aria-current={i === index}
              className="relative h-1.5 overflow-hidden rounded-full bg-stone-500/40 transition-all duration-300"
              style={{ width: i === index ? 52 : 20 }}
            >
              {i === index && (
                <span
                  key={index}
                  className="absolute inset-0 origin-left rounded-full bg-olive"
                  style={
                    reduced
                      ? { transform: 'scaleX(1)' }
                      : {
                          animation: `heroProgress ${SLIDE_MS}ms linear forwards`,
                          animationPlayState: paused ? 'paused' : 'running',
                        }
                  }
                  onAnimationEnd={next}
                />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setUserPaused((p) => !p)}
            aria-label={tr(userPaused ? LABEL.play : LABEL.pause)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-stone-800 shadow backdrop-blur transition hover:bg-white dark:bg-stone-800/80 dark:text-stone-100 dark:hover:bg-stone-800"
          >
            {userPaused ? <Play size={15} /> : <Pause size={15} />}
          </button>
          <button
            onClick={prev}
            aria-label={t('previous')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-stone-800 shadow backdrop-blur transition hover:bg-white dark:bg-stone-800/80 dark:text-stone-100 dark:hover:bg-stone-800"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={next}
            aria-label={t('next')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-stone-800 shadow backdrop-blur transition hover:bg-white dark:bg-stone-800/80 dark:text-stone-100 dark:hover:bg-stone-800"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}