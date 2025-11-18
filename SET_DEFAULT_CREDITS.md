# ✅ Set Default Credits to 3

## What This Does

New users will now start with **3 free credits** instead of 1.

## Migration File

**File:** `supabase/migrations/20240122000000_set_default_credits.sql`

This migration:
1. Changes the default value for the `credits` column from 1 to 3
2. Updates existing users with 0 credits to 3 credits (optional)

## How to Apply

### Step 1: Run Migration in Supabase

1. **Open Supabase Dashboard**
2. **Go to SQL Editor**
3. **Copy the migration file content:**
   ```
   supabase/migrations/20240122000000_set_default_credits.sql
   ```
4. **Paste and Execute**

### Step 2: Verify

Check that it worked:

```sql
-- Check default value
SELECT column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'credits';

-- Should return: 3

-- Check existing users
SELECT id, name, credits 
FROM users 
LIMIT 10;
```

## What Happens

### For New Users:
- Sign up → Automatically get 3 credits
- Can promote 3 listings for free
- Or use credits for other features

### For Existing Users:
- Users with 0 credits → Updated to 3 credits
- Users with credits already → Keep their current credits

## Optional: Don't Update Existing Users

If you don't want to give credits to existing users, comment out this line in the migration:

```sql
-- UPDATE users 
-- SET credits = 3 
-- WHERE credits = 0;
```

## Testing

### Test New User Creation:

1. **Create a new account**
2. **Check credits:**
   ```sql
   SELECT credits FROM users WHERE id = 'NEW_USER_ID';
   ```
3. **Should show: 3**

### Test in App:

1. Register a new user
2. Go to profile
3. Check credit card shows "3 crédits"
4. Try promoting a listing
5. Should work without payment

## Benefits

### For Users:
- ✅ Start with free credits
- ✅ Can try promotion features
- ✅ Better onboarding experience
- ✅ Encourages engagement

### For Platform:
- ✅ Users try features
- ✅ Higher engagement
- ✅ Better retention
- ✅ Users see value

## Summary

**Before:** New users start with 1 credit
**After:** New users start with 3 credits

Run the migration and new users will automatically get 3 free credits! 🎉
