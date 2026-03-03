-- ================================================================
-- SEED: Scores for the 180 missing responses (migration 100)
-- teacher_score + ai_score + ai_feedback for S2 Q2-Q8 and S3 Q1-Q5
-- ================================================================

DO $$
DECLARE
  v_session UUID;
  s_yasmine UUID; s_karim UUID; s_lea UUID; s_enzo UUID; s_fatou UUID;
  s_nathan UUID; s_ines UUID; s_rayan UUID; s_chloe UUID; s_mamadou UUID;
  s_sarah UUID; s_lucas UUID; s_amina UUID; s_theo UUID; s_jade UUID;
  sit_3_2_2 UUID; sit_3_2_3 UUID; sit_3_2_4 UUID; sit_3_2_5 UUID;
  sit_3_2_6 UUID; sit_3_2_7 UUID; sit_3_2_8 UUID;
  sit_3_3_1 UUID; sit_3_3_2 UUID; sit_3_3_3 UUID; sit_3_3_4 UUID; sit_3_3_5 UUID;
BEGIN

SELECT id INTO v_session FROM sessions WHERE join_code = 'DEMO42';
IF v_session IS NULL THEN RAISE EXCEPTION 'Session DEMO42 not found'; END IF;

SELECT id INTO s_yasmine FROM students WHERE session_id = v_session AND display_name = 'Yasmine';
SELECT id INTO s_karim FROM students WHERE session_id = v_session AND display_name = 'Karim';
SELECT id INTO s_lea FROM students WHERE session_id = v_session AND display_name = 'Léa';
SELECT id INTO s_enzo FROM students WHERE session_id = v_session AND display_name = 'Enzo';
SELECT id INTO s_fatou FROM students WHERE session_id = v_session AND display_name = 'Fatou';
SELECT id INTO s_nathan FROM students WHERE session_id = v_session AND display_name = 'Nathan';
SELECT id INTO s_ines FROM students WHERE session_id = v_session AND display_name = 'Inès';
SELECT id INTO s_rayan FROM students WHERE session_id = v_session AND display_name = 'Rayan';
SELECT id INTO s_chloe FROM students WHERE session_id = v_session AND display_name = 'Chloé';
SELECT id INTO s_mamadou FROM students WHERE session_id = v_session AND display_name = 'Mamadou';
SELECT id INTO s_sarah FROM students WHERE session_id = v_session AND display_name = 'Sarah';
SELECT id INTO s_lucas FROM students WHERE session_id = v_session AND display_name = 'Lucas';
SELECT id INTO s_amina FROM students WHERE session_id = v_session AND display_name = 'Amina';
SELECT id INTO s_theo FROM students WHERE session_id = v_session AND display_name = 'Théo';
SELECT id INTO s_jade FROM students WHERE session_id = v_session AND display_name = 'Jade';

SELECT id INTO sit_3_2_2 FROM situations WHERE module=3 AND seance=2 AND position=2 AND variant=0;
SELECT id INTO sit_3_2_3 FROM situations WHERE module=3 AND seance=2 AND position=3 AND variant=0;
SELECT id INTO sit_3_2_4 FROM situations WHERE module=3 AND seance=2 AND position=4 AND variant=0;
SELECT id INTO sit_3_2_5 FROM situations WHERE module=3 AND seance=2 AND position=5 AND variant=0;
SELECT id INTO sit_3_2_6 FROM situations WHERE module=3 AND seance=2 AND position=6 AND variant=0;
SELECT id INTO sit_3_2_7 FROM situations WHERE module=3 AND seance=2 AND position=7 AND variant=0;
SELECT id INTO sit_3_2_8 FROM situations WHERE module=3 AND seance=2 AND position=8 AND variant=0;
SELECT id INTO sit_3_3_1 FROM situations WHERE module=3 AND seance=3 AND position=1 AND variant=0;
SELECT id INTO sit_3_3_2 FROM situations WHERE module=3 AND seance=3 AND position=2 AND variant=0;
SELECT id INTO sit_3_3_3 FROM situations WHERE module=3 AND seance=3 AND position=3 AND variant=0;
SELECT id INTO sit_3_3_4 FROM situations WHERE module=3 AND seance=3 AND position=4 AND variant=0;
SELECT id INTO sit_3_3_5 FROM situations WHERE module=3 AND seance=3 AND position=5 AND variant=0;

