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
import Contact from './pages/Contact.jsx';
import About from './pages/About.jsx';
import AdminLayout from './admin/AdminLayout.jsx';
import AdminLogin from './admin/pages/AdminLogin.jsx';
import Dashboard from './admin/pages/Dashboard.jsx';
import ProductsAdmin from './admin/pages/ProductsAdmin.jsx';
import ProductForm from './admin/pages/ProductForm.jsx';
import OrdersAdmin from './admin/pages/OrdersAdmin.jsx';
import SubscribersAdmin from './admin/pages/SubscribersAdmin.jsx';
import MessagesAdmin from './admin/pages/MessagesAdmin.jsx';
import ReviewsAdmin from './admin/pages/ReviewsAdmin.jsx';
import AboutAdmin from './admin/pages/AboutAdmin.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-4xl font-semibold">404</h1>
        <p className="mt-2 text-stone-600 dark:text-stone-400">Page not found</p>
      </div>
    </PageTransition>
  );
}

export default function App() {
  const location = useLocation();

  // Admin area: its own layout, without the store header, footer or cart.
  if (location.pathname.startsWith('/admin')) {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductsAdmin />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id" element={<ProductForm />} />
          <Route path="orders" element={<OrdersAdmin />} />
          <Route path="messages" element={<MessagesAdmin />} />
          <Route path="subscribers" element={<SubscribersAdmin />} />
          <Route path="reviews" element={<ReviewsAdmin />} />
          <Route path="about" element={<AboutAdmin />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main className="min-h-screen pb-20 md:pb-0">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order/:id" element={<OrderSuccess />} />
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