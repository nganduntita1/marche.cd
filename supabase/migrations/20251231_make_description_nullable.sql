-- Make description field nullable in listings table
ALTER TABLE listings 
ALTER COLUMN description DROP NOT NULL;