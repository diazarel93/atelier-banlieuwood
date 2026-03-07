-- Progressive reveal mode for class screen projection
-- reveal_phase NULL = normal flow, 0-4 = progressive reveal phases
ALTER TABLE sessions ADD COLUMN reveal_phase smallint DEFAULT NULL;
