-- ============================================================
-- 025 — Add sharing_enabled flag to sessions
-- Allows facilitator to enable peer response visibility
-- ============================================================

ALTER TABLE sessions ADD COLUMN IF NOT EXISTS sharing_enabled BOOLEAN DEFAULT false;

-- Index for quick lookup
CREATE INDEX IF NOT EXISTS idx_sessions_sharing ON sessions (id) WHERE sharing_enabled = true;
