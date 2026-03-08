# Module 1 --- Observer (Le Regard)

> **Position dans le parcours** : Module 1 / 8 du parcours principal
> **Phase** : `idea` --- Positionnement
> **Couleur** : `#8B5CF6` (violet)
> **dbModule** : `1`
> **Durée totale estimee** : ~60 min (5 seances)

---

## Objectif pedagogique

Faire comprendre aux eleves que **leur regard est unique**. Casser la croyance "je ne suis pas creatif". L'observation est la premiere competence narrative : avant d'ecrire, on regarde. Avant de raconter, on interprete.

## Competence developpee

**Regarder, observer, interpreter.**

## Ce que l'eleve apprend

> "Mon regard est unique, je peux imaginer."

---

## Structure du module (5 seances)

### Vue synoptique

| Seance | ID code | dbSeance | Situations | Type | Duree | Composant |
|--------|---------|----------|------------|------|-------|-----------|
| 1 - Positionnement | `m1a` | 1 | 8 QCM | QCM interactif | 10 min | `PositioningState` |
| 2 - Image 1 "La Rue" | `m1b` | 2 | 1 | Ecriture + confrontation | 15 min | `ImageQuestionState` |
| 3 - Image 2 "L'Interieur" | `m1c` | 3 | 1 | Observation bi-phase | 15 min | `ImageQuestionState` |
| 4 - Image 3 "Le Banc" | `m1d` | 4 | 1 | Ecriture + confrontation | 10 min | `ImageQuestionState` |
| 5 - Carnet d'idees | `m1e` | 5 | 1 | Ecriture libre | 10 min | `NotebookState` |

### Constante `MODULE_SEANCE_SITUATIONS`

```typescript
// src/lib/constants.ts
1: { 1: 8, 2: 1, 3: 1, 4: 1, 5: 1 }
```

---

## Detail par seance

### Seance 1 --- Positionnement (m1a)

**Principe** : 8 QCM sur tablette/telephone. Engagement immediat, brise-glace rapide. Questions du type : "regardes-tu des films", "preferes-tu jouer ou inventer", etc.

**Fonction pedagogique** : lecture rapide de la classe. Les reponses alimentent un profil creatif (observation, narration, emotion, audace).

**Fonctionnement technique** :
- Le handler charge les 8 situations (`module=1, seance=1, position 1-8`) en une seule requete batch
- Les prompts sont differencies par niveau (`prompt_6_9`, `prompt_10_13`, `prompt_14_18`)
- Les reponses sont stockees dans `responses` avec le `situation_id` correspondant
- Le pilote voit la distribution des options en temps reel (`optionDistribution`)
- L'eleve repond question par question ; le composant affiche la progression (`answeredCount / totalQ`)

**Composant** : `PositioningState` (`src/components/play/module-1/positioning-state.tsx`)
- Affiche la question courante avec ses options
- Gere le submit via `POST /api/sessions/{id}/respond`
- Marque `onAnswered()` apres chaque reponse
- Animation `motion` a chaque transition

**Donnees retournees par l'API** :
```typescript
module1: {
  type: "positioning",
  questions: [{ index, situationId, text, measure, options }],
  answeredQuestions: Record<number, boolean>,
  answeredOptions: Record<number, string>,
  responseCounts: Record<number, number>,
  optionDistribution: Record<string, number> | null,
  totalSeances: 5,
  currentSeance: 1,
}
```

### Seance 2 --- Image 1 "La Rue" (m1b)

**Principe** : Projection d'une image neutre. Question ouverte : "Imagine ce qu'il se passe apres". L'eleve ecrit librement. Puis confrontation de 2 reponses anonymes contrastees (choisies par l'intervenant).

**Fonctionnement technique** :
- 1 seule situation (`module=1, seance=2, position=1`)
- L'image est chargee depuis la table `module1_images` (position=1)
- Les relances viennent de `module1_relances` (image_position, age_level)
- Confrontation : quand `session.status === "reviewing"`, le handler charge les 2 reponses marquees `is_highlighted=true`

**Composant** : `ImageQuestionState` (`src/components/play/module-1/image-question-state.tsx`)

**Donnees retournees** :
```typescript
module1: {
  type: "image",
  image: { position, title, description, url },
  question: { situationId, text, relance, measure },
  hasResponded: boolean,
  responsesCount: number,
  confrontation: { responseA, responseB } | null,
  totalSeances: 5,
  currentSeance: 2,
}
```

### Seance 3 --- Image 2 "L'Interieur" (m1c)

**Principe** : Observation vs interpretation. L'image est plus complexe. **Bi-phase** :
- Phase 1 : "Decris ce que tu vois dans cette image. Les objets, les couleurs, la lumiere."
- Phase 2 : "Que peuvent signifier ces details ? Qu'est-ce que cette image raconte ?"

**Fonctionnement technique** :
- La seance 3 active le mode `isTwoPhase = true` dans le handler
- L'eleve soumet 2 reponses successives pour la meme `situation_id`
- `currentPhase` passe de 1 a 2 quand la premiere reponse est enregistree
- `hasResponded = true` uniquement quand les 2 phases sont completees

**Donnees supplementaires** :
```typescript
twoPhase: true,
currentPhase: 1 | 2,
phase1Text: string | null,  // texte de la phase 1 (pour contexte)
```

### Seance 4 --- Image 3 "Le Banc" (m1d)

