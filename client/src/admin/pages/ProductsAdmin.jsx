import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import useFetch from '../../hooks/useFetch.js';
import { onImgError } from '../../lib/api.js';
import { adminApi } from '../adminApi.js';
import { Badge, ErrorBox, Loading, PageHeader, btnGhost, btnPrimary, inputClass, money } from '../ui.jsx';

export default function ProductsAdmin() {
  const { data, loading, error, retry } = useFetch(() => adminApi('/products'), []);
  const [q, setQ] = useState('');
  const [msg, setMsg] = useState('');

  const products = (data || []).filter((p) => `${p.name_en} ${p.sku}`.toLowerCase().includes(q.trim().toLowerCase()));

  const toggle = async (p) => {
    try {
      await adminApi(`/products/${p.id}/active`, { method: 'PATCH', body: JSON.stringify({ is_active: p.is_active ? 0 : 1 }) });
      retry();
    } catch (err) {
      setMsg(err.message);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name_en}"? This cannot be undone.`)) return;
    try {
      const r = await adminApi(`/products/${p.id}`, { method: 'DELETE' });
      setMsg(r.softDeleted ? `"${p.name_en}" has past orders, so it was hidden from the shop instead of deleted.` : `"${p.name_en}" was deleted.`);
      retry();
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <>
      <PageHeader title="Products" subtitle={`${(data || []).length} products in total`}>
        <Link to="/admin/products/new" className={btnPrimary}>
          <Plus size={16} /> Add product
        </Link>
      </PageHeader>

      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or SKU" className={`${inputClass} pl-10`} />
      </div>

      {msg && (
        <p className="mb-4 rounded-xl bg-sand-100 p-3 text-sm dark:bg-stone-800" role="status">
          {msg}
        </p>
      )}

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorBox message={error} onRetry={retry} />
      ) : products.length === 0 ? (
        <p className="py-10 text-center text-sm text-stone-500">No products found.</p>
      ) : (
        <ul className="space-y-3">
          {products.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-sand-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
            >
              <img src={p.thumbnail} alt="" onError={onImgError} className="h-16 w-16 flex-none rounded-xl object-cover" />
              <div className="min-w-0 flex-1 basis-48">
                <p className="truncate font-medium">{p.name_en}</p>
                <p className="text-xs text-stone-500">{p.sku} · {p.category_en}</p>
              </div>
              <div className="text-sm">
                <p className="font-semibold">{money(p.price)}</p>
                <p className="text-xs text-stone-500">Stock: {p.stock}</p>
              </div>
              <Badge color={p.is_active ? 'green' : 'gray'}>{p.is_active ? 'Visible' : 'Hidden'}</Badge>
              <div className="flex gap-2">
                <Link to={`/admin/products/${p.id}`} className={btnGhost} aria-label={`Edit ${p.name_en}`}>
                  <Pencil size={15} /> Edit
                </Link>
                <button onClick={() => toggle(p)} className={btnGhost} aria-label={p.is_active ? 'Hide' : 'Show'}>
                  {p.is_active ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <button onClick={() => remove(p)} className={`${btnGhost} text-red-600`} aria-label={`Delete ${p.name_en}`}>
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