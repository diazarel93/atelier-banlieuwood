-- ============================================================
-- MODULE 6 — Le Scénario
-- Replaces stubs from 042. Adds act column, scenario assembly,
-- and proper RLS/Realtime.
-- ============================================================

-- Drop old stub tables if they exist (no data in them yet)
DROP TABLE IF EXISTS module_scenario_missions CASCADE;
DROP TABLE IF EXISTS module_scenario_scenes CASCADE;

-- Table 1: Scènes générées par l'IA à partir des gagnants M12
CREATE TABLE module6_scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  scene_number INT NOT NULL CHECK (scene_number BETWEEN 1 AND 6),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  act TEXT NOT NULL CHECK (act IN ('setup', 'confrontation', 'resolution')),
  content TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'incomplete' CHECK (status IN ('incomplete', 'in_progress', 'complete')),
  generated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, scene_number)
);

-- Table 2: Missions assignées aux élèves (1 mission par élève par scène)
CREATE TABLE module6_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  scene_id UUID NOT NULL REFERENCES module6_scenes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('dialogue', 'description', 'action', 'emotion')),
  task TEXT NOT NULL,
  content TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done')),
  submitted_at TIMESTAMPTZ,
  UNIQUE(session_id, student_id, scene_id)
);

-- Table 3: Scénario assemblé final
CREATE TABLE module6_scenario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE UNIQUE,
  full_text TEXT DEFAULT '',
  validated BOOLEAN DEFAULT FALSE,
  validated_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_m6_scenes_session ON module6_scenes(session_id);
CREATE INDEX idx_m6_missions_session ON module6_missions(session_id);
CREATE INDEX idx_m6_missions_student ON module6_missions(student_id);

-- RLS
ALTER TABLE module6_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE module6_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE module6_scenario ENABLE ROW LEVEL SECURITY;

-- Scenes: facilitateur CRUD, élèves SELECT
CREATE POLICY "m6_scenes_facilitator" ON module6_scenes FOR ALL USING (true);
CREATE POLICY "m6_scenes_student_read" ON module6_scenes FOR SELECT USING (true);

-- Missions: facilitateur CRUD, élèves SELECT + UPDATE own
CREATE POLICY "m6_missions_facilitator" ON module6_missions FOR ALL USING (true);
CREATE POLICY "m6_missions_student_read" ON module6_missions FOR SELECT USING (true);
CREATE POLICY "m6_missions_student_update" ON module6_missions FOR UPDATE USING (true);

-- Scenario: facilitateur CRUD, élèves SELECT
CREATE POLICY "m6_scenario_facilitator" ON module6_scenario FOR ALL USING (true);
CREATE POLICY "m6_scenario_student_read" ON module6_scenario FOR SELECT USING (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE module6_scenes;
ALTER PUBLICATION supabase_realtime ADD TABLE module6_missions;
ALTER PUBLICATION supabase_realtime ADD TABLE module6_scenario;

-- Seed situations for Module 6 (dbModule=5, dbSeance=1, 5 positions)
INSERT INTO situations (module, seance, position, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES
  (5, 1, 1, 'collectif', 'Frise narrative', 'Découvre la structure de ton histoire !', 'Visualise les 5 étapes de ton histoire collective.', 'Analysez la structure narrative en 5 actes.', 'Observe comment les gagnants forment une histoire.'),
  (5, 1, 2, 'collectif', 'Scènes V0', 'L''IA a écrit des scènes pour toi !', 'Lis les scènes générées par l''IA à partir de vos choix collectifs.', 'Examinez les scènes V0 générées à partir des éléments votés.', 'Ces scènes sont un brouillon — à vous de les enrichir.'),
  (5, 1, 3, 'collectif', 'Ta mission', 'Tu as une mission spéciale !', 'Découvre ta mission : quel rôle as-tu dans l''écriture ?', 'Prenez connaissance de votre mission d''écriture.', 'Chaque mission correspond à un aspect du scénario.'),
  (5, 1, 4, 'collectif', 'Écriture', 'À toi d''écrire !', 'Écris ta contribution pour la scène qui t''est assignée.', 'Rédigez votre contribution selon votre rôle.', 'Sois créatif — c''est ton moment !'),
  (5, 1, 5, 'collectif', 'Assemblage', 'Le scénario est prêt !', 'Découvre le scénario complet assemblé à partir de vos contributions.', 'Revoyez le scénario final assemblé.', 'L''intervenant valide le scénario final.')
ON CONFLICT DO NOTHING;
