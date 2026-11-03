import { useState } from 'react';
import { useLang } from '../../context/LanguageContext.jsx';
import { adminApi } from '../adminApi.js';
import PasswordInput from '../PasswordInput.jsx';
import { PageHeader, btnPrimary, card } from '../ui.jsx';

export default function PasswordAdmin() {
  const { t } = useLang();
  const [f, setF] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [msg, setMsg] = useState('');
  const [ok, setOk] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    setOk(false);
    if (f.newPassword !== f.confirm) return setMsg(t('a_errMismatch'));
    try {
      await adminApi('/password', { method: 'POST', body: JSON.stringify({ currentPassword: f.currentPassword, newPassword: f.newPassword }) });
      setF({ currentPassword: '', newPassword: '', confirm: '' });
      setOk(true);
      setMsg(t('a_passwordChanged'));
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <>
      <PageHeader title={t('a_password')} subtitle={t('a_passwordSub')} />
      <form onSubmit={submit} className={`${card} max-w-md space-y-4 p-5`}>
        <PasswordInput value={f.currentPassword} onChange={(e) => setF({ ...f, currentPassword: e.target.value })} placeholder={t('a_currentPassword')} aria-label={t('a_currentPassword')} autoComplete="current-password" required />
        <PasswordInput value={f.newPassword} onChange={(e) => setF({ ...f, newPassword: e.target.value })} placeholder={t('a_newPassword')} aria-label={t('a_newPassword')} autoComplete="new-password" required minLength={10} />
        <PasswordInput value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} placeholder={t('a_repeatPassword')} aria-label={t('a_repeatPassword')} autoComplete="new-password" required />
        {msg && <p className={`text-sm ${ok ? 'text-olive' : 'text-red-500'}`} role="status">{msg}</p>}
        <button type="submit" className={btnPrimary}>{t('a_changePassword')}</button>
      </form>
    </>
  );
}