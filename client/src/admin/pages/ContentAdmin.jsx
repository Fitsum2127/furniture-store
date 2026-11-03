import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import useFetch from '../../hooks/useFetch.js';
import { adminApi } from '../adminApi.js';
import { Badge, ErrorBox, Loading, PageHeader, btnGhost, btnPrimary, inputClass } from '../ui.jsx';

function PageEditor({ page, onSaved }) {
  const [p, setP] = useState({ title_en: page.title_en, title_am: page.title_am || '', body_en: page.body_en, body_am: page.body_am || '', is_active: Boolean(page.is_active) });
  const [msg, setMsg] = useState('');
  const save = async () => {
    setMsg('');
    try {
      await adminApi(`/content/pages/${page.slug}`, { method: 'PUT', body: JSON.stringify({ ...p, is_active: p.is_active ? 1 : 0 }) });
      setMsg('Saved.');
      onSaved();
    } catch (e) {
      setMsg(e.message);
    }
  };
  return (
    <details className="rounded-2xl border border-sand-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
      <summary className="flex cursor-pointer items-center justify-between font-medium">{page.title_en}<Badge color={page.is_active ? 'green' : 'gray'}>{page.is_active ? 'Published' : 'Hidden'}</Badge></summary>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input value={p.title_en} onChange={(e) => setP({ ...p, title_en: e.target.value })} aria-label="Title English" className={inputClass} />
        <input value={p.title_am} onChange={(e) => setP({ ...p, title_am: e.target.value })} aria-label="Title Amharic" placeholder="Title (አማርኛ)" className={inputClass} />
        <textarea value={p.body_en} onChange={(e) => setP({ ...p, body_en: e.target.value })} rows={10} aria-label="Text English" className={`${inputClass} resize-y`} />
        <textarea value={p.body_am} onChange={(e) => setP({ ...p, body_am: e.target.value })} rows={10} aria-label="Text Amharic" placeholder="Text (አማርኛ)" className={`${inputClass} resize-y`} />
      </div>
      <p className="mt-2 text-xs text-stone-500">A page cannot be published while its text still starts with DRAFT. Write the real policy first.</p>
      <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={p.is_active} onChange={(e) => setP({ ...p, is_active: e.target.checked })} className="accent-olive" />Published (shown in the website footer)</label>
      {msg && <p className="mt-2 text-sm text-olive" role="status">{msg}</p>}
      <button onClick={save} className={`${btnPrimary} mt-3`}>Save page</button>
    </details>
  );
}

function FaqEditor({ faq, onSaved }) {
  const [f, setF] = useState(faq || { question_en: '', question_am: '', answer_en: '', answer_am: '', sort_order: 0, is_active: 1 });
  const [msg, setMsg] = useState('');
  const body = () => JSON.stringify({ ...f, is_active: f.is_active ? 1 : 0 });
  const save = async () => {
    setMsg('');
    try {
      await adminApi(faq ? `/content/faqs/${faq.id}` : '/content/faqs', { method: faq ? 'PUT' : 'POST', body: body() });
      if (!faq) setF({ question_en: '', question_am: '', answer_en: '', answer_am: '', sort_order: 0, is_active: 1 });
      setMsg('Saved.');
      onSaved();
    } catch (e) {
      setMsg(e.message);
    }
  };
  const remove = async () => {
    if (!window.confirm('Delete this question?')) return;
    await adminApi(`/content/faqs/${faq.id}`, { method: 'DELETE' });
    onSaved();
  };
  return (
    <li className="space-y-2 rounded-2xl border border-sand-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
      <div className="grid gap-2 sm:grid-cols-2">
        <input value={f.question_en} onChange={(e) => setF({ ...f, question_en: e.target.value })} placeholder="Question (English)" className={inputClass} />
        <input value={f.question_am || ''} onChange={(e) => setF({ ...f, question_am: e.target.value })} placeholder="Question (አማርኛ)" className={inputClass} />
        <textarea value={f.answer_en} onChange={(e) => setF({ ...f, answer_en: e.target.value })} rows={3} placeholder="Answer (English)" className={`${inputClass} resize-y`} />
        <textarea value={f.answer_am || ''} onChange={(e) => setF({ ...f, answer_am: e.target.value })} rows={3} placeholder="Answer (አማርኛ)" className={`${inputClass} resize-y`} />
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <input type="number" min="0" value={f.sort_order} onChange={(e) => setF({ ...f, sort_order: e.target.value })} aria-label="Order" className={`${inputClass} w-24`} />
        <label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(f.is_active)} onChange={(e) => setF({ ...f, is_active: e.target.checked })} className="accent-olive" />Visible</label>
        <button onClick={save} className={btnPrimary}>{faq ? 'Save' : <><Plus size={15} /> Add question</>}</button>
        {faq && <button onClick={remove} className={`${btnGhost} text-red-600`} aria-label="Delete question"><Trash2 size={15} /></button>}
        {msg && <span className="text-olive" role="status">{msg}</span>}
      </div>
    </li>
  );
}

export default function ContentAdmin() {
  const pages = useFetch(() => adminApi('/content/pages'), []);
  const faqs = useFetch(() => adminApi('/content/faqs'), []);
  return (
    <>
      <PageHeader title="Policies and FAQ" subtitle="Pages customers can read. Write the real text with the business owner." />
      <h2 className="mb-3 font-semibold">Policy pages</h2>
      {pages.loading ? <Loading /> : pages.error ? <ErrorBox message={pages.error} onRetry={pages.retry} /> : (
        <div className="space-y-3">{pages.data.map((p) => <PageEditor key={`${p.slug}-${p.updated_at}`} page={p} onSaved={pages.retry} />)}</div>
      )}
      <h2 className="mb-3 mt-8 font-semibold">Frequently asked questions</h2>
      <ul className="space-y-3">
        {faqs.data && faqs.data.map((f) => <FaqEditor key={f.id} faq={f} onSaved={faqs.retry} />)}
        <FaqEditor faq={null} onSaved={faqs.retry} />
      </ul>
    </>
  );
}