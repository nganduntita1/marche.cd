-- Allow authenticated users to create their own referral signup link.
-- This fixes 403/RLS errors when app calls insert on referral_signups.

DROP POLICY IF EXISTS "Users can create own referral signup" ON referral_signups;

CREATE POLICY "Users can create own referral signup"
  ON referral_signups
  FOR INSERT
  TO authenticated
  WITH CHECK (
    referred_user_id = auth.uid()
    AND referral_code_id IN (
      SELECT rc.id
      FROM referral_codes rc
      WHERE rc.is_active = true
        AND rc.user_id <> auth.uid()
    )
  );
