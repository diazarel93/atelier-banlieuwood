-- Add timer support to sessions
ALTER TABLE sessions ADD COLUMN timer_ends_at TIMESTAMPTZ DEFAULT NULL;
