-- ============================================================
-- MODULES 6, 7, 8 — Stub tables (structure only)
-- Full implementation pending Adrian's detailed specs
-- ============================================================

-- ── MODULE 6 — Le Scénario ──────────────────────────────────
CREATE TABLE IF NOT EXISTS module_scenario_scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  scene_number INT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'incomplete' CHECK (status IN ('incomplete', 'in_progress', 'complete')),
  assigned_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, scene_number)
);

CREATE TABLE IF NOT EXISTS module_scenario_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  scene_id UUID NOT NULL REFERENCES module_scenario_scenes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  task TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scenario_scenes_session ON module_scenario_scenes(session_id);
CREATE INDEX IF NOT EXISTS idx_scenario_missions_session ON module_scenario_missions(session_id);


-- ── MODULE 7 — Filmer une Scène ─────────────────────────────
CREATE TABLE IF NOT EXISTS module_filmer_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  scene_id UUID REFERENCES module_scenario_scenes(id) ON DELETE SET NULL,
  plan_type TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS module_filmer_quiz (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  score INT NOT NULL DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '[]',
  completed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_filmer_plans_session ON module_filmer_plans(session_id);
CREATE INDEX IF NOT EXISTS idx_filmer_quiz_session ON module_filmer_quiz(session_id);


-- ── MODULE 8 — L'Équipe du Film ─────────────────────────────
CREATE TABLE IF NOT EXISTS module_equipe_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  chosen_role TEXT NOT NULL,
  quiz_score INT NOT NULL DEFAULT 0,
  veto_used BOOLEAN NOT NULL DEFAULT false,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, student_id)
);

CREATE TABLE IF NOT EXISTS module_equipe_quiz (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  metier_key TEXT NOT NULL,
  answers JSONB NOT NULL DEFAULT '[]',
  score INT NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_equipe_roles_session ON module_equipe_roles(session_id);
CREATE INDEX IF NOT EXISTS idx_equipe_quiz_session ON module_equipe_quiz(session_id);
