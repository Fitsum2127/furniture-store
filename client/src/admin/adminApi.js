const KEY = 'adminToken';
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const getToken = () => localStorage.getItem(KEY);
export const setToken = (token) => (token ? localStorage.setItem(KEY, token) : localStorage.removeItem(KEY));

export async function adminApi(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (typeof options.body === 'string') headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE}/api/admin${path}`, { ...options, headers });

  if (res.status === 401 && !path.startsWith('/login')) {
    setToken(null);
    window.dispatchEvent(new Event('admin-logout'));
  }

  const type = res.headers.get('content-type') || '';
  const data = type.includes('application/json') ? await res.json().catch(() => null) : await res.text();
  if (!res.ok) throw new Error((data && data.error) || `Request failed (${res.status})`);
  return data;
}