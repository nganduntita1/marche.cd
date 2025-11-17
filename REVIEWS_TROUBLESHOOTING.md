# 🔧 Reviews System Troubleshooting

## Issues Reported

### 1. ❌ Bell Icon Not Clickable
**Status:** FIXED ✅

**Problem:** The bell icon in the profile header wasn't responding to taps.

**Root Cause:** There were two bell icons in the profile - one for logged-out users (working) and one for logged-in users (missing onPress handler).

**Solution Applied:**
Updated the logged-in bell icon at line 257 to include:
- `onPress={() => router.push('/notifications')}`
- Notification badge display
- Notification count

### 2. ❌ No Alerts Appearing
**Status:** INVESTIGATING 🔍

**Possible Causes:**

#### A. Database Migration Not Run
The database functions might not exist yet.

**Check:**
```sql
-- In Supabase SQL Editor, run:
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'create_transaction_with_notifications',
  'submit_review',
  'get_unread_notification_count',
  'mark_notifications_read'
);
```

**Expected Result:** Should return 4 rows with the function names.

**If Empty:** Run the migration file:
```
supabase/migrations/20240121000000_reviews_ratings_system.sql
```

#### B. No Messages on Listing
The SelectBuyerModal only shows users who have messaged about the listing.

**Check:**
1. Open a listing you own
2. From another account, send a message about that listing
3. Go back to owner account
4. Try "Marquer vendu" again

#### C. Console Errors
Check the console for any errors when tapping the button.

**How to Check:**
1. Open React Native debugger or Metro bundler
2. Tap "Marquer vendu"
3. Look for any red errors

## Step-by-Step Testing Guide

### Test 1: Database Setup

1. **Open Supabase Dashboard**
2. **Go to SQL Editor**
3. **Run this check:**
```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('transactions', 'reviews', 'notifications');
```

**Expected:** 3 rows (transactions, reviews, notifications)

4. **If tables don't exist, run the migration:**
   - Copy entire content from `supabase/migrations/20240121000000_reviews_ratings_system.sql`
   - Paste in SQL Editor
   - Execute

### Test 2: Create Test Data

1. **Account A (Seller):**
   - Create a listing
   - Note the listing ID

2. **Account B (Buyer):**
   - Find the listing
   - Send a message: "Is this available?"

3. **Account A (Seller):**
   - Go to the listing
   - Tap "Marquer vendu"
   - SelectBuyerModal should open
   - Should see Account B in the list

### Test 3: Verify Notifications

After selecting buyer:

1. **Check Database:**
```sql
-- Check transaction created
SELECT * FROM transactions ORDER BY created_at DESC LIMIT 1;

-- Check notifications created
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 2;
```

2. **Check UI:**
   - Bell icon should show badge (🔔1)
   - Tap bell icon
   - Notifications screen should open
   - Should see "Évaluez votre acheteur" notification

### Test 4: Rating Flow

1. **Tap notification**
2. **RatingModal should open**
3. **Select 1-5 stars**
4. **Add optional comment**
5. **Tap "Envoyer l'évaluation"**
6. **Check for success alert**

## Common Issues & Solutions

### Issue: "Cannot read property 'id' of undefined"
**Cause:** User not logged in
**Solution:** Ensure you're logged in before testing

### Issue: SelectBuyerModal shows "Aucun message"
**Cause:** No one has messaged about the listing
**Solution:** Send a message from another account first

### Issue: Bell icon shows no badge
**Cause:** Either no notifications or function not working
**Solution:** 
1. Check if notifications exist in database
2. Verify `get_unread_notification_count` function exists
3. Check console for errors

### Issue: RatingModal doesn't open
**Cause:** Notification data might be incomplete
**Solution:** Check notification data structure in database

## Debug Commands

### Check Notifications
```sql
SELECT * FROM notifications 
WHERE user_id = 'YOUR_USER_ID' 
ORDER BY created_at DESC;
```

### Check Transactions
```sql
SELECT * FROM transactions 
WHERE seller_id = 'YOUR_USER_ID' 
OR buyer_id = 'YOUR_USER_ID'
ORDER BY created_at DESC;
```

### Check Reviews
```sql
SELECT * FROM reviews 
WHERE reviewee_id = 'YOUR_USER_ID'
ORDER BY created_at DESC;
```

### Check User Stats
```sql
SELECT 
  id, 
  name, 
  rating_average, 
  rating_count,
  reviews_as_seller,
  reviews_as_buyer
FROM users 
WHERE id = 'YOUR_USER_ID';
```

## Quick Fixes

### Fix 1: Reset Everything
```sql
-- WARNING: This deletes all test data
DELETE FROM reviews;
DELETE FROM notifications;
DELETE FROM transactions;

-- Reset user stats
UPDATE users SET 
  rating_average = NULL,
  rating_count = 0,
  reviews_as_seller = 0,
  reviews_as_buyer = 0;
```

### Fix 2: Manually Create Test Notification
```sql
INSERT INTO notifications (user_id, type, title, message, data, read)
VALUES (
  'YOUR_USER_ID',
  'rating_request',
  'Évaluez votre acheteur',
  'Évaluez votre expérience avec l''acheteur de "Test Item"',
  '{"transaction_id": "test-id", "listing_id": "test-listing-id"}'::jsonb,
  false
);
```

### Fix 3: Manually Test Function
```sql
-- Test get_unread_notification_count
SELECT get_unread_notification_count('YOUR_USER_ID');

-- Should return a number (0 or more)
```

## Next Steps

1. **Run database migration** if not done yet
2. **Test with two accounts** (seller and buyer)
3. **Check console** for any errors
4. **Verify database** has correct data
5. **Report specific error messages** if issues persist

## Files to Check

- `app/(tabs)/profile.tsx` - Bell icon (FIXED ✅)
- `app/listing/[id].tsx` - Mark as sold button
- `components/SelectBuyerModal.tsx` - Buyer selection
- `components/RatingModal.tsx` - Rating submission
- `app/notifications.tsx` - Notifications screen
- `supabase/migrations/20240121000000_reviews_ratings_system.sql` - Database schema

## Contact Points

If issues persist, provide:
1. Console error messages
2. Database query results
3. Screenshots of the issue
4. Steps to reproduce

---

**Last Updated:** After fixing bell icon clickability issue
**Status:** Bell icon fixed ✅, investigating alerts issue 🔍
