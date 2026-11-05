import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import PageTransition from '../components/PageTransition.jsx';
import { LoginForm, RegisterForm } from '../components/AuthForms.jsx';
import { useCustomerAuth } from '../context/CustomerAuthContext.jsx';
import { useLang } from '../context/LanguageContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import useFetch from '../hooks/useFetch.js';
import { api, assetUrl } from '../lib/api.js';

// Used only when the admin has no hero photos yet.
const FALLBACK = ['photo-1616486338812-3dadae4b4ace', 'photo-1600210492486-724fe5c67fb0', 'photo-1618220179428-22790b461013'].map(
  (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`
);

export default function AccountAuth() {
  const { t } = useLang();
  const { customer, loading } = useCustomerAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const reduced = useReducedMotion();
  const [mode, setMode] = useState(params.get('tab') === 'register' ? 'register' : 'login');
  const [failed, setFailed] = useState([]);
  const [index, setIndex] = useState(0);
  const hero = useFetch(() => api('/home/hero'), []);

  // Pictures: the first hero photos from the admin panel (furniture), or the fallback furniture photos.
  const images = useMemo(() => {
    const fromAdmin = (hero.data || []).map((s) => assetUrl(s.image_url)).filter(Boolean).slice(0, 3);
    const list = fromAdmin.length ? fromAdmin : FALLBACK;
    return list.filter((u) => !failed.includes(u));
  }, [hero.data, failed]);
  const current = images.length ? index % images.length : 0;

  useEffect(() => {
    if (reduced || images.length < 2) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % images.length), 5000);
    return () => clearInterval(id);
  }, [reduced, images.length]);

  const next = params.get('next') && params.get('next').startsWith('/') ? params.get('next') : '/account';
  if (!loading && customer) return <Navigate to={next} replace />;

  const isLogin = mode === 'login';
  const toggle = () => setMode(isLogin ? 'register' : 'login');
  const done = () => navigate(next, { replace: true });
  const logo = assetUrl(settings.logo_url);

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-xl shadow-stone-900/5 dark:border-stone-800 dark:bg-stone-900 md:min-h-[660px] md:grid-cols-2">
          {/* Picture side */}
          <div className="relative min-h-[240px] bg-stone-800">
            <AnimatePresence initial={false}>
              {images.length > 0 && (
                <motion.img
                  key={images[current]}
                  src={images[current]}
                  alt=""
                  onError={() => setFailed((f) => (f.includes(images[current]) ? f : [...f, images[current]]))}
                  className="absolute inset-0 h-full w-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduced ? 0 : 1.2, ease: 'easeInOut' }}
                />
              )}
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/25 to-stone-950/45" />

            <div className="absolute inset-0 flex flex-col justify-between p-6 text-white md:p-9">
              <div className="flex items-center gap-3">
                {logo ? (
                  <img src={logo} alt="" className="h-11 w-11 rounded-full bg-white object-contain p-1" />
                ) : (
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white font-display text-lg font-bold text-olive-dark">{String(settings.business_name).charAt(0)}</span>
                )}
                <span className="font-display text-lg font-semibold">{settings.business_name}</span>
              </div>

              <div>
                <p className="text-2xl font-semibold leading-tight sm:text-3xl md:text-4xl">{t('authTagline')}</p>
                <p className="mt-2 hidden max-w-sm text-sm text-white/80 sm:block">{t('authTaglineSub')}</p>
                {images.length > 1 && (
                  <div className="mt-5 flex items-center gap-2">
                    {images.map((src, i) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => setIndex(i)}
                        aria-label={`${t('authSlide')} ${i + 1}`}
                        aria-current={i === current}
                        className={`h-1.5 rounded-full transition-all duration-500 ${i === current ? 'w-10 bg-white' : 'w-2 bg-white/50'}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form side */}
          <div className="flex flex-col p-6 sm:p-10">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={toggle}
                className="rounded-full bg-olive px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-olive-dark"
              >
                {isLogin ? t('register') : t('login')}
              </button>
            </div>

            <div className="mx-auto my-auto w-full max-w-md py-8">
              <h1 className="text-3xl font-bold leading-tight text-olive-dark dark:text-sand-100 sm:text-4xl">
                {isLogin ? t('authWelcome', { name: settings.business_name }) : t('authCreateTitle')}
              </h1>
              <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">{isLogin ? t('authWelcomeSub') : t('authCreateSub')}</p>

              <div className="mt-8">
                {isLogin ? <LoginForm key="login" showLabels onDone={done} /> : <RegisterForm key="register" showLabels onDone={done} />}
              </div>

              <p className="mt-8 text-center text-sm text-stone-500 dark:text-stone-400">
                {isLogin ? t('authNoAccount') : t('authHaveAccount')}{' '}
                <button type="button" onClick={toggle} className="font-semibold text-olive underline">
                  {isLogin ? t('register') : t('login')}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}