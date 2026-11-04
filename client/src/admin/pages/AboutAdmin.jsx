import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import useFetch from '../../hooks/useFetch.js';
import { useLang } from '../../context/LanguageContext.jsx';
import { onImgError } from '../../lib/api.js';
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

function SectionForm({ initial, onSaved, onCancel }) {
  const { t } = useLang();
  const editing = Boolean(initial && initial.id);
  const [f, setF] = useState({ title_en: initial ? initial.title_en : '', title_am: initial ? initial.title_am || '' : '', body_en: initial ? initial.body_en : '', body_am: initial ? initial.body_am || '' : '', is_active: initial ? Boolean(initial.is_active) : true });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [removeImage, setRemoveImage] = useState(false);
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

  const set = (key) => (e) => setF((x) => ({ ...x, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const fd = new FormData();
      ['title_en', 'title_am', 'body_en', 'body_am'].forEach((k) => fd.append(k, f[k]));
      fd.append('is_active', f.is_active ? '1' : '0');
      if (file) fd.append('image', file);
      if (removeImage && !file) fd.append('remove_image', '1');
      await adminApi(editing ? `/about/${initial.id}` : '/about', { method: editing ? 'PUT' : 'POST', body: fd });
      onSaved();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  const currentImage = !removeImage && initial && initial.image_url;

  return (
    <form onSubmit={submit} className="mb-8 space-y-4 rounded-2xl border-2 border-olive bg-white p-5 dark:bg-stone-900">
      <h2 className="text-lg font-semibold">{editing ? t('a_editSection') : t('a_addNewSection')}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('a_titleEnStar')}><input value={f.title_en} onChange={set('title_en')} required maxLength={200} className={inputClass} /></Field>
        <Field label={t('a_titleAm')} hint={t('a_titleAmHint')}><input value={f.title_am} onChange={set('title_am')} maxLength={200} className={inputClass} /></Field>
        <Field label={t('a_textEnStar')} hint={t('a_paraHint')}><textarea value={f.body_en} onChange={set('body_en')} required rows={7} maxLength={5000} className={`${inputClass} resize-y`} /></Field>
        <Field label={t('a_textAm')}><textarea value={f.body_am} onChange={set('body_am')} rows={7} maxLength={5000} className={`${inputClass} resize-y`} /></Field>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">{t('a_photoOptional')}</p>
        <div className="flex flex-wrap items-center gap-4">
          {(preview || currentImage) && <img src={preview || currentImage} alt="" onError={onImgError} className="h-24 w-32 rounded-xl object-cover" />}
          <label className={`${btnGhost} cursor-pointer`}>
            <Upload size={16} /> {initial && initial.image_url ? t('a_replacePhoto') : t('a_choosePhoto')}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { setFile(e.target.files && e.target.files[0] ? e.target.files[0] : null); setRemoveImage(false); e.target.value = ''; }} className="hidden" />
          </label>
          {editing && initial.image_url && !file && (
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={removeImage} onChange={(e) => setRemoveImage(e.target.checked)} className="h-4 w-4 accent-olive" />{t('a_removePhoto')}</label>
          )}
        </div>
        <p className="mt-1 text-xs text-stone-500">{t('a_photoHint')}</p>
      </div>

      <label className="flex items-center gap-3 text-sm font-medium"><input type="checkbox" checked={f.is_active} onChange={(e) => setF((x) => ({ ...x, is_active: e.target.checked }))} className="h-4 w-4 accent-olive" />{t('a_showOnAbout')}</label>
      {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className={btnPrimary}>{saving ? t('a_saving') : editing ? t('a_saveChanges') : t('a_addSection')}</button>
        <button type="button" onClick={onCancel} className={btnGhost}>{t('a_cancel')}</button>
      </div>
    </form>
  );
}

export default function AboutAdmin() {
  const { t } = useLang();
  const fb = useFeedback();
  const { data, loading, error, retry } = useFetch(() => adminApi('/about'), []);
  const [editing, setEditing] = useState(null);

  const run = async (fn, okText) => {
    try {
      await fn();
      if (okText) fb.success(okText);
      retry();
    } catch (err) {
      fb.error(err.message);
    }
  };
  const move = (s, direction) => run(() => adminApi(`/about/${s.id}/move`, { method: 'PATCH', body: JSON.stringify({ direction }) }));
  const toggle = (s) => run(() => adminApi(`/about/${s.id}/active`, { method: 'PATCH', body: JSON.stringify({ is_active: s.is_active ? 0 : 1 }) }), t('a_updated'));
  const remove = (s) =>
    fb.confirm({
      text: t('a_confirmDeleteSection', { name: s.title_en }),
      confirmLabel: t('a_yesDelete'),
      danger: true,
      onConfirm: () => run(() => adminApi(`/about/${s.id}`, { method: 'DELETE' }), t('a_sectionDeleted', { name: s.title_en })),
    });
  const list = data || [];

  return (
    <>
      <PageHeader title={t('a_aboutPage')} subtitle={t('a_aboutSub')}>
        <a href="/about" target="_blank" rel="noreferrer" className={btnGhost}>{t('a_viewPage')}</a>
        {!editing && <button onClick={() => setEditing('new')} className={btnPrimary}><Plus size={16} /> {t('a_addSection')}</button>}
      </PageHeader>
      {fb.banner}

      {editing && <SectionForm key={editing === 'new' ? 'new' : editing.id} initial={editing === 'new' ? null : editing} onSaved={() => { setEditing(null); fb.success(t('a_saved')); retry(); }} onCancel={() => setEditing(null)} />}

      {loading ? <Loading /> : error ? <ErrorBox message={error} onRetry={retry} /> : list.length === 0 ? (
        <p className="py-10 text-center text-sm text-stone-500">{t('a_noSections')}</p>
      ) : (
        <ul className="space-y-3">
          {list.map((s, i) => (
            <li key={s.id} className={`${card} flex flex-wrap items-center gap-4 p-4`}>
              {s.image_url ? <img src={s.image_url} alt="" onError={onImgError} className="h-16 w-20 flex-none rounded-xl object-cover" /> : <div className="flex h-16 w-20 flex-none items-center justify-center rounded-xl bg-sand-100 text-xs text-stone-500 dark:bg-stone-800">{t('a_noPhoto')}</div>}
              <div className="min-w-0 flex-1 basis-48"><p className="truncate font-medium">{s.title_en}</p><p className="line-clamp-2 text-xs text-stone-500">{s.body_en}</p></div>
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