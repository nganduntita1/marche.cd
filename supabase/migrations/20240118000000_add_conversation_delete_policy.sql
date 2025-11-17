-- Add DELETE policy for conversations
-- Users can delete conversations they are part of
CREATE POLICY "Users can delete their own conversations"
  ON conversations FOR DELETE
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
