-- Missing indexes identified in full app audit

-- Team chat queries filter by both session_id and team_id
CREATE INDEX IF NOT EXISTS idx_team_messages_session_team
  ON team_messages (session_id, team_id);

-- Facilitator tags queries filter by session_id and student_id
CREATE INDEX IF NOT EXISTS idx_facilitator_tags_session_student
  ON facilitator_tags (session_id, student_id);

-- Dashboard and stats queries join on student_id + session_id
CREATE INDEX IF NOT EXISTS idx_session_oie_scores_student_session
  ON session_oie_scores (student_id, session_id);

-- Module 12 winner queries filter by session_id
CREATE INDEX IF NOT EXISTS idx_module12_winners_session
  ON module12_winners (session_id);

-- Mission submissions queries filter by profile_id
CREATE INDEX IF NOT EXISTS idx_mission_submissions_profile
  ON mission_submissions (profile_id);
