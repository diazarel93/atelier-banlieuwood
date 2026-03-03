-- ================================================================
-- SEED: Complete missing responses for DEMO42 session
-- Adds responses for Module 3 Séance 2 Q2-Q8 and Séance 3 Q1-Q5
-- 12 questions × 15 students = 180 responses + scoring
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
  t0 TIMESTAMPTZ := '2026-03-01 09:00:00+01';
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
-- SÉANCE 2 Q2: L'obstacle
-- ═══════════════════════════════════════════
INSERT INTO responses (session_id, student_id, situation_id, text, submitted_at, is_highlighted) VALUES
(v_session, s_yasmine, sit_3_2_2, 'L''adresse mène à un ancien appartement vide. Les voisins disent que sa mère est partie depuis des années. Retour à la case départ.', t0 + INTERVAL '87 min 30 sec', false),
(v_session, s_karim, sit_3_2_2, 'Sofiane a lu ses textes sur Insta. Il veut les utiliser pour sa carrière. "Rends-moi service ou je te grille."', t0 + INTERVAL '86 min 10 sec', true),
(v_session, s_lea, sit_3_2_2, 'Le nouveau, il est pas ce qu''il prétend. Lina découvre qu''il se moque d''elle avec ses potes.', t0 + INTERVAL '89 min 45 sec', false),
(v_session, s_enzo, sit_3_2_2, 'Il dort dans le hall et un voisin appelle les flics. Enzo finit au commissariat à 2h du mat.', t0 + INTERVAL '86 min 50 sec', false),
(v_session, s_fatou, sit_3_2_2, 'Le proviseur a prévenu le rectorat. Si Aïcha quitte pas le resto, elle perd la bourse et retourne en filière générale.', t0 + INTERVAL '90 min 5 sec', true),
(v_session, s_nathan, sit_3_2_2, 'Kevin hack son compte Twitch et poste des trucs dégueulasses en son nom. Son audience se barre.', t0 + INTERVAL '87 min 20 sec', false),
(v_session, s_ines, sit_3_2_2, 'Son anxiété empire. Elle commence à avoir des crises de panique en cours. Elle sort en courant de la classe.', t0 + INTERVAL '88 min 40 sec', false),
(v_session, s_rayan, sit_3_2_2, 'Leur père au bled refuse de prendre Youssef. "Soit les deux, soit aucun." La mère est coincée.', t0 + INTERVAL '86 min 25 sec', false),
(v_session, s_chloe, sit_3_2_2, 'Les mecs du deal la repèrent avec sa caméra. "Efface ça ou on efface ta caméra."', t0 + INTERVAL '87 min 55 sec', true),
(v_session, s_mamadou, sit_3_2_2, 'Où aller ? Ibrahim a pas de papiers, pas de famille, pas d''adresse. La rue l''attend.', t0 + INTERVAL '91 min 15 sec', false),
(v_session, s_sarah, sit_3_2_2, 'Elle veut signaler la harceleuse mais sa famille au Japon interdit. "Ne fais pas de vagues."', t0 + INTERVAL '89 min 30 sec', false),
(v_session, s_lucas, sit_3_2_2, 'Son coach dit : "Si tu boxes, t''es fini." Mais sans le championnat, pas de sport-études.', t0 + INTERVAL '86 min 35 sec', false),
(v_session, s_amina, sit_3_2_2, 'Le producteur insiste pour la rencontrer. Son père intercepte le message et confisque son téléphone.', t0 + INTERVAL '89 min 5 sec', false),
(v_session, s_theo, sit_3_2_2, 'Il confronte sa mère avec le carnet. Elle nie tout. "Tu inventes." Mais les preuves sont là.', t0 + INTERVAL '91 min 40 sec', false),
(v_session, s_jade, sit_3_2_2, 'Le divorce tourne mal. Son père quitte la maison. Sa mère pleure. Jade doit choisir chez qui elle dort.', t0 + INTERVAL '87 min 45 sec', false);

