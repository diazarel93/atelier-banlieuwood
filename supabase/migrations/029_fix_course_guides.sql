-- Fix course_guides table: ensure it exists and has a proper unique index.
-- The original migration 012 used UNIQUE(level, COALESCE(template, '__none__'))
-- inline in CREATE TABLE, which PostgreSQL does not support (expressions in
-- inline UNIQUE constraints). This migration creates the table if missing and
-- adds the correct functional unique index.

CREATE TABLE IF NOT EXISTS course_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL CHECK (level IN ('primaire', 'college', 'lycee')),
  template TEXT,
  content JSONB NOT NULL,
  ai_provider TEXT,
  generated_at TIMESTAMPTZ DEFAULT now()
);

-- Drop the broken inline constraint if it somehow exists
DO $$
BEGIN
  ALTER TABLE course_guides DROP CONSTRAINT IF EXISTS course_guides_level_coalesce_key;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Create proper expression-based unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_course_guides_level_tpl
  ON course_guides (level, COALESCE(template, '__none__'));
