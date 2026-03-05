-- Add share_token column to students for secure recap sharing
ALTER TABLE students ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;

-- Index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_students_share_token ON students (share_token) WHERE share_token IS NOT NULL;
