import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useLang } from '../context/LanguageContext.jsx';
import PasswordInput from './PasswordInput.jsx';
import { btnGhost, inputClass } from './ui.jsx';

const STYLE = {
  success: 'border-green-300 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-200',
  error: 'border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-200',
  info: 'border-sand-300 bg-white text-stone-800 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200',
};
const ICON = { success: CheckCircle2, error: XCircle, info: Info };

function Message({ msg, onClose }) {
  const { t } = useLang();
  const Icon = ICON[msg.type];
  return (
    <div role={msg.type === 'error' ? 'alert' : 'status'} className={`mb-4 flex items-start gap-3 rounded-2xl border p-3.5 text-sm shadow-sm ${STYLE[msg.type]}`}>
      <Icon size={18} className="mt-0.5 flex-none" />
      <p className="min-w-0 flex-1 break-words">{msg.text}</p>
      <button type="button" onClick={onClose} aria-label={t('a_dismiss')} className="flex-none opacity-70 hover:opacity-100"><X size={16} /></button>
    </div>
  );
}

function Dialog({ dialog, onClose }) {
  const { t } = useLang();
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const isPrompt = dialog.kind === 'prompt';

  const submit = (e) => {
    e.preventDefault();
    if (isPrompt && dialog.validate) {
      const problem = dialog.validate(value);
      if (problem) {
        setError(problem);
        return;
      }
    }
    onClose();
    dialog.onConfirm(isPrompt ? value : undefined);
  };

  return (
    <form onSubmit={submit} role="alertdialog" aria-live="assertive" className="mb-4 rounded-2xl border-2 border-olive bg-white p-4 shadow-lg dark:bg-stone-900">
      <p className="flex items-start gap-2 text-sm font-medium">
        <AlertTriangle size={18} className={`mt-0.5 flex-none ${dialog.danger ? 'text-red-500' : 'text-olive'}`} />
        <span className="min-w-0 break-words">{dialog.text}</span>
      </p>
      {isPrompt && (
        <div className="mt-3 max-w-sm">
          {dialog.secret ? (
            <PasswordInput value={value} onChange={(e) => setValue(e.target.value)} placeholder={dialog.placeholder} aria-label={dialog.placeholder} autoFocus />
          ) : (
            <input value={value} onChange={(e) => setValue(e.target.value)} placeholder={dialog.placeholder} aria-label={dialog.placeholder} autoFocus className={inputClass} />
          )}
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-500" role="alert">{error}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="submit" autoFocus={!isPrompt} className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white transition ${dialog.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-olive hover:bg-olive-dark'}`}>
          {dialog.confirmLabel || t('a_confirm')}
        </button>
        <button type="button" onClick={onClose} className={btnGhost}>{t('a_cancel')}</button>
      </div>
    </form>
  );
}

// Usage in a page:
//   const fb = useFeedback();   ...   {fb.banner}
//   fb.success('Saved.')  fb.error(message)
//   fb.confirm({ text, confirmLabel, danger, onConfirm })
//   fb.prompt({ text, placeholder, secret, validate, onConfirm })
export function useFeedback() {
  const [msg, setMsg] = useState(null);
  const [dialog, setDialog] = useState(null);
  const timer = useRef(null);

  const flash = useCallback((type, text) => {
    clearTimeout(timer.current);
    setMsg({ type, text });
    if (type === 'success') timer.current = setTimeout(() => setMsg(null), 6000);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);

  const success = useCallback((text) => flash('success', text), [flash]);
  const error = useCallback((text) => flash('error', text), [flash]);
  const info = useCallback((text) => flash('info', text), [flash]);
  const clear = useCallback(() => setMsg(null), []);
  const confirm = useCallback((opts) => setDialog({ kind: 'confirm', ...opts }), []);
  const prompt = useCallback((opts) => setDialog({ kind: 'prompt', ...opts }), []);
  const closeDialog = useCallback(() => setDialog(null), []);

  // On a phone the header has two rows, so the sticky message sits lower than on a computer.
  const banner = (
    <div className="sticky top-[7.25rem] z-20 md:top-[4.75rem]">
      {dialog ? <Dialog key={dialog.text} dialog={dialog} onClose={closeDialog} /> : msg ? <Message msg={msg} onClose={clear} /> : null}
    </div>
  );

  return { success, error, info, clear, confirm, prompt, banner };
}