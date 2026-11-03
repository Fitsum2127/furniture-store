import { AnimatePresence, motion } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useLang } from '../context/LanguageContext.jsx';
import { onImgError } from '../lib/api.js';

const ISSUE_KEY = { sold_out: 'cartIssueSoldOut', unavailable: 'cartIssueUnavailable', option_required: 'cartIssueOption', option_unavailable: 'cartIssueOption' };

export default function CartDrawer() {
  const { items, open, setOpen, setQty, removeItem, subtotal, hasIssues } = useCart();
  const { t, tr, money } = useLang();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="overlay" className="fixed inset-0 z-50 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
          <motion.aside key="drawer" className="pb-safe fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-stone-900" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 320, damping: 36 }}>
            <div className="flex items-center justify-between border-b border-sand-200 px-5 py-4 dark:border-stone-800">
              <h2 className="text-xl font-semibold">{t('yourCart')}</h2>
              <button onClick={() => setOpen(false)} aria-label={t('close')} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-sand-100 dark:hover:bg-stone-800"><X size={20} /></button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center text-stone-500 dark:text-stone-400">
                <ShoppingBag size={44} strokeWidth={1.3} />
                <p>{t('emptyCart')}</p>
                <button onClick={() => setOpen(false)} className="text-sm font-medium text-olive underline">{t('continueShopping')}</button>
              </div>
            ) : (
              <>
                <ul className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
                  {items.map((item) => (
                    <li key={item.key} className={`flex gap-3 rounded-xl p-2 ${item.issue ? 'bg-red-50 dark:bg-red-950/30' : ''}`}>
                      <img src={item.image} alt="" onError={onImgError} className="h-20 w-20 flex-none rounded-xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{tr(item.name)}</p>
                        {item.variantName && <p className="text-xs text-stone-500 dark:text-stone-400">{tr(item.variantName)}</p>}
                        <p className="mt-1 text-sm font-medium text-olive">{money(item.price)}</p>
                        {item.issue ? (
                          <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{t(ISSUE_KEY[item.issue] || 'cartIssueUnavailable')}</p>
                        ) : (
                          item.maxQty > 0 && item.maxQty <= 5 && <p className="mt-1 text-xs text-amber-600">{t('onlyNAvailable', { n: item.maxQty })}</p>
                        )}
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center rounded-full border border-sand-300 dark:border-stone-700">
                            <button onClick={() => setQty(item.key, item.qty - 1)} disabled={Boolean(item.issue)} className="flex h-8 w-8 items-center justify-center disabled:opacity-30" aria-label="-"><Minus size={14} /></button>
                            <span className="w-6 text-center text-sm">{item.qty}</span>
                            <button onClick={() => setQty(item.key, item.qty + 1)} disabled={Boolean(item.issue) || item.qty >= (item.maxQty || 100)} className="flex h-8 w-8 items-center justify-center disabled:opacity-30" aria-label="+"><Plus size={14} /></button>
                          </div>
                          <button onClick={() => removeItem(item.key)} aria-label={t('remove')} className="text-stone-400 hover:text-red-500"><Trash2 size={17} /></button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-sand-200 px-5 py-4 dark:border-stone-800">
                  <div className="mb-3 flex items-center justify-between text-base font-semibold">
                    <span>{t('subtotal')}</span>
                    <span>{money(subtotal)}</span>
                  </div>
                  {hasIssues && <p className="mb-3 text-xs text-red-600 dark:text-red-400">{t('cartFixIssues')}</p>}
                  <Link
                    to="/checkout"
                    onClick={() => setOpen(false)}
                    aria-disabled={hasIssues}
                    className={`block rounded-full py-3.5 text-center font-semibold text-white transition ${hasIssues ? 'pointer-events-none bg-stone-400' : 'bg-olive hover:bg-olive-dark'}`}
                  >
                    {t('checkout')}
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}