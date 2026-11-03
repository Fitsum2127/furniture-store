import { motion } from 'framer-motion';
import { Banknote, MessageCircle, Truck } from 'lucide-react';
import { useLang } from '../../context/LanguageContext.jsx';
import { calcDeliveryFee, splitList, useSettings } from '../../context/SettingsContext.jsx';
import { slow, slower } from '../../lib/motion.js';

// Every item is built from the business settings. Nothing is shown unless the business entered it.
export default function FeaturesBar() {
  const { t, money } = useLang();
  const { settings: s } = useSettings();

  const cities = splitList(s.free_delivery_cities);
  const fee = calcDeliveryFee(s, { city: '', subtotal: 0 });
  const min = Number(s.free_delivery_min_subtotal);
  const items = [];

  if (cities.length || fee > 0 || (Number.isFinite(min) && min > 0)) {
    const text = [
      fee > 0 ? t('deliveryFeeIs', { fee: money(fee) }) : '',
      cities.length ? t('freeInCities', { cities: cities.join(', ') }) : '',
      Number.isFinite(min) && min > 0 ? t('freeAbove', { min: money(min) }) : '',
    ].filter(Boolean).join(' ');
    items.push({ icon: Truck, title: t('featDeliveryTitle'), text });
  }
  if (s.payment_cod_enabled === '1') items.push({ icon: Banknote, title: t('featPayCodTitle'), text: t('featPayCodText') });
  if (s.phone || s.whatsapp) items.push({ icon: MessageCircle, title: t('featSupportTitle'), text: t('featSupportText') });

  if (items.length === 0) return null;

  return (
    <div className="relative z-10 mx-auto -mt-12 max-w-6xl px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={slower(0.2)}
        className={`grid gap-5 rounded-2xl bg-white p-5 shadow-xl shadow-stone-900/5 dark:bg-stone-900 ${items.length === 1 ? '' : items.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}
      >
        {items.map(({ icon: Icon, title, text }, i) => (
          <motion.div key={title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={slow(0.6 + i * 0.2)} className="group flex items-start gap-3">
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-sand-100 text-olive transition duration-[900ms] group-hover:scale-110 group-hover:bg-olive group-hover:text-white dark:bg-stone-800">
              <Icon size={19} />
            </span>
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{text}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}