import { useState } from 'react';
import { useLang } from '../../context/LanguageContext.jsx';
import { api } from '../../lib/api.js';

export default function Newsletter() {
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [message, setMessage] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus('error');
      setMessage(t('errEmail'));
      return;
    }
    setStatus('loading');
    try {
      await api('/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      setStatus('done');
      setMessage(t('subscribed'));
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage(err.message);
    }
  };

  return (
    <section className="bg-olive py-14 text-white">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <h2 className="text-3xl font-semibold">{t('joinTitle')}</h2>
        <p className="mt-2 text-sm text-white/80">{t('joinText')}</p>
        <form onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('emailPlaceholder')}
            aria-label={t('emailPlaceholder')}
            className="flex-1 rounded-full bg-white px-5 py-3 text-sm text-stone-800 outline-none placeholder:text-stone-400"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="rounded-full bg-stone-900 px-7 py-3 text-sm font-semibold transition hover:bg-stone-800 disabled:opacity-60"
          >
            {t('subscribe')}
          </button>
        </form>
        {message && (
          <p className={`mt-3 text-sm ${status === 'error' ? 'text-red-100' : 'text-white'}`} role="status">
            {message}
          </p>
        )}
      </div>
    </section>
  );
}