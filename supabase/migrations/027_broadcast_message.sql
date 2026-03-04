-- Add broadcast message support to sessions
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS broadcast_message TEXT DEFAULT NULL;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS broadcast_at TIMESTAMPTZ DEFAULT NULL;
