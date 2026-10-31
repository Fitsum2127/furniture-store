import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLang } from '../../context/LanguageContext.jsx';
import { onImgError } from '../../lib/api.js';

const u = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=700&q=80`;

const CATEGORIES = [
  { slug: 'living-room', label: 'catLiving', image: u('photo-1555041469-a586c61ea9bc') },
  { slug: 'bedroom', label: 'catBedroom', image: u('photo-1505693416388-ac5ce068fe85') },
  { slug: 'dining', label: 'catDining', image: u('photo-1556228453-efd6c1ff04f6') },
  { slug: 'wall-decor', label: 'catWallDecor', image: u('photo-1524758631624-e2822e304c36') },
  { slug: 'lighting', label: 'catLighting', image: u('photo-1513694203232-719a280e022f') },
];

export default function ShopByStyle() {
  const { t } = useLang();
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sand-500">{t('shopByStyle')}</p>
        <h2 className="mt-2 text-3xl font-semibold">{t('findSuits')}</h2>
        <div className="mx-auto mt-3 h-0.5 w-10 bg-sand-400" />
      </div>
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {CATEGORIES.map((c, i) => (
          <motion.div
            key={c.slug}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
          >
            <Link to={`/shop?category=${c.slug}`} className="group block">
              <div className="overflow-hidden rounded-xl bg-sand-100 dark:bg-stone-900">
                <img
                  src={c.image}
                  alt={t(c.label)}
                  loading="lazy"
                  onError={onImgError}
                  className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <p className="mt-3 font-display text-lg font-medium">{t(c.label)}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-stone-600 transition group-hover:gap-2.5 group-hover:text-olive dark:text-stone-400">
                {t('shopNow')} <ArrowRight size={13} />
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}