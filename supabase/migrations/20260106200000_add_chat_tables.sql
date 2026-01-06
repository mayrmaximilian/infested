-- Chat rooms for direct + group conversations
CREATE TABLE IF NOT EXISTS chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  is_group boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  direct_user_a uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  direct_user_b uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX chat_rooms_direct_unique
  ON chat_rooms (LEAST(direct_user_a, direct_user_b), GREATEST(direct_user_a, direct_user_b))
  WHERE direct_user_a IS NOT NULL AND direct_user_b IS NOT NULL;

CREATE INDEX chat_rooms_created_by_idx ON chat_rooms(created_by);

-- Members for each room
CREATE TABLE IF NOT EXISTS chat_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(room_id, user_id)
);

CREATE INDEX chat_members_room_id_idx ON chat_members(room_id);
CREATE INDEX chat_members_user_id_idx ON chat_members(user_id);

-- Messages within rooms
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX chat_messages_room_id_idx ON chat_messages(room_id);
CREATE INDEX chat_messages_sender_id_idx ON chat_messages(sender_id);
CREATE INDEX chat_messages_created_at_idx ON chat_messages(created_at);

-- RLS
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Rooms: members can view
CREATE POLICY "Members can view chat rooms"
  ON chat_rooms FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_members
      WHERE chat_members.room_id = chat_rooms.id
      AND chat_members.user_id = auth.uid()
    )
  );

-- Rooms: creator can insert
CREATE POLICY "Creators can create chat rooms"
  ON chat_rooms FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Rooms: creator can update/delete
CREATE POLICY "Creators can manage chat rooms"
  ON chat_rooms FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can delete chat rooms"
  ON chat_rooms FOR DELETE
  USING (auth.uid() = created_by);

-- Members: room members can view
CREATE POLICY "Members can view chat members"
  ON chat_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_members AS cm
      WHERE cm.room_id = chat_members.room_id
      AND cm.user_id = auth.uid()
    )
  );

-- Members: user can add self or creator can add others
CREATE POLICY "Members can be added"
  ON chat_members FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = chat_members.room_id
      AND chat_rooms.created_by = auth.uid()
    )
  );

-- Members: user can leave or creator can remove
CREATE POLICY "Members can be removed"
  ON chat_members FOR DELETE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = chat_members.room_id
      AND chat_rooms.created_by = auth.uid()
    )
  );

-- Messages: members can view
CREATE POLICY "Members can view messages"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_members
      WHERE chat_members.room_id = chat_messages.room_id
      AND chat_members.user_id = auth.uid()
    )
  );

-- Messages: members can send
CREATE POLICY "Members can send messages"
  ON chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM chat_members
      WHERE chat_members.room_id = chat_messages.room_id
      AND chat_members.user_id = auth.uid()
    )
  );
