-- Audit logs for pilot cockpit actions
-- Tracks destructive/important actions for accountability

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for efficient session-scoped queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_session_created
  ON audit_logs (session_id, created_at DESC);

-- Index for actor queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor
  ON audit_logs (actor_id, created_at DESC);

-- RLS policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins and facilitators can read audit logs for their sessions
CREATE POLICY "Authenticated users can read audit logs for their sessions"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    session_id IN (
      SELECT id FROM sessions WHERE facilitator_id = auth.uid()
    )
  );

-- Server-side insert only (via service role / admin client)
CREATE POLICY "Service role can insert audit logs"
  ON audit_logs FOR INSERT
  TO service_role
  WITH CHECK (true);
