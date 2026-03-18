-- Fix RLS policies for referral_codes to allow validation during signup

-- Drop the old policy that was too restrictive
DROP POLICY IF EXISTS "Users can view own referral code" ON referral_codes;

-- New policies:

-- 1. Users can view/select their own referral code for dashboard
CREATE POLICY "Users can view own referral code"
    ON referral_codes FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- 2. Authenticated users can lookup ANY referral code for validation (read-only, no modification)
-- This allows:
--   - Signup process to validate referral codes
--   - Share functionality to check code validity
--   - Public validation without exposing sensitive data
CREATE POLICY "Anyone can validate referral codes"
    ON referral_codes FOR SELECT
    TO authenticated
    USING (true);

-- 3. Update policy remains unchanged - users can only update their own codes
-- (existing policy stays as is)

-- Ensure proper indexes exist for validation queries
CREATE INDEX IF NOT EXISTS idx_referral_codes_active_lookup 
    ON referral_codes(code, is_active)
    WHERE is_active = true;
