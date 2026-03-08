-- ============================================================
-- Restore manches 7 (La Relation) and 8 (Le Moment Fort)
-- Adrian's spec defines 8 manches, migration 041 reduced to 6
-- ============================================================

-- Restore CHECK constraints to 1-8
ALTER TABLE module12_pools DROP CONSTRAINT IF EXISTS module12_pools_manche_check;
ALTER TABLE module12_pools ADD CONSTRAINT module12_pools_manche_check CHECK (manche BETWEEN 1 AND 8);

ALTER TABLE module12_votes DROP CONSTRAINT IF EXISTS module12_votes_manche_check;
ALTER TABLE module12_votes ADD CONSTRAINT module12_votes_manche_check CHECK (manche BETWEEN 1 AND 8);

ALTER TABLE module12_winners DROP CONSTRAINT IF EXISTS module12_winners_manche_check;
ALTER TABLE module12_winners ADD CONSTRAINT module12_winners_manche_check CHECK (manche BETWEEN 1 AND 8);

-- Restore situation seeds for positions 7-8
INSERT INTO situations (module, seance, position, category, restitution_label,
  prompt_6_9, prompt_10_13, prompt_14_18)
VALUES
(12, 1, 7, 'collectif', 'La Relation',
  'Vote pour la relation clé !',
  'Quelle relation est au cœur de l''histoire ?',
  'Quel lien entre personnages constituera le moteur émotionnel du récit ?'),
(12, 1, 8, 'collectif', 'Le Moment Fort',
  'Vote pour le moment fort !',
  'Quel sera le moment le plus intense du film ?',
  'Quel climax ou retournement marquera le point culminant de la narration ?')
ON CONFLICT DO NOTHING;
