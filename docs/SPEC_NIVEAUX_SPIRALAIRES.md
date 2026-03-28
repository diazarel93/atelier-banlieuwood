# Spec Technique — 4 Niveaux Spiralaires
## Banlieuwood — Reference implementation

**Objet** : definir pour chaque module M1-M8 les 4 niveaux de profondeur qui permettent a un eleve de refaire Banlieuwood sans repeter la meme experience.
**Usage** : parametre de session `depth: "decouverte" | "exploration" | "maitrise" | "auteur"` qui controle les prompts, la duree, le vocabulaire et les attendus.

---

## Principe general

| Niveau | Age cible | Qui | Posture eleve |
|--------|-----------|-----|---------------|
| **Decouverte** | CM1-6e (9-11 ans) | Premiere fois, jamais fait Banlieuwood | Je decouvre, je fais avec plaisir |
| **Exploration** | 5e-4e (12-13 ans) | A deja fait 1 atelier, ou collegien mature | Je comprends mieux, je veux aller plus loin |
| **Maitrise** | 3e-2nde (14-16 ans) | A deja fait 2+ ateliers, ou lyceen | Je maitrise les bases, je veux de l'autonomie |
| **Auteur** | 1re-Tle (16-18 ans) | Lyceen avance ou returnee confirme | J'ai un regard, je veux l'affirmer |

**Regle** : le niveau n'est pas lie strictement a l'age. Un collegien de 4e qui fait Banlieuwood pour la premiere fois est en Decouverte. Un CM2 qui revient pour la 3e fois peut etre en Maitrise sur certains modules. Le parametrage est a la discretion de l'intervenant.

---

## M1 — OBSERVER (Le Regard)

### Ce qui change

| Dimension | Decouverte | Exploration | Maitrise | Auteur |
|-----------|-----------|-------------|----------|--------|
| **Question cle** | "Que vois-tu ?" | "Quel effet ca te fait ?" | "Quel choix de mise en scene ?" | "Quelle intention d'auteur ?" |
| **Images** | 3 images narratives simples (situations reconnaissables : rue, interieur, banc) | 3 images avec ambiguite visuelle (cadrage inhabituel, lumiere expressive) | 3 extraits video courts (30s) au lieu d'images fixes | 1 sequence longue (2-3 min) — analyse de mise en scene complete |
| **Consigne d'ecriture** | "Raconte ce que tu vois et ce qui pourrait se passer" (5 lignes min) | "Decris ce que tu ressens et pourquoi l'image produit cet effet" (10 lignes) | "Identifie 2 choix du photographe/realisateur et explique leur impact" (15 lignes) | "Analyse l'intention de l'auteur : que veut-il nous faire comprendre, et comment ?" (20 lignes) |
| **Confrontation** | 2 textes anonymes lus par l'intervenant | 3 textes, les eleves identifient les differences | Les eleves choisissent eux-memes les textes a confronter | Debat structure : 2 interpretations opposees, les eleves argumentent |
| **Vocabulaire** | Personnage, lieu, histoire, emotion | Cadrage, lumiere, premier plan / arriere-plan | Plan (large/moyen/gros), hors-champ, point de vue | Mise en scene, montage, ellipse, symbole, sous-texte |
| **Duree** | 50 min (5 seances courtes) | 50 min | 60 min (extraits video + analyse) | 75 min (sequence + debat) |

### Prompts

**Positionnement (m1a) :**
- Decouverte : "Reponds par instinct, y'a pas de mauvaise reponse !" (8 QCM simples)
- Exploration : "Prends le temps de reflechir — chaque reponse dit quelque chose de toi" (8 QCM + 2 ouvertes)
- Maitrise : "Ces questions vont t'aider a comprendre comment tu regardes les images" (6 QCM + 4 ouvertes)
- Auteur : "Avant de creer, il faut savoir d'ou on regarde. Definis ton regard." (4 QCM + 6 ouvertes reflexives)

