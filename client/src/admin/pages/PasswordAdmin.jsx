import { useState } from 'react';
import { useAdminAuth } from '../AdminAuthContext.jsx';
import { useLang } from '../../context/LanguageContext.jsx';
import { adminApi } from '../adminApi.js';
import { useFeedback } from '../feedback.jsx';
import PasswordInput from '../PasswordInput.jsx';
import { PageHeader, btnPrimary, card, inputClass } from '../ui.jsx';

export default function PasswordAdmin() {
  const { t } = useLang();
  const { admin, updateAdmin } = useAdminAuth();
  const fb = useFeedback();
  const [p, setP] = useState({ name: admin ? admin.name : '', username: admin ? admin.username : '' });
  const [f, setF] = useState({ currentPassword: '', newPassword: '', confirm: '' });

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const r = await adminApi('/profile', { method: 'PUT', body: JSON.stringify(p) });
      updateAdmin(r.admin, r.token);
      setP({ name: r.admin.name, username: r.admin.username });
      fb.success(t('a_profileSaved'));
    } catch (err) {
      fb.error(err.message);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (f.newPassword !== f.confirm) return fb.error(t('a_errMismatch'));
    try {
      await adminApi('/password', { method: 'POST', body: JSON.stringify({ currentPassword: f.currentPassword, newPassword: f.newPassword }) });
      setF({ currentPassword: '', newPassword: '', confirm: '' });
      return fb.success(t('a_passwordChanged'));
    } catch (err) {
      return fb.error(err.message);
    }
  };

  return (
    <>
      <PageHeader title={t('a_myAccount')} subtitle={t('a_accountSub')} />
      {fb.banner}
      <div className="grid max-w-4xl gap-6 lg:grid-cols-2">
        <form onSubmit={saveProfile} className={`${card} space-y-4 p-5`}>
          <h2 className="font-semibold">{t('a_profileTitle')}</h2>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">{t('a_displayName')}</span>
            <input value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} required minLength={2} maxLength={100} className={inputClass} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">{t('a_username')}</span>
            <input value={p.username} onChange={(e) => setP({ ...p, username: e.target.value.toLowerCase() })} required minLength={3} maxLength={40} autoCapitalize="none" className={inputClass} />
            <span className="mt-1 block text-xs text-stone-500">{t('a_usernameHint')}</span>
          </label>
          <button type="submit" className={btnPrimary}>{t('a_saveProfile')}</button>
        </form>

        <form onSubmit={savePassword} className={`${card} space-y-4 p-5`}>
          <h2 className="font-semibold">{t('a_changePassword')}</h2>
          <p className="text-xs text-stone-500">{t('a_passwordSub')}</p>
          <PasswordInput value={f.currentPassword} onChange={(e) => setF({ ...f, currentPassword: e.target.value })} placeholder={t('a_currentPassword')} aria-label={t('a_currentPassword')} autoComplete="current-password" required />
          <PasswordInput value={f.newPassword} onChange={(e) => setF({ ...f, newPassword: e.target.value })} placeholder={t('a_newPassword')} aria-label={t('a_newPassword')} autoComplete="new-password" required minLength={10} />
          <PasswordInput value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} placeholder={t('a_repeatPassword')} aria-label={t('a_repeatPassword')} autoComplete="new-password" required />
          <button type="submit" className={btnPrimary}>{t('a_changePassword')}</button>
        </form>
      </div>
    </>
  );
}