-- ============================================
-- Ancrer les histoires dans le réel
-- Nudges mis à jour pour éviter les super-héros
-- et pousser vers des personnages filmables
-- ============================================

-- Module 4 (Vis ma vie) — Q1 : Le personnage
UPDATE situations SET nudge_text = 'C''est quelqu''un de VRAI, qu''on pourrait croiser dans la rue. Pas de super-héros !'
WHERE module = 4 AND seance = 1 AND position = 1;

-- Module 3, Séance 1 — Q1 : Le héros
UPDATE situations SET nudge_text = 'Pense à quelqu''un de VRAI, qu''on pourrait croiser dans le quartier. Un vrai acteur va le jouer !'
WHERE module = 3 AND seance = 1 AND position = 1;

-- Module 3, Séance 1 — Q7 : Le lieu
UPDATE situations SET nudge_text = 'Un lieu où on pourrait VRAIMENT aller filmer. Pas un autre monde, un vrai endroit.'
WHERE module = 3 AND seance = 1 AND position = 7;
