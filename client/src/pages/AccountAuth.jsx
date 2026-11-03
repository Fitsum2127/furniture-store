import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import PageTransition from '../components/PageTransition.jsx';
import { LoginForm, RegisterForm } from '../components/AuthForms.jsx';
import { useCustomerAuth } from '../context/CustomerAuthContext.jsx';
import { useLang } from '../context/LanguageContext.jsx';

export default function AccountAuth() {
  const { t } = useLang();
  const { customer, loading } = useCustomerAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [tab, setTab] = useState(params.get('tab') === 'register' ? 'register' : 'login');
  const next = params.get('next') && params.get('next').startsWith('/') ? params.get('next') : '/account';

  if (!loading && customer) return <Navigate to={next} replace />;

  return (
    <PageTransition>
      <div className="mx-auto max-w-md px-4 py-14">
        <div className="mb-6 grid grid-cols-2 rounded-full bg-sand-100 p-1 dark:bg-stone-900">
          {['login', 'register'].map((k) => (
            <button key={k} onClick={() => setTab(k)} className={`rounded-full py-2.5 text-sm font-semibold transition ${tab === k ? 'bg-olive text-white' : ''}`}>
              {t(k)}
            </button>
          ))}
        </div>
        <div className="rounded-3xl border border-sand-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
          {tab === 'login' ? <LoginForm onDone={() => navigate(next, { replace: true })} /> : <RegisterForm onDone={() => navigate(next, { replace: true })} />}
        </div>
      </div>
    </PageTransition>
  );
}