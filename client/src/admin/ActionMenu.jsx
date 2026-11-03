import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical } from 'lucide-react';
import { useLang } from '../context/LanguageContext.jsx';

// Three-dot menu. Each item: { label, icon, onClick | to | href, danger }. Items that are false or null are skipped.
export default function ActionMenu({ items }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false);
  const ref = useRef(null);
  const list = (items || []).filter(Boolean);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (list.length === 0) return null;

  const toggle = () => {
    if (!open && ref.current) {
      const r = ref.current.getBoundingClientRect();
      setUp(window.innerHeight - r.bottom < 56 + list.length * 44);
    }
    setOpen((o) => !o);
  };

  const row = 'flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-sand-100 dark:hover:bg-stone-800';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('a_actions')}
        title={t('a_actions')}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-sand-300 bg-white transition hover:bg-sand-100 dark:border-stone-700 dark:bg-transparent dark:hover:bg-stone-800"
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute right-0 z-30 w-56 rounded-xl border border-sand-200 bg-white p-1.5 shadow-xl dark:border-stone-700 dark:bg-stone-900 ${up ? 'bottom-11' : 'top-11'}`}
        >
          {list.map((it, i) => {
            const Icon = it.icon;
            const cls = `${row} ${it.danger ? 'text-red-600' : ''}`;
            const inner = (
              <>
                {Icon && <Icon size={16} className="flex-none" />}
                <span className="truncate">{it.label}</span>
              </>
            );
            if (it.to) {
              return <Link key={i} role="menuitem" to={it.to} onClick={() => setOpen(false)} className={cls}>{inner}</Link>;
            }
            if (it.href) {
              return (
                <a key={i} role="menuitem" href={it.href} target={it.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" onClick={() => setOpen(false)} className={cls}>
                  {inner}
                </a>
              );
            }
            return (
              <button
                key={i}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  it.onClick();
                }}
                className={cls}
              >
                {inner}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}