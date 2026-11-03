import { useState } from 'react';
import { adminApi } from '../adminApi.js';
import { PageHeader, btnPrimary, inputClass } from '../ui.jsx';

export default function PasswordAdmin() {
  const [f, setF] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [msg, setMsg] = useState('');
  const [ok, setOk] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    setOk(false);
    if (f.newPassword !== f.confirm) return setMsg('The new passwords do not match.');
    try {
      await adminApi('/password', { method: 'POST', body: JSON.stringify({ currentPassword: f.currentPassword, newPassword: f.newPassword }) });
      setF({ currentPassword: '', newPassword: '', confirm: '' });
      setOk(true);
      setMsg('Password changed.');
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <>
      <PageHeader title="My password" subtitle="Use at least 10 characters" />
      <form onSubmit={submit} className="max-w-md space-y-4 rounded-2xl border border-sand-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
        <input type="password" value={f.currentPassword} onChange={(e) => setF({ ...f, currentPassword: e.target.value })} placeholder="Current password" aria-label="Current password" autoComplete="current-password" required className={inputClass} />
        <input type="password" value={f.newPassword} onChange={(e) => setF({ ...f, newPassword: e.target.value })} placeholder="New password" aria-label="New password" autoComplete="new-password" required minLength={10} className={inputClass} />
        <input type="password" value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} placeholder="Repeat the new password" aria-label="Repeat the new password" autoComplete="new-password" required className={inputClass} />
        {msg && <p className={`text-sm ${ok ? 'text-olive' : 'text-red-500'}`} role="status">{msg}</p>}
        <button type="submit" className={btnPrimary}>Change password</button>
      </form>
    </>
  );
}