-- Create game_follows table for tracking which users follow which games
CREATE TABLE IF NOT EXISTS game_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, game_id)
);

-- Enable RLS
ALTER TABLE game_follows ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all follows (for counting)
CREATE POLICY "Anyone can view game follows"
  ON game_follows FOR SELECT
  USING (true);

-- Policy: Users can insert their own follows
CREATE POLICY "Users can follow games"
  ON game_follows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own follows
CREATE POLICY "Users can unfollow games"
  ON game_follows FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_game_follows_user_id ON game_follows(user_id);
CREATE INDEX idx_game_follows_game_id ON game_follows(game_id);

-- Create function to update followers_count on games table
CREATE OR REPLACE FUNCTION update_game_followers_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE games SET followers_count = COALESCE(followers_count, 0) + 1 WHERE id = NEW.game_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE games SET followers_count = GREATEST(COALESCE(followers_count, 0) - 1, 0) WHERE id = OLD.game_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-update followers_count
CREATE TRIGGER on_game_follow_change
  AFTER INSERT OR DELETE ON game_follows
  FOR EACH ROW
  EXECUTE FUNCTION update_game_followers_count();