-- ═══════════════════════════════════════════
-- SÉANCE 2 Q3: La trahison
-- ═══════════════════════════════════════════
INSERT INTO responses (session_id, student_id, situation_id, text, submitted_at, is_highlighted) VALUES
(v_session, s_yasmine, sit_3_2_3, 'Sa grand-mère, lucide un instant, avoue : "J''ai toujours su où était ta mère. Je voulais te protéger." Nora est dévastée.', t0 + INTERVAL '94 min 10 sec', true),
(v_session, s_karim, sit_3_2_3, 'Son petit frère, pour impressionner Sofiane, lui montre où Karim cache son carnet. Sofiane le prend.', t0 + INTERVAL '93 min 5 sec', false),
(v_session, s_lea, sit_3_2_3, 'Sa prof de français, sa seule alliée, est mutée. Elle part sans dire au revoir.', t0 + INTERVAL '96 min 30 sec', false),
(v_session, s_enzo, sit_3_2_3, 'Son meilleur pote balance à tout le monde qu''Enzo dort pas chez lui. Pour rigoler. Toute la classe sait.', t0 + INTERVAL '93 min 35 sec', true),
(v_session, s_fatou, sit_3_2_3, 'C''est Mariama, sa meilleure amie, qui a parlé au proviseur. Elle pensait aider mais elle a tout fait exploser.', t0 + INTERVAL '96 min 50 sec', true),
(v_session, s_nathan, sit_3_2_3, 'DarkNinja92, son ami en ligne, était un alt de Kevin. Depuis le début il se moquait de lui.', t0 + INTERVAL '93 min 50 sec', false),
(v_session, s_ines, sit_3_2_3, 'Sa sœur ne revient pas parce qu''elle a honte d''elle. "T''es trop lourde avec tes problèmes, Luna."', t0 + INTERVAL '95 min 20 sec', true),
(v_session, s_rayan, sit_3_2_3, 'Yassine fait un deal secret avec la mère : il part, lui, pour que Youssef reste. Sans le dire à son frère.', t0 + INTERVAL '93 min 15 sec', false),
(v_session, s_chloe, sit_3_2_3, 'Abdel le cinéphile lui conseille de vendre la vidéo à un journaliste. Salomé se sent manipulée.', t0 + INTERVAL '94 min 40 sec', false),
(v_session, s_mamadou, sit_3_2_3, 'Le seul collègue qui l''aidait a témoigné contre lui auprès de la mairie pour garder son propre emploi.', t0 + INTERVAL '97 min 10 sec', false),
(v_session, s_sarah, sit_3_2_3, 'Sa seule amie en France montre ses photos à tout le monde en se moquant.', t0 + INTERVAL '96 min 5 sec', false),
(v_session, s_lucas, sit_3_2_3, 'Coach Mourad lâche Kenzo pour entraîner Driss, le rival meilleur que lui.', t0 + INTERVAL '93 min 25 sec', false),
(v_session, s_amina, sit_3_2_3, 'Sa mère a trouvé ses morceaux sur le téléphone et les a supprimés. "C''est pas un métier la musique."', t0 + INTERVAL '95 min 45 sec', true),
(v_session, s_theo, sit_3_2_3, 'Son beau-père trouve le carnet des lettres d''amour. Au lieu d''aider Théo, il le détruit.', t0 + INTERVAL '97 min 30 sec', false),
(v_session, s_jade, sit_3_2_3, 'Son père utilise Jade pour espionner la mère. "Dis-moi ce qu''elle fait." Jade est un pion.', t0 + INTERVAL '94 min 25 sec', false);

-- ═══════════════════════════════════════════
-- SÉANCE 2 Q4: Le choix
-- ═══════════════════════════════════════════
INSERT INTO responses (session_id, student_id, situation_id, text, submitted_at, is_highlighted) VALUES
(v_session, s_yasmine, sit_3_2_4, 'Rester au chevet de sa grand-mère ou partir chercher sa mère avec l''adresse secrète. Elle peut pas faire les deux.', t0 + INTERVAL '100 min 15 sec', false),
(v_session, s_karim, sit_3_2_4, 'Accepter le deal de Sofiane et récupérer son carnet, ou tout perdre mais garder sa dignité.', t0 + INTERVAL '99 min 20 sec', false),
(v_session, s_lea, sit_3_2_4, 'Se replier dans sa coquille ou exploser de colère pour la première fois de sa vie.', t0 + INTERVAL '102 min 50 sec', false),
(v_session, s_enzo, sit_3_2_4, 'Continuer à faire le clown ou avouer devant tout le monde que chez lui c''est la merde.', t0 + INTERVAL '99 min 45 sec', true),
(v_session, s_fatou, sit_3_2_4, 'Garder le restaurant et sa famille mange. Ou garder la bourse et sa famille coule. Pas de bon choix.', t0 + INTERVAL '103 min 5 sec', true),
(v_session, s_nathan, sit_3_2_4, 'Supprimer son compte Twitch pour toujours ou se battre pour le récupérer et affronter Kevin.', t0 + INTERVAL '100 min 30 sec', false),
(v_session, s_ines, sit_3_2_4, 'Dire la vérité sur son anxiété à ses parents ou continuer à souffrir en silence.', t0 + INTERVAL '101 min 40 sec', false),
(v_session, s_rayan, sit_3_2_4, 'Yassine : révéler son sacrifice à Youssef ou partir en silence.', t0 + INTERVAL '99 min 35 sec', true),
(v_session, s_chloe, sit_3_2_4, 'Effacer la vidéo et oublier, ou la garder comme preuve et risquer les représailles.', t0 + INTERVAL '100 min 55 sec', false),
(v_session, s_mamadou, sit_3_2_4, 'Accepter la rue en silence ou se battre alors qu''il a pas le droit d''exister officiellement.', t0 + INTERVAL '103 min 35 sec', false),
(v_session, s_sarah, sit_3_2_4, 'Raconter son passé de harcelée pour se libérer ou le garder secret pour pas que ça recommence.', t0 + INTERVAL '102 min 20 sec', false),
(v_session, s_lucas, sit_3_2_4, 'Boxer en risquant sa main ou abandonner le championnat et perdre sa seule chance.', t0 + INTERVAL '99 min 10 sec', false),
(v_session, s_amina, sit_3_2_4, 'Renoncer à la musique pour la paix ou se battre pour son rêve contre sa propre famille.', t0 + INTERVAL '101 min 55 sec', false),
(v_session, s_theo, sit_3_2_4, 'Chercher son vrai père ou accepter que certaines vérités sont trop dangereuses.', t0 + INTERVAL '103 min 45 sec', false),
(v_session, s_jade, sit_3_2_4, 'Refuser d''espionner pour son père ou trahir sa mère pour garder les deux.', t0 + INTERVAL '100 min 10 sec', false);

