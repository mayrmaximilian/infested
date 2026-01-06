-- ============================================
-- MONTHLY LEADERBOARD SYSTEM
-- ============================================

-- Add monthly XP tracking columns to user_stats
ALTER TABLE user_stats 
ADD COLUMN IF NOT EXISTS monthly_xp integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_month date DEFAULT date_trunc('month', CURRENT_DATE)::date;

-- Create index for monthly leaderboard queries
CREATE INDEX IF NOT EXISTS idx_user_stats_monthly_xp ON user_stats(monthly_xp DESC);

-- Function to reset monthly XP (to be called at start of each month)
CREATE OR REPLACE FUNCTION reset_monthly_xp()
RETURNS void AS $$
BEGIN
  UPDATE user_stats
  SET 
    monthly_xp = 0,
    current_month = date_trunc('month', CURRENT_DATE)::date
  WHERE current_month < date_trunc('month', CURRENT_DATE)::date;
END;
$$ LANGUAGE plpgsql;

-- Function to check and reset monthly XP for a user if needed
CREATE OR REPLACE FUNCTION check_and_reset_monthly_xp(p_user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE user_stats
  SET 
    monthly_xp = 0,
    current_month = date_trunc('month', CURRENT_DATE)::date
  WHERE user_id = p_user_id
    AND current_month < date_trunc('month', CURRENT_DATE)::date;
END;
$$ LANGUAGE plpgsql;

-- Update the award_xp function to also add monthly XP
CREATE OR REPLACE FUNCTION award_xp(p_user_id uuid, p_xp integer)
RETURNS TABLE(new_xp integer, new_level integer, leveled_up boolean) AS $$
DECLARE
  v_old_level integer;
  v_new_total_xp integer;
  v_new_level integer;
BEGIN
  -- First check if we need to reset monthly XP
  PERFORM check_and_reset_monthly_xp(p_user_id);
  
  -- Get current level
  SELECT level INTO v_old_level FROM user_stats WHERE user_id = p_user_id;
  
  -- Update XP (both total and monthly)
  UPDATE user_stats
  SET 
    total_xp = total_xp + p_xp,
    monthly_xp = monthly_xp + p_xp,
    updated_at = now()
  WHERE user_id = p_user_id
  RETURNING total_xp INTO v_new_total_xp;
  
  -- Calculate new level
  v_new_level := calculate_level(v_new_total_xp);
  
  -- Update level if changed
  IF v_new_level > v_old_level THEN
    UPDATE user_stats SET level = v_new_level WHERE user_id = p_user_id;
  END IF;
  
  RETURN QUERY SELECT v_new_total_xp, v_new_level, (v_new_level > v_old_level);
END;
$$ LANGUAGE plpgsql;

-- Update existing rows with current month and set initial monthly_xp
UPDATE user_stats 
SET 
  current_month = date_trunc('month', CURRENT_DATE)::date,
  monthly_xp = COALESCE(monthly_xp, 0);

-- Seed some monthly XP for dummy users (randomized)
UPDATE user_stats
SET monthly_xp = floor(random() * 2000 + 100)::integer
WHERE display_name IS NOT NULL;
