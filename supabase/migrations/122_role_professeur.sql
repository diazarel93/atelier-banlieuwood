-- R4(2b): Add "professeur" role for post-session dashboard access
-- Intervenant = cockpit temps réel (pendant la séance)
-- Professeur = dashboard post-séance (tendances de groupe, anonymisé)
-- Admin = tout

ALTER TABLE facilitators DROP CONSTRAINT IF EXISTS facilitators_role_check;
ALTER TABLE facilitators ADD CONSTRAINT facilitators_role_check
  CHECK (role IN ('admin', 'intervenant', 'professeur', 'client'));

-- SQL helper: check if user is a professeur
CREATE OR REPLACE FUNCTION is_professeur()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM facilitators
    WHERE id = auth.uid()
      AND role = 'professeur'
      AND status = 'active'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- SQL helper: check if user can pilot sessions (admin or intervenant)
CREATE OR REPLACE FUNCTION can_pilot()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM facilitators
    WHERE id = auth.uid()
      AND role IN ('admin', 'intervenant')
      AND status = 'active'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

COMMENT ON COLUMN facilitators.role IS 'admin: tout, intervenant: cockpit séance, professeur: dashboard post-séance, client: lecture seule';
