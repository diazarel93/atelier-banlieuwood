-- ============================================================
-- Module 10 "Et si..." + "Pitch" — Tables + Situations
-- ============================================================

-- ── TABLE: "Et si..." responses (séance 1) ──
CREATE TABLE module10_etsi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  image_id TEXT NOT NULL,
  etsi_text TEXT NOT NULL,
  help_used BOOLEAN DEFAULT false,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, student_id, image_id)
);

-- ── TABLE: Avatar/personnage data (séance 2) ──
CREATE TABLE module10_personnages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  prenom TEXT NOT NULL,
  age TEXT,
  trait_dominant TEXT,
  avatar_data JSONB NOT NULL DEFAULT '{}',
  submitted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, student_id)
);

-- ── TABLE: Assembled pitchs (séance 2) ──
CREATE TABLE module10_pitchs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  objectif TEXT NOT NULL,
  obstacle TEXT NOT NULL,
  pitch_text TEXT NOT NULL,
  chrono_seconds INT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, student_id)
);

-- ── TABLE: Shared idea bank ──
CREATE TABLE module10_idea_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id),
  text TEXT NOT NULL,
  category TEXT,
  votes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── TABLE: Help request tracking ──
CREATE TABLE module10_help_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  step TEXT NOT NULL,
  help_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── INDEXES ──
CREATE INDEX idx_module10_etsi_session ON module10_etsi(session_id);
CREATE INDEX idx_module10_etsi_student ON module10_etsi(session_id, student_id);
CREATE INDEX idx_module10_personnages_session ON module10_personnages(session_id);
CREATE INDEX idx_module10_pitchs_session ON module10_pitchs(session_id);
CREATE INDEX idx_module10_idea_bank_session ON module10_idea_bank(session_id);
CREATE INDEX idx_module10_help_requests_session ON module10_help_requests(session_id);

-- ── RLS ──
ALTER TABLE module10_etsi ENABLE ROW LEVEL SECURITY;
ALTER TABLE module10_personnages ENABLE ROW LEVEL SECURITY;
ALTER TABLE module10_pitchs ENABLE ROW LEVEL SECURITY;
ALTER TABLE module10_idea_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE module10_help_requests ENABLE ROW LEVEL SECURITY;

-- Et si
CREATE POLICY "Students can insert own etsi" ON module10_etsi FOR INSERT
  WITH CHECK (student_id IN (SELECT id FROM students WHERE session_id = module10_etsi.session_id));
CREATE POLICY "Students can read etsi" ON module10_etsi FOR SELECT USING (true);
CREATE POLICY "Students can update own etsi" ON module10_etsi FOR UPDATE USING (true);

-- Personnages
CREATE POLICY "Students can insert own personnage" ON module10_personnages FOR INSERT
  WITH CHECK (student_id IN (SELECT id FROM students WHERE session_id = module10_personnages.session_id));
CREATE POLICY "Students can read personnages" ON module10_personnages FOR SELECT USING (true);
CREATE POLICY "Students can update own personnage" ON module10_personnages FOR UPDATE USING (true);

-- Pitchs
CREATE POLICY "Students can insert own pitch" ON module10_pitchs FOR INSERT
  WITH CHECK (student_id IN (SELECT id FROM students WHERE session_id = module10_pitchs.session_id));
CREATE POLICY "Students can read pitchs" ON module10_pitchs FOR SELECT USING (true);
CREATE POLICY "Students can update own pitch" ON module10_pitchs FOR UPDATE USING (true);

-- Idea bank
CREATE POLICY "Students can insert ideas" ON module10_idea_bank FOR INSERT
  WITH CHECK (student_id IN (SELECT id FROM students WHERE session_id = module10_idea_bank.session_id));
CREATE POLICY "Anyone can read ideas" ON module10_idea_bank FOR SELECT USING (true);
CREATE POLICY "Anyone can update ideas" ON module10_idea_bank FOR UPDATE USING (true);

-- Help requests
CREATE POLICY "Students can insert help requests" ON module10_help_requests FOR INSERT
  WITH CHECK (student_id IN (SELECT id FROM students WHERE session_id = module10_help_requests.session_id));
CREATE POLICY "Students can read own help requests" ON module10_help_requests FOR SELECT USING (true);

-- ── REALTIME ──
ALTER PUBLICATION supabase_realtime ADD TABLE module10_etsi;
ALTER PUBLICATION supabase_realtime ADD TABLE module10_personnages;
ALTER PUBLICATION supabase_realtime ADD TABLE module10_pitchs;
ALTER PUBLICATION supabase_realtime ADD TABLE module10_idea_bank;
ALTER PUBLICATION supabase_realtime ADD TABLE module10_help_requests;

-- ============================================================
-- SITUATIONS for Module 10 (8 situations across 2 séances)
-- Séance 1: Et si... (3 situations)
-- Séance 2: Pitch (5 situations)
-- ============================================================

