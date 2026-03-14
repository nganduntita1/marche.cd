-- Temporarily disable moderation queue: publish listings directly as active.
-- 1) New rows default to active.
-- 2) Existing pending listings are promoted to active.
-- 3) Insert policy enforces active status on creation.

ALTER TABLE public.listings
  ALTER COLUMN status SET DEFAULT 'active';

UPDATE public.listings
SET status = 'active'
WHERE status = 'pending';

DROP POLICY IF EXISTS "Authenticated users can create listings" ON public.listings;

CREATE POLICY "Authenticated users can create listings"
  ON public.listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id AND status = 'active');
