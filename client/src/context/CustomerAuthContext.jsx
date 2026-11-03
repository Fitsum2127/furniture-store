import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, CUSTOMER_TOKEN_KEY } from '../lib/api.js';

const CustomerAuthContext = createContext(null);
const hasToken = () => {
  try {
    return Boolean(localStorage.getItem(CUSTOMER_TOKEN_KEY));
  } catch (e) {
    return false;
  }
};

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(hasToken());

  const setToken = (token) => {
    try {
      if (token) localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
      else localStorage.removeItem(CUSTOMER_TOKEN_KEY);
    } catch (e) {
      /* ignore */
    }
  };

  useEffect(() => {
    if (!hasToken()) return undefined;
    api('/customers/me')
      .then((d) => setCustomer(d.customer))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
    return undefined;
  }, []);

  useEffect(() => {
    const onLogout = () => {
      setToken(null);
      setCustomer(null);
    };
    window.addEventListener('customer-logout', onLogout);
    return () => window.removeEventListener('customer-logout', onLogout);
  }, []);

  const login = useCallback(async (identifier, password) => {
    const d = await api('/customers/login', { method: 'POST', body: JSON.stringify({ identifier, password }) });
    setToken(d.token);
    setCustomer(d.customer);
  }, []);

  const register = useCallback(async (form) => {
    const d = await api('/customers/register', { method: 'POST', body: JSON.stringify(form) });
    setToken(d.token);
    setCustomer(d.customer);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setCustomer(null);
  }, []);

  const value = useMemo(() => ({ customer, loading, login, register, logout, setCustomer }), [customer, loading, login, register, logout]);
  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}

export const useCustomerAuth = () => useContext(CustomerAuthContext);