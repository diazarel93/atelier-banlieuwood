-- ============================================================
-- Migration 009: Module 1 — Confiance + Diagnostic
-- 3 images × 4 questions × 3 niveaux d'âge = 36 relances
-- ============================================================

-- Table des images Module 1 (statique, 3 images)
CREATE TABLE IF NOT EXISTS module1_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position INT NOT NULL CHECK (position IN (1, 2, 3)),
  title TEXT NOT NULL,
  description TEXT,
  -- Placeholder URLs — will be replaced by Adrian's real images
  -- For now we use Unsplash-style atmospheric photos
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(position)
);

-- Table des relances (prompts de suivi adaptés par âge)
CREATE TABLE IF NOT EXISTS module1_relances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_position INT NOT NULL CHECK (image_position IN (1, 2, 3)),
  question_index INT NOT NULL CHECK (question_index IN (1, 2, 3, 4)),
  age_level TEXT NOT NULL CHECK (age_level IN ('primaire', 'college', 'lycee')),
  relance_text TEXT NOT NULL,
  UNIQUE(image_position, question_index, age_level)
);

-- RLS
ALTER TABLE module1_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE module1_relances ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire les images et relances (données statiques)
CREATE POLICY "module1_images_read" ON module1_images FOR SELECT USING (true);
CREATE POLICY "module1_relances_read" ON module1_relances FOR SELECT USING (true);

-- ============================================================
-- SEED: 3 images placeholder
-- Photos ambiguës, pas de visages nets (spec Adrian)
-- ============================================================

INSERT INTO module1_images (position, title, description, image_url) VALUES
(1, 'La rue',
 'Une rue urbaine au crépuscule. Lumière dorée, ombres longues. Une silhouette au loin.',
 '/images/module1/placeholder-1.svg'),
(2, 'L''intérieur',
 'Une pièce avec une table, des papiers éparpillés, une chaise vide. Lumière par la fenêtre.',
 '/images/module1/placeholder-2.svg'),
(3, 'Le banc',
 'Deux silhouettes assises sur un banc, vues de dos. Horizon urbain devant elles.',
 '/images/module1/placeholder-3.svg')
ON CONFLICT (position) DO NOTHING;

-- ============================================================
-- SEED: 36 relances (4 questions × 3 images × 3 âges)
-- ============================================================
-- Questions fixes (identiques pour tous) :
--   Q1: "Que vois-tu dans cette image ?"        → Observation / Détail
--   Q2: "Que se passe-t-il ?"                   → Analyse / Interprétation
--   Q3: "Que va-t-il se passer après ?"          → Créativité / Projection
--   Q4: "Quel détail t'a fait penser ça ?"       → Émotion / Justification

-- IMAGE 1 — La rue
INSERT INTO module1_relances (image_position, question_index, age_level, relance_text) VALUES
-- Q1: Observation
(1, 1, 'primaire', 'Regarde bien les couleurs et les formes. Tu vois quoi exactement ?'),
(1, 1, 'college', 'Décris ce que tu vois — les couleurs, les formes, les gens, les objets.'),
(1, 1, 'lycee', 'Décris précisément ce que tu observes — composition, lumière, éléments visuels.'),
-- Q2: Interprétation
(1, 2, 'primaire', 'À ton avis, c''est quelle heure ? Il fait beau ou pas ?'),
(1, 2, 'college', 'Qu''est-ce qui vient de se passer juste avant cette image ?'),
(1, 2, 'lycee', 'Quelle histoire cette image raconte-t-elle ? Qu''est-ce qui précède cet instant ?'),
-- Q3: Projection
(1, 3, 'primaire', 'La personne au loin, elle va où ? Qu''est-ce qu''elle va faire ?'),
(1, 3, 'college', 'Imagine la suite — que se passe-t-il dans les 5 prochaines minutes ?'),
(1, 3, 'lycee', 'Si c''était l''ouverture d''un film, quelle serait la scène suivante ?'),
-- Q4: Justification
(1, 4, 'primaire', 'Montre du doigt ce qui t''a donné cette idée.'),
(1, 4, 'college', 'Quel élément précis dans l''image t''a fait penser ça ?'),
(1, 4, 'lycee', 'Sur quel indice visuel repose ton interprétation ?'),

-- IMAGE 2 — L'intérieur
-- Q1: Observation
(2, 1, 'primaire', 'Regarde la pièce. Qu''est-ce qu''il y a sur la table ? Et par terre ?'),
(2, 1, 'college', 'Décris cette pièce — les meubles, la lumière, ce qui traîne.'),
(2, 1, 'lycee', 'Inventorie la scène : objets, textures, éclairage, organisation de l''espace.'),
-- Q2: Interprétation
(2, 2, 'primaire', 'Quelqu''un était là avant. C''était qui ? Il faisait quoi ?'),
(2, 2, 'college', 'Qui était assis là ? Qu''est-ce qu''il ou elle faisait avant de partir ?'),
(2, 2, 'lycee', 'Reconstitue la scène qui a précédé — qui occupait cet espace et pourquoi est-il parti ?'),
-- Q3: Projection
(2, 3, 'primaire', 'Est-ce que la personne va revenir ? Qu''est-ce qui va se passer ?'),
(2, 3, 'college', 'Imagine : quelqu''un ouvre la porte maintenant. C''est qui ? Il réagit comment ?'),
(2, 3, 'lycee', 'Cette pièce est le décor d''une scène clé. Que va-t-il s''y jouer ?'),
-- Q4: Justification
(2, 4, 'primaire', 'Qu''est-ce qui t''a donné cette idée ? Montre-le dans l''image.'),
(2, 4, 'college', 'Quel objet ou quel détail t''a mis sur cette piste ?'),
(2, 4, 'lycee', 'Identifie l''élément visuel qui fonde ton hypothèse.'),

