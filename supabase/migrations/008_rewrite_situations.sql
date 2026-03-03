-- ============================================
-- V2 — Réécriture situations Module 3 + Mode libre
-- ============================================

-- ── 1. Mode libre schema ───────────────────

ALTER TABLE sessions ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'guided'
  CHECK (mode IN ('guided', 'free'));

-- Allow sessions without a facilitator (free mode)
ALTER TABLE sessions ALTER COLUMN facilitator_id DROP NOT NULL;

-- RLS policies for free mode sessions (no auth needed)
CREATE POLICY "free_session_read" ON sessions FOR SELECT USING (mode = 'free');
CREATE POLICY "free_session_update" ON sessions FOR UPDATE USING (mode = 'free');
CREATE POLICY "free_students" ON students FOR ALL USING (
  session_id IN (SELECT id FROM sessions WHERE mode = 'free')
);
CREATE POLICY "free_responses" ON responses FOR ALL USING (
  session_id IN (SELECT id FROM sessions WHERE mode = 'free')
);
CREATE POLICY "free_choices" ON collective_choices FOR ALL USING (
  session_id IN (SELECT id FROM sessions WHERE mode = 'free')
);

-- ── 2. Truncate old situations and re-seed ─

TRUNCATE situations CASCADE;

-- ══════════════════════════════════════════════
-- VARIANT 0 (default) — 21 situations
-- Règle absolue : ZÉRO scénario imposé.
-- On nomme le concept narratif, on pose la question. Point.
-- L'élève invente TOUT. Aucun objet, lieu, mécanisme dicté.
-- ══════════════════════════════════════════════

-- ── Séance 1 : "C'est l'histoire de qui ?" (8 situations) ───

INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES

(3, 1, 1, 0, 'personnage', 'Le héros',
  'C''est qui le personnage principal de ton film ?',
  'Décris le personnage principal de ton film. Qui est-il ?',
  'Qui est le protagoniste ? Qu''est-ce qui le rend unique ?',
  'Pense à un détail qui le rend impossible à oublier.'),

(3, 1, 2, 0, 'personnage', 'Son désir',
  'Qu''est-ce que ton personnage veut plus que tout ?',
  'Ton personnage veut quelque chose très fort. C''est quoi ?',
  'Quel désir profond pousse ton personnage à agir ?',
  'Pourquoi c''est si important pour lui ?'),

(3, 1, 3, 0, 'personnage', 'Sa faille',
  'C''est quoi le défaut de ton personnage ?',
  'Quel est le point faible de ton personnage ?',
  'Quelle faille pourrait faire échouer ton personnage ?',
  'Comment ça se voit au quotidien ?'),

(3, 1, 4, 0, 'personnage', 'Son secret',
  'Ton personnage cache quelque chose. C''est quoi ?',
  'Quel secret ton personnage n''a jamais dit à personne ?',
  'Qu''est-ce que ton personnage dissimule au monde ?',
  'Qu''est-ce qui se passerait si ça se savait ?'),

(3, 1, 5, 0, 'liens', 'Le meilleur allié',
  'Qui est la personne la plus importante pour ton personnage ?',
  'Sur qui ton personnage peut toujours compter ? Pourquoi ?',
  'Qui est l''allié inconditionnel ? Qu''est-ce qui fonde ce lien ?',
  'Comment ils se sont trouvés ?'),

(3, 1, 6, 0, 'liens', 'Le rival',
  'Avec qui ton personnage ne s''entend pas ? Pourquoi ?',
  'Qui est en conflit avec ton personnage ? C''est quoi le problème entre eux ?',
  'Qui s''oppose à ton personnage ? D''où vient cette tension ?',
  'C''est quoi exactement qui les oppose ?'),

(3, 1, 7, 0, 'environnement', 'Le lieu',
  'Ton film se passe où ? C''est comment là-bas ?',
  'Décris le lieu principal de ton film. Qu''est-ce qu''on voit ?',
  'Quel est le décor central de ton film ? Décris-le.',
  'Qu''est-ce qui rend cet endroit particulier ?'),

