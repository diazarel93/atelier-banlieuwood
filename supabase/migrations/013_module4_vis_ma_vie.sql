-- ============================================
-- Module 4 — "Vis ma vie" (Identité créative)
-- 8 questions déguisées en jeu qui construisent
-- personnage + conflit + arc sans que l'élève
-- s'en rende compte.
-- ============================================

-- ── Situations Module 4, Séance 1 ──────────

-- Q1 — Invention (qui est-ce ?)
INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES
(4, 1, 1, 0, 'personnage', 'Le personnage',
  'Regarde cette personne. C''est qui ? Comment elle s''appelle et qu''est-ce qu''elle fait là ?',
  'Tu ne connais pas cette personne. Invente-lui une vie en 2 phrases : son prénom, ce qu''elle fait là, et un truc qu''on remarque chez elle.',
  'Invente ce personnage de zéro. Prénom, raison de sa présence ici, et le détail que tout le monde remarque immédiatement.',
  'Ajoute un détail physique ou un tic qu''on oublie pas.'),
(4, 1, 1, 1, 'personnage', 'Le personnage',
  'Cette personne vient d''arriver. C''est qui ? Qu''est-ce qu''on remarque tout de suite ?',
  'Invente : son prénom, pourquoi elle est là, et le détail que tout le monde remarque chez elle.',
  'Crée ce personnage. Un nom, une raison d''être là, et ce qui le distingue de n''importe qui d''autre.',
  'Qu''est-ce qui le rend impossible à confondre avec quelqu''un d''autre ?');

-- Q2 — Désir/motivation (déguisé en situation fun)
INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES
(4, 1, 2, 0, 'personnage', 'Son désir',
  'Cette personne trouve 10 000€ par terre. C''est quoi la première chose qu''elle fait ?',
  'Elle vient de trouver 10 000€ par terre. C''est quoi la PREMIÈRE chose qu''elle fait ? Et pourquoi ?',
  'Elle trouve 10 000€. Sa réaction immédiate révèle ce qu''elle désire le plus. C''est quoi ?',
  'Pourquoi ça et pas autre chose ? Qu''est-ce que ça dit d''elle ?'),
(4, 1, 2, 1, 'personnage', 'Son désir',
  'On lui propose de réaliser UN vœu. N''importe lequel. Elle demande quoi ?',
  'Un vœu, n''importe lequel. Qu''est-ce qu''elle demande et pourquoi ?',
  'Si elle pouvait changer UNE chose dans sa vie, ce serait quoi ? Et qu''est-ce que ça révèle ?',
  'C''est un rêve réaliste ou complètement fou ?');

-- Q3 — Conflit/obstacle (déguisé en coup de fil)
INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES
(4, 1, 3, 0, 'conflit', 'Son problème',
  'Son téléphone sonne. C''est quelqu''un qu''elle voulait PAS entendre. C''est qui ?',
  'Son téléphone sonne. C''est la SEULE personne qu''elle voulait pas entendre. C''est qui ? Pourquoi ça tombe mal ?',
  'Appel entrant. La seule personne qu''elle redoutait. Qui est-ce et pourquoi ce timing est catastrophique ?',
  'Qu''est-ce qui s''est passé entre eux avant ?'),
(4, 1, 3, 1, 'conflit', 'Son problème',
  'Quelqu''un débarque devant elle sans prévenir. C''est qui ? Qu''est-ce qui se passe ?',
  'Quelqu''un débarque à sa porte sans prévenir. La dernière personne qu''elle voulait voir. Qui ? Et que se passe-t-il ?',
  'Apparition inattendue. La dernière personne qu''elle souhaitait croiser. Qui et pourquoi la tension est immédiate ?',
  'Elle fait quoi en la voyant ? Elle fuit ou elle affronte ?');

-- Q4 — Secret/profondeur (déguisé en geste suspect)
INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES
(4, 1, 4, 0, 'personnage', 'Son secret',
  'Elle regarde derrière elle pour vérifier que personne la voit. Pourquoi ? Elle cache quoi ?',
  'Elle regarde derrière elle pour vérifier que personne ne la voit. Pourquoi ? Qu''est-ce qu''elle cache ?',
  'Un regard par-dessus l''épaule. Elle vérifie que personne ne l''observe. Pourquoi ? Quel secret protège-t-elle ?',
  'Si quelqu''un découvrait ça, il se passerait quoi ?'),
(4, 1, 4, 1, 'personnage', 'Son secret',
  'Dans son sac, il y a un objet que personne doit voir. C''est quoi ?',
  'Dans son sac, il y a un objet que personne ne doit voir. C''est quoi ? Pourquoi elle le garde ?',
  'Un objet caché au fond de son sac. Quelque chose que personne ne doit trouver. Qu''est-ce que c''est et quelle est son histoire ?',
  'Depuis combien de temps elle le cache ?');

