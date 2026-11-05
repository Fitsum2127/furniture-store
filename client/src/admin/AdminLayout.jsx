import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import {
  BarChart3, Bell, FileText, Image as ImageIcon, Info, Languages, LayoutDashboard, LogOut, Mail, Menu, MessageSquare, Moon, Package, Settings, ShoppingCart, Star, Store, Sun, Tags, UserCircle, Users, X,
} from 'lucide-react';
import { useAdminAuth } from './AdminAuthContext.jsx';
import { adminApi } from './adminApi.js';
import AdminSearch from './AdminSearch.jsx';
import useFetch from '../hooks/useFetch.js';
import { useLang } from '../context/LanguageContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { assetUrl } from '../lib/api.js';
import { Loading } from './ui.jsx';

const GROUPS = [
  ['a_grpMain', [
    { to: '/admin', key: 'a_dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/orders', key: 'a_orders', icon: ShoppingCart },
    { to: '/admin/products', key: 'a_products', icon: Package },
    { to: '/admin/categories', key: 'a_categories', icon: Tags },
    { to: '/admin/customers', key: 'a_customers', icon: Users },
    { to: '/admin/reports', key: 'a_reports', icon: BarChart3 },
  ]],
  ['a_grpContent', [
    { to: '/admin/messages', key: 'a_messages', icon: MessageSquare },
    { to: '/admin/subscribers', key: 'a_subscribers', icon: Mail },
    { to: '/admin/reviews', key: 'a_reviews', icon: Star },
    { to: '/admin/hero', key: 'a_heroPage', icon: ImageIcon },
    { to: '/admin/about', key: 'a_aboutPage', icon: Info },
    { to: '/admin/content', key: 'a_content', icon: FileText },
  ]],
  ['a_grpSystem', [
    { to: '/admin/settings', key: 'a_settings', icon: Settings },
    { to: '/admin/account', key: 'a_myAccount', icon: UserCircle },
  ]],
];

const SEEN_KEY = 'adminSeenAlerts';
const readSeen = () => {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY)) || {};
  } catch (e) {
    return {};
  }
};
const saveSeen = (v) => {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(v));
  } catch (e) {
    /* ignore */
  }
};

function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
    };
  }, [open]);
  return { open, setOpen, ref };
}