-- IMAGE 3 — Le banc
-- Q1: Observation
(3, 1, 'primaire', 'Qu''est-ce que tu vois ? Les deux personnes, elles sont comment ?'),
(3, 1, 'college', 'Décris les deux personnes et ce qui les entoure.'),
(3, 1, 'lycee', 'Analyse la composition : postures, distance entre les personnages, arrière-plan.'),
-- Q2: Interprétation
(3, 2, 'primaire', 'Tu crois qu''ils sont amis ? Tristes ? Contents ?'),
(3, 2, 'college', 'Quelle est la relation entre ces deux personnes ? Qu''est-ce qui se passe entre elles ?'),
(3, 2, 'lycee', 'Quel type de relation lie ces deux individus ? Quelle dynamique perçois-tu ?'),
-- Q3: Projection
(3, 3, 'primaire', 'Une des deux personnes va se lever. Laquelle ? Elle va faire quoi ?'),
(3, 3, 'college', 'Dans 10 minutes, que se passe-t-il ? L''un d''eux dit quelque chose — c''est quoi ?'),
(3, 3, 'lycee', 'Écris le dialogue qui va suivre. Ou le silence qui s''installe — et pourquoi.'),
-- Q4: Justification
(3, 4, 'primaire', 'Comment tu sais ça ? Qu''est-ce que tu as vu qui te fait dire ça ?'),
(3, 4, 'college', 'Quel détail — posture, geste, espace — t''a fait penser ça ?'),
(3, 4, 'lycee', 'Appuie ton interprétation sur un élément concret de l''image.')
ON CONFLICT (image_position, question_index, age_level) DO NOTHING;

-- ============================================================
-- SEED: Module 1 "situations" in the main situations table
-- This allows responses to reference them via situation_id FK
-- 12 entries: 3 images × 4 questions
-- We use module=1, seance=1, position = (img-1)*4 + question
-- ============================================================

INSERT INTO situations (module, seance, position, variant, category, restitution_label,
  prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES
-- Image 1, Q1-Q4
(1, 1, 1, 0, 'observation', 'Observation — Image 1',
 'Que vois-tu dans cette image ?', 'Que vois-tu dans cette image ?', 'Que vois-tu dans cette image ?',
 'Regarde bien les couleurs et les formes.'),
(1, 1, 2, 0, 'interpretation', 'Interprétation — Image 1',
 'Que se passe-t-il ?', 'Que se passe-t-il ?', 'Que se passe-t-il ?',
 'Qu''est-ce qui vient de se passer juste avant ?'),
(1, 1, 3, 0, 'creativite', 'Imagination — Image 1',
 'Que va-t-il se passer après ?', 'Que va-t-il se passer après ?', 'Que va-t-il se passer après ?',
 'Imagine la suite.'),
(1, 1, 4, 0, 'emotion', 'Sensibilité — Image 1',
 'Quel détail t''a fait penser ça ?', 'Quel détail t''a fait penser ça ?', 'Quel détail t''a fait penser ça ?',
 'Montre ce qui t''a donné cette idée.'),
-- Image 2, Q1-Q4
(1, 1, 5, 0, 'observation', 'Observation — Image 2',
 'Que vois-tu dans cette image ?', 'Que vois-tu dans cette image ?', 'Que vois-tu dans cette image ?',
 'Regarde bien chaque objet.'),
(1, 1, 6, 0, 'interpretation', 'Interprétation — Image 2',
 'Que se passe-t-il ?', 'Que se passe-t-il ?', 'Que se passe-t-il ?',
 'Qui était là avant ?'),
(1, 1, 7, 0, 'creativite', 'Imagination — Image 2',
 'Que va-t-il se passer après ?', 'Que va-t-il se passer après ?', 'Que va-t-il se passer après ?',
 'Imagine que quelqu''un entre.'),
(1, 1, 8, 0, 'emotion', 'Sensibilité — Image 2',
 'Quel détail t''a fait penser ça ?', 'Quel détail t''a fait penser ça ?', 'Quel détail t''a fait penser ça ?',
 'Quel objet t''a mis sur la piste ?'),
-- Image 3, Q1-Q4
(1, 1, 9, 0, 'observation', 'Observation — Image 3',
 'Que vois-tu dans cette image ?', 'Que vois-tu dans cette image ?', 'Que vois-tu dans cette image ?',
 'Décris les deux personnes.'),
(1, 1, 10, 0, 'interpretation', 'Interprétation — Image 3',
 'Que se passe-t-il ?', 'Que se passe-t-il ?', 'Que se passe-t-il ?',
 'C''est quoi la relation entre eux ?'),
(1, 1, 11, 0, 'creativite', 'Imagination — Image 3',
 'Que va-t-il se passer après ?', 'Que va-t-il se passer après ?', 'Que va-t-il se passer après ?',
 'Une des deux personnes va se lever.'),
(1, 1, 12, 0, 'emotion', 'Sensibilité — Image 3',
 'Quel détail t''a fait penser ça ?', 'Quel détail t''a fait penser ça ?', 'Quel détail t''a fait penser ça ?',
 'Quel détail — posture, geste — t''a fait dire ça ?')
ON CONFLICT (module, seance, position, variant) DO NOTHING;
