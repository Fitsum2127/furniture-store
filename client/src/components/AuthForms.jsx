import { useState } from 'react';
import { useLang } from '../context/LanguageContext.jsx';
import { useCustomerAuth } from '../context/CustomerAuthContext.jsx';

const field = 'w-full rounded-xl border border-sand-300 bg-transparent px-4 py-3 text-sm outline-none focus:border-olive dark:border-stone-700';
const button = 'w-full rounded-full bg-olive py-3.5 text-sm font-semibold text-white transition hover:bg-olive-dark disabled:opacity-60';

export function LoginForm({ onDone }) {
  const { t } = useLang();
  const { login } = useCustomerAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim()) return setError(t('errIdentifier'));
    setBusy(true);
    try {
      await login(identifier.trim(), password);
      onDone && onDone();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder={t('identifier')} aria-label={t('identifier')} autoComplete="username" className={field} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('password')} aria-label={t('password')} autoComplete="current-password" className={field} />
      {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
      <button type="submit" disabled={busy} className={button}>{t('login')}</button>
      <p className="text-xs text-stone-500 dark:text-stone-400">{t('forgotPassword')}</p>
    </form>
  );
}

export function RegisterForm({ onDone }) {
  const { t } = useLang();
  const { register } = useCustomerAuth();
  const [f, setF] = useState({ name: '', phone: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (f.name.trim().length < 2) return setError(t('errName'));
    if (!/^(?:\+251|251|0)?[79]\d{8}$/.test(f.phone.replace(/[\s-]/g, ''))) return setError(t('errPhone'));
    if (f.password.length < 8) return setError(t('errPassword'));
    setBusy(true);
    try {
      await register({ ...f, name: f.name.trim(), phone: f.phone.replace(/[\s-]/g, ''), email: f.email.trim() });
      onDone && onDone();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <input value={f.name} onChange={set('name')} placeholder={t('fullName')} aria-label={t('fullName')} autoComplete="name" maxLength={100} className={field} />
      <input value={f.phone} onChange={set('phone')} placeholder="09XXXXXXXX" aria-label={t('phone')} type="tel" autoComplete="tel" className={field} />
      <input value={f.email} onChange={set('email')} placeholder={t('emailOptional')} aria-label={t('emailOptional')} type="email" autoComplete="email" className={field} />
      <input type="password" value={f.password} onChange={set('password')} placeholder={t('password')} aria-label={t('password')} autoComplete="new-password" className={field} />
      {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
      <button type="submit" disabled={busy} className={button}>{t('register')}</button>
    </form>
  );
}