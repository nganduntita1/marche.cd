# Referral System Implementation Guide

## 📋 Overview

The referral system allows users to:
- Generate unique referral codes
- Share codes with others
- Earn 15% commission when referred users purchase credits
- Track referrals and commissions in a dashboard

## 🚀 Setup Instructions

### Phase 1: Database Setup

1. **Run the migration in Supabase:**
   ```sql
   -- Copy and run the contents of:
   supabase/migrations/20260318000000_add_referral_system.sql
   
   -- This creates:
   -- - referral_codes table
   -- - referral_signups table
   -- - referral_commissions table
   -- - RLS policies
   -- - Indexes for performance
   ```

2. **Verify tables were created:**
   ```sql
   -- In Supabase SQL Editor, check:
   SELECT * FROM referral_codes;
   SELECT * FROM referral_signups;
   SELECT * FROM referral_commissions;
   ```

### Phase 2: Edge Functions Deployment

1. **Deploy generate-referral-code function:**
   ```bash
   cd supabase/functions/generate-referral-code
   supabase functions deploy generate-referral-code
   ```

2. **Deploy process-referral-commission function:**
   ```bash
   cd supabase/functions/process-referral-commission
   supabase functions deploy process-referral-commission
   ```

3. **Verify functions are deployed:**
   - Go to Supabase Dashboard → Functions
   - You should see both functions listed

### Phase 3: Frontend Integration

#### 1. Add Referral Code Input to Signup

In your signup/auth screen, add a referral code input field:

```typescript
// In your auth/signup screen
import { referralService } from '@/services/referralService';
import { TextInput } from 'react-native';

const [referralCode, setReferralCode] = useState<string>('');
const [referralCodeValid, setReferralCodeValid] = useState<boolean | null>(null);

const handleReferralCodeChange = async (code: string) => {
  setReferralCode(code);
  if (code.length >= 5) {
    const validation = await referralService.validateReferralCode(code);
    setReferralCodeValid(validation.isValid);
  }
};

const handleSignup = async (email: string, password: string, phone: string, name: string) => {
  try {
    // 1. Create user with Supabase Auth
    const { data, error } = await supabase.auth.signUpWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // 2. Create user profile (this happens in your existing signup logic)
    const { error: profileError } = await supabase.from('users').insert({
      id: data.user?.id,
      name,
      phone,
      email,
      // ... other fields
    });

    if (profileError) throw profileError;

    // 3. Apply referral code if provided
    if (referralCode) {
      await referralService.applyReferralCodeToNewUser(
        data.user?.id,
        referralCode
      );
    }

    // Continue with your normal signup flow
  } catch (error) {
    console.error('Signup error:', error);
  }
};

// In your JSX:
<TextInput
  placeholder="Referral code (optional)"
  value={referralCode}
  onChangeText={handleReferralCodeChange}
  autoCapitalize="characters"
/>
{referralCodeValid === true && (
  <Text style={{ color: 'green' }}>Code valid ✓</Text>
)}
{referralCodeValid === false && (
  <Text style={{ color: 'red' }}>Invalid code ✗</Text>
)}
```

#### 2. Add Navigation to Referral Dashboard

In your profile screen or settings:

```typescript
// In (tabs)/profile.tsx, add this to the settings menu:
import { Gift } from 'lucide-react-native';

<TouchableOpacity
  onPress={() => router.push('/referral-dashboard')}
>
  <View style={styles.menuItem}>
    <Gift width={24} height={24} color={Colors.primary} />
    <Text style={styles.menuItemText}>Referrals & Earnings</Text>
    <ChevronRight width={20} height={20} color={Colors.lightGray} />
  </View>
</TouchableOpacity>
```

#### 3. Trigger Commission Processing on Credit Purchase

When a credit purchase is completed (status = 'completed'), call the commission processor:

```typescript
// In your credit purchase completion logic
import { referralService } from '@/services/referralService';

const completeCreditPurchase = async (purchaseId: string) => {
  try {
    // 1. Update purchase status to 'completed' in your WhatsApp/admin flow
    const { error: updateError } = await supabase
      .from('credit_purchases')
      .update({ status: 'completed' })
      .eq('id', purchaseId);

    if (updateError) throw updateError;

    // 2. Get current user session for auth token
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) throw new Error('Not authenticated');

    // 3. Process referral commission
    await referralService.processCommissionForPurchase(purchaseId, token);

    // 4. Refresh user credits (if auto-paid)
    await refreshUserData(); // Your existing function

    console.log('Commission processed successfully');
  } catch (error) {
    console.error('Error completing purchase:', error);
  }
};
```

#### 4. Update AuthContext to Handle Referral Code During Signup

In your `contexts/AuthContext.tsx`, after creating a new user:

```typescript
// In your signup handler
const handleSignup = async (email: string, password: string, /*...*/) => {
  try {
    const { data, error } = await supabase.auth.signUpWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // ... create user profile ...

    // Apply referral code if one was stored
    const storedCode = await referralService.getStoredReferralCode();
    if (storedCode && data.user?.id) {
      await referralService.applyReferralCodeToNewUser(
        data.user.id,
        storedCode
      );
    }
  } catch (error) {
    console.error('Signup error:', error);
  }
};
```

---

## 📱 Files Created

| File | Purpose |
|------|---------|
| `supabase/migrations/20260318000000_add_referral_system.sql` | Database schema for referral system |
| `supabase/functions/generate-referral-code/index.ts` | Edge function to generate unique codes |
| `supabase/functions/process-referral-commission/index.ts` | Edge function to process commissions |
| `app/referral-dashboard.tsx` | Main referral dashboard UI |
| `services/referralService.ts` | Referral service with helper functions |
| `types/referral.ts` | TypeScript type definitions |

---

## 🔑 Key Features

### Generate Referral Code Button
- Users can generate a unique code on the referral dashboard
- Prevents duplicates with UNIQUE constraint in database
- "Generate" button replaces "Regenerate" if code already exists

### Code Format
- Format: `MARCHE_XXXXXX` (e.g., `MARCHE_AB12CD`)
- 12 characters total
- Alphanumeric, automatically validated

### Commission Calculation
- **Rate**: 15% of purchase amount
- **Minimum Purchase**: $5 (configurable)
- **Status**: Auto-paid immediately to referrer's credits
  - To make it manual approval instead, change `COMMISSION_AUTO_PAY = false` in edge function
- **Credits Bonus**: Same percentage of credits as cash commission

### Fraud Prevention
- Self-referral protection (can't refer yourself)
- Code used at signup only (prevents gaming)
- Minimum purchase threshold
- Duplicate signup prevention (UNIQUE constraint)

---

## 🧪 Testing

### 1. Test Code Generation

```bash
# Call the edge function
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/generate-referral-code \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

### 2. Test Commission Processing

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/process-referral-commission \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"purchaseId": "YOUR_PURCHASE_ID"}'
```

### 3. Manual Test Flow

1. Create User A and generate referral code → get code `MARCHE_ABC123`
2. Create User B, apply code `MARCHE_ABC123` during signup
3. User B purchases $10 credits → status = 'completed'
4. Check User A's credits increased by 1 credit (10% of 10)
5. Check `referral_commissions` table shows the transaction

---

## ⚙️ Configuration

### Adjust Commission Rate

In `supabase/functions/process-referral-commission/index.ts`:

```typescript
const COMMISSION_RATE = 0.15; // Change 0.15 to 0.10 for 10%, 0.20 for 20%, etc.
const MINIMUM_PURCHASE_AMOUNT = 5; // Change minimum purchase threshold
const COMMISSION_AUTO_PAY = true; // false = manual admin approval
```

---

## 🐛 Debugging

### Check if migration ran successfully
```sql
-- In Supabase SQL Editor
SELECT * FROM information_schema.tables 
WHERE table_name LIKE 'referral%';
```

### View all referral codes
```sql
SELECT * FROM referral_codes;
```

### View all commissions
```sql
SELECT * FROM referral_commissions ORDER BY created_at DESC;
```

### View specific user's referrals
```sql
SELECT rc.code, COUNT(rs.id) as total_referrals
FROM referral_codes rc
LEFT JOIN referral_signups rs ON rc.id = rs.referral_code_id
WHERE rc.user_id = 'YOUR_USER_ID'
GROUP BY rc.id;
```

---

## 📊 Dashboard Features

The `referral-dashboard.tsx` component displays:

1. **Your Referral Code**
   - Displays code prominently
   - Copy button
   - Share button (WhatsApp, SMS, social)
   - Regenerate button (if code already exists)

2. **Statistics Cards**
   - Total referrals count
   - Total commission earned ($)
   - Total commission credits
   - Commission paid so far

3. **Referred Users List**
   - Name of each referred user
   - Date they joined
   - Purchase status (completed/pending)
   - Commission earned from each

4. **Empty State**
   - Shows when no referrals yet
   - Encourages sharing code

---

## 🔐 Security Notes

- All referral data protected by RLS policies
- Users can only see their own referral codes and commissions
- Self-referral prevented at application level
- Invalid codes rejected during signup
- Admin can manually approve/adjust commissions if fraud detected

---

## 📞 Support

If you encounter issues:

1. Check Supabase Function logs (Supabase Dashboard → Functions → Logs)
2. Verify RLS policies are enabled on all three tables
3. Ensure edge functions have correct environment variables set
4. Check that user is authenticated before calling edge functions

---

## 🚀 Next Steps

1. Run the SQL migration
2. Deploy the edge functions
3. Add referral code input to signup screen
4. Add referral dashboard navigation to profile
5. Integrate commission processing into credit purchase flow
6. Test with real data
7. Monitor commissions in production
