-- ============================================================
-- Module 11 "Ciné-Débat" — 24 situations (4 séances × 6)
-- Stimuli data is in src/lib/module11-data.ts (static TypeScript)
-- All situations use standard Q&A flow (open or closed)
-- ============================================================

-- ══════════════════════════════════════════════
-- SÉANCE 1 — L'Art de Raconter
-- ══════════════════════════════════════════════

-- pos 1 — Citation Hitchcock: "3 choses : un bon scénario..."
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (11, 1, 1, 'raconter', 'Citation — Hitchcock', 'open',
  'Es-tu d''accord avec lui ? C''est quoi le plus important dans un film ?',
  'Es-tu d''accord ? L''histoire est-elle plus importante que les effets spéciaux ?',
  'Hitchcock affirme la primauté du scénario. Partagez-vous cette hiérarchie ? Argumentez.',
  'Pense à un film que tu adores. Qu''est-ce qui t''a accroché en premier ?');

-- pos 2 — Poster Inception: inventer le pitch
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (11, 1, 2, 'raconter', 'Poster — Inception', 'open',
  'Regarde bien l''image. Invente l''histoire de ce film en une phrase !',
  'Invente le pitch de ce film en une phrase, juste avec cette image.',
  'À partir de cette affiche, formulez un pitch en une phrase qui capte l''essence du film.',
  'Laisse l''image te parler. Qu''est-ce que tu vois ? Qu''est-ce qui pourrait se passer ?');

-- pos 3 — Citation Miyazaki: commencer sans savoir la fin
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (11, 1, 3, 'raconter', 'Citation — Miyazaki', 'open',
  'C''est du génie ou il improvise ? Tu ferais pareil ?',
  'C''est du génie ou de l''improvisation ? Tu ferais pareil ?',
  'Commencer sans connaître la fin : génie créatif ou manque de rigueur ? Argumentez.',
  'Pense à quand tu racontes une histoire à tes potes — tu sais toujours la fin ?');

-- pos 4 — Scene Spider-Verse: style unique
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (11, 1, 4, 'raconter', 'Scène — Spider-Verse', 'open',
  'C''est quoi qui rend ce film différent des autres dessins animés ?',
  'Ce film a inventé un nouveau style. Qu''est-ce qui le rend unique visuellement ?',
  'Analysez les choix esthétiques de Spider-Verse. En quoi renouvellent-ils le genre de l''animation ?',
  'Regarde les couleurs, le mouvement, le dessin. Qu''est-ce qui est différent ?');

-- pos 5 — Débat: pas besoin de dialogue
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, options, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (11, 1, 5, 'raconter', 'Débat — Dialogue', 'closed',
  '[{"key":"daccord","label":"D''accord"},{"key":"pasdaccord","label":"Pas d''accord"},{"key":"nuance","label":"C''est plus nuancé"}]'::jsonb,
  'Un bon film n''a PAS besoin de dialogue. T''es d''accord ? Pourquoi ?',
  'D''accord ou pas d''accord : un bon film n''a pas besoin de dialogue ? Justifie avec un exemple.',
  'Les images suffisent-elles à faire un bon film ? Défendez votre position avec des exemples précis.',
  'Pense à un film muet ou une scène sans parole qui t''a marqué.');

-- pos 6 — Citation Pixar: "Et si les jouets étaient vivants ?"
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (11, 1, 6, 'raconter', 'Citation — Pixar', 'open',
  'À toi ! Invente un « Et si... » en une phrase. Le plus fou gagne !',
  'À toi : invente un « Et si... » en une phrase. Le plus fou gagne.',
  'Sur le modèle de Pixar, formulez votre propre « Et si... » — la proposition la plus originale l''emporte.',
  'Lâche-toi ! « Et si... » les chaussures avaient des sentiments ? « Et si... » les profs étaient des robots ?');

