-- Run this SQL in your Supabase SQL Editor to set up profile picture storage
-- This creates the storage bucket and all necessary policies

-- 1. Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create storage policies
-- Note: Drop existing policies first to avoid conflicts

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own profile picture" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile picture" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile picture" ON storage.objects;

-- Policy 1: Anyone can view profile pictures (public read)
CREATE POLICY "Anyone can view profile pictures"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'profile-pictures');

-- Policy 2: Users can upload their own profile picture
CREATE POLICY "Users can upload their own profile picture"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-pictures' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy 3: Users can update their own profile picture
CREATE POLICY "Users can update their own profile picture"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-pictures' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy 4: Users can delete their own profile picture
CREATE POLICY "Users can delete their own profile picture"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-pictures' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Verify the setup
SELECT 
  'Bucket created successfully' as status,
  id,
  name,
  public
FROM storage.buckets 
WHERE id = 'profile-pictures';

SELECT 
  'Policies created successfully' as status,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%profile picture%';
