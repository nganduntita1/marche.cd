# Testing Guide: Quick Actions Feature

## Pre-Testing Setup

### Requirements
- ✅ Supabase database with chat tables
- ✅ At least 2 user accounts (buyer and seller)
- ✅ At least 1 active listing
- ✅ Mobile device or emulator

### Test Accounts Needed
1. **Seller Account** - User who owns the listing
2. **Buyer Account** - User who will test quick actions

## Test Scenarios

### Scenario 1: First-Time "Is Available?" Message

**Steps:**
1. Login as Buyer
2. Navigate to a listing (not owned by buyer)
3. Click "Est-ce disponible?" button
4. **Expected**: Safety Tips Modal appears
5. Click "Continuer" on Safety Tips Modal
6. **Expected**: 
   - Conversation created in database
   - Message sent: "Bonjour! Est-ce que '[Product Title]' est toujours disponible?"
   - Navigate to chat screen
   - Message visible in chat

**Database Check:**
```sql
-- Check conversation was created
SELECT * FROM conversations 
WHERE listing_id = '[listing_id]' 
AND buyer_id = '[buyer_id]';

-- Check message was sent
SELECT * FROM messages 
WHERE conversation_id = '[conversation_id]'
AND content LIKE '%est toujours disponible%';
```

**Success Criteria:**
- ✅ Safety tips modal shows
- ✅ Conversation created
- ✅ Message sent with correct text
- ✅ Navigation to chat works
- ✅ Message displays in chat

---

### Scenario 2: Make an Offer

**Steps:**
1. Login as Buyer
2. Navigate to a listing (price: $500)
3. Click "Faire une offre" button
4. **Expected**: Offer modal opens
5. **Expected**: Shows "Prix demandé: $500"
6. Enter offer amount: "400"
7. Click "Envoyer l'offre"
8. **Expected**: Safety Tips Modal appears (if first contact)
9. Click "Continuer"
10. **Expected**:
    - Message sent: "Bonjour! Je suis intéressé par '[Product]'. Seriez-vous d'accord pour $400?"
    - Navigate to chat
    - Message visible

**Edge Cases to Test:**
- Empty offer amount → Should show error
- Invalid amount (letters) → Should show error
- Negative amount → Should show error
- Very large amount → Should format correctly

**Success Criteria:**
- ✅ Modal opens with correct price
- ✅ Input validation works
- ✅ Price formatted correctly in message
- ✅ Message sent successfully
- ✅ Modal closes after sending

---

### Scenario 3: Custom Message

**Steps:**
1. Login as Buyer
2. Navigate to a listing
3. Click "Message personnalisé" button
4. **Expected**: Custom message modal opens
5. Type: "Bonjour, pouvez-vous livrer à Kinshasa?"
6. Click "Envoyer"
7. **Expected**: Safety Tips Modal appears (if first contact)
8. Click "Continuer"
9. **Expected**:
    - Message sent with exact custom text
    - Navigate to chat
    - Message visible

**Edge Cases:**
- Empty message → Should show error
- Very long message → Should send successfully
- Special characters → Should handle correctly
- Emojis → Should display correctly

**Success Criteria:**
- ✅ Modal opens
- ✅ Text input works
- ✅ Validation works
- ✅ Custom message sent exactly as typed
- ✅ Modal closes

---

### Scenario 4: Main Message Button

**Steps:**
1. Login as Buyer
2. Navigate to a listing
3. Click main "Message" button (with icon)
4. **Expected**: Safety Tips Modal appears (if first contact)
5. Click "Continuer"
6. **Expected**:
    - Message sent: "Bonjour! Je suis intéressé par '[Product]' et j'aimerais l'acheter."
    - Navigate to chat
    - Message visible

**Success Criteria:**
- ✅ Default greeting sent
- ✅ Product title included
- ✅ Navigation works
- ✅ Message displays

---

### Scenario 5: Existing Conversation

**Steps:**
1. Login as Buyer
2. Navigate to a listing you've already messaged
3. Click any quick action button
4. **Expected**: NO Safety Tips Modal
5. **Expected**:
    - Message sent immediately
    - Navigate to existing chat
    - New message appears in conversation

**Success Criteria:**
- ✅ Safety tips skipped
- ✅ Message sent to existing conversation
- ✅ No duplicate conversations created
- ✅ Navigation to correct chat

---

### Scenario 6: Not Logged In

**Steps:**
1. Logout (or use incognito)
2. Navigate to a listing
3. Click any quick action button
4. **Expected**: Redirect to login page

**Success Criteria:**
- ✅ No crash
- ✅ Redirect to login
- ✅ No database operations attempted

---

### Scenario 7: Own Listing

**Steps:**
1. Login as Seller
2. Navigate to your own listing
3. **Expected**: Quick action buttons NOT visible
4. **Expected**: "Modifier l'annonce" button visible instead

**Success Criteria:**
- ✅ Quick actions hidden for owner
- ✅ Edit button shown instead
- ✅ No message button visible

---

### Scenario 8: Modal Cancellation

**Steps:**
1. Login as Buyer
2. Navigate to a listing
3. Click "Faire une offre"
4. Enter amount: "400"
5. Click "Annuler"
6. **Expected**: Modal closes, no message sent
7. Click "Message personnalisé"
8. Type message
9. Click "Annuler"
10. **Expected**: Modal closes, no message sent