(3, 1, 8, 0, 'environnement', 'L''ambiance',
  'Ton film donne quelle sensation quand on le regarde ?',
  'C''est quoi l''ambiance de ton film ?',
  'Quelle atmosphère se dégage de ton film ?',
  'Si c''était une couleur ou un son, ce serait quoi ?');

-- ── Séance 2 : "Il se passe quoi ?" (8 situations) ───

INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES

(3, 2, 1, 0, 'conflit', 'Le déclencheur',
  'Un jour, tout change. Qu''est-ce qui s''est passé ?',
  'Quelque chose bouleverse la vie de ton personnage. C''est quoi ?',
  'Un événement fait tout basculer. Lequel ?',
  'C''était prévisible ou totalement inattendu ?'),

(3, 2, 2, 0, 'conflit', 'L''obstacle',
  'Qu''est-ce qui empêche ton personnage d''avancer ?',
  'Quelque chose bloque ton personnage. C''est quoi ?',
  'Quel obstacle rend la situation difficile ?',
  'Pourquoi c''est si dur à surmonter ?'),

(3, 2, 3, 0, 'conflit', 'L''adversaire',
  'Qui rend les choses encore plus compliquées pour ton personnage ?',
  'Quelqu''un s''oppose à ton personnage. Qui et pourquoi ?',
  'Qui est la force antagoniste ? Quelles sont ses raisons ?',
  'De son point de vue à lui, il a raison ?'),

(3, 2, 4, 0, 'trajectoire', 'Le premier essai',
  'Ton personnage essaie de régler le problème. Ça donne quoi ?',
  'Ton personnage passe à l''action. Que fait-il ? Ça marche ?',
  'Quelle est la première tentative du protagoniste ? Résultat ?',
  'Raconte la scène.'),

(3, 2, 5, 0, 'trajectoire', 'Le dilemme',
  'Ton personnage doit choisir entre deux choses importantes. Lesquelles ?',
  'Deux options, impossible de garder les deux. C''est quoi le choix ?',
  'Un dilemme. Deux voies, chacune avec son prix. Lesquelles ?',
  'Qu''est-ce qu''il perd dans chaque cas ?'),

(3, 2, 6, 0, 'conflit', 'Le point bas',
  'C''est le pire moment de l''histoire. Que se passe-t-il ?',
  'Le moment le plus sombre. Que ressent ton personnage ?',
  'Tout s''effondre. Décris le point le plus bas.',
  'Qu''est-ce qu''il pense à cet instant ?'),

(3, 2, 7, 0, 'trajectoire', 'Le sursaut',
  'Quelque chose redonne de l''espoir. C''est quoi ?',
  'Un déclic. Quelque chose change. Quoi ?',
  'Qu''est-ce qui provoque le retournement ?',
  'C''est un changement extérieur ou intérieur ?'),

(3, 2, 8, 0, 'conflit', 'La confrontation',
  'Le grand moment arrive. Ton personnage affronte le problème. Comment ?',
  'C''est l''heure de vérité. Comment ton personnage fait face ?',
  'La confrontation finale. Raconte.',
  'Qu''est-ce qu''on verrait à l''écran ?');

-- ── Séance 3 : "Ça raconte quoi en vrai ?" (5 situations) ───

INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES

(3, 3, 1, 0, 'trajectoire', 'La résolution',
  'Comment ça finit ?',
  'Comment l''histoire se termine ? Ton personnage a réussi ?',
  'Le dénouement. Comment ça se conclut ?',
  'C''est une fin heureuse, triste, ou ouverte ?'),

(3, 3, 2, 0, 'trajectoire', 'La transformation',
  'Ton personnage a changé. En quoi ?',
  'Qu''est-ce qui est différent chez ton personnage entre le début et la fin ?',
  'Quel changement ton personnage a-t-il traversé ?',
  'Les autres le voient différemment maintenant ?'),

