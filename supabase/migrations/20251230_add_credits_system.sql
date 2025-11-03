-- Add credit system to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS credits integer NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_spent numeric NOT NULL DEFAULT 0;

-- Create credit_purchases table
CREATE TABLE IF NOT EXISTS credit_purchases (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    amount numeric NOT NULL CHECK (amount >= 0),
    credits integer NOT NULL CHECK (credits > 0),
    status text CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS on credit_purchases
ALTER TABLE credit_purchases ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchases
CREATE POLICY "Users can view own purchases"
    ON credit_purchases FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Users can create purchase requests
CREATE POLICY "Users can create purchase requests"
    ON credit_purchases FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Only admins can update purchase status
CREATE POLICY "Admins can update purchase status"
    ON credit_purchases FOR UPDATE
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND is_verified = true
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND is_verified = true
    ));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_credit_purchases_user_id ON credit_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_status ON credit_purchases(status);
CREATE INDEX IF NOT EXISTS idx_users_credits ON users(credits);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_credit_purchases_updated_at
    BEFORE UPDATE ON credit_purchases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();