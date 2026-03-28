-- Per-session module enable/disable, derived from formula
-- NULL = all modules enabled (backward compat for existing sessions)

ALTER TABLE sessions ADD COLUMN IF NOT EXISTS modules_enabled JSONB;

COMMENT ON COLUMN sessions.modules_enabled IS 'Array of spec module IDs enabled for this session (e.g. ["M1","M3"]). NULL = all enabled.';
