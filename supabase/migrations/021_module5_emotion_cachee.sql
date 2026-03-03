-- ============================================================
-- Module 8 "Émotion Cachée" — Tables + Situations
-- ============================================================

-- ── TABLE: Checklists culturelles (séance 1, step 1) ──
CREATE TABLE module5_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  selected_items TEXT[] NOT NULL DEFAULT '{}',
  chosen_item TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, student_id)
);

-- ── TABLE: Scènes construites (séance 2, step 2) ──
CREATE TABLE module5_scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  emotion TEXT NOT NULL,
  intention TEXT NOT NULL,
  obstacle TEXT NOT NULL,
  changement TEXT NOT NULL,
  elements JSONB NOT NULL DEFAULT '[]',
  tokens_used INT NOT NULL DEFAULT 0,
  slots_used INT NOT NULL DEFAULT 0,
  ai_feedback JSONB,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, student_id)
);

-- ── TABLE: Comparaison de 2 scènes (séance 3) ──
CREATE TABLE module5_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  scene_a_id UUID REFERENCES module5_scenes(id),
  scene_b_id UUID REFERENCES module5_scenes(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id)
);

-- ── INDEXES ──
CREATE INDEX idx_module5_checklists_session ON module5_checklists(session_id);
CREATE INDEX idx_module5_scenes_session ON module5_scenes(session_id);
CREATE INDEX idx_module5_comparisons_session ON module5_comparisons(session_id);

-- ── RLS ──
ALTER TABLE module5_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE module5_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE module5_comparisons ENABLE ROW LEVEL SECURITY;

-- Facilitator full access via service role (admin client bypasses RLS)
-- Free mode: students can read/write their own
CREATE POLICY "Students can insert own checklist"
  ON module5_checklists FOR INSERT
  WITH CHECK (
    student_id IN (SELECT id FROM students WHERE session_id = module5_checklists.session_id)
  );

CREATE POLICY "Students can read own checklist"
  ON module5_checklists FOR SELECT
  USING (true);

CREATE POLICY "Students can update own checklist"
  ON module5_checklists FOR UPDATE
  USING (true);

CREATE POLICY "Students can insert own scene"
  ON module5_scenes FOR INSERT
  WITH CHECK (
    student_id IN (SELECT id FROM students WHERE session_id = module5_scenes.session_id)
  );

CREATE POLICY "Students can read scenes"
  ON module5_scenes FOR SELECT
  USING (true);

CREATE POLICY "Students can update own scene"
  ON module5_scenes FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can read comparisons"
  ON module5_comparisons FOR SELECT
  USING (true);

CREATE POLICY "Facilitator can manage comparisons"
  ON module5_comparisons FOR ALL
  USING (true);

-- ── REALTIME ──
ALTER PUBLICATION supabase_realtime ADD TABLE module5_checklists;
ALTER PUBLICATION supabase_realtime ADD TABLE module5_scenes;
ALTER PUBLICATION supabase_realtime ADD TABLE module5_comparisons;

-- ============================================================
-- SITUATIONS for Module 8 (7 situations across 4 séances)
-- Séance 1 pos 1 = checklist (special component, no DB situation)
-- Séance 2 pos 2 = scene builder (special component, no DB situation)
-- ============================================================

-- Séance 1: Mise en bain
-- pos 1 = Checklist (handled by ChecklistState, no situation row needed)
-- pos 2 = La scène marquante (notebook)
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (8, 1, 2, 'emotion_cachee', 'La scène marquante', 'notebook',
  'Décris une scène de film ou de série qui t''a marqué. Qu''est-ce qui t''a touché ?',
  'Raconte une scène de film, série ou anime qui t''a vraiment marqué. Qu''est-ce que le personnage vivait ? Pourquoi ça t''a touché ?',
  'Décris une scène d''œuvre audiovisuelle qui vous a profondément marqué. Analysez ce qui rend cette scène si puissante émotionnellement.',
  'Pense à un moment où tu as eu les larmes aux yeux, ou le cœur qui battait fort.');

