-- 051: Enable RLS on session_oie_scores and add facilitator policy
-- Without this, the authenticated role cannot read OIE scores through PostgREST

ALTER TABLE session_oie_scores ENABLE ROW LEVEL SECURITY;

-- Facilitators can read OIE scores for students in their sessions
CREATE POLICY "facilitator_oie_scores_select" ON session_oie_scores
  FOR SELECT USING (
    session_id IN (SELECT id FROM sessions WHERE facilitator_id = auth.uid())
  );

-- Facilitators can insert/update OIE scores for their sessions (used by analyze endpoint)
CREATE POLICY "facilitator_oie_scores_insert" ON session_oie_scores
  FOR INSERT WITH CHECK (
    session_id IN (SELECT id FROM sessions WHERE facilitator_id = auth.uid())
  );

CREATE POLICY "facilitator_oie_scores_update" ON session_oie_scores
  FOR UPDATE USING (
    session_id IN (SELECT id FROM sessions WHERE facilitator_id = auth.uid())
  );

-- Service role (used by simulation script) bypasses RLS automatically
