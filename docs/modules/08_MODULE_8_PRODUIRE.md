# Module 8 --- Produire (L'Equipe)

> **Position dans le parcours** : Module 8 / 8 du parcours principal
> **Phase** : `production` --- Equipe de tournage
> **dbModule** : `8`
> **Duree totale estimee** : ~45 min (1 seance, 5 positions)

---

## Objectif pedagogique

Transformer un groupe d'eleves en **equipe de tournage**. Le cinema est un travail collectif : chaque role est essentiel, personne ne fait le film seul. Ce module attribue les roles de maniere meritocratique (mais invisible) et valorise chaque eleve par une carte talent.

## Competence developpee

**Collaborer.**

## Ce que l'eleve apprend

> "Chaque role est essentiel, le cinema = travail d'equipe."

---

## Structure du module (5 positions)

### Vue synoptique

| Position | Type          | Label          | Composant     | Description                                          |
|----------|---------------|----------------|---------------|------------------------------------------------------|
| 1        | `quiz`        | Quiz metiers   | `MetierQuiz`  | 6 affirmations VRAI/FAUX sur les metiers du cinema   |
| 2        | `debrief`     | Debrief        | (resultats)   | Corrections rapides + fiches metier simplifiees       |
| 3        | `role-choice` | Choix de role  | `RolePicker`  | L'eleve choisit son role selon l'ordre du classement  |
| 4        | `team-recap`  | Recap equipe   | `TeamRecap`   | Grille avec avatar + nom + role pour chaque eleve     |
| 5        | `talent-card` | Carte talent   | `TalentCard`  | Carte style Pokemon/FIFA avec forces uniquement       |

### Constante `MODULE_SEANCE_SITUATIONS`

```typescript
// src/lib/constants.ts
8: { 1: 5 }  // L'Equipe: Quiz (1), Debrief (2), Choix de role (3), Recap (4), Carte talent (5)
```

---

## Detail par position

### Position 1 --- Quiz des metiers

6 affirmations **VRAI/FAUX** sur les metiers du cinema. Le but est de **reveler les idees recues** et creer de la curiosite.

```typescript
// src/lib/module-equipe-data.ts
export const QUIZ_METIERS: QuizMetier[] = [
  {
    metierKey: "realisateur",
    statement: "Le realisateur tient la camera.",
    isTrue: false,
    explanation: "Non ! Le realisateur dirige les acteurs et choisit les plans.
                  C'est le cadreur qui tient la camera.",
  },
  {
    metierKey: "cadreur",
    statement: "Le cadreur decide tout seul quel plan filmer.",
    isTrue: false,
    explanation: "Non ! Le cadreur suit les indications du realisateur. Ils travaillent en equipe.",
  },
  {
    metierKey: "son",
    statement: "L'ingenieur son doit rester silencieux pendant le tournage.",
    isTrue: true,
    explanation: "Oui ! Il doit etre discret pour ne pas parasiter l'enregistrement.",
  },
  {
    metierKey: "assistant-real",
    statement: "L'assistant realisateur est juste un stagiaire.",
    isTrue: false,
    explanation: "Non ! C'est un role cle : il organise tout le planning et coordonne l'equipe.",
  },
  {
    metierKey: "script",
    statement: "Le scripte ecrit le scenario pendant le tournage.",
    isTrue: false,
    explanation: "Non ! Le scripte verifie la continuite : costumes, positions, dialogues.",
  },
  {
    metierKey: "acteur",
    statement: "Un acteur doit savoir improviser.",
    isTrue: true,
    explanation: "Oui ! Meme avec un scenario, un bon acteur sait adapter son jeu.",
  },
];
```

**Recapitulatif :**

| Affirmation                                                  | Reponse | Metier           |
|--------------------------------------------------------------|---------|------------------|
| "Le realisateur tient la camera"                             | FAUX    | Realisateur      |
| "Le cadreur decide tout seul quel plan filmer"               | FAUX    | Cadreur          |
| "L'ingenieur son doit rester silencieux pendant le tournage" | VRAI    | Ingenieur son    |
| "L'assistant realisateur est juste un stagiaire"             | FAUX    | Assistant real   |
| "Le scripte ecrit le scenario pendant le tournage"           | FAUX    | Scripte          |
| "Un acteur doit savoir improviser"                           | VRAI    | Acteur           |

