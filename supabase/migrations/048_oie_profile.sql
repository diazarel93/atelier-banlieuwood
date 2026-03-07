-- 048: O-I-E creative profile scores (per session + aggregated on student profiles)

CREATE TABLE session_oie_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  observation INTEGER NOT NULL DEFAULT 0,
  imagination INTEGER NOT NULL DEFAULT 0,
  expression INTEGER NOT NULL DEFAULT 0,
  dominant TEXT,
  response_count INTEGER DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, student_id)
);

ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS oie_observation INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS oie_imagination INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS oie_expression INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS oie_dominant TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS oie_response_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS oie_computed_at TIMESTAMPTZ DEFAULT NULL;
