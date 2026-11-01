import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLang } from '../../context/LanguageContext.jsx';
import { onImgError } from '../../lib/api.js';
import { slow, slower } from '../../lib/motion.js';

// To use your own photo: put it in client/public/ as promo.jpg and change this line to '/promo.jpg'
const IMG = 'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1400&q=80';

const reveal = (delay) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: slow(delay),
});

export default function PromoBanner() {
  const { t } = useLang();
  return (
    <section className="bg-sand-100 dark:bg-stone-900">
      <div className="mx-auto grid max-w-7xl items-center md:grid-cols-2">
        <div className="px-4 py-10 sm:px-6 md:py-12 lg:px-8">
          <motion.h2 {...reveal(0)} className="max-w-sm text-3xl font-semibold leading-snug sm:text-4xl">
            {t('promoTitle')}
          </motion.h2>
          <motion.p {...reveal(0.3)} className="mt-4 max-w-xs text-sm text-stone-600 dark:text-stone-400">
            {t('promoText')}
          </motion.p>
          <motion.div {...reveal(0.6)}>
            <Link
              to="/shop"
              className="mt-6 inline-flex items-center gap-2.5 rounded-lg bg-olive px-6 py-3 text-sm font-medium text-white transition hover:bg-olive-dark"
            >
              {t('shopNow')}
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/25">
                <ArrowRight size={14} />
              </span>
            </Link>
          </motion.div>
        </div>

        {/* Fixed height: change h-52 / sm:h-60 / md:h-[280px] to make it taller or shorter */}
        <div className="group h-52 overflow-hidden sm:h-60 md:h-[280px]">
          <div className="h-full w-full transition-transform duration-[2200ms] ease-out group-hover:scale-105">
            <motion.img
              src={IMG}
              alt=""
              loading="lazy"
              onError={onImgError}
              initial={{ opacity: 0, scale: 1.15 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={slower(0.2)}
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
}