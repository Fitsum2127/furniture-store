import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { useLang } from '../context/LanguageContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { onImgError } from '../lib/api.js';
import { slow } from '../lib/motion.js';

export default function ProductCard({ product, index = 0 }) {
  const { t, tr, money } = useLang();
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const liked = has(product.id);
  const soldOut = product.stock <= 0;
  const needsOption = product.variantsCount > 0;

  const handleAdd = () => {
    addItem({
      productId: product.id,
      variantId: 0,
      name: product.name,
      variantName: null,
      image: product.image,
      price: product.price,
      qty: 1,
    });
  };

  const cartButtonClass =
    'flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-olive text-white transition hover:bg-olive-dark active:scale-95';

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={slow(Math.min(index, 5) * 0.15)}
      className="group"
    >
      <div className="relative overflow-hidden rounded-2xl bg-sand-100 transition-shadow duration-[1200ms] group-hover:shadow-xl dark:bg-stone-900">
        <Link to={`/product/${product.id}`} aria-label={tr(product.name)}>
          <img
            src={product.image}
            alt={tr(product.name)}
            loading="lazy"
            onError={onImgError}
            className="aspect-square w-full object-cover transition duration-[1800ms] ease-out group-hover:scale-110"
          />
        </Link>
        <button
          onClick={() => toggle(product.id)}
          aria-label={liked ? t('wishlistRemove') : t('wishlistAdd')}
          aria-pressed={liked}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 backdrop-blur transition hover:bg-white dark:bg-stone-900/80"
        >
          <Heart size={17} className={liked ? 'fill-red-500 text-red-500' : 'text-stone-600 dark:text-stone-300'} />
        </button>
        {soldOut && (
          <span className="absolute left-3 top-3 rounded-full bg-stone-900/80 px-3 py-1 text-xs font-medium text-white">
            {t('outOfStock')}
          </span>
        )}
      </div>

      <div className="flex items-start justify-between gap-2 pt-3">
        <div className="min-w-0">
          <Link
            to={`/product/${product.id}`}
            className="block truncate text-sm font-medium transition-colors duration-700 hover:text-olive"
          >
            {tr(product.name)}
          </Link>
          <p className="mt-0.5 text-sm">
            <span className="font-semibold">{money(product.price)}</span>
            {product.oldPrice && (
              <span className="ml-2 text-xs text-stone-400 line-through">{money(product.oldPrice)}</span>
            )}
          </p>
        </div>

        {needsOption ? (
          // Products with colors or options must be chosen on their own page.
          <Link
            to={`/product/${product.id}`}
            aria-label={t('chooseOption')}
            title={t('chooseOption')}
            className={cartButtonClass}
          >
            <ShoppingCart size={16} />
          </Link>
        ) : (
          <button
            onClick={handleAdd}
            disabled={soldOut}
            aria-label={t('addToCart')}
            className={`${cartButtonClass} disabled:cursor-not-allowed disabled:opacity-40`}
          >
            <ShoppingCart size={16} />
          </button>
        )}
      </div>
    </motion.article>
  );
}