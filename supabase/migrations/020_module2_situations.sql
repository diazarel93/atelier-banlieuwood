-- ============================================================
-- Migration 020: Module 2 — Production (29 situations)
-- 4 séances : Le Cinéma (8), Les Choix (5), Les Imprévus (8), Le Plan (8)
-- Catégories : metiers, budget, contrainte, resolution, organisation
-- ============================================================

-- Clear existing module 2 situations (and linked responses) before re-seeding
DELETE FROM responses WHERE situation_id IN (SELECT id FROM situations WHERE module = 2);
DELETE FROM situations WHERE module = 2;

-- ── Séance 1 : "Le Cinéma" (m2a, 8 questions) ───────────

INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES

(2, 1, 1, 0, 'metiers', 'Le réalisateur',
  'C''est quoi un réalisateur ? C''est le chef du film ?',
  'Que fait un réalisateur sur un tournage ? Pourquoi c''est lui le patron ?',
  'Quel est le rôle exact du réalisateur ? En quoi son regard façonne le film tout entier ?',
  'Pense à un film que tu aimes. Qu''est-ce que le réalisateur a décidé ?'),

(2, 1, 2, 0, 'metiers', 'L''équipe',
  'Un film, on le fait tout seul ou avec des gens ? C''est qui ces gens ?',
  'On ne fait pas un film seul. Quels métiers faut-il pour tourner ?',
  'Un film mobilise des dizaines de métiers. Lesquels sont indispensables et pourquoi ?',
  'Et si tu oubliais un métier, qu''est-ce qui manquerait ?'),

(2, 1, 3, 0, 'budget', 'Le coût',
  'Ça coûte de l''argent un film ? C''est quoi qui coûte cher ?',
  'Pourquoi un film coûte de l''argent ? C''est quoi les grosses dépenses ?',
  'Quels sont les postes de dépense majeurs d''une production ? Pourquoi certains films coûtent des millions ?',
  'Qu''est-ce qui coûte le plus cher selon toi : les acteurs, les décors ou le matériel ?'),

(2, 1, 4, 0, 'contrainte', 'Le temps',
  'Si tu dois finir ton film ce soir, tu fais comment ?',
  'Un tournage a une deadline. Que se passe-t-il quand le temps manque ?',
  'Comment la contrainte temporelle influence-t-elle les choix créatifs d''un tournage ?',
  'Tu as déjà dû finir quelque chose dans l''urgence ? C''était comment ?'),

(2, 1, 5, 0, 'contrainte', 'L''espace',
  'Tu peux pas filmer partout ! Pourquoi ? Où t''as pas le droit ?',
  'On ne peut pas filmer partout. Quelles sont les limites et comment s''adapter ?',
  'Quelles contraintes spatiales un réalisateur doit-il gérer ? Comment les transformer en atout créatif ?',
  'Si tu ne pouvais filmer que dans cette salle, tu ferais quoi ?'),

(2, 1, 6, 0, 'metiers', 'Le cadreur',
  'Qui tient la caméra ? C''est important ce qu''il regarde ?',
  'Le cadreur décide ce qu''on voit à l''écran. Quels choix il fait ?',
  'En quoi le cadrage influence la perception du spectateur ? Quelles décisions le cadreur prend-il ?',
  'Essaie de cadrer avec tes mains. Qu''est-ce que tu montres ? Qu''est-ce que tu caches ?'),

(2, 1, 7, 0, 'budget', 'Le low-budget',
  'Des films super bien mais sans argent — ça existe ? Comment ils font ?',
  'Certains grands films ne coûtent presque rien. Comment c''est possible ?',
  'Comment des cinéastes sans budget réussissent-ils à créer des œuvres marquantes ? Quelles stratégies utilisent-ils ?',
  'Connais-tu un film fait avec très peu de moyens ?'),

(2, 1, 8, 0, 'contrainte', 'Produire un film',
  'Alors c''est quoi faire un film ? Résume en une phrase !',
  'Produire un film, ça veut dire quoi ? Résume tout ce qu''on a vu.',
  'En synthèse : que signifie vraiment "produire un film" ? Quels sont les compromis fondamentaux ?',
  'Si tu devais expliquer à quelqu''un qui n''y connaît rien...');

-- ── Séance 2 : "Les Choix" (m2b, 5 questions) ───────────

INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES

