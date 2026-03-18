-- Automatically credit the buyer when a credit purchase becomes completed.
-- This complements the manual WhatsApp payment workflow:
-- 1) user requests purchase (status = pending)
-- 2) admin confirms payment and sets status = completed
-- 3) buyer credits are granted automatically (idempotent)

-- Track purchase fulfillments to prevent double-crediting if status is toggled.
CREATE TABLE IF NOT EXISTS credit_purchase_fulfillments (
  purchase_id uuid PRIMARY KEY REFERENCES credit_purchases(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  credits_applied integer NOT NULL CHECK (credits_applied >= 0),
  amount_applied numeric NOT NULL DEFAULT 0 CHECK (amount_applied >= 0),
  applied_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_purchase_fulfillments_user_id
  ON credit_purchase_fulfillments(user_id);

CREATE OR REPLACE FUNCTION fulfill_credit_purchase_on_complete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Run only when purchase is completed.
  IF NEW.status <> 'completed' THEN
    RETURN NEW;
  END IF;

  -- Prevent duplicate processing when row is re-updated while already completed.
  IF TG_OP = 'UPDATE' AND OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  -- Mark fulfillment once per purchase.
  INSERT INTO credit_purchase_fulfillments (
    purchase_id,
    user_id,
    credits_applied,
    amount_applied,
    applied_at
  ) VALUES (
    NEW.id,
    NEW.user_id,
    COALESCE(NEW.credits, 0),
    COALESCE(NEW.amount, 0),
    now()
  )
  ON CONFLICT (purchase_id) DO NOTHING;

  -- Only apply credits/spend if this is the first fulfillment insert.
  IF FOUND THEN
    UPDATE users
    SET
      credits = COALESCE(credits, 0) + COALESCE(NEW.credits, 0),
      total_spent = COALESCE(total_spent, 0) + COALESCE(NEW.amount, 0)
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_fulfill_credit_purchase_on_complete ON credit_purchases;

CREATE TRIGGER trg_fulfill_credit_purchase_on_complete
AFTER INSERT OR UPDATE OF status ON credit_purchases
FOR EACH ROW
EXECUTE FUNCTION fulfill_credit_purchase_on_complete();