-- ═══════════════════════════════════════════
-- S2 Q2: L'obstacle
-- ═══════════════════════════════════════════
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Cohérent, quête qui se complique' WHERE session_id=v_session AND student_id=s_yasmine AND situation_id=sit_3_2_2;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Tension bien amenée, menace crédible' WHERE session_id=v_session AND student_id=s_karim AND situation_id=sit_3_2_2;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Simple mais efficace' WHERE session_id=v_session AND student_id=s_lea AND situation_id=sit_3_2_2;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Réaliste et brut' WHERE session_id=v_session AND student_id=s_enzo AND situation_id=sit_3_2_2;
UPDATE responses SET teacher_score=5, ai_score=5, ai_feedback='Obstacle crédible et bien articulé' WHERE session_id=v_session AND student_id=s_fatou AND situation_id=sit_3_2_2;
UPDATE responses SET teacher_score=3, ai_score=2, ai_feedback='Trop gaming, peu réaliste' WHERE session_id=v_session AND student_id=s_nathan AND situation_id=sit_3_2_2;
UPDATE responses SET teacher_score=4, ai_score=3, ai_feedback='Émotion juste, anxiété bien rendue' WHERE session_id=v_session AND student_id=s_ines AND situation_id=sit_3_2_2;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Dilemme intéressant' WHERE session_id=v_session AND student_id=s_rayan AND situation_id=sit_3_2_2;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Cinématographique et tendu' WHERE session_id=v_session AND student_id=s_chloe AND situation_id=sit_3_2_2;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Émouvant et économe en mots' WHERE session_id=v_session AND student_id=s_mamadou AND situation_id=sit_3_2_2;
UPDATE responses SET teacher_score=4, ai_score=3, ai_feedback='Bon conflit interne' WHERE session_id=v_session AND student_id=s_sarah AND situation_id=sit_3_2_2;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Dilemme classique mais efficace' WHERE session_id=v_session AND student_id=s_lucas AND situation_id=sit_3_2_2;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Conflit familial bien rendu' WHERE session_id=v_session AND student_id=s_amina AND situation_id=sit_3_2_2;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Logique narrative solide' WHERE session_id=v_session AND student_id=s_theo AND situation_id=sit_3_2_2;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Enjeu émotionnel correct' WHERE session_id=v_session AND student_id=s_jade AND situation_id=sit_3_2_2;

-- ═══════════════════════════════════════════
-- S2 Q3: La trahison
-- ═══════════════════════════════════════════
UPDATE responses SET teacher_score=5, ai_score=5, ai_feedback='Retournement déchirant et cohérent' WHERE session_id=v_session AND student_id=s_yasmine AND situation_id=sit_3_2_3;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Trahison crédible du petit frère' WHERE session_id=v_session AND student_id=s_karim AND situation_id=sit_3_2_3;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Abandon plus que trahison, touchant' WHERE session_id=v_session AND student_id=s_lea AND situation_id=sit_3_2_3;
UPDATE responses SET teacher_score=4, ai_score=3, ai_feedback='Trahison réaliste et brutale' WHERE session_id=v_session AND student_id=s_enzo AND situation_id=sit_3_2_3;
UPDATE responses SET teacher_score=5, ai_score=5, ai_feedback='Complexité morale excellente' WHERE session_id=v_session AND student_id=s_fatou AND situation_id=sit_3_2_3;
UPDATE responses SET teacher_score=3, ai_score=2, ai_feedback='Prévisible mais correct' WHERE session_id=v_session AND student_id=s_nathan AND situation_id=sit_3_2_3;
UPDATE responses SET teacher_score=5, ai_score=4, ai_feedback='Coup dur émotionnel très bien écrit' WHERE session_id=v_session AND student_id=s_ines AND situation_id=sit_3_2_3;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Sacrifice ambigu, riche en sens' WHERE session_id=v_session AND student_id=s_rayan AND situation_id=sit_3_2_3;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Manipulation nuancée' WHERE session_id=v_session AND student_id=s_chloe AND situation_id=sit_3_2_3;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Trahison discrète mais percutante' WHERE session_id=v_session AND student_id=s_mamadou AND situation_id=sit_3_2_3;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Classique mais efficace' WHERE session_id=v_session AND student_id=s_sarah AND situation_id=sit_3_2_3;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Abandon mentor, thème fort' WHERE session_id=v_session AND student_id=s_lucas AND situation_id=sit_3_2_3;
UPDATE responses SET teacher_score=5, ai_score=4, ai_feedback='Destruction innocente, très touchant' WHERE session_id=v_session AND student_id=s_amina AND situation_id=sit_3_2_3;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Trahison de confiance bien construite' WHERE session_id=v_session AND student_id=s_theo AND situation_id=sit_3_2_3;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Manipulation parentale bien vue' WHERE session_id=v_session AND student_id=s_jade AND situation_id=sit_3_2_3;

