-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;

-- Create a new policy that allows users to update messages in their conversations
-- This allows marking messages as read
CREATE POLICY "Users can update messages in their conversations"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    )
  );

-- Add an index on is_read for better performance when querying unread messages
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read) WHERE is_read = false;

-- Add a composite index for common queries (conversation + read status)
CREATE INDEX IF NOT EXISTS idx_messages_conversation_read ON messages(conversation_id, is_read);
