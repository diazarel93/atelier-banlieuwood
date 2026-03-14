-- Add unique profile code for cross-device reconnection
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS profile_code TEXT;

-- Generate codes for existing profiles
UPDATE student_profiles
SET profile_code = upper(substr(md5(id::text), 1, 4))
WHERE profile_code IS NULL;

-- Ensure uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_student_profiles_code ON student_profiles (profile_code) WHERE profile_code IS NOT NULL;
