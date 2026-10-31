import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useLang } from '../../context/LanguageContext.jsx';

const REVIEWS = [
  {
    name: { en: 'Selam T.', am: 'ሰላም ት.' },
    text: {
      en: 'The quality and design are absolutely amazing. It completely changed the look of my living room!',
      am: 'ጥራቱና ንድፉ በጣም አስደናቂ ነው። የሳሎኔን ገጽታ ሙሉ በሙሉ ቀይሮታል!',
    },
  },
  {
    name: { en: 'Dawit M.', am: 'ዳዊት መ.' },
    text: {
      en: 'Excellent collection and fast delivery. Bete is now my go-to store for home decor.',
      am: 'በጣም ጥሩ ስብስብና ፈጣን አቅርቦት። ቤቴ አሁን ለቤት ማስዋቢያ የመጀመሪያ ምርጫዬ ነው።',
    },
  },
  {
    name: { en: 'Hanna B.', am: 'ሃና ብ.' },
    text: {
      en: 'Every piece I ordered is beautiful and exactly as shown. Highly recommended!',
      am: 'ያዘዝኩት ሁሉ ውብና በፎቶው እንደታየው ነው። በጣም እመክራለሁ!',
    },
  },
  {
    name: { en: 'Yonas G.', am: 'ዮናስ ግ.' },
    text: {
      en: 'The team assembled everything in my office the same day. Very professional.',
      am: 'ቡድኑ በቢሮዬ ውስጥ ሁሉንም በዚያው ቀን ገጠመ። በጣም ሙያዊ ነው።',
    },
  },
  {
    name: { en: 'Marta A.', am: 'ማርታ አ.' },
    text: {
      en: 'Good prices and the Telebirr payment was easy. I will order again.',
      am: 'ዋጋው ጥሩ ነው፤ የቴሌብር ክፍያውም ቀላል ነበር። እንደገና አዛለሁ።',
    },
  },
];

export default function Testimonials() {
  const { t, tr } = useLang();
  const ref = useRef(null);
  const [active, setActive] = useState(0);

  const scrollByDir = (dir) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' });
  };

  const onScroll = () => {
    const el = ref.current;
    if (!el || !el.firstElementChild) return;
    const step = el.firstElementChild.getBoundingClientRect().width + 20;
    setActive(Math.min(REVIEWS.length - 1, Math.round(el.scrollLeft / step)));
  };

  return (
    <section className="bg-sand-100/60 py-16 dark:bg-stone-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sand-500">{t('whatCustomersSay')}</p>
          <h2 className="mt-2 text-3xl font-semibold">{t('lovedBy')}</h2>
          <div className="mx-auto mt-3 h-0.5 w-10 bg-sand-400" />
        </div>

        <div className="relative mt-10">
          <button
            onClick={() => scrollByDir(-1)}
            aria-label={t('previous')}
            className="absolute -left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md hover:bg-sand-100 dark:bg-stone-800 md:flex lg:-left-5"
          >
            <ChevronLeft size={18} />
          </button>
          <div
            ref={ref}
            onScroll={onScroll}
            className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth"
          >
            {REVIEWS.map((r, i) => (
              <figure
                key={i}
                className="w-[85%] flex-none snap-start rounded-xl bg-white p-6 shadow-sm dark:bg-stone-900 sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]"
              >
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="mt-3 text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                  “{tr(r.text)}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-olive/15 text-sm font-semibold text-olive">
                    {tr(r.name).charAt(0)}
                  </span>
                  <span className="text-sm font-semibold">{tr(r.name)}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <button
            onClick={() => scrollByDir(1)}
            aria-label={t('next')}
            className="absolute -right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md hover:bg-sand-100 dark:bg-stone-800 md:flex lg:-right-5"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {REVIEWS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === active ? 'w-6 bg-olive' : 'w-1.5 bg-sand-300 dark:bg-stone-600'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}