-- Extend formula to support F0 (Découverte) and F1 (Légère)
-- F3 (role rotation) is retired — merge into F2

-- Drop old constraint
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_formula_check;

-- Migrate F3 → F2 (role rotation now handled separately)
UPDATE sessions SET formula = 'F2' WHERE formula = 'F3';

-- Add new constraint with F0/F1/F2
ALTER TABLE sessions ADD CONSTRAINT sessions_formula_check
  CHECK (formula IN ('F0', 'F1', 'F2'));

ALTER TABLE sessions ALTER COLUMN formula SET DEFAULT 'F0';

COMMENT ON COLUMN sessions.formula IS 'F0: Découverte (1 séance), F1: Légère (~3 séances), F2: Complète (~8 séances)';
