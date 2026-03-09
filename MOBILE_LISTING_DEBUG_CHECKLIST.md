# Mobile Listing Creation - Debug Checklist

Use this checklist to systematically debug the mobile listing creation issue.

## ☐ Pre-Debug Setup (5 minutes)

### ☐ 1. Enable USB Debugging on Phone
- [ ] Go to Settings → About Phone
- [ ] Tap "Build Number" 7 times
- [ ] Go to Settings → Developer Options
- [ ] Enable "USB Debugging"
- [ ] Connect phone to computer via USB

### ☐ 2. Open Chrome DevTools
- [ ] Open Chrome on desktop
- [ ] Navigate to `chrome://inspect`
- [ ] Verify your device appears
- [ ] Click "inspect" on your browser tab

### ☐ 3. Start Your App
```bash
npx expo start
```
- [ ] App is running
- [ ] Opened on mobile Chrome
- [ ] Console is visible in desktop DevTools

## ☐ Basic Checks (2 minutes)

### ☐ 4. Verify User is Logged In
In mobile console, run:
```javascript
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user?.id, user?.email);
```
- [ ] User ID is displayed
- [ ] User email is displayed

### ☐ 5. Check User Credits
In mobile console, run:
```javascript
const { data } = await supabase.from('users').select('credits').eq('id', user.id).single();
console.log('Credits:', data?.credits);
```
- [ ] Credits > 0

### ☐ 6. Verify Categories Exist
In mobile console, run:
```javascript
const { data } = await supabase.from('categories').select('*');
console.log('Categories:', data?.length);
```
- [ ] At least 1 category exists

## ☐ Test Listing Creation (5 minutes)

### ☐ 7. Fill Out Form
- [ ] Add at least 1 image
- [ ] Enter title
- [ ] Select category
- [ ] Enter description
- [ ] Enter price
- [ ] Verify location/city

### ☐ 8. Submit and Monitor Console
- [ ] Click "Publier l'annonce" button
- [ ] Watch console for `[POST]` logs

### ☐ 9. Check Log Sequence
Mark which logs you see:

- [ ] `[POST] Starting submission process...`
- [ ] `[POST] Platform: web`
- [ ] `[POST] Validation passed`
- [ ] `[POST] Checking user credits...`
- [ ] `[POST] User credits: X`
- [ ] `[POST] Fetching category ID...`
- [ ] `[POST] Category ID: xxx`
- [ ] `[POST] Starting image upload process...`
- [ ] `[POST] Processing image 1/X`
- [ ] `[POST] Web platform - fetching blob...`
- [ ] `[POST] Blob size: XXX bytes`
- [ ] `[POST] Uploading to Supabase storage...`
- [ ] `[POST] Image 1 uploaded successfully`
- [ ] `[POST] Creating listing record...`
- [ ] `[POST] Listing created with ID: xxx`
- [ ] `[POST] ✅ Listing creation completed successfully!`

## ☐ Identify Failure Point

### If Stopped at "Validation passed":
- [ ] Check if credits check log appears
- [ ] Verify user has credits in database
- [ ] Check network tab for failed requests

### If Stopped at "Fetching category ID":
- [ ] Check if category exists in database
- [ ] Verify category slug matches exactly
- [ ] Run: `SELECT * FROM categories;` in Supabase

### If Stopped at "Processing image":
- [ ] Note the error message
- [ ] Check image file size (should be < 5MB)
- [ ] Try with a different image
- [ ] Check if "Blob fetch error" appears

### If Stopped at "Uploading to Supabase storage":
- [ ] Check network tab for 403/401 errors
- [ ] Verify storage bucket exists
- [ ] Check storage policies
- [ ] Test upload manually (see below)

### If Stopped at "Creating listing record":
- [ ] Check for database errors in console
- [ ] Verify listings table exists
- [ ] Check RLS policies on listings table

## ☐ Common Fixes

### Fix 1: Add Credits
```sql
-- In Supabase SQL Editor
UPDATE users SET credits = 10 WHERE id = 'your-user-id';
```
- [ ] Credits added
- [ ] Verified in console

### Fix 2: Verify Storage Bucket
```sql
-- In Supabase SQL Editor
SELECT * FROM storage.buckets WHERE id = 'listings';
```
- [ ] Bucket exists
- [ ] Public = true

### Fix 3: Check Storage Policies
```sql
-- In Supabase SQL Editor
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
```
- [ ] "Authenticated users can upload images" exists
- [ ] "Public can view listing images" exists

### Fix 4: Test Manual Upload
In mobile console:
```javascript
const testBlob = new Blob(['test'], { type: 'text/plain' });
const { data, error } = await supabase.storage
  .from('listings')
  .upload(`test/${Date.now()}.txt`, testBlob);
console.log('Test upload:', { data, error });
```
- [ ] Upload successful (no error)

## ☐ Advanced Testing

### ☐ 10. Run Full Test Suite
In mobile console:
```javascript
// Copy contents of scripts/test-mobile-listing.js
// Then run:
await mobileListingTests.runAll()
```

Mark which tests pass:
- [ ] Connection test
- [ ] Auth test
- [ ] Credits test
- [ ] Category test
- [ ] Listing test

## ☐ Document Findings

### Error Found:
```
[Write the exact error message from console here]
```

### Failed at Step:
```
[Write which step failed, e.g., "Image upload", "Category lookup", etc.]
```

### Error Details:
```
[Copy relevant console logs here]
```

## ☐ Apply Fix

Based on the error, apply the appropriate fix:

### Image Upload Error:
- [ ] Reduce image size
- [ ] Try different image format
- [ ] Check storage bucket permissions

### Category Error:
- [ ] Seed categories in database
- [ ] Verify category slug

### Credits Error:
- [ ] Add credits to user account
- [ ] Run default credits migration

### Network Error:
- [ ] Check internet connection
- [ ] Verify Supabase URL in .env
- [ ] Check for CORS issues

### Database Error:
- [ ] Check RLS policies
- [ ] Verify table structure
- [ ] Check user permissions

## ☐ Verify Fix

- [ ] Clear browser cache
- [ ] Reload app
- [ ] Try creating listing again
- [ ] Check console for success message
- [ ] Verify listing appears in database

## ✅ Success Criteria

You've successfully fixed the issue when:
- [ ] Console shows: `[POST] ✅ Listing creation completed successfully!`
- [ ] Success popup appears
- [ ] Listing appears in your listings
- [ ] Listing visible in database
- [ ] Can view the created listing

## 📝 Notes

Use this space to document any additional findings:

```
[Your notes here]
```

---

**Need help?** Review:
- `MOBILE_DEBUG_QUICK_START.md` for quick reference
- `MOBILE_LISTING_CREATION_FIX.md` for detailed technical info
- `scripts/test-mobile-listing.js` for test utilities
