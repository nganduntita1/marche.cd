/*
  # Create Storage Bucket for Listing Images

  ## Overview
  Sets up Supabase Storage bucket for user-uploaded listing images with
  appropriate access policies.

  ## Storage Setup
  1. Create 'listings' bucket for storing product images
  2. Enable public access for viewing images
  3. Set up RLS policies for authenticated users to upload images

  ## Security
  - Public can view all images (for browsing listings)
  - Only authenticated users can upload images
  - Users can only delete their own images
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('listings', 'listings', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view listing images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'listings');

CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'listings');

CREATE POLICY "Users can delete own images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'listings' AND owner = auth.uid());