Note : Les 6 affirmations du code sont legerement differentes de celles specifiees par Adrian (qui proposait "Le cadreur choisit comment filmer chaque plan" VRAI et "Les acteurs improvisent toujours leurs repliques" FAUX). Le code a adapte les formulations pour mieux fonctionner avec le format quiz.

### Position 2 --- Debrief

Corrections rapides (5-8 min max selon Adrian). Affiche :
- Les **resultats collectifs** de la classe (`classResults`) : nombre de bonnes/mauvaises reponses par metier
- Les **corrections** avec explication pour chaque affirmation
- Les **fiches metier simplifiees** (6 fiches detaillees)

Les fiches metier :

```typescript
// src/lib/module-equipe-data.ts
export const FICHES_METIER: FicheMetier[] = [
  {
    key: "realisateur",
    label: "Realisateur-rice",
    description: "Dirige les acteurs et decide de la mise en scene. C'est le chef d'orchestre.",
    skills: ["Leadership", "Vision artistique", "Communication"],
    emoji: "🎬", color: "#EF4444",
  },
  {
    key: "cadreur",
    label: "Cadreur-se",
    description: "Tient la camera et choisit les plans. C'est l'oeil du film.",
    skills: ["Stabilite", "Sens du cadre", "Patience"],
    emoji: "📷", color: "#3B82F6",
  },
  {
    key: "son",
    label: "Ingenieur-e son",
    description: "Gere le son : voix, bruitages, ambiance. Sans lui, pas de dialogue !",
    skills: ["Oreille musicale", "Discretion", "Technique"],
    emoji: "🎧", color: "#10B981",
  },
  {
    key: "assistant-real",
    label: "Assistant-e realisateur",
    description: "Organise le tournage : planning, accessoires, repetitions. Le bras droit du real.",
    skills: ["Organisation", "Gestion du temps", "Anticipation"],
    emoji: "📋", color: "#F59E0B",
  },
  {
    key: "script",
    label: "Scripte",
    description: "Verifie la continuite : costumes, positions, dialogues. Rien ne doit changer.",
    skills: ["Observation", "Memoire", "Precision"],
    emoji: "📝", color: "#8B5CF6",
  },
  {
    key: "acteur",
    label: "Acteur-rice",
    description: "Interprete un personnage devant la camera. Donne vie a l'histoire.",
    skills: ["Expression", "Memorisation", "Emotion"],
    emoji: "🎭", color: "#EC4899",
  },
];
```

### Position 3 --- Choix de role

Le coeur du module. L'ordre de choix est base sur un **classement invisible** (jamais affiche aux eleves).

#### Le systeme de points

3 sources de points, chacune normalisee sur 10 :

| Source          | Ce qui est mesure                                       | Table DB source        |
|-----------------|---------------------------------------------------------|------------------------|
| Participation   | Nombre de reponses aux exercices (toutes sessions)      | `responses`            |
| Creativite      | Contributions M10 (etsi + personnages + pitchs)         | `module10_*`           |
| Engagement      | Missions M6 completees + votes M12                      | `module6_missions`, `module12_votes` |

**Formule de normalisation :**

```typescript
// src/app/api/sessions/[id]/equipe-compute/route.ts
participationScore = Math.round((responseCounts[id] / maxResponses) * 10);
creativityScore = Math.round((creativityCounts[id] / maxCreativity) * 10);
engagementScore = Math.round((engagementCounts[id] / maxEngagement) * 10);
```

Le total est calcule en base via une **colonne generee** :

```sql
-- module8_points
total_score INT GENERATED ALWAYS AS (participation_score + creativity_score + engagement_score) STORED
```

#### Le classement