-- ═══════════════════════════════════════════
-- S2 Q4: Le choix
-- ═══════════════════════════════════════════
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Dilemme bien posé' WHERE session_id=v_session AND student_id=s_yasmine AND situation_id=sit_3_2_4;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Choix clair et direct' WHERE session_id=v_session AND student_id=s_karim AND situation_id=sit_3_2_4;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Binaire mais pertinent' WHERE session_id=v_session AND student_id=s_lea AND situation_id=sit_3_2_4;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Choix courageux, bien formulé' WHERE session_id=v_session AND student_id=s_enzo AND situation_id=sit_3_2_4;
UPDATE responses SET teacher_score=5, ai_score=5, ai_feedback='Impossible choice, parfaitement articulé' WHERE session_id=v_session AND student_id=s_fatou AND situation_id=sit_3_2_4;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Choix concret et crédible' WHERE session_id=v_session AND student_id=s_nathan AND situation_id=sit_3_2_4;
UPDATE responses SET teacher_score=4, ai_score=3, ai_feedback='Émotion forte, choix difficile' WHERE session_id=v_session AND student_id=s_ines AND situation_id=sit_3_2_4;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Le sacrifice secret, riche' WHERE session_id=v_session AND student_id=s_rayan AND situation_id=sit_3_2_4;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Choix éthique bien posé' WHERE session_id=v_session AND student_id=s_chloe AND situation_id=sit_3_2_4;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Dilemme existentiel profond' WHERE session_id=v_session AND student_id=s_mamadou AND situation_id=sit_3_2_4;
UPDATE responses SET teacher_score=4, ai_score=3, ai_feedback='Bon choix thématique' WHERE session_id=v_session AND student_id=s_sarah AND situation_id=sit_3_2_4;
UPDATE responses SET teacher_score=3, ai_score=2, ai_feedback='Direct mais manque de nuance' WHERE session_id=v_session AND student_id=s_lucas AND situation_id=sit_3_2_4;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Rêve vs famille, universel' WHERE session_id=v_session AND student_id=s_amina AND situation_id=sit_3_2_4;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Question philosophique pertinente' WHERE session_id=v_session AND student_id=s_theo AND situation_id=sit_3_2_4;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Choix classique mais sincère' WHERE session_id=v_session AND student_id=s_jade AND situation_id=sit_3_2_4;

-- ═══════════════════════════════════════════
-- S2 Q5: La montée
-- ═══════════════════════════════════════════
UPDATE responses SET teacher_score=5, ai_score=5, ai_feedback='Image forte, tension narrative' WHERE session_id=v_session AND student_id=s_yasmine AND situation_id=sit_3_2_5;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Stratégique et court' WHERE session_id=v_session AND student_id=s_karim AND situation_id=sit_3_2_5;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Scène puissante et inattendue' WHERE session_id=v_session AND student_id=s_lea AND situation_id=sit_3_2_5;
UPDATE responses SET teacher_score=5, ai_score=4, ai_feedback='Moment iconique, très cinéma' WHERE session_id=v_session AND student_id=s_enzo AND situation_id=sit_3_2_5;
UPDATE responses SET teacher_score=5, ai_score=5, ai_feedback='Escalade parfaitement construite' WHERE session_id=v_session AND student_id=s_fatou AND situation_id=sit_3_2_5;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Plus original que d''habitude' WHERE session_id=v_session AND student_id=s_nathan AND situation_id=sit_3_2_5;
UPDATE responses SET teacher_score=4, ai_score=3, ai_feedback='Geste touchant et courageux' WHERE session_id=v_session AND student_id=s_ines AND situation_id=sit_3_2_5;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Confrontation fraternelle intense' WHERE session_id=v_session AND student_id=s_rayan AND situation_id=sit_3_2_5;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Intrigue bien menée' WHERE session_id=v_session AND student_id=s_chloe AND situation_id=sit_3_2_5;
UPDATE responses SET teacher_score=5, ai_score=5, ai_feedback='Révélation brillante du personnage' WHERE session_id=v_session AND student_id=s_mamadou AND situation_id=sit_3_2_5;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Action concrète et visuelle' WHERE session_id=v_session AND student_id=s_sarah AND situation_id=sit_3_2_5;
UPDATE responses SET teacher_score=2, ai_score=2, ai_feedback='Prévisible, effort minimal' WHERE session_id=v_session AND student_id=s_lucas AND situation_id=sit_3_2_5;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Résilience touchante' WHERE session_id=v_session AND student_id=s_amina AND situation_id=sit_3_2_5;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Action décisive, bien construit' WHERE session_id=v_session AND student_id=s_theo AND situation_id=sit_3_2_5;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Courageuse mais naïf' WHERE session_id=v_session AND student_id=s_jade AND situation_id=sit_3_2_5;

