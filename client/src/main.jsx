import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';
import { CustomerAuthProvider } from './context/CustomerAuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { AdminAuthProvider } from './admin/AdminAuthContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <SettingsProvider>
            <CustomerAuthProvider>
              <CartProvider>
                <WishlistProvider>
                  <AdminAuthProvider>
                    <App />
                  </AdminAuthProvider>
                </WishlistProvider>
              </CartProvider>
            </CustomerAuthProvider>
          </SettingsProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);