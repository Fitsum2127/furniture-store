import { useState } from 'react';
import { Copy, Download, Trash2 } from 'lucide-react';
import useFetch from '../../hooks/useFetch.js';
import { useLang } from '../../context/LanguageContext.jsx';
import { adminApi } from '../adminApi.js';
import ActionMenu from '../ActionMenu.jsx';
import { ErrorBox, Loading, Notice, PageHeader, btnGhost, card, inputClass, useFmt } from '../ui.jsx';

export default function SubscribersAdmin() {
  const { t } = useLang();
  const { fmtDate } = useFmt();
  const { data, loading, error, retry } = useFetch(() => adminApi('/subscribers'), []);
  const [q, setQ] = useState('');
  const [msg, setMsg] = useState('');
  const list = (data || []).filter((s) => s.email.includes(q.trim().toLowerCase()));

  const remove = async (s) => {
    if (!window.confirm(t('a_confirmRemove', { email: s.email }))) return;
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
      setMsg(t('a_nCopied', { n: list.length }));
    } catch (err) {
      setMsg(t('a_copyFailed'));
    }
  };

  return (
    <>
      <PageHeader title={t('a_subscribers')} subtitle={t('a_subscribersSub', { n: (data || []).length })}>
        <button onClick={copyAll} className={btnGhost}><Copy size={15} /> {t('a_copyEmails')}</button>
        <button onClick={exportCsv} className={btnGhost}><Download size={15} /> {t('a_exportCsv')}</button>
      </PageHeader>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('a_searchEmail')} aria-label={t('a_searchEmail')} className={`${inputClass} mb-4 max-w-sm`} />
      {msg && <Notice>{msg}</Notice>}
      {loading ? <Loading /> : error ? <ErrorBox message={error} onRetry={retry} /> : list.length === 0 ? (
        <p className="py-10 text-center text-sm text-stone-500">{t('a_noSubscribers')}</p>
      ) : (
        <ul className={`${card} divide-y divide-sand-200 dark:divide-stone-800`}>
          {list.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
              <div className="min-w-0"><p className="truncate font-medium">{s.email}</p><p className="text-xs text-stone-500">{fmtDate(s.created_at)}</p></div>
              <ActionMenu items={[{ label: t('a_delete'), icon: Trash2, danger: true, onClick: () => remove(s) }]} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}