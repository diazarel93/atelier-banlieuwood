# SPEC TECHNIQUE — Atelier Banlieuwood V1 (Version Optimale)

> **Ce document tranche TOUTES les decisions.**
> Pas de "a valider par Adrian". Chaque choix est fait, justifie, et pret a coder.
> Adrian peut lire et contester, mais en attendant — on avance.

---

## 1. VISION PRODUIT

Un outil numerique qui permet a un intervenant de guider une classe (10-30 eleves) a travers 3 modules pour construire collectivement une histoire de court-metrage.

### Ce que V1 fait

- Poser des situations immersives aux eleves (individuellement, sur telephone)
- Recolter les reponses en temps reel
- Permettre a l'intervenant de piloter la seance en live
- Voter collectivement quand les reponses divergent
- Produire une restitution structuree (page web + PDF)
- Analyser les reponses par IA entre les seances (pas en live)

### Ce que V1 ne fait PAS

- Generation de scenario complet
- IA en temps reel pendant la seance
- Gamification (XP, niveaux, badges, streaks)
- Profils artistiques individuels
- Plateforme multi-organisations (1 org = 1 deploiement)
- Carnet d'idees numerique (papier en V1)

---

## 2. STACK TECHNIQUE

| Couche | Technologie | Pourquoi |
|--------|-------------|----------|
| Front | Next.js 15 (App Router) + TypeScript | SSR, routing, API routes integrees |
| UI | Tailwind CSS + shadcn/ui | Rapide, composants prets, dark mode natif |
| Base de donnees | Supabase (PostgreSQL) | SQL, auth, realtime, free tier genereux |
| Temps reel | **Hybride** : Supabase Realtime (intervenant + projection) + Polling 3s (eleves) | Divise la conso Realtime par 10 |
| Auth | Supabase Auth | Connexion intervenant (email/mdp) |
| IA (entre seances) | Claude API (claude-sonnet-4-20250514) | Analyse reponses, generation synthese |
| Hebergement | Vercel (region EU — iad1 ou cdg1) | Deploy auto, edge EU pour RGPD |
| State management | TanStack Query v5 | Cache, mutations, synchro serveur, polling |
| Region Supabase | **Frankfurt (eu-central-1)** | RGPD — donnees de mineurs en Europe |

### Choix Realtime hybride — justification

Le free tier Supabase permet 200 connexions Realtime simultanees. Une classe de 30 eleves = 30 connexions si tout le monde est en Realtime.

**Notre approche :**
- L'intervenant (pilot) → Supabase Realtime (voit les reponses arriver instantanement)
- L'ecran de projection (screen) → Supabase Realtime (synchro immediate)
- Les eleves (play) → **Polling TanStack Query toutes les 3 secondes** (ils attendent juste le changement d'etat — "reponds", "vote", "attends")

**Resultat :** ~3 connexions Realtime par session au lieu de 30. Le free tier supporte ~65 classes simultanees. Largement suffisant pour les 2 premieres annees.

---

## 3. LES 3 MODULES

| Module | Nom | Seances | Ce que l'eleve croit faire | Ce qu'on mesure/construit |
|--------|-----|---------|---------------------------|--------------------------|
| 1 | Confiance + Diagnostic | 1 seance (45 min) | Jouer avec des images, donner son avis | Diagnostiquer creativite, emotion, analyse, detail |
| 2 | Contrainte + Responsabilite | 1 seance (45 min) | Un jeu de budget de film | Comprendre que choisir = renoncer |
| 3 | Construction de l'histoire | 3 seances (45 min chacune) | Vivre des situations, voter ensemble | Structurer un recit complet |

### Ordre de dev

**Module 3 en premier.** C'est le coeur du produit. Il fonctionne seul. Les modules 1 et 2 sont des bonus pedagogiques qui enrichissent l'experience mais ne sont pas necessaires pour une demo ou un premier atelier.

```
Semaine 1-2 : Infra + Module 3 (eleve)
Semaine 3-4 : Module 3 (intervenant + projection)
Semaine 5   : Restitution + Export + Analyse IA
Semaine 6   : Module 1 (images + diagnostic)
Semaine 7   : Module 2 (jeu de budget)
```

---

## 4. MODULE 1 — CONFIANCE + DIAGNOSTIC

### Flow

1. L'intervenant lance la seance (oral, pas dans l'outil)
2. Il projette une image au tableau + l'image s'affiche sur le telephone de chaque eleve
3. 4 questions par image, reponses individuelles sur telephone
4. L'intervenant passe a l'image suivante manuellement quand 80%+ ont fini
5. Moment collectif : l'intervenant projette 3-4 reponses contrastees, discussion orale
6. Apres la seance : l'intervenant lance l'analyse IA

### Decisions tranchees

| Decision | Choix | Pourquoi |
|----------|-------|----------|
| Combien d'images ? | **3 images** | 3 × 4 = 12 questions. ~20 min de reponse. Laisse 25 min pour le collectif. |
| Les 3 niveaux de lecture ? | **Descriptif → Interpretatif → Narratif** | Niveau 1 = "je vois un homme". Niveau 2 = "il a l'air triste". Niveau 3 = "il vient de perdre quelqu'un". |
| Questions identiques par age ? | **Oui, memes questions.** Vocabulaire adapte dans les relances uniquement. | 4 questions universelles, pas 12. Moins de contenu a produire. |
| Image affichee ou ? | **Projetee + visible sur telephone** | Permet a l'eleve de zoomer sur des details. |
| Rythme ? | **L'intervenant lance chaque image manuellement** | Il connait sa classe. |
| Carnet d'idees ? | **Papier en V1** | Zero dev. On le numerise en V2 si le concept marche. |

### Les 4 questions par image

| # | Question | Ce qu'on mesure | Relance si < 10 mots |
|---|----------|-----------------|----------------------|
| 1 | Que vois-tu dans cette image ? | Sens du detail (observation) | "Decris ce que tu vois plus precisement — les couleurs, les formes, les personnes" |
| 2 | Que se passe-t-il ? | Capacite d'analyse (interpretation) | "A ton avis, qu'est-ce qui vient de se passer juste avant ?" |
| 3 | Que va-t-il se passer juste apres ? | Projection narrative (creativite) | "Imagine la suite — que fait la personne apres ?" |
| 4 | Quel detail t'a fait penser ca ? | Justification + emotion | "Montre ou regarde ce qui t'a donne cette idee" |

