-- ============================================================
-- MODULE 7 — La Mise en scène
-- 4 plans fondamentaux, comparaison visuelle, découpage, storyboard.
-- Replaces stubs from 042.
-- ============================================================

-- Drop old stub tables if they exist
DROP TABLE IF EXISTS module_filmer_quiz CASCADE;
DROP TABLE IF EXISTS module_filmer_plans CASCADE;

-- Table 1: Réponses au quiz de comparaison visuelle
CREATE TABLE module7_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  comparison_key TEXT NOT NULL,
  chosen_plan TEXT NOT NULL,
  reasoning TEXT DEFAULT '',
  submitted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, student_id, comparison_key)
);

-- Table 2: Découpage par scène (élève choisit les plans pour une scène)
CREATE TABLE module7_decoupages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  scene_id UUID NOT NULL REFERENCES module6_scenes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  plans JSONB DEFAULT '[]',
  submitted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, student_id, scene_id)
);

-- Table 3: Storyboard final validé par le facilitateur
CREATE TABLE module7_storyboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE UNIQUE,
  scenes JSONB DEFAULT '[]',
  validated BOOLEAN DEFAULT FALSE,
  validated_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_m7_comparisons_session ON module7_comparisons(session_id);
CREATE INDEX idx_m7_decoupages_session ON module7_decoupages(session_id);

-- RLS
ALTER TABLE module7_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE module7_decoupages ENABLE ROW LEVEL SECURITY;
ALTER TABLE module7_storyboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "m7_comparisons_all" ON module7_comparisons FOR ALL USING (true);
CREATE POLICY "m7_decoupages_all" ON module7_decoupages FOR ALL USING (true);
CREATE POLICY "m7_storyboard_all" ON module7_storyboard FOR ALL USING (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE module7_comparisons;
ALTER PUBLICATION supabase_realtime ADD TABLE module7_decoupages;
ALTER PUBLICATION supabase_realtime ADD TABLE module7_storyboard;

-- Seed situations for Module 7 (dbModule=7, dbSeance=1, 4 positions)
INSERT INTO situations (module, seance, position, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES
  (7, 1, 1, 'collectif', 'Les plans', 'Découvre les 4 plans de caméra !', 'Les 4 plans fondamentaux du cinéma : à quoi servent-ils ?', 'Étudiez les 4 types de plans et leur fonction narrative.', 'Chaque plan raconte quelque chose de différent.'),
  (7, 1, 2, 'collectif', 'Comparaison', 'Quel plan raconte le mieux ?', 'Compare deux cadrages de la même scène. Lequel est le plus efficace ?', 'Analysez l''impact narratif de chaque cadrage.', 'Pense à ce que chaque plan fait ressentir.'),
  (7, 1, 3, 'collectif', 'Découpage', 'Découpe ta scène !', 'Choisis les plans pour raconter ta scène.', 'Créez un mini-découpage technique pour votre scène.', 'Pense à l''intention derrière chaque plan.'),
  (7, 1, 4, 'collectif', 'Storyboard', 'Le storyboard est prêt !', 'Découvre le storyboard complet de votre film.', 'Visualisez le storyboard assemblé.', 'Le facilitateur valide le storyboard final.')
ON CONFLICT DO NOTHING;
