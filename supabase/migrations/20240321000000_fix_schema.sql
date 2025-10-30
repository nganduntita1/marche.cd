-- Reset existing schema
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can create own profile" ON users;
DROP POLICY IF EXISTS "Public can view seller profiles" ON users;
DROP POLICY IF EXISTS "Anyone can read categories" ON categories;
DROP POLICY IF EXISTS "Anyone can view active listings" ON listings;
DROP POLICY IF EXISTS "Authenticated users can create listings" ON listings;
DROP POLICY IF EXISTS "Sellers can update own listings" ON listings;
DROP POLICY IF EXISTS "Sellers can delete own listings" ON listings;

-- Recreate tables with proper constraints
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  email text NOT NULL,
  location text,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  icon text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

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
  status text CHECK (status IN ('pending', 'active', 'sold', 'removed')) DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Enable read access for all users"
  ON users FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable insert for authenticated users only"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Category policies
CREATE POLICY "Enable read access for all users"
  ON categories FOR SELECT
  TO public
  USING (true);

-- Listing policies
CREATE POLICY "Enable read access for all active listings"
  ON listings FOR SELECT
  TO public
  USING (status = 'active' OR auth.uid() = seller_id);

CREATE POLICY "Enable insert for authenticated users only"
  ON listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Enable update for users based on seller_id"
  ON listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Enable delete for users based on seller_id"
  ON listings FOR DELETE
  TO authenticated
  USING (auth.uid() = seller_id);

-- Insert default categories if they don't exist
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

-- Create or replace the updated_at trigger function
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_category_id ON listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);