import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, MessageSquare, Package, Search, ShoppingCart, Users, X } from 'lucide-react';
import { useLang } from '../context/LanguageContext.jsx';
import { adminApi } from './adminApi.js';

// Every admin page with the words people may type (English words work even when the language is Amharic).
const PAGES = [
  { to: '/admin', key: 'a_dashboard', kw: 'dashboard home overview stats statistics revenue checklist setup chart' },
  { to: '/admin/orders', key: 'a_orders', kw: 'orders order sales payment paid delivery status cancel confirmed shipped delivered guest' },
  { to: '/admin/products', key: 'a_products', kw: 'products product items furniture stock price sku featured hide' },
  { to: '/admin/products/new', key: 'a_addProduct', kw: 'add new create product item' },
  { to: '/admin/categories', key: 'a_categories', kw: 'categories category rooms groups menu' },
  { to: '/admin/customers', key: 'a_customers', kw: 'customers customer clients accounts users block password' },
  { to: '/admin/reports', key: 'a_reports', kw: 'sales reports report revenue daily weekly monthly analytics top products' },
  { to: '/admin/messages', key: 'a_messages', kw: 'messages message contact inbox reply email' },
  { to: '/admin/subscribers', key: 'a_subscribers', kw: 'subscribers subscriber newsletter email emails csv export' },
  { to: '/admin/reviews', key: 'a_reviews', kw: 'reviews review rating ratings approve comments feedback' },
  { to: '/admin/hero', key: 'a_heroPage', kw: 'hero section slider slide slides banner home photo image picture text title button' },
  { to: '/admin/about', key: 'a_aboutPage', kw: 'about page story sections company' },
  { to: '/admin/content', key: 'a_content', kw: 'policies policy faq questions answers privacy terms warranty return refund delivery' },
  { to: '/admin/settings', key: 'a_settings', kw: 'business settings phone whatsapp email address hours delivery fee social telegram facebook instagram tiktok payment logo favicon icon name' },
  { to: '/admin/account', key: 'a_myAccount', kw: 'my account profile username name password security login photo avatar' },
  { to: '/', key: 'a_viewStore', kw: 'view store website shop public customers see' },
];

const GROUP_ICON = { pages: ArrowUpRight, products: Package, orders: ShoppingCart, customers: Users, messages: MessageSquare };
const SPLIT = /[\s,.&/\-_()]+/;

