-- Add variant support: each "position" in a seance can have multiple variants
-- The API picks one variant per position based on a hash of the session ID
ALTER TABLE situations ADD COLUMN IF NOT EXISTS variant INTEGER DEFAULT 0;

-- Drop old unique constraint on (module, seance, position)
ALTER TABLE situations DROP CONSTRAINT IF EXISTS situations_module_seance_position_key;

-- Create new unique index for (module, seance, position, variant)
CREATE UNIQUE INDEX IF NOT EXISTS idx_situations_variant ON situations (module, seance, position, variant);

-- ── Variant 1 (alternatives to existing questions) ───

-- Seance 1, Position 1: Le héros (variant 1)
INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES
(3, 1, 1, 1, 'personnage', 'Le heros',
  'Tu regardes par la fenetre. Tu vois quelqu''un que tu connais dans la rue. C''est qui ? Qu''est-ce qu''il ou elle fait ?',
  'Tu scrolles sur ton telephone. Tu tombes sur la story de quelqu''un. C''est qui ? Qu''est-ce qu''on voit dans cette story ?',
  'Tu es dans un cafe. Quelqu''un entre et tout le monde se retourne. C''est qui ? Decris cette personne.',
  'Ajoute des details — comment il ou elle marche, parle, s''habille ?');

-- Seance 1, Position 2: Son désir (variant 1)
INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES
(3, 1, 2, 1, 'personnage', 'Son desir',
  'Si cette personne pouvait avoir un voeu magique, ce serait quoi ?',
  'La nuit, quand il ou elle peut pas dormir, il ou elle pense toujours a la meme chose. C''est quoi ?',
  'Il y a un truc qui le ou la consume. Un objectif, un reve, une obsession. Ca se voit dans ses yeux. C''est quoi ?',
  'C''est un reve realiste ou completement fou ?');

-- Seance 1, Position 3: Sa faille (variant 1)
INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES
(3, 1, 3, 1, 'personnage', 'Sa faille',
  'Quand il ou elle se met en colere, ca donne quoi ? Il ou elle fait quoi ?',
  'Il ou elle a un truc qui le ou la trahit toujours. Un defaut qu''il ou elle peut pas cacher. C''est quoi ?',
  'Quand la pression monte, son vrai caractere se revele. Qu''est-ce qu''on decouvre ?',
  'Comment ca se manifeste concretement ? Qu''est-ce que les gens voient ?');

-- Seance 1, Position 4: Son secret (variant 1)
INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES
(3, 1, 4, 1, 'personnage', 'Son secret',
  'Dans sa chambre, il y a un objet cache que personne connait. C''est quoi ?',
  'Il ou elle a menti sur un truc important. C''etait quoi ce mensonge ?',
  'Il y a un evenement du passe qu''il ou elle a efface de sa vie. Qu''est-ce qui s''est passe ?',
  'Pourquoi c''est si important de garder ca secret ?');

-- Seance 1, Position 5: Le meilleur ami (variant 1)
INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES
(3, 1, 5, 1, 'liens', 'Le meilleur ami',
  'Il ou elle a un compagnon fidele. Ca peut etre un humain, un animal, un objet... C''est quoi ? Pourquoi c''est special ?',
  'Il y a une personne qui decroche toujours quand il ou elle appelle a 3h du matin. C''est qui ?',
  'Il y a quelqu''un qui connait tous ses secrets. Quelqu''un pour qui il ou elle ferait n''importe quoi. C''est qui ?',
  'Comment cette personne reagit quand notre heros a des problemes ?');

-- Seance 1, Position 6: Le rival (variant 1)
INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES
(3, 1, 6, 1, 'liens', 'Le rival',
  'Il y a quelqu''un qui essaie toujours de faire mieux que lui ou elle. C''est qui ?',
  'Il y a quelqu''un qui le ou la rend dingue. Pas mechant mais toujours en travers du chemin. C''est qui ?',
  'Il y a une personne qui represente tout ce qu''il ou elle deteste. Ou tout ce qu''il ou elle voudrait etre. C''est qui ?',
  'C''est de la jalousie ? De la haine ? Du respect ? Un peu de tout ?');

