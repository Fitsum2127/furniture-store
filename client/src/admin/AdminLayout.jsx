import { Link, NavLink, Navigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tags, ShoppingCart, Users, MessageSquare, Mail, Star, Info, FileText, BarChart3, Settings, KeyRound, LogOut, Store, Sun, Moon,
} from 'lucide-react';
import { useAdminAuth } from './AdminAuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { Loading } from './ui.jsx';

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/reports', label: 'Sales reports', icon: BarChart3 },
  { to: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { to: '/admin/subscribers', label: 'Subscribers', icon: Mail },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/about', label: 'About page', icon: Info },
  { to: '/admin/content', label: 'Policies & FAQ', icon: FileText },
  { to: '/admin/settings', label: 'Business settings', icon: Settings },
  { to: '/admin/password', label: 'My password', icon: KeyRound },
];

export default function AdminLayout() {
  const { admin, checking, logout } = useAdminAuth();
  const { theme, toggleTheme } = useTheme();

  if (checking) return <Loading />;
  if (!admin) return <Navigate to="/admin/login" replace />;

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition ${isActive ? 'bg-olive text-white' : 'text-stone-600 hover:bg-sand-100 dark:text-stone-300 dark:hover:bg-stone-800'}`;

  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden w-64 flex-none flex-col overflow-y-auto border-r border-sand-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900 md:flex md:h-screen md:sticky md:top-0">
        <p className="px-2 pb-6 pt-2 font-display text-xl font-semibold">Admin <span className="text-olive">panel</span></p>
        <nav className="flex-1 space-y-1">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}><Icon size={18} /> {label}</NavLink>
          ))}
        </nav>
        <div className="space-y-1 border-t border-sand-200 pt-4 dark:border-stone-800">
          <p className="truncate px-4 pb-2 text-xs text-stone-500">{admin.email}</p>
          <Link to="/" className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm hover:bg-sand-100 dark:hover:bg-stone-800"><Store size={18} /> View store</Link>
          <button onClick={toggleTheme} className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm hover:bg-sand-100 dark:hover:bg-stone-800">{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />} Theme</button>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"><LogOut size={18} /> Log out</button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="sticky top-0 z-30 border-b border-sand-200 bg-white/95 backdrop-blur dark:border-stone-800 dark:bg-stone-900/95 md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <p className="font-display text-lg font-semibold">Admin <span className="text-olive">panel</span></p>
            <div className="flex items-center gap-1">
              <Link to="/" aria-label="View store" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-sand-100 dark:hover:bg-stone-800"><Store size={18} /></Link>
              <button onClick={toggleTheme} aria-label="Theme" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-sand-100 dark:hover:bg-stone-800">{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
              <button onClick={logout} aria-label="Log out" className="flex h-9 w-9 items-center justify-center rounded-full text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"><LogOut size={18} /></button>
            </div>
          </div>
          <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3">
            {LINKS.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={linkClass}><Icon size={16} /> {label}</NavLink>
            ))}
          </nav>
        </div>
        <main className="p-4 sm:p-8"><Outlet /></main>
      </div>
    </div>
  );
}