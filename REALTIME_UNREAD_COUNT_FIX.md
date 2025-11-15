# Real-time Unread Count Fix

## Problem
The unread count was accurate but not updating in real-time. Users had to refresh or wait for the polling interval to see updated counts.

## Root Cause
The app was only listening to:
1. Broadcast events (which might arrive before database insert)
2. Conversation updates (which happen after the message is inserted)
3. Message updates (only for read status changes)

But it wasn't listening to **message INSERT events** directly from the database.

## Solution

Added a real-time subscription to the `messages` table INSERT events.

### Implementation

```typescript
const messagesInsertChannel = supabase.channel('messages-insert-events');
messagesInsertChannel.on(
  'postgres_changes',
  {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
  },
  (payload) => {
    const newMessage = payload.new;
    
    // Only update count if message is from another user
    if (newMessage.sender_id !== user.id) {
      // Fetch actual unread count from database
      supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', newMessage.conversation_id)
        .neq('sender_id', user.id)
        .eq('is_read', false)
        .then(({ count }) => {
          setUnreadCounts((prev) => ({
            ...prev,
            [newMessage.conversation_id]: count,
          }));
          refreshUnreadCount();
        });
    }
  }
);
```

## How It Works

1. **Message sent** → Inserted into database
2. **Postgres notifies** → INSERT event triggered
3. **App receives event** → Immediately after database insert
4. **Check sender** → Only count if not from current user
5. **Fetch count** → Get accurate count from database
6. **Update UI** → Badge updates instantly
7. **User sees** → Real-time unread count

## Multiple Layers of Real-time Updates

The messages list now has **5 real-time mechanisms**:

1. **Broadcast Events** → Instant notifications (fastest)
2. **Conversations Updates** → When last_message changes
3. **Messages INSERT** → When new messages are added (NEW!)
4. **Messages UPDATE** → When messages are marked as read
5. **Polling Fallback** → Every 2 seconds as backup

## Benefits

✅ **Instant Updates**: Count updates immediately when messages arrive
✅ **Reliable**: Multiple mechanisms ensure no updates are missed
✅ **Accurate**: Always fetches real count from database
✅ **Real-time**: No need to refresh or wait
✅ **Responsive**: Users see changes as they happen

## Performance

- **Event-driven**: Only updates when messages actually arrive
- **Efficient queries**: Uses count with head (no data transfer)
- **Indexed**: Fast queries on conversation_id and is_read
- **Minimal overhead**: Only runs when needed

## Testing

After this fix:

1. Have someone send you a message
2. Unread count should update **immediately**
3. No need to refresh or wait
4. Send multiple messages quickly
5. Count should update for each one in real-time
6. Open the chat
7. Count should go to 0 immediately

## Edge Cases Handled

✅ Multiple messages arriving quickly
✅ Messages from different conversations
✅ Your own messages (not counted)
✅ Network delays or reconnections
✅ App in background/foreground
✅ Missed events (polling catches them)

## Technical Details

**Channel Name**: `messages-insert-events`
**Event Type**: `INSERT`
**Table**: `messages`
**Filter**: None (listens to all inserts, filters in handler)

**Cleanup**: Channel is properly removed on unmount to prevent memory leaks.

## Comparison: Before vs After

### Before
- ❌ Count updates only on polling (2 second delay)
- ❌ Or when conversation updates (might be delayed)
- ❌ Not truly real-time

### After
- ✅ Count updates instantly on message insert
- ✅ Multiple real-time mechanisms
- ✅ True real-time experience
- ✅ Backup polling for reliability
