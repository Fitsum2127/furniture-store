import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import PageTransition from '../components/PageTransition.jsx';
import OrderView from '../components/OrderView.jsx';
import { useLang } from '../context/LanguageContext.jsx';
import { useCustomerAuth } from '../context/CustomerAuthContext.jsx';
import { api } from '../lib/api.js';
import { getOrderToken, saveOrderToken } from '../lib/orders.js';

// Opens an order using (1) the secret key saved on this device or in the link, (2) the logged-in account, or (3) the phone number.
export default function OrderSuccess() {
  const { number } = useParams();
  const { state } = useLocation();
  const { t } = useLang();
  const { customer, loading: authLoading } = useCustomerAuth();
  const [order, setOrder] = useState(null);
  const [phase, setPhase] = useState('loading'); // loading | ready | askPhone | error
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const orderNumber = String(number || '').toUpperCase();

  useEffect(() => {
    const m = /[#&]t=([A-Za-z0-9_-]+)/.exec(window.location.hash);
    if (m) {
      saveOrderToken(orderNumber, m[1]);
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [orderNumber]);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    const done = (o) => !cancelled && (setOrder(o), setPhase('ready'));
    (async () => {
      const token = getOrderToken(orderNumber);
      if (token) {
        try {
          return done(await api(`/orders/${orderNumber}`, { headers: { 'X-Order-Token': token } }));
        } catch (e) {
          /* try the next way */
        }
      }
      if (customer) {
        try {
          return done(await api(`/customers/orders/${orderNumber}`));
        } catch (e) {
          /* try the next way */
        }
      }
      if (!cancelled) setPhase('askPhone');
    })();
    return () => {
      cancelled = true;
    };
  }, [orderNumber, customer, authLoading]);

  const lookup = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setOrder(await api('/orders/lookup', { method: 'POST', body: JSON.stringify({ orderNumber, phone }) }));
      setPhase('ready');
    } catch (err) {
      setError(err.message);
    }
  };

  const token = getOrderToken(orderNumber);
  const secretLink = token ? `${window.location.origin}/order/${orderNumber}#t=${token}` : '';
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(secretLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      /* ignore */
    }
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-2xl px-4 py-14">
        {phase === 'loading' && <p className="py-20 text-center text-sm text-stone-500">...</p>}

        {phase === 'askPhone' && (
          <form onSubmit={lookup} className="mx-auto max-w-sm space-y-4 text-center">
            <h1 className="text-2xl font-semibold">{orderNumber}</h1>
            <p className="text-sm text-stone-600 dark:text-stone-400">{t('lookupPhoneNeeded')}</p>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="09XXXXXXXX" aria-label={t('phone')} className="w-full rounded-xl border border-sand-300 bg-transparent px-4 py-3 text-sm outline-none focus:border-olive dark:border-stone-700" />
            {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
            <button type="submit" className="w-full rounded-full bg-olive py-3.5 text-sm font-semibold text-white hover:bg-olive-dark">{t('viewOrder')}</button>
          </form>
        )}

        {phase === 'ready' && order && (
          <>
            {state && state.placed && (
              <div className="mb-6 text-center">
                <CheckCircle2 size={48} className="mx-auto text-olive" />
                <h1 className="mt-3 text-3xl font-semibold">{t('orderPlaced')}</h1>
                <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">{t('stepCall', { phone: order.customer.phone })}</p>
              </div>
            )}
            <OrderView order={order} />
            {secretLink && (
              <div className="mt-5 rounded-2xl bg-sand-100 p-4 text-sm dark:bg-stone-900">
                <p className="font-medium">{t('saveLinkTitle')}</p>
                <p className="mt-1 break-all text-xs text-stone-500">{secretLink}</p>
                <button onClick={copy} className="mt-2 text-xs font-semibold text-olive underline">{copied ? t('copied') : t('copyLink')}</button>
              </div>
            )}
            <div className="mt-6 text-center">
              <Link to="/shop" className="rounded-full bg-olive px-8 py-3 text-sm font-semibold text-white hover:bg-olive-dark">{t('backToShop')}</Link>
            </div>
          </>
        )}
      </div>
    </PageTransition>
  );
}