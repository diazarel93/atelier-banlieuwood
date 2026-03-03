-- ============================================================
-- Migration 019: Module 1 Redesign — Vision Adrian
-- Positionnement (8 QCM) + 1 question/image + Carnet d'idées
-- ============================================================

-- 1. Add new columns to situations
ALTER TABLE situations ADD COLUMN IF NOT EXISTS question_type TEXT DEFAULT 'open';
-- 'open' | 'closed' | 'notebook'

ALTER TABLE situations ADD COLUMN IF NOT EXISTS options JSONB;
-- For closed: [{"key":"a","label":"..."},{"key":"b","label":"..."}]

ALTER TABLE situations ADD COLUMN IF NOT EXISTS image_position INT;
-- Links to module1_images.position (1-3), null for non-image questions

-- 2. Clean up FK dependencies, then delete old Module 1 situations
DELETE FROM votes WHERE situation_id IN (SELECT id FROM situations WHERE module = 1);
DELETE FROM collective_choices WHERE situation_id IN (SELECT id FROM situations WHERE module = 1);
DELETE FROM responses WHERE situation_id IN (SELECT id FROM situations WHERE module = 1);
DELETE FROM situations WHERE module = 1;

-- 3. Insert 8 positionnement questions (module=1, seance=1, question_type='closed')
-- Each question measures a creative axis: observation, narration, emotion, audace

INSERT INTO situations (module, seance, position, variant, category, restitution_label,
  prompt_6_9, prompt_10_13, prompt_14_18, nudge_text, question_type, options) VALUES

-- Q1: Ton regard (observation vs narration vs emotion)
(1, 1, 1, 0, 'positionnement', 'Ton regard',
 'Quand tu regardes un film, qu''est-ce que tu remarques en premier ?',
 'Quand tu regardes un film, qu''est-ce qui te capte en premier ?',
 'Quand tu regardes un film, qu''est-ce qui retient ton attention en premier ?',
 NULL, 'closed',
 '[{"key":"a","label":"Les couleurs, les décors, la lumière"},{"key":"b","label":"Ce que disent les personnages"},{"key":"c","label":"La musique, l''ambiance"},{"key":"d","label":"L''histoire, ce qui va se passer"}]'),

-- Q2: Ta réaction (emotion vs audace vs observation)
(1, 1, 2, 0, 'positionnement', 'Ta réaction',
 'Tu vois une image bizarre dans la rue. Tu fais quoi ?',
 'Tu vois un truc étrange dans la rue. Tu fais quoi ?',
 'Tu tombes sur une scène inattendue dans la rue. Quelle est ta réaction ?',
 NULL, 'closed',
 '[{"key":"a","label":"Je m''arrête et j''observe chaque détail"},{"key":"b","label":"J''invente une histoire dans ma tête"},{"key":"c","label":"Je prends une photo direct"}]'),

-- Q3: Ton style (narration vs audace vs emotion)
(1, 1, 3, 0, 'positionnement', 'Ton style',
 'Si tu devais faire un film, ce serait quoi ?',
 'Si tu réalisais un film, quel genre tu choisirais ?',
 'Si tu devais réaliser ton premier film, vers quel genre irais-tu ?',
 NULL, 'closed',
 '[{"key":"a","label":"Une comédie qui fait rire tout le monde"},{"key":"b","label":"Un drame qui fait réfléchir"},{"key":"c","label":"Un thriller avec des retournements"},{"key":"d","label":"Un documentaire sur un sujet qui me tient à cœur"}]'),

-- Q4: Ton perso (narration vs observation vs emotion)
(1, 1, 4, 0, 'positionnement', 'Ton personnage',
 'C''est quoi un bon personnage pour toi ?',
 'Pour toi, qu''est-ce qui fait un bon personnage ?',
 'Qu''est-ce qui rend un personnage de fiction mémorable selon toi ?',
 NULL, 'closed',
 '[{"key":"a","label":"Quelqu''un qui dit des trucs drôles ou marquants"},{"key":"b","label":"Quelqu''un qu''on comprend, même s''il fait des erreurs"},{"key":"c","label":"Quelqu''un qui a un look ou un style unique"},{"key":"d","label":"Quelqu''un qui vit des choses intenses"}]'),

-- Q5: Ton attention (observation vs audace)
(1, 1, 5, 0, 'positionnement', 'Ton attention',
 'Quand tu lis une histoire, tu préfères quoi ?',
 'Quand tu lis ou regardes une histoire, tu préfères quoi ?',
 'Dans une œuvre narrative, qu''est-ce qui te captive le plus ?',
 NULL, 'closed',
 '[{"key":"a","label":"Les descriptions de lieux et d''ambiance"},{"key":"b","label":"Les dialogues entre personnages"},{"key":"c","label":"Les rebondissements et les surprises"},{"key":"d","label":"Les moments d''émotion forte"}]'),

