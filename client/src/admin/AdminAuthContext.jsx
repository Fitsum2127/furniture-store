import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { adminApi, getToken, setToken } from './adminApi.js';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) return undefined;
    adminApi('/me')
      .then((d) => setAdmin(d.admin))
      .catch(() => setToken(null))
      .finally(() => setChecking(false));
    return undefined;
  }, []);

  useEffect(() => {
    const onLogout = () => setAdmin(null);
    window.addEventListener('admin-logout', onLogout);
    return () => window.removeEventListener('admin-logout', onLogout);
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await adminApi('/login', { method: 'POST', body: JSON.stringify({ username, password }) });
    setToken(data.token);
    setAdmin(data.admin);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setAdmin(null);
  }, []);

  // Used after the profile is changed: stores the fresh admin and the fresh login token.
  const updateAdmin = useCallback((next, token) => {
    if (token) setToken(token);
    setAdmin(next);
  }, []);

  const value = useMemo(() => ({ admin, checking, login, logout, updateAdmin }), [admin, checking, login, logout, updateAdmin]);
  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export const useAdminAuth = () => useContext(AdminAuthContext);