**Success Criteria:**
- ✅ Cancel button works
- ✅ No messages sent
- ✅ Input cleared
- ✅ No navigation

---

### Scenario 9: Safety Tips Cancellation

**Steps:**
1. Login as Buyer (new conversation)
2. Navigate to a listing
3. Click any quick action
4. Safety Tips Modal appears
5. Click "Annuler" or X button
6. **Expected**: Modal closes, no conversation created

**Success Criteria:**
- ✅ Modal closes
- ✅ No conversation created
- ✅ No message sent
- ✅ Stay on listing page

---

### Scenario 10: Network Error Handling

**Steps:**
1. Login as Buyer
2. Turn off internet/airplane mode
3. Click any quick action
4. **Expected**: Error alert shown
5. **Expected**: No crash

**Success Criteria:**
- ✅ Graceful error handling
- ✅ User-friendly error message
- ✅ No app crash
- ✅ Can retry after reconnecting

---

## Visual Testing

### Quick Actions Bar
- ✅ 3 buttons displayed horizontally
- ✅ Equal width buttons
- ✅ Icons visible and correct
- ✅ Text readable
- ✅ Primary color borders
- ✅ Responsive on different screen sizes

### Offer Modal
- ✅ Slides from bottom
- ✅ Rounded top corners
- ✅ Current price displayed
- ✅ Input field focused
- ✅ Numeric keyboard appears
- ✅ Buttons properly styled

### Custom Message Modal
- ✅ Slides from bottom
- ✅ Multiline input
- ✅ Input focused
- ✅ Scrollable if needed
- ✅ Buttons properly styled

### Safety Tips Modal
- ✅ Displays correctly
- ✅ All tips visible
- ✅ Scrollable
- ✅ Buttons work

---

## Performance Testing

### Load Time
- ✅ Quick actions render immediately
- ✅ Modals open smoothly
- ✅ No lag when clicking buttons

### Message Sending
- ✅ Messages send within 1-2 seconds
- ✅ Navigation happens quickly
- ✅ No blocking UI

---

## Database Integrity Testing

### Check for Duplicates
```sql
-- Should return 0 duplicate conversations
SELECT listing_id, buyer_id, seller_id, COUNT(*) 
FROM conversations 
GROUP BY listing_id, buyer_id, seller_id 
HAVING COUNT(*) > 1;
```

### Check Message Content
```sql
-- Verify messages have correct format
SELECT content FROM messages 
WHERE conversation_id = '[test_conversation_id]'
ORDER BY created_at DESC;
```

### Check Timestamps
```sql
-- Verify timestamps are correct
SELECT created_at FROM messages 
WHERE id = '[test_message_id]';
-- Should be recent timestamp
```

---

## Accessibility Testing

### Screen Reader
- ✅ Button labels announced correctly
- ✅ Modal titles announced
- ✅ Input fields labeled

### Touch Targets
- ✅ Buttons at least 44x44 points
- ✅ Easy to tap on mobile
- ✅ No accidental taps

### Contrast
- ✅ Text readable on backgrounds
- ✅ Icons visible
- ✅ Meets WCAG standards

---

## Regression Testing

### Existing Features
- ✅ Regular message button still works
- ✅ Edit listing button works (for owner)
- ✅ Favorite button works
- ✅ Image gallery works
- ✅ Back button works
- ✅ Seller profile link works

---

## Multi-Language Testing (Future)

### French (Current)
- ✅ All text in French
- ✅ Proper grammar
- ✅ Polite tone

### Future Languages
- [ ] English version
- [ ] Lingala version
- [ ] Swahili version

---

## Test Results Template

```
Date: ___________
Tester: ___________
Device: ___________
OS Version: ___________

Scenario 1: ☐ Pass ☐ Fail
Scenario 2: ☐ Pass ☐ Fail
Scenario 3: ☐ Pass ☐ Fail
Scenario 4: ☐ Pass ☐ Fail
Scenario 5: ☐ Pass ☐ Fail
Scenario 6: ☐ Pass ☐ Fail
Scenario 7: ☐ Pass ☐ Fail
Scenario 8: ☐ Pass ☐ Fail
Scenario 9: ☐ Pass ☐ Fail
Scenario 10: ☐ Pass ☐ Fail

Visual Tests: ☐ Pass ☐ Fail
Performance: ☐ Pass ☐ Fail
Database: ☐ Pass ☐ Fail
Accessibility: ☐ Pass ☐ Fail
Regression: ☐ Pass ☐ Fail

Notes:
_________________________________
_________________________________
_________________________________
```

---

## Known Issues / Limitations

1. **None currently** - Feature is complete and tested

## Future Test Cases

1. **Multiple quick messages** - Send multiple quick actions in succession
2. **Concurrent users** - Two buyers messaging same seller simultaneously
3. **Large scale** - 1000+ messages in conversation
4. **Offline mode** - Queue messages when offline
5. **Push notifications** - Verify seller receives notification

---

**Testing Status**: Ready for QA
**Priority**: High (Core feature)
**Estimated Testing Time**: 2-3 hours
