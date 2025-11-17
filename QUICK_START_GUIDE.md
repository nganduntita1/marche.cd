# Quick Start Guide: Using Quick Actions

## For Users

### How to Send a Quick Message

#### Option 1: Check Availability
1. Open any product listing
2. Tap **"Est-ce disponible?"** button
3. If first time messaging this seller:
   - Read safety tips
   - Tap "Continuer"
4. You'll be taken to chat with message already sent!

**Message sent**: "Bonjour! Est-ce que '[Product Name]' est toujours disponible?"

---

#### Option 2: Make a Price Offer
1. Open any product listing
2. Tap **"Faire une offre"** button
3. Enter your offer amount (e.g., 400)
4. Tap "Envoyer l'offre"
5. If first time messaging:
   - Read safety tips
   - Tap "Continuer"
6. Chat opens with your offer sent!

**Message sent**: "Bonjour! Je suis intéressé par '[Product]'. Seriez-vous d'accord pour $400?"

---

#### Option 3: Send Custom Message
1. Open any product listing
2. Tap **"Message personnalisé"** button
3. Type your message
4. Tap "Envoyer"
5. If first time messaging:
   - Read safety tips
   - Tap "Continuer"
6. Chat opens with your message sent!

**Message sent**: [Whatever you typed]

---

#### Option 4: Express General Interest
1. Open any product listing
2. Tap the main **"Message"** button (bottom right)
3. If first time messaging:
   - Read safety tips
   - Tap "Continuer"
4. Chat opens with greeting sent!

**Message sent**: "Bonjour! Je suis intéressé par '[Product]' et j'aimerais l'acheter."

---

## For Developers

### Quick Integration Check

1. **Verify imports**:
```typescript
import SafetyTipsModal from '@/components/SafetyTipsModal';
import { DollarSign } from 'lucide-react-native';
```

2. **Check state variables**:
```typescript
const [showOfferModal, setShowOfferModal] = useState(false);
const [offerAmount, setOfferAmount] = useState('');
const [customMessage, setCustomMessage] = useState('');
const [showCustomMessageModal, setShowCustomMessageModal] = useState(false);
const [showSafetyTipsModal, setShowSafetyTipsModal] = useState(false);
```

3. **Verify functions exist**:
- `handleQuickMessage()`
- `sendQuickMessage()`
- `proceedToChat()`
- `handleIsAvailable()`
- `handleMakeOffer()`
- `submitOffer()`
- `handleCustomMessage()`
- `submitCustomMessage()`

4. **Check UI components**:
- Quick actions bar (3 buttons)
- Offer modal
- Custom message modal
- Safety tips modal

5. **Test flow**:
```bash
# Run the app
npm start

# Or for development build
npx expo start
```

---

## Troubleshooting

### Issue: Buttons not showing
**Solution**: Make sure you're not the listing owner. Quick actions only show for buyers.

### Issue: Modal not opening
**Solution**: Check console for errors. Verify state variables are initialized.

### Issue: Message not sending
**Solution**: 
1. Check internet connection
2. Verify user is logged in
3. Check Supabase connection
4. Verify RLS policies

### Issue: Safety tips not showing
**Solution**: This is normal if you've already messaged this seller before.

### Issue: Navigation not working
**Solution**: Check that conversation was created successfully in database.

---

## Database Queries

### Check if conversation exists
```sql
SELECT * FROM conversations 
WHERE listing_id = 'YOUR_LISTING_ID' 
AND buyer_id = 'YOUR_USER_ID';
```

### Check messages sent
```sql
SELECT * FROM messages 
WHERE conversation_id = 'YOUR_CONVERSATION_ID'
ORDER BY created_at DESC;
```

### Check latest quick action messages
```sql
SELECT m.*, c.listing_id, l.title 
FROM messages m
JOIN conversations c ON m.conversation_id = c.id
JOIN listings l ON c.listing_id = l.id
WHERE m.content LIKE '%Bonjour%'
ORDER BY m.created_at DESC
LIMIT 10;
```

---

## Tips for Best Results

### For Buyers
- ✅ Use "Is available?" first to confirm item is still for sale
- ✅ Make reasonable offers (within 10-20% of asking price)
- ✅ Be polite and professional in custom messages
- ✅ Read safety tips carefully on first contact

### For Sellers
- ✅ Respond quickly to quick action messages
- ✅ Be open to reasonable offers
- ✅ Appreciate professional communication
- ✅ Update listing status when sold

---

## Feature Flags (Future)

If you want to disable quick actions:

```typescript
// In app/listing/[id].tsx
const ENABLE_QUICK_ACTIONS = true; // Set to false to disable

// Then wrap quick actions in conditional:
{ENABLE_QUICK_ACTIONS && (
  <View style={styles.quickActions}>
    {/* Quick action buttons */}
  </View>
)}
```

---

## Analytics Events (Future)

Track these events for insights:

```typescript
// When quick action is used
analytics.track('quick_action_used', {
  action_type: 'is_available' | 'make_offer' | 'custom_message' | 'main_message',
  listing_id: listing.id,
  user_id: user.id,
});

// When offer is made
analytics.track('offer_made', {
  listing_id: listing.id,
  asking_price: listing.price,
  offer_amount: offerAmount,
  discount_percentage: ((listing.price - offerAmount) / listing.price) * 100,
});

// When safety tips are shown
analytics.track('safety_tips_shown', {
  listing_id: listing.id,
  user_id: user.id,
});

// When safety tips are completed
analytics.track('safety_tips_completed', {
  listing_id: listing.id,
  user_id: user.id,
});
```

---

## Customization

### Change Message Templates

Edit in `app/listing/[id].tsx`:

```typescript
// Availability check
const handleIsAvailable = () => {
  const message = `Your custom message here with ${listing?.title}`;
  handleQuickMessage(message);
};

// Offer message
const submitOffer = () => {
  const message = `Your custom offer message with ${formatPrice(amount)}`;
  // ...
};

// Main greeting
const greeting = `Your custom greeting with ${listing.title}`;
```

### Change Button Labels

Edit in the JSX:

```typescript
<Text style={styles.quickActionText}>Your Custom Label</Text>
```

### Change Button Icons

Import different icons from `lucide-react-native`:

```typescript
import { YourIcon } from 'lucide-react-native';

<YourIcon size={18} color={Colors.primary} />
```

---

## Support

### Need Help?
1. Check documentation files
2. Review test scenarios
3. Check console logs
4. Verify database state
5. Contact development team

### Report Issues
Include:
- Device/OS version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if possible
- Console logs

---

**Quick Start Complete!** 🎉

You're now ready to use or customize the quick actions feature. Happy messaging!
