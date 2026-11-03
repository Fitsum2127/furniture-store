import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext.jsx';
import { onImgError } from '../lib/api.js';

const STATUS = { new: 'statusNew', confirmed: 'statusConfirmed', shipped: 'statusShipped', delivered: 'statusDelivered', cancelled: 'statusCancelled' };
const PAY = { pending: 'payPending', paid: 'payPaid', failed: 'payFailed' };
const METHOD = { cod: 'payCod', chapa: 'payChapa', telebirr: 'payTelebirr' };

export default function OrderView({ order }) {
  const { t, tr, money, lang } = useLang();
  const date = new Date(order.createdAt).toLocaleString(lang === 'am' ? 'am-ET' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' });
  const badge = 'rounded-full bg-sand-100 px-3 py-1 text-xs font-semibold dark:bg-stone-800';

  return (
    <div className="space-y-5 text-left">
      <div className="rounded-2xl border border-sand-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs text-stone-500 dark:text-stone-400">{t('orderNumberLabel')}</p>
            <p className="font-display text-2xl font-semibold">{order.orderNumber}</p>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{t('placedOn')} {date}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className={badge}>{t('orderStatusLabel')}: {t(STATUS[order.status] || 'statusNew')}</span>
            <span className={badge}>{t(METHOD[order.paymentMethod])} · {t(PAY[order.paymentStatus])}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-sand-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
        <h3 className="font-semibold">{t('itemsLabel')}</h3>
        <ul className="mt-3 divide-y divide-sand-200 dark:divide-stone-800">
          {order.items.map((i, idx) => (
            <li key={`${i.productId}-${i.variantId}-${idx}`} className="flex items-center gap-3 py-3 text-sm">
              <img src={i.image} alt="" onError={onImgError} className="h-14 w-14 flex-none rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <Link to={`/product/${i.productId}`} className="block truncate font-medium hover:text-olive">{tr(i.name)}</Link>
                <p className="text-xs text-stone-500 dark:text-stone-400">{i.variantName ? `${tr(i.variantName)} · ` : ''}{money(i.unitPrice)} x {i.qty}</p>
              </div>
              <p className="font-semibold">{money(i.lineTotal)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-sand-200 pt-4 text-sm dark:border-stone-800">
          <div className="flex justify-between"><dt className="text-stone-500">{t('subtotal')}</dt><dd>{money(order.subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-stone-500">{t('delivery')}</dt><dd>{order.deliveryFee > 0 ? money(order.deliveryFee) : t('freeLabel')}</dd></div>
          <div className="flex justify-between border-t border-sand-200 pt-3 text-base font-bold dark:border-stone-800"><dt>{t('total')}</dt><dd className="text-olive">{money(order.total)}</dd></div>
        </dl>
      </div>

      <div className="rounded-2xl border border-sand-200 bg-white p-5 text-sm dark:border-stone-800 dark:bg-stone-900">
        <h3 className="font-semibold">{t('deliveryDetails')}</h3>
        <p className="mt-2">{order.customer.name}</p>
        <p>{order.customer.phone}</p>
        <p>{order.customer.city}, {order.customer.address}</p>
        {order.customer.notes && <p className="mt-1 text-stone-500">{order.customer.notes}</p>}
      </div>
    </div>
  );
}