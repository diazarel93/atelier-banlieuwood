-- ============================================================
-- MODULE 13 — La Post-prod (8 situations, 1 séance)
-- Finalisation collective : montage, musique, affiche, projection
-- ============================================================

-- ── Choix de montage (ordre des scènes) ─────────────────────
CREATE TABLE module13_montages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  scene_order JSONB NOT NULL DEFAULT '[]',  -- ordered array of scene keys
  submitted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, student_id)
);

CREATE INDEX idx_module13_montages_session ON module13_montages(session_id);

-- ── Choix musicaux ──────────────────────────────────────────
CREATE TABLE module13_musiques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  genre TEXT NOT NULL,
  mood TEXT NOT NULL,
  justification TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, student_id)
);

CREATE INDEX idx_module13_musiques_session ON module13_musiques(session_id);

-- ── Propositions de titre ───────────────────────────────────
CREATE TABLE module13_titres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, student_id)
);

CREATE INDEX idx_module13_titres_session ON module13_titres(session_id);

-- ── Concepts d'affiche ──────────────────────────────────────
CREATE TABLE module13_affiches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  style TEXT NOT NULL,
  description TEXT NOT NULL,
  tagline TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, student_id)
);

CREATE INDEX idx_module13_affiches_session ON module13_affiches(session_id);

-- ── Pitch bande-annonce ─────────────────────────────────────
CREATE TABLE module13_trailers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  moments JSONB NOT NULL DEFAULT '[]',  -- 3 key moments chosen
  voix_off TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, student_id)
);

CREATE INDEX idx_module13_trailers_session ON module13_trailers(session_id);

-- ── Résultats validés par le prof (un par position) ─────────
CREATE TABLE module13_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  position INT NOT NULL CHECK (position BETWEEN 1 AND 8),
  result_type TEXT NOT NULL,
  result_data JSONB NOT NULL DEFAULT '{}',
  validated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, position)
);

CREATE INDEX idx_module13_results_session ON module13_results(session_id);

-- ── RLS ─────────────────────────────────────────────────────

ALTER TABLE module13_montages ENABLE ROW LEVEL SECURITY;
ALTER TABLE module13_musiques ENABLE ROW LEVEL SECURITY;
ALTER TABLE module13_titres ENABLE ROW LEVEL SECURITY;
ALTER TABLE module13_affiches ENABLE ROW LEVEL SECURITY;
ALTER TABLE module13_trailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE module13_results ENABLE ROW LEVEL SECURITY;

-- Service role writes (via admin client)
CREATE POLICY "Service write montages" ON module13_montages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service write musiques" ON module13_musiques FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service write titres" ON module13_titres FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service write affiches" ON module13_affiches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service write trailers" ON module13_trailers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service write results" ON module13_results FOR ALL USING (true) WITH CHECK (true);

-- Facilitator read
CREATE POLICY "Facilitator read montages" ON module13_montages FOR SELECT
  USING (session_id IN (SELECT id FROM sessions WHERE facilitator_id = auth.uid()));
CREATE POLICY "Facilitator read musiques" ON module13_musiques FOR SELECT
  USING (session_id IN (SELECT id FROM sessions WHERE facilitator_id = auth.uid()));
CREATE POLICY "Facilitator read titres" ON module13_titres FOR SELECT
  USING (session_id IN (SELECT id FROM sessions WHERE facilitator_id = auth.uid()));
CREATE POLICY "Facilitator read affiches" ON module13_affiches FOR SELECT
  USING (session_id IN (SELECT id FROM sessions WHERE facilitator_id = auth.uid()));
CREATE POLICY "Facilitator read trailers" ON module13_trailers FOR SELECT
  USING (session_id IN (SELECT id FROM sessions WHERE facilitator_id = auth.uid()));
CREATE POLICY "Facilitator read results" ON module13_results FOR SELECT
  USING (session_id IN (SELECT id FROM sessions WHERE facilitator_id = auth.uid()));

-- ── Realtime ────────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE module13_montages;
ALTER PUBLICATION supabase_realtime ADD TABLE module13_musiques;
ALTER PUBLICATION supabase_realtime ADD TABLE module13_titres;
ALTER PUBLICATION supabase_realtime ADD TABLE module13_affiches;
ALTER PUBLICATION supabase_realtime ADD TABLE module13_trailers;
ALTER PUBLICATION supabase_realtime ADD TABLE module13_results;

-- ── Situations Module 13 (8 positions, 1 séance) ───────────

INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES
(13, 1, 1, 0, 'postprod', 'Ordre des scènes',
  'Dans quel ordre on met les scènes de notre film ?',
  'Proposez l''ordre des scènes qui rend l''histoire la plus efficace.',
  'Organisez la structure narrative pour maximiser la progression dramatique.',
  'Pense à ce qui doit arriver avant pour que le spectateur comprenne la suite.'),
(13, 1, 2, 0, 'postprod', 'Ambiance sonore',
  'Quelle musique pour notre film ?',
  'Quel style musical et quelle ambiance sonore correspondent à votre histoire ?',
  'Définissez l''identité sonore du film : genre musical, registre émotionnel, moments clés.',
  'La musique change tout. Imagine la même scène avec du piano doux... puis du rap.'),
(13, 1, 3, 0, 'postprod', 'Le Titre',
  'Comment on appelle notre film ?',
  'Proposez un titre percutant pour le film de la classe.',
  'Trouvez un titre qui capture l''essence du récit et intrigue le spectateur.',
  'Un bon titre donne envie de voir le film sans tout révéler.'),
(13, 1, 4, 0, 'postprod', 'L''Affiche',
  'À quoi ressemble l''affiche de notre film ?',
  'Décrivez le concept visuel de l''affiche : image principale, ambiance, tagline.',
  'Concevez l''affiche : composition visuelle, palette, hiérarchie typographique et accroche.',
  'L''affiche doit donner envie en une seule image.'),
(13, 1, 5, 0, 'postprod', 'La Bande-annonce',
  'Quels moments on montre dans la bande-annonce ?',
  'Choisissez 3 moments clés et une voix off pour la bande-annonce.',
  'Sélectionnez les extraits stratégiques et rédigez la voix off du teaser.',
  'La bande-annonce montre juste assez pour donner envie, jamais la fin !'),
(13, 1, 6, 0, 'postprod', 'Les Crédits',
  'Qui a fait quoi dans notre film ?',
  'Attribuez les crédits : qui mérite une mention spéciale et pourquoi ?',
  'Rédigez le générique : crédits individuels, remerciements, mentions spéciales.',
  'Dans un vrai film, tout le monde est crédité. Personne n''est oublié.'),
(13, 1, 7, 0, 'postprod', 'La Critique',
  'Qu''est-ce que tu as pensé de notre film ?',
  'Rédigez une courte critique du film de la classe : points forts et axe d''amélioration.',
  'Analysez le projet final : narration, cohérence, originalité. Argumentez votre avis.',
  'Un bon critique dit ce qui marche ET ce qui pourrait être mieux.'),
(13, 1, 8, 0, 'postprod', 'La Projection',
  'C''est l''heure de la projection !',
  'Le film est terminé. Partagez votre fierté et votre moment préféré.',
  'Dernière prise de parole : bilan personnel du parcours créatif collectif.',
  NULL);
