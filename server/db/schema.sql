-- server/db/schema.sql
CREATE DATABASE IF NOT EXISTS furniture_store
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE furniture_store;

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(80) NOT NULL UNIQUE,
  name_en VARCHAR(120) NOT NULL,
  name_am VARCHAR(120) NOT NULL
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(60) NOT NULL UNIQUE,
  category_id INT NOT NULL,
  name_en VARCHAR(200) NOT NULL,
  name_am VARCHAR(200) NOT NULL,
  tagline_en VARCHAR(255),
  tagline_am VARCHAR(255),
  description_en TEXT,
  description_am TEXT,
  price DECIMAL(10,2) NOT NULL,
  old_price DECIMAL(10,2) NULL,
  stock INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_products_price (price),
  INDEX idx_products_category (category_id),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE product_variants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  name_am VARCHAR(100) NOT NULL,
  hex_color CHAR(7) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_variants_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  variant_id INT NULL,
  url VARCHAR(500) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_images_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  city VARCHAR(100) NOT NULL,
  address VARCHAR(255) NOT NULL,
  notes VARCHAR(500) NULL,
  payment_method ENUM('telebirr','chapa','cod') NOT NULL DEFAULT 'cod',
  payment_status ENUM('pending','paid','failed') NOT NULL DEFAULT 'pending',
  status ENUM('new','confirmed','shipped','delivered','cancelled') NOT NULL DEFAULT 'new',
  total DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  variant_id INT NULL,
  qty INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  author_name VARCHAR(100) NOT NULL,
  rating_overall TINYINT NOT NULL,
  rating_quality TINYINT NOT NULL,
  rating_comfort TINYINT NOT NULL,
  rating_value TINYINT NOT NULL,
  rating_delivery TINYINT NOT NULL,
  body TEXT NOT NULL,
  is_approved TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reviews_product (product_id, is_approved),
  CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE review_photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  review_id INT NOT NULL,
  url VARCHAR(500) NOT NULL,
  CONSTRAINT fk_rphotos_review FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
);