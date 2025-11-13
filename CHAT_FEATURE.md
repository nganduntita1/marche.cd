# 💬 Real-Time Chat Feature

## Overview
A complete real-time messaging system that allows buyers to chat with sellers directly in the app, with instant message delivery using Supabase real-time subscriptions.

## Features

### ✅ Real-Time Messaging
- **Instant delivery**: Messages appear immediately for both users
- **Real-time updates**: Conversations list updates automatically
- **Read receipts**: Messages are marked as read automatically
- **Typing indicators**: See when messages are being sent

### 📱 User Interface
- **Clean chat UI**: Modern messaging interface with bubbles
- **Conversations list**: See all your chats in one place
- **Listing context**: Each chat shows the related listing
- **User identification**: Clear display of who you're chatting with

### 🔒 Security
- **Row Level Security**: Users can only see their own conversations
- **Authentication required**: Must be logged in to chat
- **Privacy**: Only buyer and seller can access their conversation

## Database Schema

### Tables Created

#### `conversations`
- `id`: UUID (Primary Key)
- `listing_id`: UUID (Foreign Key to listings)
- `buyer_id`: UUID (Foreign Key to users)
- `seller_id`: UUID (Foreign Key to users)
- `last_message`: TEXT
- `last_message_at`: TIMESTAMP
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

#### `messages`
- `id`: UUID (Primary Key)
- `conversation_id`: UUID (Foreign Key to conversations)
- `sender_id`: UUID (Foreign Key to users)
- `content`: TEXT
- `is_read`: BOOLEAN
- `created_at`: TIMESTAMP

## How to Use

### For Buyers
1. **Start a conversation**: Click "Message" button on any listing
2. **Send messages**: Type and send messages to the seller
3. **View conversations**: Access all chats from the Messages tab
4. **Get responses**: Receive real-time notifications when seller replies

### For Sellers
1. **Receive messages**: Get notified when buyers message you
2. **Respond quickly**: Reply directly in the app
3. **Manage conversations**: See all buyer inquiries in one place
4. **Track listings**: Each conversation shows the related listing

## Implementation Details

### Real-Time Subscriptions
```typescript
// Subscribe to new messages
supabase
  .channel(`messages-${conversationId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`
  })
  .subscribe()
```

### Creating a Conversation
```typescript
// Check if conversation exists
const { data } = await supabase
  .from('conversations')
  .select('id')
  .eq('listing_id', listingId)
  .eq('buyer_id', userId)
  .single();

// Create if doesn't exist
if (!data) {
  await supabase.from('conversations').insert({
    listing_id: listingId,
    buyer_id: userId,
    seller_id: sellerId,
  });
}
```

### Sending Messages
```typescript
await supabase.from('messages').insert({
  conversation_id: conversationId,
  sender_id: userId,
  content: messageText,
});
```

## Files Structure

```
app/
├── chat/
│   ├── index.tsx          # Conversations list
│   └── [id].tsx           # Individual chat screen
├── (tabs)/
│   └── messages.tsx       # Messages tab redirect
types/
└── chat.ts                # TypeScript types
supabase/
└── migrations/
    └── 20240108000000_create_chat_tables.sql
```

## Navigation Flow

1. **Listing Page** → Click "Message" → **Chat Screen**
2. **Messages Tab** → Select conversation → **Chat Screen**
3. **Chat Screen** → Send/receive messages in real-time

## Database Migration

Run the migration to create the necessary tables:

```bash
# Apply migration
supabase db push

# Or if using Supabase CLI
supabase migration up
```

## Security Policies

### Conversations
- Users can only view conversations where they are buyer or seller
- Only buyers can create new conversations
- Both parties can update conversation metadata

### Messages
- Users can only view messages in their conversations
- Users can send messages in their conversations
- Users can only update their own messages

## Future Enhancements

- [ ] Push notifications for new messages
- [ ] Image/file sharing in chat
- [ ] Message reactions
- [ ] Typing indicators
- [ ] Online/offline status
- [ ] Message search
- [ ] Conversation archiving
- [ ] Block/report users
- [ ] Message deletion
- [ ] Voice messages

## Testing

1. **Create a listing** as User A
2. **View the listing** as User B
3. **Click "Message"** button
4. **Send a message** from User B
5. **Check Messages tab** for User A
6. **Reply** from User A
7. **Verify real-time** delivery on both sides

## Troubleshooting

### Messages not appearing in real-time
- Check internet connection
- Verify Supabase real-time is enabled
- Check browser console for errors

### Can't create conversation
- Ensure user is logged in
- Verify listing exists
- Check RLS policies are applied

### Conversations not loading
- Check user authentication
- Verify database connection
- Review RLS policies

## Support

For issues or questions about the chat feature, check:
- Supabase real-time documentation
- React Native documentation
- Expo Router documentation
