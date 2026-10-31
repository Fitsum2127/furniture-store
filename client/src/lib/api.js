export async function api(path, options = {}) {
  const res = await fetch(`/api${path}`, options);
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    /* response had no JSON body */
  }
  if (!res.ok) throw new Error((data && data.error) || `Request failed (${res.status})`);
  return data;
}

// Converts a database row into the shape the components use.
export function normalizeProduct(p) {
  return {
    id: p.id,
    sku: p.sku,
    name: { en: p.name_en, am: p.name_am },
    category: { slug: p.category_slug, en: p.category_en, am: p.category_am },
    price: Number(p.price),
    oldPrice: p.old_price ? Number(p.old_price) : null,
    stock: p.stock,
    image: p.thumbnail,
    rating: p.rating ? Number(p.rating) : null,
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