-- Seance 1, Position 7: Le lieu (variant 1)
INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES
(3, 1, 7, 1, 'environnement', 'Le lieu',
  'Il ou elle a un endroit prefere ou il ou elle va toujours. C''est ou ? C''est comment ?',
  'Il y a un endroit dans le quartier ou tout le monde se retrouve. C''est ou ? Ca ressemble a quoi ?',
  'Il y a un lieu qui definit cette histoire. Un lieu charge d''emotion. C''est lequel ? Decris-le.',
  'Quels sons, quelles odeurs, quelles couleurs ?');

-- Seance 1, Position 8: L'ambiance (variant 1)
INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES
(3, 1, 8, 1, 'environnement', 'L''ambiance',
  'C''est quoi la musique qu''on entendrait si c''etait un film ? C''est joyeux, triste, effrayant ?',
  'Si tu devais choisir une couleur pour cette histoire, ce serait laquelle ? Pourquoi ?',
  'Imagine la bande-son de cette scene d''ouverture. C''est quoi l''ambiance ? Le tempo ? L''emotion ?',
  'Imagine qu''on regarde cette scene au cinema. On ressent quoi ?');

-- ── Seance 2 variants ───

-- Seance 2, Position 1: Le déclencheur (variant 1)
INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES
(3, 2, 1, 1, 'conflit', 'Le declencheur',
  'Un jour, il se passe un truc bizarre. Un truc qui change tout. C''est quoi ?',
  'Un message arrive sur le telephone de notre heros. Quelque chose qui va tout chambouler. C''est quoi ce message ?',
  'Un evenement inattendu fait voler en eclats la routine. Quelque chose que personne n''avait vu venir. C''est quoi ?',
  'C''est grave ? C''est excitant ? Les deux a la fois ?');

-- Seance 2, Position 2: L'obstacle (variant 1)
INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES
(3, 2, 2, 1, 'conflit', 'L''obstacle',
  'Il ou elle veut faire quelque chose mais ca marche pas. Pourquoi ca bloque ?',
  'Il ou elle essaie, mais quelqu''un ou quelque chose l''empeche d''avancer. C''est quoi cet obstacle ?',
  'Le premier plan echoue. Quelque chose de plus grand s''oppose. C''est quoi cette force contraire ?',
  'C''est un obstacle physique ? Emotionnel ? Les deux ?');

-- Seance 2, Position 3: La trahison (variant 1)
INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES
(3, 2, 3, 1, 'conflit', 'La trahison',
  'Quelqu''un fait un truc pas gentil a notre heros. C''est qui ? Il ou elle fait quoi ?',
  'Notre heros decouvre que quelqu''un lui a menti. C''est qui ? C''etait quoi le mensonge ?',
  'La confiance est brisee. Quelqu''un qu''il ou elle croyait fiable a trahi. Comment ? Pourquoi ?',
  'Comment notre heros reagit en decouvrant ca ?');

-- Seance 2, Position 4: Le choix (variant 1)
INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES
(3, 2, 4, 1, 'trajectoire', 'Le choix',
  'Il ou elle doit choisir entre deux choses. C''est quoi les deux choses ?',
  'Il y a un choix impossible a faire. Deux options, et aucune n''est parfaite. Lesquelles ?',
  'Le dilemme se pose. Deux chemins, chacun avec son prix. C''est quoi ce choix qui change tout ?',
  'Qu''est-ce qu''il ou elle perd dans chaque cas ?');

-- Seance 2, Position 5: La montée (variant 1)
INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES
(3, 2, 5, 1, 'trajectoire', 'La montee',
  'Les choses deviennent de pire en pire. Qu''est-ce qui se passe ensuite ?',
  'La situation s''aggrave. Un deuxieme probleme arrive par-dessus le premier. C''est quoi ?',
  'L''etau se resserre. Les consequences s''enchainent. Qu''est-ce qui empire ?',
  'Comment notre heros reagit a cette escalade ?');

