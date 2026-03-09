# Mobile Listing Creation Debug Guide

## Issue
Listings are being created successfully on desktop browsers but failing on mobile Chrome.

## Root Cause Analysis

The issue is likely related to how mobile browsers handle image uploads differently than desktop browsers. When using mobile Chrome, the app runs as `Platform.OS === 'web'`, but mobile browsers have:

1. **Different image URI formats** - Mobile browsers may provide blob URLs or data URLs differently
2. **Stricter security policies** - CORS and same-origin policies are more restrictive
3. **Memory constraints** - Large images may fail to convert to blobs
4. **Network issues** - Mobile connections may timeout during upload

## Changes Made

### 1. Enhanced Logging in `app/(tabs)/post.tsx`

Added comprehensive logging to track:
- User agent detection
- Form validation status
- Image processing steps (fetch, blob creation, upload)
- Blob size and type verification
- Detailed error information with stack traces

### 2. Better Error Handling

- Added validation for empty blobs
- Added fetch response status checking
- Added detailed error messages for each step
- Added platform-specific error context

## How to Debug on Mobile

### Step 1: Enable Remote Debugging

**For Android Chrome:**
1. Connect your phone via USB
2. Enable USB debugging on your phone
3. Open Chrome on desktop and go to `chrome://inspect`
4. Select your device and click "Inspect"
5. View console logs in real-time

**For iOS Safari:**
1. Enable Web Inspector on iPhone (Settings > Safari > Advanced)
2. Connect iPhone to Mac via USB
3. Open Safari on Mac > Develop > [Your iPhone] > [Your Page]
4. View console logs in Web Inspector

### Step 2: Test Listing Creation

1. Open the app on mobile Chrome
2. Navigate to the Post/Create Listing screen
3. Fill in all fields and select an image
4. Open the browser console (via remote debugging)
5. Click "Publish"
6. Watch the console for `[Post Creation]` logs

### Step 3: Identify the Failure Point

Look for these specific log messages to identify where it fails:

```
[Post Creation] Starting submission...
[Post Creation] Platform: web
[Post Creation] User Agent: [browser info]
[Post Creation] Form validation passed...
[Post Creation] Checking credits...
[Post Creation] Credits available: X
[Post Creation] Looking up category...
[Post Creation] Category found: [id]
[Post Creation] Uploading X images...
[Post Creation] Fetching image blob for image 1...
[Post Creation] Fetch response status for image 1: 200 true
[Post Creation] Blob created for image 1: {size: X, type: 'image/jpeg'}
[Post Creation] Uploading to Supabase storage for image 1...
[Post Creation] Image 1/1 uploaded successfully: [url]
[Post Creation] Inserting listing with status=pending...
[Post Creation] Listing inserted successfully with ID: [id]
[Post Creation] Submission complete!
```

### Common Failure Points

#### A. Image Fetch Fails
```
[Post Creation] Fetch/Blob error for image 1: Failed to fetch
```
**Solution**: The image URI is invalid or inaccessible. Check if the image picker is providing valid URIs on mobile.

#### B. Empty Blob
```
[Post Creation] Blob created for image 1: {size: 0, type: ''}
```
**Solution**: The blob conversion failed. The image might be too large or in an unsupported format.

#### C. Supabase Upload Fails
```
[Post Creation] Image 1 upload error: [error details]
```
**Solution**: Check Supabase storage policies and network connectivity.

#### D. RLS Policy Rejection
```
[Post Creation] Listing insert error: new row violates row-level security policy
```
**Solution**: Ensure `status = 'pending'` is being set correctly.

## Potential Fixes

### Fix 1: Image Size Optimization

If blobs are too large, add image compression before upload:

```typescript
// In pickImages function, add quality reduction for mobile
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ['images'],
  allowsEditing: false,
  quality: Platform.OS === 'web' ? 0.6 : 0.8, // Lower quality for web/mobile
});
```

### Fix 2: Alternative Upload Method for Mobile

If blob conversion fails, try using FileReader:

```typescript
if (Platform.OS === 'web') {
  // Try blob first
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    fileData = blob;
  } catch (blobError) {
    // Fallback: try FileReader if available
    console.log('[Post Creation] Blob failed, trying FileReader...');
    // Implementation needed
  }
}
```

### Fix 3: Check Image Picker Configuration

Ensure the image picker is configured correctly for web:

```typescript
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ['images'],
  allowsEditing: false,
  quality: 0.8,
  base64: false, // Don't use base64 on web
  exif: false,   // Don't include EXIF data
});
```

## Testing Checklist

- [ ] Test on mobile Chrome (Android)
- [ ] Test on mobile Safari (iOS)
- [ ] Test with different image sizes (small, medium, large)
- [ ] Test with different image formats (JPEG, PNG, HEIC)
- [ ] Test with slow network connection
- [ ] Test with multiple images
- [ ] Check browser console for errors
- [ ] Verify Supabase storage bucket has correct policies
- [ ] Verify user is authenticated
- [ ] Verify user has credits

## Next Steps

1. **Test with enhanced logging** - Create a listing on mobile and capture all console logs
2. **Share the logs** - Provide the complete console output to identify the exact failure point
3. **Apply targeted fix** - Based on the logs, apply the appropriate fix from above
4. **Verify fix** - Test again on mobile to confirm the issue is resolved

## Additional Resources

- [Expo ImagePicker Docs](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Chrome Remote Debugging](https://developer.chrome.com/docs/devtools/remote-debugging/)
