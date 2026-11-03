// For local development the Vite proxy forwards /api and /uploads to the server, so VITE_API_URL stays empty.
// In production either set VITE_API_URL (the backend address) or use the Vercel rewrites (Batch 8).
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const CUSTOMER_TOKEN_KEY = 'customerToken';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export const assetUrl = (url) => (url && String(url).startsWith('/uploads/') ? `${API_BASE}${url}` : url);

export async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  let token = null;
  try {
    token = localStorage.getItem(CUSTOMER_TOKEN_KEY);
  } catch (e) {
    /* storage unavailable */
  }
  if (token && !headers.Authorization) headers.Authorization = `Bearer ${token}`;
  if (typeof options.body === 'string' && !headers['Content-Type']) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE}/api${path}`, { ...options, headers });
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    /* response had no JSON body */
  }
  if (res.status === 401 && token && path.startsWith('/customers') && !path.startsWith('/customers/login')) {
    window.dispatchEvent(new Event('customer-logout'));
  }
  if (!res.ok) throw new ApiError((data && data.error) || `Request failed (${res.status})`, res.status);
  return data;
}

// Converts a database row (list endpoints) into the shape the components use.
export function normalizeProduct(p) {
  return {
    id: p.id,
    sku: p.sku,
    name: { en: p.name_en, am: p.name_am },
    category: { slug: p.category_slug, en: p.category_en, am: p.category_am },
    price: Number(p.price),
    oldPrice: p.old_price ? Number(p.old_price) : null,
    stock: p.stock,
    image: assetUrl(p.thumbnail),
    rating: p.rating ? Number(p.rating) : null,
    reviewCount: Number(p.review_count || 0),
    variantsCount: Number(p.variants_count || 0),
    featured: Boolean(p.is_featured),
  };
}

// Shown when an image link is broken.
export const FALLBACK_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="#e8dccb"/></svg>'
  );

export const onImgError = (e) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = FALLBACK_IMG;
};