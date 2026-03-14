-- 113: Performance indexes for hot paths
-- Targeting: situation handler, vote queries, student lists, active sessions

-- Composite index for situation handler response lookups
CREATE INDEX IF NOT EXISTS idx_responses_session_situation
  ON responses(session_id, situation_id);

-- Partial index for vote option queries (voting phase)
CREATE INDEX IF NOT EXISTS idx_responses_vote_options
  ON responses(session_id, situation_id)
  WHERE is_vote_option = true AND is_hidden = false;

-- Partial index for active students (connected count)
CREATE INDEX IF NOT EXISTS idx_students_active
  ON students(session_id)
  WHERE is_active = true;

-- Partial index for active sessions (dashboard queries)
CREATE INDEX IF NOT EXISTS idx_sessions_active_status
  ON sessions(status)
  WHERE status NOT IN ('done', 'paused') AND deleted_at IS NULL;

-- Composite index for response submission checks (reset_at filter)
CREATE INDEX IF NOT EXISTS idx_responses_session_submitted
  ON responses(session_id, situation_id, submitted_at)
  WHERE reset_at IS NULL;
