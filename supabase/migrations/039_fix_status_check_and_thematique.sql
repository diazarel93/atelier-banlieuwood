-- Fix BUG 2: Add 'results' to session status CHECK constraint
-- Fix BUG 3: Add missing 'thematique' column to sessions table

-- Drop old CHECK constraint and add updated one with 'results'
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_status_check;
ALTER TABLE sessions ADD CONSTRAINT sessions_status_check
  CHECK (status IN ('waiting', 'responding', 'reviewing', 'voting', 'paused', 'done', 'results'));

-- Add thematique column (optional, used for session theming)
DO $$ BEGIN
  ALTER TABLE sessions ADD COLUMN thematique TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
