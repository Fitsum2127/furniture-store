import { Link, useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import PageTransition from '../components/PageTransition.jsx';
import { useLang } from '../context/LanguageContext.jsx';
import { STORE } from '../config.js';

export default function OrderSuccess() {
  const { id } = useParams();
  const { state } = useLocation();
  const { t, money } = useLang();
  const order = state && state.order;

  const payStep = { telebirr: 'stepPayTele', chapa: 'stepPayChapa', cod: 'stepPayCod' }[order ? order.payment : 'cod'];

  return (
    <PageTransition>
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-olive/15 text-olive"
        >
          <CheckCircle2 size={44} />
        </motion.div>
        <h1 className="mt-6 text-3xl font-semibold">{t('orderPlaced')}</h1>
        <p className="mt-2 text-stone-600 dark:text-stone-400">
          {order ? t('orderThanks', { name: order.name }) : ''}
        </p>

        <div className="mt-6 rounded-2xl border border-sand-200 bg-white p-5 text-left dark:border-stone-800 dark:bg-stone-900">
          <div className="flex justify-between text-sm">
            <span className="text-stone-500 dark:text-stone-400">{t('orderNumber')}</span>
            <span className="font-semibold">#{id}</span>
          </div>
          {order && (
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-stone-500 dark:text-stone-400">{t('total')}</span>
              <span className="font-semibold text-olive">{money(order.total)}</span>
            </div>
          )}
        </div>

        {order && (
          <div className="mt-6 rounded-2xl bg-sand-100 p-5 text-left dark:bg-stone-900">
            <p className="font-semibold">{t('nextSteps')}</p>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-stone-700 dark:text-stone-300">
              <li>{t('stepCall', { phone: order.phone })}</li>
              <li>{t(payStep)}</li>
              <li>{t('stepDelivery')}</li>
            </ol>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/shop" className="rounded-full bg-olive px-8 py-3 text-sm font-semibold text-white hover:bg-olive-dark">
            {t('backToShop')}
          </Link>
          <a href={`tel:${STORE.phone}`} className="rounded-full border border-sand-300 px-8 py-3 text-sm font-semibold dark:border-stone-700">
            {t('callUs')}
          </a>
        </div>
      </div>
    </PageTransition>
  );
}