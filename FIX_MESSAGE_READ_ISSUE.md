# Fix Message Read Status Issue

## Root Cause

The RLS (Row Level Security) policy on the `messages` table was too restrictive. It only allowed users to update messages **they sent**, but users need to be able to mark messages **they received** as read.

### Old Policy (Problematic)
```sql
CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING (sender_id = auth.uid());
```

This prevented users from marking received messages as read because they weren't the sender.

### New Policy (Fixed)
```sql
CREATE POLICY "Users can update messages in their conversations"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    )
  );
```

This allows users to update any message in conversations they're part of (as buyer or seller).

## How to Fix

### Option 1: Run SQL Script (Quickest)

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `supabase/fix_message_read_policy.sql`
4. Click **Run**
5. Verify you see "1 row" in the results (confirming the policy was created)

### Option 2: Run Migration

```bash
# If using Supabase CLI
supabase db push
```

This will apply the migration file: `supabase/migrations/20240116000000_fix_message_update_policy.sql`

## What This Fixes

✅ Users can now mark received messages as read
✅ Unread counts update correctly
✅ Messages marked as read when chat is opened
✅ Real-time read status updates work
✅ Badge counts update across all screens

## Performance Improvements

The fix also adds two indexes for better performance:

1. **Partial index on unread messages**: Speeds up queries for unread messages
2. **Composite index**: Optimizes queries that filter by conversation and read status

## Testing

After applying the fix:

1. Open a chat with unread messages
2. Messages should be marked as read immediately
3. Unread count should decrease
4. Badge on Messages tab should update
5. Send a message from another device
6. It should be marked as read when you view it

## Security

The new policy is still secure:
- Users can only update messages in conversations they're part of
- Users cannot update messages in other people's conversations
- The policy checks both buyer_id and seller_id to ensure access

## Rollback (if needed)

If you need to rollback to the old policy:

```sql
DROP POLICY IF EXISTS "Users can update messages in their conversations" ON messages;

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING (sender_id = auth.uid());
```

(Note: This will break the read status feature again)
