import { useState } from 'react';
import { Check, EyeOff, Star, Trash2 } from 'lucide-react';
import useFetch from '../../hooks/useFetch.js';
import { adminApi } from '../adminApi.js';
import { Badge, ErrorBox, Loading, PageHeader, btnGhost, btnPrimary, fmtDate, inputClass } from '../ui.jsx';

export default function ReviewsAdmin() {
  const { data, loading, error, retry } = useFetch(() => adminApi('/reviews'), []);
  const [filter, setFilter] = useState('pending');
  const [msg, setMsg] = useState('');

  const list = (data || []).filter((r) => (filter === 'pending' ? !r.is_approved : filter === 'approved' ? r.is_approved : true));

  const setApproved = async (r, approved) => {
    try {
      await adminApi(`/reviews/${r.id}`, { method: 'PATCH', body: JSON.stringify({ is_approved: approved ? 1 : 0 }) });
      retry();
    } catch (err) {
      setMsg(err.message);
    }
  };

  const remove = async (r) => {
    if (!window.confirm('Delete this review and its photos?')) return;
    try {
      await adminApi(`/reviews/${r.id}`, { method: 'DELETE' });
      retry();
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <>
      <PageHeader title="Reviews" subtitle="New reviews stay hidden until you approve them">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter" className={`${inputClass} w-44`}>
          <option value="pending">Waiting for approval</option>
          <option value="approved">Approved</option>
          <option value="all">All</option>
        </select>
      </PageHeader>

      {msg && <p className="mb-4 rounded-xl bg-sand-100 p-3 text-sm dark:bg-stone-800" role="alert">{msg}</p>}

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorBox message={error} onRetry={retry} />
      ) : list.length === 0 ? (
        <p className="py-10 text-center text-sm text-stone-500">No reviews here.</p>
      ) : (
        <ul className="space-y-4">
          {list.map((r) => (
            <li key={r.id} className="rounded-2xl border border-sand-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{r.author_name}</p>
                  <p className="text-xs text-stone-500">{r.product_name} · {fmtDate(r.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-sm font-semibold">
                    <Star size={15} className="fill-amber-400 text-amber-400" /> {r.rating_overall}/5
                  </span>
                  <Badge color={r.is_approved ? 'green' : 'amber'}>{r.is_approved ? 'Approved' : 'Pending'}</Badge>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm">{r.body}</p>
              <p className="mt-2 text-xs text-stone-500">
                Quality {r.rating_quality} · Comfort {r.rating_comfort} · Value {r.rating_value} · Delivery {r.rating_delivery}
              </p>
              {r.photos.length > 0 && (
                <div className="mt-3 flex gap-2">
                  {r.photos.map((src) => (
                    <a key={src} href={src} target="_blank" rel="noreferrer">
                      <img src={src} alt="" className="h-16 w-16 rounded-lg object-cover" />
                    </a>
                  ))}
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {r.is_approved ? (
                  <button onClick={() => setApproved(r, false)} className={btnGhost}><EyeOff size={15} /> Hide</button>
                ) : (
                  <button onClick={() => setApproved(r, true)} className={btnPrimary}><Check size={15} /> Approve</button>
                )}
                <button onClick={() => remove(r)} className={`${btnGhost} text-red-600`} aria-label="Delete review">
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