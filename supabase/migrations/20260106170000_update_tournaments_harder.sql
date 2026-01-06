-- ============================================
-- UPDATE TOURNAMENTS WITH MORE COMPLEX CHALLENGES
-- ============================================

-- Delete existing tournaments and create new, more challenging ones
DELETE FROM tournament_entries;
DELETE FROM tournaments;

-- Insert new challenging tournaments
INSERT INTO tournaments (title, description, sponsor_name, sponsor_logo_url, game_id, challenge_type, challenge_target, prize_description, prize_xp, cash_prize_amount, cash_prize_currency, starts_at, ends_at, is_active)
VALUES 
  (
    'The Grind Masters',
    'Prove your dedication! Earn 5,000 XP this week through follows, pitches, and votes.',
    'GameFuel Energy',
    'https://api.dicebear.com/7.x/shapes/svg?seed=gamefuel&backgroundColor=0f0f18&shape1Color=f97316&shape2Color=fb923c&shape3Color=fdba74',
    NULL,
    'xp_target',
    5000,
    '🎮 $50 Steam Gift Card + Exclusive "Grind Master" Badge',
    500,
    200,
    'EUR',
    date_trunc('week', CURRENT_DATE),
    date_trunc('week', CURRENT_DATE) + interval '7 days',
    true
  ),
  (
    'Leaderboard Domination',
    'Battle your way to the top 10! Only the most active will claim this crown.',
    'IndieBoost',
    'https://api.dicebear.com/7.x/shapes/svg?seed=indieboost&backgroundColor=0f0f18&shape1Color=8b5cf6&shape2Color=a78bfa&shape3Color=c4b5fd',
    NULL,
    'leaderboard_rank',
    10,
    '🏆 "Dominator" Profile Frame + Featured Spotlight',
    750,
    200,
    'EUR',
    date_trunc('week', CURRENT_DATE),
    date_trunc('week', CURRENT_DATE) + interval '7 days',
    true
  ),
  (
    'Pitch Perfect Challenge',
    'Write 15 compelling game pitches this week. Quality meets quantity!',
    'PixelPress',
    'https://api.dicebear.com/7.x/shapes/svg?seed=pixelpress&backgroundColor=0f0f18&shape1Color=06b6d4&shape2Color=22d3ee&shape3Color=67e8f9',
    NULL,
    'pitches_target',
    15,
    '📝 "Wordsmith" Badge + 3-Month Premium Membership',
    600,
    200,
    'EUR',
    date_trunc('week', CURRENT_DATE),
    date_trunc('week', CURRENT_DATE) + interval '7 days',
    true
  );