-- ═══════════════════════════════════════════
-- S2 Q6: Le point bas
-- ═══════════════════════════════════════════
UPDATE responses SET teacher_score=5, ai_score=5, ai_feedback='Image dévastatrice, symbolisme fort' WHERE session_id=v_session AND student_id=s_yasmine AND situation_id=sit_3_2_6;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Échec net et clair' WHERE session_id=v_session AND student_id=s_karim AND situation_id=sit_3_2_6;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Paradoxe douloureux, très juste' WHERE session_id=v_session AND student_id=s_lea AND situation_id=sit_3_2_6;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Conséquences réalistes' WHERE session_id=v_session AND student_id=s_enzo AND situation_id=sit_3_2_6;
UPDATE responses SET teacher_score=5, ai_score=5, ai_feedback='Solitude totale, accablant' WHERE session_id=v_session AND student_id=s_fatou AND situation_id=sit_3_2_6;
UPDATE responses SET teacher_score=3, ai_score=2, ai_feedback='Retournement convenu' WHERE session_id=v_session AND student_id=s_nathan AND situation_id=sit_3_2_6;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Malentendu parental poignant' WHERE session_id=v_session AND student_id=s_ines AND situation_id=sit_3_2_6;
UPDATE responses SET teacher_score=5, ai_score=4, ai_feedback='Silence fraternel déchirant' WHERE session_id=v_session AND student_id=s_rayan AND situation_id=sit_3_2_6;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Perte symbolique du regard' WHERE session_id=v_session AND student_id=s_chloe AND situation_id=sit_3_2_6;
UPDATE responses SET teacher_score=5, ai_score=5, ai_feedback='Circularité tragique, retour case départ' WHERE session_id=v_session AND student_id=s_mamadou AND situation_id=sit_3_2_6;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Violent mais efficace' WHERE session_id=v_session AND student_id=s_sarah AND situation_id=sit_3_2_6;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Douleur physique = point bas crédible' WHERE session_id=v_session AND student_id=s_lucas AND situation_id=sit_3_2_6;
UPDATE responses SET teacher_score=4, ai_score=3, ai_feedback='Perte répétée, pattern touchant' WHERE session_id=v_session AND student_id=s_amina AND situation_id=sit_3_2_6;
UPDATE responses SET teacher_score=5, ai_score=5, ai_feedback='Rejet paternel glaçant' WHERE session_id=v_session AND student_id=s_theo AND situation_id=sit_3_2_6;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Scène de chaos familial' WHERE session_id=v_session AND student_id=s_jade AND situation_id=sit_3_2_6;

