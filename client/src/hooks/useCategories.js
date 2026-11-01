import { useMemo } from 'react';
import useFetch from './useFetch.js';
import { api } from '../lib/api.js';

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=400&q=70`;

// A picture for each section. Add a line here if you create a new category.
const IMAGES = {
  'living-room': img('photo-1555041469-a586c61ea9bc'),
  bedroom: img('photo-1505693416388-ac5ce068fe85'),
  dining: img('photo-1556228453-efd6c1ff04f6'),
  office: img('photo-1518455027359-f3f8164ba6bd'),
  'wall-decor': img('photo-1524758631624-e2822e304c36'),
  lighting: img('photo-1513694203232-719a280e022f'),
  'home-decor': img('photo-1485955900006-10f4d324d411'),
};
const DEFAULT_IMAGE = img('photo-1616486338812-3dadae4b4ace');

// Used only if the server is not running.
const FALLBACK = [
  { slug: 'living-room', name: { en: 'Living Room', am: 'ሳሎን' } },
  { slug: 'bedroom', name: { en: 'Bedroom', am: 'መኝታ ቤት' } },
  { slug: 'dining', name: { en: 'Dining Room', am: 'የመመገቢያ ክፍል' } },
  { slug: 'office', name: { en: 'Office', am: 'ቢሮ' } },
  { slug: 'wall-decor', name: { en: 'Wall Decor', am: 'የግድግዳ ማስዋቢያ' } },
  { slug: 'lighting', name: { en: 'Lighting', am: 'መብራት' } },
  { slug: 'home-decor', name: { en: 'Home Decor', am: 'የቤት ማስዋቢያ' } },
].map((c) => ({ ...c, count: null, image: IMAGES[c.slug] || DEFAULT_IMAGE }));

export default function useCategories() {
  const { data } = useFetch(() => api('/categories'), []);
  return useMemo(() => {
    if (!data || data.length === 0) return FALLBACK;
    return data.map((c) => ({
      slug: c.slug,
      name: { en: c.name_en, am: c.name_am },
      count: Number(c.count),
      image: IMAGES[c.slug] || DEFAULT_IMAGE,
    }));
  }, [data]);
}