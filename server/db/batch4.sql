USE furniture_store;

CREATE TABLE IF NOT EXISTS about_sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title_en VARCHAR(200) NOT NULL,
  title_am VARCHAR(200) NULL,
  body_en TEXT NOT NULL,
  body_am TEXT NULL,
  image_url VARCHAR(500) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_about_order (sort_order)
);

INSERT INTO about_sections (title_en, title_am, body_en, body_am, image_url, sort_order) VALUES
('Our Story', 'ታሪካችን',
 'fitse Furniture started with a simple idea: every home deserves furniture that is strong, beautiful and fairly priced.\nWe design and build our pieces in Ethiopia, and we choose every material ourselves.',
 'ቤቴ ፈርኒቸር የጀመረው በቀላል ሃሳብ ነው፤ እያንዳንዱ ቤት ጠንካራ፣ ውብና ተመጣጣኝ ዋጋ ያለው የቤት ዕቃ ይገባዋል።\nዕቃዎቻችንን በኢትዮጵያ እንሠራለን፤ እያንዳንዱን ቁሳቁስም ራሳችን እንመርጣለን።',
 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=80', 0),
('Craftsmanship and Materials', 'የእጅ ጥበብና ቁሳቁስ',
 'Our frames are made of kiln-dried solid wood so they do not warp or crack.\nJoints are fitted by hand, every edge is sanded smooth, and each piece is sealed with a durable finish.',
 'ፍሬሞቻችን በምድጃ ከደረቀ ጠንካራ እንጨት የተሠሩ ናቸው፤ ስለዚህ አይጣመሙም አይሰነጠቁምም።\nመገጣጠሚያዎች በእጅ ይገጠማሉ፣ እያንዳንዱ ጠርዝ ተፈጭቶ ይለሰልሳል፣ እያንዳንዱ ዕቃም በጠንካራ ሽፋን ይታሸጋል።',
 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=1400&q=80', 1),
('Our Promise', 'ቃላችን',
 'Free delivery inside the city and free assembly in your room.\nA 5-year warranty on wood frames and not within 7 days if the item is unused.',
 'በከተማ ውስጥ ነፃ ማድረስና በክፍልዎ ውስጥ ነፃ ገጠማ።\nለእንጨት ፍሬም የ5 ዓመት ዋስትና፤ ዕቃው ካልተጠቀሙበት በ7 ቀናት ውስጥ ቀላል መመለስ።',
 NULL, 2),
('Visit Our Showroom', 'ሾውሩማችንን ይጎብኙ',
 'Come and sit on the sofas, feel the fabrics and see the finish in real light.\nOur team is happy to help you plan your room.',
 'መጥተው ሶፋዎቹ ላይ ይቀመጡ፣ ጨርቆቹን ይዳስሱ፣ አጨራረሱንም በእውነተኛ ብርሃን ይመልከቱ።\nቡድናችን ክፍልዎን ለማቀድ በደስታ ይረዳዎታል።',
 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=80', 3);