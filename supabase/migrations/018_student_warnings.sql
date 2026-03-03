-- Student warnings: track misbehavior, auto-kick at 3
ALTER TABLE students ADD COLUMN warnings INTEGER DEFAULT 0;
ALTER TABLE students ADD COLUMN kicked BOOLEAN DEFAULT false;
