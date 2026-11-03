import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Minus, Plus, ShoppingBag, ChevronRight, Check } from 'lucide-react';
import PageTransition from '../components/PageTransition.jsx';
import ProductGallery from '../components/ProductGallery.jsx';
import ColorSwatches from '../components/ColorSwatches.jsx';
import ProductTrust from '../components/ProductTrust.jsx';
import ProductStory from '../components/ProductStory.jsx';
import ProductSpecs from '../components/ProductSpecs.jsx';
import ProductReviews from '../components/ProductReviews.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { useLang } from '../context/LanguageContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import useFetch from '../hooks/useFetch.js';
import useDocumentMeta from '../hooks/useDocumentMeta.js';
import { api, assetUrl, FALLBACK_IMG, normalizeProduct } from '../lib/api.js';

// Turns the API answer (straight from MySQL) into what the page needs.
function buildProduct(p) {
  const baseImages = (p.images || []).map(assetUrl);
  const real = (p.variants || []).map((v) => {
    const own = (v.images || []).map(assetUrl);
    const images = own.length ? own : baseImages;
    return {
      id: v.id,
      name: { en: v.name_en, am: v.name_am },
      hex: v.hex_color,
      stock: v.stock,
      images: images.length ? images : [FALLBACK_IMG],
    };
  });
  const variants = real.length
    ? real
    : [
        {
          id: 0,
          name: { en: 'Standard', am: 'መደበኛ' },
          hex: '#d9c6aa',
          stock: p.stock,
          images: baseImages.length ? baseImages : [FALLBACK_IMG],
        },
      ];
  return {
    id: p.id,
    name: { en: p.name_en, am: p.name_am },
    category: { slug: p.category_slug, en: p.category_en, am: p.category_am },
    tagline: { en: p.tagline_en || '', am: p.tagline_am || p.tagline_en || '' },
    description: { en: p.description_en || '', am: p.description_am || p.description_en || '' },
    price: Number(p.price),
    oldPrice: p.old_price ? Number(p.old_price) : null,
    stock: p.stock,
    hasVariants: real.length > 0,
    variants,
    details: p.details && typeof p.details === 'object' ? p.details : null,
    rating: p.rating,
    reviewCount: p.review_count,
  };
}