-- Seance 2, Position 6: Le point bas (variant 1)
INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES
(3, 2, 6, 1, 'conflit', 'Le point bas',
  'C''est le pire moment. Notre heros est tout seul et tres triste. Qu''est-ce qui se passe ?',
  'C''est le fond. Le moment ou tout semble perdu. Qu''est-ce que notre heros pense a ce moment-la ?',
  'Le point de non-retour. Tout s''effondre. Decris ce moment de solitude absolue.',
  'Est-ce que quelqu''un est la avec lui ou elle ? Ou est-ce completement seul ?');

-- Seance 2, Position 7: Le sursaut (variant 1)
INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES
(3, 2, 7, 1, 'trajectoire', 'Le sursaut',
  'Mais la, il ou elle a une idee ! C''est quoi cette idee ?',
  'Au moment ou tout semble foutu, un declic. Quelque chose change. C''est quoi ?',
  'Dans les tenebres, une etincelle. Un sursaut inattendu. Qu''est-ce qui provoque ce retournement ?',
  'C''est grace a quelqu''un ? A un souvenir ? A une prise de conscience ?');

-- Seance 2, Position 8: La confrontation (variant 1)
INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES
(3, 2, 8, 1, 'conflit', 'La confrontation',
  'Notre heros doit affronter le probleme. Comment il ou elle s''y prend ?',
  'C''est l''heure de la confrontation. Notre heros fait face. Comment ?',
  'Le moment de verite. Face a face avec l''obstacle. Comment notre heros prend les choses en main ?',
  'Il ou elle est seul ou accompagne pour ce moment ?');

-- ── Seance 3 variants ───

-- Seance 3, Position 1: La résolution (variant 1)
INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES
(3, 3, 1, 1, 'trajectoire', 'La resolution',
  'Notre heros reussit a regler le probleme. Comment il ou elle fait ?',
  'Le probleme se resout. Pas forcement comme prevu. Comment ca se passe ?',
  'Le denouement arrive. La resolution n''est peut-etre pas celle qu''on attendait. Comment ca finit ?',
  'C''est une victoire complete ou un compromis ?');

-- Seance 3, Position 2: Le prix payé (variant 1)
INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES
(3, 3, 2, 1, 'trajectoire', 'Le prix paye',
  'Ca a marche mais notre heros a perdu quelque chose. C''est quoi ?',
  'La victoire a un cout. Qu''est-ce que notre heros a du sacrifier ?',
  'Chaque victoire a son prix. Qu''est-ce que cette aventure a coute a notre heros ?',
  'Est-ce que ca valait le coup ?');

-- Seance 3, Position 3: La leçon (variant 1)
INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES
(3, 3, 3, 1, 'intention', 'La lecon',
  'Notre heros a appris un truc important. C''est quoi ?',
  'Apres tout ca, notre heros voit les choses differemment. Qu''est-ce qui a change en lui ou elle ?',
  'Cette epreuve a transforme notre heros. Quelle verite il ou elle a comprise sur lui-meme ou le monde ?',
  'Est-ce que les autres ont remarque ce changement ?');

-- Seance 3, Position 4: La dernière scène (variant 1)
INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES
(3, 3, 4, 1, 'renforcement', 'La derniere scene',
  'Imagine la derniere image du film. On voit quoi ? C''est ou ? Il ou elle fait quoi ?',
  'Derniere scene. La camera recule doucement. Qu''est-ce qu''on voit ? Ou est notre heros ?',
  'Le plan final. La derniere image que le spectateur emporte avec lui. Decris-la.',
  'C''est un plan large ou un gros plan ? De jour ou de nuit ?');

-- Seance 3, Position 5: Le titre (variant 1)
INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES
(3, 3, 5, 1, 'renforcement', 'Le titre',
  'Comment il s''appelle ce film ? Invente un titre !',
  'L''ecran s''eteint. Le titre apparait. C''est quoi le titre de ce film ?',
  'Generique de fin. Le titre s''affiche en grand. Quel est le titre de cette histoire ?',
  'Pourquoi ce titre ? Il fait reference a quoi dans l''histoire ?');
