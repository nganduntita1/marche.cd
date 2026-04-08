-- Track user login events for admin analytics.

CREATE TABLE IF NOT EXISTS public.user_logins (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  logged_in_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast time-range queries
CREATE INDEX IF NOT EXISTS idx_user_logins_logged_in_at ON public.user_logins(logged_in_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_logins_user_id ON public.user_logins(user_id);

-- RLS: users can insert their own login rows; admins can read all
ALTER TABLE public.user_logins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_insert_own_login"
  ON public.user_logins FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admins_select_logins"
  ON public.user_logins FOR SELECT
  TO authenticated
  USING (
    lower(
      coalesce(
        auth.jwt() -> 'app_metadata' ->> 'role',
        auth.jwt() -> 'app_metadata' ->> 'user_role',
        auth.jwt() -> 'user_metadata' ->> 'role',
        auth.jwt() -> 'user_metadata' ->> 'user_role',
        ''
      )
    ) IN ('admin', 'super_admin', 'owner')
  );
