import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, Phone } from 'lucide-react';
import useFetch from '../../hooks/useFetch.js';
import { useLang } from '../../context/LanguageContext.jsx';
import { onImgError } from '../../lib/api.js';
import { adminApi } from '../adminApi.js';
import { useFeedback } from '../feedback.jsx';
import { Badge, ErrorBox, Loading, PageHeader, card, inputClass, payColor, statusColor, useFmt, useLabels } from '../ui.jsx';

const STATUSES = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const PAYMENTS = ['pending', 'paid', 'failed'];

function OrderRow({ order, onChanged, autoOpen, fb }) {
  const { t } = useLang();
  const { money, fmtDate } = useFmt();
  const { st, pay, method } = useLabels();
  const [open, setOpen] = useState(autoOpen);
  const [detail, setDetail] = useState(null);

  const loadDetail = async () => {
    try {
      setDetail(await adminApi(`/orders/${order.id}`));
    } catch (e) {
      fb.error(e.message);
    }
  };
  useEffect(() => {
    if (open && !detail) loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const doUpdate = async (patch) => {
    try {
      await adminApi(`/orders/${order.id}`, { method: 'PATCH', body: JSON.stringify(patch) });
      fb.success(t('a_orderUpdated'));
      onChanged();
      await loadDetail();
    } catch (e) {
      fb.error(e.message);
    }
  };

  // Risky changes ask for confirmation on the page, not in a popup.
  const update = (patch) => {
    if (patch.payment_status === 'paid') {
      fb.confirm({ text: t('a_confirmPaid'), confirmLabel: t('a_markPaidYes'), onConfirm: () => doUpdate(patch) });
    } else if (patch.status === 'cancelled') {
      fb.confirm({ text: t('a_confirmCancel'), confirmLabel: t('a_cancelOrderYes'), danger: true, onConfirm: () => doUpdate(patch) });
    } else {
      doUpdate(patch);
    }
  };

  return (
    <li className={card}>
      <button onClick={() => setOpen((o) => !o)} className="flex w-full flex-wrap items-center gap-3 p-4 text-left" aria-expanded={open}>
        <div className="min-w-0 flex-1 basis-44">
          <p className="font-medium">{order.order_number} · {order.customer_name}</p>
          <p className="text-xs text-stone-500">{fmtDate(order.created_at)} · {t('a_nItems', { n: order.items_count })} · {order.city} · {order.customer_id ? t('a_accountLabel') : t('a_guestLabel')}</p>
        </div>
        <p className="font-semibold">{money(order.total)}</p>
        <Badge color={statusColor[order.status]}>{st(order.status)}</Badge>
        <Badge color={payColor[order.payment_status]}>{method(order.payment_method)} · {pay(order.payment_status)}</Badge>
        <ChevronDown size={18} className={`transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="space-y-4 border-t border-sand-200 p-4 dark:border-stone-800">
          {!detail ? <Loading /> : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="text-sm">
                  <p className="font-semibold">{t('a_customerLabel')}</p>
                  <p>{detail.customer_name}</p>
                  <a href={`tel:${detail.phone}`} className="inline-flex items-center gap-1.5 text-olive underline"><Phone size={14} /> {detail.phone}</a>
                  {detail.email && <p>{detail.email}</p>}
                  <p className="mt-1">{detail.city}, {detail.address}</p>
                  {detail.notes && <p className="mt-1 text-stone-500">{t('a_noteLabel')}: {detail.notes}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs font-medium">{t('a_orderStatus')}
                    <select value={detail.status} disabled={detail.status === 'cancelled'} onChange={(e) => update({ status: e.target.value })} className={`${inputClass} mt-1`}>
                      {STATUSES.map((s) => <option key={s} value={s}>{st(s)}</option>)}
                    </select>
                  </label>
                  <label className="text-xs font-medium">{t('a_paymentLabel')}
                    <select value={detail.payment_status} disabled={detail.status === 'cancelled'} onChange={(e) => update({ payment_status: e.target.value })} className={`${inputClass} mt-1`}>
                      {PAYMENTS.map((s) => <option key={s} value={s}>{pay(s)}</option>)}
                    </select>
                  </label>
                  <p className="col-span-2 text-xs text-stone-500">{t('a_orderHint')}</p>
                </div>
              </div>

              <ul className="divide-y divide-sand-200 dark:divide-stone-800">
                {detail.items.map((it) => (
                  <li key={it.id} className="flex items-center gap-3 py-3 text-sm">
                    <img src={it.thumbnail} alt="" onError={onImgError} className="h-12 w-12 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1"><p className="truncate font-medium">{it.name_en}{it.variant_name_en ? ` (${it.variant_name_en})` : ''}</p><p className="text-xs text-stone-500">{it.sku}</p></div>
                    <p>x{it.qty}</p>
                    <p className="w-28 text-right font-semibold">{money(it.unit_price * it.qty)}</p>
                  </li>
                ))}
              </ul>
              <dl className="ml-auto max-w-xs space-y-1 text-sm">
                <div className="flex justify-between"><dt className="text-stone-500">{t('a_subtotal')}</dt><dd>{money(detail.subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-stone-500">{t('a_delivery')}</dt><dd>{money(detail.delivery_fee)}</dd></div>
                <div className="flex justify-between font-bold"><dt>{t('a_total')}</dt><dd>{money(detail.total)}</dd></div>
              </dl>
              {detail.payments.length > 0 && <p className="text-xs text-stone-500">{t('a_paymentsLabel')}: {detail.payments.map((p) => `${method(p.provider)} ${money(p.amount)} (${pay(p.status)})`).join(', ')}</p>}
            </>
          )}
        </div>
      )}
    </li>
  );
}

export default function OrdersAdmin() {
  const { t } = useLang();
  const { st } = useLabels();
  const fb = useFeedback();
  const [params] = useSearchParams();
  const [status, setStatus] = useState('');
  const [q, setQ] = useState(params.get('q') || '');
  useEffect(() => setQ(params.get('q') || ''), [params]);

  const query = `${status ? `status=${status}&` : ''}${q.trim() ? `q=${encodeURIComponent(q.trim())}` : ''}`;
  const { data, loading, error, retry } = useFetch(() => adminApi(`/orders${query ? `?${query}` : ''}`), [query]);

  return (
    <>
      <PageHeader title={t('a_orders')} subtitle={t('a_ordersSub')}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('a_searchOrdersPh')} aria-label={t('a_searchOrdersPh')} className={`${inputClass} w-56`} />
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label={t('a_orderStatus')} className={`${inputClass} w-40`}>
          <option value="">{t('a_allOrders')}</option>
          {STATUSES.map((s) => <option key={s} value={s}>{st(s)}</option>)}
        </select>
      </PageHeader>
      {fb.banner}
      {loading ? <Loading /> : error ? <ErrorBox message={error} onRetry={retry} /> : data.length === 0 ? (
        <p className="py-10 text-center text-sm text-stone-500">{t('a_noOrders')}</p>
      ) : (
        <ul className="space-y-3">{data.map((o) => <OrderRow key={o.id} order={o} onChanged={retry} autoOpen={data.length === 1 && Boolean(q.trim())} fb={fb} />)}</ul>
      )}
    </>
  );
}