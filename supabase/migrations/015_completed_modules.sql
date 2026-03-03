-- Track which modules have been completed per session
ALTER TABLE sessions ADD COLUMN completed_modules TEXT[] DEFAULT '{}';
