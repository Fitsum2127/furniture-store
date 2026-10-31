export const money = (n) => `ETB ${Number(n).toLocaleString('en-US')}`;

export const fmtDate = (d) =>
  new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const inputClass =
  'w-full rounded-xl border border-sand-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-olive dark:border-stone-700';

export const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-full bg-olive px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-olive-dark disabled:opacity-60';

export const btnGhost =
  'inline-flex items-center justify-center gap-2 rounded-full border border-sand-300 px-4 py-2 text-sm font-medium transition hover:bg-sand-100 dark:border-stone-700 dark:hover:bg-stone-800';

export function Loading() {
  return <p className="py-10 text-center text-sm text-stone-500">Loading...</p>;
}

export function ErrorBox({ message, onRetry }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
      <p>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-2 font-medium underline">
          Try again
        </button>
      )}
    </div>
  );
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