-- ═══════════════════════════════════════════
-- S2 Q7: Le sursaut
-- ═══════════════════════════════════════════
UPDATE responses SET teacher_score=5, ai_score=5, ai_feedback='Mystère relancé magnifiquement' WHERE session_id=v_session AND student_id=s_yasmine AND situation_id=sit_3_2_7;
UPDATE responses SET teacher_score=4, ai_score=3, ai_feedback='Réconciliation simple et juste' WHERE session_id=v_session AND student_id=s_karim AND situation_id=sit_3_2_7;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Geste discret mais beau' WHERE session_id=v_session AND student_id=s_lea AND situation_id=sit_3_2_7;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Adulte allié, sursaut crédible' WHERE session_id=v_session AND student_id=s_enzo AND situation_id=sit_3_2_7;
UPDATE responses SET teacher_score=5, ai_score=5, ai_feedback='Dessin de la sœur = moment de grâce' WHERE session_id=v_session AND student_id=s_fatou AND situation_id=sit_3_2_7;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Solidarité en ligne, moderne' WHERE session_id=v_session AND student_id=s_nathan AND situation_id=sit_3_2_7;
UPDATE responses SET teacher_score=5, ai_score=4, ai_feedback='Phrase libératrice, très bien écrit' WHERE session_id=v_session AND student_id=s_ines AND situation_id=sit_3_2_7;
UPDATE responses SET teacher_score=5, ai_score=5, ai_feedback='Lettres du grand-père, héritage' WHERE session_id=v_session AND student_id=s_rayan AND situation_id=sit_3_2_7;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Transmission générationnelle, beau' WHERE session_id=v_session AND student_id=s_chloe AND situation_id=sit_3_2_7;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Espoir par le hasard, crédible' WHERE session_id=v_session AND student_id=s_mamadou AND situation_id=sit_3_2_7;
UPDATE responses SET teacher_score=5, ai_score=4, ai_feedback='Le SDF qui revient, bouleversant' WHERE session_id=v_session AND student_id=s_sarah AND situation_id=sit_3_2_7;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Alliance des rivaux, classique' WHERE session_id=v_session AND student_id=s_lucas AND situation_id=sit_3_2_7;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Musique transmise par la sœur' WHERE session_id=v_session AND student_id=s_amina AND situation_id=sit_3_2_7;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Ouverture au dialogue' WHERE session_id=v_session AND student_id=s_theo AND situation_id=sit_3_2_7;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Regard d''enfant = vérité' WHERE session_id=v_session AND student_id=s_jade AND situation_id=sit_3_2_7;

-- ═══════════════════════════════════════════
-- S2 Q8: La confrontation
-- ═══════════════════════════════════════════
UPDATE responses SET teacher_score=5, ai_score=5, ai_feedback='Révélation par la tante, cohérent' WHERE session_id=v_session AND student_id=s_yasmine AND situation_id=sit_3_2_8;
UPDATE responses SET teacher_score=5, ai_score=4, ai_feedback='Rap comme arme, puissant' WHERE session_id=v_session AND student_id=s_karim AND situation_id=sit_3_2_8;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Déclaration publique courageuse' WHERE session_id=v_session AND student_id=s_lea AND situation_id=sit_3_2_8;
UPDATE responses SET teacher_score=5, ai_score=4, ai_feedback='Trois mots dévastateurs, bravo Enzo' WHERE session_id=v_session AND student_id=s_enzo AND situation_id=sit_3_2_8;
UPDATE responses SET teacher_score=5, ai_score=5, ai_feedback='Confrontation totale, magistral' WHERE session_id=v_session AND student_id=s_fatou AND situation_id=sit_3_2_8;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Pardon inattendu, maturité' WHERE session_id=v_session AND student_id=s_nathan AND situation_id=sit_3_2_8;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Affirmation de soi, juste' WHERE session_id=v_session AND student_id=s_ines AND situation_id=sit_3_2_8;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Ultimatum fraternel, puissant' WHERE session_id=v_session AND student_id=s_rayan AND situation_id=sit_3_2_8;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Film projeté = résolution ciné' WHERE session_id=v_session AND student_id=s_chloe AND situation_id=sit_3_2_8;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Justice obtenue par les mots' WHERE session_id=v_session AND student_id=s_mamadou AND situation_id=sit_3_2_8;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Viralité comme revanche, moderne' WHERE session_id=v_session AND student_id=s_sarah AND situation_id=sit_3_2_8;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Défaite honorable, beau message' WHERE session_id=v_session AND student_id=s_lucas AND situation_id=sit_3_2_8;
UPDATE responses SET teacher_score=5, ai_score=5, ai_feedback='Scène chorale magnifique' WHERE session_id=v_session AND student_id=s_amina AND situation_id=sit_3_2_8;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Réconciliation par la vérité' WHERE session_id=v_session AND student_id=s_theo AND situation_id=sit_3_2_8;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Affirmation d''identité, simple' WHERE session_id=v_session AND student_id=s_jade AND situation_id=sit_3_2_8;

