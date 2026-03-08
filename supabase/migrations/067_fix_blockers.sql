-- Fix 3 DB blockers identified in audit

-- 1. M6: role CHECK constraint only allows 4 values but code uses 5 Adrian profiles
--    Drop old constraint and add new one with all 5 profiles
ALTER TABLE module6_missions DROP CONSTRAINT IF EXISTS module6_missions_role_check;
ALTER TABLE module6_missions ADD CONSTRAINT module6_missions_role_check
  CHECK (role IN ('dialogue', 'description', 'coherence', 'tension', 'structure'));

-- 2. M8: UNIQUE(session_id, role_key) prevents multiple students per role
--    In a class of 25, multiple students need to be actors, cadreurs, etc.
--    Drop the unique constraint on role_key (keep student uniqueness)
ALTER TABLE module8_roles DROP CONSTRAINT IF EXISTS module8_roles_session_id_role_key_key;

-- 3. M4: Add objectif_reason column for "parce que..." completion (Adrian requirement)
ALTER TABLE module10_pitchs ADD COLUMN IF NOT EXISTS objectif_reason TEXT DEFAULT NULL;

-- 4. M2: Add scene_marquante and deeper_reflection columns for A2/A3 steps (Adrian requirement)
ALTER TABLE module5_checklists ADD COLUMN IF NOT EXISTS scene_marquante TEXT DEFAULT NULL;
ALTER TABLE module5_checklists ADD COLUMN IF NOT EXISTS deeper_reflection TEXT DEFAULT NULL;
