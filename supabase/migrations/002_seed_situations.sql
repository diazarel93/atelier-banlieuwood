-- ============================================
-- MODULE 3 — Les 21 situations
-- Version college (10-13) comme reference
-- Versions primaire et lycee = placeholders a remplacer par Adrian
-- ============================================

-- ── Seance 1 : "C'est l'histoire de qui ?" ───

INSERT INTO situations (module, seance, position, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES

(3, 1, 1, 'personnage', 'Le heros',
  'Imagine un enfant de ton age. Il ou elle vit pas loin d''ici. C''est qui ? C''est un garcon ou une fille ? Il ou elle est comment ?',
  'T''es dans le bus. Tu vois quelqu''un que tu connais bien. C''est qui ? Il ou elle a l''air comment aujourd''hui ?',
  'Quelqu''un sort d''un immeuble. Il ou elle a l''air presse. Tu le ou la connais. C''est qui ? Decris ce que tu vois.',
  'Donne un peu plus de details — il ou elle a quel age ? Comment il ou elle est habille ?'),

(3, 1, 2, 'personnage', 'Son desir',
  'Cette personne, il y a un truc qu''elle veut vraiment vraiment. C''est quoi ?',
  'Cette personne, tout le monde sait qu''il ou elle veut un truc depuis longtemps. C''est quoi ?',
  'Il y a quelque chose que cette personne poursuit depuis longtemps. Quelque chose qui compte vraiment. C''est quoi ?',
  'C''est quoi exactement ce truc ? Pourquoi c''est important pour lui ou elle ?'),

(3, 1, 3, 'personnage', 'Sa faille',
  'Les gens autour de lui ou elle, ils disent souvent la meme chose sur lui ou elle. Ils disent quoi ?',
  'Ses proches, dans son dos, disent toujours la meme chose sur lui ou elle. Ils disent quoi ?',
  'Ceux qui le ou la connaissent bien savent qu''il y a un truc qui revient toujours. Un defaut, une fragilite. C''est quoi ?',
  'C''est quoi cette chose que tout le monde remarque ?'),

(3, 1, 4, 'personnage', 'Son secret',
  'Il ou elle a un secret. Personne le sait. C''est quoi ce secret ?',
  'Il ou elle a un secret que personne connait. C''est quoi ?',
  'Il y a quelque chose que cette personne n''a jamais dit a personne. C''est quoi ?',
  'Pourquoi il ou elle le cache ? Qu''est-ce qui se passerait si quelqu''un le decouvrait ?'),

(3, 1, 5, 'liens', 'Le meilleur ami',
  'Il ou elle a un meilleur copain ou une meilleure copine. C''est qui ? Comment ils se sont rencontres ?',
  'Il ou elle a une personne de confiance, quelqu''un qui est toujours la. C''est qui ? Comment ils se sont rencontres ?',
  'Il y a une personne a qui il ou elle fait confiance. Quelqu''un de fidele. C''est qui ? Qu''est-ce qui les lie ?',
  'Raconte comment ils se sont rencontres, ou comment ils sont devenus proches.'),

(3, 1, 6, 'liens', 'Le rival',
  'Y''a quelqu''un avec qui ca se passe pas bien. C''est qui ? Pourquoi ils s''entendent pas ?',
  'Y''a quelqu''un avec qui ca passe pas. C''est qui ? C''est quoi le probleme entre eux ?',
  'Il y a une personne avec qui la tension est permanente. C''est qui ? Qu''est-ce qui les oppose ?',
  'C''est quoi exactement le probleme entre eux ? Ca a commence comment ?'),

(3, 1, 7, 'environnement', 'Le lieu',
  'Quand il ou elle sort de chez lui ou elle le matin, il ou elle voit quoi dehors ?',
  'Quand il ou elle sort de chez lui ou elle le matin, il ou elle voit quoi ? Entend quoi ? Sent quoi ?',
  'Decris le premier pas dehors le matin. Qu''est-ce qu''il ou elle voit, entend, ressent en sortant de chez lui ou elle ?',
  'Decris les sons, les odeurs, ce que tu vois autour.'),

(3, 1, 8, 'environnement', 'L''ambiance',
  'C''est quel genre d''endroit ou il ou elle vit ? Les gens sont comment la-bas ?',
  'C''est quel genre de quartier ou endroit ? Les gens sont comment la-bas ?',
  'Quel est l''atmosphere de cet endroit ? Comment les gens vivent la-bas ? Qu''est-ce qui rend ce lieu unique ?',
  'Les gens se connaissent ? C''est plutot calme ou agite ?');

-- ── Seance 2 : "Il se passe quoi ?" ──────────

INSERT INTO situations (module, seance, position, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES

(3, 2, 1, 'conflit', 'Le probleme',
  'Un jour, il se passe quelque chose de pas normal. C''est quoi ?',
  'Un matin, il ou elle recoit un message qui change tout. C''est quoi ce message ?',
  'Un evenement inattendu vient tout bouleverser. Qu''est-ce qui s''est passe exactement ?',
  'C''est quoi ce message ou cet evenement ? Qu''est-ce que ca change ?'),

(3, 2, 2, 'conflit', 'L''obstacle',
  'Il ou elle veut arranger les choses, mais y''a un truc qui empeche. C''est quoi ?',
  'Il ou elle veut regler le probleme, mais y''a un truc qui bloque. C''est quoi ?',
  'Il ou elle voudrait agir, mais quelque chose l''en empeche. C''est quoi cet obstacle ?',
  'Pourquoi c''est difficile ? Qu''est-ce qui rend la situation compliquee ?'),

(3, 2, 3, 'conflit', 'L''adversaire',
  'Quelqu''un veut pas que ca s''arrange. C''est qui ?',
  'Quelqu''un veut pas que ca s''arrange. C''est qui ? Pourquoi cette personne bloque ?',
  'Il y a quelqu''un qui s''oppose. Qui est cette personne ? Qu''est-ce qui la motive ?',
  'Pourquoi cette personne fait ca ? C''est quoi son interet ?'),

(3, 2, 4, 'trajectoire', 'Premier essai',
  'Il ou elle essaie un truc pour s''en sortir. Ca marche ou pas ?',
  'Il ou elle essaie un truc pour s''en sortir. Ca marche ? Ou ca empire ?',
  'Il ou elle tente quelque chose. Raconte cette premiere tentative. Ca donne quoi ?',
  'Raconte ce qui se passe quand il ou elle essaie.'),

(3, 2, 5, 'trajectoire', 'Le dilemme',
  'Son meilleur ami a fait une betise. Quelqu''un pose des questions. Il ou elle fait quoi ?',
  'Son meilleur pote a fait un truc grave. La police pose des questions. Il ou elle fait quoi ?',
  'Quelqu''un de proche a fait quelque chose de grave. On lui demande de parler. Il ou elle fait quoi ?',
  'Il ou elle dit la verite ? Il ou elle ment ? Pourquoi ?'),

(3, 2, 6, 'trajectoire', 'Le choix impossible',
  'Il ou elle doit choisir entre deux choses. Les deux sont importantes. C''est quoi ?',
  'Il ou elle doit choisir entre deux trucs. Les deux comptent enormement. C''est quoi les deux options ?',
  'Il ou elle est face a un choix impossible. Deux options, aussi importantes l''une que l''autre. Lesquelles ?',
  'Qu''est-ce qu''il ou elle perd dans chaque cas ?'),

(3, 2, 7, 'trajectoire', 'Le moment de verite',
  'C''est le grand moment. Tout le monde regarde. Il ou elle fait quoi ?',
  'Tout le monde le ou la regarde. C''est maintenant ou jamais. Il ou elle fait quoi ?',
  'Le moment decisif est arrive. Plus moyen de reculer. Qu''est-ce qu''il ou elle fait ?',
  'Decris la scene. Qu''est-ce qui se passe exactement ?'),

(3, 2, 8, 'trajectoire', 'Apres',
  'C''est fini. Comment il ou elle se sent maintenant ? Il ou elle a change ?',
  'C''est fini. Comment il ou elle est maintenant ? Il ou elle a change en quoi ?',
  'Tout est termine. En quoi cette personne est differente de celle du debut ? Qu''est-ce qui a change en lui ou elle ?',
  'Il ou elle regrette quelque chose ? Il ou elle a appris quoi ?');

-- ── Seance 3 : "Ca raconte quoi en vrai ?" ───

INSERT INTO situations (module, seance, position, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES

(3, 3, 1, 'intention', 'Le pitch',
  'Si tu devais raconter cette histoire en une seule phrase, tu dirais quoi ?',
  'Ton pote te demande "c''est quoi ton film en une phrase ?" Tu reponds quoi ?',
  'En une phrase, c''est quoi cette histoire ? Le genre de phrase qu''on met sur l''affiche.',
  'Essaie de tout resumer en une seule phrase, la plus courte possible.'),

(3, 3, 2, 'intention', 'L''emotion',
  'Quelqu''un regarde ce film. A la fin, il est comment ? Il ressent quoi ?',
  'Quelqu''un sort du cine apres avoir vu ton film. Il est comment ? Il ressent quoi ?',
  'Un spectateur sort de la salle. Qu''est-ce qu''il ressent ? Quel etat d''esprit ?',
  'Il est triste ? Content ? En colere ? Surpris ? Pourquoi ?'),

(3, 3, 3, 'intention', 'Le message',
  'En vrai, cette histoire elle parle de quoi ? C''est quoi le vrai sujet ?',
  'Si quelqu''un dit "en vrai ce film il parle de quoi ?", tu reponds quoi ?',
  'Au-dela de l''intrigue, de quoi parle vraiment cette histoire ? Quel est le vrai sujet ?',
  'C''est pas juste l''histoire en surface — c''est quoi le vrai theme ?'),

(3, 3, 4, 'renforcement', 'La scene cle',
  'Quelle est la scene la plus importante ? Raconte-la comme si tu la voyais.',
  'Quelle est la scene que tout le monde va retenir ? Decris-la comme si tu la voyais.',
  'Il y a une scene qui resume tout le film. Celle dont tout le monde parlerait en sortant. Decris-la.',
  'Decris ce qu''on voit, ce qu''on entend. Comme si c''etait un film.'),

(3, 3, 5, 'renforcement', 'Le titre',
  'Ton film s''appelle comment ?',
  'Ton film s''appelle comment ?',
  'Quel titre tu donnes a ce film ?',
  'Un mot, deux mots, trois mots — le titre qui resume tout.');