-- ═══════════════════════════════════════════
-- SÉANCE 2 Q5: La montée
-- ═══════════════════════════════════════════
INSERT INTO responses (session_id, student_id, situation_id, text, submitted_at, is_highlighted) VALUES
(v_session, s_yasmine, sit_3_2_5, 'Nora part en pleine nuit avec le walkman vide. 3 heures de marche vers l''adresse. Chaque pas la rapproche de la vérité.', t0 + INTERVAL '106 min 20 sec', true),
(v_session, s_karim, sit_3_2_5, 'Karim fait semblant d''accepter le deal. Mais il enregistre Sofiane en train de le menacer. Preuve.', t0 + INTERVAL '105 min 15 sec', false),
(v_session, s_lea, sit_3_2_5, 'Pour la première fois, Lina hurle. En plein cours. Tout le monde se retourne. Le silence après est assourdissant.', t0 + INTERVAL '108 min 40 sec', true),
(v_session, s_enzo, sit_3_2_5, 'Enzo monte sur une table à la cantine : "Ouais je dors dehors. Et alors ? Au moins moi je suis honnête."', t0 + INTERVAL '105 min 45 sec', true),
(v_session, s_fatou, sit_3_2_5, 'Son père découvre le bulletin falsifié. Confiance brisée. Le proviseur lui laisse 48h pour décider.', t0 + INTERVAL '109 min 5 sec', true),
(v_session, s_nathan, sit_3_2_5, 'Nathan apprend à coder pour tracer le hack de Kevin. Il découvre que Kevin a hacké d''autres élèves.', t0 + INTERVAL '106 min 30 sec', false),
(v_session, s_ines, sit_3_2_5, 'Luna écrit une lettre à ses parents. 4 pages. Tout ce qu''elle a gardé dedans. Elle la pose sur la table de la cuisine.', t0 + INTERVAL '107 min 50 sec', false),
(v_session, s_rayan, sit_3_2_5, 'Youssef trouve le billet d''avion caché. Confrontation violente. Premier vrai conflit entre les jumeaux.', t0 + INTERVAL '105 min 25 sec', false),
(v_session, s_chloe, sit_3_2_5, 'Salomé fait une copie secrète de la vidéo. Elle dit aux dealers "j''ai effacé". Mais elle ment.', t0 + INTERVAL '107 min 10 sec', false),
(v_session, s_mamadou, sit_3_2_5, 'Ibrahim écrit une lettre à la mairie. En français parfait. Personne savait qu''il écrivait si bien.', t0 + INTERVAL '110 min 25 sec', true),
(v_session, s_sarah, sit_3_2_5, 'Maya crée une expo photo "Invisible" : des clichés de gens qu''on ne regarde jamais.', t0 + INTERVAL '108 min 55 sec', false),
(v_session, s_lucas, sit_3_2_5, 'Kenzo s''entraîne la nuit, la main bandée. La douleur est terrible mais il serre les dents.', t0 + INTERVAL '105 min 40 sec', false),
(v_session, s_amina, sit_3_2_5, 'Soraya recrée ses morceaux de mémoire, fredonnant dans la cage d''escalier. Vieux dictaphone emprunté.', t0 + INTERVAL '108 min 15 sec', false),
(v_session, s_theo, sit_3_2_5, 'Théo retrouve l''identité de son père biologique sur un forum de généalogie. L''homme vit à 30 km.', t0 + INTERVAL '110 min 50 sec', false),
(v_session, s_jade, sit_3_2_5, 'Jade réunit ses deux parents dans un café. Sans prévenir. "Vous allez m''écouter maintenant."', t0 + INTERVAL '106 min 45 sec', false);

