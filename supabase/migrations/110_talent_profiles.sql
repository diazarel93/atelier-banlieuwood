-- Add creative_profile column to student_profiles (6 talent profiles)
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS creative_profile TEXT;

COMMENT ON COLUMN student_profiles.creative_profile IS 'Derived talent profile key: imaginatif, observateur, narrateur, metteur_en_scene, acteur, organisateur';
