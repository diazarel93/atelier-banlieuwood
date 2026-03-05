-- Soft-delete for sessions: add deleted_at column.
-- RLS policies already filter by facilitator_id = auth.uid(),
-- so we add a blanket filter via a new default policy that excludes
-- soft-deleted rows. No application code changes needed for reads.

ALTER TABLE sessions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Update existing RLS policies to exclude soft-deleted sessions.
-- The simplest approach: drop and recreate the select/update/delete policies
-- with an extra `AND deleted_at IS NULL` condition.

-- Drop existing policies (names from initial migration)
DROP POLICY IF EXISTS "Facilitators can manage own sessions" ON sessions;
DROP POLICY IF EXISTS "Students can read own session" ON sessions;

-- Facilitator: full access to own non-deleted sessions
CREATE POLICY "Facilitators can manage own sessions" ON sessions FOR ALL
  USING (facilitator_id = auth.uid() AND deleted_at IS NULL);

-- NOTE: No student-side RLS policy on sessions.
-- Students are not Supabase auth users (no auth.uid()),
-- so all student-facing queries use the admin client which bypasses RLS.

-- Index for potential cleanup queries
CREATE INDEX IF NOT EXISTS idx_sessions_deleted_at ON sessions (deleted_at)
  WHERE deleted_at IS NOT NULL;
