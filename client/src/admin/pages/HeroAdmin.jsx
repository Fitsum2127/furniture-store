import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import useFetch from '../../hooks/useFetch.js';
import { useLang } from '../../context/LanguageContext.jsx';
import { api, assetUrl, onImgError } from '../../lib/api.js';
import { adminApi } from '../adminApi.js';
import ActionMenu from '../ActionMenu.jsx';
import { useFeedback } from '../feedback.jsx';
import { Badge, ErrorBox, Loading, PageHeader, btnGhost, btnPrimary, card, inputClass } from '../ui.jsx';

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-stone-500">{hint}</span>}
    </label>
  );
}

function SlideForm({ initial, links, onSaved, onCancel }) {
  const { t } = useLang();
  const editing = Boolean(initial);
  const [f, setF] = useState({
    title_en: initial ? initial.title_en : '', title_am: initial ? initial.title_am || '' : '',
    text_en: initial ? initial.text_en || '' : '', text_am: initial ? initial.text_am || '' : '',
    button_en: initial ? initial.button_en || '' : '', button_am: initial ? initial.button_am || '' : '',
    link_url: initial ? initial.link_url : '/shop', is_active: initial ? Boolean(initial.is_active) : true,
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreview('');
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!editing && !file) return setError(t('a_errSlidePhoto'));
    setSaving(true);
    try {
      const fd = new FormData();
      ['title_en', 'title_am', 'text_en', 'text_am', 'button_en', 'button_am', 'link_url'].forEach((k) => fd.append(k, f[k]));
      fd.append('is_active', f.is_active ? '1' : '0');
      if (file) fd.append('image', file);
      await adminApi(editing ? `/hero/${initial.id}` : '/hero', { method: editing ? 'PUT' : 'POST', body: fd });
      onSaved();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  const current = initial ? assetUrl(initial.image_url) : '';

  return (
    <form onSubmit={submit} className="mb-8 space-y-4 rounded-2xl border-2 border-olive bg-white p-5 dark:bg-stone-900">
      <h2 className="text-lg font-semibold">{editing ? t('a_editSlide') : t('a_addNewSlide')}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('a_heroTitleEn')}><input value={f.title_en} onChange={set('title_en')} required maxLength={200} className={inputClass} /></Field>
        <Field label={t('a_heroTitleAm')}><input value={f.title_am} onChange={set('title_am')} maxLength={200} className={inputClass} /></Field>
        <Field label={t('a_heroTextEn')}><textarea value={f.text_en} onChange={set('text_en')} rows={3} maxLength={500} className={`${inputClass} resize-y`} /></Field>
        <Field label={t('a_heroTextAm')}><textarea value={f.text_am} onChange={set('text_am')} rows={3} maxLength={500} className={`${inputClass} resize-y`} /></Field>
        <Field label={t('a_heroBtnEn')}><input value={f.button_en} onChange={set('button_en')} maxLength={80} className={inputClass} /></Field>
        <Field label={t('a_heroBtnAm')}><input value={f.button_am} onChange={set('button_am')} maxLength={80} className={inputClass} /></Field>
        <div className="sm:col-span-2">
          <Field label={t('a_heroLink')} hint={t('a_heroLinkHint')}>
            <input value={f.link_url} onChange={set('link_url')} list="hero-links" maxLength={300} className={inputClass} />
            <datalist id="hero-links">{links.map((l) => <option key={l} value={l} />)}</datalist>
          </Field>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">{t('a_heroImage')}</p>
        <div className="flex flex-wrap items-center gap-4">
          {(preview || current) && <img src={preview || current} alt="" onError={onImgError} className="h-24 w-44 rounded-xl object-cover" />}
          <label className={`${btnGhost} cursor-pointer`}>
            <Upload size={16} /> {editing ? t('a_replacePhoto') : t('a_choosePhoto')}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { setFile(e.target.files && e.target.files[0] ? e.target.files[0] : null); e.target.value = ''; }} className="hidden" />
          </label>
        </div>
        <p className="mt-1 text-xs text-stone-500">{t('a_heroImageHint')}</p>
      </div>

      <label className="flex items-center gap-3 text-sm font-medium"><input type="checkbox" checked={f.is_active} onChange={(e) => setF((x) => ({ ...x, is_active: e.target.checked }))} className="h-4 w-4 accent-olive" />{t('a_visible')}</label>
      {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className={btnPrimary}>{saving ? t('a_saving') : editing ? t('a_saveChanges') : t('a_addSlide')}</button>
        <button type="button" onClick={onCancel} className={btnGhost}>{t('a_cancel')}</button>
      </div>
    </form>
  );
}

export default function HeroAdmin() {
  const { t } = useLang();
  const fb = useFeedback();
  const { data, loading, error, retry } = useFetch(() => adminApi('/hero'), []);
  const cats = useFetch(() => api('/categories'), []);
  const [editing, setEditing] = useState(null);
  const list = data || [];
  const links = ['/shop', '/about', '/contact', '/faq', ...((cats.data || []).map((c) => `/shop?category=${c.slug}`))];

  const run = async (fn, okText) => {
    try {
      await fn();
      if (okText) fb.success(okText);
      retry();
    } catch (err) {
      fb.error(err.message);
    }
  };
  const move = (s, direction) => run(() => adminApi(`/hero/${s.id}/move`, { method: 'PATCH', body: JSON.stringify({ direction }) }));
  const toggle = (s) => run(() => adminApi(`/hero/${s.id}/active`, { method: 'PATCH', body: JSON.stringify({ is_active: s.is_active ? 0 : 1 }) }), t('a_updated'));
  const remove = (s) =>
    fb.confirm({
      text: t('a_confirmDeleteSlide', { name: s.title_en }),
      confirmLabel: t('a_yesDelete'),
      danger: true,
      onConfirm: () => run(() => adminApi(`/hero/${s.id}`, { method: 'DELETE' }), t('a_slideDeleted', { name: s.title_en })),
    });

  return (
    <>
      <PageHeader title={t('a_heroPage')} subtitle={t('a_heroSub')}>
        <a href="/" target="_blank" rel="noreferrer" className={btnGhost}>{t('a_viewHome')}</a>
        {!editing && <button onClick={() => setEditing('new')} className={btnPrimary}><Plus size={16} /> {t('a_addSlide')}</button>}
      </PageHeader>
      {fb.banner}
      <p className="mb-4 text-sm text-stone-500 dark:text-stone-400">{t('a_heroTip')}</p>

      {editing && (
        <SlideForm
          key={editing === 'new' ? 'new' : editing.id}
          initial={editing === 'new' ? null : editing}
          links={links}
          onSaved={() => { setEditing(null); fb.success(t('a_saved')); retry(); }}
          onCancel={() => setEditing(null)}
        />
      )}

      {loading ? <Loading /> : error ? <ErrorBox message={error} onRetry={retry} /> : list.length === 0 ? (
        <p className="py-10 text-center text-sm text-stone-500">{t('a_noSlides')}</p>
      ) : (
        <ul className="space-y-3">
          {list.map((s, i) => (
            <li key={s.id} className={`${card} flex flex-wrap items-center gap-4 p-4`}>
              <img src={assetUrl(s.image_url)} alt="" onError={onImgError} className="h-16 w-28 flex-none rounded-xl object-cover" />
              <div className="min-w-0 flex-1 basis-48">
                <p className="truncate font-medium">{s.title_en}</p>
                <p className="line-clamp-1 text-xs text-stone-500">{s.text_en}</p>
                <p className="truncate text-xs text-olive">{s.link_url}</p>
              </div>
              <Badge color={s.is_active ? 'green' : 'gray'}>{s.is_active ? t('a_visible') : t('a_hidden')}</Badge>
              <ActionMenu
                items={[
                  { label: t('a_edit'), icon: Pencil, onClick: () => setEditing(s) },
                  i > 0 && { label: t('a_moveUp'), icon: ArrowUp, onClick: () => move(s, 'up') },
                  i < list.length - 1 && { label: t('a_moveDown'), icon: ArrowDown, onClick: () => move(s, 'down') },
                  { label: s.is_active ? t('a_hide') : t('a_show'), icon: s.is_active ? EyeOff : Eye, onClick: () => toggle(s) },
                  { label: t('a_delete'), icon: Trash2, danger: true, onClick: () => remove(s) },
                ]}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}