-- ═══════════════════════════════════════════
-- S3 Q1: La résolution
-- ═══════════════════════════════════════════
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Vérité libératrice, cycle fermé' WHERE session_id=v_session AND student_id=s_yasmine AND situation_id=sit_3_3_1;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Résolution nette et satisfaisante' WHERE session_id=v_session AND student_id=s_karim AND situation_id=sit_3_3_1;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Court mais touchant' WHERE session_id=v_session AND student_id=s_lea AND situation_id=sit_3_3_1;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Résolution réaliste, pas idéalisée' WHERE session_id=v_session AND student_id=s_enzo AND situation_id=sit_3_3_1;
UPDATE responses SET teacher_score=5, ai_score=5, ai_feedback='Compromis crédible, meilleure fin' WHERE session_id=v_session AND student_id=s_fatou AND situation_id=sit_3_3_1;
UPDATE responses SET teacher_score=3, ai_score=2, ai_feedback='Résolution trop facile' WHERE session_id=v_session AND student_id=s_nathan AND situation_id=sit_3_3_1;
UPDATE responses SET teacher_score=4, ai_score=3, ai_feedback='Guérison progressive, juste' WHERE session_id=v_session AND student_id=s_ines AND situation_id=sit_3_3_1;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Solution pratique, pas magique' WHERE session_id=v_session AND student_id=s_rayan AND situation_id=sit_3_3_1;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Stage = récompense méritée' WHERE session_id=v_session AND student_id=s_chloe AND situation_id=sit_3_3_1;
UPDATE responses SET teacher_score=5, ai_score=4, ai_feedback='Dignité retrouvée, émouvant' WHERE session_id=v_session AND student_id=s_mamadou AND situation_id=sit_3_3_1;
UPDATE responses SET teacher_score=4, ai_score=3, ai_feedback='Confrontation saine, pas vengeance' WHERE session_id=v_session AND student_id=s_sarah AND situation_id=sit_3_3_1;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Message sur le courage, simple' WHERE session_id=v_session AND student_id=s_lucas AND situation_id=sit_3_3_1;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Le père cède, scène touchante' WHERE session_id=v_session AND student_id=s_amina AND situation_id=sit_3_3_1;
UPDATE responses SET teacher_score=5, ai_score=5, ai_feedback='Choix philosophique mature' WHERE session_id=v_session AND student_id=s_theo AND situation_id=sit_3_3_1;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Apaisement familial correct' WHERE session_id=v_session AND student_id=s_jade AND situation_id=sit_3_3_1;

-- ═══════════════════════════════════════════
-- S3 Q2: Le prix payé
-- ═══════════════════════════════════════════
UPDATE responses SET teacher_score=5, ai_score=5, ai_feedback='Perte de l''illusion = liberté, profond' WHERE session_id=v_session AND student_id=s_yasmine AND situation_id=sit_3_3_2;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Cicatrice relationnelle, juste' WHERE session_id=v_session AND student_id=s_karim AND situation_id=sit_3_3_2;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Prix de la visibilité, bien vu' WHERE session_id=v_session AND student_id=s_lea AND situation_id=sit_3_3_2;
UPDATE responses SET teacher_score=4, ai_score=3, ai_feedback='Vulnérabilité = nouveau défi' WHERE session_id=v_session AND student_id=s_enzo AND situation_id=sit_3_3_2;
UPDATE responses SET teacher_score=5, ai_score=5, ai_feedback='Amitié fissurée, prix réaliste' WHERE session_id=v_session AND student_id=s_fatou AND situation_id=sit_3_3_2;
UPDATE responses SET teacher_score=2, ai_score=2, ai_feedback='Superficiel, peu développé' WHERE session_id=v_session AND student_id=s_nathan AND situation_id=sit_3_3_2;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Accepter sa fragilité, mature' WHERE session_id=v_session AND student_id=s_ines AND situation_id=sit_3_3_2;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Bittersweet, bien rendu' WHERE session_id=v_session AND student_id=s_rayan AND situation_id=sit_3_3_2;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Perte matérielle = recommencement' WHERE session_id=v_session AND student_id=s_chloe AND situation_id=sit_3_3_2;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Visibilité = vulnérabilité, fort' WHERE session_id=v_session AND student_id=s_mamadou AND situation_id=sit_3_3_2;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Fin de la protection, correct' WHERE session_id=v_session AND student_id=s_sarah AND situation_id=sit_3_3_2;
UPDATE responses SET teacher_score=2, ai_score=2, ai_feedback='Trop court, manque de réflexion' WHERE session_id=v_session AND student_id=s_lucas AND situation_id=sit_3_3_2;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Double charge, réaliste' WHERE session_id=v_session AND student_id=s_amina AND situation_id=sit_3_3_2;
UPDATE responses SET teacher_score=5, ai_score=5, ai_feedback='L''incertitude choisie, profond' WHERE session_id=v_session AND student_id=s_theo AND situation_id=sit_3_3_2;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Maturité naissante' WHERE session_id=v_session AND student_id=s_jade AND situation_id=sit_3_3_2;

