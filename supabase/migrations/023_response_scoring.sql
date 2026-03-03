-- 023: Add quality scoring to responses (teacher + AI)
-- teacher_score: manual rating by teacher (0-5, 0 = not scored)
-- ai_score: automated AI evaluation (0-5, 0 = not scored)
-- ai_feedback: short AI-generated feedback text

ALTER TABLE responses ADD COLUMN teacher_score SMALLINT DEFAULT 0 CHECK (teacher_score >= 0 AND teacher_score <= 5);
ALTER TABLE responses ADD COLUMN ai_score SMALLINT DEFAULT 0 CHECK (ai_score >= 0 AND ai_score <= 5);
ALTER TABLE responses ADD COLUMN ai_feedback TEXT;
