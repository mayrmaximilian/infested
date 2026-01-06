-- Align chat_rooms insert policy with authenticated users and enforce created_by
CREATE OR REPLACE FUNCTION set_chat_room_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.created_by := auth.uid();

  IF NEW.is_group THEN
    NEW.direct_user_a := NULL;
    NEW.direct_user_b := NULL;
  ELSE
    NEW.direct_user_a := auth.uid();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS chat_rooms_set_owner ON chat_rooms;
CREATE TRIGGER chat_rooms_set_owner
  BEFORE INSERT ON chat_rooms
  FOR EACH ROW
  EXECUTE FUNCTION set_chat_room_owner();

DROP POLICY IF EXISTS "Creators can create chat rooms" ON chat_rooms;

CREATE POLICY "Authenticated can create chat rooms"
  ON chat_rooms FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
