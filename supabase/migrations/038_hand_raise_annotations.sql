-- Hand raise: students can signal they need help
ALTER TABLE students ADD COLUMN IF NOT EXISTS hand_raised_at TIMESTAMPTZ DEFAULT NULL;

-- Teacher annotations on responses: star (excellent), flag (to review), bookmark (to project)
-- is_highlighted already exists, add teacher_flag for categorization
ALTER TABLE responses ADD COLUMN IF NOT EXISTS teacher_flag TEXT DEFAULT NULL
  CHECK (teacher_flag IN ('star', 'flag', 'bookmark', NULL));
