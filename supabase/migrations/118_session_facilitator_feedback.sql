-- D11: Post-session facilitator feedback
-- Non-blocking, optional form after session close
-- 4 closed questions (1-5 scale) + 1 optional free text

CREATE TABLE IF NOT EXISTS session_facilitator_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  -- 4 closed questions (1-5 Likert scale)
  energy_level INT NOT NULL CHECK (energy_level BETWEEN 1 AND 5),
  participation_quality INT NOT NULL CHECK (participation_quality BETWEEN 1 AND 5),
  tool_ease INT NOT NULL CHECK (tool_ease BETWEEN 1 AND 5),
  would_redo INT NOT NULL CHECK (would_redo BETWEEN 1 AND 5),
  -- Optional free text
  notes TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id)
);

-- RLS: only the session facilitator can insert/read
ALTER TABLE session_facilitator_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY facilitator_feedback_insert ON session_facilitator_feedback
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions s WHERE s.id = session_id AND s.facilitator_id = auth.uid()
    )
  );

CREATE POLICY facilitator_feedback_select ON session_facilitator_feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sessions s WHERE s.id = session_id AND s.facilitator_id = auth.uid()
    )
  );
