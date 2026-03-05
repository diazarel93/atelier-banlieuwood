-- ============================================================
-- ADRIAN SPEC ALIGNMENT — Modules 1→8 adjustments
-- ============================================================

-- ── Tâche 3: Quick questions M3 (M10 S1 positions 3-6) ──────
-- Insert 4 new QCM situations for module 10, séance 1
-- Position 2 (ton) already exists. Add: personnage (3), déclencheur (4), durée (5), fin (6)
-- Idea-bank moves from position 3 → 7

-- Update existing idea-bank position from 3 to 7
UPDATE situations SET position = 7
WHERE module = 10 AND seance = 1 AND position = 3
  AND category = 'imagination';

-- Insert quick questions (QCM standard)
INSERT INTO situations (module, seance, position, category, restitution_label, question_type,
  prompt_6_9, prompt_10_13, prompt_14_18, options)
VALUES
  (10, 1, 3, 'imagination', 'Personnage principal', 'qcm',
   'Qui est le personnage principal de ton histoire ?',
   'Qui est le personnage principal de ton histoire ?',
   'Quel type de personnage principal vois-tu dans cette histoire ?',
   '[{"key":"ado","label":"Un ado"},{"key":"adulte","label":"Un adulte"},{"key":"enfant","label":"Un enfant"},{"key":"groupe","label":"Un groupe"}]'::jsonb),

  (10, 1, 4, 'imagination', 'Déclencheur', 'qcm',
   'Qu''est-ce qui déclenche l''histoire ?',
   'Qu''est-ce qui déclenche l''histoire ?',
   'Quel est l''élément déclencheur de ton récit ?',
   '[{"key":"secret","label":"Un secret"},{"key":"rencontre","label":"Une rencontre"},{"key":"accident","label":"Un accident"},{"key":"decouverte","label":"Une découverte"}]'::jsonb),

  (10, 1, 5, 'imagination', 'Durée', 'qcm',
   'Combien de temps dure ton histoire ?',
   'Combien de temps dure ton histoire ?',
   'Sur quelle durée se déroule ton récit ?',
   '[{"key":"1jour","label":"1 jour"},{"key":"1semaine","label":"1 semaine"},{"key":"1mois","label":"1 mois"},{"key":"1an","label":"1 an"}]'::jsonb),

  (10, 1, 6, 'imagination', 'Fin', 'qcm',
   'Comment se termine ton histoire ?',
   'Comment se termine ton histoire ?',
   'Quel type de dénouement imagines-tu ?',
   '[{"key":"heureuse","label":"Heureuse"},{"key":"triste","label":"Triste"},{"key":"ouverte","label":"Ouverte"},{"key":"twist","label":"Twist"}]'::jsonb)
ON CONFLICT DO NOTHING;


-- ── Tâche 5: Force + Faiblesse on module10_personnages ───────
ALTER TABLE module10_personnages ADD COLUMN IF NOT EXISTS force TEXT;
ALTER TABLE module10_personnages ADD COLUMN IF NOT EXISTS faiblesse TEXT;


-- ── Tâche 9: M12 reduce to 6 manches ────────────────────────
-- Remove manche 7 and 8 data (pools, votes, winners)
DELETE FROM module12_pools WHERE manche > 6;
DELETE FROM module12_votes WHERE manche > 6;
DELETE FROM module12_winners WHERE manche > 6;

-- Update check constraints to allow 1-6 instead of 1-8
ALTER TABLE module12_pools DROP CONSTRAINT IF EXISTS module12_pools_manche_check;
ALTER TABLE module12_pools ADD CONSTRAINT module12_pools_manche_check CHECK (manche BETWEEN 1 AND 6);

ALTER TABLE module12_votes DROP CONSTRAINT IF EXISTS module12_votes_manche_check;
ALTER TABLE module12_votes ADD CONSTRAINT module12_votes_manche_check CHECK (manche BETWEEN 1 AND 6);

ALTER TABLE module12_winners DROP CONSTRAINT IF EXISTS module12_winners_manche_check;
ALTER TABLE module12_winners ADD CONSTRAINT module12_winners_manche_check CHECK (manche BETWEEN 1 AND 6);

-- Remove situations for manches 7-8 if they exist
DELETE FROM situations WHERE module = 12 AND position > 6;