function Sidebar({ onNavigate }) {
  const { t } = useLang();
  const { settings } = useSettings();
  const logo = assetUrl(settings.logo_url);
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${isActive ? 'bg-olive text-white' : 'text-stone-300 hover:bg-white/10'}`;
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-2 pb-6 pt-1">
        {logo ? (
          <img src={logo} alt="" className="h-10 w-10 flex-none rounded-xl bg-white/10 object-contain p-0.5" />
        ) : (
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-olive font-display text-lg font-bold text-white">{String(settings.business_name).charAt(0)}</span>
        )}
        <div className="min-w-0">
          <p className="truncate font-display text-base font-semibold text-white">{settings.business_name}</p>
          <p className="text-xs text-stone-400">{t('a_admin')}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto">
        {GROUPS.map(([label, links]) => (
          <div key={label}>
            <p className="mb-1.5 px-3.5 text-[11px] font-semibold uppercase tracking-widest text-stone-500">{t(label)}</p>
            <div className="space-y-1">
              {links.map(({ to, key, icon: Icon, end }) => (
                <NavLink key={to} to={to} end={end} onClick={onNavigate} className={linkClass}>
                  <Icon size={18} /> {t(key)}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <Link to="/" onClick={onNavigate} className="mt-4 rounded-2xl bg-white/5 p-4 text-sm transition hover:bg-white/10">
        <span className="flex items-center gap-2 font-semibold text-white"><Store size={16} /> {t('a_openStoreCard')}</span>
        <span className="mt-1 block text-xs text-stone-400">{t('a_openStoreText')}</span>
      </Link>
    </div>
  );
}

export default function AdminLayout() {
  const { admin, checking, logout } = useAdminAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, lang, toggleLang } = useLang();
  const { pathname } = useLocation();
  const [menu, setMenu] = useState(false);
  const bell = usePopover();
  const profile = usePopover();
  const [seen, setSeen] = useState(readSeen);

  const stats = useFetch(() => (admin ? adminApi('/stats') : Promise.resolve(null)), [admin && admin.id]);
  useEffect(() => {
    const id = setInterval(stats.retry, 60000);
    return () => clearInterval(id);
  }, [stats.retry]);
  useEffect(() => setMenu(false), [pathname]);

  // The page behind the phone menu must not scroll.
  useEffect(() => {
    document.body.style.overflow = menu ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menu]);

  const s = stats.data;
  const counts = s ? { orders: s.newOrders, messages: s.newMessages, reviews: s.pendingReviews, stock: s.lowStock.length } : null;

  // When items were handled (the count went down), lower the saved level so new ones count again.
  useEffect(() => {
    if (!counts) return;
    const next = { ...seen };
    let changed = false;
    Object.keys(counts).forEach((k) => {
      if ((next[k] || 0) > counts[k]) {
        next[k] = counts[k];
        changed = true;
      }
    });
    if (changed) {
      setSeen(next);
      saveSeen(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats.data]);

  if (checking) return <Loading />;
  if (!admin) return <Navigate to="/admin/login" replace />;

  const unseen = counts ? Object.keys(counts).reduce((sum, k) => sum + Math.max(0, counts[k] - (seen[k] || 0)), 0) : 0;
  const alerts = s
    ? [
        s.newOrders > 0 && { to: '/admin/orders', text: t('a_nNewOrders', { n: s.newOrders }) },
        s.newMessages > 0 && { to: '/admin/messages', text: t('a_nNewMessages', { n: s.newMessages }) },
        s.pendingReviews > 0 && { to: '/admin/reviews', text: t('a_nPendingReviews', { n: s.pendingReviews }) },
        s.lowStock.length > 0 && { to: '/admin/products', text: t('a_nLowStock', { n: s.lowStock.length }) },
      ].filter(Boolean)
    : [];

  // Opening the bell marks everything as seen, so the red number disappears.
  const toggleBell = () => {
    if (!bell.open && counts) {
      const next = { ...counts };
      setSeen(next);
      saveSeen(next);
    }
    profile.setOpen(false);
    bell.setOpen((o) => !o);
  };

  const iconBtn = 'flex h-10 w-10 flex-none items-center justify-center rounded-full border border-sand-200 bg-white transition hover:bg-sand-100 dark:border-stone-800 dark:bg-stone-900 dark:hover:bg-stone-800';
  const popover = 'absolute right-0 top-12 z-40 w-72 max-w-[calc(100vw_-_1.5rem)] rounded-2xl border border-sand-200 bg-white p-3 shadow-xl dark:border-stone-800 dark:bg-stone-900';

  return (
    <div className="min-h-screen bg-sand-100 dark:bg-stone-950 md:flex md:gap-4 md:p-4">
      <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-64 flex-none overflow-y-auto rounded-3xl bg-stone-900 p-4 md:block">
        <Sidebar />
      </aside>

      {menu && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMenu(false)} />
          <aside className="absolute inset-y-0 left-0 w-[85vw] max-w-xs overflow-y-auto bg-stone-900 p-4 shadow-2xl">
            <button onClick={() => setMenu(false)} aria-label={t('a_close')} className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-stone-300 hover:bg-white/10"><X size={20} /></button>
            <Sidebar onNavigate={() => setMenu(false)} />
          </aside>
        </div>
      )}

      <div className="min-w-0 max-w-full flex-1 bg-sand-50 dark:bg-stone-900/40 md:rounded-3xl">
        <header className="sticky top-0 z-30 border-b border-sand-200 bg-sand-50/95 px-3 py-2.5 backdrop-blur dark:border-stone-800 dark:bg-stone-950/95 sm:px-4 md:rounded-t-3xl md:px-6 md:py-3">
          <div className="flex flex-wrap items-center gap-2 md:flex-nowrap md:gap-3">
            <button onClick={() => setMenu(true)} aria-label={t('a_menu')} className={`${iconBtn} md:hidden`}><Menu size={19} /></button>

            {/* On a phone the search box has its own full-width row under the buttons. */}
            <div className="order-last w-full md:order-none md:w-auto md:max-w-md md:min-w-0 md:flex-1">
              <AdminSearch />
            </div>

            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              <button onClick={toggleLang} aria-label={t('a_language')} className="flex h-10 items-center gap-1.5 rounded-full border border-sand-200 bg-white px-2.5 text-sm font-medium transition hover:bg-sand-100 dark:border-stone-800 dark:bg-stone-900 dark:hover:bg-stone-800 sm:px-3">
                <Languages size={16} /> {lang === 'en' ? 'አማርኛ' : 'EN'}
              </button>
              <button onClick={toggleTheme} aria-label={t('a_theme')} className={iconBtn}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>

              <div className="relative" ref={bell.ref}>
                <button onClick={toggleBell} aria-label={t('a_notifications')} aria-expanded={bell.open} className={`${iconBtn} relative`}>
                  <Bell size={18} />
                  {unseen > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold leading-none text-white">
                      {unseen > 99 ? '99+' : unseen}
                    </span>
                  )}
                </button>
                {bell.open && (
                  <div className={popover}>
                    <p className="px-2 pb-2 text-sm font-semibold">{t('a_notifications')}</p>
                    {alerts.length === 0 ? (
                      <p className="px-2 py-3 text-sm text-stone-500">{t('a_nothingNew')}</p>
                    ) : (
                      alerts.map((a) => (
                        <Link key={a.to} to={a.to} onClick={() => bell.setOpen(false)} className="block rounded-xl px-2 py-2.5 text-sm hover:bg-sand-100 dark:hover:bg-stone-800">{a.text}</Link>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="relative" ref={profile.ref}>
                <button
                  onClick={() => { bell.setOpen(false); profile.setOpen((o) => !o); }}
                  aria-expanded={profile.open}
                  aria-label={admin.name}
                  className="flex h-10 flex-none items-center gap-2 rounded-full border border-sand-200 bg-white pl-1 pr-1 transition hover:bg-sand-100 dark:border-stone-800 dark:bg-stone-900 dark:hover:bg-stone-800 sm:pr-3"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-olive text-sm font-semibold text-white">{String(admin.name || admin.username).charAt(0).toUpperCase()}</span>
                  <span className="hidden text-left leading-tight sm:block">
                    <span className="block max-w-[8rem] truncate text-sm font-semibold">{admin.name}</span>
                    <span className="block max-w-[8rem] truncate text-[11px] text-stone-500">@{admin.username}</span>
                  </span>
                </button>
                {profile.open && (
                  <div className={`${popover} w-60 p-2`}>
                    <p className="truncate px-3 py-2 text-xs text-stone-500">{admin.name} · @{admin.username}</p>
                    <Link to="/admin/account" onClick={() => profile.setOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm hover:bg-sand-100 dark:hover:bg-stone-800"><UserCircle size={16} /> {t('a_myAccount')}</Link>
                    <Link to="/" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm hover:bg-sand-100 dark:hover:bg-stone-800"><Store size={16} /> {t('a_viewStore')}</Link>
                    <button onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"><LogOut size={16} /> {t('a_logout')}</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="min-w-0 p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}