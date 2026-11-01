// client/src/components/ProductStory.jsx
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  TreePine, Droplets, Hammer, Armchair, Layers, Sparkles, Ruler, Wind, ShieldCheck, Home,
} from 'lucide-react';
import { useLang } from '../context/LanguageContext.jsx';

const ICONS = { TreePine, Droplets, Hammer, Armchair, Layers, Sparkles, Ruler, Wind, ShieldCheck };

export default function ProductStory({ story, roomTips }) {
  const { t, tr } = useLang();
  const [tab, setTab] = useState('material');

  const tabs = [
    { id: 'material', label: t('tabMaterial') },
    { id: 'design', label: t('tabDesign') },
    { id: 'care', label: t('tabCare') },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-2xl text-center"
      >
        <h2 className="text-3xl font-semibold sm:text-4xl">{t('storyTitle')}</h2>
        <div className="mx-auto mt-3 h-0.5 w-12 bg-sand-400" />
        <p className="mt-4 text-stone-600 dark:text-stone-400">{t('storySub')}</p>
      </motion.div>

      <div className="no-scrollbar mt-8 flex justify-start gap-2 overflow-x-auto sm:justify-center">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={`flex-none rounded-full px-5 py-2.5 text-sm font-medium transition ${
              tab === tb.id
                ? 'bg-olive text-white'
                : 'bg-white text-stone-600 hover:bg-sand-100 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800'
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="mt-8 grid gap-5 md:grid-cols-3"
        >
          {story[tab].map((item) => {
            const Icon = ICONS[item.icon] || Sparkles;
            return (
              <div
                key={item.icon}
                className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sand-100 text-olive dark:bg-stone-800">
                  <Icon size={24} />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{tr(item.title)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">{tr(item.text)}</p>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      <div className="mt-14 rounded-3xl bg-sand-100 p-6 dark:bg-stone-900 sm:p-10">
        <div className="flex items-center gap-3">
          <Home className="text-olive" size={26} />
          <div>
            <h3 className="text-2xl font-semibold">{t('roomTitle')}</h3>
            <p className="text-sm text-stone-600 dark:text-stone-400">{t('roomSub')}</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {roomTips.map((tip, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl bg-white p-5 dark:bg-stone-800"
            >
              <p className="font-semibold">{tr(tip.title)}</p>
              <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">{tr(tip.text)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}