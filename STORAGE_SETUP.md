# Storage Bucket Setup for Profile Pictures

## Manual Setup Required

Since storage buckets need to be created through the Supabase Dashboard, follow these steps:

### 1. Create the Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Storage** in the left sidebar
4. Click **New bucket**
5. Configure the bucket:
   - **Name**: `profile-pictures`
   - **Public bucket**: ✅ Enable (so profile pictures are publicly viewable)
   - **File size limit**: 5 MB (recommended)
   - **Allowed MIME types**: `image/*` (optional, for security)
6. Click **Create bucket**

### 2. Set Up Storage Policies

After creating the bucket, set up the following policies:

#### Policy 1: Public Read Access
- **Policy name**: Anyone can view profile pictures
- **Allowed operation**: SELECT
- **Target roles**: public
- **Policy definition**:
```sql
bucket_id = 'profile-pictures'
```

#### Policy 2: Authenticated Upload
- **Policy name**: Users can upload their own profile picture
- **Allowed operation**: INSERT
- **Target roles**: authenticated
- **Policy definition**:
```sql
bucket_id = 'profile-pictures' AND (storage.foldername(name))[1] = auth.uid()::text
```

#### Policy 3: Authenticated Update
- **Policy name**: Users can update their own profile picture
- **Allowed operation**: UPDATE
- **Target roles**: authenticated
- **Policy definition**:
```sql
bucket_id = 'profile-pictures' AND (storage.foldername(name))[1] = auth.uid()::text
```

#### Policy 4: Authenticated Delete
- **Policy name**: Users can delete their own profile picture
- **Allowed operation**: DELETE
- **Target roles**: authenticated
- **Policy definition**:
```sql
bucket_id = 'profile-pictures' AND (storage.foldername(name))[1] = auth.uid()::text
```

### 3. Run the Database Migration

After setting up the storage bucket, run the migration to add the profile_picture column:

```bash
# If using Supabase CLI
supabase db push

# Or apply the migration manually in the SQL Editor
```

The migration file is located at: `supabase/migrations/20240115000000_add_profile_picture.sql`

### Alternative: Quick Setup via SQL Editor

You can also run this SQL in the Supabase SQL Editor to create the bucket and policies:

```sql
-- Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Policy 1: Public read
CREATE POLICY "Anyone can view profile pictures"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'profile-pictures');

-- Policy 2: Authenticated insert
CREATE POLICY "Users can upload their own profile picture"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-pictures' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy 3: Authenticated update
CREATE POLICY "Users can update their own profile picture"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-pictures' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy 4: Authenticated delete
CREATE POLICY "Users can delete their own profile picture"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-pictures' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

## Verification

After setup, verify the bucket is working:

1. Go to Storage > profile-pictures in your Supabase Dashboard
2. Try uploading a test image manually
3. Check that the image URL is publicly accessible
4. Test the profile picture upload feature in your app

## Troubleshooting

**Error: "Bucket not found"**
- Make sure the bucket name is exactly `profile-pictures`
- Verify the bucket was created successfully in the dashboard

**Error: "Permission denied"**
- Check that all 4 policies are created and enabled
- Verify the user is authenticated when uploading

**Images not loading**
- Ensure the bucket is set to **public**
- Check that the image URLs are correct
- Verify CORS settings if accessing from web
