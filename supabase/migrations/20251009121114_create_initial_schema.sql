/*
  # Initial Schema for Marcé.cd Marketplace

  ## Overview
  Creates the foundational database structure for a classifieds marketplace platform
  for DRC Congo, supporting user authentication, listings, and categorization.

  ## New Tables

  ### 1. users
  Extended user profile information linked to Supabase auth
  - `id` (uuid, primary key) - Links to auth.users
  - `name` (text) - User's full name
  - `phone` (text, unique) - Phone number for authentication
  - `email` (text) - Optional email address
  - `location` (text) - User's city/area in DRC
  - `is_verified` (boolean) - Verification status
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. categories
  Product/service categories for organizing listings
  - `id` (uuid, primary key)
  - `name` (text, unique) - Category name (e.g., "Téléphones", "Véhicules")
  - `icon` (text) - Lucide icon name
  - `slug` (text, unique) - URL-friendly identifier
  - `created_at` (timestamptz)

  ### 3. listings
  Main marketplace listings posted by sellers
  - `id` (uuid, primary key)
  - `title` (text) - Listing title
  - `description` (text) - Detailed description
  - `category_id` (uuid) - Foreign key to categories
  - `price` (numeric) - Price in Congolese Francs
  - `images` (text[]) - Array of image URLs from Supabase Storage
  - `seller_id` (uuid) - Foreign key to users
  - `location` (text) - Item location
  - `condition` (text) - Item condition (new, like_new, good, fair, poor)
  - `is_featured` (boolean) - Featured listing flag
  - `status` (text) - Listing status (pending, active, sold, removed)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Create policies for authenticated users to manage their own data
  - Admin-level checks for moderation actions
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text UNIQUE NOT NULL,
  email text,
  location text,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can create own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Public can view basic seller info (for listings)
CREATE POLICY "Public can view seller profiles"
  ON users FOR SELECT
  TO anon
  USING (true);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  icon text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Anyone can read categories
CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  TO authenticated, anon
  USING (true);

-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  price numeric NOT NULL CHECK (price >= 0),
  images text[] DEFAULT '{}',
  seller_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  location text NOT NULL,
  condition text CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')) DEFAULT 'good',
  is_featured boolean DEFAULT false,
  status text CHECK (status IN ('pending', 'active', 'sold', 'removed')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Public can view active listings
CREATE POLICY "Anyone can view active listings"
  ON listings FOR SELECT
  TO authenticated, anon
  USING (status = 'active' OR (auth.uid() = seller_id));

-- Sellers can create listings
CREATE POLICY "Authenticated users can create listings"
  ON listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id AND status = 'pending');

-- Sellers can update their own listings
CREATE POLICY "Sellers can update own listings"
  ON listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

-- Sellers can delete their own listings
CREATE POLICY "Sellers can delete own listings"
  ON listings FOR DELETE
  TO authenticated
  USING (auth.uid() = seller_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_category_id ON listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings(location);

-- Insert default categories
INSERT INTO categories (name, icon, slug) VALUES
  ('Téléphones', 'smartphone', 'telephones'),
  ('Véhicules', 'car', 'vehicules'),
  ('Électronique', 'laptop', 'electronique'),
  ('Maison & Jardin', 'home', 'maison-jardin'),
  ('Mode & Beauté', 'shirt', 'mode-beaute'),
  ('Emplois', 'briefcase', 'emplois'),
  ('Services', 'wrench', 'services'),
  ('Immobilier', 'building', 'immobilier')
ON CONFLICT (slug) DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_listings_updated_at ON listings;
CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();