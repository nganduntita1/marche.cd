-- Referral System Tables

-- 1. REFERRAL CODES TABLE
CREATE TABLE IF NOT EXISTS referral_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(12) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    total_referrals INTEGER DEFAULT 0,
    total_commission DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 2. REFERRAL SIGNUPS TABLE
CREATE TABLE IF NOT EXISTS referral_signups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_code_id UUID NOT NULL REFERENCES referral_codes(id) ON DELETE CASCADE,
    referred_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    used_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(referred_user_id)
);

-- 3. REFERRAL COMMISSIONS TABLE
CREATE TABLE IF NOT EXISTS referral_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_purchase_id UUID NOT NULL REFERENCES credit_purchases(id) ON DELETE CASCADE,
    commission_amount DECIMAL(10,2) NOT NULL,
    commission_credits INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'earned' CHECK (status IN ('earned', 'pending_admin', 'paid')),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_commissions ENABLE ROW LEVEL SECURITY;

-- REFERRAL CODES RLS POLICIES
CREATE POLICY "Users can view own referral code"
    ON referral_codes FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own referral code"
    ON referral_codes FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- REFERRAL SIGNUPS RLS POLICIES
CREATE POLICY "Users can view signups for their code"
    ON referral_signups FOR SELECT
    TO authenticated
    USING (
        referral_code_id IN (
            SELECT id FROM referral_codes WHERE user_id = auth.uid()
        )
    );

-- REFERRAL COMMISSIONS RLS POLICIES
CREATE POLICY "Users can view own commissions"
    ON referral_commissions FOR SELECT
    TO authenticated
    USING (auth.uid() = referrer_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_is_active ON referral_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_referral_signups_referral_code_id ON referral_signups(referral_code_id);
CREATE INDEX IF NOT EXISTS idx_referral_signups_referred_user_id ON referral_signups(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_commissions_referrer_id ON referral_commissions(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_commissions_referred_user_id ON referral_commissions(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_commissions_status ON referral_commissions(status);
CREATE INDEX IF NOT EXISTS idx_referral_commissions_created_at ON referral_commissions(created_at DESC);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_referral_codes_updated_at
    BEFORE UPDATE ON referral_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referral_commissions_updated_at
    BEFORE UPDATE ON referral_commissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
