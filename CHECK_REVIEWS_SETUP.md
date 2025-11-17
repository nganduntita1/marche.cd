# ✅ Reviews System Setup Checklist

## Quick Verification

Run these checks to ensure everything is set up correctly.

## 1. Database Migration Status

### Check if tables exist:
```sql
-- In Supabase SQL Editor, run:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('transactions', 'reviews', 'notifications');
```

**Expected Result:** 3 rows
- transactions
- reviews  
- notifications

**If you see 0 rows:** The migration hasn't been run yet!

### Check if functions exist:
```sql
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

**Expected Result:** 4 rows with function names

**If you see 0 rows:** The migration hasn't been run yet!

## 2. Run the Migration

If the checks above show 0 rows, you need to run the migration:

### Steps:
1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Click **New Query**
4. Open the file: `supabase/migrations/20240121000000_reviews_ratings_system.sql`
5. Copy the ENTIRE content
6. Paste into SQL Editor
7. Click **Run** or press Ctrl+Enter
8. Wait for "Success" message

### Verify it worked:
Run the checks from step 1 again. You should now see the tables and functions.

## 3. Test the Flow

### A. Prepare Test Accounts
You need 2 accounts:
- **Account A** (Seller) - Will create listing and mark as sold
- **Account B** (Buyer) - Will message about the listing

### B. Create Test Listing
1. Log in as **Account A**
2. Create a new listing (any item)
3. Make sure status is "active"

### C. Send Message
1. Log in as **Account B**
2. Find the listing from Account A
3. Send a message: "Is this still available?"
4. Wait for message to send

### D. Mark as Sold
1. Log in as **Account A**
2. Go to your listing
3. Tap **"Marquer vendu"** button
4. **SelectBuyerModal should open**
5. You should see Account B in the list
6. Tap **"Sélectionner"** next to Account B
7. **Alert should appear:** "Succès! 🎉"

### E. Check Notifications
1. Still as **Account A**
2. Look at bell icon in profile
3. Should show red badge: 🔔(1)
4. Tap the bell icon
5. Notifications screen should open
6. Should see: "Évaluez votre acheteur"

### F. Submit Rating
1. Tap the notification
2. RatingModal should open
3. Tap stars to select rating (1-5)
4. Optionally add comment
5. Tap "Envoyer l'évaluation"
6. **Alert should appear:** "Merci! 🎉"

### G. Verify Other User
1. Log in as **Account B**
2. Check bell icon - should show badge
3. Tap bell icon
4. Should see: "Évaluez votre vendeur"
5. Complete rating

## 4. Common Issues

### Issue: "Marquer vendu" button does nothing
**Causes:**
- Migration not run (functions don't exist)
- No messages on the listing
- Console error

**Solutions:**
1. Run migration (see step 2)
2. Send a message from another account
3. Check console for errors

### Issue: SelectBuyerModal shows "Aucun message"
**Cause:** No one has messaged about the listing

**Solution:** 
1. Log in with different account
2. Send message about the listing
3. Try again

### Issue: Bell icon not clickable
**Status:** FIXED ✅

**If still not working:**
1. Restart the app
2. Clear cache
3. Check if you're logged in

### Issue: No alert appears after selecting buyer
**Causes:**
- Database function doesn't exist (migration not run)
- Database error
- Network error

**Solutions:**
1. Check console for errors
2. Verify migration was run
3. Check Supabase logs

### Issue: Bell icon shows no badge
**Causes:**
- No notifications in database
- Function `get_unread_notification_count` doesn't exist
- User ID mismatch

**Solutions:**
1. Check if notifications exist:
```sql
SELECT * FROM notifications 
WHERE user_id = 'YOUR_USER_ID' 
ORDER BY created_at DESC;
```
2. Verify function exists (see step 1)
3. Check console for errors

## 5. Manual Database Check

If things aren't working, check the database directly:

### Check if transaction was created:
```sql
SELECT * FROM transactions 
ORDER BY created_at DESC 
LIMIT 5;
```

### Check if notifications were created:
```sql
SELECT * FROM notifications 
ORDER BY created_at DESC 
LIMIT 10;
```

### Check user's notifications:
```sql
SELECT * FROM notifications 
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC;
```

Replace `YOUR_USER_ID` with your actual user ID from the auth.users table.

## 6. Debug Mode

To see what's happening:

### In SelectBuyerModal:
The component logs errors to console. Check for:
- "Error loading buyers"
- "Error creating transaction"

### In Profile:
Check for:
- "Error loading notification count"

### In Notifications Screen:
Check for:
- "Error loading notifications"

## 7. Reset Test Data

If you want to start fresh:

```sql
-- WARNING: Deletes all reviews data
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

## Summary Checklist

- [ ] Database migration run successfully
- [ ] Tables exist (transactions, reviews, notifications)
- [ ] Functions exist (4 functions)
- [ ] Two test accounts ready
- [ ] Test listing created
- [ ] Message sent from buyer to seller
- [ ] "Marquer vendu" button opens modal
- [ ] Buyer appears in SelectBuyerModal
- [ ] Alert appears after selecting buyer
- [ ] Bell icon shows badge
- [ ] Bell icon is clickable
- [ ] Notifications screen opens
- [ ] Notification appears in list
- [ ] RatingModal opens from notification
- [ ] Rating submits successfully
- [ ] Alert appears after rating

## Need Help?

If you've completed all checks and still have issues:

1. **Copy console errors** (exact error messages)
2. **Run database checks** (copy results)
3. **Describe what happens** when you tap buttons
4. **Share screenshots** if possible

---

**Most Common Issue:** Migration not run yet!
**Quick Fix:** Run the migration file in Supabase SQL Editor (see step 2)
