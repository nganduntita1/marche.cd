-- Add role management to the users table.
-- Roles: admin, super_admin, user — default NULL (regular user with no special role).

-- 1. Create the enum type (safe if it already exists on user_profiles)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('user', 'admin', 'super_admin');
  END IF;
END$$;

-- 2. Add role column to users table (default NULL = regular user)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS role public.user_role DEFAULT NULL;

-- 3. Index for fast role lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- 4. Allow admins to update any user's role (for the table editor + app)
DROP POLICY IF EXISTS "Admins can update user roles" ON public.users;
CREATE POLICY "Admins can update user roles"
  ON public.users FOR UPDATE
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

-- 5. Allow admins to read all users (needed for the admin dashboard list)
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
CREATE POLICY "Admins can read all users"
  ON public.users FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR
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