(2, 2, 1, 0, 'budget', 'Le casting',
  'Dans ton film, c''est qui les acteurs ? Toi tout seul, tes potes, ou toute la classe ?',
  'Quel type d''acteurs pour TON film ? Des stars, tes amis, ou toi en solo ?',
  'Quel casting sert le mieux ton histoire ? Acteurs pros, amateurs, ou approche minimaliste ?',
  'Les acteurs changent tout. Imagine la même scène avec des acteurs différents.'),

(2, 2, 2, 0, 'budget', 'Le décor',
  'Ton film se passe où ? Dans une salle, dehors, ou partout ?',
  'Où se passe ton film ? Un seul lieu, quelques endroits, ou partout ?',
  'Quel est l''impact du choix des décors sur le budget et l''ambiance de ton film ?',
  'Le lieu raconte déjà une histoire. Laquelle ?'),

(2, 2, 3, 0, 'budget', 'L''image',
  'Ton film il ressemble à quoi ? Filmé vite fait ou bien fait ?',
  'Comment tu veux que ton film ressemble ? Brut au téléphone ou travaillé ?',
  'Quel rendu visuel recherches-tu ? Brut et authentique, soigné, ou cinématographique ?',
  'L''image qu''on choisit change ce que le spectateur ressent.'),

(2, 2, 4, 0, 'budget', 'Le son',
  'Dans ton film on entend quoi ? Rien, les voix, ou de la musique aussi ?',
  'Ton film est muet, avec les voix des acteurs, ou avec une bande-son complète ?',
  'Quel traitement sonore pour ton film ? Le son est souvent sous-estimé mais il fait 50% de l''émotion.',
  'Ferme les yeux et écoute. Le son change tout.'),

(2, 2, 5, 0, 'budget', 'Le montage',
  'Ton film c''est un seul long plan ou tu coupes et tu colles ?',
  'Plan-séquence sans coupure ou montage avec transitions et effets ?',
  'Quel style de montage correspond à ton film ? Plan-séquence brut, découpage rythmé, ou montage travaillé ?',
  'Le montage c''est le rythme de ton film. Rapide ou lent ?');

-- ── Séance 3 : "Les Imprévus" (m2c, 8 questions) ────────

INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES

(2, 3, 1, 0, 'resolution', 'L''acteur absent',
  'L''acteur principal est malade ! Tu tournes ta scène comment ?',
  'Ton acteur principal ne vient pas le jour de la scène clé. Tu fais quoi ?',
  'L''acteur principal est absent le jour du tournage de la scène cruciale. Quelles solutions créatives s''offrent à toi ?',
  'Dans le vrai cinéma, ça arrive tout le temps. Les pros ont toujours un plan B.'),

(2, 3, 2, 0, 'resolution', 'La météo',
  'Tu voulais filmer dehors mais il pleut ! Tu fais quoi ?',
  'Tu avais prévu une scène en extérieur mais il pleut des cordes. Quelle est ta solution ?',
  'La météo ruine ton plan de tournage extérieur. Comment transformer cette contrainte en opportunité créative ?',
  'Et si la pluie rendait ta scène encore mieux ?'),

(2, 3, 3, 0, 'resolution', 'La panne',
  'Ton téléphone s''éteint en plein milieu ! Tu fais quoi ?',
  'Ton téléphone meurt au milieu de la meilleure prise. Comment tu réagis ?',
  'Ta caméra tombe en panne pendant la meilleure prise. Comment gérer cette crise technique ?',
  'Le matériel peut lâcher à tout moment. C''est quoi ton réflexe ?'),

(2, 3, 4, 0, 'resolution', 'Le bruit',
  'Y''a plein de bruit partout ! On entend rien ! Comment tu fais ?',
  'Des travaux couvrent tous les dialogues de ta scène. C''est quoi ta solution ?',
  'Un bruit parasite rend impossible l''enregistrement des dialogues. Quelles alternatives as-tu ?',
  'Le son c''est la moitié du film. Trouve une solution !'),

(2, 3, 5, 0, 'resolution', 'Le conflit d''équipe',
  'Deux copains sont pas d''accord sur comment filmer. Tu fais quoi ?',
  'Deux membres de l''équipe ne sont pas d''accord sur comment tourner la scène. Comment tu gères ?',
  'Un désaccord créatif paralyse ton équipe. Comment arbitrer sans briser la dynamique de groupe ?',
  'Les conflits font partie de la création. L''important c''est comment on les résout.'),

(2, 3, 6, 0, 'resolution', 'L''accès refusé',
  'L''endroit où tu voulais filmer c''est fermé ! Tu vas où ?',
  'Le lieu prévu pour le tournage est fermé ou interdit. Que fais-tu ?',
  'Ton lieu de tournage est inaccessible. Comment repenser ta scène avec un lieu alternatif ?',
  'Un bon réalisateur sait s''adapter à n''importe quel lieu.'),

