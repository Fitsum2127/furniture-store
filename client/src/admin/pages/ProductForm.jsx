import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Star, Trash2, Upload } from 'lucide-react';
import useFetch from '../../hooks/useFetch.js';
import { api, onImgError } from '../../lib/api.js';
import { adminApi } from '../adminApi.js';
import { ErrorBox, Loading, PageHeader, btnGhost, btnPrimary, inputClass } from '../ui.jsx';

const EMPTY = {
  sku: '', category_id: '', name_en: '', name_am: '', tagline_en: '', tagline_am: '',
  description_en: '', description_am: '', price: '', old_price: '', stock: '0', is_active: true,
};

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-stone-500">{hint}</span>}
    </label>
  );
}

export default function ProductForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();

  const cats = useFetch(() => api('/categories'), []);
  const [form, setForm] = useState(EMPTY);
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(editing);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    adminApi(`/products/${id}`)
      .then((p) => {
        setForm({
          sku: p.sku, category_id: String(p.category_id),
          name_en: p.name_en, name_am: p.name_am,
          tagline_en: p.tagline_en || '', tagline_am: p.tagline_am || '',
          description_en: p.description_en || '', description_am: p.description_am || '',
          price: String(p.price), old_price: p.old_price ? String(p.old_price) : '',
          stock: String(p.stock), is_active: Boolean(p.is_active),
        });
        setImages(p.images);
        setLoadError('');
      })
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (editing) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const pickFiles = (e) => {
    const chosen = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'));
    setFiles((prev) => [...prev, ...chosen].slice(0, 8));
    e.target.value = '';
  };

  const deleteImage = async (img) => {
    if (!window.confirm('Delete this photo?')) return;
    try {
      await adminApi(`/products/${id}/images/${img.id}`, { method: 'DELETE' });
      setImages((list) => list.filter((i) => i.id !== img.id));
    } catch (err) {
      setError(err.message);
    }
  };

  const makeMain = async (img) => {
    try {
      await adminApi(`/products/${id}/images/${img.id}/primary`, { method: 'PATCH' });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = JSON.stringify({ ...form, is_active: form.is_active ? 1 : 0 });
      let productId = id;
      if (editing) {
        await adminApi(`/products/${id}`, { method: 'PUT', body: payload });
      } else {
        const r = await adminApi('/products', { method: 'POST', body: payload });
        productId = r.id;
      }
      if (files.length) {
        const fd = new FormData();
        files.forEach((f) => fd.append('images', f));
        await adminApi(`/products/${productId}/images`, { method: 'POST', body: fd });
      }
      navigate('/admin/products');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (loading) return <Loading />;
  if (loadError) return <ErrorBox message={loadError} onRetry={load} />;

  return (
    <>
      <PageHeader title={editing ? 'Edit product' : 'Add product'}>
        <Link to="/admin/products" className={btnGhost}>
          <ArrowLeft size={16} /> Back
        </Link>
      </PageHeader>

      <form onSubmit={save} className="max-w-3xl space-y-6">
        <section className="grid gap-4 rounded-2xl border border-sand-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900 sm:grid-cols-2">
          <Field label="Name (English) *">
            <input value={form.name_en} onChange={set('name_en')} required className={inputClass} />
          </Field>
          <Field label="Name (አማርኛ) *">
            <input value={form.name_am} onChange={set('name_am')} required className={inputClass} />
          </Field>
          <Field label="SKU (unique code) *" hint="Example: BETE-SOFA-3S">
            <input value={form.sku} onChange={set('sku')} required className={inputClass} />
          </Field>
          <Field label="Category *">
            <select value={form.category_id} onChange={set('category_id')} required className={inputClass}>
              <option value="">Choose...</option>
              {(cats.data || []).map((c) => (
                                <option key={c.id} value={c.id}>{c.name_en}</option>
              ))}
            </select>
          </Field>
          <Field label="Price (ETB) *">
            <input type="number" min="0" step="0.01" value={form.price} onChange={set('price')} required className={inputClass} />
          </Field>
          <Field label="Old price (ETB)" hint="Optional. Must be higher than the price. Shows a discount.">
            <input type="number" min="0" step="0.01" value={form.old_price} onChange={set('old_price')} className={inputClass} />
          </Field>
          <Field label="Stock">
            <input type="number" min="0" value={form.stock} onChange={set('stock')} className={inputClass} />
          </Field>
          <label className="flex items-center gap-3 pt-7 text-sm font-medium">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              className="h-4 w-4 accent-olive"
            />
            Visible in the shop
          </label>
        </section>

        <section className="grid gap-4 rounded-2xl border border-sand-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900 sm:grid-cols-2">
          <Field label="Short tagline (English)">
            <input value={form.tagline_en} onChange={set('tagline_en')} maxLength={255} className={inputClass} />
          </Field>
          <Field label="Short tagline (አማርኛ)">
            <input value={form.tagline_am} onChange={set('tagline_am')} maxLength={255} className={inputClass} />
          </Field>
          <Field label="Description (English)">
            <textarea value={form.description_en} onChange={set('description_en')} rows={5} className={`${inputClass} resize-none`} />
          </Field>
          <Field label="Description (አማርኛ)">
            <textarea value={form.description_am} onChange={set('description_am')} rows={5} className={`${inputClass} resize-none`} />
          </Field>
        </section>

        <section className="rounded-2xl border border-sand-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
          <h2 className="font-semibold">Photos</h2>
          <p className="mt-1 text-xs text-stone-500">JPG, PNG or WebP, up to 5 MB each. The first photo is the main one.</p>

          {images.length > 0 && (
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {images.map((img, i) => (
                <li key={img.id} className="rounded-xl border border-sand-200 p-2 dark:border-stone-700">
                  <img src={img.url} alt="" onError={onImgError} className="aspect-square w-full rounded-lg object-cover" />
                  <div className="mt-2 flex items-center justify-between">
                    {i === 0 ? (
                      <span className="text-xs font-semibold text-olive">Main</span>
                    ) : (
                      <button type="button" onClick={() => makeMain(img)} className="flex items-center gap-1 text-xs hover:text-olive">
                        <Star size={13} /> Make main
                      </button>
                    )}
                    <button type="button" onClick={() => deleteImage(img)} aria-label="Delete photo" className="text-red-500">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {previews.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {previews.map((src, i) => (
                <li key={src} className="relative">
                  <img src={src} alt="" className="h-16 w-16 rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => setFiles((f) => f.filter((_, idx) => idx !== i))}
                    aria-label="Remove"
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-stone-800 text-xs text-white"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          <label className={`${btnGhost} mt-4 cursor-pointer`}>
            <Upload size={16} /> Choose photos
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={pickFiles} className="hidden" />
          </label>
        </section>

        {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
        <button type="submit" disabled={saving} className={btnPrimary}>
          {saving ? 'Saving...' : editing ? 'Save changes' : 'Create product'}
        </button>
      </form>
    </>
  );
}