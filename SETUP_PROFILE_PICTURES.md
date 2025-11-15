# Quick Setup: Profile Pictures

## ⚠️ Important: Storage Configuration Required

The profile picture feature requires a storage bucket to be set up in Supabase. Follow these steps:

## Option 1: Quick Setup (Recommended)

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `supabase/setup_storage.sql`
4. Click **Run**
5. Verify you see "Bucket created successfully" in the results

## Option 2: Manual Setup

Follow the detailed instructions in `STORAGE_SETUP.md`

## After Setup

1. Run the database migration:
   ```bash
   # Apply the migration to add profile_picture column
   supabase db push
   ```

2. Test the feature:
   - Open your app
   - Go to Profile tab
   - Click "Modifier mon profil"
   - Try uploading a profile picture

## Troubleshooting

**Error: "Bucket not found"**
- The storage bucket hasn't been created yet
- Run the SQL script from `supabase/setup_storage.sql`

**Error: "Permission denied"**
- Storage policies aren't configured correctly
- Re-run the setup SQL script

**Need help?**
- See `STORAGE_SETUP.md` for detailed troubleshooting
- Check `PROFILE_PICTURE_FEATURE.md` for feature documentation
