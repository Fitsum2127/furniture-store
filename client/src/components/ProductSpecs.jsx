// client/src/components/ProductSpecs.jsx
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useLang } from '../context/LanguageContext.jsx';
import ColorSwatches from './ColorSwatches.jsx';

function DimensionDiagram({ d, t }) {
  return (
    <svg viewBox="0 0 420 240" className="w-full text-stone-700 dark:text-stone-300" role="img" aria-label={t('dimsTitle')}>
      {/* Front view of the sofa */}
      <g fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="50" y="60" width="260" height="90" rx="14" />
        <rect x="70" y="95" width="220" height="45" rx="8" opacity="0.55" />
        <rect x="38" y="85" width="26" height="70" rx="10" />
        <rect x="296" y="85" width="26" height="70" rx="10" />
        <line x1="70" y1="150" x2="70" y2="172" />
        <line x1="290" y1="150" x2="290" y2="172" />
      </g>
      {/* Length */}
      <g stroke="#6b7a4f" strokeWidth="1.5" fill="#6b7a4f">
        <line x1="38" y1="195" x2="322" y2="195" />
        <line x1="38" y1="189" x2="38" y2="201" />
        <line x1="322" y1="189" x2="322" y2="201" />
        <text x="180" y="217" textAnchor="middle" stroke="none" fontSize="13" fontWeight="600">
          {t('length')}: {d.length} cm
        </text>
        {/* Height */}
        <line x1="345" y1="60" x2="345" y2="172" />
        <line x1="339" y1="60" x2="351" y2="60" />
        <line x1="339" y1="172" x2="351" y2="172" />
        <text x="358" y="120" stroke="none" fontSize="13" fontWeight="600">
          {t('height')}
        </text>
        <text x="358" y="137" stroke="none" fontSize="13" fontWeight="600">
          {d.height} cm
        </text>
        {/* Width (depth) */}
        <line x1="50" y1="40" x2="142" y2="40" />
        <line x1="50" y1="34" x2="50" y2="46" />
        <line x1="142" y1="34" x2="142" y2="46" />
        <text x="150" y="44" stroke="none" fontSize="13" fontWeight="600">
          {t('width')}: {d.width} cm
        </text>
      </g>
    </svg>
  );
}

export default function ProductSpecs({ product, variantId, onSelectVariant }) {
  const { t, tr } = useLang();
  const [openIdx, setOpenIdx] = useState(0);
  const d = product.dimensions;
  const gsmPct = Math.round((product.fabric.gsm / product.fabric.maxGsm) * 100);
  const selected = product.variants.find((v) => v.id === variantId);

  const stats = [
    [t('length'), `${d.length} cm`],
    [t('width'), `${d.width} cm`],
    [t('height'), `${d.height} cm`],
    [t('seatHeight'), `${d.seatHeight} cm`],
    [t('weightCap'), `${d.weightCapacity} kg`],
    [t('netWeight'), `${d.netWeight} kg`],
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <h2 className="text-center text-3xl font-semibold sm:text-4xl">{t('specsTitle')}</h2>
      <div className="mx-auto mt-3 h-0.5 w-12 bg-sand-400" />

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* Dimensions */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-sand-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900"
        >
          <h3 className="text-xl font-semibold">{t('dimsTitle')}</h3>
          <DimensionDiagram d={d} t={t} />
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {stats.map(([label, val]) => (
              <div key={label} className="rounded-xl bg-sand-50 p-3 dark:bg-stone-800">
                <dt className="text-xs text-stone-500 dark:text-stone-400">{label}</dt>
                <dd className="mt-0.5 font-semibold">{val}</dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <div className="space-y-6">
          {/* Colors */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-sand-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900"
          >
            <h3 className="text-xl font-semibold">{t('colorsTitle')}</h3>
            <div className="mt-4 flex items-center gap-4">
              <ColorSwatches variants={product.variants} selectedId={variantId} onSelect={onSelectVariant} />
              <span className="text-sm font-medium">{tr(selected.name)}</span>
            </div>
            <img
              src={selected.images[0]}
              alt={tr(selected.name)}
              loading="lazy"
              className="mt-4 aspect-[16/9] w-full rounded-2xl object-cover"
            />
          </motion.div>

          {/* Material transparency */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-sand-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900"
          >
            <h3 className="text-xl font-semibold">{t('materialTitle')}</h3>
            <ul className="mt-4 space-y-3">
              {product.materials.map((m, i) => (
                <li key={i} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{tr(m.part)}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">{tr(m.detail)}</p>
                  </div>
                  <span
                    className={`flex-none rounded-full px-3 py-1 text-xs font-semibold ${
                      m.type === 'solid'
                        ? 'bg-olive/15 text-olive-dark dark:text-olive-light'
                        : 'bg-sand-200 text-stone-700 dark:bg-stone-700 dark:text-stone-200'
                    }`}
                  >
                    {m.type === 'solid' ? t('solid') : t('engineered')}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-5">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{t('fabricDensity')}</span>
                <span>{product.fabric.gsm} GSM</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-sand-100 dark:bg-stone-800">
                <motion.div
                  className="h-full rounded-full bg-olive"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${gsmPct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                />
              </div>
              <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">{tr(product.fabric.note)}</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Accordion */}
      <div className="mt-6 divide-y divide-sand-200 overflow-hidden rounded-3xl border border-sand-200 bg-white dark:divide-stone-800 dark:border-stone-800 dark:bg-stone-900">
        {product.accordion.map((sec, i) => {
          const open = openIdx === i;
          return (
            <div key={i}>
              <button
                onClick={() => setOpenIdx(open ? -1 : i)}
                aria-expanded={open}
                className="flex w-full items-center justify-between px-6 py-4 text-left font-semibold"
              >
                {tr(sec.title)}
                <ChevronDown size={20} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <dl className="space-y-2 px-6 pb-5">
                      {sec.rows.map(([k, v], j) => (
                        <div key={j} className="flex justify-between gap-4 border-b border-dashed border-sand-200 pb-2 text-sm last:border-0 dark:border-stone-800">
                          <dt className="text-stone-500 dark:text-stone-400">{tr(k)}</dt>
                          <dd className="text-right font-medium">{tr(v)}</dd>
                        </div>
                      ))}
                    </dl>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}