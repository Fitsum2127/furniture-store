import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch.js';
import { adminApi } from '../adminApi.js';
import { Badge, ErrorBox, Loading, PageHeader, fmtDate, money } from '../ui.jsx';

const statusColor = { new: 'blue', confirmed: 'amber', shipped: 'amber', delivered: 'green', cancelled: 'red' };

export default function Dashboard() {
  const { data, loading, error, retry } = useFetch(() => adminApi('/stats'), []);

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={retry} />;

  const cards = [
    { label: 'Active products', value: data.products, to: '/admin/products' },
    { label: 'New orders', value: data.newOrders, to: '/admin/orders', highlight: data.newOrders > 0 },
    { label: 'Revenue (not cancelled)', value: money(data.revenue), to: '/admin/orders' },
    { label: 'Subscribers', value: data.subscribers, to: '/admin/subscribers' },
    { label: 'New messages', value: data.newMessages, to: '/admin/messages', highlight: data.newMessages > 0 },
    { label: 'Reviews to approve', value: data.pendingReviews, to: '/admin/reviews', highlight: data.pendingReviews > 0 },
  ];

  return (
    <>
      <PageHeader title="Dashboard" subtitle="What needs your attention today" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className={`rounded-2xl border bg-white p-5 transition hover:border-olive dark:bg-stone-900 ${
              c.highlight ? 'border-olive' : 'border-sand-200 dark:border-stone-800'
            }`}
          >
            <p className="text-xs text-stone-500 dark:text-stone-400">{c.label}</p>
            <p className="mt-2 text-2xl font-bold">{c.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-sand-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
          <h2 className="font-semibold">Recent orders</h2>
          {data.recentOrders.length === 0 ? (
            <p className="mt-3 text-sm text-stone-500">No orders yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-sand-200 dark:divide-stone-800">
              {data.recentOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div>
                    <p className="font-medium">#{o.id} · {o.customer_name}</p>
                    <p className="text-xs text-stone-500">{fmtDate(o.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{money(o.total)}</p>
                    <Badge color={statusColor[o.status]}>{o.status}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-sand-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
          <h2 className="font-semibold">Low stock (5 or fewer)</h2>
          {data.lowStock.length === 0 ? (
            <p className="mt-3 text-sm text-stone-500">All products have enough stock.</p>
          ) : (
            <ul className="mt-3 divide-y divide-sand-200 dark:divide-stone-800">
              {data.lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-3 text-sm">
                  <Link to={`/admin/products/${p.id}`} className="font-medium hover:text-olive">{p.name_en}</Link>
                  <Badge color={p.stock === 0 ? 'red' : 'amber'}>{p.stock === 0 ? 'Sold out' : `${p.stock} left`}</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}