-- ═══════════════════════════════════════════
-- SÉANCE 2 Q6: Le point bas
-- ═══════════════════════════════════════════
INSERT INTO responses (session_id, student_id, situation_id, text, submitted_at, is_highlighted) VALUES
(v_session, s_yasmine, sit_3_2_6, 'L''adresse mène à un cimetière. La tombe porte le prénom de sa mère. Nora s''effondre. Le walkman tombe et se casse.', t0 + INTERVAL '113 min 25 sec', true),
(v_session, s_karim, sit_3_2_6, 'L''enregistrement a pas marché. Plus de batterie. Sofiane ricane : "T''as essayé de me piéger ? T''es fini."', t0 + INTERVAL '111 min 40 sec', false),
(v_session, s_lea, sit_3_2_6, 'Après son cri, tout le monde la regarde mais personne vient lui parler. Visible mais plus seule que jamais.', t0 + INTERVAL '115 min 10 sec', false),
(v_session, s_enzo, sit_3_2_6, 'L''assistante sociale parle de placement. Enzo réalise que sa grande gueule pourrait lui coûter sa liberté.', t0 + INTERVAL '112 min 5 sec', false),
(v_session, s_fatou, sit_3_2_6, 'Seule dans le restaurant fermé la nuit. Mariama répond plus. Son père lui parle plus. La petite sœur pleure.', t0 + INTERVAL '115 min 35 sec', true),
(v_session, s_nathan, sit_3_2_6, 'Kevin retourne la situation : tout le monde croit que c''est Nathan le hacker. Convoqué chez le CPE.', t0 + INTERVAL '112 min 30 sec', false),
(v_session, s_ines, sit_3_2_6, 'Ses parents lisent la lettre. Au lieu de comprendre, ils paniquent. Luna voulait de l''amour, pas un diagnostic.', t0 + INTERVAL '114 min 15 sec', false),
(v_session, s_rayan, sit_3_2_6, 'Les jumeaux se parlent plus. Pour la première fois, Yassine dort dos à Youssef. Le silence pèse 1000 kilos.', t0 + INTERVAL '111 min 55 sec', true),
(v_session, s_chloe, sit_3_2_6, 'Les dealers découvrent la copie. Ils cassent sa caméra. Son regard sur le monde, brisé sur le bitume.', t0 + INTERVAL '113 min 40 sec', false),
(v_session, s_mamadou, sit_3_2_6, 'La lettre est ignorée. Le centre fermé par la police. Ibrahim sur un banc, dehors, comme au début.', t0 + INTERVAL '116 min 20 sec', true),
(v_session, s_sarah, sit_3_2_6, 'L''expo est vandalisée. Quelqu''un a écrit "Rentre chez toi" sur ses photos.', t0 + INTERVAL '115 min 0 sec', false),
(v_session, s_lucas, sit_3_2_6, 'À l''entraînement secret, sa main lâche. Douleur insupportable. Kenzo tombe à genoux sur le ring, seul.', t0 + INTERVAL '111 min 45 sec', false),
(v_session, s_amina, sit_3_2_6, 'Le dictaphone tombe dans l''eau de la cage d''escalier. Tout est perdu. Encore. Soraya reste assise sans bouger.', t0 + INTERVAL '114 min 35 sec', false),
(v_session, s_theo, sit_3_2_6, 'Il sonne chez son père biologique. L''homme dit : "Je sais pas qui tu es." Il sait. Mais il ment.', t0 + INTERVAL '116 min 45 sec', true),
(v_session, s_jade, sit_3_2_6, 'Le café tourne au désastre. Les parents se hurlent dessus. Jade pleure au milieu. Le serveur les vire.', t0 + INTERVAL '112 min 50 sec', false);

-- ═══════════════════════════════════════════
-- SÉANCE 2 Q7: Le sursaut
-- ═══════════════════════════════════════════
INSERT INTO responses (session_id, student_id, situation_id, text, submitted_at, is_highlighted) VALUES
(v_session, s_yasmine, sit_3_2_7, 'Au cimetière, des fleurs fraîches. Quelqu''un vient encore ici. Sa mère est morte... mais qui apporte ces fleurs ?', t0 + INTERVAL '118 min 30 sec', true),
(v_session, s_karim, sit_3_2_7, 'Son petit frère revient en pleurant avec le carnet. "Pardon. Sofiane m''a forcé." Karim le serre dans ses bras.', t0 + INTERVAL '117 min 10 sec', false),
(v_session, s_lea, sit_3_2_7, 'Un élève inconnu lui envoie un mot : "Ton cri, c''était beau. T''as le droit d''exister fort."', t0 + INTERVAL '120 min 25 sec', false),
(v_session, s_enzo, sit_3_2_7, 'La prof d''histoire appelle l''assistante sociale : "Ce gamin a besoin d''aide, pas de placement." Elle se bat pour lui.', t0 + INTERVAL '117 min 45 sec', false),
(v_session, s_fatou, sit_3_2_7, 'La petite sœur vient avec un dessin : "merci d''avoir menti pour moi". Aïcha comprend pourquoi elle se bat.', t0 + INTERVAL '121 min 5 sec', true),
(v_session, s_nathan, sit_3_2_7, 'Ses 200 viewers lancent une campagne de soutien. Ils témoignent que c''est Kevin le harceleur.', t0 + INTERVAL '118 min 20 sec', false),
(v_session, s_ines, sit_3_2_7, 'La psy lui dit : "T''es pas malade. T''es juste quelqu''un qui ressent beaucoup." Luna pleure de soulagement.', t0 + INTERVAL '119 min 40 sec', true),
(v_session, s_rayan, sit_3_2_7, 'Youssef lit les lettres du grand-père (Yassine les a traduites et glissées sous son oreiller). "Restez ensemble."', t0 + INTERVAL '117 min 25 sec', true),
(v_session, s_chloe, sit_3_2_7, 'Abdel lui offre sa vieille Super 8. "Le cinéma c''est pas le matériel. C''est le regard."', t0 + INTERVAL '118 min 50 sec', false),
(v_session, s_mamadou, sit_3_2_7, 'Le chat le retrouve sur le banc. Une voisine passe : "Vous êtes Ibrahim ? Ma fille est journaliste."', t0 + INTERVAL '121 min 30 sec', false),
(v_session, s_sarah, sit_3_2_7, 'Un SDF qu''elle avait photographié vient au collège. "C''est la première fois qu''on me voit." Il a recollé les photos.', t0 + INTERVAL '120 min 15 sec', true),
(v_session, s_lucas, sit_3_2_7, 'Driss, le rival, vient à l''hôpital. "T''es un guerrier. Moi la technique, toi le cœur. On s''entraîne ensemble."', t0 + INTERVAL '117 min 35 sec', false),
(v_session, s_amina, sit_3_2_7, 'Sa petite sœur a appris une de ses mélodies par cœur. Elle la chante au dîner. Le père s''arrête, ému.', t0 + INTERVAL '119 min 55 sec', false),
(v_session, s_theo, sit_3_2_7, 'Un mot de sa mère sur son bureau : "Je sais que tu sais. Viens, on parle."', t0 + INTERVAL '121 min 50 sec', false),
(v_session, s_jade, sit_3_2_7, 'Son cousin Adam dessine une famille : Jade au centre, parents de chaque côté. "T''es toujours au milieu."', t0 + INTERVAL '118 min 5 sec', false);