// Edit distance that counts a swapped pair of letters ("ored" and "orde") as a single mistake.
function distance(a, b) {
  const al = a.length;
  const bl = b.length;
  const d = Array.from({ length: al + 1 }, () => new Array(bl + 1).fill(0));
  for (let i = 0; i <= al; i += 1) d[i][0] = i;
  for (let j = 0; j <= bl; j += 1) d[0][j] = j;
  for (let i = 1; i <= al; i += 1) {
    for (let j = 1; j <= bl; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[al][bl];
}

// How well one typed word matches the words of a page: beginning of a word, inside a word, or a close spelling.
function scoreToken(tok, words) {
  let best = 0;
  for (const w of words) {
    if (w.startsWith(tok)) {
      best = Math.max(best, 100 - (w.length - tok.length) * 0.5);
    } else if (tok.length >= 3) {
      if (w.includes(tok)) {
        best = Math.max(best, 60);
      } else {
        const allowed = tok.length >= 6 ? 2 : 1;
        const d = Math.min(distance(tok, w.slice(0, tok.length)), distance(tok, w.slice(0, tok.length + 1)), distance(tok, w));
        if (d <= allowed) best = Math.max(best, 50 - d * 10);
      }
    }
  }
  return best;
}

export default function AdminSearch() {
  const { t, tr } = useLang();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [active, setActive] = useState(0);
  const box = useRef(null);
  const input = useRef(null);
  const seq = useRef(0);
  const query = q.trim().toLowerCase();
  const showing = open && query.length > 0; // nothing is shown until you start typing

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (box.current && !box.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
    };
  }, [open]);

  // Search products, orders, customers and messages while typing (two letters or more).
  useEffect(() => {
    if (query.length < 2) {
      setData(null);
      return undefined;
    }
    seq.current += 1;
    const mine = seq.current;
    const id = setTimeout(async () => {
      try {
        const r = await adminApi(`/search?q=${encodeURIComponent(q.trim())}`);
        if (seq.current === mine) setData(r);
      } catch (e) {
        if (seq.current === mine) setData(null);
      }
    }, 250);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Pages that match what you typed, best match first. Small spelling mistakes are forgiven.
  const pageItems = useMemo(() => {
    const tokens = query.split(/\s+/).filter(Boolean);
    if (!tokens.length) return [];
    return PAGES.map((p) => {
      const label = t(p.key);
      const words = `${label.toLowerCase()} ${p.kw}`.split(SPLIT).filter(Boolean);
      const scores = tokens.map((tok) => scoreToken(tok, words));
      if (scores.some((s) => s === 0)) return null;
      const bonus = label.toLowerCase().startsWith(tokens[0]) ? 20 : 0;
      return { group: 'pages', key: p.to, label, to: p.to, score: scores.reduce((a, b) => a + b, 0) + bonus };
    })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [query, t]);

  const dataItems = data
    ? [
        ...data.products.map((p) => ({ group: 'products', key: `p${p.id}`, label: tr({ en: p.name_en, am: p.name_am }), sub: p.sku, to: `/admin/products/${p.id}` })),
        ...data.orders.map((o) => ({ group: 'orders', key: `o${o.id}`, label: `${o.order_number} · ${o.customer_name}`, sub: '', to: `/admin/orders?q=${encodeURIComponent(o.order_number)}` })),
        ...data.customers.map((c) => ({ group: 'customers', key: `c${c.id}`, label: c.name, sub: c.phone || c.email || '', to: `/admin/customers?q=${encodeURIComponent(c.name)}` })),
        ...data.messages.map((m) => ({ group: 'messages', key: `m${m.id}`, label: m.name, sub: m.snippet, to: '/admin/messages' })),
      ]
    : [];
  const items = [...pageItems, ...dataItems];
  const groupLabel = { pages: t('a_sPages'), products: t('a_products'), orders: t('a_orders'), customers: t('a_customers'), messages: t('a_messages') };

  useEffect(() => setActive(0), [query, items.length]);

  const go = (item) => {
    if (!item) return;
    navigate(item.to);
    setQ('');
    setOpen(false);
    if (input.current) input.current.blur();
  };

  const clear = () => {
    setQ('');
    setOpen(false);
    if (input.current) input.current.focus();
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (query) setOpen(true);
      setActive((i) => Math.min(items.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (query) go(items[active] || items[0]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      if (input.current) input.current.blur();
    }
  };

  const searching = query.length >= 2 && data === null;

  return (
    <div className="relative min-w-0 flex-1 md:max-w-md" ref={box}>
      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
      <input
        ref={input}
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => { if (q.trim()) setOpen(true); }}
        onKeyDown={onKeyDown}
        placeholder={t('a_searchPh')}
        aria-label={t('a_searchPh')}
        role="combobox"
        aria-expanded={showing}
        aria-autocomplete="list"
        autoComplete="off"
        className="w-full rounded-full border border-sand-200 bg-white py-2.5 pl-10 pr-10 text-sm outline-none focus:border-olive dark:border-stone-800 dark:bg-stone-900"
      />
      {q && (
        <button type="button" onClick={clear} aria-label={t('a_dismiss')} className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-stone-400 hover:bg-sand-100 dark:hover:bg-stone-800">
          <X size={15} />
        </button>
      )}

      {showing && (
        <div role="listbox" className="absolute left-0 right-0 top-12 z-40 max-h-96 overflow-y-auto rounded-2xl border border-sand-200 bg-white p-2 shadow-xl dark:border-stone-800 dark:bg-stone-900">
          {items.length === 0 ? (
            <p className="px-3 py-4 text-sm text-stone-500">{searching ? '...' : t('a_sNoResults', { q: q.trim() })}</p>
          ) : (
            items.map((item, i) => {
              const Icon = GROUP_ICON[item.group];
              return (
                <div key={`${item.group}-${item.key}`}>
                  {(i === 0 || items[i - 1].group !== item.group) && (
                    <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-widest text-stone-500">{groupLabel[item.group]}</p>
                  )}
                  <button
                    type="button"
                    role="option"
                    aria-selected={i === active}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => go(item)}
                    onMouseEnter={() => setActive(i)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${i === active ? 'bg-sand-100 dark:bg-stone-800' : ''}`}
                  >
                    <Icon size={16} className="flex-none text-olive" />
                    <span className="min-w-0 flex-1 truncate font-medium">{item.label}</span>
                    {item.sub && <span className="max-w-[10rem] flex-none truncate text-xs text-stone-500">{item.sub}</span>}
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}