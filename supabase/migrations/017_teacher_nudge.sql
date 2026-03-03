-- Teacher nudge: message from teacher to student on a specific response
ALTER TABLE responses ADD COLUMN teacher_nudge TEXT;
