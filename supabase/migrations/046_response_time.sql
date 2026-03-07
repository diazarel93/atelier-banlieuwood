-- 046: Add response_time_ms to responses + question_opened_at to sessions
-- Captures how long each student takes to answer (for O-I-E profile computation)

ALTER TABLE responses ADD COLUMN IF NOT EXISTS response_time_ms INTEGER DEFAULT NULL;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS question_opened_at TIMESTAMPTZ DEFAULT NULL;
