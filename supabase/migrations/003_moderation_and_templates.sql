-- Moderation: allow facilitator to hide responses before vote
ALTER TABLE responses ADD COLUMN is_hidden BOOLEAN DEFAULT false;

-- Templates: store genre template on session
ALTER TABLE sessions ADD COLUMN template TEXT;

-- RLS: facilitator can update responses in their sessions (for moderation)
CREATE POLICY "facilitator_session_responses_update" ON responses
  FOR UPDATE USING (
    session_id IN (SELECT id FROM sessions WHERE facilitator_id = auth.uid())
  );
