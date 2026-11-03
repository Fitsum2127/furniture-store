import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useLang } from '../context/LanguageContext.jsx';
import { inputClass } from './ui.jsx';

// A password field with an eye button to show or hide what is typed.
export default function PasswordInput({ className = '', ...props }) {
  const { t } = useLang();
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input {...props} type={show ? 'text' : 'password'} className={`${inputClass} pr-12 ${className}`} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? t('a_hidePassword') : t('a_showPassword')}
        aria-pressed={show}
        title={show ? t('a_hidePassword') : t('a_showPassword')}
        className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-stone-500 transition hover:bg-sand-100 dark:hover:bg-stone-800"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}