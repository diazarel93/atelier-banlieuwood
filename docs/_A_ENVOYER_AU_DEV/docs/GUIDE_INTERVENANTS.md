# Guide intervenants — Rôles et accès — Banlieuwood
> Extrait à l'usage du développeur — Cycle 1
> Document complet : `GUIDE_INTERVENANTS_BANLIEUWOOD.docx` (dossier 04_partenaires_financement)

---

## Les deux rôles du dispositif

Banlieuwood ne fonctionne pas avec un seul profil "facilitateur/enseignant". Le dispositif implique **deux acteurs distincts**, avec des postures, des temporalités et des besoins data radicalement différents.

---

## Rôle 1 — L'intervenant

**Qui :** Animateur externe, membre de l'équipe Banlieuwood ou formé par elle. Pas un enseignant.

**Quand :** Pendant la séance, en classe.

**Posture :** Il pilote la séance en temps réel. Il gère le rythme, les transitions, les votes, les révélations. Il ne juge pas les élèves — il anime.

**Ce dont il a besoin dans l'outil :**
- Cockpit temps réel : voir qui a répondu, suivre le rythme de participation (global, pas individuel)
- Lancer et contrôler les phases (vote, révélation, module suivant)
- Avoir un signal simple si un élève n'a pas répondu depuis longtemps (factuel, non nominatif si possible)
- Accès rapide aux modules actifs de la séance

**Ce qu'il NE doit PAS voir :**
- Les scores ou niveaux individuels des élèves
- Un tableau comparatif entre élèves
- Des données de séances passées (il intervient séance par séance)
- Un dashboard de tendances pédagogiques (ce n'est pas son rôle)

**Interface :** Cockpit séance (vue active pendant la séance uniquement).

---

## Rôle 2 — Le professeur

**Qui :** L'enseignant de la classe. Il connaît ses élèves. Il n'est généralement pas formé Banlieuwood.

**Quand :** Après la séance. Il n'utilise pas l'outil pendant que les élèves jouent.

**Posture :** Il observe les tendances de sa classe sur la durée. Il peut utiliser les données de Banlieuwood pour enrichir son regard pédagogique — pas pour noter ou évaluer.

**Ce dont il a besoin dans l'outil :**
- Dashboard post-séance avec tendances de groupe (choix majoritaires, dynamiques émergentes)
- Extraits anonymes de productions collectives
- Évolution du groupe sur plusieurs séances (à partir de la Famille 2)
- Compte rendu de séance exportable (anonymisé)

**Ce qu'il NE doit PAS voir :**
- Le cockpit temps réel de l'intervenant
- Les scores ou niveaux d'élèves identifiables
- Des données permettant d'inférer la performance individuelle d'un élève

**Interface :** Dashboard professeur (accès post-séance, données agrégées).

---

## Implications d'architecture

| Point | Conséquence pour le code |
|---|---|
| 2 rôles distincts | 2 comptes avec des droits différents — pas un compte unique polyvalent |
| Temporalités différentes | Le cockpit = pendant la séance / Le dashboard = après la séance — pas la même page |
| Données différentes | L'intervenant voit des signaux de séance / Le professeur voit des tendances de groupe agrégées |
| Accès différenciés | Un professeur ne doit pas avoir accès au cockpit / Un intervenant ne doit pas voir le dashboard |

**Pour Terrain 1 (F0 — séance courte) :** Si les deux rôles sont tenus par la même personne physique, un seul compte peut suffire temporairement. Mais l'architecture doit distinguer les deux rôles dès maintenant pour que la séparation soit possible sans refonte lors du déploiement réel.

---

## Résumé en une phrase

> L'intervenant pilote la séance en direct. Le professeur lit les tendances après. Ces deux besoins ne sont pas le même outil.

---

*Extrait produit le 21 mars 2026 — Banlieuwood — Pont développeur Cycle 1.*
*Se référer au document complet GUIDE_INTERVENANTS_BANLIEUWOOD.docx pour la doctrine complète.*
