import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Star, Trash2, Upload } from 'lucide-react';
import useFetch from '../../hooks/useFetch.js';
import { useLang } from '../../context/LanguageContext.jsx';
import { onImgError } from '../../lib/api.js';
import { adminApi } from '../adminApi.js';
import ActionMenu from '../ActionMenu.jsx';
import { useFeedback } from '../feedback.jsx';
import { ErrorBox, Loading, PageHeader, btnGhost, btnPrimary, card, inputClass } from '../ui.jsx';

const EMPTY = { sku: '', category_id: '', name_en: '', name_am: '', tagline_en: '', tagline_am: '', description_en: '', description_am: '', price: '', old_price: '', stock: '0', is_active: true, is_featured: false };
const bi = { en: 'REPLACE ME', am: 'REPLACE ME' };
const item = { icon: 'Sparkles', title: bi, text: bi };
const EXAMPLE = {
  story: { material: [item], design: [item], care: [item] },
  roomTips: [{ title: bi, text: bi }],
  dimensions: { length: 0, width: 0, height: 0, seatHeight: 0, weightCapacity: 0, netWeight: 0 },
  materials: [{ part: bi, type: 'solid', detail: bi }],
  fabric: { gsm: 0, maxGsm: 500, note: bi },
  accordion: [{ title: bi, rows: [[bi, bi]] }],
};

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-stone-500">{hint}</span>}
    </label>
  );
}

function VariantRow({ variant, onChanged, fb }) {
  const { t } = useLang();
  const [v, setV] = useState({ name_en: variant.name_en, name_am: variant.name_am, hex_color: variant.hex_color, stock: String(variant.stock), is_active: Boolean(variant.is_active) });
  const body = () => JSON.stringify({ ...v, is_active: v.is_active ? 1 : 0 });
  const run = async (fn, okText) => {
    try {
      await fn();
      fb.success(okText);
      onChanged();
    } catch (e) {
      fb.error(e.message);
    }
  };
  return (
    <li className="grid items-end gap-2 rounded-xl border border-sand-200 p-3 dark:border-stone-700 sm:grid-cols-[1fr_1fr_64px_90px_auto]">
      <input value={v.name_en} onChange={(e) => setV({ ...v, name_en: e.target.value })} placeholder={t('a_variantNameEn')} aria-label={t('a_variantNameEn')} className={inputClass} />
      <input value={v.name_am} onChange={(e) => setV({ ...v, name_am: e.target.value })} placeholder={t('a_variantNameAm')} aria-label={t('a_variantNameAm')} className={inputClass} />
      <input type="color" value={v.hex_color} onChange={(e) => setV({ ...v, hex_color: e.target.value })} aria-label={t('a_color')} className="h-11 w-full rounded-xl border border-sand-300 dark:border-stone-700" />
      <input type="number" min="0" value={v.stock} onChange={(e) => setV({ ...v, stock: e.target.value })} aria-label={t('a_stock')} className={inputClass} />
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={v.is_active} onChange={(e) => setV({ ...v, is_active: e.target.checked })} className="accent-olive" />{t('a_active')}</label>
        <button type="button" onClick={() => run(() => adminApi(`/variants/${variant.id}`, { method: 'PUT', body: body() }), t('a_saved'))} className={btnGhost}>{t('a_save')}</button>
        <ActionMenu
          items={[{
            label: t('a_delete'), icon: Trash2, danger: true,
            onClick: () => fb.confirm({ text: t('a_confirmDeleteVariant'), confirmLabel: t('a_yesDelete'), danger: true, onConfirm: () => run(() => adminApi(`/variants/${variant.id}`, { method: 'DELETE' }), t('a_variantDeleted')) }),
          }]}
        />
      </div>
    </li>
  );
}

