import { useState } from 'react';
import { Copy, Download, Trash2 } from 'lucide-react';
import useFetch from '../../hooks/useFetch.js';
import { adminApi } from '../adminApi.js';
import { ErrorBox, Loading, PageHeader, btnGhost, fmtDate, inputClass } from '../ui.jsx';

export default function SubscribersAdmin() {
  const { data, loading, error, retry } = useFetch(() => adminApi('/subscribers'), []);
  const [q, setQ] = useState('');
  const [msg, setMsg] = useState('');

  const list = (data || []).filter((s) => s.email.includes(q.trim().toLowerCase()));

  const remove = async (s) => {
    if (!window.confirm(`Remove ${s.email}?`)) return;
    try {
      await adminApi(`/subscribers/${s.id}`, { method: 'DELETE' });
      retry();
    } catch (err) {
      setMsg(err.message);
    }
  };

  const exportCsv = async () => {
    try {
      const csv = await adminApi('/subscribers/export');
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'subscribers.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setMsg(err.message);
    }
  };

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(list.map((s) => s.email).join(', '));
      setMsg(`${list.length} email(s) copied.`);
    } catch (err) {
      setMsg('Copy failed. Use the CSV export instead.');
    }
  };

  return (
    <>
      <PageHeader title="Subscribers" subtitle={`${(data || []).length} people joined the newsletter`}>
        <button onClick={copyAll} className={btnGhost}><Copy size={15} /> Copy emails</button>
        <button onClick={exportCsv} className={btnGhost}><Download size={15} /> Export CSV</button>
      </PageHeader>

      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search email" className={`${inputClass} mb-4 max-w-sm`} />
      {msg && <p className="mb-4 rounded-xl bg-sand-100 p-3 text-sm dark:bg-stone-800" role="status">{msg}</p>}

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorBox message={error} onRetry={retry} />
      ) : list.length === 0 ? (
        <p className="py-10 text-center text-sm text-stone-500">No subscribers found.</p>
      ) : (
        <ul className="divide-y divide-sand-200 rounded-2xl border border-sand-200 bg-white dark:divide-stone-800 dark:border-stone-800 dark:bg-stone-900">
          {list.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium">{s.email}</p>
                <p className="text-xs text-stone-500">{fmtDate(s.created_at)}</p>
              </div>
              <button onClick={() => remove(s)} aria-label={`Remove ${s.email}`} className="text-red-500">
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}