(3, 3, 3, 0, 'intention', 'Le message',
  'Ton film parle de quoi en vrai ?',
  'C''est quoi le vrai sujet de ton film, derrière l''histoire ?',
  'Au-delà de l''intrigue, qu''est-ce que cette histoire explore ?',
  'C''est pas ce qui se passe — c''est de quoi ça parle vraiment.'),

(3, 3, 4, 0, 'renforcement', 'La scène clé',
  'C''est quoi la scène la plus importante de ton film ?',
  'Quelle est LA scène que tout le monde va retenir ?',
  'La scène qui résume tout le film. Décris-la.',
  'Qu''est-ce qu''on voit ? Qu''est-ce qu''on entend ?'),

(3, 3, 5, 0, 'renforcement', 'Le titre',
  'Ton film s''appelle comment ?',
  'Quel titre tu donnes à ton film ?',
  'Le titre de ton film. C''est quoi ?',
  'Pourquoi ce titre ?');

-- ══════════════════════════════════════════════
-- VARIANT 1 — 21 situations alternatives
-- Même règle : zéro scénario, question pure.
-- Juste un angle d'approche différent.
-- ══════════════════════════════════════════════

-- ── Séance 1 variant 1 ───

INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES

(3, 1, 1, 1, 'personnage', 'Le héros',
  'Si tu croisais ton personnage, il serait comment ?',
  'À quoi ressemble le personnage principal de ton film ?',
  'Premier plan, regard caméra. On voit qui ?',
  'Ajoute un détail qu''on ne peut pas inventer pour quelqu''un d''autre.'),

(3, 1, 2, 1, 'personnage', 'Son désir',
  'À quoi ton personnage rêve le plus ?',
  'Qu''est-ce qui obsède ton personnage ?',
  'Quelle envie le consume ?',
  'Ça change quoi s''il l''obtient ?'),

(3, 1, 3, 1, 'personnage', 'Sa faille',
  'Qu''est-ce qui met ton personnage en difficulté ?',
  'C''est quoi son plus gros défaut ?',
  'Sous pression, qu''est-ce qui le trahit ?',
  'Comment les autres le voient dans ces moments ?'),

(3, 1, 4, 1, 'personnage', 'Son secret',
  'Qu''est-ce que personne ne sait sur ton personnage ?',
  'Quel mensonge ton personnage entretient ?',
  'Qu''est-ce qu''il n''a jamais avoué ?',
  'Pourquoi il le garde pour lui ?'),

(3, 1, 5, 1, 'liens', 'Le meilleur allié',
  'Qui est toujours là pour ton personnage ?',
  'À qui ton personnage fait confiance les yeux fermés ?',
  'Quel lien est le plus solide dans sa vie ?',
  'Qu''est-ce qui les unit ?'),

(3, 1, 6, 1, 'liens', 'Le rival',
  'Qui pose problème à ton personnage ?',
  'Avec qui la tension est permanente ?',
  'D''où vient le conflit entre eux ?',
  'C''est personnel ou c''est plus grand que ça ?'),

(3, 1, 7, 1, 'environnement', 'Le lieu',
  'À quoi ressemble l''endroit où se passe le film ?',
  'Décris le décor. Qu''est-ce qu''on voit, qu''on entend ?',
  'Si le lieu était un personnage, il raconterait quoi ?',
  'Qu''est-ce qui le rend unique ?'),

(3, 1, 8, 1, 'environnement', 'L''ambiance',
  'Ton film fait ressentir quoi ?',
  'Quelle émotion on sent dès les premières secondes ?',
  'Quelle est la tonalité dominante ?',
  'Et la musique, ce serait quoi ?');

-- ── Séance 2 variant 1 ───

INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES

(3, 2, 1, 1, 'conflit', 'Le déclencheur',
  'Qu''est-ce qui fait que la vie de ton personnage bascule ?',
  'Quel événement change tout ?',
  'Qu''est-ce qui brise l''équilibre ?',
  'C''était prévisible ou ça tombe du ciel ?'),

