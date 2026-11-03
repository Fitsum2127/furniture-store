import { useEffect, useState } from 'react';
import useFetch from '../../hooks/useFetch.js';
import { adminApi } from '../adminApi.js';
import { ErrorBox, Loading, PageHeader, btnPrimary, inputClass } from '../ui.jsx';

const GROUPS = [
  ['Business', [['business_name', 'Business name'], ['phone', 'Phone number'], ['whatsapp', 'WhatsApp number with country code, digits only (example 2519XXXXXXXX)'], ['email', 'Email address'], ['address_en', 'Address (English)'], ['address_am', 'Address (አማርኛ)'], ['hours_en', 'Opening hours (English)'], ['hours_am', 'Opening hours (አማርኛ)']]],
  ['Social media links (full link starting with https://)', [['telegram', 'Telegram'], ['facebook', 'Facebook'], ['instagram', 'Instagram'], ['tiktok', 'TikTok']]],
  ['Delivery', [['delivery_fee', 'Delivery fee (ETB). 0 means free'], ['free_delivery_min_subtotal', 'Free delivery when the order is at least (ETB). Empty = off'], ['free_delivery_cities', 'Cities with free delivery, separated by commas']]],
];

export default function SettingsAdmin() {
  const { data, loading, error, retry } = useFetch(() => adminApi('/settings'), []);
  const [s, setS] = useState(null);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setS(data);
  }, [data]);

  const save = async (e) => {
    e.preventDefault();
    setMsg('');
    setSaving(true);
    try {
      setS(await adminApi('/settings', { method: 'PUT', body: JSON.stringify(s) }));
      setMsg('Saved. The website now shows these details.');
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !s) return error ? <ErrorBox message={error} onRetry={retry} /> : <Loading />;

  return (
    <>
      <PageHeader title="Business settings" subtitle="Contact details, delivery and payment methods shown on the website" />
      <form onSubmit={save} className="max-w-3xl space-y-6">
        {GROUPS.map(([title, fields]) => (
          <section key={title} className="space-y-4 rounded-2xl border border-sand-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
            <h2 className="font-semibold">{title}</h2>
            {fields.map(([key, label]) => (
              <label key={key} className="block">
                <span className="mb-1.5 block text-sm font-medium">{label}</span>
                <input value={s[key] || ''} onChange={(e) => setS({ ...s, [key]: e.target.value })} className={inputClass} />
              </label>
            ))}
          </section>
        ))}

        <section className="space-y-3 rounded-2xl border border-sand-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
          <h2 className="font-semibold">Payment methods shown at checkout</h2>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={s.payment_cod_enabled === '1'} onChange={(e) => setS({ ...s, payment_cod_enabled: e.target.checked ? '1' : '0' })} className="h-4 w-4 accent-olive" />Cash on delivery</label>
          <label className="flex items-center gap-3 text-sm text-stone-400"><input type="checkbox" disabled checked={false} className="h-4 w-4" />Chapa (not available: real payment integration is not set up)</label>
          <label className="flex items-center gap-3 text-sm text-stone-400"><input type="checkbox" disabled checked={false} className="h-4 w-4" />Telebirr (not available: real payment integration is not set up)</label>
          <p className="text-xs text-stone-500">Online payment methods stay off until they are integrated and verified with real merchant credentials.</p>
        </section>

        {msg && <p className="text-sm text-olive" role="status">{msg}</p>}
        <button type="submit" disabled={saving} className={btnPrimary}>{saving ? 'Saving...' : 'Save settings'}</button>
      </form>
    </>
  );
}