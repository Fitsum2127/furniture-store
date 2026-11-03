import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3, Bell, FileText, Info, KeyRound, Languages, LayoutDashboard, LogOut, Mail, Menu, MessageSquare, Moon, Package, Search, Settings, ShoppingCart, Star, Store, Sun, Tags, Users, X,
} from 'lucide-react';
import { useAdminAuth } from './AdminAuthContext.jsx';
import { adminApi } from './adminApi.js';
import useFetch from '../hooks/useFetch.js';
import { useLang } from '../context/LanguageContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
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
    { to: '/admin/about', key: 'a_aboutPage', icon: Info },
    { to: '/admin/content', key: 'a_content', icon: FileText },
  ]],
  ['a_grpSystem', [
    { to: '/admin/settings', key: 'a_settings', icon: Settings },
    { to: '/admin/password', key: 'a_password', icon: KeyRound },
  ]],
];

function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);
  return { open, setOpen, ref };
}

function Sidebar({ onNavigate }) {
  const { t } = useLang();
  const { settings } = useSettings();
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${isActive ? 'bg-olive text-white' : 'text-stone-300 hover:bg-white/10'}`;
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-2 pb-6 pt-1">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-olive font-display text-lg font-bold text-white">{String(settings.business_name).charAt(0)}</span>
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
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState('');
  const bell = usePopover();
  const profile = usePopover();

  const stats = useFetch(() => (admin ? adminApi('/stats') : Promise.resolve(null)), [admin && admin.id]);
  useEffect(() => {
    const id = setInterval(stats.retry, 60000);
    return () => clearInterval(id);
  }, [stats.retry]);
  useEffect(() => setMenu(false), [pathname]);

  if (checking) return <Loading />;
  if (!admin) return <Navigate to="/admin/login" replace />;

  const s = stats.data;
  const alerts = s
    ? [
        s.newOrders > 0 && { to: '/admin/orders', text: t('a_nNewOrders', { n: s.newOrders }) },
        s.newMessages > 0 && { to: '/admin/messages', text: t('a_nNewMessages', { n: s.newMessages }) },
        s.pendingReviews > 0 && { to: '/admin/reviews', text: t('a_nPendingReviews', { n: s.pendingReviews }) },
        s.lowStock.length > 0 && { to: '/admin/products', text: t('a_nLowStock', { n: s.lowStock.length }) },
      ].filter(Boolean)
    : [];

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(`/admin/orders${search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ''}`);
  };

  const iconBtn = 'flex h-10 w-10 items-center justify-center rounded-full border border-sand-200 bg-white transition hover:bg-sand-100 dark:border-stone-800 dark:bg-stone-900 dark:hover:bg-stone-800';

  return (
    <div className="min-h-screen bg-sand-100 dark:bg-stone-950 md:flex md:gap-4 md:p-4">
      <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-64 flex-none overflow-y-auto rounded-3xl bg-stone-900 p-4 md:block">
        <Sidebar />
      </aside>

      {menu && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenu(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-stone-900 p-4">
            <button onClick={() => setMenu(false)} aria-label={t('a_close')} className="absolute right-3 top-3 text-stone-400"><X size={20} /></button>
            <Sidebar onNavigate={() => setMenu(false)} />
          </aside>
        </div>
      )}

      <div className="min-w-0 flex-1 bg-sand-50 dark:bg-stone-900/40 md:rounded-3xl">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-sand-200 bg-sand-50/90 px-4 py-3 backdrop-blur dark:border-stone-800 dark:bg-stone-950/90 md:rounded-t-3xl md:px-6">
          <button onClick={() => setMenu(true)} aria-label={t('a_menu')} className={`${iconBtn} md:hidden`}><Menu size={19} /></button>
          <form onSubmit={submitSearch} className="relative min-w-0 flex-1 md:max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('a_searchOrders')} aria-label={t('a_searchOrders')} className="w-full rounded-full border border-sand-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-olive dark:border-stone-800 dark:bg-stone-900" />
          </form>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={toggleLang} aria-label={t('a_language')} className="flex h-10 items-center gap-1.5 rounded-full border border-sand-200 bg-white px-3 text-sm font-medium transition hover:bg-sand-100 dark:border-stone-800 dark:bg-stone-900 dark:hover:bg-stone-800">
              <Languages size={16} /> {lang === 'en' ? 'አማርኛ' : 'EN'}
            </button>
            <button onClick={toggleTheme} aria-label={t('a_theme')} className={iconBtn}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>

            <div className="relative" ref={bell.ref}>
              <button onClick={() => bell.setOpen((o) => !o)} aria-label={t('a_notifications')} aria-expanded={bell.open} className={`${iconBtn} relative`}>
                <Bell size={18} />
                {alerts.length > 0 && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500" />}
              </button>
              {bell.open && (
                <div className="absolute right-0 top-12 z-40 w-72 rounded-2xl border border-sand-200 bg-white p-3 shadow-xl dark:border-stone-800 dark:bg-stone-900">
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
              <button onClick={() => profile.setOpen((o) => !o)} aria-expanded={profile.open} aria-label={admin.email} className="flex h-10 items-center gap-2 rounded-full border border-sand-200 bg-white pl-1 pr-3 transition hover:bg-sand-100 dark:border-stone-800 dark:bg-stone-900 dark:hover:bg-stone-800">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-olive text-sm font-semibold text-white">{String(admin.name || admin.email).charAt(0).toUpperCase()}</span>
                <span className="hidden text-left leading-tight sm:block">
                  <span className="block max-w-[8rem] truncate text-sm font-semibold">{admin.name}</span>
                  <span className="block text-[11px] text-stone-500">{t('a_admin')}</span>
                </span>
              </button>
              {profile.open && (
                <div className="absolute right-0 top-12 z-40 w-60 rounded-2xl border border-sand-200 bg-white p-2 shadow-xl dark:border-stone-800 dark:bg-stone-900">
                  <p className="truncate px-3 py-2 text-xs text-stone-500">{admin.email}</p>
                  <Link to="/admin/password" onClick={() => profile.setOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm hover:bg-sand-100 dark:hover:bg-stone-800"><KeyRound size={16} /> {t('a_password')}</Link>
                  <Link to="/" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm hover:bg-sand-100 dark:hover:bg-stone-800"><Store size={16} /> {t('a_viewStore')}</Link>
                  <button onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"><LogOut size={16} /> {t('a_logout')}</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}