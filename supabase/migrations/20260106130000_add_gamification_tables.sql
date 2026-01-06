-- ============================================
-- GAMIFICATION SYSTEM FOR INFESTED
-- ============================================

-- User XP & Levels Table
CREATE TABLE IF NOT EXISTS user_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  xp integer DEFAULT 0,
  level integer DEFAULT 1,
  total_xp integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_activity_date date,
  games_followed integer DEFAULT 0,
  pitches_submitted integer DEFAULT 0,
  pitches_voted integer DEFAULT 0,
  challenges_completed integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Achievements/Badges Definition Table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL, -- emoji or icon name
  category text NOT NULL, -- 'social', 'explorer', 'creator', 'streak', 'milestone'
  xp_reward integer DEFAULT 0,
  rarity text DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  requirement_type text NOT NULL, -- 'games_followed', 'pitches_submitted', 'streak', etc.
  requirement_value integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- User Achievements (unlocked badges)
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- XP Activity Log (for history/debugging)
CREATE TABLE IF NOT EXISTS xp_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  xp_gained integer NOT NULL,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_stats
CREATE POLICY "Anyone can view user stats" ON user_stats FOR SELECT USING (true);
CREATE POLICY "Users can update own stats" ON user_stats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert stats" ON user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for achievements
CREATE POLICY "Anyone can view achievements" ON achievements FOR SELECT USING (true);

-- RLS Policies for user_achievements
CREATE POLICY "Anyone can view user achievements" ON user_achievements FOR SELECT USING (true);
CREATE POLICY "System can insert user achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for xp_log
CREATE POLICY "Users can view own xp log" ON xp_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert xp log" ON xp_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX idx_user_stats_xp ON user_stats(total_xp DESC);
CREATE INDEX idx_user_stats_level ON user_stats(level DESC);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_xp_log_user_id ON xp_log(user_id);

-- ============================================
-- SEED ACHIEVEMENTS
-- ============================================

INSERT INTO achievements (slug, name, description, icon, category, xp_reward, rarity, requirement_type, requirement_value) VALUES
-- Explorer Achievements (Following Games)
('first_follow', 'First Contact', 'Follow your first game', '👋', 'explorer', 50, 'common', 'games_followed', 1),
('five_follows', 'Curious Gamer', 'Follow 5 games', '🔍', 'explorer', 100, 'common', 'games_followed', 5),
('ten_follows', 'Game Hunter', 'Follow 10 games', '🎯', 'explorer', 200, 'rare', 'games_followed', 10),
('twenty_five_follows', 'Collection Master', 'Follow 25 games', '📚', 'explorer', 500, 'epic', 'games_followed', 25),
('fifty_follows', 'Indie Connoisseur', 'Follow 50 games', '👑', 'explorer', 1000, 'legendary', 'games_followed', 50),

-- Creator Achievements (Submitting Pitches)
('first_pitch', 'Idea Spark', 'Submit your first pitch', '💡', 'creator', 75, 'common', 'pitches_submitted', 1),
('five_pitches', 'Creative Mind', 'Submit 5 pitches', '🧠', 'creator', 150, 'common', 'pitches_submitted', 5),
('ten_pitches', 'Innovation Engine', 'Submit 10 pitches', '🚀', 'creator', 300, 'rare', 'pitches_submitted', 10),
('twenty_five_pitches', 'Visionary', 'Submit 25 pitches', '🔮', 'creator', 750, 'epic', 'pitches_submitted', 25),

-- Social Achievements (Voting)
('first_vote', 'Voice Heard', 'Vote on your first pitch', '🗳️', 'social', 25, 'common', 'pitches_voted', 1),
('ten_votes', 'Community Supporter', 'Vote on 10 pitches', '🤝', 'social', 100, 'common', 'pitches_voted', 10),
('fifty_votes', 'Democracy Champion', 'Vote on 50 pitches', '⚖️', 'social', 300, 'rare', 'pitches_voted', 50),
('hundred_votes', 'Kingmaker', 'Vote on 100 pitches', '🏛️', 'social', 750, 'epic', 'pitches_voted', 100),

-- Streak Achievements
('three_day_streak', 'Getting Started', '3 day activity streak', '🔥', 'streak', 50, 'common', 'current_streak', 3),
('seven_day_streak', 'Week Warrior', '7 day activity streak', '⚡', 'streak', 150, 'rare', 'current_streak', 7),
('fourteen_day_streak', 'Dedicated', '14 day activity streak', '💪', 'streak', 400, 'epic', 'current_streak', 14),
('thirty_day_streak', 'Unstoppable', '30 day activity streak', '🌟', 'streak', 1000, 'legendary', 'current_streak', 30),

