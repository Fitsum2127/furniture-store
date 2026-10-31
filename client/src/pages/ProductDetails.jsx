import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Minus, Plus, ShoppingBag, ChevronRight, Check } from 'lucide-react';
import { mockProduct } from '../data/mockProduct.js';
import { useLang } from '../context/LanguageContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import useFetch from '../hooks/useFetch.js';
import { api, FALLBACK_IMG } from '../lib/api.js';
import { STORE } from '../config.js';
import ProductGallery from '../components/ProductGallery.jsx';
import ColorSwatches from '../components/ColorSwatches.jsx';
import ProductTrust from '../components/ProductTrust.jsx';
import ProductStory from '../components/ProductStory.jsx';
import ProductSpecs from '../components/ProductSpecs.jsx';
import ProductReviews from '../components/ProductReviews.jsx';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

// Turns a database product (simple items) into the shape the page uses.
function buildProduct(p) {
  const hasVariants = p.variants && p.variants.length > 0;
  const variants = hasVariants
    ? p.variants.map((v) => ({
        id: v.id,
        name: { en: v.name_en, am: v.name_am },
        hex: v.hex_color,
        images: v.images.length ? v.images : [FALLBACK_IMG],
      }))
    : [
        {
          id: 0,
          name: { en: 'Standard', am: 'መደበኛ' },
          hex: '#d9c6aa',
          images: p.images && p.images.length ? p.images : [FALLBACK_IMG],
        },
      ];

  return {
    id: p.id,
    sku: p.sku,
    name: { en: p.name_en, am: p.name_am },
    category: { en: p.category_en, am: p.category_am },
    tagline: { en: p.tagline_en || '', am: p.tagline_am || '' },
    description: { en: p.description_en || '', am: p.description_am || '' },
    price: Number(p.price),
    oldPrice: p.old_price ? Number(p.old_price) : null,
    stock: p.stock,
    phone: STORE.phone,
    variants,
    trust: mockProduct.trust,
    reviews: (p.reviews || []).map((r) => ({
      id: r.id,
      author: r.author_name,
      date: r.created_at,
      ratings: {
        quality: r.rating_quality,
        comfort: r.rating_comfort,
        value: r.rating_value,
        delivery: r.rating_delivery,
      },
      body: { en: r.body, am: r.body },
      photos: r.photos || [],
    })),
  };
}