-- Variant for pos 6 (alternative prompt)
INSERT INTO situations (module, seance, position, variant, category, restitution_label, question_type, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (11, 1, 6, 1, 'raconter', 'Citation — Pixar', 'open',
  'Pixar a commencé Toy Story par « Et si... ». À toi d''inventer le tien !',
  'Tout grand film commence par un « Et si... ». Trouve le tien, le plus créatif possible.',
  'Le « Et si... » est le moteur de l''imagination narrative. Proposez le vôtre — visez l''originalité et le potentiel dramatique.',
  'Pas besoin que ce soit réaliste. Les meilleures idées sont les plus folles.');

-- ══════════════════════════════════════════════
-- SÉANCE 2 — Émotions à l'Écran
-- ══════════════════════════════════════════════

-- pos 1 — Scene Le Roi Lion: pourquoi ça fait pleurer
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (11, 2, 1, 'émotion', 'Scène — Le Roi Lion', 'open',
  'Pourquoi cette scène fait pleurer ? C''est quoi le truc ?',
  'Pourquoi cette scène fait pleurer tout le monde ? Quels sont les ingrédients ?',
  'Décryptez les mécanismes émotionnels de cette scène : mise en scène, musique, narration.',
  'Pense à la musique, aux images, à ce que tu ressens. C''est pas juste triste — c''est fait exprès.');

-- pos 2 — Citation Phoenix: jouer la tristesse
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (11, 2, 2, 'émotion', 'Citation — Phoenix', 'open',
  'C''est quoi la différence entre être triste et essayer de pas l''être ?',
  'C''est quoi la différence ? Pourquoi c''est plus puissant ?',
  'Expliquez la nuance entre « jouer la tristesse » et « jouer quelqu''un qui résiste à la tristesse ». Pourquoi la seconde approche est-elle plus efficace ?',
  'Quand tu retiens tes larmes, c''est souvent plus émouvant que quand tu pleures vraiment.');

-- pos 3 — Poster Vice-Versa: 6e émotion
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (11, 2, 3, 'émotion', 'Poster — Vice-Versa', 'open',
  'Si tu ajoutais une émotion dans le film, ce serait quoi ?',
  'Si tu devais ajouter une 6e émotion dans le film, ce serait laquelle ?',
  'Proposez une 6e émotion pour enrichir le casting de Vice-Versa. Justifiez votre choix narrativement.',
  'Pense à une émotion qu''on ressent souvent mais qu''on ne sait pas nommer.');

-- pos 4 — Scene Naruto vs Pain: pardon ou naïveté
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (11, 2, 4, 'émotion', 'Scène — Naruto', 'open',
  'Naruto pardonne au lieu de se venger. C''est fort ou c''est bête ?',
  'Naruto choisit le pardon au lieu de la vengeance. C''est fort ou c''est naïf ?',
  'Le choix du pardon face à la vengeance : force morale ou naïveté narrative ? Analysez.',
  'Pense à une situation où quelqu''un t''a fait du mal. Tu pardonnerais ou pas ?');

-- pos 5 — Débat: horreur = pas du vrai cinéma
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, options, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (11, 2, 5, 'émotion', 'Débat — Horreur', 'closed',
  '[{"key":"daccord","label":"D''accord"},{"key":"pasdaccord","label":"Pas d''accord"},{"key":"nuance","label":"C''est plus nuancé"}]'::jsonb,
  'Les films d''horreur, c''est du vrai cinéma ou pas ? Dis pourquoi !',
  'D''accord ou pas d''accord : les films d''horreur, c''est pas du vrai cinéma ? Défends ta position.',
  'L''horreur comme genre cinématographique : art mineur ou expression légitime ? Argumentez.',
  'Pense à un film d''horreur qui t''a marqué. C''était juste pour faire peur ou il y avait un vrai message ?');

-- pos 6 — Citation Kubrick: le silence
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (11, 2, 6, 'émotion', 'Citation — Kubrick', 'open',
  'Donne un moment où le silence t''a marqué dans un film ou un dessin animé.',
  'Donne un exemple de moment où le silence t''a marqué dans un film/anime.',
  'Illustrez la puissance du silence au cinéma par un exemple précis. Analysez son effet.',
  'Le silence, c''est aussi un choix de mise en scène. Pense à un moment où y''avait rien... mais ça disait tout.');

-- ══════════════════════════════════════════════
-- SÉANCE 3 — Héros & Anti-Héros
-- ══════════════════════════════════════════════

-- pos 1 — Scene Iron Man: sacrifice
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (11, 3, 1, 'héros', 'Scène — Iron Man', 'open',
  'Un héros doit se sacrifier pour être un vrai héros ? Pourquoi ?',
  'Iron Man se sacrifie. Un héros DOIT-il se sacrifier pour être un vrai héros ?',
  'Le sacrifice est-il constitutif de l''héroïsme ? Analysez à travers l''arc d''Iron Man.',
  'Pense à d''autres héros qui ne se sont PAS sacrifiés. Sont-ils moins héroïques ?');

-- pos 2 — Citation Naruto: nindo
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (11, 3, 2, 'héros', 'Citation — Naruto', 'open',
  'Naruto ne change jamais d''avis. C''est une qualité ou un défaut ?',
  'La persévérance de Naruto : qualité ou défaut ?',
  'La persévérance absolue de Naruto est-elle une force narrative ou une faille de caractère ? Argumentez.',
  'Pense à un moment où toi, tu aurais dû changer d''avis mais tu as insisté. Bien ou pas ?');

-- pos 3 — Poster Joker: méchant ou victime
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (11, 3, 3, 'héros', 'Poster — Joker', 'open',
  'Le Joker, c''est un méchant ou une victime ? Pourquoi tu penses ça ?',
  'Le Joker est-il un méchant ou une victime ? Justifie.',
  'Arthur Fleck : antagoniste ou victime de la société ? Développez votre analyse du personnage.',
  'Pense aux raisons qui poussent quelqu''un à devenir « méchant ». C''est toujours un choix ?');

-- pos 4 — Débat: meilleur méchant = Thanos
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, options, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (11, 3, 4, 'héros', 'Débat — Thanos', 'closed',
  '[{"key":"daccord","label":"D''accord"},{"key":"pasdaccord","label":"Pas d''accord"},{"key":"nuance","label":"C''est plus nuancé"}]'::jsonb,
  'Le meilleur méchant, c''est Thanos ? Ou c''est qui alors ?',
  'D''accord ou pas d''accord : le meilleur méchant de tous les temps, c''est Thanos. Et toi, c''est qui ?',
  'Thanos est-il le meilleur antagoniste du cinéma ? Proposez votre candidat et justifiez.',
  'Un bon méchant, c''est pas juste quelqu''un de mauvais. C''est quelqu''un qu''on comprend.');

-- pos 5 — Scene Eren: héros qui devient méchant
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (11, 3, 5, 'héros', 'Scène — Eren Jäger', 'open',
  'Quand un héros devient méchant, c''est une trahison ou c''est logique ?',
  'Un héros qui devient méchant : trahison ou évolution logique ?',
  'La bascule d''Eren Jäger du héros à l''antagoniste : rupture narrative ou aboutissement logique de son arc ?',
  'Pense aux indices que l''auteur avait semés. Ça se voyait venir ?');

-- pos 6 — Citation Stan Lee: masque
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (11, 3, 6, 'héros', 'Citation — Stan Lee', 'open',
  'Le masque, ça cache ou ça montre qui on est vraiment ?',
  'Le masque cache ou révèle ? Qu''est-ce que le costume dit du héros ?',
  'Le masque comme révélateur d''identité : analysez le paradoxe du costume de super-héros.',
  'Pense aux personnages masqués que tu connais. Sont-ils plus eux-mêmes avec ou sans masque ?');

-- ══════════════════════════════════════════════
-- SÉANCE 4 — Les Coulisses
-- ══════════════════════════════════════════════

-- pos 1 — Scene Dune: décor réel vs numérique
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (11, 4, 1, 'coulisses', 'Scène — Dune', 'open',
  'C''est mieux de filmer dans un vrai endroit ou de tout faire sur ordinateur ?',
  'Pour ou contre : tourner en décor réel vs tout en numérique ?',
  'Décor réel ou plateau virtuel : quels sont les avantages et limites de chaque approche ?',
  'Pense à la différence entre un vrai coucher de soleil et un coucher de soleil en CGI.');

-- pos 2 — Citation Paranormal Activity: budget
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (11, 4, 2, 'coulisses', 'Citation — Paranormal Activity', 'open',
  'Un film pas cher peut être un super film ? Pourquoi ?',
  'L''argent fait-il la qualité d''un film ?',
  'Le budget conditionne-t-il la qualité d''un film ? Analysez à travers des exemples concrets.',
  'Pense à des vidéos YouTube qui sont meilleures que certains films à gros budget.');

-- pos 3 — Débat: IA remplace les acteurs
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, options, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (11, 4, 3, 'coulisses', 'Débat — IA & Acteurs', 'closed',
  '[{"key":"daccord","label":"D''accord"},{"key":"pasdaccord","label":"Pas d''accord"},{"key":"nuance","label":"C''est plus nuancé"}]'::jsonb,
  'Les robots vont remplacer les acteurs ? Qu''est-ce que t''en penses ?',
  'D''accord ou pas d''accord : l''IA va remplacer les acteurs dans 10 ans ? Et les réalisateurs ?',
  'L''IA remplacera-t-elle les acteurs et réalisateurs ? Évaluez les implications créatives et éthiques.',
  'Pense à ce qui rend un acteur humain irremplaçable. Ou pas.');

-- pos 4 — Citation Murch: monteur dernier auteur
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (11, 4, 4, 'coulisses', 'Citation — Walter Murch', 'open',
  'Le monteur peut changer tout le film juste en coupant différemment ?',
  'Le monteur peut-il sauver un mauvais film ? Ou détruire un bon ?',
  'Walter Murch qualifie le monteur de « dernier auteur du film ». Discutez cette affirmation.',
  'Pense au montage comme un puzzle : tu peux raconter une autre histoire avec les mêmes pièces.');

-- pos 5 — Poster Black Panther: combien de personnes
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (11, 4, 5, 'coulisses', 'Poster — Black Panther', 'open',
  'À ton avis, combien de personnes il faut pour faire un film comme ça ?',
  'Combien de personnes faut-il pour faire un film ? Devine.',
  'Estimez le nombre de professionnels impliqués dans une production comme Black Panther. Quels métiers identifiez-vous ?',
  'Indice : un gros film, c''est entre 500 et 5000 personnes. Oui, c''est énorme.');

-- pos 6 — Scene Mission Impossible: cascadeur
INSERT INTO situations (module, seance, position, category, restitution_label, question_type, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text)
VALUES (11, 4, 6, 'coulisses', 'Scène — Mission Impossible', 'open',
  'Cascadeur, c''est un métier de rêve ou c''est trop dangereux ?',
  'Cascadeur : métier de rêve ou métier de fou ?',
  'Le métier de cascadeur : passion ou folie ? Discutez les limites entre art et prise de risque.',
  'Tom Cruise fait ses propres cascades. Courageux ou irresponsable ?');
