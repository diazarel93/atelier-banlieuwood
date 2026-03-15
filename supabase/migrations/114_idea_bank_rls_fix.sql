-- 114: Fix idea bank RLS — restrict updates to facilitator only
-- Students interact via service-role API calls, not via RLS.
-- Previously "Session members can update ideas" was too permissive.

DROP POLICY IF EXISTS "Session members can update ideas" ON module10_idea_bank;

CREATE POLICY "Facilitator can update ideas" ON module10_idea_bank
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = module10_idea_bank.session_id
        AND s.facilitator_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = module10_idea_bank.session_id
        AND s.facilitator_id = auth.uid()
    )
  );
