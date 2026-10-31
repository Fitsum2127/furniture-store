import { useState } from 'react';
import { Mail, Phone, Trash2 } from 'lucide-react';
import useFetch from '../../hooks/useFetch.js';
import { adminApi } from '../adminApi.js';
import { Badge, ErrorBox, Loading, PageHeader, btnGhost, btnPrimary, fmtDate, inputClass } from '../ui.jsx';

const statusColor = { new: 'blue', replied: 'green', closed: 'gray' };

function MessageCard({ m, onChanged }) {
  const [reply, setReply] = useState(m.reply_text || '');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const act = async (fn) => {
    setErr('');
    setBusy(true);
    try {
      await fn();
      onChanged();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const saveReply = () =>
    act(() => adminApi(`/messages/${m.id}`, { method: 'PATCH', body: JSON.stringify({ reply_text: reply }) }));
  const setStatus = (status) =>
    act(() => adminApi(`/messages/${m.id}`, { method: 'PATCH', body: JSON.stringify({ status }) }));
  const remove = () => {
    if (!window.confirm('Delete this message?')) return;
    act(() => adminApi(`/messages/${m.id}`, { method: 'DELETE' }));
  };

  const mailto = m.email
    ? `mailto:${m.email}?subject=${encodeURIComponent('Re: your message to Bete Furniture')}&body=${encodeURIComponent(reply)}`
    : null;

  return (
    <li className="rounded-2xl border border-sand-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{m.name}</p>
          <p className="text-xs text-stone-500">{fmtDate(m.created_at)}</p>
        </div>
        <Badge color={statusColor[m.status]}>{m.status}</Badge>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm">{m.body}</p>

      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        {m.phone && (
          <a href={`tel:${m.phone}`} className="inline-flex items-center gap-1.5 text-olive underline">
            <Phone size={14} /> {m.phone}
          </a>
        )}
        {m.email && (
          <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1.5 text-olive underline">
            <Mail size={14} /> {m.email}
          </a>
        )}
      </div>

      <div className="mt-4 border-t border-sand-200 pt-4 dark:border-stone-800">
        <label className="text-xs font-medium" htmlFor={`reply-${m.id}`}>Your reply (saved for your records)</label>
        <textarea
          id={`reply-${m.id}`}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          rows={3}
          className={`${inputClass} mt-1 resize-none`}
        />
        {m.replied_at && <p className="mt-1 text-xs text-stone-500">Last reply saved: {fmtDate(m.replied_at)}</p>}
        {err && <p className="mt-2 text-sm text-red-500" role="alert">{err}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={saveReply} disabled={busy || !reply.trim()} className={btnPrimary}>
            Save reply
          </button>
          {mailto && (
            <a href={mailto} className={btnGhost}>
              <Mail size={15} /> Send by email
            </a>
          )}
          {!mailto && m.phone && (
            <a href={`tel:${m.phone}`} className={btnGhost}>
              <Phone size={15} /> Call customer
            </a>
          )}
          {m.status !== 'closed' && (
            <button onClick={() => setStatus('closed')} disabled={busy} className={btnGhost}>Close</button>
          )}
          {m.status === 'closed' && (
            <button onClick={() => setStatus('new')} disabled={busy} className={btnGhost}>Reopen</button>
          )}
          <button onClick={remove} disabled={busy} className={`${btnGhost} text-red-600`} aria-label="Delete message">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </li>
  );
}

export default function MessagesAdmin() {
  const { data, loading, error, retry } = useFetch(() => adminApi('/messages'), []);
  const [filter, setFilter] = useState('open');

  const list = (data || []).filter((m) => (filter === 'open' ? m.status !== 'closed' : filter === 'all' ? true : m.status === filter));

  return (
    <>
      <PageHeader title="Messages" subtitle="Messages sent from the Contact page">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter" className={`${inputClass} w-44`}>
          <option value="open">Open (new + replied)</option>
          <option value="new">New only</option>
          <option value="replied">Replied</option>
          <option value="closed">Closed</option>
          <option value="all">All</option>
        </select>
      </PageHeader>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorBox message={error} onRetry={retry} />
      ) : list.length === 0 ? (
        <p className="py-10 text-center text-sm text-stone-500">No messages here.</p>
      ) : (
        <ul className="space-y-4">
          {list.map((m) => <MessageCard key={m.id} m={m} onChanged={retry} />)}
        </ul>
      )}
    </>
  );
}