export default function ProductDetails() {
  const { id } = useParams();
  const { t, tr, money } = useLang();
  const { addItem } = useCart();
  const navigate = useNavigate();

  const { data, loading, error, retry } = useFetch(() => api(`/products/${id}`), [id]);
  const settingsState = useFetch(() => api('/settings'), []);
  const settings = settingsState.data || {};

  const [variantId, setVariantId] = useState(null);
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    setVariantId(null);
    setQty(1);
  }, [id]);

  const product = useMemo(() => (data ? buildProduct(data) : null), [data]);

  const businessName = settings.business_name || 'Bete Furniture';
  useDocumentMeta(
    product ? `${tr(product.name)} | ${businessName}` : businessName,
    product ? (tr(product.tagline) || tr(product.description)).slice(0, 155) : undefined
  );

  if (!product) {
    const notFound = error === 'Product not found';
    return (
      <PageTransition>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="aspect-[4/3] w-full rounded-2xl bg-sand-100 dark:bg-stone-900" />
              <div className="mx-auto h-5 w-2/3 rounded bg-sand-100 dark:bg-stone-900" />
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-semibold">{notFound ? t('productNotFound') : t('errorLoad')}</h1>
              {!notFound && (
                <button onClick={retry} className="mt-3 text-sm font-medium text-olive underline">{t('retry')}</button>
              )}
              <Link to="/shop" className="mt-5 inline-block rounded-full bg-olive px-7 py-3 text-sm font-semibold text-white">
                {t('backToShop')}
              </Link>
            </>
          )}
        </div>
      </PageTransition>
    );
  }

  const variant = product.variants.find((v) => v.id === variantId) || product.variants.find((v) => v.stock > 0) || product.variants[0];
  const stock = variant.stock;
  const soldOut = stock <= 0;
  const maxQty = Math.max(1, Math.min(stock, 100));
  const safeQty = Math.min(qty, maxQty);
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  const d = product.details;

  const richStory = d && d.story && d.story.material && d.story.design && d.story.care && Array.isArray(d.roomTips);
  const richSpecs = d && d.dimensions && Array.isArray(d.materials) && d.fabric && Array.isArray(d.accordion);

  const cartItem = () => ({
    productId: product.id,
    variantId: product.hasVariants ? variant.id : 0,
    name: product.name,
    variantName: product.hasVariants ? variant.name : null,
    image: variant.images[0],
    price: product.price,
    qty: safeQty,
  });

  const handleAdd = () => {
    if (soldOut) return;
    addItem(cartItem());
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  const handleBuyNow = () => {
    if (soldOut) return;
    addItem(cartItem(), { openDrawer: false });
    navigate('/checkout');
  };

  const related = (data.related || []).map(normalizeProduct);

  return (
    <PageTransition>
      <div className="pb-24 md:pb-0">
        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          <nav className="mb-5 flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
            <Link to="/" className="hover:text-olive">{t('home')}</Link>
            <ChevronRight size={13} />
            <Link to="/shop" className="hover:text-olive">{t('breadcrumbShop')}</Link>
            <ChevronRight size={13} />
            <Link to={`/shop?category=${product.category.slug}`} className="hover:text-olive">{tr(product.category)}</Link>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
            <ProductGallery images={variant.images} alt={tr(product.name)} />

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-sand-500">{tr(product.category)}</p>
              <h1 className="mt-1 text-3xl font-semibold leading-tight sm:text-4xl">{tr(product.name)}</h1>
              {tr(product.tagline) && <p className="mt-2 text-stone-600 dark:text-stone-400">{tr(product.tagline)}</p>}

              {product.reviewCount > 0 && product.rating && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <span className="flex">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={17}
                        className={n <= Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-sand-300 dark:text-stone-600'}
                      />
                    ))}
                  </span>
                  <span className="font-medium">{product.rating.toFixed(1)}</span>
                  <a href="#reviews" className="text-stone-500 underline-offset-2 hover:underline dark:text-stone-400">
                    ({product.reviewCount})
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

              {tr(product.description) && (
                <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                  {tr(product.description)}
                </p>
              )}

              {product.variants.length > 1 && (
                <div className="mt-6">
                  <p className="mb-2 text-sm font-semibold">
                    {t('color')}: <span className="font-normal text-stone-600 dark:text-stone-400">{tr(variant.name)}</span>
                  </p>
                  <ColorSwatches variants={product.variants} selectedId={variant.id} onSelect={setVariantId} />
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <div className="flex items-center rounded-full border border-sand-300 dark:border-stone-700">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="-" className="flex h-11 w-11 items-center justify-center">
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-medium" aria-label={t('qty')}>{safeQty}</span>
                  <button onClick={() => setQty((q) => Math.min(maxQty, q + 1))} aria-label="+" className="flex h-11 w-11 items-center justify-center">
                    <Plus size={16} />
                  </button>
                </div>
                <span className={`text-sm font-medium ${soldOut ? 'text-red-500' : stock <= 5 ? 'text-amber-600' : 'text-olive'}`}>
                  {soldOut
                    ? product.hasVariants ? t('optionSoldOut') : t('outOfStock')
                    : stock <= 5 ? t('onlyNLeft', { n: stock }) : t('inStockN', { n: stock })}
                </span>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAdd}
                disabled={soldOut}
                className="mt-5 hidden w-full items-center justify-center gap-2 rounded-full bg-olive py-4 text-base font-semibold text-white transition hover:bg-olive-dark disabled:cursor-not-allowed disabled:opacity-50 md:flex"
              >
                {justAdded ? <><Check size={19} /> {t('added')}</> : <><ShoppingBag size={19} /> {t('addToCart')}</>}
              </motion.button>

              <div className="mt-4">
                <ProductTrust settings={settings} onBuyNow={handleBuyNow} disabled={soldOut} />
              </div>
            </div>
          </div>
        </div>

        {richStory && <ProductStory story={d.story} roomTips={d.roomTips} />}
        {richSpecs && (
          <ProductSpecs
            product={{ variants: product.variants, dimensions: d.dimensions, materials: d.materials, fabric: d.fabric, accordion: d.accordion }}
            variantId={variant.id}
            onSelectVariant={setVariantId}
          />
        )}

        <div id="reviews">
          <ProductReviews key={product.id} productId={product.id} reviews={data.reviews || []} />
        </div>

        {related.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
            <h2 className="mb-6 text-2xl font-semibold">{t('relatedTitle')}</h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}

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
      </div>
    </PageTransition>
  );
}