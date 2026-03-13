-- ============================================================
-- MODULE 7 — Fiches de tournage (inter-séance M7→M8)
-- 6 fiches par rôle : réalisateur, cadreur, scripte, assistant, son, acteur
-- ============================================================

CREATE TABLE module7_fiches_tournage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  role_key TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  generated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, role_key)
);

CREATE INDEX idx_m7_fiches_session ON module7_fiches_tournage(session_id);

ALTER TABLE module7_fiches_tournage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "m7_fiches_facilitator_read" ON module7_fiches_tournage FOR SELECT
  USING (true);
CREATE POLICY "m7_fiches_service_write" ON module7_fiches_tournage FOR ALL
  USING (auth.role() = 'service_role');