-- ═══════════════════════════════════════════
-- SÉANCE 2 Q8: La confrontation
-- ═══════════════════════════════════════════
INSERT INTO responses (session_id, student_id, situation_id, text, submitted_at, is_highlighted) VALUES
(v_session, s_yasmine, sit_3_2_8, 'Nora attend toute la nuit. Au matin une femme arrive avec des fleurs. C''est la sœur de sa mère. Elle lui dit tout.', t0 + INTERVAL '124 min 20 sec', true),
(v_session, s_karim, sit_3_2_8, 'Karim va voir Sofiane. Pas avec la peur, avec ses textes. Il les rappe devant lui. "Écoute ma voix."', t0 + INTERVAL '123 min 5 sec', true),
(v_session, s_lea, sit_3_2_8, 'Lina lit une lettre devant la classe. "Je suis invisible depuis 3 ans. Aujourd''hui je choisis d''exister."', t0 + INTERVAL '126 min 30 sec', false),
(v_session, s_enzo, sit_3_2_8, 'Enzo retourne chez sa mère. Il sonne. Elle ouvre. "J''ai besoin de toi." Trois mots, les plus durs de sa vie.', t0 + INTERVAL '123 min 35 sec', true),
(v_session, s_fatou, sit_3_2_8, 'Elle va voir le proviseur. La vérité complète. Le restaurant, le bulletin, la sœur. Elle tremble mais elle parle.', t0 + INTERVAL '127 min 0 sec', true),
(v_session, s_nathan, sit_3_2_8, 'Nathan va voir Kevin. Pas pour se battre. "Je te pardonne. Mais tu me touches plus."', t0 + INTERVAL '124 min 15 sec', false),
(v_session, s_ines, sit_3_2_8, 'Luna appelle sa sœur. Pas pour pleurer. Pour dire : "Tu m''as blessée. Et j''ai le droit de te le dire."', t0 + INTERVAL '125 min 30 sec', false),
(v_session, s_rayan, sit_3_2_8, 'Les jumeaux face à leur mère. "On part ensemble ou on reste ensemble. Pas d''autre option."', t0 + INTERVAL '123 min 20 sec', false),
(v_session, s_chloe, sit_3_2_8, 'Salomé projette son film dans la salle des fêtes. Sans la scène du deal. Un film sur la beauté du quotidien.', t0 + INTERVAL '124 min 45 sec', false),
(v_session, s_mamadou, sit_3_2_8, 'La journaliste publie l''histoire d''Ibrahim. Le centre est sauvé. Ibrahim a un nom dans le journal.', t0 + INTERVAL '127 min 25 sec', false),
(v_session, s_sarah, sit_3_2_8, 'Maya poste ses photos avec un texte : "On m''a dit de rentrer chez moi. Je suis chez moi." 10 000 partages.', t0 + INTERVAL '126 min 10 sec', false),
(v_session, s_lucas, sit_3_2_8, 'Kenzo monte sur le ring avec une attelle. Il perd mais tient 3 rounds. Le public scande son nom.', t0 + INTERVAL '123 min 15 sec', false),
(v_session, s_amina, sit_3_2_8, 'Soraya chante son morceau dans la cage d''escalier, à fond. Les voisins ouvrent les portes. Personne dit "chut".', t0 + INTERVAL '125 min 45 sec', true),
(v_session, s_theo, sit_3_2_8, 'Sa mère lui raconte tout. Les étoiles, la rencontre, la décision de rester. Théo pleure pour la première fois.', t0 + INTERVAL '127 min 40 sec', false),
(v_session, s_jade, sit_3_2_8, 'Jade dit à ses parents : "Je vous aime mais je suis pas votre arbitre. Je suis votre fille."', t0 + INTERVAL '124 min 0 sec', false);