### Analyse IA (entre les seances, pas en live)

**Format de sortie pour l'intervenant :**

```
ANALYSE DE LA SEANCE — [Classe] — [Date]

RESUME (3-5 phrases)
"Cette classe montre une forte capacite d'observation avec des descriptions
detaillees. La projection narrative est inegale — certains eleves imaginent
des histoires complexes, d'autres restent descriptifs..."

JAUGES CLASSE (moyenne sur 5)
  Creativite : ████░ 3.8
  Detail     : █████ 4.2
  Emotion    : ███░░ 2.9
  Analyse    : ████░ 3.5

REPONSES REMARQUABLES (3-5 mises en avant par l'IA)
  - [Prenom] sur l'image 2 : "..." → forte projection narrative
  - [Prenom] sur l'image 3 : "..." → detail emotionnel rare

RECOMMANDATIONS POUR LE MODULE 3
  "Cette classe est forte en observation mais a du mal a justifier.
   Privilegiez des situations qui demandent de choisir et d'expliquer pourquoi."
```

**Scoring individuel :** Accessible en cliquant sur un eleve dans le dashboard. Jamais affiche publiquement. Jamais montre aux eleves.

### Moment collectif — choix technique

L'intervenant selectionne manuellement 3-4 reponses contrastees. Il les projette cote a cote, anonymes. Discussion orale. Pas de vote — juste montrer la diversite des regards sur une meme image.

**Pourquoi pas de regroupement automatique :** Le regroupement IA de reponses libres est un probleme complexe et fragile. En V1, on fait confiance a l'intervenant qui voit toutes les reponses et choisit les plus interessantes.

### Contenu a produire

| Element | Quantite | Par qui |
|---------|----------|--------|
| Images (libres de droits ou creees) | 3 | Adrian |
| Textes de relance par age (3 × 4 questions × 3 ages) | 36 textes courts | A definir ensemble |

**Recommandation pour les images :** Photos ambigues, pas de "bonne reponse". Exemples : une rue de nuit avec une silhouette, un objet abandonne sur un banc, deux personnes de dos qui marchent. Pas de visages nets (RGPD + universalite).

---

## 5. MODULE 2 — CONTRAINTE + RESPONSABILITE

### Mecanique choisie : BUDGET DE FILM

**Pourquoi le budget plutot que l'equilibre :** Le budget est concret, intuitif, universel. "T'as 100 credits pour faire ton film" — tout le monde comprend. Le systeme d'equilibre est plus abstrait et risque de perdre les plus jeunes.

### Regles du jeu

```
Tu es producteur/productrice d'un court-metrage.
Tu as 100 CREDITS pour tout faire.

CATEGORIES DE DEPENSE :
  Acteurs       → Figurants (5), Amateurs (15), Stars (40)
  Decors        → Exterieur gratuit (0), Lieu simple (10), Lieu exceptionnel (30)
  Effets        → Aucun (0), Basiques (15), Impressionnants (40)
  Musique       → Silence (0), Libre de droits (5), Compositeur (25)
  Duree         → Court 3min (0), Moyen 10min (10), Long 25min (25)
  Imprevus      → Reserve obligatoire minimum 10 credits

CONTRAINTES :
  - Tu ne peux PAS tout avoir en premium
  - Chaque choix te coute des credits
  - Quand tu as 0 credit, c'est fini

RESULTAT :
  L'outil genere un resume : "Ton film a des acteurs amateurs,
  un decor exceptionnel, pas d'effets speciaux, et de la musique
  libre de droits. C'est un court de 10 minutes."
```

### Decisions tranchees

| Decision | Choix | Pourquoi |
|----------|-------|----------|
| Individuel ou equipe ? | **Individuel** | Chaque eleve fait ses propres choix. Plus simple a coder, plus revelateur pedagogiquement. |
| Combien de credits ? | **100** | Nombre rond, facile a calculer mentalement. |
| Nombre de categories ? | **5** (acteurs, decors, effets, musique, duree) + reserve obligatoire | Assez pour forcer des compromis, pas trop pour ne pas etre indigeste. |
| Resultat visible ? | **Oui** — un resume texte genere automatiquement | L'eleve voit le film que ses choix produisent. Pas d'IA — juste une phrase template. |
| Lien avec module 3 ? | **Non en V1** | Le module 2 est une lecon autonome. Le lier au module 3 complique le code pour peu de gain pedagogique. |
| Moment collectif ? | **Oui** — l'intervenant projette 3-4 budgets differents. Discussion : "pourquoi t'as mis tout dans les acteurs ?" | Meme principe que module 1 : diversite des approches. |

### Contenu a produire

| Element | Quantite | Notes |
|---------|----------|-------|
| Textes d'intro par age | 3 | Le contexte "t'es producteur" adapte par tranche |
| Labels des options | ~15 | Noms et descriptions de chaque choix (acteurs, decors...) |
| Templates de resume | ~20 | Phrases pre-ecrites combinees selon les choix |

**Pas besoin d'IA pour ce module.** Tout est deterministe : choix → credits restants → resume genere par template.

---

## 6. MODULE 3 — CONSTRUCTION DE L'HISTOIRE

### 3 seances

| Seance | Titre | Categories | Nb situations | Duree |
|--------|-------|------------|---------------|-------|
| 1 | "C'est l'histoire de qui ?" | Personnage + Liens + Environnement | 8 | 45 min |
| 2 | "Il se passe quoi ?" | Conflit + Trajectoire | 8 | 45 min |
| 3 | "Ca raconte quoi en vrai ?" | Intention + Renforcement | 5 + restitution | 45 min |

### Les 6 categories narratives

1. **LE PERSONNAGE** — Qui c'est, ce qu'il/elle veut, ce qui lui manque, sa faiblesse
2. **LES LIENS** — Allies, rivaux, famille, mentor
3. **L'ENVIRONNEMENT** — Lieu, epoque, ambiance, regles du monde
4. **LE CONFLIT** — Obstacles + antagoniste (comme personnage, pas juste comme blocage)
5. **LA TRAJECTOIRE** — Situation initiale → declencheur → tentatives → choix impossible → climax → resolution + transformation
6. **L'INTENTION** — Theme, emotion, message (en dernier, pas en premier)