- Le `rank` est attribue par `rankStudents()` : tri decroissant par total, rang sequentiel
- Le classement est **NON PUBLIC** : les eleves voient uniquement si c'est "leur tour" (`isMyTurn`), jamais les scores ni le classement complet
- Le facilitateur voit le classement complet avec tous les scores (`ranking`)

#### Le choix

- L'eleve dont c'est le tour choisit parmi les **roles disponibles** (roles non encore pris)
- Contrainte `UNIQUE(session_id, role_key)` : un seul eleve par role
- Contrainte `UNIQUE(session_id, student_id)` : un seul role par eleve
- Verification cote serveur : le code verifie que le role est libre ET que l'eleve n'a pas deja choisi

#### Veto Banlieuwood

Le facilitateur peut orienter un role (`is_veto: true` dans `module8_roles`). Le champ est stocke en base mais le mecanisme d'UI pour le veto depend de l'implementation cockpit pilote.

### Position 4 --- Recap equipe

Grille complete de l'equipe : pour chaque eleve, affichage de :
- Avatar (DiceBear, via `avatar_seed`)
- Nom (`display_name`)
- Role attribue (label + emoji + couleur du metier)
- Indicateur veto si applicable

### Position 5 --- Cartes talents

Carte style **Pokemon/FIFA** pour chaque eleve. Design premium avec :

- Avatar DiceBear
- Nom de l'eleve
- Role attribue
- Categorie de talent (determinee par le role)
- 2 forces selectionnees (jamais de faiblesses)

#### Les 3 categories de talents

```typescript
// src/lib/module-equipe-data.ts
export const TALENT_CATEGORIES = [
  {
    key: "jeu",
    label: "Jeu / Interpretation",
    color: "#EC4899",
    strengths: ["Expressivite", "Empathie", "Creativite emotionnelle", "Charisme"],
  },
  {
    key: "image",
    label: "Mise en scene / Image",
    color: "#3B82F6",
    strengths: ["Sens visuel", "Composition", "Narration visuelle", "Imagination"],
  },
  {
    key: "technique",
    label: "Technique / Organisation",
    color: "#10B981",
    strengths: ["Rigueur", "Anticipation", "Coordination", "Precision"],
  },
];
```

#### Mapping role vers categorie

```typescript
const ROLE_TO_CATEGORY: Record<string, string> = {
  realisateur:    "image",
  cadreur:        "image",
  son:            "technique",
  "assistant-real": "technique",
  script:         "technique",
  acteur:         "jeu",
};
```

#### Selection des forces

L'algorithme `generateTalentCard()` selectionne **2 forces** de la categorie :
- Si `creativityScore >= 7` : premiere force de la categorie
- Si `participationScore >= 7` : deuxieme force de la categorie
- Sinon : remplit avec les forces restantes de la categorie

**Principe fondamental : les cartes ne contiennent QUE des forces.** Jamais de faiblesses, jamais de jugement negatif. C'est de la valorisation pure.

---

## API Inter-seance

### `POST /api/sessions/[id]/equipe-compute` --- Calcul des points

Appele par le facilitateur **avant** la position 3 (choix de role). Flux :

1. Recupere tous les eleves actifs
2. Compte les `responses` (participation)
3. Compte les `module10_etsi` + `module10_personnages` + `module10_pitchs` (creativite)
4. Compte les `module6_missions` done + `module12_votes` (engagement)
5. Normalise sur 10 par rapport au max de la classe
6. Classe via `rankStudents()`
7. Upsert dans `module8_points`
8. Retourne le classement complet au facilitateur

### `PUT /api/sessions/[id]/equipe-compute` --- Generation des cartes talent

Appele **apres** que tous les roles sont attribues (position 3 terminee). Flux :

1. Recupere tous les roles attribues (`module8_roles`)
2. Recupere les scores de chaque eleve (`module8_points`)
3. Pour chaque eleve : `generateTalentCard(student, scores, roleKey)`
4. Upsert dans `module8_talent_cards`
5. Retourne le nombre de cartes generees

---

## Mapping technique

### Fichiers principaux