-- Milestone Achievements (Total XP)
('reach_level_5', 'Rising Star', 'Reach level 5', '⭐', 'milestone', 0, 'common', 'level', 5),
('reach_level_10', 'Veteran', 'Reach level 10', '🌟', 'milestone', 0, 'rare', 'level', 10),
('reach_level_25', 'Elite', 'Reach level 25', '💎', 'milestone', 0, 'epic', 'level', 25),
('reach_level_50', 'Legend', 'Reach level 50', '🏆', 'milestone', 0, 'legendary', 'level', 50);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to calculate level from XP (uses a curve)
CREATE OR REPLACE FUNCTION calculate_level(total_xp integer)
RETURNS integer AS $$
BEGIN
  -- Level formula: level = floor(sqrt(total_xp / 100)) + 1
  -- Level 1: 0 XP, Level 2: 100 XP, Level 5: 1600 XP, Level 10: 8100 XP
  RETURN GREATEST(1, FLOOR(SQRT(total_xp::float / 100)) + 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get XP needed for next level
CREATE OR REPLACE FUNCTION xp_for_level(lvl integer)
RETURNS integer AS $$
BEGIN
  RETURN ((lvl - 1) * (lvl - 1)) * 100;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to award XP and check achievements
CREATE OR REPLACE FUNCTION award_xp(
  p_user_id uuid,
  p_action text,
  p_xp integer,
  p_details jsonb DEFAULT '{}'
)
RETURNS TABLE(new_xp integer, new_level integer, leveled_up boolean) AS $$
DECLARE
  v_old_level integer;
  v_new_level integer;
  v_new_total_xp integer;
BEGIN
  -- Ensure user_stats record exists
  INSERT INTO user_stats (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Get current level
  SELECT level INTO v_old_level FROM user_stats WHERE user_id = p_user_id;

  -- Update XP
  UPDATE user_stats
  SET 
    xp = xp + p_xp,
    total_xp = total_xp + p_xp,
    updated_at = now()
  WHERE user_id = p_user_id
  RETURNING total_xp INTO v_new_total_xp;

  -- Calculate new level
  v_new_level := calculate_level(v_new_total_xp);

  -- Update level if changed
  IF v_new_level > v_old_level THEN
    UPDATE user_stats SET level = v_new_level WHERE user_id = p_user_id;
  END IF;

  -- Log the XP gain
  INSERT INTO xp_log (user_id, action, xp_gained, details)
  VALUES (p_user_id, p_action, p_xp, p_details);

  RETURN QUERY SELECT v_new_total_xp, v_new_level, (v_new_level > v_old_level);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update streak
CREATE OR REPLACE FUNCTION update_streak(p_user_id uuid)
RETURNS integer AS $$
DECLARE
  v_last_date date;
  v_today date := CURRENT_DATE;
  v_new_streak integer;
BEGIN
  -- Ensure user_stats record exists
  INSERT INTO user_stats (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT last_activity_date, current_streak INTO v_last_date, v_new_streak
  FROM user_stats WHERE user_id = p_user_id;

  IF v_last_date IS NULL OR v_last_date < v_today - 1 THEN
    -- Streak broken or first activity
    v_new_streak := 1;
  ELSIF v_last_date = v_today - 1 THEN
    -- Consecutive day
    v_new_streak := COALESCE(v_new_streak, 0) + 1;
  ELSIF v_last_date = v_today THEN
    -- Same day, no change
    RETURN v_new_streak;
  END IF;

  UPDATE user_stats
  SET 
    current_streak = v_new_streak,
    longest_streak = GREATEST(COALESCE(longest_streak, 0), v_new_streak),
    last_activity_date = v_today
  WHERE user_id = p_user_id;

  RETURN v_new_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment stat and check achievements
CREATE OR REPLACE FUNCTION increment_stat(
  p_user_id uuid,
  p_stat_name text
)
RETURNS void AS $$
BEGIN
  -- Ensure user_stats record exists
  INSERT INTO user_stats (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Increment the specific stat
  EXECUTE format('UPDATE user_stats SET %I = COALESCE(%I, 0) + 1, updated_at = now() WHERE user_id = $1', p_stat_name, p_stat_name)
  USING p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
