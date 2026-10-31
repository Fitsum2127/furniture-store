// client/src/components/ProductTrust.jsx
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Truck, Wrench, BadgeCheck, Box, Phone, X } from 'lucide-react';
import { useLang } from '../context/LanguageContext.jsx';

const ICONS = { Truck, Wrench, BadgeCheck };

export default function ProductTrust({ trust, phone, onOrder }) {
  const { t, tr } = useLang();
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Value badges */}
      <div className="rounded-2xl border border-sand-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
        <p className="mb-3 text-sm font-semibold text-olive">{t('trustTitle')}</p>
        <ul className="space-y-3">
          {trust.map((item) => {
            const Icon = ICONS[item.icon] || BadgeCheck;
            return (
              <li key={item.icon} className="flex gap-3">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-sand-100 text-olive dark:bg-stone-800">
                  <Icon size={20} />
                </span>
                <div>
                  <p className="text-sm font-semibold">{tr(item.title)}</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">{tr(item.text)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 3D preview placeholder */}
      <button
        onClick={() => setPreviewOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-dashed border-olive/60 px-5 py-3 text-sm font-semibold text-olive transition hover:bg-olive/10"
      >
        <Box size={18} /> {t('preview3d')}
      </button>

      {/* Payment + call */}
      <p className="text-center text-xs text-stone-500 dark:text-stone-400">{t('orSecure')}</p>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onOrder('telebirr')}
          className="rounded-full bg-[#0a6ebd] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 active:scale-[0.98]"
        >
          {t('orderTelebirr')}
        </button>
        <button
          onClick={() => onOrder('chapa')}
          className="rounded-full bg-[#5a9a00] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 active:scale-[0.98]"
        >
          {t('orderChapa')}
        </button>
      </div>
      <a
        href={`tel:${phone}`}
        className="flex items-center justify-center gap-2 rounded-full border border-sand-300 px-5 py-3 text-sm font-semibold transition hover:bg-sand-100 dark:border-stone-700 dark:hover:bg-stone-800"
      >
        <Phone size={17} /> {t('callToOrder')}
      </a>

      <AnimatePresence>
        {previewOpen && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center dark:bg-stone-900"
            >
              <button
                onClick={() => setPreviewOpen(false)}
                aria-label={t('close')}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full hover:bg-sand-100 dark:hover:bg-stone-800"
              >
                <X size={18} />
              </button>
              <Box size={40} className="mx-auto text-olive" strokeWidth={1.4} />
              <h3 className="mt-3 text-xl font-semibold">{t('preview3dTitle')}</h3>
              <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">{t('preview3dText')}</p>
              <a
                href={`tel:${phone}`}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-olive px-6 py-3 text-sm font-semibold text-white hover:bg-olive-dark"
              >
                <Phone size={16} /> {t('callToOrder')}
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}