-- ═══════════════════════════════════════════
-- SÉANCE 3 Q1: La résolution
-- ═══════════════════════════════════════════
INSERT INTO responses (session_id, student_id, situation_id, text, submitted_at, is_highlighted) VALUES
(v_session, s_yasmine, sit_3_3_1, 'Nora apprend que sa mère est morte en la mettant au monde. Le walkman c''était son père. Elle retourne vers sa grand-mère.', t0 + INTERVAL '131 min 25 sec', false),
(v_session, s_karim, sit_3_3_1, 'Sofiane, impressionné par le courage, lui fiche la paix. Karim poste ses textes lui-même. Plus de secret.', t0 + INTERVAL '130 min 10 sec', false),
(v_session, s_lea, sit_3_3_1, 'Lina a des amis maintenant. Pas beaucoup. Trois. C''est assez.', t0 + INTERVAL '133 min 45 sec', false),
(v_session, s_enzo, sit_3_3_1, 'Sa mère accepte de l''aide. Enzo revient chez lui. C''est pas parfait mais c''est chez lui.', t0 + INTERVAL '130 min 35 sec', false),
(v_session, s_fatou, sit_3_3_1, 'Le proviseur trouve un arrangement : travailler le samedi seulement. La bourse est maintenue sous conditions.', t0 + INTERVAL '134 min 10 sec', true),
(v_session, s_nathan, sit_3_3_1, 'Kevin est exclu 3 jours. Nathan recommence son stream. Plus fort. 500 viewers.', t0 + INTERVAL '131 min 20 sec', false),
(v_session, s_ines, sit_3_3_1, 'Luna va mieux. Elle voit la psy chaque semaine. Sa sœur a appelé pour s''excuser. Un début.', t0 + INTERVAL '132 min 35 sec', false),
(v_session, s_rayan, sit_3_3_1, 'La mère trouve un appart plus grand. Pas de séparation. Les jumeaux ont chacun leur chambre pour la première fois.', t0 + INTERVAL '130 min 20 sec', false),
(v_session, s_chloe, sit_3_3_1, 'Elle gagne pas le concours mais un réalisateur lui propose un stage. "T''as un œil, gamine."', t0 + INTERVAL '131 min 50 sec', false),
(v_session, s_mamadou, sit_3_3_1, 'Ibrahim obtient un titre de séjour provisoire. Le centre rouvre en espace associatif. Il est gardien, officiellement.', t0 + INTERVAL '134 min 30 sec', false),
(v_session, s_sarah, sit_3_3_1, 'Maya parle à la harceleuse en visio. Pas pour pardonner. Pour dire : "Tu m''as fait mal. C''est fini."', t0 + INTERVAL '133 min 20 sec', false),
(v_session, s_lucas, sit_3_3_1, 'Il perd le championnat mais gagne le respect. Sport-études le prend quand même. "Le courage vaut plus qu''un titre."', t0 + INTERVAL '130 min 25 sec', false),
(v_session, s_amina, sit_3_3_1, 'Le père rend le téléphone. "Fais ta musique. Mais fais-la bien." Soraya compose toute la nuit.', t0 + INTERVAL '132 min 50 sec', false),
(v_session, s_theo, sit_3_3_1, 'Théo choisit de pas contacter son père biologique. L''homme qui l''a élevé EST son père.', t0 + INTERVAL '134 min 45 sec', true),
(v_session, s_jade, sit_3_3_1, 'Les parents se parlent enfin comme des adultes. Jade respire. Elle est plus l''arbitre.', t0 + INTERVAL '131 min 5 sec', false);

-- ═══════════════════════════════════════════
-- SÉANCE 3 Q2: Le prix payé
-- ═══════════════════════════════════════════
INSERT INTO responses (session_id, student_id, situation_id, text, submitted_at, is_highlighted) VALUES
(v_session, s_yasmine, sit_3_3_2, 'Nora a perdu l''illusion. Sa mère ne viendra jamais. Le rêve est mort. Mais la vérité, c''est la liberté.', t0 + INTERVAL '137 min 20 sec', true),
(v_session, s_karim, sit_3_3_2, 'La relation avec son petit frère est abîmée. La confiance fissurée. Les cicatrices restent.', t0 + INTERVAL '136 min 5 sec', false),
(v_session, s_lea, sit_3_3_2, 'Elle a crié et les gens la voient. Mais certains la trouvent "bizarre". Le prix de la visibilité.', t0 + INTERVAL '139 min 30 sec', false),
(v_session, s_enzo, sit_3_3_2, 'Tout le monde sait. Plus de masque, plus de blagues qui protègent. Enzo est nu devant le monde.', t0 + INTERVAL '136 min 40 sec', false),
(v_session, s_fatou, sit_3_3_2, 'Mariama et Aïcha ne seront plus les mêmes. Amitié fissurée. Son père la regarde différemment.', t0 + INTERVAL '140 min 5 sec', true),
(v_session, s_nathan, sit_3_3_2, 'Nathan est connu au collège. Plus anonyme. C''est ce qu''il voulait mais ça fait peur.', t0 + INTERVAL '137 min 25 sec', false),
(v_session, s_ines, sit_3_3_2, 'Elle sait qu''elle est fragile. C''est dur à accepter quand t''as 15 ans et tu voulais juste être normale.', t0 + INTERVAL '138 min 40 sec', false),
(v_session, s_rayan, sit_3_3_2, 'Les jumeaux ont leur espace mais sont plus fusionnels. C''est mieux et triste à la fois.', t0 + INTERVAL '136 min 15 sec', false),
(v_session, s_chloe, sit_3_3_2, 'Sa caméra brisée, ses rushs perdus. Deux ans de travail. Elle repart de zéro avec la Super 8.', t0 + INTERVAL '137 min 50 sec', false),
(v_session, s_mamadou, sit_3_3_2, 'Ibrahim existe officiellement mais son passé est public. Être visible, c''est aussi être vulnérable.', t0 + INTERVAL '140 min 30 sec', false),
(v_session, s_sarah, sit_3_3_2, 'Maya a dit la vérité sur le harcèlement. Plus de secret. Mais aussi plus de protection.', t0 + INTERVAL '139 min 15 sec', false),
(v_session, s_lucas, sit_3_3_2, 'Sa main mettra 6 mois à guérir. La boxe attendra. Kenzo doit apprendre la patience.', t0 + INTERVAL '136 min 0 sec', false),
(v_session, s_amina, sit_3_3_2, 'Double vie, double effort : musique + école. Soraya est épuisée mais vivante.', t0 + INTERVAL '138 min 55 sec', false),
(v_session, s_theo, sit_3_3_2, 'Il a choisi de ne pas savoir. L''incertitude le hantera. Mais il a gagné l''amour de sa famille telle qu''elle est.', t0 + INTERVAL '140 min 50 sec', true),
(v_session, s_jade, sit_3_3_2, 'Le bonheur de ses parents n''est pas sa responsabilité. Ça veut dire qu''elle peut pas les sauver. Ça fait mal.', t0 + INTERVAL '137 min 10 sec', false);

