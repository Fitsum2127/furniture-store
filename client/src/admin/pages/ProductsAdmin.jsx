import { useState } from 'react';
import { Eye, EyeOff, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch.js';
import { useLang } from '../../context/LanguageContext.jsx';
import { onImgError } from '../../lib/api.js';
import { adminApi } from '../adminApi.js';
import ActionMenu from '../ActionMenu.jsx';
import { useFeedback } from '../feedback.jsx';
import { Badge, ErrorBox, Loading, PageHeader, btnPrimary, card, inputClass, useFmt } from '../ui.jsx';

export default function ProductsAdmin() {
  const { t } = useLang();
  const { money } = useFmt();
  const fb = useFeedback();
  const { data, loading, error, retry } = useFetch(() => adminApi('/products'), []);
  const [q, setQ] = useState('');

  const list = (data || []).filter((p) => `${p.name_en} ${p.sku}`.toLowerCase().includes(q.trim().toLowerCase()));

  const act = async (fn, okText) => {
    try {
      const r = await fn();
      if (okText) fb.success(typeof okText === 'function' ? okText(r) : okText);
      retry();
    } catch (err) {
      fb.error(err.message);
    }
  };
  const patch = (p, path, body, okText) => act(() => adminApi(`/products/${p.id}/${path}`, { method: 'PATCH', body: JSON.stringify(body) }), okText);
  const remove = (p) =>
    fb.confirm({
      text: t('a_confirmDeleteProduct', { name: p.name_en }),
      confirmLabel: t('a_yesDelete'),
      danger: true,
      onConfirm: () => act(() => adminApi(`/products/${p.id}`, { method: 'DELETE' }), (r) => t(r.softDeleted ? 'a_softDeletedMsg' : 'a_deletedMsg', { name: p.name_en })),
    });

  return (
    <>
      <PageHeader title={t('a_products')} subtitle={t('a_nProducts', { n: (data || []).length })}>
        <Link to="/admin/products/new" className={btnPrimary}><Plus size={16} /> {t('a_addProduct')}</Link>
      </PageHeader>
      {fb.banner}

      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('a_searchProducts')} aria-label={t('a_searchProducts')} className={`${inputClass} pl-10`} />
      </div>

      {loading ? <Loading /> : error ? <ErrorBox message={error} onRetry={retry} /> : list.length === 0 ? (
        <p className="py-10 text-center text-sm text-stone-500">{t('a_noProducts')}</p>
      ) : (
        <ul className="space-y-3">
          {list.map((p) => (
            <li key={p.id} className={`${card} flex flex-wrap items-center gap-4 p-4`}>
              <img src={p.thumbnail} alt="" onError={onImgError} className="h-16 w-16 flex-none rounded-xl object-cover" />
              <div className="min-w-0 flex-1 basis-48">
                <p className="flex items-center gap-1.5 font-medium">
                  <span className="truncate">{p.name_en}</span>
                  {p.is_featured ? <Star size={13} className="flex-none fill-amber-400 text-amber-400" aria-label={t('a_unfeature')} /> : null}
                </p>
                <p className="text-xs text-stone-500">{p.sku} · {p.category_en}{p.variants_count > 0 ? ` · ${t('a_nOptions', { n: p.variants_count })}` : ''}</p>
              </div>
              <div className="text-sm"><p className="font-semibold">{money(p.price)}</p><p className="text-xs text-stone-500">{t('a_stock')}: {p.stock}</p></div>
              <Badge color={p.is_active ? 'green' : 'gray'}>{p.is_active ? t('a_visible') : t('a_hidden')}</Badge>
              <ActionMenu
                items={[
                  { label: t('a_edit'), icon: Pencil, to: `/admin/products/${p.id}` },
                  { label: p.is_featured ? t('a_unfeature') : t('a_makeFeatured'), icon: Star, onClick: () => patch(p, 'featured', { is_featured: p.is_featured ? 0 : 1 }, t(p.is_featured ? 'a_featuredOff' : 'a_featuredOn')) },
                  { label: p.is_active ? t('a_hide') : t('a_show'), icon: p.is_active ? EyeOff : Eye, onClick: () => patch(p, 'active', { is_active: p.is_active ? 0 : 1 }, t(p.is_active ? 'a_productHidden' : 'a_productShown')) },
                  { label: t('a_delete'), icon: Trash2, danger: true, onClick: () => remove(p) },
                ]}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}