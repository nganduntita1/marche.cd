# Reviews & Ratings System - Implementation Plan

## Overview
A comprehensive review and rating system that builds trust in the marketplace by allowing buyers and sellers to rate each other after transactions.

## User Flow

### 1. Seller Marks Item as Sold
```
Seller opens their listing
↓
Taps "Marquer vendu" button
↓
Modal appears: "Qui a acheté cet article?"
↓
Shows list of users who messaged about this listing
↓
Seller selects the buyer
↓
Listing marked as sold
↓
Transaction record created
↓
Both users get notification to rate each other
```

### 2. Rating Notification
```
User receives notification
↓
Bell icon shows badge (red dot with count)
↓
User taps bell icon
↓
Opens notifications screen
↓
Shows pending rating requests
↓
User taps "Évaluer [Name]"
↓
Rating modal opens
↓
User rates (1-5 stars) + optional comment
↓
Rating saved
↓
Other user sees rating on their profile
```

### 3. Viewing Ratings
```
User profile shows:
- Average rating (4.8 ⭐)
- Total reviews count (24 avis)
- Recent reviews list
- Breakdown by rating (5★: 18, 4★: 4, etc.)
```

## Database Schema

### transactions table
```sql
- id (uuid)
- listing_id (uuid) → listings
- seller_id (uuid) → users
- buyer_id (uuid) → users
- status (pending_rating, completed)
- created_at (timestamp)
```

### reviews table
```sql
- id (uuid)
- transaction_id (uuid) → transactions
- reviewer_id (uuid) → users (who wrote the review)
- reviewee_id (uuid) → users (who is being reviewed)
- rating (integer 1-5)
- comment (text, optional)
- created_at (timestamp)
```

### notifications table
```sql
- id (uuid)
- user_id (uuid) → users
- type (rating_request, rating_received, etc.)
- title (text)
- message (text)
- data (jsonb) - stores transaction_id, etc.
- read (boolean)
- created_at (timestamp)
```

## Features

### For Sellers:
1. Select buyer when marking as sold
2. Rate buyer after transaction
3. View ratings received
4. Respond to reviews (optional)

### For Buyers:
1. Get notified when seller marks item sold
2. Rate seller after transaction
3. View ratings before buying
4. Build reputation

### Notifications:
1. Bell icon with badge count
2. Dedicated notifications screen
3. Rating requests
4. Rating received alerts
5. Mark as read functionality

## UI Components

### 1. SelectBuyerModal
- Shows when seller marks as sold
- Lists users who messaged about listing
- Search/filter functionality
- Confirm selection

### 2. RatingModal
- 5-star rating selector
- Optional comment field
- Submit button
- Shows who you're rating

### 3. NotificationsScreen
- List of all notifications
- Badge for unread count
- Tap to open rating modal
- Mark all as read

### 4. ReviewsList
- On user profiles
- Shows recent reviews
- Rating breakdown
- Pagination

## Implementation Steps

### Phase 1: Database (30 min)
1. Create transactions table
2. Create reviews table
3. Create notifications table
4. Add functions and triggers
5. Set up RLS policies

### Phase 2: Mark as Sold Flow (45 min)
1. Update "Mark as Sold" button
2. Create SelectBuyerModal
3. Fetch users who messaged
4. Create transaction record
5. Generate notifications

### Phase 3: Notifications System (1 hour)
1. Create notifications screen
2. Bell icon with badge
3. Fetch and display notifications
4. Mark as read functionality
5. Real-time updates

### Phase 4: Rating Flow (45 min)
1. Create RatingModal
2. Submit rating
3. Update user stats
4. Send notification to rated user

### Phase 5: Display Ratings (45 min)
1. Add ratings to user profiles
2. Calculate average rating
3. Show recent reviews
4. Rating breakdown chart

## Benefits

### Trust Building:
- Verified transactions
- Public ratings
- Accountability
- Reputation system

### User Safety:
- Identify bad actors
- Reward good behavior
- Community moderation
- Transparent history

### Marketplace Growth:
- Increased confidence
- More transactions
- Better user experience
- Competitive advantage

## Next Steps

Ready to implement? I'll create:
1. Database migration
2. SelectBuyerModal component
3. RatingModal component
4. Notifications screen
5. Integration with existing features

Let's build this! 🚀