-- ═══════════════════════════════════════════
-- S3 Q3: La leçon
-- ═══════════════════════════════════════════
UPDATE responses SET teacher_score=5, ai_score=5, ai_feedback='Sagesse poétique, conclusion parfaite' WHERE session_id=v_session AND student_id=s_yasmine AND situation_id=sit_3_3_3;
UPDATE responses SET teacher_score=4, ai_score=3, ai_feedback='Direct et vrai, style Karim' WHERE session_id=v_session AND student_id=s_karim AND situation_id=sit_3_3_3;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Métaphore belle et juste' WHERE session_id=v_session AND student_id=s_lea AND situation_id=sit_3_3_3;
UPDATE responses SET teacher_score=5, ai_score=4, ai_feedback='Enzo philosophe, progression énorme' WHERE session_id=v_session AND student_id=s_enzo AND situation_id=sit_3_3_3;
UPDATE responses SET teacher_score=5, ai_score=5, ai_feedback='Message universel, parfait' WHERE session_id=v_session AND student_id=s_fatou AND situation_id=sit_3_3_3;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Observation pertinente génération Z' WHERE session_id=v_session AND student_id=s_nathan AND situation_id=sit_3_3_3;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Émotion transformée en force' WHERE session_id=v_session AND student_id=s_ines AND situation_id=sit_3_3_3;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Paradoxe humain, juste' WHERE session_id=v_session AND student_id=s_rayan AND situation_id=sit_3_3_3;
UPDATE responses SET teacher_score=4, ai_score=3, ai_feedback='Regard cinéma = mode de vie' WHERE session_id=v_session AND student_id=s_chloe AND situation_id=sit_3_3_3;
UPDATE responses SET teacher_score=5, ai_score=5, ai_feedback='Phrase bouleversante, le meilleur' WHERE session_id=v_session AND student_id=s_mamadou AND situation_id=sit_3_3_3;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Définition poétique du chez soi' WHERE session_id=v_session AND student_id=s_sarah AND situation_id=sit_3_3_3;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Message sportif, authentique' WHERE session_id=v_session AND student_id=s_lucas AND situation_id=sit_3_3_3;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Les rêves silencieux, poétique' WHERE session_id=v_session AND student_id=s_amina AND situation_id=sit_3_3_3;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Logique vs amour, beau retournement' WHERE session_id=v_session AND student_id=s_theo AND situation_id=sit_3_3_3;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Simple et honnête' WHERE session_id=v_session AND student_id=s_jade AND situation_id=sit_3_3_3;

