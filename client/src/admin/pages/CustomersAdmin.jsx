import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Ban, CheckCircle2, KeyRound } from 'lucide-react';
import useFetch from '../../hooks/useFetch.js';
import { useLang } from '../../context/LanguageContext.jsx';
import { adminApi } from '../adminApi.js';
import ActionMenu from '../ActionMenu.jsx';
import { useFeedback } from '../feedback.jsx';
import { Badge, ErrorBox, Loading, PageHeader, card, inputClass, useFmt } from '../ui.jsx';

export default function CustomersAdmin() {
  const { t } = useLang();
  const { money, fmtDay } = useFmt();
  const fb = useFeedback();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  useEffect(() => setQ(params.get('q') || ''), [params]);
  const { data, loading, error, retry } = useFetch(() => adminApi(`/customers${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`), [q]);

  const toggle = async (c) => {
    try {
      await adminApi(`/customers/${c.id}/active`, { method: 'PATCH', body: JSON.stringify({ is_active: c.is_active ? 0 : 1 }) });
      fb.success(t(c.is_active ? 'a_customerBlocked' : 'a_customerUnblocked'));
      retry();
    } catch (e) {
      fb.error(e.message);
    }
  };

  const setPassword = (c) =>
    fb.prompt({
      text: t('a_promptTempPw', { name: c.name }),
      placeholder: t('a_newPassword'),
      secret: true,
      confirmLabel: t('a_save'),
      validate: (v) => (v.length < 8 ? t('a_errTempPw') : ''),
      onConfirm: async (value) => {
        try {
          await adminApi(`/customers/${c.id}/password`, { method: 'POST', body: JSON.stringify({ newPassword: value }) });
          fb.success(t('a_tempPwSet', { name: c.name }));
        } catch (e) {
          fb.error(e.message);
        }
      },
    });

  return (
    <>
      <PageHeader title={t('a_customers')} subtitle={t('a_customersSub')} />
      {fb.banner}
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('a_searchCustomers')} aria-label={t('a_searchCustomers')} className={`${inputClass} mb-4 max-w-sm`} />
      {loading ? <Loading /> : error ? <ErrorBox message={error} onRetry={retry} /> : data.length === 0 ? (
        <p className="py-10 text-center text-sm text-stone-500">{t('a_noCustomers')}</p>
      ) : (
        <ul className="space-y-3">
          {data.map((c) => (
            <li key={c.id} className={`${card} flex flex-wrap items-center gap-4 p-4`}>
              <div className="min-w-0 flex-1 basis-52">
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-stone-500">{c.phone}{c.email ? ` · ${c.email}` : ''}</p>
                <p className="text-xs text-stone-500">{t('a_joined')} {fmtDay(c.created_at)}{c.last_login_at ? ` · ${t('a_lastLogin')} ${fmtDay(c.last_login_at)}` : ''}</p>
              </div>
              <div className="text-sm"><p className="font-semibold">{money(c.total_spent)}</p><p className="text-xs text-stone-500">{t('a_nOrders', { n: c.orders_count })}</p></div>
              <Badge color={c.is_active ? 'green' : 'red'}>{c.is_active ? t('a_activeLabel') : t('a_blocked')}</Badge>
              <ActionMenu
                items={[
                  { label: t('a_setTempPw'), icon: KeyRound, onClick: () => setPassword(c) },
                  { label: c.is_active ? t('a_block') : t('a_unblock'), icon: c.is_active ? Ban : CheckCircle2, onClick: () => toggle(c) },
                ]}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}