-- Migration: Set Default Credits for New Users
-- Created: 2024-01-22
-- Description: New users start with 3 free credits

-- ============================================================================
-- 1. UPDATE DEFAULT VALUE FOR CREDITS COLUMN
-- ============================================================================

-- Change default credits from 0 to 3
ALTER TABLE users 
ALTER COLUMN credits SET DEFAULT 3;

-- ============================================================================
-- 2. UPDATE EXISTING USERS WITH 0 CREDITS (OPTIONAL)
-- ============================================================================

-- Give 3 credits to existing users who have 0 credits
-- Comment this out if you don't want to give credits to existing users
UPDATE users 
SET credits = 3 
WHERE credits = 0;

-- ============================================================================
-- DONE!
-- ============================================================================

-- New users will now automatically get 3 credits when they sign up
-- Existing users with 0 credits have been updated to 3 credits
