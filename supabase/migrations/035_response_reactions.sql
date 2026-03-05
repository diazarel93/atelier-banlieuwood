-- Emoji reactions on responses (voting/reviewing phases)
CREATE TABLE IF NOT EXISTS response_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL CHECK (emoji IN ('👍', '❤️', '😂', '🎯', '💡')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(response_id, student_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_reaction_response ON response_reactions(response_id);
CREATE INDEX IF NOT EXISTS idx_reaction_session ON response_reactions(session_id);

-- RLS
ALTER TABLE response_reactions ENABLE ROW LEVEL SECURITY;

-- Anyone can read reactions for a session they belong to
CREATE POLICY "reactions_read" ON response_reactions FOR SELECT USING (true);

-- Students can insert/delete their own reactions
CREATE POLICY "reactions_insert" ON response_reactions FOR INSERT WITH CHECK (true);
CREATE POLICY "reactions_delete" ON response_reactions FOR DELETE USING (true);
