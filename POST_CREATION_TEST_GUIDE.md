# Quick Test Guide - Post Creation Fix

## How to Test the Fix

### Desktop Browser
```bash
npm run dev:web
```

1. Open http://localhost:3000
2. Create a post with all fields filled
3. Should succeed immediately
4. Check console for `[Post Creation]` logs showing success

### Mobile Chrome (Physical Device)
```bash
npm run dev
# Then scan QR code with Expo Go
```

1. Fill post form completely (title, category, description, price, images)
2. Tap Create Post
3. Watch for:
   - Loading indicator while uploading
   - Success popup OR error alert with detailed message
4. Check Expo CLI console for `[Post Creation]` logs

### Debugging Logs
If it fails, look for:

**Success logs** (should see this):
```
[Post Creation] Starting submission...
[Post Creation] Platform: web/ios/android
[Post Creation] Checking credits...
[Post Creation] Looking up category...
[Post Creation] Uploading 1/N images...
[Post Creation] Image 1/N uploaded successfully
[Post Creation] Inserting listing with status=pending
[Post Creation] Listing inserted successfully with ID: <uuid>
[Post Creation] Deducting 1 credit from user...
[Post Creation] Submission complete!
```

**Error logs** (if it fails):
```
[Post Creation] Submission failed with error: {
  message: "...",
  code: "...",
  platform: "web|ios|android",
  fullError: {...}
}
```

## Key Change
- ✅ Status now: `'pending'` (matches RLS policy)
- ❌ Status was: `'active'` (RLS rejected it)

## What to Look For
1. **Desktop**: Should still work as before
2. **Mobile**: 
   - No more hanging/infinite loading ✅
   - Clear error messages if something fails ✅
   - Detailed logs in console ✅

## If Still Fails
Check the error message from the alert:
- "Error while checking credits" → User has 0 credits
- "Insert error" → Check RLS policy or server logs
- "Image upload failed" → Check Supabase storage permissions
- "Category error" → Category slug not found
