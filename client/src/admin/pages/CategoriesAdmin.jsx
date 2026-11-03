import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import useFetch from '../../hooks/useFetch.js';
import { useLang } from '../../context/LanguageContext.jsx';
import { onImgError } from '../../lib/api.js';
import { adminApi } from '../adminApi.js';
import ActionMenu from '../ActionMenu.jsx';
import { Badge, ErrorBox, Loading, Notice, PageHeader, btnGhost, btnPrimary, card, inputClass } from '../ui.jsx';

function CategoryForm({ initial, onSaved, onCancel }) {
  const { t } = useLang();
  const editing = Boolean(initial);
  const [f, setF] = useState({ slug: initial ? initial.slug : '', name_en: initial ? initial.name_en : '', name_am: initial ? initial.name_am : '', sort_order: initial ? String(initial.sort_order) : '0', is_active: initial ? Boolean(initial.is_active) : true });
  const [file, setFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries({ ...f, is_active: f.is_active ? '1' : '0' }).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('image', file);
      if (removeImage && !file) fd.append('remove_image', '1');
      await adminApi(editing ? `/categories/${initial.id}` : '/categories', { method: editing ? 'PUT' : 'POST', body: fd });
      onSaved();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="mb-6 space-y-4 rounded-2xl border-2 border-olive bg-white p-5 dark:bg-stone-900">
      <h2 className="font-semibold">{editing ? t('a_editCategory') : t('a_addCategory')}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <input value={f.name_en} onChange={(e) => setF({ ...f, name_en: e.target.value })} placeholder={t('a_catNameEn')} aria-label={t('a_catNameEn')} required className={inputClass} />
        <input value={f.name_am} onChange={(e) => setF({ ...f, name_am: e.target.value })} placeholder={t('a_catNameAm')} aria-label={t('a_catNameAm')} required className={inputClass} />
        <input value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value.toLowerCase() })} placeholder={t('a_catSlugPh')} aria-label={t('a_catSlugPh')} required className={inputClass} />
        <input type="number" min="0" value={f.sort_order} onChange={(e) => setF({ ...f, sort_order: e.target.value })} placeholder={t('a_orderPh')} aria-label={t('a_orderPh')} className={inputClass} />
      </div>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className={`${btnGhost} cursor-pointer`}>
          {initial && initial.image_url ? t('a_replacePicture') : t('a_choosePicture')}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { setFile(e.target.files[0] || null); setRemoveImage(false); }} className="hidden" />
        </label>
        {file && <span className="text-xs text-stone-500">{file.name}</span>}
        {editing && initial.image_url && !file && <label className="flex items-center gap-2"><input type="checkbox" checked={removeImage} onChange={(e) => setRemoveImage(e.target.checked)} className="accent-olive" />{t('a_removePicture')}</label>}
        <label className="flex items-center gap-2"><input type="checkbox" checked={f.is_active} onChange={(e) => setF({ ...f, is_active: e.target.checked })} className="accent-olive" />{t('a_visibleInShop')}</label>
      </div>
      {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className={btnPrimary}>{saving ? t('a_saving') : t('a_save')}</button>
        <button type="button" onClick={onCancel} className={btnGhost}>{t('a_cancel')}</button>
      </div>
    </form>
  );
}

export default function CategoriesAdmin() {
  const { t } = useLang();
  const { data, loading, error, retry } = useFetch(() => adminApi('/categories'), []);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState('');

  const remove = async (c) => {
    if (!window.confirm(t('a_confirmDeleteCategory', { name: c.name_en }))) return;
    setMsg('');
    try {
      await adminApi(`/categories/${c.id}`, { method: 'DELETE' });
      retry();
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <>
      <PageHeader title={t('a_categories')} subtitle={t('a_categoriesSub')}>
        {!editing && <button onClick={() => setEditing('new')} className={btnPrimary}><Plus size={16} /> {t('a_addCategory')}</button>}
      </PageHeader>
      {editing && <CategoryForm key={editing === 'new' ? 'new' : editing.id} initial={editing === 'new' ? null : editing} onSaved={() => { setEditing(null); retry(); }} onCancel={() => setEditing(null)} />}
      {msg && <Notice>{msg}</Notice>}
      {loading ? <Loading /> : error ? <ErrorBox message={error} onRetry={retry} /> : (
        <ul className="space-y-3">
          {data.map((c) => (
            <li key={c.id} className={`${card} flex flex-wrap items-center gap-4 p-4`}>
              {c.image_url ? <img src={c.image_url} alt="" onError={onImgError} className="h-14 w-14 rounded-xl object-cover" /> : <div className="h-14 w-14 rounded-xl bg-sand-100 dark:bg-stone-800" />}
              <div className="min-w-0 flex-1 basis-44">
                <p className="font-medium">{c.name_en} <span className="text-stone-500">/ {c.name_am}</span></p>
                <p className="text-xs text-stone-500">{t('a_catMeta', { slug: c.slug, n: c.products_count, order: c.sort_order })}</p>
              </div>
              <Badge color={c.is_active ? 'green' : 'gray'}>{c.is_active ? t('a_visible') : t('a_hidden')}</Badge>
              <ActionMenu
                items={[
                  { label: t('a_edit'), icon: Pencil, onClick: () => setEditing(c) },
                  { label: t('a_delete'), icon: Trash2, danger: true, onClick: () => remove(c) },
                ]}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}