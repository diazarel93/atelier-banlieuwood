-- ============================================================
-- Add formula field to sessions (F2 = fixed roles, F3 = role rotation)
-- ============================================================

ALTER TABLE sessions ADD COLUMN IF NOT EXISTS formula TEXT DEFAULT 'F2'
  CHECK (formula IN ('F2', 'F3'));

COMMENT ON COLUMN sessions.formula IS 'F2: roles fixes, F3: rotation de postes sur 2 demi-journées';
