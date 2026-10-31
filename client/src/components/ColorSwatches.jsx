// client/src/components/ColorSwatches.jsx
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useLang } from '../context/LanguageContext.jsx';

export default function ColorSwatches({ variants, selectedId, onSelect }) {
  const { tr } = useLang();
  return (
    <div className="flex flex-wrap gap-3" role="radiogroup">
      {variants.map((v) => {
        const active = v.id === selectedId;
        return (
          <motion.button
            key={v.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={tr(v.name)}
            title={tr(v.name)}
            whileTap={{ scale: 0.9 }}
            onClick={() => onSelect(v.id)}
            className={`relative flex h-11 w-11 items-center justify-center rounded-full border-2 transition ${
              active ? 'border-olive ring-2 ring-olive/30' : 'border-sand-300 dark:border-stone-600'
            }`}
          >
            <span className="h-8 w-8 rounded-full border border-black/10" style={{ backgroundColor: v.hex }} />
            {active && (
              <Check
                size={16}
                className="absolute text-white drop-shadow"
                style={{ mixBlendMode: 'normal' }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}