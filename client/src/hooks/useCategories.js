import { useMemo } from 'react';
import useFetch from './useFetch.js';
import { api, assetUrl, normalizeProduct } from '../lib/api.js';

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=400&q=70`;
// Default pictures. A category picture uploaded in the admin is used first.
const IMAGES = {
  'living-room': img('photo-1555041469-a586c61ea9bc'), bedroom: img('photo-1505693416388-ac5ce068fe85'),
  dining: img('photo-1556228453-efd6c1ff04f6'), office: img('photo-1518455027359-f3f8164ba6bd'),
  'wall-decor': img('photo-1524758631624-e2822e304c36'), lighting: img('photo-1513694203232-719a280e022f'),
  'home-decor': img('photo-1485955900006-10f4d324d411'),
};
const DEFAULT_IMAGE = img('photo-1616486338812-3dadae4b4ace');

// Categories from MySQL, each with its products.
export default function useCategories() {
  const cats = useFetch(() => api('/categories'), []);
  const prods = useFetch(() => api('/products?sort=newest'), []);
  return useMemo(() => {
    if (!cats.data) return [];
    const products = (prods.data || []).map(normalizeProduct).sort((a, b) => a.id - b.id);
    return cats.data.map((c) => ({
      slug: c.slug,
      name: { en: c.name_en, am: c.name_am },
      count: Number(c.count),
      image: assetUrl(c.image_url) || IMAGES[c.slug] || DEFAULT_IMAGE,
      products: products.filter((p) => p.category.slug === c.slug),
    }));
  }, [cats.data, prods.data]);
}