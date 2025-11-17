# Seller Features - Complete Implementation Guide

## ✅ What's Been Created

### 1. Database Migration
**File:** `supabase/migrations/20240120000000_seller_features.sql`
- Run this in your Supabase SQL editor
- Creates all necessary tables and functions
- Sets up security policies

### 2. Seller Dashboard
**File:** `app/seller-dashboard.tsx`
- Complete dashboard with analytics
- View stats, top listings, quick actions
- Access via: `/seller-dashboard`

### 3. Share Modal Component
**File:** `components/ShareModal.tsx`
- Reusable share component
- Multiple sharing options
- Copy link functionality

## 🚀 Next Steps to Complete

### Step 1: Add Share Button to Listing Detail

In `app/listing/[id].tsx`, add these changes:

**1. Import ShareModal:**
```typescript
import ShareModal from '@/components/ShareModal';
import { Share2 } from 'lucide-react-native';
```

**2. Add state:**
```typescript
const [showShareModal, setShowShareModal] = useState(false);
```

**3. Add share button in header (after back button):**
```typescript
<TouchableOpacity
  style={styles.shareButton}
  onPress={() => setShowShareModal(true)}
>
  <Share2 size={20} color="#1e293b" />
</TouchableOpacity>
```

**4. Add ShareModal before closing SafeAreaView:**
```typescript
<ShareModal
  visible={showShareModal}
  onClose={() => setShowShareModal(false)}
  title={listing?.title || ''}
  url={`https://marche.cd/listing/${id}`}
  type="listing"
/>
```

**5. Add style:**
```typescript
shareButton: {
  position: 'absolute',
  top: 16,
  right: 60,
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  width: 36,
  height: 36,
  borderRadius: 18,
  justifyContent: 'center',
  alignItems: 'center',
},
```

### Step 2: Add Share Button to Profile

In `app/(tabs)/profile.tsx`, add similar share functionality for seller profiles.

### Step 3: Add Promoted Listings UI

**Create `components/PromoteModal.tsx`:**
```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { X, Sparkles, Clock } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import Colors from '@/constants/Colors';

interface PromoteModalProps {
  visible: boolean;
  onClose: () => void;
  listingId: string;
  onSuccess: () => void;
}

const PROMOTION_PLANS = [
  { days: 7, credits: 10, label: '7 jours' },
  { days: 14, credits: 18, label: '14 jours', popular: true },
  { days: 30, credits: 30, label: '30 jours' },
];

