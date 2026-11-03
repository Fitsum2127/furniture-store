import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import useFetch from '../../hooks/useFetch.js';
import { useLang } from '../../context/LanguageContext.jsx';
import { adminApi } from '../adminApi.js';
import ActionMenu from '../ActionMenu.jsx';
import { Badge, ErrorBox, Loading, PageHeader, btnPrimary, card, inputClass } from '../ui.jsx';

function PageEditor({ page, onSaved }) {
  const { t } = useLang();
  const [p, setP] = useState({ title_en: page.title_en, title_am: page.title_am || '', body_en: page.body_en, body_am: page.body_am || '', is_active: Boolean(page.is_active) });
  const [msg, setMsg] = useState('');
  const save = async () => {
    setMsg('');
    try {
      await adminApi(`/content/pages/${page.slug}`, { method: 'PUT', body: JSON.stringify({ ...p, is_active: p.is_active ? 1 : 0 }) });
      setMsg(t('a_saved'));
      onSaved();
    } catch (e) {
      setMsg(e.message);
    }
  };
  return (
    <details className={`${card} p-4`}>
      <summary className="flex cursor-pointer items-center justify-between font-medium">{page.title_en}<Badge color={page.is_active ? 'green' : 'gray'}>{page.is_active ? t('a_published') : t('a_hidden')}</Badge></summary>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input value={p.title_en} onChange={(e) => setP({ ...p, title_en: e.target.value })} placeholder={t('a_titleEnPh')} aria-label={t('a_titleEnPh')} className={inputClass} />
        <input value={p.title_am} onChange={(e) => setP({ ...p, title_am: e.target.value })} placeholder={t('a_titleAmPh')} aria-label={t('a_titleAmPh')} className={inputClass} />
        <textarea value={p.body_en} onChange={(e) => setP({ ...p, body_en: e.target.value })} rows={10} placeholder={t('a_textEnPh')} aria-label={t('a_textEnPh')} className={`${inputClass} resize-y`} />
        <textarea value={p.body_am} onChange={(e) => setP({ ...p, body_am: e.target.value })} rows={10} placeholder={t('a_textAmPh')} aria-label={t('a_textAmPh')} className={`${inputClass} resize-y`} />
      </div>
      <p className="mt-2 text-xs text-stone-500">{t('a_draftHint')}</p>
      <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={p.is_active} onChange={(e) => setP({ ...p, is_active: e.target.checked })} className="accent-olive" />{t('a_publishedFooter')}</label>
      {msg && <p className="mt-2 text-sm text-olive" role="status">{msg}</p>}
      <button onClick={save} className={`${btnPrimary} mt-3`}>{t('a_savePage')}</button>
    </details>
  );
}

function FaqEditor({ faq, onSaved }) {
  const { t } = useLang();
  const blank = { question_en: '', question_am: '', answer_en: '', answer_am: '', sort_order: 0, is_active: 1 };
  const [f, setF] = useState(faq || blank);
  const [msg, setMsg] = useState('');
  const save = async () => {
    setMsg('');
    try {
      await adminApi(faq ? `/content/faqs/${faq.id}` : '/content/faqs', { method: faq ? 'PUT' : 'POST', body: JSON.stringify({ ...f, is_active: f.is_active ? 1 : 0 }) });
      if (!faq) setF(blank);
      setMsg(t('a_saved'));
      onSaved();
    } catch (e) {
      setMsg(e.message);
    }
  };
  const remove = async () => {
    if (!window.confirm(t('a_confirmDeleteFaq'))) return;
    try {
      await adminApi(`/content/faqs/${faq.id}`, { method: 'DELETE' });
      onSaved();
    } catch (e) {
      setMsg(e.message);
    }
  };
  return (
    <li className={`${card} space-y-2 p-4`}>
      <div className="grid gap-2 sm:grid-cols-2">
        <input value={f.question_en} onChange={(e) => setF({ ...f, question_en: e.target.value })} placeholder={t('a_questionEn')} aria-label={t('a_questionEn')} className={inputClass} />
        <input value={f.question_am || ''} onChange={(e) => setF({ ...f, question_am: e.target.value })} placeholder={t('a_questionAm')} aria-label={t('a_questionAm')} className={inputClass} />
        <textarea value={f.answer_en} onChange={(e) => setF({ ...f, answer_en: e.target.value })} rows={3} placeholder={t('a_answerEn')} aria-label={t('a_answerEn')} className={`${inputClass} resize-y`} />
        <textarea value={f.answer_am || ''} onChange={(e) => setF({ ...f, answer_am: e.target.value })} rows={3} placeholder={t('a_answerAm')} aria-label={t('a_answerAm')} className={`${inputClass} resize-y`} />
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <input type="number" min="0" value={f.sort_order} onChange={(e) => setF({ ...f, sort_order: e.target.value })} aria-label={t('a_orderLabel')} placeholder={t('a_orderLabel')} className={`${inputClass} w-24`} />
        <label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(f.is_active)} onChange={(e) => setF({ ...f, is_active: e.target.checked })} className="accent-olive" />{t('a_visible')}</label>
        <button onClick={save} className={btnPrimary}>{faq ? t('a_save') : <><Plus size={15} /> {t('a_addQuestion')}</>}</button>
        {faq && <ActionMenu items={[{ label: t('a_delete'), icon: Trash2, danger: true, onClick: remove }]} />}
        {msg && <span className="text-olive" role="status">{msg}</span>}
      </div>
    </li>
  );
}

export default function ContentAdmin() {
  const { t } = useLang();
  const pages = useFetch(() => adminApi('/content/pages'), []);
  const faqs = useFetch(() => adminApi('/content/faqs'), []);
  return (
    <>
      <PageHeader title={t('a_content')} subtitle={t('a_contentSub')} />
      <h2 className="mb-3 font-semibold">{t('a_policyPages')}</h2>
      {pages.loading ? <Loading /> : pages.error ? <ErrorBox message={pages.error} onRetry={pages.retry} /> : (
        <div className="space-y-3">{pages.data.map((p) => <PageEditor key={`${p.slug}-${p.updated_at}`} page={p} onSaved={pages.retry} />)}</div>
      )}
      <h2 className="mb-3 mt-8 font-semibold">{t('a_faqTitle')}</h2>
      <ul className="space-y-3">
        {faqs.data && faqs.data.map((f) => <FaqEditor key={f.id} faq={f} onSaved={faqs.retry} />)}
        <FaqEditor faq={null} onSaved={faqs.retry} />
      </ul>
    </>
  );
}