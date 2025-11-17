-- Add location fields to listings table
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Congo (RDC)';

-- Add location fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS city VARCHAR(100);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_listings_city ON listings(city);
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city);

-- Add comment for documentation
COMMENT ON COLUMN listings.latitude IS 'Latitude coordinate of the listing location';
COMMENT ON COLUMN listings.longitude IS 'Longitude coordinate of the listing location';
COMMENT ON COLUMN listings.city IS 'City where the item is located';
COMMENT ON COLUMN listings.country IS 'Country where the item is located (default: Congo)';