export default function PromoteModal({
  visible,
  onClose,
  listingId,
  onSuccess,
}: PromoteModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(PROMOTION_PLANS[1]);

  const handlePromote = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase.rpc('promote_listing', {
        p_listing_id: listingId,
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_duration_days: selectedPlan.days,
        p_credits_cost: selectedPlan.credits,
      });

      if (error) throw error;

      Alert.alert(
        'Succès!',
        `Votre annonce est maintenant promue pour ${selectedPlan.days} jours!`
      );
      onSuccess();
      onClose();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de promouvoir l\'annonce');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Promouvoir l'annonce</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.benefitsCard}>
              <Sparkles size={24} color={Colors.primary} />
              <Text style={styles.benefitsTitle}>Avantages de la promotion</Text>
              <Text style={styles.benefitsText}>
                • Apparaît en haut des résultats{'\n'}
                • Badge "Promu" visible{'\n'}
                • Plus de visibilité{'\n'}
                • Plus de messages
              </Text>
            </View>

            <Text style={styles.plansTitle}>Choisissez une durée</Text>

            {PROMOTION_PLANS.map((plan) => (
              <TouchableOpacity
                key={plan.days}
                style={[
                  styles.planCard,
                  selectedPlan.days === plan.days && styles.planCardActive,
                ]}
                onPress={() => setSelectedPlan(plan)}
              >
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>Populaire</Text>
                  </View>
                )}
                <View style={styles.planInfo}>
                  <Clock size={20} color={Colors.primary} />
                  <Text style={styles.planLabel}>{plan.label}</Text>
                </View>
                <Text style={styles.planCredits}>{plan.credits} crédits</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.promoteButton, loading && styles.promoteButtonDisabled]}
              onPress={handlePromote}
              disabled={loading}
            >
              <Sparkles size={20} color="#fff" />
              <Text style={styles.promoteButtonText}>
                {loading ? 'Promotion...' : `Promouvoir (${selectedPlan.credits} crédits)`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  content: {
    padding: 20,
  },
  benefitsCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 8,
  },
  benefitsText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
  },
  plansTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    position: 'relative',
  },
  planCardActive: {
    backgroundColor: '#f0fdf4',
    borderColor: Colors.primary,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    backgroundColor: '#fbbf24',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  popularText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  planInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  planCredits: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  promoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  promoteButtonDisabled: {
    opacity: 0.5,
  },
  promoteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
```

### Step 4: Add Promoted Badge to ListingCard

In `components/ListingCard.tsx`:

**1. Add prop:**
```typescript
type ListingCardProps = {
  // ... existing props
  isPromoted?: boolean;
};
```

**2. Add badge in render (after image):**
```typescript
{isPromoted && (
  <View style={styles.promotedBadge}>
    <Sparkles size={14} color="#fff" />
    <Text style={styles.promotedBadgeText}>Promu</Text>
  </View>
)}
```

**3. Add styles:**
```typescript
promotedBadge: {
  position: 'absolute',
  top: 8,
  left: 8,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
  backgroundColor: '#fbbf24',
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 8,
},
promotedBadgeText: {
  fontSize: 11,
  fontWeight: '700',
  color: '#fff',
},
```

### Step 5: Update Home Screen to Show Promoted First

In `app/(tabs)/index.tsx`, update the listings query:

```typescript
const { data, error } = await supabase
  .from('listings')
  .select(`
    *,
    seller:seller_id(*),
    category:category_id(*)
  `)
  .eq('status', 'active')
  .order('is_promoted', { ascending: false })
  .order('created_at', { ascending: false });
```

### Step 6: Add Dashboard Link to Profile

In `app/(tabs)/profile.tsx`, add a button to access the dashboard:

```typescript
<TouchableOpacity
  style={styles.dashboardButton}
  onPress={() => router.push('/seller-dashboard')}
>
  <BarChart3 size={20} color={Colors.primary} />
  <Text style={styles.dashboardButtonText}>Tableau de bord vendeur</Text>
</TouchableOpacity>
```

## 🎯 Testing Checklist

### Database
- [ ] Run migration in Supabase SQL editor
- [ ] Verify tables created (listing_views, listing_stats, promotion_transactions)
- [ ] Check functions exist (increment_listing_views, promote_listing)

### Seller Dashboard
- [ ] Navigate to `/seller-dashboard`
- [ ] View stats display correctly
- [ ] Top listings show
- [ ] Quick actions work

### Share Functionality
- [ ] Share button appears on listings
- [ ] Share modal opens
- [ ] Copy link works
- [ ] Share options functional

### Promoted Listings
- [ ] Promote button shows for owners
- [ ] Promotion modal opens
- [ ] Can select duration
- [ ] Promotion completes successfully
- [ ] Promoted badge shows
- [ ] Promoted listings appear first

## 📊 Features Summary

### ✅ Completed
1. **Database Foundation** - All tables, functions, policies
2. **Seller Dashboard** - Analytics and insights
3. **Share Modal** - Reusable sharing component

### 🔧 To Implement (Code Provided Above)
1. **Share Buttons** - Add to listing and profile
2. **Promote Modal** - Promotion purchase flow
3. **Promoted Badge** - Visual indicator
4. **Promoted Sorting** - Show promoted first
5. **Dashboard Access** - Link from profile

## 🚀 Quick Start

1. **Run the migration:**
   - Open Supabase SQL editor
   - Paste `supabase/migrations/20240120000000_seller_features.sql`
   - Execute

2. **Test the dashboard:**
   - Navigate to `/seller-dashboard` in your app
   - View your seller analytics

3. **Add remaining UI:**
   - Follow the code snippets above
   - Add share buttons
   - Add promote functionality
   - Add promoted badges

## 💡 Next Enhancements

After completing the above:
- Add charts/graphs to dashboard
- Email notifications for promotions
- Promotion analytics
- Bulk promotion options
- Category management UI
- Advanced filtering

All the foundation is ready - just add the UI components using the code provided above! 🎉
