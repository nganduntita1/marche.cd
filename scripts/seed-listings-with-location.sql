-- Script to add sample listings with location coordinates
-- This will populate the database with listings across different cities in DRC

-- First, let's get some category IDs and user IDs
-- You'll need to replace these with actual IDs from your database

-- Sample listings for Kinshasa (latitude: -4.3217, longitude: 15.3125)
INSERT INTO listings (title, description, category_id, price, images, seller_id, location, latitude, longitude, condition, is_featured, status)
VALUES 
  ('iPhone 13 Pro Max 256GB', 'Excellent condition, barely used. Comes with original box and charger.', 
   (SELECT id FROM categories LIMIT 1), 850, 
   ARRAY['https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800'], 
   (SELECT id FROM users LIMIT 1), 
   'Kinshasa, Gombe', -4.3217, 15.3125, 'like_new', false, 'active'),
   
  ('Samsung 55" 4K Smart TV', 'Brand new in box, never opened. Latest model with HDR support.', 
   (SELECT id FROM categories LIMIT 1), 650, 
   ARRAY['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800'], 
   (SELECT id FROM users LIMIT 1), 
   'Kinshasa, Lemba', -4.3850, 15.3150, 'new', true, 'active'),
   
  ('MacBook Pro 2021 M1', '16GB RAM, 512GB SSD. Perfect for developers and designers.', 
   (SELECT id FROM categories LIMIT 1), 1200, 
   ARRAY['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'], 
   (SELECT id FROM users LIMIT 1), 
   'Kinshasa, Ngaliema', -4.3500, 15.2800, 'good', false, 'active'),
   
  ('Canapé 3 places en cuir', 'Canapé moderne en cuir véritable, très confortable. Couleur marron.', 
   (SELECT id FROM categories LIMIT 1), 450, 
   ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'], 
   (SELECT id FROM users LIMIT 1), 
   'Kinshasa, Kalamu', -4.3400, 15.3300, 'good', false, 'active'),
   
  ('PlayStation 5 + 2 manettes', 'Console PS5 avec 2 manettes et 5 jeux inclus. État impeccable.', 
   (SELECT id FROM categories LIMIT 1), 750, 
   ARRAY['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800'], 
   (SELECT id FROM users LIMIT 1), 
   'Kinshasa, Bandalungwa', -4.3600, 15.2900, 'like_new', true, 'active');

-- Sample listings for Lubumbashi (latitude: -11.6667, longitude: 27.4667)
INSERT INTO listings (title, description, category_id, price, images, seller_id, location, latitude, longitude, condition, is_featured, status)
VALUES 
  ('Toyota RAV4 2019', 'SUV en excellent état, entretien régulier. 45,000 km au compteur.', 
   (SELECT id FROM categories LIMIT 1), 18500, 
   ARRAY['https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800'], 
   (SELECT id FROM users OFFSET 1 LIMIT 1), 
   'Lubumbashi, Kenya', -11.6667, 27.4667, 'good', true, 'active'),
   
  ('Réfrigérateur Samsung 400L', 'Grand réfrigérateur double porte, très économe en énergie.', 
   (SELECT id FROM categories LIMIT 1), 380, 
   ARRAY['https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800'], 
   (SELECT id FROM users OFFSET 1 LIMIT 1), 
   'Lubumbashi, Kampemba', -11.6500, 27.4800, 'like_new', false, 'active'),
   
  ('Vélo VTT professionnel', 'Vélo tout terrain 21 vitesses, cadre aluminium. Parfait état.', 
   (SELECT id FROM categories LIMIT 1), 280, 
   ARRAY['https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800'], 
   (SELECT id FROM users OFFSET 1 LIMIT 1), 
   'Lubumbashi, Katuba', -11.6900, 27.4500, 'good', false, 'active'),
   
  ('Machine à laver LG 8kg', 'Lave-linge automatique, plusieurs programmes. Très bon état.', 
   (SELECT id FROM categories LIMIT 1), 320, 
   ARRAY['https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800'], 
   (SELECT id FROM users OFFSET 1 LIMIT 1), 
   'Lubumbashi, Ruashi', -11.6400, 27.5000, 'good', false, 'active');