| Element                | Chemin                                                                 |
|------------------------|------------------------------------------------------------------------|
| Handler                | `src/app/api/sessions/[id]/situation/handlers/module8.ts`             |
| Data / Config          | `src/lib/module-equipe-data.ts`                                        |
| Inter-seance POST      | `src/app/api/sessions/[id]/equipe-compute/route.ts` (POST = points)  |
| Inter-seance PUT       | `src/app/api/sessions/[id]/equipe-compute/route.ts` (PUT = cartes)   |
| CRUD API               | `src/app/api/sessions/[id]/scenario/route.ts` (POST type="quiz-metier" / type="choose-role") |
| Composant Quiz         | `src/components/play/module-8/metier-quiz.tsx`                         |
| Composant Role Picker  | `src/components/play/module-8/role-picker.tsx`                         |
| Composant Talent Card  | `src/components/play/module-8/talent-card.tsx`                         |
| Composant Team Recap   | `src/components/play/module-8/team-recap.tsx`                          |
| Polling                | `Module8Data` dans `src/hooks/use-session-polling.ts`                 |
| Migration              | `supabase/migrations/062_module8_equipe.sql`                           |
| Constants              | `MODULE_SEANCE_SITUATIONS[8]` dans `src/lib/constants.ts`              |

### Tables DB

| Table                  | Description                              | Cle unique                    |
|------------------------|------------------------------------------|-------------------------------|
| `module8_quiz`         | Reponses au quiz V/F                     | `(session_id, student_id, metier_key)` |
| `module8_points`       | Points et classement (facilitateur only) | `(session_id, student_id)`    |
| `module8_roles`        | Attribution des roles                    | `(session_id, student_id)` + `(session_id, role_key)` |
| `module8_talent_cards` | Cartes talents generees                  | `(session_id, student_id)`    |

### Schema DB detaille

```sql
-- module8_quiz
metier_key TEXT NOT NULL,
believed_role TEXT DEFAULT '',
correct BOOLEAN DEFAULT FALSE

-- module8_points
participation_score INT DEFAULT 0,
creativity_score INT DEFAULT 0,
engagement_score INT DEFAULT 0,
total_score INT GENERATED ALWAYS AS (participation_score + creativity_score + engagement_score) STORED,
rank INT

-- module8_roles
role_key TEXT NOT NULL,
is_veto BOOLEAN DEFAULT FALSE
-- Double UNIQUE: (session_id, student_id) + (session_id, role_key)

-- module8_talent_cards
talent_category TEXT NOT NULL CHECK (talent_category IN ('jeu', 'image', 'technique')),
strengths TEXT[] DEFAULT '{}',
role_key TEXT
```

### Types TypeScript

```typescript
// src/lib/module-equipe-data.ts
export interface FicheMetier {
  key: string;          // "realisateur", "cadreur", ...
  label: string;        // "Realisateur-rice"
  description: string;
  skills: string[];     // ["Leadership", "Vision artistique", "Communication"]
  emoji: string;
  color: string;
}

export interface QuizMetier {
  metierKey: string;
  statement: string;
  isTrue: boolean;
  explanation: string;
}
```

### Donnees retournees par l'API

**Position 1 (quiz) :**
```typescript
module8: {
  type: "quiz",
  position: 1,
  quiz: [{ metierKey, statement, metierLabel, metierEmoji }],
  studentAnswers: [{ metierKey, correct }],
  hasAnswered: boolean,
}
```

**Position 2 (debrief) :**
```typescript
module8: {
  type: "debrief",
  position: 2,
  corrections: [{ metierKey, statement, isTrue, explanation, metierLabel, metierEmoji }],
  classResults: Record<string, { correct: number; wrong: number }>,
  fiches: FICHES_METIER,
}
```

**Position 3 (role-choice) :**
```typescript
module8: {
  type: "role-choice",
  position: 3,
  studentRank: number | null,        // rang de l'eleve (invisible pour lui)
  isMyTurn: boolean,                  // seule info visible : est-ce que c'est mon tour ?
  availableRoles: [{ key, label, description, emoji, color }],
  takenRoles: [{ roleKey, studentId, isVeto, roleLabel }],
  ranking: [...] | null,              // null cote eleve, complet cote facilitateur
  pointsComputed: boolean,
}
```

