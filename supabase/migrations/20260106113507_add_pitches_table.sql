-- Create pitches table for feature suggestions
CREATE TABLE IF NOT EXISTS pitches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create pitch_votes table to track who voted for what
CREATE TABLE IF NOT EXISTS pitch_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pitch_id UUID NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(pitch_id, user_id) -- One vote per user per pitch
);

-- Enable RLS
ALTER TABLE pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitch_votes ENABLE ROW LEVEL SECURITY;

-- Pitches policies
-- Anyone can view pitches
CREATE POLICY "Anyone can view pitches"
  ON pitches FOR SELECT
  USING (true);

-- Authenticated users can create pitches
CREATE POLICY "Authenticated users can create pitches"
  ON pitches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own pitches
CREATE POLICY "Users can update own pitches"
  ON pitches FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own pitches, game owners can delete any
CREATE POLICY "Users or game owners can delete pitches"
  ON pitches FOR DELETE
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM games WHERE games.id = game_id AND games.owner_id = auth.uid())
  );

-- Pitch votes policies
-- Anyone can view votes
CREATE POLICY "Anyone can view pitch votes"
  ON pitch_votes FOR SELECT
  USING (true);

-- Authenticated users can vote
CREATE POLICY "Authenticated users can vote"
  ON pitch_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their own votes
CREATE POLICY "Users can remove own votes"
  ON pitch_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for faster lookups
CREATE INDEX pitches_game_id_idx ON pitches(game_id);
CREATE INDEX pitches_vote_count_idx ON pitches(vote_count DESC);
CREATE INDEX pitch_votes_pitch_id_idx ON pitch_votes(pitch_id);
CREATE INDEX pitch_votes_user_id_idx ON pitch_votes(user_id);

-- Function to update vote count on pitches
CREATE OR REPLACE FUNCTION update_pitch_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE pitches SET vote_count = vote_count + 1, updated_at = now() WHERE id = NEW.pitch_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE pitches SET vote_count = vote_count - 1, updated_at = now() WHERE id = OLD.pitch_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update vote counts
CREATE TRIGGER pitch_vote_count_trigger
  AFTER INSERT OR DELETE ON pitch_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_pitch_vote_count();
