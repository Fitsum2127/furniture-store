-- server/db/seed.sql
USE furniture_store;

INSERT INTO categories (slug, name_en, name_am) VALUES
('living-room', 'Living Room', 'ሳሎን'),
('bedroom', 'Bedroom', 'መኝታ ቤት'),
('dining', 'Dining Room', 'የመመገቢያ ክፍል'),
('office', 'Office', 'ቢሮ');

INSERT INTO products (sku, category_id, name_en, name_am, tagline_en, tagline_am, description_en, description_am, price, old_price, stock) VALUES
('BETE-SOFA-3S', 1, 'Abyssinia 3-Seater Sofa', 'አቢሲኒያ ባለ3 መቀመጫ ሶፋ',
 'Solid mahogany frame. Built for generations.', 'ጠንካራ የማሆጋኒ ፍሬም። ለትውልድ የተሠራ።',
 'A hand-finished three-seater with a kiln-dried solid mahogany frame and high-density foam.',
 'በእጅ የተጠናቀቀ ባለ3 መቀመጫ ሶፋ፤ በደረቀ ጠንካራ የማሆጋኒ ፍሬም እና ከፍተኛ ጥግግት ባለው ስፖንጅ የተሠራ።',
 48500.00, 56000.00, 12);

INSERT INTO product_variants (product_id, name_en, name_am, hex_color, stock) VALUES
(1, 'Warm Beige', 'ሞቅ ያለ ቤዥ', '#d2b48c', 5),
(1, 'Olive Green', 'የወይራ አረንጓዴ', '#6b7a4f', 4),
(1, 'Charcoal', 'ጥቁር ግራጫ', '#3f3f46', 3);

INSERT INTO product_images (product_id, variant_id, url, sort_order) VALUES
(1, 1, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80', 0),
(1, 1, 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80', 1),
(1, 2, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80', 0),
(1, 3, 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=1200&q=80', 0);

INSERT INTO reviews (product_id, author_name, rating_overall, rating_quality, rating_comfort, rating_value, rating_delivery, body, is_approved) VALUES
(1, 'Selam T.', 5, 5, 5, 4, 5, 'The wood feels very solid and the fabric is soft. Delivery and assembly were on time.', 1),
(1, 'Dawit M.', 5, 5, 4, 5, 5, 'Better than the showroom pictures. My whole family uses it every day.', 1);