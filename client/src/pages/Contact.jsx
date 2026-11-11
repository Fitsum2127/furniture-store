import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Send, Mail, MessageCircle } from 'lucide-react';
import PageTransition from '../components/PageTransition.jsx';
import LocationSection from '../components/LocationSection.jsx';
import { useLang } from '../context/LanguageContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { api } from '../lib/api.js';

export default function Contact() {
  const { t } = useLang();
  const { settings: s } = useSettings();
  const [form, setForm] = useState({ name: '', phone: '', email: '', body: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const wa = String(s.whatsapp || '').replace(/\D/g, '');
  const cards = [
    s.phone && { icon: Phone, title: t('callUs'), text: s.phone, href: `tel:${s.phone.replace(/\s/g, '')}` },
    wa && { icon: MessageCircle, title: 'WhatsApp', text: `+${wa}`, href: `https://wa.me/${wa}` },
    s.telegram && { icon: Send, title: t('telegram'), text: s.telegram.replace(/^https?:\/\//, ''), href: s.telegram },
    s.email && { icon: Mail, title: t('emailUs'), text: s.email, href: `mailto:${s.email}` },
  ].filter(Boolean);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.name.trim().length < 2) return setError(t('errName'));
    if (!form.phone.trim() && !form.email.trim()) return setError(t('errContact'));
    if (form.body.trim().length < 5) return setError(t('errMsg'));
    setStatus('sending');
    try {
      await api('/messages', { method: 'POST', body: JSON.stringify(form) });
      setStatus('done');
      setForm({ name: '', phone: '', email: '', body: '' });
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  };

  const field = 'w-full rounded-xl border border-sand-300 bg-transparent px-4 py-3 text-sm outline-none focus:border-olive dark:border-stone-700';

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl px-4 pt-14 sm:px-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold sm:text-4xl">{t('contactTitle')}</h1>
          <div className="mx-auto mt-3 h-0.5 w-10 bg-sand-400" />
          <p className="mt-4 text-stone-600 dark:text-stone-400">{t('contactSub')}</p>
        </div>

        {cards.length > 0 && (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map(({ icon: Icon, title, text, href }, i) => (
              <motion.a key={title} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2, duration: 1.1, ease: [0.22, 1, 0.36, 1] }} className="rounded-2xl border border-sand-200 bg-white p-6 text-center transition hover:border-olive dark:border-stone-800 dark:bg-stone-900">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sand-100 text-olive dark:bg-stone-800"><Icon size={22} /></span>
                <p className="mt-3 font-semibold">{title}</p>
                <p className="mt-1 break-all text-sm text-stone-600 dark:text-stone-400">{text}</p>
              </motion.a>
            ))}
          </div>
        )}

        <form onSubmit={submit} noValidate className="mt-8 space-y-4 rounded-3xl border border-sand-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
          <div className="grid gap-4 sm:grid-cols-2">
            <input value={form.name} onChange={set('name')} placeholder={t('fullName')} aria-label={t('fullName')} maxLength={100} className={field} />
            <input value={form.phone} onChange={set('phone')} placeholder={t('phone')} aria-label={t('phone')} type="tel" className={field} />
          </div>
          <input value={form.email} onChange={set('email')} placeholder={t('optionalEmail')} aria-label={t('optionalEmail')} type="email" className={field} />
          <textarea value={form.body} onChange={set('body')} placeholder={t('msgLabel')} aria-label={t('msgLabel')} rows={5} maxLength={2000} className={`${field} resize-none`} />
          {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
          {status === 'done' && <p className="text-sm text-olive" role="status">{t('msgSent')}</p>}
          <button type="submit" disabled={status === 'sending'} className="w-full rounded-full bg-olive py-3.5 text-sm font-semibold text-white transition hover:bg-olive-dark disabled:opacity-60">
            {status === 'sending' ? t('sending') : t('sendMessage')}
          </button>
        </form>
      </div>

      <LocationSection showPhoneEmail={false} showContactButton={false} />
    </PageTransition>
  );
}