-- Q6: Ton rôle (audace vs narration vs observation)
(1, 1, 6, 0, 'positionnement', 'Ton rôle',
 'Sur un tournage, tu aimerais faire quoi ?',
 'Sur un tournage, quel rôle t''attirerait le plus ?',
 'Si tu participais à un tournage, quel poste t''intéresserait ?',
 NULL, 'closed',
 '[{"key":"a","label":"Réalisateur — je décide de tout"},{"key":"b","label":"Scénariste — j''écris l''histoire"},{"key":"c","label":"Acteur — je joue un personnage"},{"key":"d","label":"Chef opérateur — je gère l''image et la lumière"}]'),

-- Q7: Ton émotion (emotion vs narration vs audace)
(1, 1, 7, 0, 'positionnement', 'Ton émotion',
 'C''est quoi une bonne fin de film ?',
 'Pour toi, c''est quoi une bonne fin de film ?',
 'Quelle fin de film te marque le plus ?',
 NULL, 'closed',
 '[{"key":"a","label":"Une fin heureuse où tout s''arrange"},{"key":"b","label":"Une fin triste mais belle"},{"key":"c","label":"Une fin ouverte où on imagine la suite"},{"key":"d","label":"Une fin choc qu''on attend pas"}]'),

-- Q8: Ton audace (audace vs observation vs emotion)
(1, 1, 8, 0, 'positionnement', 'Ton audace',
 'Si tu pouvais filmer n''importe quoi, ce serait quoi ?',
 'Si tu pouvais filmer absolument n''importe quoi, tu filmerais quoi ?',
 'Si tu avais carte blanche pour un court-métrage, quel sujet choisirais-tu ?',
 NULL, 'closed',
 '[{"key":"a","label":"Ma rue, mon quartier, les gens autour de moi"},{"key":"b","label":"Un monde imaginaire que j''invente"},{"key":"c","label":"Un problème qui me révolte"},{"key":"d","label":"Une histoire vraie qui m''a marqué"}]');

-- 4. Insert 3 image situations (seance 2/3/4, 1 question each, question_type='open')

INSERT INTO situations (module, seance, position, variant, category, restitution_label,
  prompt_6_9, prompt_10_13, prompt_14_18, nudge_text, question_type, image_position) VALUES

-- Image 1 — La rue (seance 2)
(1, 2, 1, 0, 'image', 'La rue',
 'Regarde bien cette image. Raconte ce que tu vois et invente la suite.',
 'Observe cette image. Décris ce que tu vois, ce que tu ressens, et imagine ce qui va se passer.',
 'Analyse cette image : ce qu''elle montre, ce qu''elle suggère, et la scène qui pourrait suivre.',
 'Pense aux personnages, aux couleurs, à l''ambiance...', 'open', 1),

-- Image 2 — L'intérieur (seance 3)
(1, 3, 1, 0, 'image', 'L''intérieur',
 'Regarde bien cette image. Raconte ce que tu vois et invente la suite.',
 'Observe cette image. Décris ce que tu vois, ce que tu ressens, et imagine ce qui va se passer.',
 'Analyse cette image : ce qu''elle montre, ce qu''elle suggère, et la scène qui pourrait suivre.',
 'Pense aux objets, à la lumière, à qui était là avant...', 'open', 2),

-- Image 3 — Le banc (seance 4)
(1, 4, 1, 0, 'image', 'Le banc',
 'Regarde bien cette image. Raconte ce que tu vois et invente la suite.',
 'Observe cette image. Décris ce que tu vois, ce que tu ressens, et imagine ce qui va se passer.',
 'Analyse cette image : ce qu''elle montre, ce qu''elle suggère, et la scène qui pourrait suivre.',
 'Pense aux postures, à la relation entre les personnages...', 'open', 3);

-- 5. Insert 1 notebook situation (seance 5)

INSERT INTO situations (module, seance, position, variant, category, restitution_label,
  prompt_6_9, prompt_10_13, prompt_14_18, nudge_text, question_type) VALUES

(1, 5, 1, 0, 'carnet', 'Carnet d''idées',
 'Note tes idées, tes images, tout ce qui t''est venu en tête pendant les images.',
 'Note tes idées, tes images, tout ce qui t''est venu en tête. C''est ton carnet, écris librement.',
 'Consigne libre : note tes idées, impressions, fragments d''histoires. Tout ce que les images t''ont inspiré.',
 'Pas de règle ici — écris ce que tu veux, comme tu veux.', 'notebook');
