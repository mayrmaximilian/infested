-- Create challenges table for game challenges
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'weekly' CHECK (type IN ('daily', 'weekly', 'monthly', 'special')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- Anyone can read challenges for a game
CREATE POLICY "Anyone can view challenges"
  ON challenges FOR SELECT
  USING (true);

-- Only game owners can create challenges
CREATE POLICY "Game owners can create challenges"
  ON challenges FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games WHERE games.id = game_id AND games.owner_id = auth.uid()
    )
  );

-- Only game owners can update challenges
CREATE POLICY "Game owners can update challenges"
  ON challenges FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM games WHERE games.id = game_id AND games.owner_id = auth.uid()
    )
  );

-- Only game owners can delete challenges
CREATE POLICY "Game owners can delete challenges"
  ON challenges FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM games WHERE games.id = game_id AND games.owner_id = auth.uid()
    )
  );

-- Create index for faster lookups
CREATE INDEX challenges_game_id_idx ON challenges(game_id);
