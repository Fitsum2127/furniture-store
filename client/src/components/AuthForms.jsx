import { useState } from 'react';
import { useLang } from '../context/LanguageContext.jsx';
import { useCustomerAuth } from '../context/CustomerAuthContext.jsx';
import PasswordField from './PasswordField.jsx';

const field = 'w-full rounded-xl border border-sand-300 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-olive dark:border-stone-700';
const button = 'w-full rounded-full bg-olive py-3.5 text-sm font-semibold text-white transition hover:bg-olive-dark disabled:opacity-60';

// With showLabels, a small title is shown above each box.
function Field({ label, showLabels, children }) {
  if (!showLabels) return children;
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

export function LoginForm({ onDone, showLabels = false }) {
  const { t } = useLang();
  const { login } = useCustomerAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [help, setHelp] = useState(false);

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
      <Field label={t('identifier')} showLabels={showLabels}>
        <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder={t('identifier')} aria-label={t('identifier')} autoComplete="username" autoCapitalize="none" className={field} />
      </Field>
      <Field label={t('password')} showLabels={showLabels}>
        <PasswordField value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('password')} aria-label={t('password')} autoComplete="current-password" className={field} />
      </Field>
      <div className="flex justify-end">
        <button type="button" onClick={() => setHelp((h) => !h)} aria-expanded={help} className="text-xs font-medium text-olive hover:underline">{t('authForgot')}</button>
      </div>
      {help && <p className="rounded-xl bg-sand-100 p-3 text-xs text-stone-600 dark:bg-stone-800 dark:text-stone-300">{t('forgotPassword')}</p>}
      {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
      <button type="submit" disabled={busy} className={button}>{t('login')}</button>
    </form>
  );
}

export function RegisterForm({ onDone, showLabels = false }) {
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
      <Field label={t('fullName')} showLabels={showLabels}>
        <input value={f.name} onChange={set('name')} placeholder={t('fullName')} aria-label={t('fullName')} autoComplete="name" maxLength={100} className={field} />
      </Field>
      <Field label={t('phone')} showLabels={showLabels}>
        <input value={f.phone} onChange={set('phone')} placeholder="09XXXXXXXX" aria-label={t('phone')} type="tel" autoComplete="tel" className={field} />
      </Field>
      <Field label={t('emailOptional')} showLabels={showLabels}>
        <input value={f.email} onChange={set('email')} placeholder={t('emailOptional')} aria-label={t('emailOptional')} type="email" autoComplete="email" className={field} />
      </Field>
      <Field label={t('password')} showLabels={showLabels}>
        <PasswordField value={f.password} onChange={set('password')} placeholder={t('password')} aria-label={t('password')} autoComplete="new-password" className={field} />
      </Field>
      {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
      <button type="submit" disabled={busy} className={button}>{t('register')}</button>
    </form>
  );
}