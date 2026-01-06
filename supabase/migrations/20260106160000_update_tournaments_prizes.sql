-- ============================================
-- UPDATE TOURNAMENTS WITH CASH PRIZES & LOGOS
-- ============================================

-- Add cash_prize column for the overall winner
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS cash_prize_amount integer DEFAULT 0;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS cash_prize_currency text DEFAULT 'EUR';

-- Update existing tournaments with cash prizes and sponsor logos
UPDATE tournaments 
SET 
  cash_prize_amount = 200,
  sponsor_logo_url = 'https://api.dicebear.com/7.x/shapes/svg?seed=gamefuel&backgroundColor=0f0f18&shape1Color=f97316&shape2Color=fb923c&shape3Color=fdba74'
WHERE sponsor_name = 'GameFuel Energy';

UPDATE tournaments 
SET 
  cash_prize_amount = 200,
  sponsor_logo_url = 'https://api.dicebear.com/7.x/shapes/svg?seed=indieboost&backgroundColor=0f0f18&shape1Color=8b5cf6&shape2Color=a78bfa&shape3Color=c4b5fd'
WHERE sponsor_name = 'IndieBoost';

UPDATE tournaments 
SET 
  cash_prize_amount = 200,
  sponsor_logo_url = 'https://api.dicebear.com/7.x/shapes/svg?seed=pixelpress&backgroundColor=0f0f18&shape1Color=06b6d4&shape2Color=22d3ee&shape3Color=67e8f9'
WHERE sponsor_name = 'PixelPress';