**Pourquoi cet ordre :** On commence par le concret (un personnage, des gens, un lieu) et on finit par l'abstrait (pourquoi cette histoire ?). L'inverse (commencer par "c'est quoi ton message ?") ne marche pas avec les jeunes — c'est trop scolaire.

### Approche : des situations, pas des questions

L'eleve ne voit JAMAIS une question scolaire. Il voit une mise en situation immersive.

| Interdit | Comment on le fait | Ce qu'on recolte |
|----------|-------------------|------------------|
| "Decris le protagoniste" | "T'es dans le bus. Tu vois quelqu'un que tu connais bien. C'est qui ?" | Personnage (identite) |
| "Quel est le desir du personnage ?" | "Cette personne, tout le monde sait qu'il/elle veut un truc depuis longtemps. C'est quoi ?" | Personnage (desir) |
| "Quelle est sa faiblesse ?" | "Ses proches, dans son dos, disent toujours la meme chose. Ils disent quoi ?" | Personnage (faille) |
| "Decris le lieu" | "Quand il/elle sort de chez lui/elle le matin, il/elle voit quoi ? Entend quoi ?" | Environnement |
| "Quel est le dilemme ?" | "Son meilleur pote a fait un truc grave. La police pose des questions. Il/elle fait quoi ?" | Conflit + Choix |
| "Quel est le theme ?" | "Ton pote sort du cine. Il te dit quoi sur le film ?" | Intention + Emotion |

### Les 21 situations (structure)

#### Seance 1 — "C'est l'histoire de qui ?"

| # | Categorie | Label restitution | Situation (version college 10-13) |
|---|-----------|-------------------|----------------------------------|
| 1.1 | Personnage | Le heros | "T'es dans le bus. Tu vois quelqu'un que tu connais bien. C'est qui ? Il/elle a l'air comment aujourd'hui ?" |
| 1.2 | Personnage | Son desir | "Cette personne, tout le monde sait qu'il/elle veut un truc depuis longtemps. C'est quoi ?" |
| 1.3 | Personnage | Sa faille | "Ses proches, dans son dos, disent toujours la meme chose sur lui/elle. Ils disent quoi ?" |
| 1.4 | Personnage | Son secret | "Il/elle a un secret que personne connait. C'est quoi ?" |
| 1.5 | Liens | Le meilleur ami | "Il/elle a une personne de confiance, quelqu'un qui est toujours la. C'est qui ? Comment ils se sont rencontres ?" |
| 1.6 | Liens | Le rival | "Y'a quelqu'un avec qui ca passe pas. C'est qui ? C'est quoi le probleme entre eux ?" |
| 1.7 | Environnement | Le lieu | "Quand il/elle sort de chez lui/elle le matin, il/elle voit quoi ? Entend quoi ? Sent quoi ?" |
| 1.8 | Environnement | L'ambiance | "C'est quel genre de quartier / endroit ? Les gens sont comment la-bas ?" |

#### Seance 2 — "Il se passe quoi ?"

| # | Categorie | Label restitution | Situation (version college 10-13) |
|---|-----------|-------------------|----------------------------------|
| 2.1 | Conflit | Le probleme | "Un matin, il/elle recoit un message qui change tout. C'est quoi ce message ?" |
| 2.2 | Conflit | L'obstacle | "Il/elle veut regler le probleme, mais y'a un truc qui bloque. C'est quoi ?" |
| 2.3 | Conflit | L'adversaire | "Quelqu'un veut pas que ca s'arrange. C'est qui ? Pourquoi cette personne bloque ?" |
| 2.4 | Trajectoire | Premier essai | "Il/elle essaie un truc pour s'en sortir. Ca marche ? Ou ca empire ?" |
| 2.5 | Trajectoire | Le dilemme | "Son meilleur pote a fait un truc grave. La police pose des questions. Il/elle fait quoi ?" |
| 2.6 | Trajectoire | Le choix impossible | "Il/elle doit choisir entre deux trucs. Les deux comptent enormement. C'est quoi les deux options ?" |
| 2.7 | Trajectoire | Le moment de verite | "Tout le monde le/la regarde. C'est maintenant ou jamais. Il/elle fait quoi ?" |
| 2.8 | Trajectoire | Apres | "C'est fini. Comment il/elle est maintenant ? Il/elle a change en quoi ?" |

#### Seance 3 — "Ca raconte quoi en vrai ?"

| # | Categorie | Label restitution | Situation (version college 10-13) |
|---|-----------|-------------------|----------------------------------|
| 3.1 | Intention | Le pitch | "Ton pote te demande 'c'est quoi ton film en une phrase ?' Tu reponds quoi ?" |
| 3.2 | Intention | L'emotion | "Quelqu'un sort du cine apres avoir vu ton film. Il est comment ? Il ressent quoi ?" |
| 3.3 | Intention | Le message | "Si quelqu'un dit 'en vrai ce film il parle de quoi ?', tu reponds quoi ?" |
| 3.4 | Renforcement | La scene cle | "Quelle est la scene que tout le monde va retenir ? Decris-la comme si tu la voyais." |
| 3.5 | Renforcement | Le titre | "Ton film s'appelle comment ?" |

**Chaque situation doit etre ecrite en 3 versions :**
- **6-9 ans** : Simple, concret, "imagine un enfant comme toi"
- **10-13 ans** : Immersif, "t'es dans le bus", vecu proche
- **14-18 ans** : Plus ouvert, "quelqu'un sort d'un immeuble", plus de liberte

**Total : 21 situations × 3 ages = 63 textes a ecrire.**

### Flow temps reel d'une seance

