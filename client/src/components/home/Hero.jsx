import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useLang } from '../../context/LanguageContext.jsx';

const SLIDE_MS = 5000; // time per slide in milliseconds (5000 = 5 seconds)

// Set this to true after you put your own photos in client/public/hero/ (named 1.jpg ... 10.jpg)
const USE_LOCAL_PHOTOS = false;

const photo = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1800&q=80`;

const SLIDES = [
  {
    id: 1,
    photoId: 'photo-1616486338812-3dadae4b4ace',
    to: '/shop',
    title: { en: 'Elevate Your Lifestyle', am: 'ኑሮዎን ያሳምሩ' },
    text: {
      en: 'Discover thoughtfully curated home decor and furniture that blends style, comfort & elegance.',
      am: 'ዘይቤን፣ ምቾትንና ውበትን ያጣመሩ በጥንቃቄ የተመረጡ የቤት ዕቃዎችና ማስዋቢያዎችን ያግኙ።',
    },
    button: { en: 'Explore Collection', am: 'ስብስቡን ይመልከቱ' },
  },
  {
    id: 2,
    photoId: 'photo-1505693416388-ac5ce068fe85',
    to: '/shop?category=bedroom',
    title: { en: 'Rest in Calm Comfort', am: 'በተረጋጋ ምቾት ዕረፍት ያድርጉ' },
    text: {
      en: 'Solid wood beds and soft textures for truly restful nights.',
      am: 'ለእረፍት ምሽቶች ጠንካራ የእንጨት አልጋዎችና ለስላሳ ጨርቆች።',
    },
    button: { en: 'Shop Bedroom', am: 'መኝታ ቤት ይግዙ' },
  },
  {
    id: 3,
    photoId: 'photo-1556228453-efd6c1ff04f6',
    to: '/shop?category=dining',
    title: { en: 'Gather Around the Table', am: 'በጠረጴዛ ዙሪያ ይሰባሰቡ' },
    text: {
      en: 'Dining sets built for family meals and long conversations with guests.',
      am: 'ለቤተሰብ ምግብና ለእንግዶች ጭውውት የተሠሩ የመመገቢያ ስብስቦች።',
    },
    button: { en: 'Shop Dining', am: 'የመመገቢያ ክፍል ይግዙ' },
  },
  {
    id: 4,
    photoId: 'photo-1513694203232-719a280e022f',
    to: '/shop?category=lighting',
    title: { en: 'Light Up Every Corner', am: 'ጥግ ሁሉ ይብራ' },
    text: {
      en: 'Warm pendants and lamps that fill your home with a soft glow.',
      am: 'ቤትዎን ሞቅ ባለ ለስላሳ ብርሃን የሚሞሉ መብራቶች።',
    },
    button: { en: 'Shop Lighting', am: 'መብራቶችን ይግዙ' },
  },
  {
    id: 5,
    photoId: 'photo-1618220179428-22790b461013',
    to: '/shop?category=wall-decor',
    title: { en: 'Details That Tell Your Story', am: 'ታሪክዎን የሚናገሩ ዝርዝሮች' },
    text: {
      en: 'Wall art, mirrors and vases that bring personality to every room.',
      am: 'ለእያንዳንዱ ክፍል ባህሪ የሚሰጡ የግድግዳ ጥበብ፣ መስተዋቶችና የአበባ ማስቀመጫዎች።',
    },
    button: { en: 'Shop Wall Decor', am: 'ማስዋቢያ ይግዙ' },
  },
  {
    id: 6,
    photoId: 'photo-1600210492486-724fe5c67fb0',
    to: '/shop?category=living-room',
    title: { en: 'Modern Living, Made Warm', am: 'ዘመናዊ ኑሮ፣ ሞቅ ያለ ገጽታ' },
    text: {
      en: 'Sofas and chairs with clean lines and a comfort you can feel.',
      am: 'ንጹህ መስመሮችና የሚሰማ ምቾት ያላቸው ሶፋዎችና ወንበሮች።',
    },
    button: { en: 'Shop Living Room', am: 'ሳሎን ይግዙ' },
  },
  {
    id: 7,
    photoId: 'photo-1518455027359-f3f8164ba6bd',
    to: '/shop?category=office',
    title: { en: 'Work in Style', am: 'በውበት ይሥሩ' },
    text: {
      en: 'Desks and office pieces that keep your workspace calm and organized.',
      am: 'የሥራ ቦታዎን የተረጋጋና የተደራጀ የሚያደርጉ ጠረጴዛዎችና የቢሮ ዕቃዎች።',
    },
    button: { en: 'Shop Office', am: 'የቢሮ ዕቃ ይግዙ' },
  },
  {
    id: 8,
    photoId: 'photo-1586023492125-27b2c045efd7',
    to: '/shop',
    title: { en: 'Natural Textures, Timeless Look', am: 'ተፈጥሯዊ ሸካራነት፣ ጊዜ የማይሽረው ገጽታ' },
    text: {
      en: 'Wood, linen and ceramic in earthy tones that never go out of style.',
      am: 'ጊዜ የማይሽራቸው በምድራዊ ቀለም የተሠሩ እንጨት፣ ሊነንና ሴራሚክ።',
    },
    button: { en: 'Browse All', am: 'ሁሉንም ይመልከቱ' },
  },
  {
    id: 9,
    photoId: 'photo-1600607687939-ce8a6c25118c',
    to: '/shop?category=home-decor',
    title: { en: 'Make Every Room Yours', am: 'እያንዳንዱን ክፍል የእርስዎ ያድርጉ' },
    text: {
      en: 'Cushions, plants and small touches that turn a house into a home.',
      am: 'ቤትን መኖሪያ የሚያደርጉ ትራሶች፣ ተክሎችና ትናንሽ ጌጦች።',
    },
    button: { en: 'Shop Home Decor', am: 'የቤት ማስዋቢያ ይግዙ' },
  },
  {
    id: 10,
    photoId: 'photo-1493663284031-b7e3aefcae8e',
    to: '/shop',
    title: { en: 'Free Delivery. Free Assembly.', am: 'ነፃ ማድረስ። ነፃ ገጠማ።' },
    text: {
      en: 'We bring it, build it and take the packaging away. Pay with Telebirr, Chapa or cash.',
      am: 'እናመጣለን፣ እንገጥማለን፣ ማሸጊያውንም እንወስዳለን። በቴሌብር፣ በቻፓ ወይም በእጅ ይክፈሉ።',
    },
    button: { en: 'Start Shopping', am: 'ግዢ ይጀምሩ' },
  },
].map((s) => ({
  ...s,
  image: USE_LOCAL_PHOTOS ? `/hero/${s.id}.jpg` : photo(s.photoId),
}));

const LABEL = {
  pause: { en: 'Pause slideshow', am: 'ስላይዱን አቁም' },
  play: { en: 'Play slideshow', am: 'ስላይዱን ቀጥል' },
  goTo: { en: 'Go to slide', am: 'ወደ ስላይድ' },
};

export default function Hero() {
  const { tr, t } = useLang();
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState([]); // ids of photos that could not load
  const [hover, setHover] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const paused = hover || userPaused;

  // Photos that fail to load are skipped automatically.
  const markFailed = useCallback(
    (id) => setFailed((prev) => (prev.includes(id) ? prev : [...prev, id])),
    []
  );
  const slides = useMemo(() => {
    const ok = SLIDES.filter((s) => !failed.includes(s.id));
    return ok.length ? ok : [SLIDES[0]];
  }, [failed]);
  const count = slides.length;
  const current = index % count;
  const slide = slides[current];

  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);

  // Load the next photo in advance so the fade is smooth.
  useEffect(() => {
    if (count < 2) return;
    const upcoming = slides[(current + 1) % count];
    const pre = new Image();
    pre.onerror = () => markFailed(upcoming.id);
    pre.src = upcoming.image;
  }, [current, count, slides, markFailed]);

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
          key={slide.id}
          className="absolute inset-0 bg-sand-200 dark:bg-stone-900"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 1.2, ease: 'easeInOut' }}
        >
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
              key={slide.id}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] } }}
              exit={{ opacity: 0, y: -16, transition: { duration: 0.4 } }}
              aria-live="polite"
            >
              <p className="mb-3 text-xs font-semibold tracking-[0.25em] text-olive">
                {String(current + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
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
        <div className="flex items-center gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
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