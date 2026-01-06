-- Allow creators to view rooms they created (needed for insert RETURNING and member adds)
DROP POLICY IF EXISTS "Creators can view chat rooms" ON chat_rooms;
CREATE POLICY "Creators can view chat rooms"
  ON chat_rooms FOR SELECT
  USING (auth.uid() = created_by);
