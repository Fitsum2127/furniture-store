import { useState } from 'react';
import useFetch from '../../hooks/useFetch.js';
import { useLang } from '../../context/LanguageContext.jsx';
import { adminApi } from '../adminApi.js';
import { ErrorBox, Loading, PageHeader, card, inputClass, useFmt } from '../ui.jsx';

export default function ReportsAdmin() {
  const { t } = useLang();
  const { money } = useFmt();
  const [period, setPeriod] = useState('day');
  const sales = useFetch(() => adminApi(`/reports/sales?period=${period}`), [period]);
  const top = useFetch(() => adminApi('/reports/top-products?days=30'), []);
  const stats = useFetch(() => adminApi('/stats'), []);
  const max = sales.data ? Math.max(1, ...sales.data.map((r) => r.revenue)) : 1;
  const s = stats.data;

  return (
    <>
      <PageHeader title={t('a_reports')} subtitle={t('a_reportsSub')}>
        <select value={period} onChange={(e) => setPeriod(e.target.value)} aria-label={t('a_period')} className={`${inputClass} w-44`}>
          <option value="day">{t('a_daily')}</option><option value="week">{t('a_weekly')}</option><option value="month">{t('a_monthly')}</option>
        </select>
      </PageHeader>

      {s && (
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[[t('a_today'), money(s.salesToday)], [t('a_last7'), money(s.salesWeek)], [t('a_last30'), money(s.salesMonth)], [t('a_paidRevenue'), money(s.paidRevenue)],
            [t('a_totalOrdersLabel'), s.totalOrders], [t('a_newOrdersLabel'), s.ordersByStatus.new || 0], [t('a_deliveredLabel'), s.ordersByStatus.delivered || 0], [t('a_cancelledLabel'), s.ordersByStatus.cancelled || 0]].map(([k, v]) => (
            <div key={k} className={`${card} p-4`}><p className="text-xs text-stone-500">{k}</p><p className="mt-1 text-xl font-bold">{v}</p></div>
          ))}
        </div>
      )}

      <section className={`${card} p-5`}>
        <h2 className="font-semibold">{t('a_salesFor', { period: t(`a_p_${period}`) })}</h2>
        {sales.loading ? <Loading /> : sales.error ? <ErrorBox message={sales.error} onRetry={sales.retry} /> : sales.data.length === 0 ? (
          <p className="mt-4 text-sm text-stone-500">{t('a_noOrdersPeriod')}</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead><tr className="text-left text-xs text-stone-500"><th className="py-2">{t('a_periodCol')}</th><th>{t('a_ordersCol')}</th><th>{t('a_revenueCol')}</th><th>{t('a_paidCol')}</th><th>{t('a_cancelledLabel')}</th><th className="w-1/3" /></tr></thead>
              <tbody>
                {sales.data.map((r) => (
                  <tr key={r.label} className="border-t border-sand-200 dark:border-stone-800">
                    <td className="py-2 font-medium">{r.label}</td><td>{r.orders}</td><td>{money(r.revenue)}</td><td>{money(r.paid)}</td><td>{r.cancelled}</td>
                    <td><div className="h-2 rounded-full bg-sand-100 dark:bg-stone-800"><div className="h-2 rounded-full bg-olive" style={{ width: `${(r.revenue / max) * 100}%` }} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={`${card} mt-6 p-5`}>
        <h2 className="font-semibold">{t('a_topProducts30')}</h2>
        {top.data && top.data.length > 0 ? (
          <ul className="mt-3 divide-y divide-sand-200 text-sm dark:divide-stone-800">
            {top.data.map((p) => <li key={p.product_id} className="flex justify-between py-2"><span>{p.name_en}</span><span>{t('a_unitsSold', { n: p.units })} · {money(p.revenue)}</span></li>)}
          </ul>
        ) : <p className="mt-3 text-sm text-stone-500">{t('a_noSalesYet')}</p>}
      </section>
    </>
  );
}