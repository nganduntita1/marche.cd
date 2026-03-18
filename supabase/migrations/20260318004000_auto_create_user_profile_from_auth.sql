-- Ensure every new auth user gets an app profile row in public.users.
-- This fixes signup cases where email confirmation is enabled and no session
-- exists yet, which can prevent client-side INSERT due to RLS.

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referral_code text;
  v_referral_code_id uuid;
BEGIN
  INSERT INTO public.users (
    id,
    name,
    email,
    phone,
    location,
    is_verified,
    credits,
    total_spent,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(COALESCE(NEW.email, ''), '@', 1), 'Utilisateur'),
    COALESCE(NEW.email, CONCAT(NEW.id::text, '@marchecd.com')),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'location', ''),
    false,
    1,
    0,
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;

  -- If signup metadata contains a referral code, link it once for this new user.
  v_referral_code := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'referral_code', '')), '');

  IF v_referral_code IS NOT NULL THEN
    SELECT rc.id
    INTO v_referral_code_id
    FROM public.referral_codes rc
    WHERE rc.code = v_referral_code
      AND rc.is_active = true
      AND rc.user_id <> NEW.id
    LIMIT 1;

    IF v_referral_code_id IS NOT NULL THEN
      INSERT INTO public.referral_signups (
        referral_code_id,
        referred_user_id,
        used_at
      ) VALUES (
        v_referral_code_id,
        NEW.id,
        now()
      )
      ON CONFLICT (referred_user_id) DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;

CREATE TRIGGER on_auth_user_created_profile
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_profile();
