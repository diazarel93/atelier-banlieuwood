-- ============================================
-- 011: Fix rival vs adversaire + swap scène clé / message order
-- ============================================

-- ── 1. S1-Q6 : "Le rival" → "La relation compliquée" ──
-- Différencie du "L'adversaire" (S2-Q3) qui est la force antagoniste du récit.
-- Ici on parle d'une relation ambivalente, proche mais tendue.

-- Variant 0
UPDATE situations SET
  restitution_label = 'La relation compliquée',
  prompt_6_9 = 'Il y a quelqu''un que ton personnage aime bien mais avec qui c''est compliqué. C''est qui ?',
  prompt_10_13 = 'Ton personnage a une relation compliquée avec quelqu''un. Qui ? Pourquoi c''est pas simple ?',
  prompt_14_18 = 'Quelle relation ambivalente ton personnage entretient-il ? Qu''est-ce qui rend ce lien complexe ?',
  nudge_text = 'Ils s''aiment bien quand même, ou pas du tout ?'
WHERE module = 3 AND seance = 1 AND position = 6 AND variant = 0;

-- Variant 1
UPDATE situations SET
  restitution_label = 'La relation compliquée',
  prompt_6_9 = 'Avec qui ton personnage s''entend… mais pas toujours ?',
  prompt_10_13 = 'Qui est proche de ton personnage mais lui crée des problèmes ?',
  prompt_14_18 = 'Quel lien est à la fois précieux et toxique pour ton personnage ?',
  nudge_text = 'C''est de l''amour, de la rivalité, ou les deux ?'
WHERE module = 3 AND seance = 1 AND position = 6 AND variant = 1;

-- ── 2. S3 : swap positions "Le message" (3) ↔ "La scène clé" (4) ──
-- On visualise d'abord la scène clé, puis on en tire le sens profond.
-- Utilise une position temporaire (99) pour éviter les conflits d'unicité.

UPDATE situations SET position = 99
WHERE module = 3 AND seance = 3 AND position = 3;

UPDATE situations SET position = 3
WHERE module = 3 AND seance = 3 AND position = 4;

UPDATE situations SET position = 4
WHERE module = 3 AND seance = 3 AND position = 99;