(2, 3, 7, 0, 'resolution', 'Le temps qui file',
  'Plus que 30 minutes et 3 scènes à tourner ! Tu fais comment ?',
  'Il reste 30 minutes et 3 scènes à tourner. Comment tu priorises ?',
  'Le temps s''écoule : 30 minutes, 3 scènes. Comment optimiser sans sacrifier la qualité ?',
  'Qu''est-ce qui est vraiment essentiel ? Qu''est-ce que tu peux simplifier ?'),

(2, 3, 8, 0, 'resolution', 'Le rush raté',
  'Les images sont toutes floues ! C''est foutu ou pas ?',
  'Tes rushes sont flous et inutilisables. C''est la catastrophe ou tu peux t''en sortir ?',
  'Les rushes sont inexploitables. Comment transformer cet échec en solution créative ?',
  'Parfois les accidents donnent les meilleures idées. Réfléchis !');

-- ── Séance 4 : "Le Plan" (m2d, 8 questions) ─────────────

INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES

(2, 4, 1, 0, 'organisation', 'L''équipe idéale',
  'Pour ton film, tu as besoin de qui ? Qui fait quoi ?',
  'Quels rôles dans ton équipe de tournage ? Qui fait quoi exactement ?',
  'Comment composer ton équipe idéale ? Quels rôles sont essentiels et comment répartir les responsabilités ?',
  'Chaque personne a un talent. C''est quoi le talent dont tu as le plus besoin ?'),

(2, 4, 2, 0, 'organisation', 'La scène clé',
  'C''est quoi LA scène la plus importante de ton film ?',
  'Quelle est LA scène qu''il faut absolument réussir dans ton film ?',
  'Identifie la scène pivot de ton film. Pourquoi est-elle irremplaçable et comment la préparer ?',
  'Si tu ne pouvais garder qu''une seule scène, ce serait laquelle ?'),

(2, 4, 3, 0, 'organisation', 'Le planning',
  'Tu as une après-midi pour tourner. Tu fais quoi en premier ?',
  'Comment organiser une après-midi de tournage ? Par quoi tu commences ?',
  'Conçois un planning de tournage pour une après-midi. Comment séquencer les scènes efficacement ?',
  'L''ordre dans lequel tu tournes change tout. Réfléchis bien.'),

(2, 4, 4, 0, 'organisation', 'Le repérage',
  'Avant de filmer, tu vas voir l''endroit. Tu vérifies quoi ?',
  'Avant le tournage, que dois-tu vérifier sur le lieu ? C''est quoi un bon repérage ?',
  'Quels éléments vérifier lors d''un repérage ? Lumière, son, accès, décor — qu''est-ce qui compte ?',
  'Les pros ne filment jamais sans repérage. Pourquoi ?'),

(2, 4, 5, 0, 'contrainte', 'Le plan B',
  'Si ta scène préférée rate, tu fais quoi à la place ?',
  'Si ta scène clé rate complètement, c''est quoi ton plan B ?',
  'Comment anticiper l''échec de ta scène clé ? Quel plan B as-tu préparé ?',
  'Les meilleurs réalisateurs ont toujours un plan B. Et toi ?'),

(2, 4, 6, 0, 'organisation', 'Le premier plan',
  'La première image de ton film — on voit quoi ?',
  'Première image du film — que voit le spectateur ? C''est quoi cette première seconde ?',
  'Quel est le premier plan de ton film ? Comment cette image d''ouverture donne-t-elle le ton ?',
  'La première image accroche le spectateur. Ou pas.'),

(2, 4, 7, 0, 'organisation', 'Le dernier plan',
  'La dernière image de ton film — on voit quoi ?',
  'Dernière image du film — qu''est-ce qu''on retient quand l''écran s''éteint ?',
  'Quelle image finale laisses-tu au spectateur ? Comment cette dernière seconde résume-t-elle ton film ?',
  'La dernière image reste dans la tête. Longtemps.'),

(2, 4, 8, 0, 'organisation', 'Le pitch de prod',
  'Explique ton film en une phrase : c''est quoi, c''est où, c''est qui !',
  'Résume ton plan de tournage en une phrase : quoi, où, qui, comment ?',
  'Formule ton pitch de production : résume en une phrase le quoi, où, qui et comment de ton tournage.',
  'Si tu ne peux dire qu''une phrase pour convaincre, c''est laquelle ?');
