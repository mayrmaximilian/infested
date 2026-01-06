-- Add cover_url column for 4:5 aspect ratio game cover image
ALTER TABLE games ADD COLUMN IF NOT EXISTS cover_url TEXT;
