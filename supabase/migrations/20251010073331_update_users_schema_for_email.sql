/*
  # Update Users Schema for Email Authentication

  ## Overview
  Updates the users table to support email-based authentication instead of phone-only.

  ## Changes
  1. Make phone field nullable (since we're using email as primary auth)
  2. Add email field if it doesn't exist
  3. Remove unique constraint from phone since multiple users might not have phone

  ## Security
  - Existing RLS policies remain unchanged
*/

-- Make phone nullable and remove unique constraint
DO $$
BEGIN
  -- Drop the unique constraint on phone if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_phone_key'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT users_phone_key;
  END IF;

  -- Make phone nullable
  ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;
END $$;

-- Ensure email column exists and can be used for auth
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'email'
  ) THEN
    ALTER TABLE users ADD COLUMN email text;
  END IF;
END $$;