-- Sample listings for Kipushi (latitude: -11.7608, longitude: 27.2514)
INSERT INTO listings (title, description, category_id, price, images, seller_id, location, latitude, longitude, condition, is_featured, status)
VALUES 
  ('Générateur Honda 5KVA', 'Générateur silencieux, très fiable. Idéal pour maison ou commerce.', 
   (SELECT id FROM categories LIMIT 1), 850, 
   ARRAY['https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800'], 
   (SELECT id FROM users OFFSET 2 LIMIT 1), 
   'Kipushi, Centre-ville', -11.7608, 27.2514, 'good', false, 'active'),
   
  ('Table à manger + 6 chaises', 'Ensemble de salle à manger en bois massif. Très élégant.', 
   (SELECT id FROM categories LIMIT 1), 420, 
   ARRAY['https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800'], 
   (SELECT id FROM users OFFSET 2 LIMIT 1), 
   'Kipushi', -11.7650, 27.2550, 'good', false, 'active');

-- Sample listings for Goma (latitude: -1.6792, longitude: 29.2228)
INSERT INTO listings (title, description, category_id, price, images, seller_id, location, latitude, longitude, condition, is_featured, status)
VALUES 
  ('Canon EOS R6 + objectif', 'Appareil photo professionnel avec objectif 24-70mm. État neuf.', 
   (SELECT id FROM categories LIMIT 1), 2200, 
   ARRAY['https://images.unsplash.com/photo-1606980707986-7b0c1e7c4b8e?w=800'], 
   (SELECT id FROM users OFFSET 3 LIMIT 1), 
   'Goma, Himbi', -1.6792, 29.2228, 'like_new', true, 'active'),
   
  ('Drone DJI Mavic Air 2', 'Drone avec caméra 4K, portée 10km. Parfait pour vidéos aériennes.', 
   (SELECT id FROM categories LIMIT 1), 950, 
   ARRAY['https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800'], 
   (SELECT id FROM users OFFSET 3 LIMIT 1), 
   'Goma, Mugunga', -1.6900, 29.2100, 'good', false, 'active');

-- Sample listings for Bukavu (latitude: -2.5083, longitude: 28.8608)
INSERT INTO listings (title, description, category_id, price, images, seller_id, location, latitude, longitude, condition, is_featured, status)
VALUES 
  ('Ordinateur portable Dell XPS', 'Intel i7, 16GB RAM, 1TB SSD. Parfait pour travail et gaming.', 
   (SELECT id FROM categories LIMIT 1), 980, 
   ARRAY['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800'], 
   (SELECT id FROM users OFFSET 4 LIMIT 1), 
   'Bukavu, Ibanda', -2.5083, 28.8608, 'good', false, 'active'),
   
  ('Climatiseur Split 12000 BTU', 'Climatiseur inverter, très silencieux et économique.', 
   (SELECT id FROM categories LIMIT 1), 420, 
   ARRAY['https://images.unsplash.com/photo-1631545806609-c2f4e4e6e0e0?w=800'], 
   (SELECT id FROM users OFFSET 4 LIMIT 1), 
   'Bukavu, Kadutu', -2.5200, 28.8700, 'like_new', false, 'active');

-- Sample listings for Kisangani (latitude: 0.5167, longitude: 25.2000)
INSERT INTO listings (title, description, category_id, price, images, seller_id, location, latitude, longitude, condition, is_featured, status)
VALUES 
  ('Moto Yamaha 125cc', 'Moto en très bon état, économique en carburant. Papiers en règle.', 
   (SELECT id FROM categories LIMIT 1), 1200, 
   ARRAY['https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800'], 
   (SELECT id FROM users OFFSET 5 LIMIT 1), 
   'Kisangani, Makiso', 0.5167, 25.2000, 'good', false, 'active'),
   
  ('Imprimante HP LaserJet Pro', 'Imprimante laser couleur, rapide et fiable. Idéale pour bureau.', 
   (SELECT id FROM categories LIMIT 1), 380, 
   ARRAY['https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800'], 
   (SELECT id FROM users OFFSET 5 LIMIT 1), 
   'Kisangani, Tshopo', 0.5300, 25.2100, 'good', false, 'active');