-- ── Séance 1: Et si... ──

-- pos 1 = Image exploration + "Et si..." writing (special component: EtsiWriterState)
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (10, 1, 1, 'imagination', 'Et si...', 'special',
  'Regarde bien l''image. Et si cette scène était le début d''un film ? Écris ce qui pourrait se passer.',
  'Observe l''image attentivement. Imagine que c''est la première scène d''un film. Commence par « Et si... » et écris ce qui pourrait arriver.',
  'Analysez cette image comme un plan d''ouverture. Formulez une hypothèse narrative en commençant par « Et si... » — explorez le potentiel dramatique de cette situation.',
  'Laisse ton imagination faire le travail. Il n''y a pas de mauvaise réponse.');

-- pos 2 = QCM — narrative direction choice
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, options, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (10, 1, 2, 'imagination', 'Direction narrative', 'closed',
  '[{"key":"action","label":"De l''action et du suspense"},{"key":"emotion","label":"De l''émotion et des sentiments"},{"key":"mystere","label":"Du mystère et des secrets"},{"key":"humour","label":"De l''humour et de la surprise"}]'::jsonb,
  'Si tu devais faire un film avec cette image, tu voudrais quoi ?',
  'Si tu devais développer cette idée en film, quelle direction choisirais-tu ?',
  'Quelle orientation narrative privilégieriez-vous pour développer cette prémisse ?',
  'Pense à ce qui te plaît le plus dans les films que tu aimes.');

-- pos 3 = Share to idea bank + collective vote
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (10, 1, 3, 'imagination', 'Banque d''idées', 'special',
  'Partage ton idée « Et si... » préférée avec la classe ! Ensuite, vote pour celle que tu préfères.',
  'Envoie ta meilleure idée « Et si... » dans la banque d''idées de la classe. Découvre celles des autres et vote pour ta préférée.',
  'Soumettez votre proposition « Et si... » la plus aboutie à la banque d''idées collective. Évaluez les propositions de vos camarades.',
  'Les meilleures histoires naissent souvent d''une idée simple partagée avec les autres.');

-- ── Séance 2: Pitch ──

-- pos 1 = Avatar builder (special component: AvatarBuilderState)
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (10, 2, 1, 'pitch', 'Mon personnage', 'special',
  'Crée ton personnage ! Choisis son look et donne-lui un prénom.',
  'Construis ton personnage principal. Choisis son apparence, donne-lui un prénom et un trait de caractère.',
  'Concevez votre protagoniste. Définissez son identité visuelle, son nom et son trait dominant.',
  'Un bon personnage commence par une image claire dans la tête du spectateur.');

-- pos 2 = Objectif + obstacle selection
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (10, 2, 2, 'pitch', 'Objectif et obstacle', 'special',
  'Qu''est-ce que ton personnage veut ? Et qu''est-ce qui l''empêche ?',
  'Choisis ce que ton personnage veut obtenir (son objectif) et ce qui se met en travers de sa route (son obstacle).',
  'Définissez l''objectif dramatique de votre protagoniste et l''obstacle principal qui s''oppose à sa quête.',
  'Pas d''histoire sans objectif. Pas de tension sans obstacle.');

-- pos 3 = Pitch assembly (special component: PitchAssemblyState)
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (10, 2, 3, 'pitch', 'Le pitch', 'special',
  'Écris l''histoire de ton personnage en quelques phrases.',
  'Assemble ton pitch : qui est ton personnage, que veut-il, qu''est-ce qui l''en empêche, et que se passe-t-il ?',
  'Rédigez votre pitch en intégrant personnage, objectif, obstacle et enjeu. Visez la clarté et la concision.',
  'Un bon pitch tient en 3 phrases : qui, quoi, pourquoi on a envie de voir le film.');

-- pos 4 = Chrono test (special component: ChronoTestState)
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (10, 2, 4, 'pitch', 'Chrono pitch', 'special',
  'Lis ton pitch à voix haute en moins de 60 secondes !',
  'Présente ton pitch à voix haute. Tu as 60 secondes. Le chrono tourne !',
  'Pitchez votre projet en 60 secondes chrono. Clarté, rythme, conviction.',
  'Si tu ne peux pas le dire en 60 secondes, c''est que c''est trop compliqué.');

-- pos 5 = Confrontation + vote
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (10, 2, 5, 'pitch', 'Confrontation', 'special',
  'Regarde les deux pitchs projetés. Lequel te donne le plus envie de voir le film ?',
  'Deux pitchs sont projetés. Écoute bien et vote pour celui qui te donne le plus envie d''aller au cinéma.',
  'Deux pitchs sont confrontés. Lequel présente la prémisse la plus convaincante ? Votez.',
  'Ce qui compte, c''est l''envie que ça donne.');
