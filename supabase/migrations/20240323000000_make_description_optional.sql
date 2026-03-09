/*
  # Make Description Optional

  This migration makes the description field optional in the listings table,
  allowing users to create listings without a description.

  ## Changes
  - Alter listings table to make description nullable
  - Set default empty string for existing NULL values (if any)
*/

-- Make description nullable
ALTER TABLE listings 
ALTER COLUMN description DROP NOT NULL;

-- Update any existing NULL descriptions to empty string (just in case)
UPDATE listings 
SET description = '' 
WHERE description IS NULL;
