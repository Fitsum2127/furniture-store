import { Phone, MessageCircle } from 'lucide-react';
import { useLang } from '../context/LanguageContext.jsx';

// Delivery information and ways to contact the business. Everything comes from the business settings,
// so nothing is shown unless the business entered it.
export default function ProductTrust({ settings, onBuyNow, disabled }) {
  const { t, money } = useLang();
  const s = settings || {};

  const fee = Number(s.delivery_fee);
  const min = Number(s.free_delivery_min_subtotal);
  const cities = String(s.free_delivery_cities || '')
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);

  const lines = [];
  if (Number.isFinite(fee) && fee > 0) lines.push(t('deliveryFeeIs', { fee: money(fee) }));
  else lines.push(t('deliveryCalcAtCheckout'));
  if (Number.isFinite(min) && min > 0) lines.push(t('freeAbove', { min: money(min) }));
  if (cities.length) lines.push(t('freeInCities', { cities: cities.join(', ') }));

  const whatsappDigits = String(s.whatsapp || '').replace(/\D/g, '');
  const hasPhone = Boolean(s.phone);
  const hasContact = hasPhone || whatsappDigits;

  return (
    <div className="space-y-4">
      <button
        onClick={onBuyNow}
        disabled={disabled}
        className="w-full rounded-full border-2 border-olive py-3.5 text-sm font-semibold text-olive transition hover:bg-olive hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {t('buyNow')}
      </button>

      <ul className="space-y-1 rounded-2xl border border-sand-200 bg-white p-4 text-xs text-stone-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      {hasContact && (
        <div>
          <p className="mb-2 text-center text-xs text-stone-500 dark:text-stone-400">{t('needHelp')}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {hasPhone && (
              <a
                href={`tel:${String(s.phone).replace(/\s/g, '')}`}
                className="flex items-center justify-center gap-2 rounded-full border border-sand-300 px-5 py-3 text-sm font-semibold transition hover:bg-sand-100 dark:border-stone-700 dark:hover:bg-stone-800"
              >
                <Phone size={16} /> {t('callUs')}
              </a>
            )}
            {whatsappDigits && (
              <a
                href={`https://wa.me/${whatsappDigits}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-full border border-sand-300 px-5 py-3 text-sm font-semibold transition hover:bg-sand-100 dark:border-stone-700 dark:hover:bg-stone-800"
              >
                <MessageCircle size={16} /> {t('whatsapp')}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}