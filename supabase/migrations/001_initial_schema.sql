-- ============================================
-- ATELIER BANLIEUWOOD V1 — Schema initial
-- ============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Organizations ─────────────────────────────
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Facilitators (intervenants) ───────────────
CREATE TABLE facilitators (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Sessions (1 classe × 1 atelier) ──────────
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  facilitator_id UUID REFERENCES facilitators(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  join_code TEXT NOT NULL UNIQUE,
  level TEXT NOT NULL CHECK (level IN ('primaire', 'college', 'lycee')),
  current_module INT DEFAULT 3,
  current_seance INT DEFAULT 1,
  current_situation_index INT DEFAULT 0,
  status TEXT DEFAULT 'waiting'
    CHECK (status IN ('waiting', 'responding', 'reviewing', 'voting', 'paused', 'done')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Students (pas de compte, juste pseudo + emoji) ──
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  joined_at TIMESTAMPTZ DEFAULT now()
);

-- ── Situations (referentiel statique, seed) ───
CREATE TABLE situations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module INT NOT NULL,
  seance INT NOT NULL,
  position INT NOT NULL,
  category TEXT NOT NULL,
  restitution_label TEXT NOT NULL,
  prompt_6_9 TEXT NOT NULL,
  prompt_10_13 TEXT NOT NULL,
  prompt_14_18 TEXT NOT NULL,
  nudge_text TEXT,
  UNIQUE(module, seance, position)
);

-- ── Responses ─────────────────────────────────
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  situation_id UUID REFERENCES situations(id),
  text TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, student_id, situation_id)
);

-- ── Votes ─────────────────────────────────────
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  situation_id UUID REFERENCES situations(id),
  chosen_response_id UUID REFERENCES responses(id),
  voted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, student_id, situation_id)
);

-- ── Collective choices ────────────────────────
CREATE TABLE collective_choices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  situation_id UUID REFERENCES situations(id),
  category TEXT NOT NULL,
  restitution_label TEXT NOT NULL,
  chosen_text TEXT NOT NULL,
  source_response_id UUID REFERENCES responses(id),
  validated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, situation_id)
);

-- ── Module 1 analyses ─────────────────────────
CREATE TABLE module1_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE UNIQUE,
  class_summary TEXT,
  creativity_avg REAL,
  detail_avg REAL,
  emotion_avg REAL,
  analysis_avg REAL,
  student_profiles JSONB,
  recommendations TEXT,
  generated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Module 2 budgets ──────────────────────────
CREATE TABLE module2_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  choices JSONB NOT NULL,
  credits_remaining INT NOT NULL,
  summary TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, student_id)
);

-- ── Annotations ───────────────────────────────
CREATE TABLE annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id),
  situation_id UUID REFERENCES situations(id),
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('note', 'encouragement', 'alerte')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Indexes ───────────────────────────────────
CREATE INDEX idx_sessions_join_code ON sessions(join_code);
CREATE INDEX idx_sessions_facilitator ON sessions(facilitator_id);
CREATE INDEX idx_students_session ON students(session_id);
CREATE INDEX idx_responses_session ON responses(session_id);
CREATE INDEX idx_responses_situation ON responses(situation_id);
CREATE INDEX idx_votes_session ON votes(session_id);
CREATE INDEX idx_collective_choices_session ON collective_choices(session_id);

-- ── RLS Policies ──────────────────────────────
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE collective_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilitators ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE module1_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE module2_budgets ENABLE ROW LEVEL SECURITY;

-- Facilitators can manage their own sessions
CREATE POLICY "facilitator_own_sessions" ON sessions
  FOR ALL USING (facilitator_id = auth.uid());

-- Facilitators can see their own profile
CREATE POLICY "facilitator_own_profile" ON facilitators
  FOR ALL USING (id = auth.uid());

-- Facilitators can see their org
CREATE POLICY "facilitator_own_org" ON organizations
  FOR SELECT USING (
    id IN (SELECT org_id FROM facilitators WHERE id = auth.uid())
  );

-- Facilitators can see students in their sessions
CREATE POLICY "facilitator_session_students" ON students
  FOR ALL USING (
    session_id IN (SELECT id FROM sessions WHERE facilitator_id = auth.uid())
  );

-- Facilitators can see responses in their sessions
CREATE POLICY "facilitator_session_responses" ON responses
  FOR SELECT USING (
    session_id IN (SELECT id FROM sessions WHERE facilitator_id = auth.uid())
  );

-- Facilitators can see votes in their sessions
CREATE POLICY "facilitator_session_votes" ON votes
  FOR SELECT USING (
    session_id IN (SELECT id FROM sessions WHERE facilitator_id = auth.uid())
  );

-- Facilitators can manage collective choices
CREATE POLICY "facilitator_collective_choices" ON collective_choices
  FOR ALL USING (
    session_id IN (SELECT id FROM sessions WHERE facilitator_id = auth.uid())
  );

-- Facilitators can manage annotations
CREATE POLICY "facilitator_annotations" ON annotations
  FOR ALL USING (
    session_id IN (SELECT id FROM sessions WHERE facilitator_id = auth.uid())
  );

-- Facilitators can see module1 analyses
CREATE POLICY "facilitator_module1" ON module1_analyses
  FOR ALL USING (
    session_id IN (SELECT id FROM sessions WHERE facilitator_id = auth.uid())
  );

-- Facilitators can see module2 budgets
CREATE POLICY "facilitator_module2" ON module2_budgets
  FOR SELECT USING (
    session_id IN (SELECT id FROM sessions WHERE facilitator_id = auth.uid())
  );

-- ── Updated_at trigger ────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Realtime ──────────────────────────────────
-- Enable realtime for tables the facilitator needs to watch
ALTER PUBLICATION supabase_realtime ADD TABLE responses;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE students;
