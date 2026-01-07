-- Create game_updates table
CREATE TABLE game_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  update_type TEXT NOT NULL CHECK (update_type IN ('patch', 'major', 'hotfix', 'announcement')),
  version TEXT,
  released_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_game_updates_game_id ON game_updates(game_id);
CREATE INDEX idx_game_updates_released_at ON game_updates(released_at DESC);

-- Enable RLS
ALTER TABLE game_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can view game updates
CREATE POLICY "Anyone can view game updates"
  ON game_updates
  FOR SELECT
  USING (true);

-- RLS Policy: Only game owner can insert updates
CREATE POLICY "Game owner can insert updates"
  ON game_updates
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_updates.game_id
      AND games.owner_id = auth.uid()
    )
  );

-- RLS Policy: Only game owner can update their updates
CREATE POLICY "Game owner can update their updates"
  ON game_updates
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_updates.game_id
      AND games.owner_id = auth.uid()
    )
  );

-- RLS Policy: Only game owner can delete their updates
CREATE POLICY "Game owner can delete their updates"
  ON game_updates
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_updates.game_id
      AND games.owner_id = auth.uid()
    )
  );
