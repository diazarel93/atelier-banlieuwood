-- ============================================================
-- MODULE 12 — Construction Collective (votes en 8 manches)
-- Inter-séance: pool cards from Module 10 data
-- Séance: 8 manches de vote anonyme
-- ============================================================

-- ── Pools de cartes par manche (inter-séance) ──────────────
CREATE TABLE module12_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  manche INT NOT NULL CHECK (manche BETWEEN 1 AND 8),
  cards JSONB NOT NULL DEFAULT '[]',
  generated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, manche)
);

CREATE INDEX idx_module12_pools_session ON module12_pools(session_id);

-- ── Votes élèves par manche ────────────────────────────────
CREATE TABLE module12_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  manche INT NOT NULL CHECK (manche BETWEEN 1 AND 8),
  card_id TEXT NOT NULL,
  voted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, student_id, manche)
);

CREATE INDEX idx_module12_votes_session ON module12_votes(session_id);
CREATE INDEX idx_module12_votes_manche ON module12_votes(session_id, manche);

-- ── Gagnants validés par le prof ───────────────────────────
CREATE TABLE module12_winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  manche INT NOT NULL CHECK (manche BETWEEN 1 AND 8),
  card_id TEXT NOT NULL,
  winning_text TEXT NOT NULL,
  validated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, manche)
);

CREATE INDEX idx_module12_winners_session ON module12_winners(session_id);

-- ── RLS ────────────────────────────────────────────────────

ALTER TABLE module12_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE module12_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE module12_winners ENABLE ROW LEVEL SECURITY;

-- Pools: facilitator can manage, students can read
CREATE POLICY "Facilitator can manage pools" ON module12_pools FOR ALL
  USING (session_id IN (SELECT id FROM sessions WHERE facilitator_id = auth.uid()))
  WITH CHECK (session_id IN (SELECT id FROM sessions WHERE facilitator_id = auth.uid()));

CREATE POLICY "Students can read pools" ON module12_pools FOR SELECT
  USING (session_id IN (SELECT session_id FROM students WHERE id = auth.uid()));

-- Votes: students can insert/update their own, facilitator can read all
CREATE POLICY "Students can vote" ON module12_votes FOR ALL
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Facilitator can read votes" ON module12_votes FOR SELECT
  USING (session_id IN (SELECT id FROM sessions WHERE facilitator_id = auth.uid()));

-- Winners: facilitator can manage, students can read
CREATE POLICY "Facilitator can manage winners" ON module12_winners FOR ALL
  USING (session_id IN (SELECT id FROM sessions WHERE facilitator_id = auth.uid()))
  WITH CHECK (session_id IN (SELECT id FROM sessions WHERE facilitator_id = auth.uid()));

CREATE POLICY "Students can read winners" ON module12_winners FOR SELECT
  USING (session_id IN (SELECT session_id FROM students WHERE id = auth.uid()));

-- ── Realtime ───────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE module12_pools;
ALTER PUBLICATION supabase_realtime ADD TABLE module12_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE module12_winners;

-- ── Situations Module 12 (8 manches = 8 positions) ────────
-- Each manche is a "situation" for navigation purposes
-- The actual cards come from module12_pools, not the prompt

INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES
(12, 1, 1, 0, 'collectif', 'Le Ton',
  'Vote pour le ton de votre film !',
  'Quel ton donnez-vous à votre histoire collective ?',
  'Choisissez la direction narrative qui donnera le ton au projet.',
  NULL),
(12, 1, 2, 0, 'collectif', 'La Situation',
  'Vote pour la situation de départ !',
  'Quelle situation de départ inspire le plus votre groupe ?',
  'Sélectionnez la situation initiale la plus porteuse pour le récit collectif.',
  NULL),
(12, 1, 3, 0, 'collectif', 'Les Personnages',
  'Vote pour les personnages !',
  'Quels personnages peuplent votre histoire ?',
  'Quels profils de personnages incarneront le mieux le récit collectif ?',
  NULL),
(12, 1, 4, 0, 'collectif', 'L''Objectif',
  'Vote pour l''objectif du héros !',
  'Quel objectif guide le personnage principal ?',
  'Quel enjeu moteur orientera l''arc narratif du protagoniste ?',
  NULL),
(12, 1, 5, 0, 'collectif', 'L''Obstacle',
  'Vote pour l''obstacle principal !',
  'Quel obstacle se dresse sur la route du héros ?',
  'Quel antagonisme ou difficulté structurera le conflit central ?',
  NULL),
(12, 1, 6, 0, 'collectif', 'La Première Scène',
  'Vote pour la première scène !',
  'Comment commence votre film ?',
  'Quelle ouverture capte immédiatement l''attention du spectateur ?',
  NULL),
(12, 1, 7, 0, 'collectif', 'La Relation',
  'Vote pour la relation clé !',
  'Quelle relation est au cœur de l''histoire ?',
  'Quel lien entre personnages constituera le moteur émotionnel du récit ?',
  NULL),
(12, 1, 8, 0, 'collectif', 'Le Moment Fort',
  'Vote pour le moment fort !',
  'Quel sera le moment le plus intense du film ?',
  'Quel climax ou retournement marquera le point culminant de la narration ?',
  NULL);

-- ── Extend session_reports CHECK ───────────────────────────
ALTER TABLE session_reports DROP CONSTRAINT IF EXISTS session_reports_report_type_check;
ALTER TABLE session_reports ADD CONSTRAINT session_reports_report_type_check
  CHECK (report_type IN ('bilan', 'fiche_cours', 'intersession_10_12'));
