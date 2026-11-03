import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Banknote, CreditCard, Smartphone } from 'lucide-react';
import PageTransition from '../components/PageTransition.jsx';
import { LoginForm, RegisterForm } from '../components/AuthForms.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useLang } from '../context/LanguageContext.jsx';
import { calcDeliveryFee, splitList, useSettings } from '../context/SettingsContext.jsx';
import { useCustomerAuth } from '../context/CustomerAuthContext.jsx';
import { api, onImgError } from '../lib/api.js';
import { saveOrderToken } from '../lib/orders.js';

const PHONE_RE = /^(?:\+251|251|0)?[79]\d{8}$/;
const ISSUE_KEY = { sold_out: 'cartIssueSoldOut', unavailable: 'cartIssueUnavailable', option_required: 'cartIssueOption', option_unavailable: 'cartIssueOption' };
const METHODS = [
  { id: 'cod', icon: Banknote, title: 'payCod', note: 'payCodNote' },
  { id: 'telebirr', icon: Smartphone, title: 'payTelebirr', note: 'payTelebirrNote' },
  { id: 'chapa', icon: CreditCard, title: 'payChapa', note: 'payChapaNote' },
];

export default function Checkout() {
  const { t, tr, money } = useLang();
  const { items, subtotal, clear, validate, hasIssues } = useCart();
  const { settings } = useSettings();
  const { customer, logout } = useCustomerAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('choose'); // choose | login | register | form
  const [form, setForm] = useState({ name: '', phone: '', email: '', city: '', address: '', notes: '' });
  const [payment, setPayment] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const methods = useMemo(() => METHODS.filter((m) => settings[`payment_${m.id}_enabled`] === '1'), [settings]);

  useEffect(() => {
    validate();
  }, [validate]);

  useEffect(() => {
    if (customer) {
      setMode('form');
      setForm((f) => ({
        ...f,
        name: f.name || customer.name || '',
        phone: f.phone || customer.phone || '',
        email: f.email || customer.email || '',
        city: f.city || customer.defaultCity || '',
        address: f.address || customer.defaultAddress || '',
      }));
    }
  }, [customer]);

  useEffect(() => {
    if (!methods.find((m) => m.id === payment)) setPayment(methods[0] ? methods[0].id : '');
  }, [methods, payment]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const fee = calcDeliveryFee(settings, { city: form.city, subtotal });
  const total = subtotal + fee;
  const cities = splitList(settings.free_delivery_cities);

  const check = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = t('errName');
    if (!PHONE_RE.test(form.phone.replace(/[\s-]/g, ''))) e.phone = t('errPhone');
    if (form.city.trim().length < 2) e.city = t('errCity');
    if (form.address.trim().length < 3) e.address = t('errAddress');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setServerError('');
    if (!check() || hasIssues || !payment) return;
    setSubmitting(true);
    try {
      const r = await api('/orders', {
        method: 'POST',
        body: JSON.stringify({
          customer_name: form.name.trim(),
          phone: form.phone.replace(/[\s-]/g, ''),
          email: form.email.trim(),
          city: form.city.trim(),
          address: form.address.trim(),
          notes: form.notes.trim(),
          payment_method: payment,
          items: items.map((i) => ({ productId: i.productId, variantId: i.variantId || 0, qty: i.qty })),
        }),
      });
      saveOrderToken(r.orderNumber, r.accessToken);
      navigate(`/order/${r.orderNumber}`, { replace: true, state: { placed: true } });
      clear();
    } catch (err) {
      setServerError(err.message);
      setSubmitting(false);
      validate();
    }
  };

  if (items.length === 0) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <p className="text-stone-600 dark:text-stone-400">{t('cartEmptyCheckout')}</p>
          <Link to="/shop" className="mt-5 inline-block rounded-full bg-olive px-7 py-3 text-sm font-semibold text-white">{t('continueShopping')}</Link>
        </div>
      </PageTransition>
    );
  }

  const input = (key) => `w-full rounded-xl border bg-transparent px-4 py-3 text-sm outline-none focus:border-olive ${errors[key] ? 'border-red-400' : 'border-sand-300 dark:border-stone-700'}`;
  const card = 'rounded-3xl border border-sand-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900';

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold sm:text-4xl">{t('checkoutTitle')}</h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            {mode === 'choose' && (
              <section className={card}>
                <h2 className="text-xl font-semibold">{t('continueAs')}</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <button onClick={() => setMode('form')} className="rounded-2xl border-2 border-olive p-5 text-left transition hover:bg-olive/5">
                    <p className="font-semibold">{t('continueGuest')}</p>
                    <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{t('guestNote')}</p>
                  </button>
                  <button onClick={() => setMode('login')} className="rounded-2xl border-2 border-sand-300 p-5 text-left transition hover:border-olive dark:border-stone-700">
                    <p className="font-semibold">{t('haveAccount')}</p>
                    <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{t('accountNote')}</p>
                  </button>
                </div>
              </section>
            )}

            {(mode === 'login' || mode === 'register') && (
              <section className={card}>
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{t(mode)}</h2>
                  <button onClick={() => setMode('choose')} className="text-sm text-olive underline">{t('continueGuest')}</button>
                </div>
                {mode === 'login' ? <LoginForm /> : <RegisterForm />}
                <p className="mt-4 text-sm">
                  {mode === 'login' ? t('noAccountYet') : t('alreadyAccount')}{' '}
                  <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="font-medium text-olive underline">
                    {mode === 'login' ? t('register') : t('login')}
                  </button>
                </p>
              </section>
            )}

            {mode === 'form' && (
              <form onSubmit={submit} noValidate className="space-y-8">
                {customer && (
                  <p className="flex flex-wrap items-center gap-3 text-sm">
                    {t('loggedInAs', { name: customer.name })}
                    <button type="button" onClick={logout} className="text-olive underline">{t('logout')}</button>
                  </p>
                )}
                <section className={card}>
                  <h2 className="text-xl font-semibold">{t('deliveryDetails')}</h2>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium" htmlFor="name">{t('fullName')}</label>
                      <input id="name" value={form.name} onChange={set('name')} autoComplete="name" maxLength={100} className={input('name')} />
                      {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium" htmlFor="phone">{t('phone')}</label>
                      <input id="phone" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" placeholder="09XXXXXXXX" className={input('phone')} />
                      {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium" htmlFor="email">{t('emailOptional')}</label>
                      <input id="email" type="email" value={form.email} onChange={set('email')} autoComplete="email" className={input('email')} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium" htmlFor="city">{t('city')}</label>
                      <input id="city" list="city-list" value={form.city} onChange={set('city')} autoComplete="address-level2" maxLength={100} className={input('city')} />
                      <datalist id="city-list">{cities.map((c) => <option key={c} value={c} />)}</datalist>
                      {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium" htmlFor="address">{t('address')}</label>
                      <input id="address" value={form.address} onChange={set('address')} autoComplete="street-address" maxLength={255} className={input('address')} />
                      {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium" htmlFor="notes">{t('notes')}</label>
                      <textarea id="notes" rows={3} value={form.notes} onChange={set('notes')} maxLength={500} className={`${input('notes')} resize-none`} />
                    </div>
                  </div>
                </section>

                <section className={card}>
                  <h2 className="text-xl font-semibold">{t('paymentMethod')}</h2>
                  {methods.length === 0 ? (
                    <p className="mt-4 text-sm text-red-600">{t('noPayment')}</p>
                  ) : (
                    <>
                      <div className="mt-5 space-y-3" role="radiogroup">
                        {methods.map(({ id, icon: Icon, title, note }) => (
                          <label key={id} className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 transition ${payment === id ? 'border-olive bg-olive/5' : 'border-sand-200 dark:border-stone-700'}`}>
                            <input type="radio" name="payment" value={id} checked={payment === id} onChange={() => setPayment(id)} className="h-4 w-4 accent-olive" />
                            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-sand-100 text-olive dark:bg-stone-800"><Icon size={19} /></span>
                            <span>
                              <span className="block text-sm font-semibold">{t(title)}</span>
                              <span className="block text-xs text-stone-500 dark:text-stone-400">{t(note)}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                      <p className="mt-4 text-xs text-stone-500 dark:text-stone-400">{t('paymentNote')}</p>
                    </>
                  )}
                </section>

                {serverError && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300" role="alert">{serverError}</p>}
                {hasIssues && <p className="text-sm text-red-600" role="alert">{t('cartFixIssues')}</p>}
                <button type="submit" disabled={submitting || hasIssues || !payment} className="w-full rounded-full bg-olive py-4 font-semibold text-white transition hover:bg-olive-dark disabled:cursor-not-allowed disabled:opacity-60 lg:hidden">
                  {submitting ? t('placing') : t('placeOrder')}
                </button>
              </form>
            )}
          </div>

          <aside className={`${card} h-fit lg:sticky lg:top-24`}>
            <h2 className="text-xl font-semibold">{t('orderSummary')}</h2>
            <ul className="mt-4 space-y-4">
              {items.map((i) => (
                <li key={i.key} className="flex gap-3">
                  <img src={i.image} alt="" onError={onImgError} className="h-16 w-16 flex-none rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{tr(i.name)}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">{i.variantName ? `${tr(i.variantName)} · ` : ''}x{i.qty}</p>
                    {i.issue && <p className="text-xs font-medium text-red-600">{t(ISSUE_KEY[i.issue] || 'cartIssueUnavailable')}</p>}
                  </div>
                  <p className="text-sm font-semibold">{money(i.price * i.qty)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-5 space-y-2 border-t border-sand-200 pt-4 text-sm dark:border-stone-800">
              <div className="flex justify-between"><dt className="text-stone-500">{t('subtotal')}</dt><dd>{money(subtotal)}</dd></div>
              <div className="flex justify-between">
                <dt className="text-stone-500">{t('delivery')}</dt>
                <dd>{form.city ? (fee > 0 ? money(fee) : t('freeLabel')) : t('deliveryAtOrder')}</dd>
              </div>
              <div className="flex justify-between border-t border-sand-200 pt-3 text-base font-bold dark:border-stone-800"><dt>{t('total')}</dt><dd className="text-olive">{money(total)}</dd></div>
            </dl>
            {mode === 'form' && (
              <button
                type="submit"
                form="checkout-form"
                onClick={(e) => {
                  e.preventDefault();
                  submit(e);
                }}
                disabled={submitting || hasIssues || !payment}
                className="mt-5 hidden w-full rounded-full bg-olive py-4 font-semibold text-white transition hover:bg-olive-dark disabled:cursor-not-allowed disabled:opacity-60 lg:block"
              >
                {submitting ? t('placing') : t('placeOrder')}
              </button>
            )}
          </aside>
        </div>
      </div>
    </PageTransition>
  );
}