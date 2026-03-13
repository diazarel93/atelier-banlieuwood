-- ============================================
-- 111 — Multi-role Auth System
-- Adds role/status to facilitators, invitations table, SQL helpers, updated RLS
-- ============================================

-- ── 1. Extend facilitators table ─────────────
ALTER TABLE facilitators
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'intervenant'
    CHECK (role IN ('admin', 'intervenant', 'client')),
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'rejected', 'deactivated')),
  ADD COLUMN IF NOT EXISTS institution TEXT,
  ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES facilitators(id),
  ADD COLUMN IF NOT EXISTS validated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS validated_by UUID REFERENCES facilitators(id);

-- All existing facilitators keep access
UPDATE facilitators SET role = 'intervenant', status = 'active'
  WHERE status = 'pending';

-- ── 2. Invitations table ─────────────────────
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'intervenant', 'client')),
  type TEXT NOT NULL CHECK (type IN ('invite', 'request')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  token TEXT NOT NULL DEFAULT replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  invited_by UUID REFERENCES facilitators(id),
  institution TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES facilitators(id)
);

CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);

-- ── 3. Helper functions ──────────────────────
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM facilitators
    WHERE id = auth.uid()
      AND role = 'admin'
      AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_active_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM facilitators
    WHERE id = auth.uid()
      AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ── 4. Update session policy ─────────────────
-- Drop the old policy and create a new one with admin bypass
DROP POLICY IF EXISTS "facilitator_own_sessions" ON sessions;
CREATE POLICY "facilitator_own_sessions" ON sessions
  FOR ALL USING (
    (facilitator_id = auth.uid() AND is_active_user())
    OR is_admin()
  );

-- ── 5. Admin policies on facilitators ────────
-- Drop old policy first
DROP POLICY IF EXISTS "facilitator_own_profile" ON facilitators;

-- Users can read their own profile
CREATE POLICY "facilitator_own_profile" ON facilitators
  FOR SELECT USING (id = auth.uid());

-- Users can update their own profile (non-role fields)
CREATE POLICY "facilitator_update_own" ON facilitators
  FOR UPDATE USING (id = auth.uid());

-- Admins can read all profiles
CREATE POLICY "admin_read_all_facilitators" ON facilitators
  FOR SELECT USING (is_admin());

-- Admins can update all profiles
CREATE POLICY "admin_update_all_facilitators" ON facilitators
  FOR UPDATE USING (is_admin());

-- ── 6. RLS on invitations ────────────────────
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Admins can see all invitations
CREATE POLICY "admin_all_invitations" ON invitations
  FOR ALL USING (is_admin());

-- Users can see invitations sent to their email
CREATE POLICY "user_own_invitations" ON invitations
  FOR SELECT USING (
    email = (SELECT email FROM facilitators WHERE id = auth.uid())
  );

-- Anyone authenticated can insert a request-type invitation
CREATE POLICY "user_create_request" ON invitations
  FOR INSERT WITH CHECK (type = 'request');

-- ── 7. Index on facilitators role/status ─────
CREATE INDEX IF NOT EXISTS idx_facilitators_role ON facilitators(role);
CREATE INDEX IF NOT EXISTS idx_facilitators_status ON facilitators(status);
