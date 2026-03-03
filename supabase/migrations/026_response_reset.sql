-- ============================================================
-- 026 — Add response reset columns
-- Allows facilitator to "replay" a question for one student
-- or the whole class while preserving the original answer.
-- ============================================================

-- When reset_at is set, the student can re-answer.
-- previous_text stores the original answer before reset.
ALTER TABLE responses ADD COLUMN IF NOT EXISTS reset_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE responses ADD COLUMN IF NOT EXISTS previous_text TEXT DEFAULT NULL;

-- Index for fast filtering of active (non-reset) responses
CREATE INDEX IF NOT EXISTS idx_responses_reset ON responses (session_id, situation_id)
  WHERE reset_at IS NULL;
