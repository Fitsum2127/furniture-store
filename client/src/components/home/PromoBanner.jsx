import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLang } from '../../context/LanguageContext.jsx';
import { onImgError } from '../../lib/api.js';

const IMG = 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1400&q=80';

export default function PromoBanner() {
  const { t } = useLang();
  return (
    <section className="bg-sand-100 dark:bg-stone-900">
      <div className="mx-auto grid max-w-7xl items-center md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="px-4 py-10 sm:px-6 md:py-12 lg:px-8"
        >
          <h2 className="max-w-sm text-3xl font-semibold leading-snug sm:text-4xl">{t('promoTitle')}</h2>
          <p className="mt-4 max-w-xs text-sm text-stone-600 dark:text-stone-400">{t('promoText')}</p>
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

        {/* Fixed height: change h-52 / sm:h-60 / md:h-[280px] to make it taller or shorter */}
        <div className="h-52 overflow-hidden sm:h-60 md:h-[280px]">
          <motion.img
            src={IMG}
            alt=""
            loading="lazy"
            onError={onImgError}
            initial={{ opacity: 0, scale: 1.05 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="h-full w-full object-cover object-center"
          />
        </div>
      </div>
    </section>
  );
}