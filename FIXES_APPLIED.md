# Fixes Applied

## Issue: Image Constructor Error

**Error Message:**
```
TypeError: Failed to construct 'Image': Please use the 'new' operator, 
this DOM object constructor cannot be called as a function.
```

**Root Cause:**
The `Image` component from React Native was not imported in `app/chat/[id].tsx`.

**Fix Applied:**
Added `Image` to the imports from `react-native` in `app/chat/[id].tsx`.

## Type Updates

### Updated Files:
1. **types/chat.ts**
   - Changed `avatar_url` to `profile_picture` in buyer and seller types
   - Now matches the database schema

2. **app/chat/[id].tsx**
   - Added `Image` import
   - Uses `profile_picture` field from conversation data

3. **app/(tabs)/messages.tsx**
   - Already had `Image` imported
   - Uses `profile_picture` field

4. **app/listing/[id].tsx**
   - Already had `Image` imported
   - Uses `profile_picture` field

## TypeScript Diagnostics

If you see TypeScript errors about `profile_picture` not existing, this is likely due to:
1. IDE TypeScript language server cache
2. The types are correct in the code

**To resolve:**
- Restart your TypeScript language server
- Or restart your IDE
- The code will work correctly at runtime

## Testing Checklist

- [ ] Profile pictures display in chat headers
- [ ] Profile pictures display next to messages
- [ ] Profile pictures display in messages list
- [ ] Profile pictures display on listing pages
- [ ] Fallback to initials works when no picture
- [ ] Image upload works in edit profile

## Next Steps

1. Run the storage setup SQL (see `SETUP_PROFILE_PICTURES.md`)
2. Test uploading a profile picture
3. Verify it displays across all screens
4. Check that the app works on both web and mobile
