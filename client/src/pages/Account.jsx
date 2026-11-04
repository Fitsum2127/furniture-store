import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition.jsx';
import PasswordField from '../components/PasswordField.jsx';
import { useCustomerAuth } from '../context/CustomerAuthContext.jsx';
import { useLang } from '../context/LanguageContext.jsx';
import useFetch from '../hooks/useFetch.js';
import { api } from '../lib/api.js';

const STATUS = { new: 'statusNew', confirmed: 'statusConfirmed', shipped: 'statusShipped', delivered: 'statusDelivered', cancelled: 'statusCancelled' };
const field = 'w-full rounded-xl border border-sand-300 bg-transparent px-4 py-3 text-sm outline-none focus:border-olive dark:border-stone-700';
const card = 'rounded-3xl border border-sand-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900';

export default function Account() {
  const { t, money, lang } = useLang();
  const { customer, loading, logout, setCustomer } = useCustomerAuth();
  const orders = useFetch(() => (customer ? api('/customers/orders') : Promise.resolve([])), [customer && customer.id]);
  const [p, setP] = useState({ name: '', email: '', city: '', address: '' });
  const [msg, setMsg] = useState('');
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [pwMsg, setPwMsg] = useState('');

  useEffect(() => {
    if (customer) setP({ name: customer.name || '', email: customer.email || '', city: customer.defaultCity || '', address: customer.defaultAddress || '' });
  }, [customer]);

  if (loading) return <p className="py-24 text-center text-sm text-stone-500">...</p>;
  if (!customer) return <Navigate to="/login?next=/account" replace />;

  const save = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const d = await api('/customers/me', { method: 'PUT', body: JSON.stringify(p) });
      setCustomer(d.customer);
      setMsg(t('saved'));
    } catch (err) {
      setMsg(err.message);
    }
  };

  const changePw = async (e) => {
    e.preventDefault();
    setPwMsg('');
    if (pw.newPassword.length < 8) return setPwMsg(t('errPassword'));
    try {
      await api('/customers/password', { method: 'POST', body: JSON.stringify(pw) });
      setPw({ currentPassword: '', newPassword: '' });
      setPwMsg(t('passwordChanged'));
    } catch (err) {
      setPwMsg(err.message);
    }
  };

  const fmt = (d) => new Date(d).toLocaleDateString(lang === 'am' ? 'am-ET' : 'en-GB', { dateStyle: 'medium' });

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold">{t('myAccount')}</h1>
          <button onClick={logout} className="rounded-full border border-sand-300 px-5 py-2 text-sm font-medium dark:border-stone-700">{t('logout')}</button>
        </div>

        <section className={card}>
          <h2 className="text-xl font-semibold">{t('myOrders')}</h2>
          {orders.loading ? (
            <p className="mt-4 text-sm text-stone-500">...</p>
          ) : !orders.data || orders.data.length === 0 ? (
            <p className="mt-4 text-sm text-stone-500">{t('noOrders')}</p>
          ) : (
            <ul className="mt-4 divide-y divide-sand-200 dark:divide-stone-800">
              {orders.data.map((o) => (
                <li key={o.orderNumber}>
                  <Link to={`/order/${o.orderNumber}`} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm hover:text-olive">
                    <span className="font-semibold">{o.orderNumber}</span>
                    <span className="text-stone-500">{fmt(o.createdAt)} · {t(STATUS[o.status])}</span>
                    <span className="font-semibold">{money(o.total)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <form onSubmit={save} className={`${card} space-y-4`}>
          <h2 className="text-xl font-semibold">{t('profile')}</h2>
          <p className="text-sm text-stone-500">{customer.phone}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <input value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} placeholder={t('fullName')} aria-label={t('fullName')} className={field} />
            <input value={p.email} onChange={(e) => setP({ ...p, email: e.target.value })} placeholder={t('emailOptional')} aria-label={t('emailOptional')} type="email" className={field} />
            <input value={p.city} onChange={(e) => setP({ ...p, city: e.target.value })} placeholder={t('city')} aria-label={t('city')} className={field} />
            <input value={p.address} onChange={(e) => setP({ ...p, address: e.target.value })} placeholder={t('address')} aria-label={t('address')} className={field} />
          </div>
          {msg && <p className="text-sm text-olive" role="status">{msg}</p>}
          <button type="submit" className="rounded-full bg-olive px-8 py-3 text-sm font-semibold text-white hover:bg-olive-dark">{t('save')}</button>
        </form>

        <form onSubmit={changePw} className={`${card} space-y-4`}>
          <h2 className="text-xl font-semibold">{t('changePassword')}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <PasswordField value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} placeholder={t('currentPassword')} aria-label={t('currentPassword')} autoComplete="current-password" className={field} />
            <PasswordField value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} placeholder={t('newPassword')} aria-label={t('newPassword')} autoComplete="new-password" className={field} />
          </div>
          {pwMsg && <p className="text-sm text-olive" role="status">{pwMsg}</p>}
          <button type="submit" className="rounded-full border border-olive px-8 py-3 text-sm font-semibold text-olive hover:bg-olive hover:text-white">{t('save')}</button>
        </form>
      </div>
    </PageTransition>
  );
}