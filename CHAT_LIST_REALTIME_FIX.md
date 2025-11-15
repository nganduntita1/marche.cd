# Chat List Real-time Update Fix

## Problem
The chat list was showing unread indicators but displaying old message text instead of the latest message. This happened because:

1. The database trigger correctly updated `last_message` in the conversations table
2. But the UI wasn't subscribed to conversations table updates
3. So the UI only saw the old cached message text

## Solution

Added a real-time subscription to the `conversations` table UPDATE events.

### Implementation

```typescript
const conversationsChannel = supabase.channel('conversations-updates');
conversationsChannel.on(
  'postgres_changes',
  {
    event: 'UPDATE',
    schema: 'public',
    table: 'conversations',
  },
  (payload) => {
    const updatedConv = payload.new;
    
    // Update the conversation in state with new last_message
    setConversations((prev) => {
      return prev.map((conv) => {
        if (conv.id === updatedConv.id) {
          return {
            ...conv,
            last_message: updatedConv.last_message,
            last_message_at: updatedConv.last_message_at,
            updated_at: updatedConv.updated_at,
          };
        }
        return conv;
      });
    });
  }
);
```

## How It Works

1. **User sends message** → Message inserted into `messages` table
2. **Database trigger fires** → Updates `last_message` in `conversations` table
3. **Postgres notifies** → Real-time UPDATE event sent to subscribed clients
4. **UI receives event** → Updates conversation state with new message text
5. **User sees update** → Latest message appears immediately in chat list

## Benefits

✅ **Instant Updates**: Message text updates in real-time
✅ **No Polling Needed**: Uses efficient database notifications
✅ **Accurate Display**: Always shows the actual latest message
✅ **Better UX**: Users see what was actually sent
✅ **Scalable**: Works efficiently even with many conversations

## Multiple Update Mechanisms

The messages list now has multiple ways to stay updated:

1. **Broadcast Events**: For instant message notifications
2. **Conversations Subscription**: For last_message updates (NEW!)
3. **Messages Subscription**: For read status tracking
4. **Polling Fallback**: Every 2 seconds as backup
5. **Focus Refresh**: When screen comes into view

## Testing

After this fix:

1. Send a message in a chat
2. Go back to messages list
3. The latest message text should appear immediately
4. Unread indicator should be accurate
5. Message preview matches what was actually sent

## Technical Details

**Channel Name**: `conversations-updates`
**Event Type**: `UPDATE`
**Table**: `conversations`
**Fields Updated**: 
- `last_message`
- `last_message_at`
- `updated_at`

**Cleanup**: Channel is properly removed when component unmounts to prevent memory leaks.
