-- Teacher interactions on student responses
ALTER TABLE responses ADD COLUMN teacher_comment TEXT;
ALTER TABLE responses ADD COLUMN is_highlighted BOOLEAN DEFAULT false;
