import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useLang } from '../../context/LanguageContext.jsx';

const SLIDE_MS = 5000; // 5 seconds per slide
// Set to true after you put your own photos in client/public/hero/ (named 1.jpg ... 10.jpg)
const USE_LOCAL_PHOTOS = false;

const photo = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1800&q=80`;
const s = (id, photoId, to, titleEn, titleAm, textEn, textAm, btnEn, btnAm) => ({
  id, photoId, to,
  title: { en: titleEn, am: titleAm }, text: { en: textEn, am: textAm }, button: { en: btnEn, am: btnAm },
});

const SLIDES = [
  s(1, 'photo-1616486338812-3dadae4b4ace', '/shop', 'Elevate Your Lifestyle', 'ኑሮዎን ያሳምሩ', 'Discover furniture and home decor that blends style, comfort and elegance.', 'ዘይቤን፣ ምቾትንና ውበትን ያጣመሩ የቤት ዕቃዎችና ማስዋቢያዎችን ያግኙ።', 'Explore Collection', 'ስብስቡን ይመልከቱ'),
  s(2, 'photo-1505693416388-ac5ce068fe85', '/shop?category=bedroom', 'Rest in Calm Comfort', 'በተረጋጋ ምቾት ዕረፍት ያድርጉ', 'Beds and soft textures for restful nights.', 'ለእረፍት ምሽቶች አልጋዎችና ለስላሳ ጨርቆች።', 'Shop Bedroom', 'መኝታ ቤት ይግዙ'),
  s(3, 'photo-1556228453-efd6c1ff04f6', '/shop?category=dining', 'Gather Around the Table', 'በጠረጴዛ ዙሪያ ይሰባሰቡ', 'Dining sets for family meals and long conversations.', 'ለቤተሰብ ምግብና ለረጅም ጭውውት የመመገቢያ ስብስቦች።', 'Shop Dining', 'የመመገቢያ ክፍል ይግዙ'),
  s(4, 'photo-1513694203232-719a280e022f', '/shop?category=lighting', 'Light Up Every Corner', 'ጥግ ሁሉ ይብራ', 'Pendants and lamps that fill your home with a soft glow.', 'ቤትዎን በለስላሳ ብርሃን የሚሞሉ መብራቶች።', 'Shop Lighting', 'መብራቶችን ይግዙ'),
  s(5, 'photo-1618220179428-22790b461013', '/shop?category=wall-decor', 'Details That Tell Your Story', 'ታሪክዎን የሚናገሩ ዝርዝሮች', 'Wall art, mirrors and vases that bring personality to every room.', 'ለእያንዳንዱ ክፍል ባህሪ የሚሰጡ የግድግዳ ጥበብ፣ መስተዋቶችና የአበባ ማስቀመጫዎች።', 'Shop Wall Decor', 'ማስዋቢያ ይግዙ'),
  s(6, 'photo-1600210492486-724fe5c67fb0', '/shop?category=living-room', 'Modern Living, Made Warm', 'ዘመናዊ ኑሮ፣ ሞቅ ያለ ገጽታ', 'Sofas and chairs with clean lines and everyday comfort.', 'ንጹህ መስመሮችና የዕለት ምቾት ያላቸው ሶፋዎችና ወንበሮች።', 'Shop Living Room', 'ሳሎን ይግዙ'),
  s(7, 'photo-1518455027359-f3f8164ba6bd', '/shop?category=office', 'Work in Style', 'በውበት ይሥሩ', 'Desks and office pieces for a calm, organized workspace.', 'የተረጋጋና የተደራጀ የሥራ ቦታ የሚፈጥሩ ጠረጴዛዎችና የቢሮ ዕቃዎች።', 'Shop Office', 'የቢሮ ዕቃ ይግዙ'),
  s(8, 'photo-1586023492125-27b2c045efd7', '/shop', 'Natural Textures, Timeless Look', 'ተፈጥሯዊ ሸካራነት፣ ጊዜ የማይሽረው ገጽታ', 'Wood, linen and ceramic in earthy tones.', 'በምድራዊ ቀለም የተሠሩ እንጨት፣ ሊነንና ሴራሚክ።', 'Browse All', 'ሁሉንም ይመልከቱ'),
  s(9, 'photo-1600607687939-ce8a6c25118c', '/shop?category=home-decor', 'Make Every Room Yours', 'እያንዳንዱን ክፍል የእርስዎ ያድርጉ', 'Cushions, plants and small touches that turn a house into a home.', 'ቤትን መኖሪያ የሚያደርጉ ትራሶች፣ ተክሎችና ትናንሽ ጌጦች።', 'Shop Home Decor', 'የቤት ማስዋቢያ ይግዙ'),
  s(10, 'photo-1493663284031-b7e3aefcae8e', '/shop', 'Furniture for Every Room', 'ለእያንዳንዱ ክፍል የቤት ዕቃ', 'Browse the full collection and find the pieces that fit your home.', 'ሙሉውን ስብስብ ይመልከቱ፣ ለቤትዎ የሚስማሙትን ያግኙ።', 'Start Shopping', 'ግዢ ይጀምሩ'),
].map((x) => ({ ...x, image: USE_LOCAL_PHOTOS ? `/hero/${x.id}.jpg` : photo(x.photoId) }));

const LABEL = {
  pause: { en: 'Pause slideshow', am: 'ስላይዱን አቁም' },
  play: { en: 'Play slideshow', am: 'ስላይዱን ቀጥል' },
  goTo: { en: 'Go to slide', am: 'ወደ ስላይድ' },
};
const circleBtn = 'flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-stone-800 shadow backdrop-blur transition hover:bg-white dark:bg-stone-800/80 dark:text-stone-100 dark:hover:bg-stone-800';

export default function Hero() {
  const { tr, t } = useLang();
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState([]);
  const [hover, setHover] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const paused = hover || userPaused;

  const markFailed = useCallback((id) => setFailed((prev) => (prev.includes(id) ? prev : [...prev, id])), []);
  const slides = useMemo(() => {
    const ok = SLIDES.filter((x) => !failed.includes(x.id));
    return ok.length ? ok : [SLIDES[0]];
  }, [failed]);
  const count = slides.length;
  const current = index % count;
  const slide = slides[current];
  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);

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
      <AnimatePresence initial={false}>
        <motion.div key={slide.id} className="absolute inset-0 bg-sand-200 dark:bg-stone-900" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 1.2, ease: 'easeInOut' }}>
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
              <p className="mb-3 text-xs font-semibold tracking-[0.25em] text-olive">
                {String(current + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
              </p>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">{tr(slide.title)}</h1>
              <p className="mt-4 text-sm leading-relaxed text-stone-700 dark:text-stone-300 sm:text-base">{tr(slide.text)}</p>
              <Link to={slide.to} className="mt-7 inline-flex items-center gap-3 rounded-full bg-sand-500 py-2.5 pl-6 pr-2.5 text-sm font-medium text-white transition hover:bg-sand-400">
                {tr(slide.button)}
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/25"><ArrowRight size={16} /></span>
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

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
    </section>
  );
}