export default function ProductDetails() {
  const { id } = useParams();
  const { t, tr, money } = useLang();
  const { addItem } = useCart();
  const navigate = useNavigate();

  const isRich = String(id) === String(mockProduct.id);
  const { data, loading, error, retry } = useFetch(
    () => (isRich ? Promise.resolve(null) : api(`/products/${id}`)),
    [id]
  );

  const [variantId, setVariantId] = useState(null);
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const product = isRich ? mockProduct : data ? buildProduct(data) : null;

  if (!product) {
    return (
      <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="mx-auto aspect-[4/3] w-full rounded-2xl bg-sand-100 dark:bg-stone-900" />
              <div className="mx-auto h-5 w-2/3 rounded bg-sand-100 dark:bg-stone-900" />
            </div>
          ) : (
            <>
              <p className="text-stone-600 dark:text-stone-400">
                {error && error !== 'Product not found' ? t('errorLoad') : t('productNotFound')}
              </p>
              {error && error !== 'Product not found' && (
                <button onClick={retry} className="mt-3 text-sm font-medium text-olive underline">{t('retry')}</button>
              )}
              <Link to="/shop" className="mt-5 inline-block rounded-full bg-olive px-7 py-3 text-sm font-semibold text-white">
                {t('backToShop')}
              </Link>
            </>
          )}
        </div>
      </motion.div>
    );
  }

  const variant = product.variants.find((v) => v.id === variantId) || product.variants[0];
  const selectedVariantId = variant.id;

  const keys = ['quality', 'comfort', 'value', 'delivery'];
  const ratingAvg = product.reviews.length
    ? product.reviews.reduce((s, r) => s + keys.reduce((a, k) => a + r.ratings[k], 0) / keys.length, 0) /
      product.reviews.length
    : 0;

  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  const soldOut = product.stock <= 0;

  const cartItem = () => ({
    productId: product.id,
    variantId: variant.id,
    name: product.name,
    variantName: product.variants.length > 1 ? variant.name : null,
    image: variant.images[0],
    price: product.price,
    qty,
  });

  const handleAdd = () => {
    addItem(cartItem());
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  const handleOrder = (method) => {
    addItem(cartItem(), { openDrawer: false });
    navigate(`/checkout?pay=${method}`);
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="pb-24 md:pb-0">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <nav className="mb-5 flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
          <Link to="/" className="hover:text-olive">{t('home')}</Link>
          <ChevronRight size={13} />
          <Link to="/shop" className="hover:text-olive">{t('breadcrumbShop')}</Link>
          <ChevronRight size={13} />
          <span>{tr(product.category)}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
          <ProductGallery images={variant.images} alt={tr(product.name)} />

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-sand-500">{tr(product.category)}</p>
            <h1 className="mt-1 text-3xl font-semibold leading-tight sm:text-4xl">{tr(product.name)}</h1>
            {tr(product.tagline) && (
              <p className="mt-2 text-stone-600 dark:text-stone-400">{tr(product.tagline)}</p>
            )}

            {product.reviews.length > 0 && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className="flex">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      size={17}
                      className={n <= Math.round(ratingAvg) ? 'fill-amber-400 text-amber-400' : 'text-sand-300 dark:text-stone-600'}
                    />
                  ))}
                </span>
                <span className="font-medium">{ratingAvg.toFixed(1)}</span>
                <a href="#reviews" className="text-stone-500 underline-offset-2 hover:underline dark:text-stone-400">
                  ({product.reviews.length})
                </a>
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-end gap-3">
              <span className="text-3xl font-bold text-olive">{money(product.price)}</span>
              {product.oldPrice && (
                <>
                  <span className="pb-1 text-base text-stone-400 line-through">{money(product.oldPrice)}</span>
                  <span className="mb-1 rounded-full bg-olive/15 px-2.5 py-0.5 text-xs font-bold text-olive-dark dark:text-olive-light">
                    -{discount}%
                  </span>
                </>
              )}
            </div>
            {product.oldPrice && (
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                {t('save')}: {money(product.oldPrice - product.price)}
              </p>
            )}

            <p className="mt-5 text-sm leading-relaxed text-stone-700 dark:text-stone-300">{tr(product.description)}</p>

            {product.variants.length > 1 && (
              <div className="mt-6">
                <p className="mb-2 text-sm font-semibold">
                  {t('color')}: <span className="font-normal text-stone-600 dark:text-stone-400">{tr(variant.name)}</span>
                </p>
                <ColorSwatches variants={product.variants} selectedId={selectedVariantId} onSelect={setVariantId} />
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-full border border-sand-300 dark:border-stone-700">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="-" className="flex h-11 w-11 items-center justify-center">
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center font-medium" aria-label={t('qty')}>{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(Math.max(product.stock, 1), q + 1))}
                  aria-label="+"
                  className="flex h-11 w-11 items-center justify-center"
                >
                  <Plus size={16} />
                </button>
              </div>
              <span className={`text-sm font-medium ${soldOut ? 'text-red-500' : 'text-olive'}`}>
                {soldOut ? t('outOfStock') : t('inStockN', { n: product.stock })}
              </span>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAdd}
              disabled={soldOut}
              className="mt-5 hidden w-full items-center justify-center gap-2 rounded-full bg-olive py-4 text-base font-semibold text-white transition hover:bg-olive-dark disabled:opacity-50 md:flex"
            >
              {justAdded ? <><Check size={19} /> {t('added')}</> : <><ShoppingBag size={19} /> {t('addToCart')}</>}
            </motion.button>

            <div className="mt-6">
              <ProductTrust trust={product.trust} phone={product.phone} onOrder={handleOrder} />
            </div>
          </div>
        </div>
      </div>

      {product.story && <ProductStory story={product.story} roomTips={product.roomTips} />}
      {product.dimensions && (
        <ProductSpecs product={product} variantId={selectedVariantId} onSelectVariant={setVariantId} />
      )}
      <div id="reviews">
        <ProductReviews key={product.id} productId={product.id} initialReviews={product.reviews} />
      </div>

      {/* Mobile sticky buy bar (sits above the bottom navigation) */}
      <div className="fixed inset-x-0 bottom-[3.9rem] z-30 flex items-center gap-3 border-t border-sand-200 bg-sand-50/95 px-4 py-2.5 backdrop-blur dark:border-stone-800 dark:bg-stone-950/95 md:hidden">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-stone-500 dark:text-stone-400">{tr(product.name)}</p>
          <p className="font-bold text-olive">{money(product.price)}</p>
        </div>
        <button
          onClick={handleAdd}
          disabled={soldOut}
          className="flex items-center gap-2 rounded-full bg-olive px-6 py-3 text-sm font-semibold text-white active:scale-95 disabled:opacity-50"
        >
          {justAdded ? <Check size={17} /> : <ShoppingBag size={17} />}
          {justAdded ? t('added') : t('addToCart')}
        </button>
      </div>
    </motion.div>
  );
}