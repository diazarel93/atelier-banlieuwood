-- Add teacher_notes column for facilitator session annotations.
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS teacher_notes TEXT;
