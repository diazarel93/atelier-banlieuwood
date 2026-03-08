-- ============================================================
-- 064: Creative profile on students + Facilitator observation tags
-- Supports Adrian's M6 profiles (Acteur/Créatif/Détective/Provocateur/Stratège)
-- and M8 observation-based scoring (tags intervenant)
-- ============================================================

-- 1. Add creative_profile to students
ALTER TABLE students ADD COLUMN IF NOT EXISTS creative_profile TEXT DEFAULT NULL;

COMMENT ON COLUMN students.creative_profile IS 'Adrian profile: acteur, creatif, detective, provocateur, stratege (computed from M1 QCM or set manually)';

-- 2. Facilitator observation tags for M8 scoring
CREATE TABLE IF NOT EXISTS facilitator_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  tag TEXT NOT NULL CHECK (tag IN (
    'tres_creatif', 'force_de_proposition', 'bonne_ecoute',
    'tres_investi', 'bonne_cooperation', 'leadership',
    'perturbateur', 'decrochage'
  )),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, student_id, tag)
);

-- RLS
ALTER TABLE facilitator_tags ENABLE ROW LEVEL SECURITY;

-- Facilitator can manage tags
CREATE POLICY "facilitator_tags_admin"
  ON facilitator_tags FOR ALL
  USING (true)
  WITH CHECK (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE facilitator_tags;

-- Index
CREATE INDEX IF NOT EXISTS idx_facilitator_tags_session ON facilitator_tags(session_id);
CREATE INDEX IF NOT EXISTS idx_facilitator_tags_student ON facilitator_tags(session_id, student_id);