(3, 2, 2, 1, 'conflit', 'L''obstacle',
  'Qu''est-ce qui bloque ton personnage ?',
  'Pourquoi c''est si compliqué de s''en sortir ?',
  'Quelle est la nature de l''obstacle ?',
  'On peut le détruire ou faut le contourner ?'),

(3, 2, 3, 1, 'conflit', 'L''adversaire',
  'Qui empêche ton personnage de réussir ?',
  'Quelqu''un lui met des bâtons dans les roues. Qui ? Pourquoi ?',
  'L''adversaire a ses propres raisons. C''est quoi ?',
  'De son côté, il pense avoir raison ?'),

(3, 2, 4, 1, 'trajectoire', 'Le premier essai',
  'Ton personnage tente quelque chose. Quoi ? Et ça marche ?',
  'Première action. Raconte ce qui se passe.',
  'La première tentative. Stratégie ou improvisation ?',
  'Qu''est-ce qui se passe exactement ?'),

(3, 2, 5, 1, 'trajectoire', 'Le dilemme',
  'Ton personnage ne peut pas tout garder. Qu''est-ce qu''il doit choisir ?',
  'Deux choses comptent mais il faut en lâcher une. Lesquelles ?',
  'Quel sacrifice est exigé ?',
  'Qu''est-ce qu''il perd dans chaque cas ?'),

(3, 2, 6, 1, 'conflit', 'Le point bas',
  'C''est quand le moment le plus dur ? Que se passe-t-il ?',
  'Le pire instant. Plus rien ne va. Décris.',
  'Tout s''écroule. Que reste-t-il ?',
  'S''il pouvait dire une seule phrase, ce serait quoi ?'),

(3, 2, 7, 1, 'trajectoire', 'Le sursaut',
  'Qu''est-ce qui fait que ton personnage se relève ?',
  'Quelque chose change la donne. Quoi ?',
  'D''où vient le retournement ?',
  'C''est extérieur ou intérieur ?'),

(3, 2, 8, 1, 'conflit', 'La confrontation',
  'Ton personnage affronte le problème. Comment ça se passe ?',
  'Plus moyen d''éviter. Comment il fait face ?',
  'La confrontation. Raconte-la.',
  'Qui gagne ? Ou personne ?');

-- ── Séance 3 variant 1 ───

INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES

(3, 3, 1, 1, 'trajectoire', 'La résolution',
  'C''est fini. Ça se termine comment ?',
  'Dernière scène. C''est quoi la situation ?',
  'Le dernier plan. Qu''est-ce qu''on voit ?',
  'Victoire, défaite, ou entre les deux ?'),

(3, 3, 2, 1, 'trajectoire', 'La transformation',
  'Ton personnage est différent maintenant. En quoi ?',
  'Qu''est-ce qui a changé chez lui entre le début et la fin ?',
  'En quoi est-il fondamentalement différent ?',
  'Il le vit bien ou c''est douloureux ?'),

(3, 3, 3, 1, 'intention', 'Le message',
  'Si on te demande "c''est quoi ton film en vrai ?", tu dis quoi ?',
  'Derrière l''histoire, c''est quoi le vrai sujet ?',
  'Si ce film changeait une seule chose dans la tête du spectateur, ce serait quoi ?',
  'Espoir, colère, lucidité ?'),

(3, 3, 4, 1, 'renforcement', 'La scène clé',
  'Quelle image de ton film on retient en premier ?',
  'UNE scène pour la bande-annonce. Laquelle ?',
  'L''image qui résume tout. Décris-la.',
  'Musique, silence, ou dialogue à ce moment ?'),

(3, 3, 5, 1, 'renforcement', 'Le titre',
  'Il s''appelle comment ton film ?',
  'Le titre. C''est quoi ?',
  'Le titre apparaît à l''écran. Qu''est-ce qu''on lit ?',
  'Il intrigue ? Il résume ? Il surprend ?');
