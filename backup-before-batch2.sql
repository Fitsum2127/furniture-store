-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: furniture_store
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `about_sections`
--

DROP TABLE IF EXISTS `about_sections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `about_sections` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title_en` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title_am` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `body_en` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `body_am` text COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_about_order` (`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `about_sections`
--

LOCK TABLES `about_sections` WRITE;
/*!40000 ALTER TABLE `about_sections` DISABLE KEYS */;
INSERT INTO `about_sections` VALUES (1,'Our Story','ታሪካችን','Bete Furniture started with a simple idea: every home deserves furniture that is strong, beautiful and fairly priced.\nWe design and build our pieces in Ethiopia, and we choose every material ourselves.','ቤቴ ፈርኒቸር የጀመረው በቀላል ሃሳብ ነው፤ እያንዳንዱ ቤት ጠንካራ፣ ውብና ተመጣጣኝ ዋጋ ያለው የቤት ዕቃ ይገባዋል።\nዕቃዎቻችንን በኢትዮጵያ እንሠራለን፤ እያንዳንዱን ቁሳቁስም ራሳችን እንመርጣለን።','https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=80',1,1,'2026-11-01 13:10:55'),(2,'Craftsmanship and Materials','የእጅ ጥበብና ቁሳቁስ','Our frames are made of kiln-dried solid wood so they do not warp or crack.\r\nJoints are fitted by hand, every edge is sanded smooth, and each piece is sealed with a durable finish.','ፍሬሞቻችን በምድጃ ከደረቀ ጠንካራ እንጨት የተሠሩ ናቸው፤ ስለዚህ አይጣመሙም አይሰነጠቁምም።\r\nመገጣጠሚያዎች በእጅ ይገጠማሉ፣ እያንዳንዱ ጠርዝ ተፈጭቶ ይለሰልሳል፣ እያንዳንዱ ዕቃም በጠንካራ ሽፋን ይታሸጋል።','https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=1400&q=80',0,1,'2026-11-01 13:10:55'),(3,'Our Promise','ቃላችን','Free delivery inside the city and free assembly in your room.\nA 5-year warranty on wood frames and easy returns within 7 days if the item is unused.','በከተማ ውስጥ ነፃ ማድረስና በክፍልዎ ውስጥ ነፃ ገጠማ።\nለእንጨት ፍሬም የ5 ዓመት ዋስትና፤ ዕቃው ካልተጠቀሙበት በ7 ቀናት ውስጥ ቀላል መመለስ።',NULL,2,1,'2026-11-01 13:10:55'),(4,'Visit Our Showroom','ሾውሩማችንን ይጎብኙ','Come and sit on the sofas, feel the fabrics and see the finish in real light.\nOur team is happy to help you plan your room.','መጥተው ሶፋዎቹ ላይ ይቀመጡ፣ ጨርቆቹን ይዳስሱ፣ አጨራረሱንም በእውነተኛ ብርሃን ይመልከቱ።\nቡድናችን ክፍልዎን ለማቀድ በደስታ ይረዳዎታል።','https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=80',3,1,'2026-11-01 13:10:55');
/*!40000 ALTER TABLE `about_sections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(190) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'Owner','fitse@gmail.com','$2b$12$CFTWHKYlaWpEw/A9T0uLsuxn/pKE4SJoMZkl55Qa66NA6mRglNfGe','2026-10-31 11:34:56');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `slug` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_en` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_am` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'living-room','Living Room','ሳሎን'),(2,'bedroom','Bedroom','መኝታ ቤት'),(3,'dining','Dining Room','የመመገቢያ ክፍል'),(4,'office','Office','ቢሮ'),(5,'wall-decor','Wall Decor','የግድግዳ ማስዋቢያ'),(6,'lighting','Lighting','መብራት'),(7,'home-decor','Home Decor','የቤት ማስዋቢያ');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(190) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('new','replied','closed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'new',
  `reply_text` text COLLATE utf8mb4_unicode_ci,
  `replied_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_messages_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,'Fasilo Neguse','0990206505','negusefasilo@gmail.com','Hi edete nachu','replied','yemesegen men eneredote','2026-10-31 11:55:58','2026-10-31 11:55:11');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `variant_id` int DEFAULT NULL,
  `qty` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_items_order` (`order_id`),
  KEY `fk_items_product` (`product_id`),
  CONSTRAINT `fk_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,9,NULL,1,18900.00),(2,2,9,NULL,2,18900.00),(3,3,6,NULL,26,499.00),(4,3,8,NULL,1,52000.00);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_method` enum('telebirr','chapa','cod') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'cod',
  `payment_status` enum('pending','paid','failed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `status` enum('new','confirmed','shipped','delivered','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'new',
  `total` decimal(12,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'Fasilo Neguse','0990206505','Hawassa','shelle',NULL,'telebirr','pending','new',18900.00,'2026-10-31 11:49:00'),(2,'Fitsum Erbaye','+251941251301','Hawassa','shell','dlfllflflfllffll','cod','pending','new',37800.00,'2026-10-31 13:58:57'),(3,'Fitsum Erbaye','+251941251301','Hawassa','shell',NULL,'telebirr','pending','confirmed',64974.00,'2026-11-01 17:07:25');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `variant_id` int DEFAULT NULL,
  `url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_images_product` (`product_id`),
  KEY `fk_images_variant` (`variant_id`),
  CONSTRAINT `fk_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_images_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (1,1,1,'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',0),(2,1,1,'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80',1),(3,1,2,'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',0),(4,1,3,'https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=1200&q=80',0),(5,2,NULL,'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1000&q=80',0),(6,2,NULL,'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80',1),(7,3,NULL,'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1000&q=80',0),(8,3,NULL,'https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=1000&q=80',1),(9,4,NULL,'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1000&q=80',0),(10,4,NULL,'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',1),(11,5,NULL,'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1000&q=80',0),(12,5,NULL,'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80',1),(13,6,NULL,'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1000&q=80',0),(14,6,NULL,'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80',1),(15,7,NULL,'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80',0),(16,7,NULL,'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',1),(17,8,NULL,'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=1000&q=80',0),(18,8,NULL,'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',1),(19,9,NULL,'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1000&q=80',0),(20,9,NULL,'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1000&q=80',1),(21,10,NULL,'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',0),(22,10,NULL,'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1000&q=80',1),(23,11,NULL,'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80',0),(24,11,NULL,'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1000&q=80',1);
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variants`
--

DROP TABLE IF EXISTS `product_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `name_en` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_am` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hex_color` char(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_variants_product` (`product_id`),
  CONSTRAINT `fk_variants_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variants`
--

LOCK TABLES `product_variants` WRITE;
/*!40000 ALTER TABLE `product_variants` DISABLE KEYS */;
INSERT INTO `product_variants` VALUES (1,1,'Warm Beige','ሞቅ ያለ ቤዥ','#d2b48c',5),(2,1,'Olive Green','የወይራ አረንጓዴ','#6b7a4f',4),(3,1,'Charcoal','ጥቁር ግራጫ','#3f3f46',3);
/*!40000 ALTER TABLE `product_variants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sku` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` int NOT NULL,
  `name_en` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_am` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tagline_en` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tagline_am` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description_en` text COLLATE utf8mb4_unicode_ci,
  `description_am` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) NOT NULL,
  `old_price` decimal(10,2) DEFAULT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `idx_products_price` (`price`),
  KEY `idx_products_category` (`category_id`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'BETE-SOFA-3S',1,'Abyssinia 3-Seater Sofa','አቢሲኒያ ባለ3 መቀመጫ ሶፋ','Solid mahogany frame. Built for generations.','ጠንካራ የማሆጋኒ ፍሬም። ለትውልድ የተሠራ።','A hand-finished three-seater with a kiln-dried solid mahogany frame and high-density foam.','በእጅ የተጠናቀቀ ባለ3 መቀመጫ ሶፋ፤ በደረቀ ጠንካራ የማሆጋኒ ፍሬም እና ከፍተኛ ጥግግት ባለው ስፖንጅ የተሠራ።',48500.00,56000.00,12,1,'2026-10-30 06:37:06'),(2,'BETE-VASE-CER',7,'Ceramic Vase','ሴራሚክ የአበባ ማስቀመጫ','Hand-glazed and timeless.','በእጅ የተለሰነ፣ ጊዜ የማይሽረው።','A hand-glazed ceramic vase with a soft matte finish. Beautiful with dried grasses or on its own.','ለስላሳ ማት አጨራረስ ያለው በእጅ የተለሰነ ሴራሚክ የአበባ ማስቀመጫ። ከደረቁ ሣሮች ጋርም ሆነ ብቻውን ያምራል።',899.00,NULL,40,1,'2026-10-31 10:52:52'),(3,'BETE-CUSH-DEC',7,'Decorative Cushion','ጌጣጌጥ ትራስ','Soft texture for your sofa.','ለሶፋዎ ለስላሳ ሸካራነት።','A woven decorative cushion with a soft feel and a hidden zip. The cover can be washed.','ለስላሳ ስሜት እና የተደበቀ ዚፕ ያለው የተሸመነ ጌጣጌጥ ትራስ። ሽፋኑ ሊታጠብ ይችላል።',599.00,750.00,60,1,'2026-10-31 10:52:52'),(4,'BETE-LAMP-TBL',6,'Table Lamp','የጠረጴዛ መብራት','Warm light for calm evenings.','ለተረጋጉ ምሽቶች ሞቅ ያለ ብርሃን።','A ceramic-base table lamp with a linen shade that gives a warm, even glow.','የሴራሚክ መሠረት እና የሊነን ሻዴ ያለው የጠረጴዛ መብራት፤ ሞቅ ያለ እኩል ብርሃን ይሰጣል።',1299.00,NULL,25,1,'2026-10-31 10:52:52'),(5,'BETE-ART-FRM',5,'Wall Art Frame','የግድግዳ ጥበብ ፍሬም','Botanical art in a wooden frame.','በእንጨት ፍሬም ውስጥ የተክል ጥበብ።','A botanical print in a natural wood frame, ready to hang.','በተፈጥሯዊ የእንጨት ፍሬም ውስጥ ያለ የተክል ሥዕል፤ ለመስቀል ዝግጁ።',799.00,NULL,35,1,'2026-10-31 10:52:52'),(6,'BETE-PLANT-IND',7,'Indoor Plant','የቤት ውስጥ ተክል','Fresh green for any room.','ለማንኛውም ክፍል ትኩስ አረንጓዴ።','A hardy indoor plant in a decorative pot. Easy to care for and good in bright indirect light.','በጌጣጌጥ ማሰሮ ውስጥ ያለ ጠንካራ የቤት ውስጥ ተክል። ለመንከባከብ ቀላል፤ ቀጥታ ያልሆነ ደማቅ ብርሃን ይወዳል።',499.00,NULL,24,1,'2026-10-31 10:52:52'),(7,'BETE-BED-QN',2,'Queen Bed Frame','ባለ ንግሥት አልጋ ፍሬም','Solid wood. Quiet and sturdy.','ጠንካራ እንጨት። ጸጥ ያለና የጸና።','A queen-size solid wood bed frame with a padded headboard and strong slats.','ጠንካራ የእንጨት ባለ ንግሥት መጠን አልጋ ፍሬም፤ የተለሰለሰ የራስጌ እና ጠንካራ ሳንቃዎች ያሉት።',36500.00,41000.00,8,1,'2026-10-31 10:52:52'),(8,'BETE-DINE-6',3,'Six-Seater Dining Set','ባለ6 መቀመጫ የመመገቢያ ስብስብ','Table and six chairs for family meals.','ለቤተሰብ ምግብ ጠረጴዛና ስድስት ወንበሮች።','A solid wood dining table with six upholstered chairs. Seats the whole family comfortably.','ጠንካራ የእንጨት የመመገቢያ ጠረጴዛ ከስድስት የተሸፈኑ ወንበሮች ጋር። መላው ቤተሰብ በምቾት ይቀመጥበታል።',52000.00,NULL,4,1,'2026-10-31 10:52:52'),(9,'BETE-DESK-OF',4,'Executive Office Desk','የቢሮ ጠረጴዛ','A calm, organized workspace.','የተረጋጋና የተደራጀ የሥራ ቦታ።','A spacious office desk with three drawers and cable management.','ሦስት መሳቢያዎችና የገመድ ማስተናገጃ ያለው ሰፊ የቢሮ ጠረጴዛ።',18900.00,NULL,7,1,'2026-10-31 10:52:52'),(10,'BETE-PEND-LT',6,'Pendant Light Trio','የተንጠልጣይ መብራት ሦስትዮሽ','Three woven pendants for dining spaces.','ለመመገቢያ ቦታ ሦስት የተሸመኑ መብራቶች።','A set of three woven pendant lights that cast a soft, warm pattern over your table.','ሦስት የተሸመኑ ተንጠልጣይ መብራቶች፤ በጠረጴዛዎ ላይ ለስላሳ ሞቅ ያለ ንድፍ ያበራሉ።',2450.00,NULL,15,1,'2026-10-31 10:52:52'),(11,'BETE-MIRR-RND',5,'Round Wall Mirror','ክብ የግድግዳ መስተዋት','Brings light into any corner.','ወደ ማንኛውም ጥግ ብርሃን ያመጣል።','A round wall mirror with a slim natural wood frame.','ቀጭን የተፈጥሮ እንጨት ፍሬም ያለው ክብ የግድግዳ መስተዋት።',3200.00,3800.00,12,0,'2026-10-31 10:52:52');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `review_photos`
--

DROP TABLE IF EXISTS `review_photos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review_photos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `review_id` int NOT NULL,
  `url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_rphotos_review` (`review_id`),
  CONSTRAINT `fk_rphotos_review` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `review_photos`
--

LOCK TABLES `review_photos` WRITE;
/*!40000 ALTER TABLE `review_photos` DISABLE KEYS */;
INSERT INTO `review_photos` VALUES (1,6,'/uploads/97887352-3cc4-49da-972e-30f6baf9f017.jpg');
/*!40000 ALTER TABLE `review_photos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `author_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating_overall` tinyint NOT NULL,
  `rating_quality` tinyint NOT NULL,
  `rating_comfort` tinyint NOT NULL,
  `rating_value` tinyint NOT NULL,
  `rating_delivery` tinyint NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_approved` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reviews_product` (`product_id`,`is_approved`),
  CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,1,'Selam T.',5,5,5,4,5,'The wood feels very solid and the fabric is soft. Delivery and assembly were on time.',0,'2026-10-30 06:37:07'),(2,1,'Dawit M.',5,5,4,5,5,'Better than the showroom pictures. My whole family uses it every day.',0,'2026-10-30 06:37:07'),(3,8,'Fasilo Neguse',5,5,5,5,5,'የአሠራር ጥራት 5.0',1,'2026-10-31 11:59:21'),(4,8,'Fasilo Neguse',5,5,5,5,5,'ለዋጋው የሚገባ 3.0',1,'2026-10-31 11:59:57'),(5,5,'fitse',2,1,3,1,4,'edezeh rate aderegeyalew',1,'2026-11-01 16:51:00'),(6,10,'abebe',3,3,1,4,2,'kmkkp;\'kkkkkkkkkkk',0,'2026-11-02 06:53:30');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscribers`
--

DROP TABLE IF EXISTS `subscribers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscribers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(190) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscribers`
--

LOCK TABLES `subscribers` WRITE;
/*!40000 ALTER TABLE `subscribers` DISABLE KEYS */;
INSERT INTO `subscribers` VALUES (1,'negusefasilo@gmail.com','2026-10-31 11:20:55');
/*!40000 ALTER TABLE `subscribers` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-03  8:50:51
