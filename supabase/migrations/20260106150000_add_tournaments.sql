-- ============================================
-- SPONSORED TOURNAMENTS SYSTEM
-- ============================================

-- Tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  sponsor_name text NOT NULL,
  sponsor_logo_url text,
  game_id uuid REFERENCES games(id) ON DELETE CASCADE,
  challenge_type text NOT NULL, -- 'leaderboard_rank', 'xp_target', 'follows_target', 'pitches_target'
  challenge_target integer NOT NULL, -- e.g., rank 24, or 500 XP
  prize_description text NOT NULL,
  prize_xp integer DEFAULT 0,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tournament participants/entries
CREATE TABLE IF NOT EXISTS tournament_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_progress integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(tournament_id, user_id)
);

-- Enable RLS
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tournaments
CREATE POLICY "Anyone can view active tournaments" ON tournaments 
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage tournaments" ON tournaments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for tournament_entries
CREATE POLICY "Users can view own entries" ON tournament_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view entry counts" ON tournament_entries
  FOR SELECT USING (true);

CREATE POLICY "Users can join tournaments" ON tournament_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries" ON tournament_entries
  FOR UPDATE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_tournaments_active ON tournaments(is_active, ends_at);
CREATE INDEX idx_tournaments_game ON tournaments(game_id);
CREATE INDEX idx_tournament_entries_tournament ON tournament_entries(tournament_id);
CREATE INDEX idx_tournament_entries_user ON tournament_entries(user_id);

-- Seed some example tournaments
INSERT INTO tournaments (title, description, sponsor_name, sponsor_logo_url, game_id, challenge_type, challenge_target, prize_description, prize_xp, starts_at, ends_at, is_active)
VALUES 
  (
    'Weekly Climb Challenge',
    'Race to the top! Reach rank 24 on the monthly leaderboard this week.',
    'GameFuel Energy',
    NULL,
    NULL,
    'leaderboard_rank',
    24,
    '🎮 $50 Steam Gift Card + 500 XP',
    500,
    date_trunc('week', CURRENT_DATE),
    date_trunc('week', CURRENT_DATE) + interval '7 days',
    true
  ),
  (
    'XP Hunter Sprint',
    'Earn 1000 XP this week through any activity on the platform.',
    'IndieBoost',
    NULL,
    NULL,
    'xp_target',
    1000,
    '🏆 Featured Profile Badge + 250 XP',
    250,
    date_trunc('week', CURRENT_DATE),
    date_trunc('week', CURRENT_DATE) + interval '7 days',
    true
  ),
  (
    'Explorer''s Quest',
    'Follow 10 new games this week and discover hidden gems.',
    'PixelPress',
    NULL,
    NULL,
    'follows_target',
    10,
    '📚 Exclusive Explorer Badge + 300 XP',
    300,
    date_trunc('week', CURRENT_DATE),
    date_trunc('week', CURRENT_DATE) + interval '7 days',
    true
  );
