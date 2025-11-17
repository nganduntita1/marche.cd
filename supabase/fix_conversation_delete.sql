-- Fix: Add DELETE policy for conversations
-- This allows users to delete conversations they are part of

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can delete their own conversations" ON conversations;

-- Create new DELETE policy
CREATE POLICY "Users can delete their own conversations"
  ON conversations FOR DELETE
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'conversations';
