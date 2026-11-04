import { useState } from 'react';
import { Check, EyeOff, Star, Trash2 } from 'lucide-react';
import useFetch from '../../hooks/useFetch.js';
import { useLang } from '../../context/LanguageContext.jsx';
import { assetUrl } from '../../lib/api.js';
import { adminApi } from '../adminApi.js';
import ActionMenu from '../ActionMenu.jsx';
import { useFeedback } from '../feedback.jsx';
import { Badge, ErrorBox, Loading, PageHeader, card, inputClass, useFmt } from '../ui.jsx';

export default function ReviewsAdmin() {
  const { t } = useLang();
  const { fmtDate } = useFmt();
  const fb = useFeedback();
  const { data, loading, error, retry } = useFetch(() => adminApi('/reviews'), []);
  const [filter, setFilter] = useState('pending');
  const list = (data || []).filter((r) => (filter === 'pending' ? !r.is_approved : filter === 'approved' ? r.is_approved : true));

  const run = async (fn, okText) => {
    try {
      await fn();
      fb.success(okText);
      retry();
    } catch (err) {
      fb.error(err.message);
    }
  };
  const setApproved = (r, approved) =>
    run(() => adminApi(`/reviews/${r.id}`, { method: 'PATCH', body: JSON.stringify({ is_approved: approved ? 1 : 0 }) }), t(approved ? 'a_reviewApproved' : 'a_reviewHidden'));
  const remove = (r) =>
    fb.confirm({
      text: t('a_confirmDeleteReview'),
      confirmLabel: t('a_yesDelete'),
      danger: true,
      onConfirm: () => run(() => adminApi(`/reviews/${r.id}`, { method: 'DELETE' }), t('a_reviewDeleted')),
    });

  return (
    <>
      <PageHeader title={t('a_reviews')} subtitle={t('a_reviewsSub')}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label={t('a_reviews')} className={`${inputClass} w-48`}>
          <option value="pending">{t('a_filterPending')}</option>
          <option value="approved">{t('a_filterApproved')}</option>
          <option value="all">{t('a_filterAll')}</option>
        </select>
      </PageHeader>
      {fb.banner}
      {loading ? <Loading /> : error ? <ErrorBox message={error} onRetry={retry} /> : list.length === 0 ? (
        <p className="py-10 text-center text-sm text-stone-500">{t('a_noReviews')}</p>
      ) : (
        <ul className="space-y-4">
          {list.map((r) => (
            <li key={r.id} className={`${card} p-5`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{r.author_name}</p>
                  <p className="text-xs text-stone-500">{r.product_name} · {fmtDate(r.created_at)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1 text-sm font-semibold"><Star size={15} className="fill-amber-400 text-amber-400" /> {r.rating_overall}/5</span>
                  {r.is_verified_purchase ? <Badge color="blue">{t('a_verifiedPurchase')}</Badge> : null}
                  <Badge color={r.is_approved ? 'green' : 'amber'}>{r.is_approved ? t('a_approved') : t('a_pending')}</Badge>
                  <ActionMenu
                    items={[
                      r.is_approved
                        ? { label: t('a_hide'), icon: EyeOff, onClick: () => setApproved(r, false) }
                        : { label: t('a_approve'), icon: Check, onClick: () => setApproved(r, true) },
                      { label: t('a_delete'), icon: Trash2, danger: true, onClick: () => remove(r) },
                    ]}
                  />
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm">{r.body}</p>
              <p className="mt-2 text-xs text-stone-500">{t('a_ratingsLine', { q: r.rating_quality, c: r.rating_comfort, v: r.rating_value, d: r.rating_delivery })}</p>
              {r.photos.length > 0 && (
                <div className="mt-3 flex gap-2">
                  {r.photos.map((src) => (
                    <a key={src} href={assetUrl(src)} target="_blank" rel="noreferrer"><img src={assetUrl(src)} alt="" className="h-16 w-16 rounded-lg object-cover" /></a>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}