-- Q5 — Twist/révision (plot twist)
INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES
(4, 1, 5, 0, 'trajectoire', 'Le twist',
  'Plot twist : tout ce qu''elle a dit depuis le début, c''était un mensonge ! Sur quoi elle a menti ?',
  'Plot twist : tout ce qu''elle a raconté depuis le début, c''était un mensonge. Sur quoi a-t-elle menti ? Pourquoi ?',
  'Retournement total. Tout ce qu''on croyait savoir est faux. Sur quoi a-t-elle menti et quelle est sa vraie motivation ?',
  'Est-ce qu''on peut encore lui faire confiance ?'),
(4, 1, 5, 1, 'trajectoire', 'Le twist',
  'Retournement : elle est pas du tout celle qu''on croyait ! C''est qui en vrai ?',
  'Retournement : elle n''est pas du tout celle qu''on croyait. Qui est-elle VRAIMENT et qu''est-ce qu''elle cherche ?',
  'Révélation. Son identité, ses motivations — tout était une façade. Qui est-elle vraiment et quel est son véritable objectif ?',
  'Qu''est-ce qui change maintenant qu''on sait la vérité ?');

-- Q6 — Relation/confrontation (ascenseur)
INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES
(4, 1, 6, 0, 'liens', 'La confrontation',
  'Elle se retrouve coincée dans un ascenseur avec quelqu''un qu''elle connaît bien. C''est qui ? Qu''est-ce qui se passe ?',
  'Coincée dans un ascenseur avec quelqu''un qu''elle connaît bien. C''est qui ? Raconte ce qui se passe.',
  'Huis clos forcé. Coincée dans un ascenseur avec la personne la plus compliquée de sa vie. Qui ? Et que se passe-t-il quand le silence devient insupportable ?',
  'Ils se parlent ou le silence dit tout ?'),
(4, 1, 6, 1, 'liens', 'La confrontation',
  'Elle croise quelqu''un qu''elle a blessé. Elles se regardent. Que se passe-t-il ?',
  'Elle croise dans la rue la personne qu''elle a le plus blessée dans sa vie. Elles se regardent. Que se passe-t-il ?',
  'Face à face inattendu avec la personne qu''elle a le plus blessée. Un regard. Le temps s''arrête. Que se passe-t-il ?',
  'Est-ce qu''il y a des mots ou juste un regard ?');

-- Q7 — Arc narratif (la fin du film)
INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES
(4, 1, 7, 0, 'trajectoire', 'La fin',
  'C''est la dernière scène du film. L''écran va devenir noir. On voit quoi ? On entend quoi ?',
  'Dernière scène du film. L''écran va devenir noir. Qu''est-ce qu''on voit ? Qu''est-ce qu''on entend ?',
  'Plan final. L''écran s''assombrit. Décris la dernière image et le dernier son que le spectateur emporte avec lui.',
  'C''est un plan large ou un gros plan ? De jour ou de nuit ?'),
(4, 1, 7, 1, 'trajectoire', 'La fin',
  'Dernière image du film. La caméra s''éloigne doucement. On voit quoi ?',
  'Dernière image du film. La caméra s''éloigne doucement. Qu''est-ce qu''on voit et qu''est-ce que le spectateur ressent ?',
  'La caméra recule lentement. Le dernier plan. Décris ce qu''on voit et l''émotion qui reste quand l''écran s''éteint.',
  'Le spectateur sort de la salle. Il pense à quoi ?');

-- Q8 — Pitch/synthèse (vendre le film)
INSERT INTO situations (module, seance, position, variant, category, restitution_label, prompt_6_9, prompt_10_13, prompt_14_18, nudge_text) VALUES
(4, 1, 8, 0, 'intention', 'Le pitch',
  'Tu dois convaincre ton meilleur pote d''aller voir ce film. Tu lui dis quoi ?',
  'Tu dois convaincre ton meilleur pote d''aller voir ce film. Tu lui dis quoi en UNE phrase pour lui donner envie ?',
  'Pitch en une phrase. Tu dois convaincre quelqu''un de voir ce film. Une seule phrase, percutante, inoubliable.',
  'Ça donne envie ou pas ? Relis ta phrase.'),
(4, 1, 8, 1, 'intention', 'Le pitch',
  'C''est l''affiche du film. Il y a UNE phrase en bas pour donner envie. C''est quoi ?',
  'C''est l''affiche du film. En bas, il y a UNE phrase d''accroche pour donner envie aux gens. Écris-la.',
  'Tagline de l''affiche. Une phrase qui capture l''essence du film et donne envie de tout plaquer pour aller le voir.',
  'Les meilleurs titres créent un mystère. Le tien aussi ?');