**Image (m1b-d) :**
- Decouverte : "Imagine ce qui se passe. Ecris tout ce qui te vient."
- Exploration : "Qu'est-ce que cette image te fait ressentir ? Pourquoi ?"
- Maitrise : "Qu'est-ce que le photographe/realisateur a choisi de montrer ? Qu'est-ce qu'il a choisi de cacher ?"
- Auteur : "Si tu devais refaire cette image pour raconter autre chose, que changerais-tu et pourquoi ?"

**Carnet d'idees (m1e) :**
- Decouverte : "Note une scene que tu as vue dans la vraie vie — une dispute, un moment bizarre, quelque chose de drole."
- Exploration : "Note une scene reelle ET imagine comment un realisateur la filmerait."
- Maitrise : "Note une scene reelle. Decris le cadrage, la lumiere, le son que tu choisirais pour la filmer."
- Auteur : "Note une scene reelle. Ecris-la comme une scene de scenario : lieu, personnages, actions, dialogues."

---

## M2 — COMPRENDRE (La Scene)

### Ce qui change

| Dimension | Decouverte | Exploration | Maitrise | Auteur |
|-----------|-----------|-------------|----------|--------|
| **Question cle** | "Content ou triste ?" | "Quelle emotion cachee ?" | "Pourquoi cette emotion fonctionne ?" | "Comment la mise en scene cree l'emotion ?" |
| **Emotion Cachee** | 5 emotions simples, 5 slots, max 8 jetons | 7 emotions (+ frustration, nostalgie), 5 slots, max 10 jetons | 7 emotions, 6 slots, max 12 jetons + contrainte ("utilise un silence") | Emotion libre (l'eleve nomme), 7 slots, max 15 jetons + 2 contraintes |
| **Jetons disponibles** | Tier 1-2 uniquement (dialogue, close-up, musique, silence, objet) | Tous tiers (tier 3 : mensonge, revelation, secret) | Tous tiers + jetons avances (ellipse, flashback, montage parallele) | Tous + jetons "auteur" (voix off, metafiction, rupture de ton) |
| **Phase collective** | 2 scenes confrontees, l'intervenant anime | 3 scenes, les eleves votent pour la plus efficace | Les eleves analysent POURQUOI une scene fonctionne mieux | Les eleves reecrivent une scene "ratee" pour l'ameliorer |
| **Duree** | 80 min | 80 min | 90 min | 100 min |

### Prompts Emotion Cachee

- Decouverte : "Choisis une emotion et construis ta scene avec les jetons. Y'a pas de mauvaise combinaison !"
- Exploration : "Choisis une emotion. Mais attention — l'emotion ne doit pas etre dite. Elle doit etre MONTREE par la scene."
- Maitrise : "Choisis une emotion. Contrainte : utilise au moins un silence et un gros plan. L'emotion passe par ce qu'on ne dit pas."
- Auteur : "Nomme ton emotion (elle n'est pas dans la liste). Construis une scene ou l'emotion est presente mais jamais nommee. Le spectateur doit la deviner."

---

## M3 — IMAGINER (Et si...)

### Ce qui change

| Dimension | Decouverte | Exploration | Maitrise | Auteur |
|-----------|-----------|-------------|----------|--------|
| **Question cle** | "Et si..." (libre) | "Et si... mais avec une contrainte" | "Et si... dans un genre donne" | "Et si... avec un propos" |
| **Images** | 10 images "legerement desequilibrees" (banc, fenetre, escalier...) | 10 images + indication de genre (thriller, comedie, drame) | 6 images + contrainte narrative ("ton histoire commence par la fin") | 3 images + exigence de propos ("que veut dire ton film ?") |
| **Ecriture** | "Et si..." — 1 phrase minimum | "Et si..." — 3 phrases minimum, avec un personnage nomme | "Et si..." — 5 phrases, avec personnage + enjeu + genre | "Et si..." — 10 phrases, avec personnage + enjeu + propos + ton |
| **Aide** | 3 niveaux (exemple, reformulation, amorce) — activable par intervenant | 2 niveaux seulement (reformulation, amorce) — moins d'aide | 1 niveau (amorce seulement) | Pas d'aide — l'auteur se debrouille |
| **QCM narratifs** | 5 QCM simples (ton, personnage, declencheur, format, fin) | 5 QCM + 1 ouverte ("decris le monde de ton histoire") | 3 QCM + 3 ouvertes (monde, ton, sous-texte) | 1 QCM (ton) + 5 ouvertes (monde, personnage, enjeu, propos, premiere scene) |
| **Banque d'idees** | Partage volontaire + upvote | Partage + upvote + commentaire court (1 phrase) | Partage + commentaire argumente + suggestion d'amelioration | Partage + critique constructive structuree (3 phrases : ce qui marche / ce qui manque / une idee) |
| **Duree** | 25 min | 30 min | 40 min | 50 min |

---

## M4 — CLARIFIER (Le Pitch)

### Ce qui change

| Dimension | Decouverte | Exploration | Maitrise | Auteur |
|-----------|-----------|-------------|----------|--------|
| **Avatar** | DiceBear complet, 8 traits simples | DiceBear + biographie courte (3 lignes) | DiceBear + biographie + motivation profonde | DiceBear + biographie + motivation + defaut + contradiction |
| **Objectif/Obstacle** | 8 types pre-definis au choix | 8 types + option "custom" (ecrire le sien) | Seulement "custom" — pas de types pre-definis | Custom + exigence de nuance ("l'obstacle vient aussi du personnage lui-meme") |
| **Pitch** | "[Prenom] veut [objectif]. Mais [obstacle]. Alors [resolution]." — formule a trous, 15-30s | Meme formule, 30s, + "parce que" (motivation) | Formule libre, 1 min, doit inclure : personnage, enjeu, obstacle, ton, intention | Pitch libre 2 min : defense du projet ("je veux raconter X parce que Y, et je le fais en Z") |
| **Chrono** | 30 secondes | 30 secondes | 60 secondes | 120 secondes |
| **Confrontation** | 2 pitchs anonymes, 3 questions de clarification | 3 pitchs, vote du plus clair | Les eleves posent eux-memes les questions de clarification | Debat : "est-ce que ce film merite d'etre fait ? pourquoi ?" (bienveillant mais exigeant) |
| **Duree** | 30 min | 35 min | 45 min | 60 min |

### Prompt Pitch

- Decouverte : "Remplis les trous : [Prenom] veut ____. Mais ____. Alors ____. C'est tout !"
- Exploration : "Meme formule, mais ajoute POURQUOI ton personnage veut ca. La motivation rend l'histoire vraie."
- Maitrise : "Oublie la formule. Raconte ton film en 1 minute comme si tu voulais convaincre un producteur."
- Auteur : "Tu as 2 minutes. Dis-nous quel film tu veux faire, pourquoi il doit exister, et comment tu comptes le raconter."

---

## M5 — CONSTRUIRE (Construction Collective)

### Ce qui change

| Dimension | Decouverte | Exploration | Maitrise | Auteur |
|-----------|-----------|-------------|----------|--------|
| **Nombre de manches** | 8 (ton, situation, personnages, objectif, obstacle, 1re scene, relation, moment fort) | 8 manches identiques | 8 manches + 1 manche bonus ("le theme profond") | 8 manches + 2 bonus ("theme profond" + "premiere et derniere image du film") |
| **Cartes par manche** | 4 (max 6 pour personnages) | 4-6 | 4-6 + les eleves peuvent proposer des cartes supplementaires en direct | Les eleves redigent eux-memes les cartes (pas d'extraction automatique) |
| **Debat apres vote** | Pas de debat — l'intervenant commente le resultat | 2 min de debat court : "pourquoi ce choix ?" | 5 min de debat argumente : les eleves defendent avec des references | 10 min de deliberation : les eleves peuvent proposer de fusionner des cartes |
| **Veto intervenant** | Oui (protection pedagogique) | Oui mais justifie a voix haute | Rarement — les eleves gerent | Jamais sauf violence/discrimination |
| **Duree** | 30 min | 35 min | 45 min | 60 min |

### Prompt introduction

- Decouverte : "On va construire le film de la classe ensemble. Chaque manche, vous votez. Le plus vote gagne !"
- Exploration : "Vos idees des modules precedents sont la. On va les assembler par vote. Apres chaque vote, on discute vite : pourquoi ce choix ?"
- Maitrise : "Vos idees sont sur les cartes. Votez, puis argumentez. Si vous pensez qu'une combinaison est meilleure, dites-le."
- Auteur : "Aujourd'hui c'est vous qui decidez. Vous redigez les cartes, vous debattez, vous tranchez. L'intervenant observe."

---

## M6 — ECRIRE (Le Scenario)

### Ce qui change

| Dimension | Decouverte | Exploration | Maitrise | Auteur |
|-----------|-----------|-------------|----------|--------|
| **Scenes V0** | 4-6 scenes IA tres guidees (beaucoup de texte pre-rempli) | 4-6 scenes IA avec plus de trous | 4-6 scenes avec seulement titre + contexte (2 lignes) | Pas de V0 — les eleves ecrivent depuis la frise narrative seule |
| **Profils creatifs** | 4 profils (dialoguiste, descripteur, choregraphe, emotionnel) — assignes automatiquement | 4 profils — l'eleve choisit son top 2, le systeme tranche | 5 profils (+ detective) — libre choix | Pas de profils — chaque eleve ecrit la scene entiere |
| **Ecriture** | Completer les trous du V0 (5-10 lignes par mission) | Enrichir le V0 (10-15 lignes) | Ecrire a partir du contexte seul (15-20 lignes) | Ecrire depuis zero, scene complete (20-30 lignes) |
| **Oral/tablette** | 70% oral / 30% tablette | 60% oral / 40% tablette | 50/50 | 40% oral / 60% tablette (l'ecriture prend plus de place) |
| **Assemblage** | L'intervenant assemble et lit | Les eleves votent l'ordre des scenes | Les eleves assemblent et reecrivent les transitions | Les eleves font une lecture collective du scenario complet + retouches |
| **Duree** | 45 min | 50 min | 60 min | 75 min |

### Prompt mission

- Decouverte : "Ta mission : [profil]. Ecris [X] pour la scene [titre]. Le debut est deja la — complete !"
- Exploration : "Ta mission : [profil]. La scene se passe [contexte]. Ecris [X] pour enrichir cette scene."
- Maitrise : "Tu es [profil] sur la scene [titre]. Voici le contexte : [2 lignes]. A toi d'ecrire."
- Auteur : "Ecris la scene [titre] en entier. Tu as la frise narrative pour te guider. Le reste vient de toi."

---

## M7 — VISUALISER (La Mise en scene)

### Ce qui change

| Dimension | Decouverte | Exploration | Maitrise | Auteur |
|-----------|-----------|-------------|----------|--------|
| **Theorie** | 4 plans fondamentaux (large, moyen, gros plan, reaction) | 4 plans + 2 mouvements (panoramique, travelling) | 4 plans + mouvements + hors-champ + raccord | Tout + montage (ellipse, montage parallele, jump cut) |
| **Comparaison** | 3 paires d'images, choix binaire | 3 paires + justification ecrite (3 lignes) | 4 paires d'extraits video + analyse | 2 sequences completes + analyse du decoupage |
| **Decoupage** | 3 scenes, 3 plans chacune (type + description) | 3 scenes, 4 plans (type + description + intention) | 3 scenes, 5 plans (type + description + intention + son) | Plan au sol + decoupage complet (type + description + intention + son + mouvement) |
| **Storyboard** | Non — seulement le decoupage ecrit | Optionnel (dessin libre sur papier, pas numerique) | Storyboard papier obligatoire (6-9 cases) | Storyboard detaille + notes de realisation |
| **Vocabulaire** | Plan large, plan moyen, gros plan, plan reaction | + panoramique, travelling | + hors-champ, raccord, plongee/contre-plongee | + sequence, montage, ellipse, insert, jump cut |
| **Duree** | 40 min | 45 min | 55 min | 70 min |

---

## M8 — PRODUIRE (L'Equipe)

### Ce qui change

| Dimension | Decouverte | Exploration | Maitrise | Auteur |
|-----------|-----------|-------------|----------|--------|
| **Quiz metiers** | 6 vrai/faux simples + debrief | 6 vrai/faux + 2 ouvertes ("quel metier t'attire et pourquoi ?") | Pas de quiz — les eleves presentent eux-memes les 6 metiers (prepare en amont) | Pas de quiz — discussion libre sur les roles + responsabilites |
| **Attribution** | Classement invisible, choix par merite | Classement invisible + l'eleve justifie son choix | L'eleve postule pour 2 roles, l'intervenant arbitre | Les eleves negocient les roles entre eux, l'intervenant valide |
| **Carte talent** | Carte style Pokemon — ludique, coloree, emoji, 2 forces | Carte style carte de visite — sobre, 3 forces + role | Format "fiche de poste" — role + responsabilites + competences | Format "portfolio" — role + competences + ambitions + lien orientation |
| **Vocabulaire** | Realisateur, cadreur, ingenieur son, assistant real, scripte, acteur | Idem + directeur photo, perchiste | Idem + chef op, 1er assistant, regisseur | Vocabulaire professionnel complet (fiche metier BTS audiovisuel) |
| **Lien orientation** | Non | Non | Mention des formations post-3e (option cinema lycee) | Lien explicite BTS audiovisuel 5 options + ecoles de cinema |
| **Duree** | 35 min | 40 min | 45 min | 55 min |

### Prompt carte talent

- Decouverte : "Voici ta carte ! Tu es [role] — tes super-pouvoirs : [force 1] et [force 2] !"
- Exploration : "Ta carte de l'equipe : [role]. Tes points forts : [force 1], [force 2], [force 3]."
- Maitrise : "Fiche de poste — [role]. Responsabilites : [liste]. Competences identifiees : [forces]. Prochaine etape : [lien formation]."
- Auteur : "Portfolio — [role]. Ce que tu as montre pendant l'atelier : [competences]. Ce que ce role demande dans le metier : [ref BTS]. Piste d'orientation : [formation]."

---

## Implementation technique

### Parametre de session

```typescript
type SessionDepth = "decouverte" | "exploration" | "maitrise" | "auteur";

// Dans la creation de session
interface SessionConfig {
  depth: SessionDepth;
  // ... autres params
}
```

### Ce qui est controle par le depth

| Element | Ou dans le code | Ce qui change |
|---------|----------------|---------------|
| Textes des prompts | `modules-data.ts` ou nouveau fichier `prompts-by-depth.ts` | Le texte affiche a l'eleve |
| Nombre de questions | `modules-data.ts` | `questions` property par module |
| Duree indicative | `modules-data.ts` | `duration` property |
| Jetons disponibles (M2) | Composant Emotion Cachee | Filtrage des tiers de jetons |
| Format du pitch (M4) | Composant PitchAssembly | Formule a trous vs libre |
| Chrono (M4) | Composant ChronoTest | 30s / 30s / 60s / 120s |
| Scenes V0 (M6) | API scenario-generate | Quantite de texte pre-rempli |
| Profils creatifs (M6) | API assign-missions | Assignation auto vs choix |
| Plans disponibles (M7) | Composant Decoupage | 4 / 6 / 8 / 10+ types |
| Format carte (M8) | Composant TalentCard | Pokemon / carte visite / fiche poste / portfolio |
| Gamification visible | Voir doc SPEC_GRADIENT_GAMIFICATION.md | XP, badges, animations |

### Migration

Pas de migration SQL necessaire — le `depth` est un attribut de la session, pas de la base de donnees des contenus. Il conditionne l'affichage, pas la structure des donnees.

Ajout dans la table `sessions` :
```sql
ALTER TABLE sessions ADD COLUMN depth TEXT DEFAULT 'decouverte'
  CHECK (depth IN ('decouverte', 'exploration', 'maitrise', 'auteur'));
```

---

*Document genere le 23 mars 2026 — Atelier Banlieuwood*
*Usage : reference pour l'implementation du systeme spiralaire*