-- ═══════════════════════════════════════════
-- SÉANCE 3 Q3: La leçon
-- ═══════════════════════════════════════════
INSERT INTO responses (session_id, student_id, situation_id, text, submitted_at, is_highlighted) VALUES
(v_session, s_yasmine, sit_3_3_3, 'On peut aimer quelqu''un qu''on n''a jamais connu. Et un jour faut arrêter de chercher pour commencer à vivre.', t0 + INTERVAL '143 min 15 sec', true),
(v_session, s_karim, sit_3_3_3, 'Les mots c''est plus puissant que les poings. Même quand personne écoute, faut continuer à écrire.', t0 + INTERVAL '142 min 5 sec', false),
(v_session, s_lea, sit_3_3_3, 'Être invisible c''est une prison. Pour en sortir faut accepter de faire du bruit.', t0 + INTERVAL '145 min 40 sec', false),
(v_session, s_enzo, sit_3_3_3, 'Rigoler pour pas pleurer, ça marche un temps. Mais faut enlever le masque sinon on étouffe dessous.', t0 + INTERVAL '142 min 35 sec', true),
(v_session, s_fatou, sit_3_3_3, 'Ce film parle des gamins qui portent leur famille sur les épaules. Il dit qu''on peut demander de l''aide sans honte.', t0 + INTERVAL '146 min 0 sec', true),
(v_session, s_nathan, sit_3_3_3, 'On peut être fort en ligne et fragile dans la vraie vie. Les deux sont vrais.', t0 + INTERVAL '143 min 25 sec', false),
(v_session, s_ines, sit_3_3_3, 'Ressentir beaucoup c''est pas une faiblesse. C''est un pouvoir. Mais faut apprendre à le contrôler.', t0 + INTERVAL '144 min 30 sec', false),
(v_session, s_rayan, sit_3_3_3, 'On peut aimer quelqu''un et vouloir être loin de lui. C''est pas contradictoire, c''est humain.', t0 + INTERVAL '142 min 15 sec', false),
(v_session, s_chloe, sit_3_3_3, 'Regarder le monde à travers une caméra c''est beau. Mais faut aussi poser la caméra et vivre.', t0 + INTERVAL '143 min 50 sec', false),
(v_session, s_mamadou, sit_3_3_3, 'Exister, c''est pas avoir des papiers. C''est avoir quelqu''un qui se souvient de ton nom.', t0 + INTERVAL '146 min 25 sec', true),
(v_session, s_sarah, sit_3_3_3, 'Chez soi, c''est pas un pays. C''est là où quelqu''un t''attend.', t0 + INTERVAL '145 min 15 sec', false),
(v_session, s_lucas, sit_3_3_3, 'Perdre c''est pas échouer. Abandonner, oui. Se relever après une défaite, c''est gagner autrement.', t0 + INTERVAL '142 min 0 sec', false),
(v_session, s_amina, sit_3_3_3, 'La musique existe même quand on l''entend pas. Comme les rêves qu''on ose pas dire à voix haute.', t0 + INTERVAL '144 min 45 sec', false),
(v_session, s_theo, sit_3_3_3, 'Parfois la vérité fait plus de mal que le mensonge. Et c''est OK de choisir l''amour plutôt que la logique.', t0 + INTERVAL '146 min 40 sec', false),
(v_session, s_jade, sit_3_3_3, 'On peut pas rendre tout le monde heureux. Notre boulot c''est d''être honnête.', t0 + INTERVAL '143 min 10 sec', false);

