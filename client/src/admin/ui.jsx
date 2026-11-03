import { useLang } from '../context/LanguageContext.jsx';

export function useFmt() {
  const { lang } = useLang();
  const am = lang === 'am';
  return {
    money: (n) => (am ? `${Number(n).toLocaleString('en-US')} ብር` : `ETB ${Number(n).toLocaleString('en-US')}`),
    fmtDate: (d) => new Date(d).toLocaleString(am ? 'am-ET' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    fmtDay: (d) => new Date(d).toLocaleDateString(am ? 'am-ET' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
  };
}

export function useLabels() {
  const { t } = useLang();
  return { st: (k) => t(`a_st_${k}`), pay: (k) => t(`a_pay_${k}`), method: (k) => t(`a_m_${k}`), ms: (k) => t(`a_ms_${k}`) };
}

export const statusColor = { new: 'blue', confirmed: 'amber', shipped: 'amber', delivered: 'green', cancelled: 'red' };
export const payColor = { pending: 'amber', paid: 'green', failed: 'red' };

export const card = 'rounded-2xl border border-sand-200 bg-white dark:border-stone-800 dark:bg-stone-900';
export const inputClass = 'w-full rounded-xl border border-sand-300 bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-olive dark:border-stone-700';
export const btnPrimary = 'inline-flex items-center justify-center gap-2 rounded-full bg-olive px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-olive-dark disabled:cursor-not-allowed disabled:opacity-60';
export const btnGhost = 'inline-flex items-center justify-center gap-2 rounded-full border border-sand-300 bg-white px-4 py-2 text-sm font-medium transition hover:bg-sand-100 disabled:opacity-50 dark:border-stone-700 dark:bg-transparent dark:hover:bg-stone-800';

export function Loading() {
  const { t } = useLang();
  return <p className="py-10 text-center text-sm text-stone-500">{t('a_loading')}</p>;
}

export function ErrorBox({ message, onRetry }) {
  const { t } = useLang();
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
      <p>{message}</p>
      {onRetry && <button onClick={onRetry} className="mt-2 font-medium underline">{t('a_retry')}</button>}
    </div>
  );
}

export function Notice({ children }) {
  return <p className="mb-4 rounded-xl bg-sand-100 p-3 text-sm dark:bg-stone-800" role="status">{children}</p>;
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

const BADGES = {
  green: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  red: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  gray: 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
};

export function Badge({ color = 'gray', children }) {
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGES[color]}`}>{children}</span>;
}