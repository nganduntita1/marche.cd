-- Migration: Seller Features (Promoted Listings, Analytics, Categories)
-- Created: 2024-01-20

-- ============================================================================
-- 1. PROMOTED LISTINGS
-- ============================================================================

-- Add promotion fields to listings table
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS is_promoted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS promoted_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS promotion_credits_spent INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- Create index for promoted listings
CREATE INDEX IF NOT EXISTS idx_listings_promoted 
ON listings(is_promoted, promoted_until) 
WHERE is_promoted = TRUE;

-- ============================================================================
-- 2. LISTING VIEWS TRACKING
-- ============================================================================

-- Create views table to track listing impressions
CREATE TABLE IF NOT EXISTS listing_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- Create indexes for views
CREATE INDEX IF NOT EXISTS idx_listing_views_listing 
ON listing_views(listing_id, viewed_at DESC);

CREATE INDEX IF NOT EXISTS idx_listing_views_viewer 
ON listing_views(viewer_id, viewed_at DESC);

-- ============================================================================
-- 3. LISTING STATISTICS
-- ============================================================================

-- Create listing stats table for aggregated data
CREATE TABLE IF NOT EXISTS listing_stats (
  listing_id UUID PRIMARY KEY REFERENCES listings(id) ON DELETE CASCADE,
  total_views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  total_favorites INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. ENHANCED CATEGORIES
-- ============================================================================

-- Add additional fields to categories
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS icon_url TEXT,
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS listing_count INTEGER DEFAULT 0;

-- Create index for category hierarchy
CREATE INDEX IF NOT EXISTS idx_categories_parent 
ON categories(parent_id);

-- ============================================================================
-- 5. PROMOTION TRANSACTIONS
-- ============================================================================

-- Create table to track promotion purchases
CREATE TABLE IF NOT EXISTS promotion_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  credits_spent INTEGER NOT NULL,
  duration_days INTEGER NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for promotion transactions
CREATE INDEX IF NOT EXISTS idx_promotion_transactions_listing 
ON promotion_transactions(listing_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_promotion_transactions_user 
ON promotion_transactions(user_id, created_at DESC);

-- ============================================================================
-- 6. FUNCTIONS
-- ============================================================================

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_listing_views(
  p_listing_id UUID,
  p_viewer_id UUID DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Insert view record
  INSERT INTO listing_views (listing_id, viewer_id, ip_address, user_agent)
  VALUES (p_listing_id, p_viewer_id, p_ip_address, p_user_agent);
  
  -- Update listing views count
  UPDATE listings
  SET views_count = views_count + 1
  WHERE id = p_listing_id;
  
  -- Update or insert listing stats
  INSERT INTO listing_stats (listing_id, total_views, unique_views, last_viewed_at)
  VALUES (p_listing_id, 1, 1, NOW())
  ON CONFLICT (listing_id) DO UPDATE
  SET 
    total_views = listing_stats.total_views + 1,
    unique_views = CASE 
      WHEN p_viewer_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM listing_views 
        WHERE listing_id = p_listing_id 
        AND viewer_id = p_viewer_id 
        AND viewed_at < NOW() - INTERVAL '1 day'
      ) THEN listing_stats.unique_views + 1
      ELSE listing_stats.unique_views
    END,
    last_viewed_at = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to promote a listing
CREATE OR REPLACE FUNCTION promote_listing(
  p_listing_id UUID,
  p_user_id UUID,
  p_duration_days INTEGER,
  p_credits_cost INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_credits INTEGER;
  v_starts_at TIMESTAMP WITH TIME ZONE;
  v_ends_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Check user has enough credits
  SELECT credits INTO v_user_credits
  FROM users
  WHERE id = p_user_id;
  
  IF v_user_credits < p_credits_cost THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;
  
  -- Calculate promotion period
  v_starts_at := NOW();
  v_ends_at := NOW() + (p_duration_days || ' days')::INTERVAL;
  
  -- Deduct credits from user
  UPDATE users
  SET credits = credits - p_credits_cost
  WHERE id = p_user_id;
  
  -- Update listing
  UPDATE listings
  SET 
    is_promoted = TRUE,
    promoted_until = v_ends_at,
    promotion_credits_spent = promotion_credits_spent + p_credits_cost
  WHERE id = p_listing_id;
  
  -- Record transaction
  INSERT INTO promotion_transactions (
    listing_id, user_id, credits_spent, duration_days, starts_at, ends_at
  ) VALUES (
    p_listing_id, p_user_id, p_credits_cost, p_duration_days, v_starts_at, v_ends_at
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to update category listing counts
CREATE OR REPLACE FUNCTION update_category_counts()
RETURNS VOID AS $$
BEGIN
  UPDATE categories
  SET listing_count = (
    SELECT COUNT(*)
    FROM listings
    WHERE category_id = categories.id
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. TRIGGERS
-- ============================================================================

-- Trigger to expire promotions
CREATE OR REPLACE FUNCTION expire_promotions()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_promoted = TRUE AND NEW.promoted_until < NOW() THEN
    NEW.is_promoted := FALSE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_expire_promotions
BEFORE UPDATE ON listings
FOR EACH ROW
EXECUTE FUNCTION expire_promotions();

-- ============================================================================
-- 8. ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE listing_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for listing_views
CREATE POLICY "Anyone can insert views"
ON listing_views FOR INSERT
TO authenticated, anon
WITH CHECK (true);

CREATE POLICY "Users can view their own view history"
ON listing_views FOR SELECT
TO authenticated
USING (viewer_id = auth.uid());

CREATE POLICY "Listing owners can view their listing views"
ON listing_views FOR SELECT
TO authenticated
USING (
  listing_id IN (
    SELECT id FROM listings WHERE seller_id = auth.uid()
  )
);

-- Policies for listing_stats
CREATE POLICY "Anyone can view listing stats"
ON listing_stats FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "System can update listing stats"
ON listing_stats FOR ALL
TO authenticated
USING (true);

-- Policies for promotion_transactions
CREATE POLICY "Users can view their own promotion transactions"
ON promotion_transactions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create promotion transactions"
ON promotion_transactions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- 9. INITIAL DATA
-- ============================================================================

-- Update existing categories with icons (using emoji for now)
UPDATE categories SET icon = '📱' WHERE slug = 'electronics';
UPDATE categories SET icon = '🏠' WHERE slug = 'home';
UPDATE categories SET icon = '👕' WHERE slug = 'fashion';
UPDATE categories SET icon = '🚗' WHERE slug = 'vehicles';
UPDATE categories SET icon = '📚' WHERE slug = 'books';

-- Initialize listing stats for existing listings
INSERT INTO listing_stats (listing_id, total_views, unique_views)
SELECT id, 0, 0
FROM listings
ON CONFLICT (listing_id) DO NOTHING;

-- ============================================================================
-- COMPLETE
-- ============================================================================

-- Run initial category count update
SELECT update_category_counts();

COMMENT ON TABLE listing_views IS 'Tracks individual views of listings for analytics';
COMMENT ON TABLE listing_stats IS 'Aggregated statistics for each listing';
COMMENT ON TABLE promotion_transactions IS 'History of listing promotions purchased';
COMMENT ON FUNCTION increment_listing_views IS 'Increments view count and updates stats';
COMMENT ON FUNCTION promote_listing IS 'Promotes a listing using user credits';
COMMENT ON FUNCTION update_category_counts IS 'Updates listing counts for all categories';
