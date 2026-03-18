-- Automatically process referral commissions when a credit purchase is marked completed.
-- This keeps manual payment validation workflow intact: admin validates payment,
-- then updates purchase status to 'completed', and referral payout happens automatically.

-- Safety: ensure only one commission row can exist per completed purchase.
CREATE UNIQUE INDEX IF NOT EXISTS idx_referral_commissions_source_purchase_unique
  ON referral_commissions(source_purchase_id);

-- Function: process referral commission for completed purchases.
CREATE OR REPLACE FUNCTION process_referral_commission_on_purchase_complete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referral_code_id uuid;
  v_referrer_id uuid;
  v_commission_rate numeric := 0.15; -- 15%
  v_min_purchase_amount numeric := 5; -- minimum amount to reward referrals
  v_commission_amount numeric;
  v_commission_credits integer;
BEGIN
  -- Run only when purchase becomes completed.
  IF NEW.status <> 'completed' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  -- Enforce minimum purchase threshold.
  IF NEW.amount < v_min_purchase_amount THEN
    RETURN NEW;
  END IF;

  -- Find referral signup for this buyer.
  SELECT rs.referral_code_id
  INTO v_referral_code_id
  FROM referral_signups rs
  WHERE rs.referred_user_id = NEW.user_id
  LIMIT 1;

  IF v_referral_code_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Resolve referrer from referral code.
  SELECT rc.user_id
  INTO v_referrer_id
  FROM referral_codes rc
  WHERE rc.id = v_referral_code_id
    AND rc.is_active = true
  LIMIT 1;

  -- Missing/inactive referral code.
  IF v_referrer_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Block self-referrals.
  IF v_referrer_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Calculate commission.
  v_commission_amount := ROUND((NEW.amount * v_commission_rate)::numeric, 2);
  v_commission_credits := FLOOR(NEW.credits * v_commission_rate);

  -- Nothing to pay.
  IF v_commission_credits <= 0 THEN
    RETURN NEW;
  END IF;

  -- Insert commission row if not already created (idempotent).
  INSERT INTO referral_commissions (
    referrer_id,
    referred_user_id,
    source_purchase_id,
    commission_amount,
    commission_credits,
    status,
    paid_at
  ) VALUES (
    v_referrer_id,
    NEW.user_id,
    NEW.id,
    v_commission_amount,
    v_commission_credits,
    'paid',
    NOW()
  )
  ON CONFLICT (source_purchase_id) DO NOTHING;

  -- If insert happened, credit the referrer and update aggregate stats.
  IF FOUND THEN
    UPDATE users
    SET credits = COALESCE(credits, 0) + v_commission_credits
    WHERE id = v_referrer_id;

    UPDATE referral_codes
    SET
      total_commission = COALESCE(total_commission, 0) + v_commission_amount,
      total_referrals = (
        SELECT COUNT(*)
        FROM referral_signups
        WHERE referral_code_id = v_referral_code_id
      )
    WHERE id = v_referral_code_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_process_referral_commission_on_purchase_complete ON credit_purchases;

CREATE TRIGGER trg_process_referral_commission_on_purchase_complete
AFTER INSERT OR UPDATE OF status ON credit_purchases
FOR EACH ROW
EXECUTE FUNCTION process_referral_commission_on_purchase_complete();
