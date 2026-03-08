-- ============================================================
-- MODULE 8 — L'Équipe
-- Quiz métiers, points invisibles, choix de rôle, cartes talents.
-- Replaces stubs from 042.
-- ============================================================

-- Drop old stub tables if they exist
DROP TABLE IF EXISTS module_equipe_quiz CASCADE;
DROP TABLE IF EXISTS module_equipe_roles CASCADE;

-- Table 1: Réponses au quiz métiers
CREATE TABLE module8_quiz (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  metier_key TEXT NOT NULL,
  believed_role TEXT DEFAULT '',
  correct BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, student_id, metier_key)
);

-- Table 2: Points (calculés, visibles seulement par le facilitateur)
CREATE TABLE module8_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  participation_score INT DEFAULT 0,
  creativity_score INT DEFAULT 0,
  engagement_score INT DEFAULT 0,
  total_score INT GENERATED ALWAYS AS (participation_score + creativity_score + engagement_score) STORED,
  rank INT,
  computed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, student_id)
);

-- Table 3: Attribution des rôles
CREATE TABLE module8_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  role_key TEXT NOT NULL,
  is_veto BOOLEAN DEFAULT FALSE,
  chosen_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, student_id),
  UNIQUE(session_id, role_key)
);

-- Table 4: Cartes talents
CREATE TABLE module8_talent_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  talent_category TEXT NOT NULL CHECK (talent_category IN ('jeu', 'image', 'technique')),
  strengths TEXT[] DEFAULT '{}',
  role_key TEXT,
  generated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, student_id)
);

-- Indexes
CREATE INDEX idx_m8_quiz_session ON module8_quiz(session_id);
CREATE INDEX idx_m8_points_session ON module8_points(session_id);
CREATE INDEX idx_m8_roles_session ON module8_roles(session_id);
CREATE INDEX idx_m8_talent_session ON module8_talent_cards(session_id);

-- RLS
ALTER TABLE module8_quiz ENABLE ROW LEVEL SECURITY;
ALTER TABLE module8_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE module8_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE module8_talent_cards ENABLE ROW LEVEL SECURITY;

-- Quiz: all access (server-side admin client)
CREATE POLICY "m8_quiz_all" ON module8_quiz FOR ALL USING (true);
-- Points: facilitateur only via admin client, so open policy is fine
CREATE POLICY "m8_points_all" ON module8_points FOR ALL USING (true);
-- Roles: all access
CREATE POLICY "m8_roles_all" ON module8_roles FOR ALL USING (true);
-- Talent cards: all access
CREATE POLICY "m8_talent_all" ON module8_talent_cards FOR ALL USING (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE module8_quiz;
ALTER PUBLICATION supabase_realtime ADD TABLE module8_points;
ALTER PUBLICATION supabase_realtime ADD TABLE module8_roles;
ALTER PUBLICATION supabase_realtime ADD TABLE module8_talent_cards;

-- Seed situations for Module 8 (dbModule=8, dbSeance=1, 5 positions)
INSERT INTO situations (module, seance, position, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES
  (8, 1, 1, 'collectif', 'Quiz métiers', 'Connais-tu les métiers du cinéma ?', 'Teste tes connaissances sur les métiers du tournage !', 'Évaluez vos connaissances des métiers du cinéma.', 'Attention aux idées reçues !'),
  (8, 1, 2, 'collectif', 'Débrief', 'Les vraies réponses !', 'Découvre les vrais métiers du cinéma et corrige tes idées reçues.', 'Correction collective du quiz et discussion.', 'Chaque métier a un rôle précis sur un tournage.'),
  (8, 1, 3, 'collectif', 'Choix de rôle', 'À toi de choisir ton rôle !', 'C''est ton tour ! Choisis le rôle qui te correspond.', 'Sélectionnez votre rôle de tournage.', 'Tu ne peux choisir que parmi les rôles disponibles.'),
  (8, 1, 4, 'collectif', 'Récap équipe', 'Voici votre équipe !', 'Découvre la composition complète de l''équipe de tournage.', 'Vue d''ensemble de l''équipe constituée.', 'Chacun a un rôle essentiel.'),
  (8, 1, 5, 'collectif', 'Carte talent', 'Ta carte talent !', 'Découvre ta carte talent personnalisée.', 'Votre carte de compétences personnalisée.', 'Garde-la précieusement !')
ON CONFLICT DO NOTHING;
