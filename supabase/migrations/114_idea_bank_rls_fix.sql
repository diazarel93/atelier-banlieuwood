-- 114: Fix idea bank RLS — restrict updates to owner + facilitator
-- Previously "Session members can update ideas" allowed any session member to update any idea

DROP POLICY IF EXISTS "Session members can update ideas" ON module10_idea_bank;

CREATE POLICY "Owner can update own ideas" ON module10_idea_bank
  FOR UPDATE
  USING (
    -- Facilitator can moderate any idea in their session
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = module10_idea_bank.session_id
        AND s.facilitator_id = auth.uid()
    )
    OR
    -- Student can only update their own ideas
    EXISTS (
      SELECT 1 FROM students st
      WHERE st.id = module10_idea_bank.student_id
        AND st.session_id = module10_idea_bank.session_id
        AND st.user_id = auth.uid()
    )
  )
  WITH CHECK (
    -- Facilitator can set any value
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = module10_idea_bank.session_id
        AND s.facilitator_id = auth.uid()
    )
    OR
    -- Student must keep their own student_id
    EXISTS (
      SELECT 1 FROM students st
      WHERE st.id = module10_idea_bank.student_id
        AND st.session_id = module10_idea_bank.session_id
        AND st.user_id = auth.uid()
    )
  );
