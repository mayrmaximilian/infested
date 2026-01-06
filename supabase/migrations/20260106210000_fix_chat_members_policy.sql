-- Fix recursive RLS policy on chat_members
CREATE OR REPLACE FUNCTION is_chat_member(p_room_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM chat_members
    WHERE room_id = p_room_id
      AND user_id = p_user_id
  );
$$;

DROP POLICY IF EXISTS "Members can view chat members" ON chat_members;

CREATE POLICY "Members can view chat members"
  ON chat_members FOR SELECT
  USING (is_chat_member(room_id, auth.uid()));