-- Sample listings for Kananga (latitude: -5.8833, longitude: 22.4167)
INSERT INTO listings (title, description, category_id, price, images, seller_id, location, latitude, longitude, condition, is_featured, status)
VALUES 
  ('Lit double avec matelas', 'Lit en bois massif avec matelas orthopédique. Très confortable.', 
   (SELECT id FROM categories LIMIT 1), 350, 
   ARRAY['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800'], 
   (SELECT id FROM users LIMIT 1), 
   'Kananga, Katoka', -5.8833, 22.4167, 'good', false, 'active'),
   
  ('Cuisinière à gaz 4 feux', 'Cuisinière avec four, 4 brûleurs. État impeccable.', 
   (SELECT id FROM categories LIMIT 1), 280, 
   ARRAY['https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=800'], 
   (SELECT id FROM users LIMIT 1), 
   'Kananga, Nganza', -5.8900, 22.4200, 'like_new', false, 'active');

-- Sample listings for Matadi (latitude: -5.8167, longitude: 13.4500)
INSERT INTO listings (title, description, category_id, price, images, seller_id, location, latitude, longitude, condition, is_featured, status)
VALUES 
  ('Groupe électrogène Diesel 10KVA', 'Générateur professionnel, très puissant. Parfait pour entreprise.', 
   (SELECT id FROM categories LIMIT 1), 1800, 
   ARRAY['https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800'], 
   (SELECT id FROM users OFFSET 1 LIMIT 1), 
   'Matadi, Mvuzi', -5.8167, 13.4500, 'good', true, 'active'),
   
  ('Armoire 3 portes', 'Grande armoire en bois avec miroir. Beaucoup de rangement.', 
   (SELECT id FROM categories LIMIT 1), 320, 
   ARRAY['https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800'], 
   (SELECT id FROM users OFFSET 1 LIMIT 1), 
   'Matadi, Nzanza', -5.8200, 13.4600, 'good', false, 'active');

-- Add more listings near Kinshasa for testing radius filtering
INSERT INTO listings (title, description, category_id, price, images, seller_id, location, latitude, longitude, condition, is_featured, status)
VALUES 
  ('iPad Air 2022', 'Tablette Apple avec Apple Pencil. Parfait pour étudiants.', 
   (SELECT id FROM categories LIMIT 1), 580, 
   ARRAY['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800'], 
   (SELECT id FROM users LIMIT 1), 
   'Kinshasa, Kintambo', -4.3100, 15.2900, 'like_new', false, 'active'),
   
  ('Chaussures Nike Air Max', 'Baskets neuves, taille 42. Jamais portées, avec boîte.', 
   (SELECT id FROM categories LIMIT 1), 120, 
   ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'], 
   (SELECT id FROM users LIMIT 1), 
   'Kinshasa, Limete', -4.3700, 15.3400, 'new', false, 'active'),
   
  ('Montre Samsung Galaxy Watch', 'Smartwatch avec GPS et suivi santé. État neuf.', 
   (SELECT id FROM categories LIMIT 1), 280, 
   ARRAY['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800'], 
   (SELECT id FROM users LIMIT 1), 
   'Kinshasa, Masina', -4.4000, 15.3700, 'like_new', false, 'active'),
   
  ('Bureau en bois massif', 'Grand bureau professionnel avec tiroirs. Très solide.', 
   (SELECT id FROM categories LIMIT 1), 380, 
   ARRAY['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800'], 
   (SELECT id FROM users LIMIT 1), 
   'Kinshasa, Kasa-Vubu', -4.3300, 15.3100, 'good', false, 'active');

-- Note: This script assumes you have:
-- 1. At least 6 users in your users table
-- 2. At least 1 category in your categories table
-- 3. The listings table has latitude and longitude columns (from migration 20240119000000)