**Position 4 (team-recap) :**
```typescript
module8: {
  type: "team-recap",
  position: 4,
  team: [{
    studentId, displayName, avatarSeed,
    roleKey, roleLabel, roleEmoji, roleColor,
    isVeto,
  }],
}
```

**Position 5 (talent-card) :**
```typescript
module8: {
  type: "talent-card",
  position: 5,
  talentCard: {
    displayName, avatarSeed,
    roleKey, roleLabel, roleEmoji,
    talentCategory, talentCategoryLabel, talentCategoryColor,
    strengths: string[],
  } | null,
}
```

---

## Formule 2 vs Formule 3 (Adrian)

Adrian decrit deux modes de fonctionnement pour le tournage :

| Formule   | Description                                                     | Duree tournage |
|-----------|-----------------------------------------------------------------|----------------|
| Formule 2 | Eleves gardent leur role pendant tout le tournage               | Tournages courts |
| Formule 3 | Eleves observent plusieurs postes, choisissent un poste par demi-journee | Tournages longs |

Le code actuel supporte la **Formule 2** (un role fixe par eleve, attribue definitivement en position 3). La Formule 3 necessiterait un systeme de rotation non implemente.

---

## Documents par poste (Adrian --- non implemente)

Adrian prevoit que chaque role recoit un **document simplifie** :

| Role               | Document                                              |
|--------------------|-------------------------------------------------------|
| Realisateur        | Extraits scenario + intentions de mise en scene        |
| Cadreur            | Liste des plans + storyboard (M7)                     |
| Scripte            | Fiche de continuite entre les scenes                   |
| Assistant realisateur | Plan de travail + planning                          |
| Ingenieur son      | Liste des dialogues + notes d'ambiance                 |
| Acteur             | Texte des scenes + notes d'interpretation              |

Ces documents ne sont **pas implementes** dans le code actuel. Ils pourraient etre generes automatiquement a partir des donnees M6 + M7.

---

## Principes pedagogiques Adrian

- **"Le film devient un projet reel."** Apres les modules d'ecriture et de mise en scene, le Module 8 concretise le passage a la production.
- **Recompenser l'implication, pas le talent.** Le classement est base sur la participation, la creativite et l'engagement --- pas sur la "qualite" des contributions. Tout le monde peut etre premier s'il s'implique.
- **Classement invisible.** Les eleves ne voient **jamais** les scores ni le classement. Ils savent uniquement quand c'est leur tour. Cela evite la competition toxique et les comparaisons.
- **Cartes ne contiennent QUE des forces.** Valoriser, jamais juger. Pas de "points faibles", pas de "a ameliorer". Chaque eleve repart avec une carte positive.
- **Metaphore de l'equipe de foot.** Le gardien n'est pas moins important que l'attaquant. L'ingenieur son n'est pas moins important que le realisateur.
- **Veto pedagogique.** Le facilitateur peut orienter un role si necessaire (eleve en difficulte qui a besoin d'un role specifique, equilibrage de l'equipe).

---

## Ecarts code vs document Adrian

| Point                      | Adrian                                         | Code actuel                             |
|----------------------------|-------------------------------------------------|-----------------------------------------|
| Quiz V/F                   | 6 affirmations specifiques                      | 6 affirmations (formulations adaptees)  |
| Roles                      | 6 roles                                         | 6 roles (OK, conforme)                  |
| Classement invisible       | Exige                                            | Implemente (scores jamais envoyes cote eleve) |
| Cartes talents             | Style Pokemon/FIFA, forces uniquement            | Implemente avec 3 categories + 2 forces |
| Documents par poste        | Prevu                                            | Non implemente                          |
| Formule 3 (rotation)       | Decrite                                          | Non implementee                         |
| Nombre sources de points   | 3 (participation, creativite, engagement)        | 3 (OK, conforme)                        |
| Veto Banlieuwood           | "Le facilitateur peut orienter"                  | `is_veto` en base, UI a finaliser       |
