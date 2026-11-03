import { useState } from 'react';
import { ChevronDown, Phone } from 'lucide-react';
import useFetch from '../../hooks/useFetch.js';
import { onImgError } from '../../lib/api.js';
import { adminApi } from '../adminApi.js';
import { Badge, ErrorBox, Loading, PageHeader, fmtDate, inputClass, money } from '../ui.jsx';

const STATUSES = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const PAYMENTS = ['pending', 'paid', 'failed'];
const statusColor = { new: 'blue', confirmed: 'amber', shipped: 'amber', delivered: 'green', cancelled: 'red' };
const payColor = { pending: 'amber', paid: 'green', failed: 'red' };

function OrderRow({ order, onChanged }) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [err, setErr] = useState('');

  const loadDetail = async () => {
    try {
      setDetail(await adminApi(`/orders/${order.id}`));
    } catch (e) {
      setErr(e.message);
    }
  };

  const update = async (patch) => {
    setErr('');
    if (patch.payment_status === 'paid' && !window.confirm('Mark as PAID only if you have really received the money. Continue?')) return;
    if (patch.status === 'cancelled' && !window.confirm('Cancel this order? The items go back into stock.')) return;
    try {
      await adminApi(`/orders/${order.id}`, { method: 'PATCH', body: JSON.stringify(patch) });
      onChanged();
      await loadDetail();
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <li className="rounded-2xl border border-sand-200 bg-white dark:border-stone-800 dark:bg-stone-900">
      <button onClick={() => { const n = !open; setOpen(n); if (n && !detail) loadDetail(); }} className="flex w-full flex-wrap items-center gap-3 p-4 text-left" aria-expanded={open}>
        <div className="min-w-0 flex-1 basis-44">
          <p className="font-medium">{order.order_number} · {order.customer_name}</p>
          <p className="text-xs text-stone-500">{fmtDate(order.created_at)} · {order.items_count} item(s) · {order.city}{order.customer_id ? ' · account' : ' · guest'}</p>
        </div>
        <p className="font-semibold">{money(order.total)}</p>
        <Badge color={statusColor[order.status]}>{order.status}</Badge>
        <Badge color={payColor[order.payment_status]}>{order.payment_method} · {order.payment_status}</Badge>
        <ChevronDown size={18} className={`transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="space-y-4 border-t border-sand-200 p-4 dark:border-stone-800">
          {err && <p className="text-sm text-red-500" role="alert">{err}</p>}
          {!detail ? <Loading /> : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="text-sm">
                  <p className="font-semibold">Customer</p>
                  <p>{detail.customer_name}</p>
                  <a href={`tel:${detail.phone}`} className="inline-flex items-center gap-1.5 text-olive underline"><Phone size={14} /> {detail.phone}</a>
                  {detail.email && <p>{detail.email}</p>}
                  <p className="mt-1">{detail.city}, {detail.address}</p>
                  {detail.notes && <p className="mt-1 text-stone-500">Note: {detail.notes}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs font-medium">Order status
                    <select value={detail.status} disabled={detail.status === 'cancelled'} onChange={(e) => update({ status: e.target.value })} className={`${inputClass} mt-1`}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </label>
                  <label className="text-xs font-medium">Payment
                    <select value={detail.payment_status} disabled={detail.status === 'cancelled'} onChange={(e) => update({ payment_status: e.target.value })} className={`${inputClass} mt-1`}>
                      {PAYMENTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </label>
                  <p className="col-span-2 text-xs text-stone-500">Mark an order as paid only after the money has been received. Cancelling puts items back in stock and cannot be undone.</p>
                </div>
              </div>

              <ul className="divide-y divide-sand-200 dark:divide-stone-800">
                {detail.items.map((it) => (
                  <li key={it.id} className="flex items-center gap-3 py-3 text-sm">
                    <img src={it.thumbnail} alt="" onError={onImgError} className="h-12 w-12 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{it.name_en}{it.variant_name_en ? ` (${it.variant_name_en})` : ''}</p>
                      <p className="text-xs text-stone-500">{it.sku}</p>
                    </div>
                    <p>x{it.qty}</p>
                    <p className="w-28 text-right font-semibold">{money(it.unit_price * it.qty)}</p>
                  </li>
                ))}
              </ul>
              <dl className="ml-auto max-w-xs space-y-1 text-sm">
                <div className="flex justify-between"><dt className="text-stone-500">Subtotal</dt><dd>{money(detail.subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-stone-500">Delivery</dt><dd>{money(detail.delivery_fee)}</dd></div>
                <div className="flex justify-between font-bold"><dt>Total</dt><dd>{money(detail.total)}</dd></div>
              </dl>
              {detail.payments.length > 0 && (
                <p className="text-xs text-stone-500">Payments: {detail.payments.map((p) => `${p.provider} ${money(p.amount)} (${p.status})`).join(', ')}</p>
              )}
            </>
          )}
        </div>
      )}
    </li>
  );
}

export default function OrdersAdmin() {
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const query = `${status ? `status=${status}&` : ''}${q.trim() ? `q=${encodeURIComponent(q.trim())}` : ''}`;
  const { data, loading, error, retry } = useFetch(() => adminApi(`/orders${query ? `?${query}` : ''}`), [query]);

  return (
    <>
      <PageHeader title="Orders" subtitle="Click an order to see details and change its status">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search number, name, phone" aria-label="Search orders" className={`${inputClass} w-56`} />
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status" className={`${inputClass} w-40`}>
          <option value="">All orders</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </PageHeader>
      {loading ? <Loading /> : error ? <ErrorBox message={error} onRetry={retry} /> : data.length === 0 ? (
        <p className="py-10 text-center text-sm text-stone-500">No orders found.</p>
      ) : (
        <ul className="space-y-3">{data.map((o) => <OrderRow key={o.id} order={o} onChanged={retry} />)}</ul>
      )}
    </>
  );
}