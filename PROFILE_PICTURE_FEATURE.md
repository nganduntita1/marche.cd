# Profile Picture Feature

## Overview
Users can now add and edit their profile pictures. The app will prompt users who don't have a profile picture to add one.

## Changes Made

### 1. Database Migration
- **File**: `supabase/migrations/20240115000000_add_profile_picture.sql`
- Added `profile_picture` column to the `users` table

### 1.1 Storage Setup (Required)
- **See**: `STORAGE_SETUP.md` for detailed instructions
- Storage bucket `profile-pictures` must be created manually in Supabase Dashboard
- RLS policies must be configured for secure image uploads
- **Important**: The app will show an error until storage is configured

### 2. Edit Profile Screen
- **File**: `app/edit-profile.tsx`
- New screen for editing user profile details
- Image picker integration for profile pictures
- Upload images to Supabase Storage
- Edit name, phone, and location

### 3. Profile Page Updates
- **File**: `app/(tabs)/profile.tsx`
- Display profile picture (or placeholder with initials)
- Show prompt banner when profile picture is missing
- "Modifier mon profil" button to access edit screen
- Clickable avatar to edit profile

### 4. User Profile View Updates
- **File**: `app/user/[id].tsx`
- Display profile pictures on public user profiles
- Fallback to initials when no picture is available

### 5. Type Updates
- **File**: `types/database.ts`
- Added `profile_picture?: string` to User interface

## Setup Instructions

**⚠️ Before using this feature, you must set up the storage bucket!**

See `SETUP_PROFILE_PICTURES.md` for quick setup instructions.

## Usage

### For Users
1. Go to the Profile tab
2. If you don't have a profile picture, you'll see a prompt to add one
3. Click "Modifier mon profil" or tap on your avatar
4. Tap the camera icon to select a photo from your library
5. Edit other profile details as needed
6. Click "Enregistrer" to save changes

### Storage Structure
Profile pictures are stored in Supabase Storage:
- Bucket: `profile-pictures`
- Path: `{user_id}/{timestamp}.{ext}`
- Public access enabled for viewing

## Security
- Users can only upload/update/delete their own profile pictures
- RLS policies enforce user ownership
- Images are stored with user ID in the path for organization