```
INTERVENANT ouvre la seance
  │
  ├── Lance la situation 1
  │     │
  │     ├── ELEVES ecrivent individuellement (ecran "Situation")
  │     │     └── Reponses arrivent en Realtime sur l'ecran intervenant
  │     │
  │     ├── INTERVENANT voit les reponses arriver une par une
  │     │     └── Il attend que ~80% aient repondu (indicateur visuel)
  │     │
  │     ├── INTERVENANT ferme les reponses (manuellement, clic "Stop")
  │     │
  │     ├── INTERVENANT projette les reponses (ecran projection)
  │     │     └── Discussion orale
  │     │
  │     ├── Si consensus naturel → INTERVENANT valide le choix
  │     │   Si divergence → INTERVENANT lance un vote
  │     │     └── ELEVES votent (ecran "Vote", style sondage Instagram)
  │     │     └── Si egalite → INTERVENANT tranche
  │     │
  │     └── INTERVENANT valide le choix collectif
  │           └── Il peut reformuler / fusionner des reponses
  │
  ├── Lance la situation 2...
  │
  └── Derniere situation → Recap de fin de seance
```

### Decisions de flow — tout tranche

| Decision | Choix | Justification |
|----------|-------|---------------|
| Fermeture des reponses | **Manuellement** (l'intervenant clique "Stop") | Il connait sa classe. Certains groupes sont rapides, d'autres lents. |
| Creation des options de vote | **L'intervenant selectionne 3-4 reponses manuellement** | Le regroupement auto par IA est fragile et source d'erreurs. L'humain choisit mieux. |
| Vote anonyme ? | **Oui** | Moins de pression sociale. Les timides votent librement. |
| Egalite au vote ? | **L'intervenant tranche** | Simple, rapide, pas de second tour qui casse le rythme. |
| Intervenant peut modifier le texte final ? | **Oui** | Il peut fusionner 2 reponses ou reformuler. C'est son role de mediateur. |
| Retour en arriere ? | **Oui** | Flexibilite necessaire. Parfois une situation merite d'etre refaite. |
| Sauter une situation ? | **Oui** | Certaines situations marchent pas avec certaines classes. L'intervenant adapte. |
| Toutes les situations = vote ? | **Non, l'intervenant choisit** | Certaines reponses convergent naturellement, pas besoin de voter. |
| L'eleve peut modifier apres envoi ? | **Non** | Simplicite. Evite les hesitations infinies. "C'est envoye, c'est fait." |

---

## 7. GESTION DES SEANCES ET PERSISTANCE

| Decision | Choix | Justification |
|----------|-------|---------------|
| La session reste ouverte entre les seances ? | **Oui.** Le code reste valide. L'eleve revient avec le meme code + prenom. | 3 seances sur 3 semaines = l'eleve doit pouvoir revenir. |
| Les eleves peuvent relire les resultats chez eux ? | **Oui.** Page web accessible avec le code de session. | Maintient l'engagement entre les seances. |
| L'intervenant peut modifier les choix entre les seances ? | **Oui.** Ecran d'edition dans le dashboard. | L'intervenant affine apres reflexion. |
| Nouveaux eleves en seance 2 ? | **Oui.** Ils voient un recap de la seance 1 en 30 secondes avant de commencer. | Realite du terrain : absences, arrivees en cours d'annee. |
| Eleve qui ferme son telephone et revient ? | **Cookie + re-saisie du code + prenom.** Si le cookie est perdu, code + prenom suffisent. | Pas de mot de passe pour les eleves. Zero friction. |
| Duree de vie des sessions ? | **6 mois apres la derniere activite.** Suppression auto. L'intervenant peut supprimer manuellement a tout moment. | RGPD : pas de conservation illimitee de donnees de mineurs. |

---

## 8. NIVEAUX D'AGE

| Niveau | Age | Ton des situations | Profondeur attendue | References culturelles |
|--------|-----|-------------------|---------------------|----------------------|
| Primaire | 6-9 ans | Simple, concret, "imagine un enfant comme toi" | Quelques mots a 2-3 phrases | Dessins animes, contes |
| College | 10-13 ans | Immersif, "t'es dans le bus", vecu proche | 2-5 phrases | Series, films populaires, rap |
| Lycee | 14-18 ans | Plus ouvert, "quelqu'un sort d'un immeuble" | Paragraphes, reflexion | Films, societe, vecu personnel |

L'intervenant choisit le niveau au moment de creer la session. Ca ne change pas en cours de route.

---

## 9. UI/UX

### Principes non-negociables

- **Mobile-first** pour l'eleve (telephone)
- **Desktop** pour l'intervenant (laptop + projection)
- **Mode sombre par defaut** (moderne, pas scolaire, cinema)
- **Zero inscription pour l'eleve** (code + prenom + emoji = 10 secondes)
- **Une seule chose a l'ecran** cote eleve (pas de menu, pas de navigation)
- **L'intervenant controle** ce que l'eleve voit (pas d'avancement libre)
- **Fonctionne en 3G** (texte uniquement, pas d'images lourdes sauf module 1)
- **Zero jargon cinema** dans les textes eleve

### Palette

| Element | Couleur | Usage |
|---------|---------|-------|
| Fond | #0A0A0A | Noir profond |
| Texte | #F5F5F5 | Blanc casse |
| Accent principal | #FF6B35 | Orange vif — energie, urbain |
| Accent secondaire | #4ECDC4 | Turquoise — frais, moderne |
| Surfaces | #1A1A1A | Cartes, champs de saisie |
| Muted | #666666 | Texte secondaire |
| Succes | #22C55E | Validation, envoi reussi |
| Danger | #EF4444 | Erreurs |

### Typo

**Inter** — ronde, moderne, lisible sur petit ecran et videoprojecteur. Variable font pour economiser les requetes.

### Les 5 etats de l'ecran eleve

```
1. ATTENTE
   ┌──────────────────────────────────┐
   │                                  │
   │     [animation pulse douce]      │
   │                                  │
   │   L'intervenant prepare          │
   │   la suite...                    │
   │                                  │
   │   🟢 14 personnes connectees     │
   │                                  │
   └──────────────────────────────────┘

2. SITUATION
   ┌──────────────────────────────────┐
   │  Situation 3/8           🎬      │
   │                                  │
   │  "T'es dans le bus. Tu vois     │
   │   quelqu'un que tu connais      │
   │   bien. C'est qui ? Il/elle     │
   │   a l'air comment aujourd'hui?" │
   │                                  │
   │  ┌──────────────────────────┐   │
   │  │ Ecris ta reponse...      │   │
   │  │                          │   │
   │  │                          │   │
   │  └──────────────────────────┘   │
   │                                  │
   │       [ Envoyer → ]              │
   └──────────────────────────────────┘

3. ENVOYE
   ┌──────────────────────────────────┐
   │                                  │
   │         ✓ Envoye !               │
   │                                  │
   │   ████████████░░░  18/25         │
   │   En attente des autres...       │
   │                                  │
   └──────────────────────────────────┘

4. VOTE
   ┌──────────────────────────────────┐
   │  A vous de voter !               │
   │                                  │
   │  ┌──────────────────────────┐   │
   │  │ A. "Un ado de 16 ans     │   │
   │  │    qui reve de..."       │   │
   │  └──────────────────────────┘   │
   │  ┌──────────────────────────┐   │
   │  │ B. "Une meuf qui vient   │   │
   │  │    de demenager..."      │   │
   │  └──────────────────────────┘   │
   │  ┌──────────────────────────┐   │
   │  │ C. "Un gars timide       │   │
   │  │    qui cache un..."      │   │
   │  └──────────────────────────┘   │
   │                                  │
   └──────────────────────────────────┘

5. RESULTAT
   ┌──────────────────────────────────┐
   │                                  │
   │   La classe a choisi :           │
   │                                  │
   │   "Un ado de 16 ans qui reve    │
   │    de devenir realisateur mais  │
   │    personne le prend au         │
   │    serieux."                    │
   │                                  │
   │   ████████████ 14 votes (56%)   │
   │   ████████░░░░ 8 votes  (32%)   │
   │   ███░░░░░░░░ 3 votes  (12%)   │
   │                                  │
   └──────────────────────────────────┘
```

### Les modes de l'ecran intervenant

**1. Pilotage** (`/session/[id]/pilot`)
- Voit toutes les reponses arriver en Realtime
- Compteur d'eleves connectes / ayant repondu
- Boutons : "Stop reponses", "Lancer vote", "Valider choix", "Situation suivante"
- Peut selectionner des reponses pour le vote
- Peut reformuler le choix collectif

**2. Projection** (`/session/[id]/screen`)
- **URL separee** ouverte dans un autre onglet et projetee (Chromecast / HDMI)
- Vue passive : aucun bouton, aucun controle
- Ecoute les changements via Supabase Realtime
- Gros texte, fond sombre, lisible du fond de la salle
- Affiche : situation en cours, reponses selectionnees, vote en cours, resultat

**3. Vote projete** (dans la page screen)
- Barres de vote en temps reel (animation)
- Resultat final avec pourcentages

**4. Recap** (`/session/[id]/results`)
- Resume de fin de seance
- Tous les choix collectifs
- Export PDF + page web partageable

---

## 10. MODELE DE DONNEES (Supabase)

```sql
-- Organisations (V1 = une seule, mais le schema est pret)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Intervenants
CREATE TABLE facilitators (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  org_id UUID REFERENCES organizations(id),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sessions (1 classe × 1 atelier)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  facilitator_id UUID REFERENCES facilitators(id),
  title TEXT NOT NULL,
  join_code TEXT NOT NULL UNIQUE, -- 6 caracteres majuscules
  level TEXT NOT NULL CHECK (level IN ('primaire', 'college', 'lycee')),
  current_module INT DEFAULT 1,
  current_seance INT DEFAULT 1,
  current_situation_index INT DEFAULT 0,
  status TEXT DEFAULT 'waiting'
    CHECK (status IN ('waiting', 'responding', 'reviewing', 'voting', 'paused', 'done')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Eleves (pas de compte, juste un pseudo + emoji)
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar TEXT NOT NULL, -- emoji
  is_active BOOLEAN DEFAULT true,
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  joined_at TIMESTAMPTZ DEFAULT now()
);

-- Situations (referentiel statique, seed en migration)
CREATE TABLE situations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module INT NOT NULL,
  seance INT NOT NULL,
  position INT NOT NULL,
  category TEXT NOT NULL, -- personnage, liens, environnement, conflit, trajectoire, intention, renforcement
  restitution_label TEXT NOT NULL, -- "Le heros", "Sa faille", etc.
  prompt_6_9 TEXT NOT NULL,
  prompt_10_13 TEXT NOT NULL,
  prompt_14_18 TEXT NOT NULL,
  nudge_text TEXT, -- relance si reponse courte
  UNIQUE(module, seance, position)
);

-- Reponses individuelles
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  situation_id UUID REFERENCES situations(id),
  text TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, student_id, situation_id) -- 1 reponse par eleve par situation
);

-- Votes
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  situation_id UUID REFERENCES situations(id),
  chosen_response_id UUID REFERENCES responses(id), -- la reponse pour laquelle il vote
  voted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, student_id, situation_id) -- 1 vote par eleve par situation
);

-- Choix collectifs (ce que la classe a decide)
CREATE TABLE collective_choices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  situation_id UUID REFERENCES situations(id),
  category TEXT NOT NULL,
  restitution_label TEXT NOT NULL,
  chosen_text TEXT NOT NULL, -- modifiable par l'intervenant
  source_response_id UUID REFERENCES responses(id), -- reponse d'origine (si applicable)
  validated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, situation_id)
);

-- Module 1 : analyse IA (generee entre les seances)
CREATE TABLE module1_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE UNIQUE,
  class_summary TEXT,
  creativity_avg REAL,
  detail_avg REAL,
  emotion_avg REAL,
  analysis_avg REAL,
  student_profiles JSONB, -- {student_id: {creativity, detail, emotion, analysis}}
  recommendations TEXT,
  generated_at TIMESTAMPTZ DEFAULT now()
);

-- Module 2 : budgets des eleves
CREATE TABLE module2_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  choices JSONB NOT NULL, -- {actors: "amateur", decor: "exceptional", ...}
  credits_remaining INT NOT NULL,
  summary TEXT, -- resume genere par template
  submitted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, student_id)
);

-- Annotations de l'intervenant
CREATE TABLE annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id), -- null = annotation sur la classe
  situation_id UUID REFERENCES situations(id), -- null = annotation generale
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('note', 'encouragement', 'alerte')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour les requetes frequentes
CREATE INDEX idx_responses_session ON responses(session_id);
CREATE INDEX idx_responses_situation ON responses(situation_id);
CREATE INDEX idx_students_session ON students(session_id);
CREATE INDEX idx_votes_session ON votes(session_id);
CREATE INDEX idx_collective_choices_session ON collective_choices(session_id);
CREATE INDEX idx_sessions_join_code ON sessions(join_code);
```

### Row Level Security (RLS)

```sql
-- Intervenant voit uniquement ses sessions
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "facilitator_own_sessions" ON sessions
  FOR ALL USING (facilitator_id = auth.uid());

-- Les eleves (pas authentifies) passent par les API routes
-- Les API routes utilisent le service_role key (bypass RLS)
-- Les routes verifient le join_code + student_id manuellement
```

**Pourquoi les eleves passent par les API routes et pas directement par Supabase :**
Les eleves n'ont pas de compte Supabase Auth. Ils s'identifient par code + prenom. L'API route verifie que le code existe et que le student_id est valide, puis ecrit en base avec le service_role key.

---

## 11. RESTITUTION (document final)

A la fin du module 3, l'outil genere automatiquement :

```
╔══════════════════════════════════════════════╗
║  HISTOIRE DE LA CLASSE                       ║
║  [Titre choisi par la classe]                ║
╚══════════════════════════════════════════════╝

PITCH
  [une phrase — situation 3.1]

CE QUE LE SPECTATEUR RESSENT
  [reponse situation 3.2]

LE VRAI SUJET
  [reponse situation 3.3]

─────────────────────────────────

PERSONNAGE PRINCIPAL
  Qui : [situation 1.1]
  Ce qu'il/elle veut : [situation 1.2]
  Sa faille : [situation 1.3]
  Son secret : [situation 1.4]

SON ENTOURAGE
  Allie : [situation 1.5]
  Rival : [situation 1.6]

LE MONDE
  Lieu : [situation 1.7]
  Ambiance : [situation 1.8]

─────────────────────────────────

L'HISTOIRE

  Situation de depart :
    [reconstitue a partir des situations 1.x]

  L'evenement declencheur :
    [situation 2.1]

  L'obstacle :
    [situation 2.2]

  L'adversaire :
    [situation 2.3]

  Ce que le heros tente :
    [situation 2.4]

  Le dilemme :
    [situation 2.5]

  Le choix impossible :
    [situation 2.6]

  Le moment de verite :
    [situation 2.7]

  Apres — comment il/elle a change :
    [situation 2.8]

─────────────────────────────────

LA SCENE CLE
  [situation 3.4]

TITRE DU FILM
  [situation 3.5]

─────────────────────────────────
Cree par la classe [nom] — Atelier Banlieuwood
[date]
```

**Formats disponibles :**
- **Page web** consultable avec le code de session (accessible par les eleves)
- **PDF telechargeable** (pour l'intervenant et l'ecole)
- **Markdown exportable** (pour reutilisation)

---

## 12. ANALYSE IA ENTRE SEANCES

### Quand

- L'intervenant clique "Analyser les reponses" dans son dashboard
- Appel a Claude API (claude-sonnet-4-20250514)
- Resultat stocke en base, reutilisable

### Ce que l'IA produit

**Pour le module 1 :** Voir section 4 (jauges creativite/detail/emotion/analyse + recommandations).

**Pour le module 3 (entre seance 1 et 2, entre seance 2 et 3) :**

```
ANALYSE DES REPONSES — Seance 1

RESUME
  "La classe a cree un personnage fort avec un desir clair, mais
   l'environnement reste vague. Les liens sont bien definis —
   l'allie est tres present, le rival est original."

POINTS FORTS
  - Personnage bien defini avec un secret interessant
  - Relation allie/rival riche en potentiel dramatique

POINTS A CREUSER EN SEANCE 2
  - L'environnement est generique — demandez plus de details sensoriels
  - La faille du personnage est superficielle — creusez en seance 2

RECOMMANDATIONS
  "Pour la seance 2, insistez sur les situations 2.2 (obstacle)
   et 2.6 (choix impossible). Cette classe a tendance a eviter
   le conflit — poussez-les vers des choix plus radicaux."
```

**Pas de scoring. Pas de notes. Pas de classement.** Juste du texte actionnable pour l'intervenant.

### Prompt IA (template)

```
Tu es un analyste narratif pour un atelier d'ecriture avec des jeunes.
Voici les reponses collectives choisies par la classe pour la seance [N] :

[liste des choix collectifs avec categories]

Analyse ces reponses et produis :
1. Un resume de 3-5 phrases sur les tendances de la classe
2. 2-3 points forts narratifs
3. 2-3 points a creuser dans la prochaine seance
4. Des recommandations concretes pour l'intervenant

Ton adapte : professionnel mais accessible. L'intervenant n'est pas
forcement un expert en narratologie. Pas de jargon.
Ne juge jamais negativement. Oriente positivement.
```

---

## 13. PAGES DE L'APPLICATION

| Page | URL | Qui | Fonction |
|------|-----|-----|----------|
| Landing | `/` | Tous | Presentation + "Intervenant" / "Eleve" |
| Login | `/login` | Intervenant | Connexion email/mdp (Supabase Auth) |
| Dashboard | `/dashboard` | Intervenant | Liste des sessions + creer une nouvelle |
| Nouvelle session | `/session/new` | Intervenant | Creer : titre, niveau, module de depart |
| Pilotage | `/session/[id]/pilot` | Intervenant | Ecran de controle temps reel |
| Projection | `/session/[id]/screen` | Ecran projete | Vue passive grand ecran |
| Resultats | `/session/[id]/results` | Intervenant | Restitution + export + analyse IA |
| Rejoindre | `/join` | Eleve | Code + prenom + emoji (10 secondes) |
| Jouer | `/play/[id]` | Eleve | Ecran de jeu (situations, vote, attente) |
| Recap eleve | `/play/[id]/recap` | Eleve | Ce que la classe a choisi (entre les seances) |

### API Routes

```
POST   /api/auth/login          — connexion intervenant
POST   /api/sessions            — creer une session
GET    /api/sessions             — lister mes sessions
GET    /api/sessions/[id]        — detail d'une session
PATCH  /api/sessions/[id]        — modifier l'etat (status, current_situation_index)
DELETE /api/sessions/[id]        — supprimer (+ cascade)

POST   /api/sessions/[id]/join   — eleve rejoint (code + prenom + emoji)
GET    /api/sessions/[id]/students — liste des eleves connectes

GET    /api/sessions/[id]/situation — situation en cours pour l'eleve
POST   /api/sessions/[id]/respond  — soumettre une reponse
GET    /api/sessions/[id]/responses — toutes les reponses (intervenant)

POST   /api/sessions/[id]/vote     — soumettre un vote
GET    /api/sessions/[id]/votes    — resultats du vote

POST   /api/sessions/[id]/collective-choice — valider un choix collectif
GET    /api/sessions/[id]/collective-choices — tous les choix (restitution)
PATCH  /api/sessions/[id]/collective-choices/[choiceId] — modifier le texte

POST   /api/sessions/[id]/analyze  — lancer l'analyse IA
GET    /api/sessions/[id]/analysis — resultats de l'analyse

POST   /api/sessions/[id]/annotations — ajouter une annotation
GET    /api/sessions/[id]/annotations — lister les annotations

POST   /api/sessions/[id]/budget   — soumettre un budget (module 2)
GET    /api/sessions/[id]/budgets  — tous les budgets (intervenant)

GET    /api/sessions/[id]/export/pdf — telecharger le PDF
GET    /api/sessions/[id]/export/md  — telecharger le Markdown
```

---

## 14. RGPD + DONNEES MINEURS

### Principes

1. **Pas de donnees personnelles identifiantes** : prenom (peut etre un pseudo) + emoji. Pas de nom de famille, pas d'email, pas de photo.
2. **Hebergement EU** : Supabase region Frankfurt + Vercel edge EU.
3. **Consentement** : L'etablissement signe une convention d'utilisation. Le consentement est collectif (via l'ecole), pas individuel.
4. **Duree de conservation** : **6 mois** apres la derniere activite. Suppression automatique par cron job Supabase.
5. **Droit de suppression** : L'intervenant peut supprimer une session et toutes ses donnees a tout moment (CASCADE en base).
6. **Mentions legales** : Page `/legal` avec politique de confidentialite.

### Implementation technique

```sql
-- Cron job Supabase : supprimer les sessions inactives > 6 mois
-- (a configurer dans Supabase Dashboard > Database > Extensions > pg_cron)
SELECT cron.schedule(
  'cleanup-old-sessions',
  '0 3 * * 0', -- chaque dimanche a 3h du matin
  $$DELETE FROM sessions WHERE updated_at < now() - INTERVAL '6 months'$$
);
```

---

## 15. EDGE CASES

### Reseau

| Situation | Comportement |
|-----------|-------------|
| Wifi tombe pendant que l'eleve ecrit | Texte sauvegarde en localStorage. Envoi auto au retour du reseau. |
| Eleve ferme le navigateur et revient | Re-saisit code + prenom → retrouve sa session. |
| Eleve arrive en retard | Voit la situation en cours directement. Ne rattrape pas les precedentes. |
| Telephone en 3G/4G uniquement | Ca marche. Texte uniquement, pas d'images lourdes (sauf module 1). |
| Intervenant perd sa connexion | Eleves voient "L'intervenant prepare la suite..." Rien ne casse. Il se reconnecte et reprend. |

### Reponses problematiques

| Situation | Comportement |
|-----------|-------------|
| Reponse trop courte (< 10 mots) | Relance douce (nudge). Pas bloquant — l'eleve peut quand meme envoyer. |
| Champ vide | Bouton Envoyer desactive. |
| Insultes / contenu inapproprie | V1 : pas de filtre auto. L'intervenant voit et ne selectionne pas pour le vote. |
| 5 eleves sur 25 ne repondent pas | L'intervenant voit qui n'a pas repondu. Il relance a l'oral ou passe a la suite. |

### Multi-usage

| Situation | Comportement |
|-----------|-------------|
| Plusieurs classes pour un intervenant | Plusieurs sessions, chacune avec son code. Dashboard = liste. |
| Deux intervenants dans la meme orga | Chacun voit ses propres sessions. Pas de partage en V1. |
| Mauvais code | "Ce code n'existe pas. Verifie avec ton intervenant." |
| Deux eleves, meme prenom | Pas de contrainte d'unicite. L'emoji differencie. |

---

## 16. LIMITES FREE TIER ET SCALING

### Supabase Free Tier

| Ressource | Limite | Notre usage (50 classes/an) | OK ? |
|-----------|--------|---------------------------|------|
| Base de donnees | 500 MB | ~50 MB (texte uniquement) | OK |
| Auth users | 50 000 | ~50 intervenants | OK |
| Realtime connections | 200 simultanees | ~3 par session (hybride) = ~65 classes simultanees | OK |
| Storage | 1 GB | Images module 1 + exports PDF | OK |

### Strategie Realtime hybride (rappel)

| Qui | Methode | Connexions Realtime |
|-----|---------|-------------------|
| Intervenant (pilot) | Supabase Realtime | 1 |
| Ecran projection (screen) | Supabase Realtime | 1 |
| Eleves (×25) | Polling TanStack Query 3s | 0 |
| **Total par session** | | **~2-3** |

### Quand passer au payant

| Seuil | Action | Cout |
|-------|--------|------|
| > 65 classes simultanees | Supabase Pro | $25/mois |
| > 500 MB de donnees | Supabase Pro | $25/mois |
| > 100K visites/mois | Vercel Pro | $20/mois |

**A ce stade, on a deja des clients qui paient 1000€.** Le modele est largement rentable.

---

## 17. CHECKLIST DE DEV

### Phase 1 — Infra (semaine 1)

- [ ] Init repo Next.js 15 + TypeScript + Tailwind + shadcn/ui
- [ ] Setup Supabase projet (region Frankfurt)
- [ ] Migration : creer toutes les tables
- [ ] Seed : inserer les 21 situations (placeholder si Adrian n'a pas fini les 63 textes)
- [ ] Auth intervenant (login/logout)
- [ ] RLS policies
- [ ] Page `/login`
- [ ] Page `/dashboard` (liste sessions)
- [ ] Page `/session/new` (creer session)
- [ ] API : POST/GET sessions
- [ ] Page `/join` (eleve rejoint)
- [ ] API : POST join

### Phase 2 — Module 3 Eleve (semaine 2)

- [ ] Page `/play/[id]` — les 5 etats (attente, situation, envoye, vote, resultat)
- [ ] API : GET situation courante, POST reponse, POST vote
- [ ] Polling 3s pour l'etat de la session
- [ ] localStorage fallback pour les reponses en cas de perte reseau
- [ ] Relance (nudge) si reponse < 10 mots

### Phase 3 — Module 3 Intervenant (semaine 3)

- [ ] Page `/session/[id]/pilot` — pilotage temps reel
- [ ] Supabase Realtime : subscribe aux nouvelles reponses
- [ ] Boutons : stop reponses, selectionner pour vote, lancer vote, valider choix
- [ ] Reformulation du choix collectif
- [ ] Navigation : situation precedente/suivante, sauter une situation
- [ ] Page `/session/[id]/screen` — vue projection passive
- [ ] Supabase Realtime : subscribe a l'etat de la session

### Phase 4 — Restitution (semaine 4)

- [ ] Page `/session/[id]/results` — recap complet
- [ ] API : GET collective-choices
- [ ] Export PDF (via @react-pdf/renderer ou html2pdf)
- [ ] Export Markdown
- [ ] Page `/play/[id]/recap` — ce que la classe a choisi (accessible eleve)
- [ ] API : POST analyze (appel Claude)
- [ ] Affichage de l'analyse IA dans le dashboard

### Phase 5 — Module 1 (semaine 5)

- [ ] Upload images dans Supabase Storage
- [ ] Ecran eleve : image + 4 questions sequentielles
- [ ] Ecran intervenant : voir les reponses, selectionner pour moment collectif
- [ ] Ecran projection : affichage des reponses contrastees
- [ ] API : POST analyze module 1 (jauges + recommandations)
- [ ] Dashboard : affichage des resultats module 1

### Phase 6 — Module 2 (semaine 6)

- [ ] Ecran eleve : interface de budget (sliders ou boutons pour chaque categorie)
- [ ] Calcul credits restants en temps reel
- [ ] Generation du resume par template
- [ ] Ecran intervenant : voir les budgets, selectionner pour projection
- [ ] Ecran projection : budgets compares

### Phase 7 — Polish (semaine 7)

- [ ] Animations (transitions d'etat, entree des reponses)
- [ ] Page `/legal` (mentions legales, politique de confidentialite)
- [ ] Cron job suppression sessions > 6 mois
- [ ] Tests manuels : creer une session, rejoindre, repondre, voter, voir restitution
- [ ] Deploy sur Vercel
- [ ] Domaine custom (si disponible)

---

## 18. CE QUE JE PEUX CODER SANS ADRIAN

| Element | Statut | Bloquant ? |
|---------|--------|-----------|
| Toute l'infra (Supabase, auth, API, pages) | Pret a coder | Non |
| Module 3 flow complet (situations, votes, choix) | Pret avec les 21 situations college comme placeholder | Non |
| Module 3 version 6-9 et 14-18 des situations | Les textes manquent | **Oui pour les 2 autres niveaux** |
| Module 1 | Les images manquent | **Oui** |
| Module 2 | Pret a coder avec le design budget propose | Non |
| Restitution + export | Pret a coder | Non |
| Analyse IA | Pret a coder (prompt template defini) | Non |

**Conclusion :** Je peux demarrer immediatement et livrer 80% du produit avec les situations college (10-13 ans) comme placeholder. Adrian fournit les 63 textes et les images quand il peut — je les integre.

---

## 19. POURQUOI CES CHOIX

### Module 3 en premier, pas Module 1
Le module 3 est le coeur du produit — c'est la que la classe construit une histoire. Les modules 1 et 2 sont des preparatifs. On peut faire un atelier complet avec juste le module 3. On ne peut pas faire un atelier avec juste le module 1.

### Budget fictif pour le Module 2, pas systeme d'equilibre
Le budget est concret et intuitif. "T'as 100 credits" — tout le monde comprend. Un systeme d'equilibre ("si tu ajoutes ici tu perds la") est plus abstrait et risque de perdre les 6-9 ans.

### Polling pour les eleves, pas Realtime
Les eleves n'ont besoin de savoir qu'une chose : "c'est a moi de repondre, voter, ou attendre ?" Un polling toutes les 3 secondes suffit. Ca divise la consommation Realtime par 10 et le free tier tient pour 65 classes simultanees.

### Pas de gamification en V1
Les badges et XP ajoutent de la complexite pour un gain pedagogique incertain. L'outil doit etre sobre et fonctionnel. Si les intervenants demandent de la gamification, on l'ajoute en V2.

### Carnet d'idees papier
Zero dev, zero maintenance. L'intervenant distribue un carnet physique. Si le concept marche en atelier, on le numerise en V2.

### 6 mois de retention, pas 1 an
RGPD + donnees de mineurs = on garde le minimum. 6 mois couvre l'annee scolaire avec marge. L'intervenant peut exporter avant la suppression.

### Inter pour la typo, pas Plus Jakarta Sans
Inter est la plus testee sur mobile, la plus lisible en petit, et elle est variable (un seul fichier font). Plus Jakarta Sans est jolie mais moins repandue et moins testee en conditions reelles.

### Pas de filtre d'insultes en V1
Un filtre automatique genere des faux positifs (mots en verlan, argot, expressions de quartier). Mieux vaut que l'intervenant filtre manuellement — il connait le contexte et le vocabulaire de ses eleves.

### L'intervenant tranche en cas d'egalite, pas de second tour
Un second tour casse le rythme de la seance. 45 minutes c'est court. L'intervenant a l'autorite naturelle pour trancher.

### Pas de modification apres envoi pour l'eleve
"C'est envoye, c'est fait." Ca evite les hesitations infinies et les eleves qui copient en modifiant. Ca apprend aussi a assumer ses choix — ce qui est coherent avec le message du module 2 ("choisir = renoncer").