export default function ProductForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const { t } = useLang();
  const fb = useFeedback();
  const cats = useFetch(() => adminApi('/categories'), []);

  const [f, setF] = useState(EMPTY);
  const [detailsText, setDetailsText] = useState('');
  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([]);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploadVariant, setUploadVariant] = useState('');
  const [newVariant, setNewVariant] = useState({ name_en: '', name_am: '', hex_color: '#d2b48c', stock: '0' });
  const [loading, setLoading] = useState(editing);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const p = await adminApi(`/products/${id}`);
      setF({
        sku: p.sku, category_id: String(p.category_id), name_en: p.name_en, name_am: p.name_am,
        tagline_en: p.tagline_en || '', tagline_am: p.tagline_am || '', description_en: p.description_en || '', description_am: p.description_am || '',
        price: String(p.price), old_price: p.old_price ? String(p.old_price) : '', stock: String(p.stock), is_active: Boolean(p.is_active), is_featured: Boolean(p.is_featured),
      });
      setDetailsText(p.details ? JSON.stringify(typeof p.details === 'string' ? JSON.parse(p.details) : p.details, null, 2) : '');
      setImages(p.images);
      setVariants(p.variants);
      setLoadError('');
    } catch (e) {
      setLoadError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const urls = files.map((x) => URL.createObjectURL(x));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const hasVariants = variants.some((v) => v.is_active);

  const upload = async (productId) => {
    if (!files.length) return;
    const fd = new FormData();
    files.forEach((x) => fd.append('images', x));
    if (uploadVariant) fd.append('variant_id', uploadVariant);
    await adminApi(`/products/${productId}/images`, { method: 'POST', body: fd });
    setFiles([]);
  };

  const save = async (e) => {
    e.preventDefault();
    setError('');
    if (/REPLACE ME/i.test(detailsText)) return setError(t('a_errReplaceMe'));
    if (detailsText.trim()) {
      try {
        JSON.parse(detailsText);
      } catch (err) {
        return setError(t('a_errJson'));
      }
    }
    setSaving(true);
    try {
      const payload = JSON.stringify({ ...f, is_active: f.is_active ? 1 : 0, is_featured: f.is_featured ? 1 : 0, details: detailsText.trim() });
      let productId = id;
      if (editing) await adminApi(`/products/${id}`, { method: 'PUT', body: payload });
      else productId = (await adminApi('/products', { method: 'POST', body: payload })).id;
      await upload(productId);
      if (editing) {
        await load();
        fb.success(t('a_saved'));
        setSaving(false);
      } else {
        navigate(`/admin/products/${productId}`, { replace: true });
      }
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  const act = async (fn, okText) => {
    try {
      await fn();
      await load();
      if (okText) fb.success(okText);
    } catch (err) {
      fb.error(err.message);
    }
  };

  if (loading) return <Loading />;
  if (loadError) return <ErrorBox message={loadError} onRetry={load} />;

  const sec = `${card} p-5`;
  return (
    <>
      <PageHeader title={editing ? t('a_editProductTitle') : t('a_addProductTitle')}>
        <Link to="/admin/products" className={btnGhost}><ArrowLeft size={16} /> {t('a_back')}</Link>
      </PageHeader>
      {fb.banner}

      <form onSubmit={save} className="max-w-4xl space-y-6">
        <section className={`${sec} grid gap-4 sm:grid-cols-2`}>
          <Field label={t('a_nameEn')}><input value={f.name_en} onChange={set('name_en')} required maxLength={200} className={inputClass} /></Field>
          <Field label={t('a_nameAm')}><input value={f.name_am} onChange={set('name_am')} required maxLength={200} className={inputClass} /></Field>
          <Field label={t('a_sku')} hint={t('a_skuHint')}><input value={f.sku} onChange={set('sku')} required className={inputClass} /></Field>
          <Field label={t('a_categoryStar')}>
            <select value={f.category_id} onChange={set('category_id')} required className={inputClass}>
              <option value="">{t('a_choose')}</option>
              {(cats.data || []).map((c) => <option key={c.id} value={c.id}>{c.name_en}</option>)}
            </select>
          </Field>
          <Field label={t('a_priceStar')}><input type="number" min="0" step="0.01" value={f.price} onChange={set('price')} required className={inputClass} /></Field>
          <Field label={t('a_oldPrice')} hint={t('a_oldPriceHint')}><input type="number" min="0" step="0.01" value={f.old_price} onChange={set('old_price')} className={inputClass} /></Field>
          <Field label={t('a_stockLabel')} hint={hasVariants ? t('a_stockVarHint') : t('a_stockHint')}>
            <input type="number" min="0" value={hasVariants ? variants.filter((v) => v.is_active).reduce((s, v) => s + v.stock, 0) : f.stock} onChange={set('stock')} disabled={hasVariants} className={inputClass} />
          </Field>
          <div className="space-y-2 pt-6 text-sm font-medium">
            <label className="flex items-center gap-3"><input type="checkbox" checked={f.is_active} onChange={(e) => setF((x) => ({ ...x, is_active: e.target.checked }))} className="h-4 w-4 accent-olive" />{t('a_visibleShop')}</label>
            <label className="flex items-center gap-3"><input type="checkbox" checked={f.is_featured} onChange={(e) => setF((x) => ({ ...x, is_featured: e.target.checked }))} className="h-4 w-4 accent-olive" />{t('a_featuredHome')}</label>
          </div>
        </section>

        <section className={`${sec} grid gap-4 sm:grid-cols-2`}>
          <Field label={t('a_taglineEn')}><input value={f.tagline_en} onChange={set('tagline_en')} maxLength={255} className={inputClass} /></Field>
          <Field label={t('a_taglineAm')}><input value={f.tagline_am} onChange={set('tagline_am')} maxLength={255} className={inputClass} /></Field>
          <Field label={t('a_descEn')}><textarea value={f.description_en} onChange={set('description_en')} rows={5} className={`${inputClass} resize-y`} /></Field>
          <Field label={t('a_descAm')}><textarea value={f.description_am} onChange={set('description_am')} rows={5} className={`${inputClass} resize-y`} /></Field>
        </section>

        <section className={sec}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">{t('a_specsTitle')}</h2>
            <button type="button" onClick={() => setDetailsText(JSON.stringify(EXAMPLE, null, 2))} className={btnGhost}>{t('a_insertTemplate')}</button>
          </div>
          <p className="mt-1 text-xs text-stone-500">{t('a_specsHint')}</p>
          <textarea value={detailsText} onChange={(e) => setDetailsText(e.target.value)} rows={detailsText ? 14 : 4} spellCheck={false} className={`${inputClass} mt-3 font-mono text-xs`} />
        </section>

        {editing && (
          <section className={sec}>
            <h2 className="font-semibold">{t('a_variantsTitle')}</h2>
            <p className="mt-1 text-xs text-stone-500">{t('a_variantsHint')}</p>
            <ul className="mt-3 space-y-2">
              {variants.map((v) => <VariantRow key={`${v.id}-${v.stock}-${v.is_active}`} variant={v} onChanged={load} fb={fb} />)}
            </ul>
            <div className="mt-4 grid items-end gap-2 sm:grid-cols-[1fr_1fr_64px_90px_auto]">
              <input value={newVariant.name_en} onChange={(e) => setNewVariant({ ...newVariant, name_en: e.target.value })} placeholder={t('a_newOptionEn')} aria-label={t('a_newOptionEn')} className={inputClass} />
              <input value={newVariant.name_am} onChange={(e) => setNewVariant({ ...newVariant, name_am: e.target.value })} placeholder={t('a_newOptionAm')} aria-label={t('a_newOptionAm')} className={inputClass} />
              <input type="color" value={newVariant.hex_color} onChange={(e) => setNewVariant({ ...newVariant, hex_color: e.target.value })} aria-label={t('a_color')} className="h-11 w-full rounded-xl border border-sand-300 dark:border-stone-700" />
              <input type="number" min="0" value={newVariant.stock} onChange={(e) => setNewVariant({ ...newVariant, stock: e.target.value })} aria-label={t('a_stock')} className={inputClass} />
              <button type="button" className={btnPrimary} onClick={() => act(async () => { await adminApi(`/products/${id}/variants`, { method: 'POST', body: JSON.stringify(newVariant) }); setNewVariant({ name_en: '', name_am: '', hex_color: '#d2b48c', stock: '0' }); }, t('a_saved'))}>{t('a_addOption')}</button>
            </div>
          </section>
        )}

        <section className={sec}>
          <h2 className="font-semibold">{t('a_photos')}</h2>
          <p className="mt-1 text-xs text-stone-500">{t('a_photosHint')}</p>
          {images.length > 0 && (
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {images.map((img, i) => (
                <li key={img.id} className="rounded-xl border border-sand-200 p-2 dark:border-stone-700">
                  <img src={img.url} alt="" onError={onImgError} className="aspect-square w-full rounded-lg object-cover" />
                  <p className="mt-1 truncate text-xs text-stone-500">{img.variant_id ? (variants.find((v) => v.id === img.variant_id) || {}).name_en || t('a_option') : t('a_allOptions')}</p>
                  <div className="mt-1 flex items-center justify-between">
                    {i === 0 ? <span className="text-xs font-semibold text-olive">{t('a_main')}</span> : <span />}
                    <ActionMenu
                      items={[
                        i > 0 && { label: t('a_makeMain'), icon: Star, onClick: () => act(() => adminApi(`/products/${id}/images/${img.id}/primary`, { method: 'PATCH' }), t('a_saved')) },
                        {
                          label: t('a_delete'), icon: Trash2, danger: true,
                          onClick: () => fb.confirm({ text: t('a_confirmDeletePhoto'), confirmLabel: t('a_yesDelete'), danger: true, onConfirm: () => act(() => adminApi(`/products/${id}/images/${img.id}`, { method: 'DELETE' }), t('a_photoDeleted')) }),
                        },
                      ]}
                    />
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
                  <button type="button" onClick={() => setFiles((x) => x.filter((_, idx) => idx !== i))} aria-label={t('a_delete')} className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-stone-800 text-xs text-white">×</button>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className={`${btnGhost} cursor-pointer`}>
              <Upload size={16} /> {t('a_choosePhotos')}
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => { setFiles((p) => [...p, ...Array.from(e.target.files || [])].slice(0, 8)); e.target.value = ''; }} className="hidden" />
            </label>
            {editing && variants.length > 0 && (
              <select value={uploadVariant} onChange={(e) => setUploadVariant(e.target.value)} aria-label={t('a_photosAll')} className={`${inputClass} w-56`}>
                <option value="">{t('a_photosAll')}</option>
                {variants.map((v) => <option key={v.id} value={v.id}>{t('a_onlyFor', { name: v.name_en })}</option>)}
              </select>
            )}
          </div>
        </section>

        {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
        <button type="submit" disabled={saving} className={btnPrimary}>{saving ? t('a_saving') : editing ? t('a_saveChanges') : t('a_createProduct')}</button>
        {!editing && <p className="text-xs text-stone-500">{t('a_afterCreate')}</p>}
      </form>
    </>
  );
}