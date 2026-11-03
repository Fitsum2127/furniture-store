import { useState } from 'react';
import PageTransition from '../components/PageTransition.jsx';
import OrderView from '../components/OrderView.jsx';
import { useLang } from '../context/LanguageContext.jsx';
import { api } from '../lib/api.js';

export default function TrackOrder() {
  const { t } = useLang();
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setOrder(null);
    setBusy(true);
    try {
      setOrder(await api('/orders/lookup', { method: 'POST', body: JSON.stringify({ orderNumber: orderNumber.trim(), phone }) }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const field = 'w-full rounded-xl border border-sand-300 bg-transparent px-4 py-3 text-sm outline-none focus:border-olive dark:border-stone-700';
  return (
    <PageTransition>
      <div className="mx-auto max-w-2xl px-4 py-14">
        <div className="text-center">
          <h1 className="text-3xl font-semibold sm:text-4xl">{t('trackOrder')}</h1>
          <p className="mt-3 text-sm text-stone-600 dark:text-stone-400">{t('trackSub')}</p>
        </div>
        <form onSubmit={submit} className="mx-auto mt-8 max-w-sm space-y-4">
          <input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="BF-XXXXXXXX" aria-label={t('orderNumberLabel')} className={field} required />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="09XXXXXXXX" aria-label={t('phone')} className={field} required />
          {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
          <button type="submit" disabled={busy} className="w-full rounded-full bg-olive py-3.5 text-sm font-semibold text-white hover:bg-olive-dark disabled:opacity-60">{t('findOrder')}</button>
        </form>
        {order && <div className="mt-8"><OrderView order={order} /></div>}
      </div>
    </PageTransition>
  );
}