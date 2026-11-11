import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ExternalLink, Mail, MapPin, Navigation, Phone } from 'lucide-react';
import { useLang } from '../context/LanguageContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { slow } from '../lib/motion.js';

const GOOGLE_MAPS = /^https:\/\/www\.google\.com\/maps/;

// The pasted Google embed link, or a simple map made from the written address / coordinates.
function mapSource(s) {
  const embed = String(s.map_embed || '').trim();
  if (embed && GOOGLE_MAPS.test(embed)) return embed;
  const q = String(s.map_query || '').trim();
  return q ? `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed` : '';
}

// Where the "Get directions" button goes: the typed address or coordinates, otherwise the pin inside the embed code.
function directionsTarget(s) {
  const q = String(s.map_query || '').trim();
  if (q) return q;
  const m = /!2d(-?\d+(?:\.\d+)?)!3d(-?\d+(?:\.\d+)?)/.exec(String(s.map_embed || ''));
  return m ? `${m[2]},${m[1]}` : '';
}

// Address, phone, email and hours on the left, the Google map on the right.
// Everything comes from Admin > Business settings. Nothing is shown for empty fields.
export default function LocationSection({ showPhoneEmail = true, showContactButton = true, headingTag = 'h2' }) {
  const { t, tr } = useLang();
  const { settings: s } = useSettings();
  const Heading = headingTag;

  const address = tr({ en: s.address_en, am: s.address_am || s.address_en });
  const hours = tr({ en: s.hours_en, am: s.hours_am || s.hours_en });
  const src = mapSource(s);
  const target = directionsTarget(s);

  const rows = [
    address && { icon: MapPin, label: t('locAddress'), text: address },
    showPhoneEmail && s.phone && { icon: Phone, label: t('phone'), text: s.phone, href: `tel:${String(s.phone).replace(/\s/g, '')}` },
    showPhoneEmail && s.email && { icon: Mail, label: t('locEmail'), text: s.email, href: `mailto:${s.email}` },
    hours && { icon: Clock, label: t('hours'), text: hours },
  ].filter(Boolean);

  if (!src && rows.length === 0) return null;

  const directionsHref = target ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(target)}` : '';
  const openHref = target ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(target)}` : '';

  const buttons = (
    <div className="flex flex-wrap gap-3">
      {directionsHref && (
        <a href={directionsHref} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-olive px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-olive-dark">
          <Navigation size={17} /> {t('getDirections')}
        </a>
      )}
      {showContactButton && (
        <Link to="/contact" className="inline-flex items-center justify-center rounded-full border border-olive px-7 py-3.5 text-sm font-semibold text-olive transition hover:bg-olive hover:text-white">
          {t('contactUs')}
        </Link>
      )}
      {!showContactButton && openHref && (
        <a href={openHref} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-olive px-7 py-3.5 text-sm font-semibold text-olive transition hover:bg-olive hover:text-white">
          <ExternalLink size={16} /> {t('openInMaps')}
        </a>
      )}
    </div>
  );

  const hasLeft = rows.length > 0;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={slow(0)}
      >
        <Heading className="text-3xl font-semibold sm:text-4xl">{t('locTitle')}</Heading>
        <div className="mt-3 h-0.5 w-10 bg-sand-400" />
      </motion.div>

      <div className={`mt-8 grid items-center gap-8 lg:gap-12 ${hasLeft && src ? 'lg:grid-cols-2' : ''}`}>
        {hasLeft && (
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={slow(0.1)}
            className="space-y-6"
          >
            {rows.map(({ icon: Icon, label, text, href }) => (
              <div key={label} className="flex items-start gap-4">
                <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-sand-100 text-olive dark:bg-stone-800">
                  <Icon size={21} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-stone-500 dark:text-stone-400">{label}</p>
                  {href ? (
                    <a href={href} className="break-words text-lg font-semibold transition-colors hover:text-olive">{text}</a>
                  ) : (
                    <p className="whitespace-pre-line break-words text-lg font-semibold">{text}</p>
                  )}
                </div>
              </div>
            ))}
            {buttons}
          </motion.div>
        )}

        {src && (
          <motion.div
            initial={{ opacity: 0, x: hasLeft ? 28 : 0, y: hasLeft ? 0 : 24 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={slow(0.2)}
          >
            <div className="overflow-hidden rounded-3xl border border-sand-200 bg-sand-100 shadow-lg shadow-stone-900/5 dark:border-stone-800 dark:bg-stone-900">
              <iframe
                title={t('mapFrame')}
                src={src}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                className="block h-72 w-full border-0 sm:h-96 lg:h-[26rem]"
              />
            </div>
            {!hasLeft && <div className="mt-5">{buttons}</div>}
          </motion.div>
        )}
      </div>
    </section>
  );
}