-- ═══════════════════════════════════════════
-- S3 Q4: La dernière scène
-- ═══════════════════════════════════════════
UPDATE responses SET teacher_score=5, ai_score=5, ai_feedback='Image de fin sublime, walkman ouvert' WHERE session_id=v_session AND student_id=s_yasmine AND situation_id=sit_3_3_4;
UPDATE responses SET teacher_score=4, ai_score=3, ai_feedback='Porte ouverte = métaphore simple' WHERE session_id=v_session AND student_id=s_karim AND situation_id=sit_3_3_4;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Sourire final, progression achevée' WHERE session_id=v_session AND student_id=s_lea AND situation_id=sit_3_3_4;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Changement subtil, bien vu' WHERE session_id=v_session AND student_id=s_enzo AND situation_id=sit_3_3_4;
UPDATE responses SET teacher_score=5, ai_score=5, ai_feedback='Scène iconique, cinématographique' WHERE session_id=v_session AND student_id=s_fatou AND situation_id=sit_3_3_4;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Révélation d''identité, sympa' WHERE session_id=v_session AND student_id=s_nathan AND situation_id=sit_3_3_4;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Présence silencieuse = guérison' WHERE session_id=v_session AND student_id=s_ines AND situation_id=sit_3_3_4;
UPDATE responses SET teacher_score=5, ai_score=5, ai_feedback='Écouteur partagé = tout est dit' WHERE session_id=v_session AND student_id=s_rayan AND situation_id=sit_3_3_4;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Grain de pellicule = poésie visuelle' WHERE session_id=v_session AND student_id=s_chloe AND situation_id=sit_3_3_4;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Quotidien transformé, beau' WHERE session_id=v_session AND student_id=s_mamadou AND situation_id=sit_3_3_4;
UPDATE responses SET teacher_score=5, ai_score=4, ai_feedback='Autoportrait = réconciliation' WHERE session_id=v_session AND student_id=s_sarah AND situation_id=sit_3_3_4;
UPDATE responses SET teacher_score=3, ai_score=2, ai_feedback='Image correcte, manque de poésie' WHERE session_id=v_session AND student_id=s_lucas AND situation_id=sit_3_3_4;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Musique intérieure, cohérent' WHERE session_id=v_session AND student_id=s_amina AND situation_id=sit_3_3_4;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Réconciliation familiale, 3 générations' WHERE session_id=v_session AND student_id=s_theo AND situation_id=sit_3_3_4;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Porte fermée = espace à soi, OK' WHERE session_id=v_session AND student_id=s_jade AND situation_id=sit_3_3_4;

-- ═══════════════════════════════════════════
-- S3 Q5: Le titre
-- ═══════════════════════════════════════════
UPDATE responses SET teacher_score=5, ai_score=5, ai_feedback='Titre poétique et justifié' WHERE session_id=v_session AND student_id=s_yasmine AND situation_id=sit_3_3_5;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Bon titre alternatif' WHERE session_id=v_session AND student_id=s_karim AND situation_id=sit_3_3_5;
UPDATE responses SET teacher_score=2, ai_score=2, ai_feedback='Trop court, pas de justification' WHERE session_id=v_session AND student_id=s_lea AND situation_id=sit_3_3_5;
UPDATE responses SET teacher_score=2, ai_score=1, ai_feedback='Pas sérieux' WHERE session_id=v_session AND student_id=s_enzo AND situation_id=sit_3_3_5;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Beau titre avec justification' WHERE session_id=v_session AND student_id=s_fatou AND situation_id=sit_3_3_5;
UPDATE responses SET teacher_score=2, ai_score=2, ai_feedback='Blague puis accord, OK' WHERE session_id=v_session AND student_id=s_nathan AND situation_id=sit_3_3_5;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Poétique, beau titre alternatif' WHERE session_id=v_session AND student_id=s_ines AND situation_id=sit_3_3_5;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Humour puis consensus, participatif' WHERE session_id=v_session AND student_id=s_rayan AND situation_id=sit_3_3_5;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Référence ciné, propose alternative' WHERE session_id=v_session AND student_id=s_chloe AND situation_id=sit_3_3_5;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Phrase simple et universelle' WHERE session_id=v_session AND student_id=s_mamadou AND situation_id=sit_3_3_5;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Poétique mais moins fort' WHERE session_id=v_session AND student_id=s_sarah AND situation_id=sit_3_3_5;
UPDATE responses SET teacher_score=2, ai_score=2, ai_feedback='Blague puis accord' WHERE session_id=v_session AND student_id=s_lucas AND situation_id=sit_3_3_5;
UPDATE responses SET teacher_score=4, ai_score=3, ai_feedback='Titre musical, bonne idée' WHERE session_id=v_session AND student_id=s_amina AND situation_id=sit_3_3_5;
UPDATE responses SET teacher_score=4, ai_score=4, ai_feedback='Analyse du titre, pertinent' WHERE session_id=v_session AND student_id=s_theo AND situation_id=sit_3_3_5;
UPDATE responses SET teacher_score=3, ai_score=3, ai_feedback='Enthousiasme communicatif' WHERE session_id=v_session AND student_id=s_jade AND situation_id=sit_3_3_5;

RAISE NOTICE 'Scores updated for 180 responses!';

END $$;
