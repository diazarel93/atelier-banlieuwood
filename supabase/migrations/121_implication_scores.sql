-- B8_2: Implication scoring system (Banlieuwood native, replaces OIE)
-- Structure ready for when Banlieuwood specifies the exact mapping.
-- DO NOT populate this table until the spec is confirmed.

CREATE TABLE IF NOT EXISTS implication_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  -- 3 sources per spec B8_2:
  -- 1. Participation level (1=description, 2=+analysis, 3=+interpretation)
  participation_level INT CHECK (participation_level BETWEEN 1 AND 3),
  -- 2. Notebook score (carnet d'idées)
  notebook_score INT DEFAULT 0,
  -- 3. Facilitator observation tags
  observer_tags JSONB DEFAULT '[]',
  -- Computed total (algorithm TBD by Banlieuwood)
  total_score INT DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id, student_id)
);

ALTER TABLE implication_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY facilitator_implication_select ON implication_scores
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM sessions s WHERE s.id = session_id AND s.facilitator_id = auth.uid())
  );

CREATE POLICY facilitator_implication_insert ON implication_scores
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM sessions s WHERE s.id = session_id AND s.facilitator_id = auth.uid())
  );
