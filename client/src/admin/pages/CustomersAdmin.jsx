import { useState } from 'react';
import useFetch from '../../hooks/useFetch.js';
import { adminApi } from '../adminApi.js';
import { Badge, ErrorBox, Loading, PageHeader, btnGhost, fmtDate, inputClass, money } from '../ui.jsx';

export default function CustomersAdmin() {
  const [q, setQ] = useState('');
  const [msg, setMsg] = useState('');
  const { data, loading, error, retry } = useFetch(() => adminApi(`/customers${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`), [q]);

  const toggle = async (c) => {
    try {
      await adminApi(`/customers/${c.id}/active`, { method: 'PATCH', body: JSON.stringify({ is_active: c.is_active ? 0 : 1 }) });
      retry();
    } catch (e) {
      setMsg(e.message);
    }
  };

  const setPassword = async (c) => {
    const pw = window.prompt(`Temporary password for ${c.name} (at least 8 characters). Tell it to the customer, who should change it after logging in:`);
    if (!pw) return;
    try {
      await adminApi(`/customers/${c.id}/password`, { method: 'POST', body: JSON.stringify({ newPassword: pw }) });
      setMsg(`Temporary password set for ${c.name}.`);
    } catch (e) {
      setMsg(e.message);
    }
  };

  return (
    <>
      <PageHeader title="Customers" subtitle="Customers who created an account (guests appear only in Orders)" />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone or email" className={`${inputClass} mb-4 max-w-sm`} />
      {msg && <p className="mb-4 rounded-xl bg-sand-100 p-3 text-sm dark:bg-stone-800" role="status">{msg}</p>}
      {loading ? <Loading /> : error ? <ErrorBox message={error} onRetry={retry} /> : data.length === 0 ? (
        <p className="py-10 text-center text-sm text-stone-500">No customers yet.</p>
      ) : (
        <ul className="space-y-3">
          {data.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-sand-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
              <div className="min-w-0 flex-1 basis-52">
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-stone-500">{c.phone}{c.email ? ` · ${c.email}` : ''}</p>
                <p className="text-xs text-stone-500">Joined {fmtDate(c.created_at)}{c.last_login_at ? ` · last login ${fmtDate(c.last_login_at)}` : ''}</p>
              </div>
              <div className="text-sm"><p className="font-semibold">{money(c.total_spent)}</p><p className="text-xs text-stone-500">{c.orders_count} order(s)</p></div>
              <Badge color={c.is_active ? 'green' : 'red'}>{c.is_active ? 'Active' : 'Blocked'}</Badge>
              <div className="flex gap-2">
                <button onClick={() => setPassword(c)} className={btnGhost}>Set temporary password</button>
                <button onClick={() => toggle(c)} className={btnGhost}>{c.is_active ? 'Block' : 'Unblock'}</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}