-- pos 3 = Entre les lignes (open)
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (8, 1, 3, 'emotion_cachee', 'Entre les lignes', 'open',
  'Dans cette scène, qu''est-ce que le personnage voulait vraiment ?',
  'Dans la scène que tu as décrite, qu''est-ce que le personnage voulait vraiment dire ou faire, sans le dire à voix haute ?',
  'Au-delà du texte apparent, quelle intention cachée anime le personnage dans cette scène ? Qu''est-ce qui se joue entre les lignes ?',
  'Parfois, un personnage dit une chose mais pense autre chose. C''est ça, l''émotion cachée.');

-- Séance 2: Émotion Cachée
-- pos 1 = L'émotion cachée (closed — 5 options)
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, options, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (8, 2, 1, 'emotion_cachee', 'L''émotion cachée', 'closed',
  '[{"key":"exclusion","label":"Peur d''être exclu"},{"key":"injustice","label":"Colère face à une injustice"},{"key":"honte","label":"Honte après une erreur"},{"key":"jalousie","label":"Jalousie envers un ami"},{"key":"joie_fragile","label":"Joie fragile"}]'::jsonb,
  'Quelle émotion ton personnage va vivre ?',
  'Choisis l''émotion cachée que ton personnage va traverser dans ta scène.',
  'Sélectionnez l''émotion centrale qui constituera le moteur dramatique de votre scène.',
  'Chaque émotion raconte une histoire différente. Laquelle te parle le plus ?');

-- pos 2 = Construction de scène (handled by SceneBuilderState, no situation row needed)

-- Séance 3: Phase Collective
-- pos 1 = La plus claire (open)
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (8, 3, 1, 'emotion_cachee', 'La plus claire', 'open',
  'Laquelle des deux scènes est la plus facile à comprendre ? Pourquoi ?',
  'Entre les deux scènes projetées, laquelle communique le mieux son émotion ? Pourquoi ?',
  'Parmi les deux propositions projetées, laquelle vous semble la plus efficace narrativement ? Justifiez votre analyse.',
  'Pense à ce que tu as ressenti en découvrant chaque scène.');

-- pos 2 = Les désaccords (open)
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (8, 3, 2, 'emotion_cachee', 'Les désaccords', 'open',
  'Pourquoi tout le monde n''est pas d''accord ?',
  'Pourquoi les avis sont différents sur ces deux scènes ? Qu''est-ce qui fait qu''on ne voit pas la même chose ?',
  'Comment expliquez-vous la divergence des opinions ? Qu''est-ce que cela révèle sur la subjectivité de la réception ?',
  'Il n''y a pas de mauvaise réponse. Ce qui compte, c''est de comprendre pourquoi on pense différemment.');

-- Séance 4: Clôture
-- pos 1 = Le thème (closed — 7 options)
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, options, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (8, 4, 1, 'emotion_cachee', 'Le thème', 'closed',
  '[{"key":"amitie","label":"L''amitié"},{"key":"injustice","label":"L''injustice"},{"key":"secret","label":"Le secret"},{"key":"defi","label":"Le défi"},{"key":"rivalite","label":"La rivalité"},{"key":"courage","label":"Le courage"},{"key":"autre","label":"Autre"}]'::jsonb,
  'C''est quoi le thème de ta scène ?',
  'Quel est le vrai thème de ta scène ? De quoi elle parle au fond ?',
  'Quel thème universel sous-tend votre scène ? Quelle question pose-t-elle au spectateur ?',
  'Le thème, c''est ce dont parle vraiment ton histoire, au-delà de l''action.');

-- pos 2 = L'arc du personnage (closed — 5 options)
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, options, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (8, 4, 2, 'emotion_cachee', 'L''arc du personnage', 'closed',
  '[{"key":"gagne","label":"Il/elle gagne"},{"key":"perd","label":"Il/elle perd"},{"key":"change","label":"Il/elle change"},{"key":"rebelle","label":"Il/elle se rebelle"},{"key":"cache","label":"Il/elle cache tout"}]'::jsonb,
  'À la fin de ta scène, qu''est-ce qui arrive au personnage ?',
  'Comment évolue ton personnage à la fin de ta scène ? Il gagne, il perd, il change ?',
  'Quel arc narratif votre personnage suit-il ? Comment se transforme-t-il face à l''épreuve ?',
  'Un bon personnage n''est jamais le même à la fin qu''au début.');
