import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Banknote, CreditCard, Smartphone } from 'lucide-react';
import PageTransition from '../components/PageTransition.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useLang } from '../context/LanguageContext.jsx';
import { api, onImgError } from '../lib/api.js';

const CITIES = ['Addis Ababa', 'Hawassa', 'Adama', 'Bahir Dar', 'Dire Dawa', 'Mekelle', 'Gondar', 'Jimma', 'Other'];
const PHONE_RE = /^(\+251|251|0)?[79]\d{8}$/;

export default function Checkout() {
  const { t, tr, money } = useLang();
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialPay = ['telebirr', 'chapa', 'cod'].includes(searchParams.get('pay')) ? searchParams.get('pay') : 'cod';
  const [form, setForm] = useState({ name: '', phone: '', city: '', address: '', notes: '' });
  const [payment, setPayment] = useState(initialPay);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = t('errName');
    if (!PHONE_RE.test(form.phone.replace(/[\s-]/g, ''))) e.phone = t('errPhone');
    if (!form.city) e.city = t('errCity');
    if (form.address.trim().length < 3) e.address = t('errAddress');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setServerError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      const result = await api('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.name.trim(),
          phone: form.phone.replace(/[\s-]/g, ''),
          city: form.city,
          address: form.address.trim(),
          notes: form.notes.trim(),
          payment_method: payment,
          items: items.map((i) => ({ productId: i.productId, variantId: i.variantId || null, qty: i.qty })),
        }),
      });
      navigate(`/order/${result.orderId}`, {
        replace: true,
        state: {
          order: {
            id: result.orderId,
            total: result.total,
            payment,
            name: form.name.trim(),
            phone: form.phone.replace(/[\s-]/g, ''),
          },
        },
      });
      clear();
    } catch (err) {
      setServerError(err.message);
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <p className="text-stone-600 dark:text-stone-400">{t('cartEmptyCheckout')}</p>
          <Link to="/shop" className="mt-5 inline-block rounded-full bg-olive px-7 py-3 text-sm font-semibold text-white">
            {t('continueShopping')}
          </Link>
        </div>
      </PageTransition>
    );
  }

  const inputClass = (key) =>
    `w-full rounded-xl border bg-transparent px-4 py-3 text-sm outline-none focus:border-olive ${
      errors[key] ? 'border-red-400' : 'border-sand-300 dark:border-stone-700'
    }`;

  const payOptions = [
    { id: 'telebirr', icon: Smartphone, title: 'payTelebirr', note: 'payTelebirrNote' },
    { id: 'chapa', icon: CreditCard, title: 'payChapa', note: 'payChapaNote' },
    { id: 'cod', icon: Banknote, title: 'payCod', note: 'payCodNote' },
  ];

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold sm:text-4xl">{t('checkoutTitle')}</h1>

        <form onSubmit={submit} noValidate className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            <section className="rounded-3xl border border-sand-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
              <h2 className="text-xl font-semibold">{t('deliveryDetails')}</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium" htmlFor="name">{t('fullName')}</label>
                  <input id="name" value={form.name} onChange={set('name')} autoComplete="name" className={inputClass('name')} />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium" htmlFor="phone">{t('phone')}</label>
                  <input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={set('phone')}
                    autoComplete="tel"
                    placeholder="09XXXXXXXX"
                    className={inputClass('phone')}
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium" htmlFor="city">{t('city')}</label>
                  <select id="city" value={form.city} onChange={set('city')} className={inputClass('city')}>
                    <option value="" />
                    {CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium" htmlFor="address">{t('address')}</label>
                  <input id="address" value={form.address} onChange={set('address')} autoComplete="street-address" className={inputClass('address')} />
                  {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium" htmlFor="notes">{t('notes')}</label>
                  <textarea id="notes" rows={3} value={form.notes} onChange={set('notes')} maxLength={500} className={`${inputClass('notes')} resize-none`} />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-sand-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
              <h2 className="text-xl font-semibold">{t('paymentMethod')}</h2>
              <div className="mt-5 space-y-3" role="radiogroup">
                {payOptions.map(({ id, icon: Icon, title, note }) => (
                  <label
                    key={id}
                    className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 transition ${
                      payment === id ? 'border-olive bg-olive/5' : 'border-sand-200 dark:border-stone-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={id}
                      checked={payment === id}
                      onChange={() => setPayment(id)}
                      className="h-4 w-4 accent-olive"
                    />
                    <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-sand-100 text-olive dark:bg-stone-800">
                      <Icon size={19} />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{t(title)}</span>
                      <span className="block text-xs text-stone-500 dark:text-stone-400">{t(note)}</span>
                    </span>
                  </label>
                ))}
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-3xl border border-sand-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900 lg:sticky lg:top-24">
            <h2 className="text-xl font-semibold">{t('orderSummary')}</h2>
            <ul className="mt-4 space-y-4">
              {items.map((i) => (
                <li key={i.key} className="flex gap-3">
                  <img src={i.image} alt="" onError={onImgError} className="h-16 w-16 flex-none rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{tr(i.name)}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {tr(i.variantName) && `${tr(i.variantName)} · `}x{i.qty}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">{money(i.price * i.qty)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-5 space-y-2 border-t border-sand-200 pt-4 text-sm dark:border-stone-800">
              <div className="flex justify-between">
                <dt className="text-stone-500 dark:text-stone-400">{t('subtotal')}</dt>
                <dd>{money(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-500 dark:text-stone-400">{t('delivery')}</dt>
                <dd>{t('freeCity')}</dd>
              </div>
              <div className="flex justify-between border-t border-sand-200 pt-3 text-base font-bold dark:border-stone-800">
                <dt>{t('total')}</dt>
                <dd className="text-olive">{money(subtotal)}</dd>
              </div>
            </dl>
            {serverError && (
              <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300" role="alert">
                {serverError}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="mt-5 w-full rounded-full bg-olive py-4 font-semibold text-white transition hover:bg-olive-dark disabled:opacity-60"
            >
              {submitting ? t('placing') : t('placeOrder')}
            </button>
          </aside>
        </form>
      </div>
    </PageTransition>
  );
}