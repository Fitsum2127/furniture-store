import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { useLang } from '../context/LanguageContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { onImgError } from '../lib/api.js';

export default function ProductCard({ product, index = 0 }) {
  const { t, tr, money } = useLang();
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const liked = has(product.id);
  const soldOut = product.stock <= 0;

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

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: Math.min(index, 5) * 0.06 }}
      className="group"
    >
      <div className="relative overflow-hidden rounded-2xl bg-sand-100 dark:bg-stone-900">
        <Link to={`/product/${product.id}`} aria-label={tr(product.name)}>
          <img
            src={product.image}
            alt={tr(product.name)}
            loading="lazy"
            onError={onImgError}
            className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
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
          <Link to={`/product/${product.id}`} className="block truncate text-sm font-medium hover:text-olive">
            {tr(product.name)}
          </Link>
          <p className="mt-0.5 text-sm">
            <span className="font-semibold">{money(product.price)}</span>
            {product.oldPrice && (
              <span className="ml-2 text-xs text-stone-400 line-through">{money(product.oldPrice)}</span>
            )}
          </p>
        </div>
        <button
          onClick={handleAdd}
          disabled={soldOut}
          aria-label={t('addToCart')}
          className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-olive text-white transition hover:bg-olive-dark active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ShoppingCart size={16} />
        </button>
      </div>
    </motion.article>
  );
}