-- Migration: Reviews & Ratings System
-- Created: 2024-01-21

-- ============================================================================
-- 1. TRANSACTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending_rating' CHECK (status IN ('pending_rating', 'completed', 'cancelled')),
  seller_rated BOOLEAN DEFAULT FALSE,
  buyer_rated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(listing_id, buyer_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON transactions(seller_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_listing ON transactions(listing_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status) WHERE status = 'pending_rating';

-- ============================================================================
-- 2. REVIEWS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(transaction_id, reviewer_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews(reviewee_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON reviews(reviewer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_transaction ON reviews(transaction_id);
CREATE INDEX IF NOT EXISTS idx_reviews_listing ON reviews(listing_id);

-- ============================================================================
-- 3. NOTIFICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('rating_request', 'rating_received', 'transaction_completed', 'listing_sold')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read) WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(user_id, type);

-- ============================================================================
-- 4. USER RATING STATS (Add to users table)
-- ============================================================================

ALTER TABLE users
ADD COLUMN IF NOT EXISTS rating_average DECIMAL(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reviews_as_seller INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reviews_as_buyer INTEGER DEFAULT 0;

-- ============================================================================
-- 5. FUNCTIONS
-- ============================================================================

-- Function to create transaction and notifications
CREATE OR REPLACE FUNCTION create_transaction_with_notifications(
  p_listing_id UUID,
  p_seller_id UUID,
  p_buyer_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_transaction_id UUID;
  v_listing_title TEXT;
BEGIN
  -- Get listing title
  SELECT title INTO v_listing_title FROM listings WHERE id = p_listing_id;
  
  -- Create transaction
  INSERT INTO transactions (listing_id, seller_id, buyer_id)
  VALUES (p_listing_id, p_seller_id, p_buyer_id)
  RETURNING id INTO v_transaction_id;
  
  -- Create notification for seller
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    p_seller_id,
    'rating_request',
    'Évaluez votre acheteur',
    'Évaluez votre expérience avec l''acheteur de "' || v_listing_title || '"',
    jsonb_build_object('transaction_id', v_transaction_id, 'listing_id', p_listing_id)
  );
  
  -- Create notification for buyer
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    p_buyer_id,
    'rating_request',
    'Évaluez votre vendeur',
    'Évaluez votre expérience avec le vendeur de "' || v_listing_title || '"',
    jsonb_build_object('transaction_id', v_transaction_id, 'listing_id', p_listing_id)
  );
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- Function to submit review
CREATE OR REPLACE FUNCTION submit_review(
  p_transaction_id UUID,
  p_reviewer_id UUID,
  p_reviewee_id UUID,
  p_listing_id UUID,
  p_rating INTEGER,
  p_comment TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_seller BOOLEAN;
  v_transaction_status TEXT;
BEGIN
  -- Check if reviewer is seller or buyer
  SELECT 
    seller_id = p_reviewer_id,
    status
  INTO v_is_seller, v_transaction_status
  FROM transactions
  WHERE id = p_transaction_id;
  
  -- Insert review
  INSERT INTO reviews (transaction_id, reviewer_id, reviewee_id, listing_id, rating, comment)
  VALUES (p_transaction_id, p_reviewer_id, p_reviewee_id, p_listing_id, p_rating, p_comment);
  
  -- Update transaction
  IF v_is_seller THEN
    UPDATE transactions SET seller_rated = TRUE WHERE id = p_transaction_id;
  ELSE
    UPDATE transactions SET buyer_rated = TRUE WHERE id = p_transaction_id;
  END IF;
  
  -- Check if both rated, mark as completed
  UPDATE transactions
  SET status = 'completed', completed_at = NOW()
  WHERE id = p_transaction_id
  AND seller_rated = TRUE
  AND buyer_rated = TRUE;
  
  -- Update user rating stats
  UPDATE users
  SET 
    rating_average = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM reviews
      WHERE reviewee_id = p_reviewee_id
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE reviewee_id = p_reviewee_id
    ),
    reviews_as_seller = (
      SELECT COUNT(*)
      FROM reviews r
      JOIN transactions t ON r.transaction_id = t.id
      WHERE r.reviewee_id = p_reviewee_id AND t.seller_id = p_reviewee_id
    ),
    reviews_as_buyer = (
      SELECT COUNT(*)
      FROM reviews r
      JOIN transactions t ON r.transaction_id = t.id
      WHERE r.reviewee_id = p_reviewee_id AND t.buyer_id = p_reviewee_id
    )
  WHERE id = p_reviewee_id;
  
  -- Create notification for reviewee
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    p_reviewee_id,
    'rating_received',
    'Vous avez reçu une évaluation',
    'Quelqu''un vous a évalué ' || p_rating || ' étoiles',
    jsonb_build_object('transaction_id', p_transaction_id, 'rating', p_rating)
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM notifications
    WHERE user_id = p_user_id AND read = FALSE
  );
END;
$$ LANGUAGE plpgsql;

-- Function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_read(p_user_id UUID, p_notification_ids UUID[])
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notifications
  SET read = TRUE
  WHERE user_id = p_user_id
  AND id = ANY(p_notification_ids);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. TRIGGERS
-- ============================================================================

-- Trigger to update review timestamp
CREATE OR REPLACE FUNCTION update_review_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_review_timestamp
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_review_timestamp();

-- ============================================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Transactions policies
CREATE POLICY "Users can view their own transactions"
ON transactions FOR SELECT
TO authenticated
USING (seller_id = auth.uid() OR buyer_id = auth.uid());

CREATE POLICY "Users can create transactions"
ON transactions FOR INSERT
TO authenticated
WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Users can update their own transactions"
ON transactions FOR UPDATE
TO authenticated
USING (seller_id = auth.uid() OR buyer_id = auth.uid());

-- Reviews policies
CREATE POLICY "Anyone can view reviews"
ON reviews FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Users can create reviews for their transactions"
ON reviews FOR INSERT
TO authenticated
WITH CHECK (
  reviewer_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM transactions
    WHERE id = transaction_id
    AND (seller_id = auth.uid() OR buyer_id = auth.uid())
  )
);

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================================================
-- 8. INITIAL DATA
-- ============================================================================

-- Update existing users with default rating stats
UPDATE users
SET 
  rating_average = 0.00,
  rating_count = 0,
  reviews_as_seller = 0,
  reviews_as_buyer = 0
WHERE rating_average IS NULL;

-- ============================================================================
-- COMPLETE
-- ============================================================================

COMMENT ON TABLE transactions IS 'Records of completed sales between buyers and sellers';
COMMENT ON TABLE reviews IS 'User reviews and ratings for transactions';
COMMENT ON TABLE notifications IS 'In-app notifications for users';
COMMENT ON FUNCTION create_transaction_with_notifications IS 'Creates a transaction and sends notifications to both parties';
COMMENT ON FUNCTION submit_review IS 'Submits a review and updates user rating stats';
COMMENT ON FUNCTION get_unread_notification_count IS 'Gets count of unread notifications for a user';
COMMENT ON FUNCTION mark_notifications_read IS 'Marks specified notifications as read';
