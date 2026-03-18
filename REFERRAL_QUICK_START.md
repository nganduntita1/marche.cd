# Referral System - Quick Integration Checklist

## ✅ All Files Created - Ready to Use!

Everything is set up and ready. Here's what to do:

---

## 🎯 Step 1: Database (TODAY)

- [ ] Open Supabase SQL Editor
- [ ] Copy content from: `supabase/migrations/20260318000000_add_referral_system.sql`
- [ ] Paste and run in SQL Editor
- [ ] Verify 3 tables were created ✓

**Expected output:**
```
CREATE TABLE (success)
ALTER TABLE (success)
CREATE INDEX (success) x8
CREATE TRIGGER (success) x2
```

---

## 🚀 Step 2: Deploy Edge Functions

Run these commands in your terminal:

```bash
# From project root
supabase functions deploy generate-referral-code
supabase functions deploy process-referral-commission
```

**Expected:**
- Functions appear in Supabase Dashboard → Functions
- Both show as "Active"

---

## 📱 Step 3: Add to Signup Screen

**File to modify:** `app/auth/signup.tsx` (or wherever signup is)

**Add these imports:**
```typescript
import { referralService } from '@/services/referralService';
```

**Add state:**
```typescript
const [referralCode, setReferralCode] = useState<string>('');
const [referralCodeValid, setReferralCodeValid] = useState<boolean | null>(null);
```

**Add input field:**
```typescript
<TextInput
  placeholder="Referral code (optional)"
  value={referralCode}
  onChangeText={(code) => {
    setReferralCode(code);
    // Validate if long enough
    if (code.length >= 5) {
      referralService.validateReferralCode(code).then((result) => {
        setReferralCodeValid(result.isValid);
      });
    }
  }}
  autoCapitalize="characters"
/>
```

**In signup handler, after creating user:**
```typescript
// Apply referral code if provided
if (referralCode) {
  await referralService.applyReferralCodeToNewUser(
    data.user?.id,
    referralCode
  );
}
```

---

## 💼 Step 4: Add Referral Dashboard Navigation

**File to modify:** `app/(tabs)/profile.tsx`

**Add import:**
```typescript
import { Gift } from 'lucide-react-native';
```

**Add menu item in profile settings section:**
```typescript
<TouchableOpacity
  onPress={() => router.push('/referral-dashboard')}
  style={styles.menuItem}
>
  <Gift width={24} height={24} color={Colors.primary} />
  <Text style={styles.menuItemText}>Referrals & Earnings</Text>
  <ChevronRight width={20} height={20} color={Colors.lightGray} />
</TouchableOpacity>
```

---

## 💰 Step 5: Process Commissions on Purchase

**File to modify:** Where you handle credit purchase completion

**When purchase status changes to 'completed', add:**
```typescript
import { referralService } from '@/services/referralService';

// After updating purchase status to 'completed'
const token = (await supabase.auth.getSession()).data?.session?.access_token;
if (token) {
  await referralService.processCommissionForPurchase(purchaseId, token);
}
```

---

## 🧪 Testing Checklist

- [ ] Run SQL migration (verify 3 tables created)
- [ ] Deploy 2 edge functions (verify both active)
- [ ] Create test user A
- [ ] Generate referral code for user A → note the code
- [ ] Create test user B, enter code during signup
- [ ] User B purchases credits (complete the purchase)
- [ ] Check user A's credits increased
- [ ] Check referral-dashboard shows the referral
- [ ] View Supabase and verify `referral_commissions` record created

---

## 📊 What Gets Generated

| Item | Details |
|------|---------|
| **Files Created** | 6 new files + 1 guide doc |
| **Database Tables** | 3 new tables with RLS policies |
| **Edge Functions** | 2 serverless functions deployed |
| **Dashboard Screen** | Full referral management UI |
| **Service Module** | Helper functions for integration |
| **Type Definitions** | TypeScript types for all referral data |

---

## 🔧 All Settings Configurable

**In `supabase/functions/process-referral-commission/index.ts`:**

```typescript
const COMMISSION_RATE = 0.15;           // Change to 0.10 for 10%, etc.
const MINIMUM_PURCHASE_AMOUNT = 5;      // Minimum $5 purchase
const COMMISSION_AUTO_PAY = true;       // false = require manual approval
```

---

## 📋 Files Summary

| File Path | What It Does |
|-----------|-------------|
| `supabase/migrations/20260318000000_add_referral_system.sql` | Database: 3 tables + RLS |
| `supabase/functions/generate-referral-code/index.ts` | Edge function: Creates unique codes |
| `supabase/functions/process-referral-commission/index.ts` | Edge function: Calculates & pays commissions |
| `app/referral-dashboard.tsx` | UI: Referral dashboard screen |
| `services/referralService.ts` | Helpers: All referral operations |
| `types/referral.ts` | TypeScript: Type definitions |
| `REFERRAL_SYSTEM_SETUP.md` | Guide: Detailed setup & integration |

---

## ⚡ That's It!

You're now ready to:

1. ✅ Users generate referral codes  
2. ✅ Share codes with others  
3. ✅ Apply codes at signup  
4. ✅ Earn commissions on purchases  
5. ✅ Track everything in dashboard  

**Next: Run the SQL migration!**
