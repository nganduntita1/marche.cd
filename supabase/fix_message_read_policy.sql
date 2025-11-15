-- Quick fix for message read status
-- Run this in your Supabase SQL Editor

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;

-- Create a new policy that allows users to update messages in their conversations
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

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_messages_conversation_read ON messages(conversation_id, is_read);

-- Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'messages' 
  AND policyname = 'Users can update messages in their conversations';
