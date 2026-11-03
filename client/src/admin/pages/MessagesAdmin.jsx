import { useState } from 'react';
import { Mail, Phone, RotateCcw, Trash2, XCircle } from 'lucide-react';
import useFetch from '../../hooks/useFetch.js';
import { useLang } from '../../context/LanguageContext.jsx';
import { adminApi } from '../adminApi.js';
import ActionMenu from '../ActionMenu.jsx';
import { Badge, ErrorBox, Loading, PageHeader, btnPrimary, card, inputClass, useFmt, useLabels } from '../ui.jsx';

const statusColor = { new: 'blue', replied: 'green', closed: 'gray' };

function MessageCard({ m, onChanged }) {
  const { t } = useLang();
  const { fmtDate } = useFmt();
  const { ms } = useLabels();
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
  const patch = (body) => act(() => adminApi(`/messages/${m.id}`, { method: 'PATCH', body: JSON.stringify(body) }));
  const mailto = m.email ? `mailto:${m.email}?subject=${encodeURIComponent('Re: your message')}&body=${encodeURIComponent(reply)}` : null;

  return (
    <li className={`${card} p-5`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div><p className="font-semibold">{m.name}</p><p className="text-xs text-stone-500">{fmtDate(m.created_at)}</p></div>
        <div className="flex items-center gap-2">
          <Badge color={statusColor[m.status]}>{ms(m.status)}</Badge>
          <ActionMenu
            items={[
              mailto && { label: t('a_sendEmail'), icon: Mail, href: mailto },
              m.phone && { label: t('a_callCustomer'), icon: Phone, href: `tel:${m.phone}` },
              m.status !== 'closed'
                ? { label: t('a_close'), icon: XCircle, onClick: () => patch({ status: 'closed' }) }
                : { label: t('a_reopen'), icon: RotateCcw, onClick: () => patch({ status: 'new' }) },
              { label: t('a_delete'), icon: Trash2, danger: true, onClick: () => window.confirm(t('a_confirmDeleteMessage')) && act(() => adminApi(`/messages/${m.id}`, { method: 'DELETE' })) },
            ]}
          />
        </div>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm">{m.body}</p>
      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        {m.phone && <a href={`tel:${m.phone}`} className="inline-flex items-center gap-1.5 text-olive underline"><Phone size={14} /> {m.phone}</a>}
        {m.email && <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1.5 text-olive underline"><Mail size={14} /> {m.email}</a>}
      </div>
      <div className="mt-4 border-t border-sand-200 pt-4 dark:border-stone-800">
        <label className="text-xs font-medium" htmlFor={`reply-${m.id}`}>{t('a_yourReply')}</label>
        <textarea id={`reply-${m.id}`} value={reply} onChange={(e) => setReply(e.target.value)} rows={3} className={`${inputClass} mt-1 resize-none`} />
        {m.replied_at && <p className="mt-1 text-xs text-stone-500">{t('a_lastReply', { date: fmtDate(m.replied_at) })}</p>}
        {err && <p className="mt-2 text-sm text-red-500" role="alert">{err}</p>}
        <div className="mt-3">
          <button onClick={() => patch({ reply_text: reply })} disabled={busy || !reply.trim()} className={btnPrimary}>{t('a_saveReply')}</button>
        </div>
      </div>
    </li>
  );
}

export default function MessagesAdmin() {
  const { t } = useLang();
  const { data, loading, error, retry } = useFetch(() => adminApi('/messages'), []);
  const [filter, setFilter] = useState('open');
  const list = (data || []).filter((m) => (filter === 'open' ? m.status !== 'closed' : filter === 'all' ? true : m.status === filter));

  return (
    <>
      <PageHeader title={t('a_messages')} subtitle={t('a_messagesSub')}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label={t('a_messages')} className={`${inputClass} w-48`}>
          <option value="open">{t('a_filterOpen')}</option><option value="new">{t('a_filterNew')}</option><option value="replied">{t('a_filterReplied')}</option><option value="closed">{t('a_filterClosed')}</option><option value="all">{t('a_filterAll')}</option>
        </select>
      </PageHeader>
      {loading ? <Loading /> : error ? <ErrorBox message={error} onRetry={retry} /> : list.length === 0 ? (
        <p className="py-10 text-center text-sm text-stone-500">{t('a_noMessages')}</p>
      ) : (
        <ul className="space-y-4">{list.map((m) => <MessageCard key={m.id} m={m} onChanged={retry} />)}</ul>
      )}
    </>
  );
}