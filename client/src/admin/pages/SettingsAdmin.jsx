import { useEffect, useState } from 'react';
import useFetch from '../../hooks/useFetch.js';
import { useLang } from '../../context/LanguageContext.jsx';
import { adminApi } from '../adminApi.js';
import { ErrorBox, Loading, PageHeader, btnPrimary, card, inputClass } from '../ui.jsx';

const GROUPS = [
  ['a_g_business', ['business_name', 'phone', 'whatsapp', 'email', 'address_en', 'address_am', 'hours_en', 'hours_am']],
  ['a_g_social', ['telegram', 'facebook', 'instagram', 'tiktok']],
  ['a_g_delivery', ['delivery_fee', 'free_delivery_min_subtotal', 'free_delivery_cities']],
];

export default function SettingsAdmin() {
  const { t } = useLang();
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
      setMsg(t('a_settingsSaved'));
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !s) return error ? <ErrorBox message={error} onRetry={retry} /> : <Loading />;

  return (
    <>
      <PageHeader title={t('a_settings')} subtitle={t('a_settingsSub')} />
      <form onSubmit={save} className="max-w-3xl space-y-6">
        {GROUPS.map(([title, keys]) => (
          <section key={title} className={`${card} space-y-4 p-5`}>
            <h2 className="font-semibold">{t(title)}</h2>
            {keys.map((key) => (
              <label key={key} className="block">
                <span className="mb-1.5 block text-sm font-medium">{t(`a_s_${key}`)}</span>
                <input value={s[key] || ''} onChange={(e) => setS({ ...s, [key]: e.target.value })} className={inputClass} />
              </label>
            ))}
          </section>
        ))}

        <section className={`${card} space-y-3 p-5`}>
          <h2 className="font-semibold">{t('a_g_payment')}</h2>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={s.payment_cod_enabled === '1'} onChange={(e) => setS({ ...s, payment_cod_enabled: e.target.checked ? '1' : '0' })} className="h-4 w-4 accent-olive" />{t('a_payCod')}</label>
          <label className="flex items-center gap-3 text-sm text-stone-400"><input type="checkbox" disabled checked={false} className="h-4 w-4" />{t('a_payChapaOff')}</label>
          <label className="flex items-center gap-3 text-sm text-stone-400"><input type="checkbox" disabled checked={false} className="h-4 w-4" />{t('a_payTelebirrOff')}</label>
          <p className="text-xs text-stone-500">{t('a_payNote')}</p>
        </section>

        {msg && <p className="text-sm text-olive" role="status">{msg}</p>}
        <button type="submit" disabled={saving} className={btnPrimary}>{saving ? t('a_saving') : t('a_saveSettings')}</button>
      </form>
    </>
  );
}