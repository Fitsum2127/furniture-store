import { useEffect, useState } from 'react';
import { Trash2, Upload } from 'lucide-react';
import useFetch from '../../hooks/useFetch.js';
import { useLang } from '../../context/LanguageContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { assetUrl } from '../../lib/api.js';
import { adminApi } from '../adminApi.js';
import { useFeedback } from '../feedback.jsx';
import { ErrorBox, Loading, PageHeader, btnGhost, btnPrimary, card, inputClass } from '../ui.jsx';

const GROUPS = [
  ['a_g_business', ['business_name', 'phone', 'whatsapp', 'email', 'address_en', 'address_am', 'hours_en', 'hours_am']],
  ['a_g_social', ['telegram', 'facebook', 'instagram', 'tiktok']],
  ['a_g_delivery', ['delivery_fee', 'free_delivery_min_subtotal', 'free_delivery_cities']],
];

function ImageBox({ title, hint, value, kind, onChanged, fb }) {
  const { t } = useLang();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const url = assetUrl(value);
  useEffect(() => setFailed(false), [url]);

  const send = async (fn) => {
    setBusy(true);
    try {
      onChanged(await fn());
      fb.success(t('a_saved'));
    } catch (e) {
      fb.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  const upload = (file) => {
    const fd = new FormData();
    fd.append('image', file);
    return send(() => adminApi(`/settings/images/${kind}`, { method: 'POST', body: fd }));
  };
  const remove = () => send(() => adminApi(`/settings/images/${kind}`, { method: 'DELETE' }));

  return (
    <div>
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-0.5 text-xs text-stone-500">{hint}</p>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <span className="flex h-20 w-32 items-center justify-center overflow-hidden rounded-xl border border-sand-200 bg-sand-100 p-1 text-center text-xs text-stone-500 dark:border-stone-700 dark:bg-stone-800">
          {url && !failed ? <img src={url} alt="" onError={() => setFailed(true)} className="h-full w-full object-contain" /> : url ? t('a_imageMissing') : t('a_noLogo')}
        </span>
        <label className={`${btnGhost} cursor-pointer ${busy ? 'pointer-events-none opacity-60' : ''}`}>
          <Upload size={16} /> {url ? t('a_replaceImage') : t('a_uploadImage')}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { if (e.target.files[0]) upload(e.target.files[0]); e.target.value = ''; }} className="hidden" />
        </label>
        {url && <button type="button" onClick={remove} disabled={busy} className={`${btnGhost} text-red-600`}><Trash2 size={15} /> {t('a_removeImage')}</button>}
      </div>
    </div>
  );
}

export default function SettingsAdmin() {
  const { t } = useLang();
  const { reload } = useSettings();
  const fb = useFeedback();
  const { data, loading, error, retry } = useFetch(() => adminApi('/settings'), []);
  const [s, setS] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setS(data);
  }, [data]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      setS(await adminApi('/settings', { method: 'PUT', body: JSON.stringify(s) }));
      fb.success(t('a_settingsSaved'));
      reload();
    } catch (err) {
      fb.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Only the two image fields change after an upload, so unsaved text edits are kept.
  const imageChanged = (r) => {
    setS((prev) => ({ ...prev, logo_url: r.logo_url, favicon_url: r.favicon_url }));
    reload();
  };

  if (loading || !s) return error ? <ErrorBox message={error} onRetry={retry} /> : <Loading />;

  return (
    <>
      <PageHeader title={t('a_settings')} subtitle={t('a_settingsSub')} />
      {fb.banner}
      <form onSubmit={save} className="max-w-3xl space-y-6">
        <section className={`${card} space-y-6 p-5`}>
          <h2 className="font-semibold">{t('a_g_logo')}</h2>
          <ImageBox title={t('a_logoSite')} hint={t('a_logoSiteHint')} value={s.logo_url} kind="logo" onChanged={imageChanged} fb={fb} />
          <ImageBox title={t('a_logoFavicon')} hint={t('a_logoFaviconHint')} value={s.favicon_url} kind="favicon" onChanged={imageChanged} fb={fb} />
        </section>

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

        <button type="submit" disabled={saving} className={btnPrimary}>{saving ? t('a_saving') : t('a_saveSettings')}</button>
      </form>
    </>
  );
}