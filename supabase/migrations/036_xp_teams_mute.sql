-- V1.3 — XP, Teams, Mute
-- Adds total_xp to students, teams table, mute_sounds to sessions

-- XP on students
ALTER TABLE students ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  team_color TEXT NOT NULL DEFAULT '#FF6B35',
  team_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, team_number)
);
CREATE INDEX IF NOT EXISTS idx_teams_session ON teams(session_id);

-- Team assignment on students
ALTER TABLE students ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;

-- RLS for teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teams_read" ON teams FOR SELECT USING (true);
CREATE POLICY "teams_manage" ON teams FOR ALL USING (
  session_id IN (SELECT id FROM sessions WHERE facilitator_id = auth.uid())
);

-- Mute sounds on sessions
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS mute_sounds BOOLEAN DEFAULT false;
