import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar.jsx';
import BottomNav from './components/BottomNav.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import Footer from './components/Footer.jsx';
import PageTransition from './components/PageTransition.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderSuccess from './pages/OrderSuccess.jsx';
import TrackOrder from './pages/TrackOrder.jsx';
import Account from './pages/Account.jsx';
import AccountAuth from './pages/AccountAuth.jsx';
import Faq from './pages/Faq.jsx';
import PolicyPage from './pages/PolicyPage.jsx';
import Contact from './pages/Contact.jsx';
import About from './pages/About.jsx';
import AdminLayout from './admin/AdminLayout.jsx';
import AdminLogin from './admin/pages/AdminLogin.jsx';
import Dashboard from './admin/pages/Dashboard.jsx';
import ProductsAdmin from './admin/pages/ProductsAdmin.jsx';
import ProductForm from './admin/pages/ProductForm.jsx';
import CategoriesAdmin from './admin/pages/CategoriesAdmin.jsx';
import OrdersAdmin from './admin/pages/OrdersAdmin.jsx';
import CustomersAdmin from './admin/pages/CustomersAdmin.jsx';
import SubscribersAdmin from './admin/pages/SubscribersAdmin.jsx';
import MessagesAdmin from './admin/pages/MessagesAdmin.jsx';
import ReviewsAdmin from './admin/pages/ReviewsAdmin.jsx';
import AboutAdmin from './admin/pages/AboutAdmin.jsx';
import ContentAdmin from './admin/pages/ContentAdmin.jsx';
import ReportsAdmin from './admin/pages/ReportsAdmin.jsx';
import SettingsAdmin from './admin/pages/SettingsAdmin.jsx';
import PasswordAdmin from './admin/pages/PasswordAdmin.jsx';
import { useLang } from './context/LanguageContext.jsx';
import { useSettings } from './context/SettingsContext.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Browser tab title and description for the main pages (product and policy pages set their own).
const META = {
  '/': ['home', 'heroText'], '/shop': ['shopTitle', 'shopSub'], '/about': ['aboutTitle', 'aboutSub'], '/contact': ['contactTitle', 'contactSub'],
  '/checkout': ['checkoutTitle'], '/faq': ['faqTitle'], '/track': ['trackOrder', 'trackSub'], '/account': ['myAccount'], '/login': ['login'],
};
function RouteMeta() {
  const { pathname } = useLocation();
  const { t } = useLang();
  const { settings } = useSettings();
  useEffect(() => {
    const m = META[pathname];
    if (!m) return;
    document.title = pathname === '/' ? settings.business_name : `${t(m[0])} | ${settings.business_name}`;
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', 'description');
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', m[1] ? t(m[1]) : '');
  }, [pathname, t, settings.business_name]);
  return null;
}

function NotFound() {
  const { t } = useLang();
  return (
    <PageTransition>
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-4xl font-semibold">404</h1>
        <p className="mt-2 text-stone-600 dark:text-stone-400">{t('pageNotFound')}</p>
      </div>
    </PageTransition>
  );
}

export default function App() {
  const location = useLocation();

  if (location.pathname.startsWith('/admin')) {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductsAdmin />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id" element={<ProductForm />} />
          <Route path="categories" element={<CategoriesAdmin />} />
          <Route path="orders" element={<OrdersAdmin />} />
          <Route path="customers" element={<CustomersAdmin />} />
          <Route path="messages" element={<MessagesAdmin />} />
          <Route path="subscribers" element={<SubscribersAdmin />} />
          <Route path="reviews" element={<ReviewsAdmin />} />
          <Route path="about" element={<AboutAdmin />} />
          <Route path="content" element={<ContentAdmin />} />
          <Route path="reports" element={<ReportsAdmin />} />
          <Route path="settings" element={<SettingsAdmin />} />
          <Route path="password" element={<PasswordAdmin />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    );
  }

  return (
    <>
      <ScrollToTop />
      <RouteMeta />
      <Navbar />
      <main className="min-h-screen pb-20 md:pb-0">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order/:number" element={<OrderSuccess />} />
            <Route path="/track" element={<TrackOrder />} />
            <Route path="/login" element={<AccountAuth />} />
            <Route path="/register" element={<Navigate to="/login?tab=register" replace />} />
            <Route path="/account" element={<Account />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/policies/:slug" element={<PolicyPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
      <BottomNav />
      <CartDrawer />
    </>
  );
}