**Principe** : Image avec **ambiguite deliberee**. Double lecture possible (punition ou recompense ? abandon ou liberte ?). L'eleve decouvre que la meme image peut raconter des histoires completement differentes.

**Note intervenant** : "Peut etre fait rapidement ou saute si le temps manque." Cette seance est optionnelle.

**Fonctionnement technique** : Identique a la seance 2 (image simple, pas bi-phase).

### Seance 5 --- Carnet d'idees (m1e)

**Principe** : Mission d'observation du reel. L'eleve note une situation reelle vecue : dispute, moment genant, injustice, scene observee. C'est une page blanche libre.

**Fonctionnement technique** :
- Le handler charge la situation `module=1, seance=5, position=1`
- Si l'eleve a deja soumis, `existingText` contient son texte
- Le composant permet l'ecriture libre sans contrainte de format

**Composant** : `NotebookState` (`src/components/play/module-1/notebook-state.tsx`)

**Donnees retournees** :
```typescript
module1: {
  type: "notebook",
  question: { situationId, text, relance, measure },
  existingText: string | undefined,
  responsesCount: number,
  totalSeances: 5,
  currentSeance: 5,
}
```

---

## Mapping technique complet

### Fichiers cle

| Element | Chemin |
|---------|--------|
| Handler API | `src/app/api/sessions/[id]/situation/handlers/module1.ts` |
| Dispatch | `src/app/api/sessions/[id]/situation/route.ts` (L.45-47) |
| Composants eleve | `src/components/play/module-1/positioning-state.tsx` |
| | `src/components/play/module-1/image-question-state.tsx` |
| | `src/components/play/module-1/notebook-state.tsx` |
| Types polling | `src/hooks/use-session-polling.ts` (`Module1Data`) |
| Definition module | `src/lib/modules-data.ts` (IDs `m1a` a `m1e`) |
| Constantes | `src/lib/constants.ts` (MODULE_SEANCE_SITUATIONS[1]) |
| Categories | `src/lib/constants.ts` (`positionnement`, `image`, `carnet`) |

### Tables Supabase

| Table | Usage |
|-------|-------|
| `situations` | Questions (module=1, seance=1-5) avec prompts par niveau |
| `responses` | Reponses des eleves (texte libre ou cle d'option QCM) |
| `module1_images` | Images projetees (position 1-3 = 3 images) |
| `module1_relances` | Relances par image + niveau d'age |
| `students` | Comptage connectes |

### Migrations

- `009_module1.sql` --- Schema initial module 1
- `019_module1_redesign.sql` --- Refonte Adrian (images + relances)

### Categories narratives

```typescript
// src/lib/constants.ts
{ key: "positionnement", label: "Positionnement", color: "#8B5CF6" }
{ key: "image",          label: "Image",          color: "#4ECDC4" }
{ key: "carnet",         label: "Carnet",         color: "#F59E0B" }
```

---

## Interface `Module1Data`

```typescript
// src/hooks/use-session-polling.ts
export interface Module1Data {
  type: "positioning" | "image" | "notebook";
  // Positioning (seance 1)
  questions?: { index: number; situationId: string | null; text: string; measure: string; options?: { key: string; label: string }[] }[];
  answeredQuestions?: Record<number, boolean>;
  answeredOptions?: Record<number, string>;
  responseCounts?: Record<number, number>;
  optionDistribution?: Record<string, number> | null;
  // Image (seances 2-4)
  image?: { position: number; title: string; description: string; url: string } | null;
  question?: { situationId: string; text: string; relance: string; measure: string };
  hasResponded?: boolean;
  responsesCount?: number;
  confrontation?: { responseA: string; responseB: string } | null;
  // Two-phase (seance 3)
  twoPhase?: boolean;
  currentPhase?: number;
  phase1Text?: string | null;
  // Notebook (seance 5)
  existingText?: string;
  // Common
  totalSeances: number;
  currentSeance: number;
}
```

---

## Interseance M1 vers M2

Les donnees collectees pendant le Module 1 permettent de :
- Degager des **tendances d'observation** dans la classe (descriptifs vs interpretatifs)
- Reperer les **profils creatifs** via les reponses au QCM de positionnement
- Identifier les eleves a l'aise avec l'ecriture libre vs ceux qui ont besoin de cadrage
- Preparer les **aides pertinentes** pour le Module 2 (Emotion Cachee)

Les reponses du positionnement QCM (8 questions) produisent un profil brut non affiche a l'eleve mais exploitable par l'intervenant via les statistiques de session.

---

## Principes pedagogiques Adrian

1. **Ne pas commenter pendant l'ecriture.** Laisser imaginer librement. Les differences sont observees, pas jugees.
2. **L'image est un declencheur, pas un exercice.** Elle doit etre suffisamment neutre/ambigue pour que chaque eleve y projette son monde.
3. **La confrontation est anonyme.** On compare des textes, pas des eleves. L'objectif est de montrer que le meme stimulus produit des lectures differentes.
4. **Pas de bonne reponse.** Chaque interpretation est valide. Le facilitateur ne corrige pas, il montre la diversite.
5. **Le carnet d'idees est personnel.** L'eleve y note ce qu'il veut. Cette trace servira plus tard dans le parcours.
6. **Le QCM de positionnement n'est pas un test.** C'est un brise-glace qui cree de l'engagement immediat et donne a l'intervenant une cartographie de la classe.
