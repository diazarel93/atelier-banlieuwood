-- Add scheduling + class label to sessions (V2 pre-cockpit)
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS class_label TEXT DEFAULT NULL;

-- Index for filtering by scheduled date
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled_at ON sessions (scheduled_at)
  WHERE scheduled_at IS NOT NULL;
