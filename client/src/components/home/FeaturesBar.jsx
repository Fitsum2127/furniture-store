import { motion } from 'framer-motion';
import { Award, Gem, RotateCcw, ShieldCheck } from 'lucide-react';
import { useLang } from '../../context/LanguageContext.jsx';

const FEATURES = [
  { icon: Award, title: 'featQualityTitle', text: 'featQualityText' },
  { icon: Gem, title: 'featLuxuryTitle', text: 'featLuxuryText' },
  { icon: RotateCcw, title: 'featReturnsTitle', text: 'featReturnsText' },
  { icon: ShieldCheck, title: 'featPayTitle', text: 'featPayText' },
];

export default function FeaturesBar() {
  const { t } = useLang();
  return (
    <div className="relative z-10 mx-auto -mt-12 max-w-6xl px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-2 gap-5 rounded-2xl bg-white p-5 shadow-xl shadow-stone-900/5 dark:bg-stone-900 lg:grid-cols-4"
      >
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-3">
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-sand-100 text-olive dark:bg-stone-800">
              <Icon size={19} />
            </span>
            <div>
              <p className="text-sm font-semibold">{t(title)}</p>
              <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{t(text)}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}