-- ═══════════════════════════════════════════
-- SÉANCE 3 Q4: La dernière scène
-- ═══════════════════════════════════════════
INSERT INTO responses (session_id, student_id, situation_id, text, submitted_at, is_highlighted) VALUES
(v_session, s_yasmine, sit_3_3_4, 'Nora sur le toit, elle dessine le visage de sa mère de mémoire. Le walkman ouvert, vide, et c''est pas grave.', t0 + INTERVAL '149 min 25 sec', true),
(v_session, s_karim, sit_3_3_4, 'Karim dans le local à vélos, micro en main, porte ouverte. Sa voix résonne dans la cage d''escalier.', t0 + INTERVAL '148 min 10 sec', false),
(v_session, s_lea, sit_3_3_4, 'Lina dans le couloir du collège. Quelqu''un l''appelle par son prénom. Elle se retourne et sourit.', t0 + INTERVAL '151 min 40 sec', false),
(v_session, s_enzo, sit_3_3_4, 'Le prof dit "Sérieusement, Enzo." Il répond sérieusement. Et tout le monde l''écoute.', t0 + INTERVAL '148 min 45 sec', false),
(v_session, s_fatou, sit_3_3_4, 'Aïcha marche vers le lycée, sac sur le dos. La petite sœur fait signe. Le soleil se lève. Elle regarde pas en arrière.', t0 + INTERVAL '152 min 5 sec', true),
(v_session, s_nathan, sit_3_3_4, 'Nathan en live, face caméra. "Salut, je suis Nathan. Pas un pseudo. Nathan." Les gens spamment des cœurs.', t0 + INTERVAL '149 min 30 sec', false),
(v_session, s_ines, sit_3_3_4, 'Luna sur son banc sous le platane. Quelqu''un est assis à côté. Elles se parlent pas. C''est pas nécessaire.', t0 + INTERVAL '150 min 45 sec', false),
(v_session, s_rayan, sit_3_3_4, 'Les jumeaux côte à côte, chacun ses écouteurs. Yassine retire un écouteur et le tend à son frère.', t0 + INTERVAL '148 min 20 sec', true),
(v_session, s_chloe, sit_3_3_4, 'Salomé filme la dalle à l''aube avec la Super 8. Le grain rend tout beau. Un enfant fait du vélo dans la lumière.', t0 + INTERVAL '149 min 55 sec', false),
(v_session, s_mamadou, sit_3_3_4, 'Ibrahim ouvre le centre le matin. Le chat entre en premier. Derrière, des enfants arrivent pour un atelier.', t0 + INTERVAL '152 min 30 sec', false),
(v_session, s_sarah, sit_3_3_4, 'Maya photographie son reflet dans la vitre du RER. Elle se trouve belle dans l''entre-deux.', t0 + INTERVAL '151 min 20 sec', true),
(v_session, s_lucas, sit_3_3_4, 'Kenzo dans la salle vide, main bandée. Il frappe le sac de l''autre main. Lentement. Je suis encore là.', t0 + INTERVAL '148 min 15 sec', false),
(v_session, s_amina, sit_3_3_4, 'Soraya dans la cage d''escalier, écouteurs reliés à rien. Elle écoute sa propre musique dans sa tête. Elle sourit.', t0 + INTERVAL '150 min 55 sec', false),
(v_session, s_theo, sit_3_3_4, 'Théo et son père installent le télescope. Le beau-père : "Je peux regarder aussi ?" Théo dit oui.', t0 + INTERVAL '152 min 45 sec', false),
(v_session, s_jade, sit_3_3_4, 'Jade rentre de l''école. Bonjour à tout le monde. Mais cette fois elle rentre CHEZ ELLE, ferme la porte. Sourire.', t0 + INTERVAL '149 min 15 sec', false);

-- ═══════════════════════════════════════════
-- SÉANCE 3 Q5: Le titre
-- ═══════════════════════════════════════════
INSERT INTO responses (session_id, student_id, situation_id, text, submitted_at, is_highlighted) VALUES
(v_session, s_yasmine, sit_3_3_5, 'Les Étoiles de Clichy. Parce que dans cette banlieue, si on lève la tête, on voit encore des étoiles.', t0 + INTERVAL '155 min 25 sec', true),
(v_session, s_karim, sit_3_3_5, 'La Voix du Sous-Sol. Court, direct, ça claque.', t0 + INTERVAL '154 min 10 sec', false),
(v_session, s_lea, sit_3_3_5, 'Vue d''en Bas.', t0 + INTERVAL '157 min 30 sec', false),
(v_session, s_enzo, sit_3_3_5, 'MDR c''est pas drôle. Non en vrai c''est un bon titre pour le film.', t0 + INTERVAL '154 min 35 sec', false),
(v_session, s_fatou, sit_3_3_5, 'Le Poids des Étoiles. Parce que briller c''est lourd quand on porte sa famille.', t0 + INTERVAL '157 min 50 sec', false),
(v_session, s_nathan, sit_3_3_5, 'Player One : Banlieue Edition. OK je rigole. Les Étoiles de Clichy c''est bien.', t0 + INTERVAL '155 min 20 sec', false),
(v_session, s_ines, sit_3_3_5, 'Ceux qui Brillent en Silence.', t0 + INTERVAL '156 min 15 sec', false),
(v_session, s_rayan, sit_3_3_5, 'Je propose deux titres. Non sérieux : Les Étoiles de Clichy, ça représente tout le monde.', t0 + INTERVAL '154 min 25 sec', false),
(v_session, s_chloe, sit_3_3_5, 'Clichy, 93 : Panoramique. Référence ciné + lieu. Les Étoiles aussi j''aime bien.', t0 + INTERVAL '155 min 45 sec', false),
(v_session, s_mamadou, sit_3_3_5, 'Les Étoiles de Clichy. Parce qu''on peut tous en être une.', t0 + INTERVAL '158 min 5 sec', false),
(v_session, s_sarah, sit_3_3_5, 'Entre Deux Lumières. Comme l''aube.', t0 + INTERVAL '157 min 10 sec', false),
(v_session, s_lucas, sit_3_3_5, 'Le Round Final. Non pardon. Les Étoiles de Clichy c''est mieux.', t0 + INTERVAL '154 min 15 sec', false),
(v_session, s_amina, sit_3_3_5, 'La Mélodie du Béton. Mais je vote Les Étoiles de Clichy.', t0 + INTERVAL '156 min 35 sec', false),
(v_session, s_theo, sit_3_3_5, 'Les Étoiles de Clichy. Les étoiles = métaphore des personnages lumineux malgré l''obscurité.', t0 + INTERVAL '158 min 20 sec', false),
(v_session, s_jade, sit_3_3_5, 'Les Étoiles de Clichy !! Tout le monde est d''accord en vrai !', t0 + INTERVAL '155 min 0 sec', false);

RAISE NOTICE 'Missing responses inserted! 180 responses (12 questions × 15 students)';

END $$;
