import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import useFetch from '../../hooks/useFetch.js';
import { onImgError } from '../../lib/api.js';
import { adminApi } from '../adminApi.js';
import { Badge, ErrorBox, Loading, PageHeader, btnGhost, btnPrimary, inputClass } from '../ui.jsx';

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
  const editing = Boolean(initial && initial.id);
  const [f, setF] = useState({
    title_en: initial ? initial.title_en : '',
    title_am: initial ? initial.title_am || '' : '',
    body_en: initial ? initial.body_en : '',
    body_am: initial ? initial.body_am || '' : '',
    is_active: initial ? Boolean(initial.is_active) : true,
  });
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
      fd.append('title_en', f.title_en);
      fd.append('title_am', f.title_am);
      fd.append('body_en', f.body_en);
      fd.append('body_am', f.body_am);
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
    <form
      onSubmit={submit}
      className="mb-8 space-y-4 rounded-2xl border-2 border-olive bg-white p-5 dark:bg-stone-900"
    >
      <h2 className="text-lg font-semibold">{editing ? 'Edit section' : 'Add a new section'}</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title (English) *">
          <input value={f.title_en} onChange={set('title_en')} required maxLength={200} className={inputClass} />
        </Field>
        <Field label="Title (አማርኛ)" hint="Optional. If empty, the English title is shown.">
          <input value={f.title_am} onChange={set('title_am')} maxLength={200} className={inputClass} />
        </Field>
        <Field label="Text (English) *" hint="Press Enter to start a new paragraph.">
          <textarea value={f.body_en} onChange={set('body_en')} required rows={7} maxLength={5000} className={`${inputClass} resize-y`} />
        </Field>
        <Field label="Text (አማርኛ)" hint="Optional. If empty, the English text is shown.">
          <textarea value={f.body_am} onChange={set('body_am')} rows={7} maxLength={5000} className={`${inputClass} resize-y`} />
        </Field>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Photo (optional)</p>
        <div className="flex flex-wrap items-center gap-4">
          {(preview || currentImage) && (
            <img
              src={preview || currentImage}
              alt=""
              onError={onImgError}
              className="h-24 w-32 rounded-xl object-cover"
            />
          )}
          <label className={`${btnGhost} cursor-pointer`}>
            <Upload size={16} /> {initial && initial.image_url ? 'Replace photo' : 'Choose photo'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                setFile(e.target.files && e.target.files[0] ? e.target.files[0] : null);
                setRemoveImage(false);
                e.target.value = '';
              }}
              className="hidden"
            />
          </label>
          {editing && initial.image_url && !file && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={removeImage}
                onChange={(e) => setRemoveImage(e.target.checked)}
                className="h-4 w-4 accent-olive"
              />
              Remove current photo
            </label>
          )}
        </div>
        <p className="mt-1 text-xs text-stone-500">JPG, PNG or WebP, up to 5 MB. A wide photo (4:3) looks best.</p>
      </div>

      <label className="flex items-center gap-3 text-sm font-medium">
        <input
          type="checkbox"
          checked={f.is_active}
          onChange={(e) => setF((x) => ({ ...x, is_active: e.target.checked }))}
          className="h-4 w-4 accent-olive"
        />
        Show on the About page
      </label>

      {error && <p className="text-sm text-red-500" role="alert">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className={btnPrimary}>
          {saving ? 'Saving...' : editing ? 'Save changes' : 'Add section'}
        </button>
        <button type="button" onClick={onCancel} className={btnGhost}>Cancel</button>
      </div>
    </form>
  );
}

export default function AboutAdmin() {
  const { data, loading, error, retry } = useFetch(() => adminApi('/about'), []);
  const [editing, setEditing] = useState(null); // null | 'new' | section object
  const [msg, setMsg] = useState('');

  const run = async (fn, okMessage) => {
    setMsg('');
    try {
      await fn();
      if (okMessage) setMsg(okMessage);
      retry();
    } catch (err) {
      setMsg(err.message);
    }
  };

  const move = (s, direction) =>
    run(() => adminApi(`/about/${s.id}/move`, { method: 'PATCH', body: JSON.stringify({ direction }) }));

  const toggle = (s) =>
    run(() => adminApi(`/about/${s.id}/active`, { method: 'PATCH', body: JSON.stringify({ is_active: s.is_active ? 0 : 1 }) }));

  const remove = (s) => {
    if (!window.confirm(`Delete the section "${s.title_en}"? This cannot be undone.`)) return;
    run(() => adminApi(`/about/${s.id}`, { method: 'DELETE' }), `"${s.title_en}" was deleted.`);
  };

  const list = data || [];

  return (
    <>
      <PageHeader title="About page" subtitle="Add, edit, delete and re-order the sections customers see on the About page">
        <a href="/about" target="_blank" rel="noreferrer" className={btnGhost}>View page</a>
        {!editing && (
          <button onClick={() => setEditing('new')} className={btnPrimary}>
            <Plus size={16} /> Add section
          </button>
        )}
      </PageHeader>

      {editing && (
        <SectionForm
          key={editing === 'new' ? 'new' : editing.id}
          initial={editing === 'new' ? null : editing}
          onSaved={() => {
            setEditing(null);
            setMsg('Saved.');
            retry();
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      {msg && (
        <p className="mb-4 rounded-xl bg-sand-100 p-3 text-sm dark:bg-stone-800" role="status">
          {msg}
        </p>
      )}

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorBox message={error} onRetry={retry} />
      ) : list.length === 0 ? (
        <p className="py-10 text-center text-sm text-stone-500">No sections yet. Click "Add section".</p>
      ) : (
        <ul className="space-y-3">
          {list.map((s, i) => (
            <li
              key={s.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-sand-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
            >
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => move(s, 'up')}
                  disabled={i === 0}
                  aria-label="Move up"
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-sand-300 disabled:opacity-30 dark:border-stone-700"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  onClick={() => move(s, 'down')}
                  disabled={i === list.length - 1}
                  aria-label="Move down"
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-sand-300 disabled:opacity-30 dark:border-stone-700"
                >
                  <ArrowDown size={14} />
                </button>
              </div>

              {s.image_url ? (
                <img src={s.image_url} alt="" onError={onImgError} className="h-16 w-20 flex-none rounded-xl object-cover" />
              ) : (
                <div className="flex h-16 w-20 flex-none items-center justify-center rounded-xl bg-sand-100 text-xs text-stone-500 dark:bg-stone-800">
                  No photo
                </div>
              )}

              <div className="min-w-0 flex-1 basis-48">
                <p className="truncate font-medium">{s.title_en}</p>
                <p className="line-clamp-2 text-xs text-stone-500">{s.body_en}</p>
              </div>

              <Badge color={s.is_active ? 'green' : 'gray'}>{s.is_active ? 'Visible' : 'Hidden'}</Badge>

              <div className="flex gap-2">
                <button onClick={() => setEditing(s)} className={btnGhost} aria-label={`Edit ${s.title_en}`}>
                  <Pencil size={15} /> Edit
                </button>
                <button onClick={() => toggle(s)} className={btnGhost} aria-label={s.is_active ? 'Hide' : 'Show'}>
                  {s.is_active ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <button onClick={() => remove(s)} className={`${btnGhost} text-red-600`} aria-label={`Delete ${s.title_en}`}>
                  <Trash2 size={15} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}