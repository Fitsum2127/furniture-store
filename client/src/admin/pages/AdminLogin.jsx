import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Languages, Lock } from 'lucide-react';
import { useAdminAuth } from '../AdminAuthContext.jsx';
import { useLang } from '../../context/LanguageContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { assetUrl } from '../../lib/api.js';
import PasswordInput from '../PasswordInput.jsx';
import { btnPrimary, card, inputClass } from '../ui.jsx';

export default function AdminLogin() {
  const { admin, checking, login } = useAdminAuth();
  const { t, lang, toggleLang } = useLang();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const logo = assetUrl(settings.logo_url);

  if (!checking && admin) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(username.trim(), password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand-100 px-4 dark:bg-stone-950">
      <button onClick={toggleLang} aria-label={t('a_language')} className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-sand-300 bg-white px-3 py-2 text-sm font-medium dark:border-stone-700 dark:bg-stone-900">
        <Languages size={16} /> {lang === 'en' ? 'አማርኛ' : 'EN'}
      </button>
      <form onSubmit={submit} className={`${card} w-full max-w-sm space-y-4 p-8 shadow-xl shadow-stone-900/5`}>
        <div className="text-center">
          {logo ? (
            <img src={logo} alt="" className="mx-auto h-14 w-auto max-w-[10rem] object-contain" />
          ) : (
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-olive/15 text-olive"><Lock size={22} /></span>
          )}
          <h1 className="mt-3 text-2xl font-semibold">{t('a_adminLogin')}</h1>
        </div>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t('a_username')} aria-label={t('a_username')} autoComplete="username" autoCapitalize="none" required className={inputClass} />
        <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('a_passwordField')} aria-label={t('a_passwordField')} autoComplete="current-password" required />
        {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
        <button type="submit" disabled={busy} className={`${btnPrimary} w-full`}>{busy ? t('a_loggingIn') : t('a_login')}</button>
      </form>
    </div>
  );
}