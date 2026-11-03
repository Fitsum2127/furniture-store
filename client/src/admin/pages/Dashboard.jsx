import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownRight, ArrowRight, ArrowUpRight, CheckCircle2, Circle, Receipt, ShoppingCart, Users, Wallet } from 'lucide-react';
import useFetch from '../../hooks/useFetch.js';
import { useLang } from '../../context/LanguageContext.jsx';
import { onImgError } from '../../lib/api.js';
import { adminApi } from '../adminApi.js';
import { Badge, ErrorBox, Loading, PageHeader, btnPrimary, card, statusColor, useFmt, useLabels } from '../ui.jsx';

const COLORS = ['#6b7a4f', '#b08968', '#8a9a6b', '#c4a882', '#556040', '#d9c6aa'];

function Spark({ data, stroke }) {
  const W = 120;
  const H = 40;
  const max = Math.max(1, ...data);
  const pts = data.map((v, i) => [(i / (data.length - 1 || 1)) * W, H - 3 - (v / max) * (H - 8)]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  return (
    <svg viewBox="0 0 120 40" className="h-10 w-24" aria-hidden="true">
      <path d={`${line} L${W},${H} L0,${H} Z`} fill={stroke} opacity="0.18" />
      <path d={line} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function Kpi({ title, value, change, series, icon: Icon, dark }) {
  const { t } = useLang();
  const up = change !== null && change >= 0;
  return (
    <div className={dark ? 'rounded-2xl bg-olive-dark p-5 text-white' : `${card} p-5`}>
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${dark ? 'bg-white/15' : 'bg-sand-100 text-olive dark:bg-stone-800'}`}><Icon size={19} /></span>
        <p className={`text-sm ${dark ? 'text-white/80' : 'text-stone-500 dark:text-stone-400'}`}>{title}</p>
      </div>
      <div className="mt-4 flex items-end justify-between gap-2">
        <div>
          <p className="text-2xl font-bold">{value}</p>
          {change === null ? (
            <p className={`mt-1 text-xs ${dark ? 'text-white/60' : 'text-stone-400'}`}>{t('a_noCompare')}</p>
          ) : (
            <p className={`mt-1 flex items-center gap-1 text-xs font-medium ${dark ? (up ? 'text-green-300' : 'text-red-300') : up ? 'text-green-600' : 'text-red-500'}`}>
              {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {Math.abs(change)}% <span className={dark ? 'text-white/60' : 'text-stone-400'}>{t('a_vsPrev')}</span>
            </p>
          )}
        </div>
        <Spark data={series} stroke={dark ? '#ffffff' : '#6b7a4f'} />
      </div>
    </div>
  );
}

function AreaChart({ labels, values, format }) {
  const [hover, setHover] = useState(null);
  const W = 640;
  const H = 220;
  const pad = { l: 8, r: 8, t: 16, b: 26 };
  const max = Math.max(1, ...values);
  const x = (i) => pad.l + (values.length === 1 ? 0 : (i / (values.length - 1)) * (W - pad.l - pad.r));
  const y = (v) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  const line = values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const area = `${line} L${x(values.length - 1).toFixed(1)},${H - pad.b} L${x(0).toFixed(1)},${H - pad.b} Z`;

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const rel = (e.clientX - rect.left) / rect.width;
    setHover(Math.max(0, Math.min(values.length - 1, Math.round(rel * (values.length - 1)))));
  };

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" onMouseMove={onMove} onMouseLeave={() => setHover(null)} role="img" aria-label="chart">
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6b7a4f" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6b7a4f" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((i) => {
          const gy = pad.t + (i / 3) * (H - pad.t - pad.b);
          return <line key={i} x1={pad.l} x2={W - pad.r} y1={gy} y2={gy} stroke="currentColor" opacity="0.1" />;
        })}
        <path d={area} fill="url(#areaFill)" />
        <path d={line} fill="none" stroke="#6b7a4f" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {labels.map((l, i) => (i % 5 === 0 || i === labels.length - 1) && (
          <text key={l} x={x(i)} y={H - 6} fontSize="11" textAnchor="middle" fill="currentColor" opacity="0.5">{l.slice(5)}</text>
        ))}
        {hover !== null && (
          <>
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} stroke="#6b7a4f" strokeDasharray="4 4" opacity="0.6" />
            <circle cx={x(hover)} cy={y(values[hover])} r="5" fill="#6b7a4f" stroke="#fff" strokeWidth="2" />
          </>
        )}
      </svg>
      {hover !== null && (
        <div className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg bg-stone-900 px-3 py-1.5 text-xs text-white shadow" style={{ left: `${(x(hover) / W) * 100}%` }}>
          <p className="opacity-70">{labels[hover]}</p>
          <p className="font-semibold">{format(values[hover])}</p>
        </div>
      )}
    </div>
  );
}

function Donut({ items, center, label }) {
  const total = items.reduce((s, i) => s + i.value, 0);
  let cumulative = 0;
  return (
    <div className="relative mx-auto h-44 w-44">
      <svg viewBox="0 0 42 42" className="h-full w-full" role="img" aria-label={label}>
        <circle cx="21" cy="21" r="15.9155" fill="none" stroke="currentColor" opacity="0.08" strokeWidth="5" />
        {total > 0 && items.map((it, i) => {
          const p = (it.value / total) * 100;
          const el = <circle key={i} cx="21" cy="21" r="15.9155" fill="none" stroke={COLORS[i % COLORS.length]} strokeWidth="5" strokeDasharray={`${p} ${100 - p}`} strokeDashoffset={100 - cumulative + 25} />;
          cumulative += p;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-lg font-bold leading-tight">{center}</p>
        <p className="text-xs text-stone-500">{label}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { t, tr } = useLang();
  const { money, fmtDay } = useFmt();
  const { st } = useLabels();
  const [tab, setTab] = useState('revenue');
  const { data: d, loading, error, retry } = useFetch(() => adminApi('/dashboard'), []);

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={retry} />;

  const k = d.kpis;
  const avgSeries = d.series.revenue.map((r, i) => (d.series.orders[i] ? r / d.series.orders[i] : 0));
  const catTotal = d.categories.reduce((s, c) => s + c.revenue, 0);
  const maxCity = Math.max(1, ...d.cities.map((c) => c.orders));
  const pending = d.checklist.filter((c) => !c.done);

  return (
    <>
      <PageHeader title={t('a_dashboard')} subtitle={t('a_dashSub')}>
        <Link to="/admin/reports" className={btnPrimary}>{t('a_viewReports')} <ArrowRight size={15} /></Link>
      </PageHeader>

      {pending.length > 0 && (
        <section className="mb-6 rounded-2xl border border-olive/40 bg-olive/5 p-5">
          <h2 className="font-semibold">{t('a_setupChecklist')}</h2>
          <p className="text-sm text-stone-600 dark:text-stone-400">{t('a_setupSub')}</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {d.checklist.map((c) => (
              <li key={c.key}>
                <Link to={c.to} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition hover:bg-white dark:hover:bg-stone-800 ${c.done ? 'text-stone-400 line-through' : 'font-medium'}`}>
                  {c.done ? <CheckCircle2 size={17} className="text-olive" /> : <Circle size={17} />} {t(`a_ck_${c.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi dark icon={Wallet} title={t('a_kpiRevenue')} value={money(k.revenue.value)} change={k.revenue.change} series={d.series.revenue} />
        <Kpi icon={ShoppingCart} title={t('a_kpiOrders')} value={k.orders.value} change={k.orders.change} series={d.series.orders} />
        <Kpi icon={Users} title={t('a_kpiCustomers')} value={k.customers.value} change={k.customers.change} series={d.series.customers} />
        <Kpi icon={Receipt} title={t('a_kpiAvg')} value={money(k.avgOrder.value)} change={k.avgOrder.change} series={avgSeries} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className={`${card} p-5 lg:col-span-2`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold">{t('a_revenueOverview')}</h2>
              <p className="text-xs text-stone-500">{t('a_last30days')} · {t('a_revenueNote')}</p>
            </div>
            <div className="flex rounded-full bg-sand-100 p-1 text-xs font-semibold dark:bg-stone-800">
              {['revenue', 'orders'].map((x) => (
                <button key={x} onClick={() => setTab(x)} className={`rounded-full px-4 py-1.5 transition ${tab === x ? 'bg-stone-900 text-white dark:bg-olive' : ''}`}>{t(x === 'revenue' ? 'a_tabRevenue' : 'a_tabOrders')}</button>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <AreaChart labels={d.series.labels} values={tab === 'revenue' ? d.series.revenue : d.series.orders} format={tab === 'revenue' ? money : (n) => String(n)} />
          </div>
        </section>

        <section className={`${card} p-5`}>
          <h2 className="font-semibold">{t('a_salesByCategory')}</h2>
          {catTotal === 0 ? <p className="py-10 text-center text-sm text-stone-500">{t('a_noData')}</p> : (
            <>
              <div className="mt-4">
                <Donut items={d.categories.map((c) => ({ value: c.revenue }))} center={money(catTotal)} label={t('a_totalSales')} />
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                {d.categories.map((c, i) => (
                  <li key={i} className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2"><span className="h-2.5 w-2.5 flex-none rounded-full" style={{ background: COLORS[i % COLORS.length] }} /><span className="truncate">{c.name_en ? tr({ en: c.name_en, am: c.name_am }) : t('a_other')}</span></span>
                    <span className="font-medium">{Math.round((c.revenue / catTotal) * 100)}%</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className={`${card} p-5`}>
          <div className="flex items-center justify-between"><h2 className="font-semibold">{t('a_topProducts')}</h2><Link to="/admin/products" className="text-xs font-medium text-olive">{t('a_viewAll')}</Link></div>
          {d.topProducts.length === 0 ? <p className="py-8 text-center text-sm text-stone-500">{t('a_noData')}</p> : (
            <table className="mt-3 w-full text-sm">
              <thead><tr className="text-left text-xs text-stone-500"><th className="py-2 font-medium">{t('a_product')}</th><th className="font-medium">{t('a_sold')}</th><th className="text-right font-medium">{t('a_revenueCol')}</th></tr></thead>
              <tbody>
                {d.topProducts.map((p) => (
                  <tr key={p.product_id} className="border-t border-sand-200 dark:border-stone-800">
                    <td className="py-2.5"><span className="flex items-center gap-3"><img src={p.thumbnail} alt="" onError={onImgError} className="h-9 w-9 rounded-lg object-cover" /><span className="max-w-[10rem] truncate">{tr({ en: p.name_en, am: p.name_am })}</span></span></td>
                    <td>{p.units}</td>
                    <td className="text-right font-semibold">{money(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className={`${card} p-5`}>
          <div className="flex items-center justify-between"><h2 className="font-semibold">{t('a_recentOrders')}</h2><Link to="/admin/orders" className="text-xs font-medium text-olive">{t('a_viewAll')}</Link></div>
          {d.recentOrders.length === 0 ? <p className="py-8 text-center text-sm text-stone-500">{t('a_noData')}</p> : (
            <ul className="mt-3 divide-y divide-sand-200 dark:divide-stone-800">
              {d.recentOrders.map((o) => (
                <li key={o.id}>
                  <Link to={`/admin/orders?q=${o.order_number}`} className="flex items-center gap-3 py-3 text-sm">
                    <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-olive/15 text-xs font-semibold text-olive">{o.customer_name.slice(0, 2).toUpperCase()}</span>
                    <span className="min-w-0 flex-1"><span className="block truncate font-medium">{o.customer_name}</span><span className="block text-xs text-stone-500">{o.order_number} · {fmtDay(o.created_at)}</span></span>
                    <span className="text-right"><span className="block font-semibold">{money(o.total)}</span><Badge color={statusColor[o.status]}>{st(o.status)}</Badge></span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className={`${card} p-5`}>
          <h2 className="font-semibold">{t('a_ordersByCity')}</h2>
          {d.cities.length === 0 ? <p className="py-8 text-center text-sm text-stone-500">{t('a_noData')}</p> : (
            <ul className="mt-3 space-y-3">
              {d.cities.map((c) => (
                <li key={c.city} className="text-sm">
                  <div className="flex justify-between"><span>{c.city}</span><span className="font-medium">{t('a_nOrdersShort', { n: c.orders })}</span></div>
                  <div className="mt-1 h-2 rounded-full bg-sand-100 dark:bg-stone-800"><div className="h-2 rounded-full bg-olive" style={{ width: `${(c.orders / maxCity) * 100}%` }} /></div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={`${card} p-5`}>
          <h2 className="font-semibold">{t('a_lowStock')}</h2>
          {d.lowStock.length === 0 ? <p className="py-8 text-center text-sm text-stone-500">{t('a_noData')}</p> : (
            <ul className="mt-3 divide-y divide-sand-200 dark:divide-stone-800">
              {d.lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-3 text-sm">
                  <Link to={`/admin/products/${p.id}`} className="truncate font-medium hover:text-olive">{tr({ en: p.name_en, am: p.name_am })}</Link>
                  <Badge color={p.stock === 0 ? 'red' : 'amber'}>{p.stock === 0 ? t('a_soldOutLabel') : t('a_nLeft', { n: p.stock })}</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}