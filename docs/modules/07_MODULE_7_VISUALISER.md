# Module 7 --- Visualiser (La Mise en scene)

> **Position dans le parcours** : Module 7 / 8 du parcours principal
> **Phase** : `production` --- Mise en scene
> **dbModule** : `7`
> **Duree totale estimee** : ~40 min (1 seance, 4 positions)

---

## Objectif pedagogique

Comprendre le **langage visuel du cinema**. Transformer le scenario ecrit au Module 6 en **vision visuelle du film**. L'eleve apprend que raconter en images, c'est choisir quoi montrer et comment le montrer.

## Competence developpee

**Cadrer.**

## Ce que l'eleve apprend

> "Raconter en images = choisir quoi montrer et comment."

## Principe Adrian

**Theorie TRES COURTE.** Basculer vite vers l'application. Ce n'est **pas un cours de cinema**. Seulement 4 types de plans (pas de plongee, pas de contre-plongee, pas de focale, pas d'axe camera). Le jargon technique est reduit au strict minimum. L'objectif est que les eleves commencent a "voir leur film dans leur tete".

---

## Structure du module (4 positions)

### Vue synoptique

| Position | Type          | Label        | Composant           | Description                                          |
|----------|---------------|--------------|----------------------|------------------------------------------------------|
| 1        | `plans`       | Les plans    | `PlanTypesGallery`   | Les 4 plans fondamentaux du cinema                   |
| 2        | `comparaison` | Comparaison  | `ComparisonQuiz`     | 3 paires : meme scene, 2 cadrages differents         |
| 3        | `decoupage`   | Decoupage    | `DecoupageBuilder`   | Mini-decoupage de 2-3 scenes cles du M6              |
| 4        | `storyboard`  | Storyboard   | `StoryboardView`     | Plans choisis assembles par scene                    |

### Constante `MODULE_SEANCE_SITUATIONS`

```typescript
// src/lib/constants.ts
7: { 1: 4 }  // Mise en scene: Plans (1), Comparaison (2), Decoupage (3), Storyboard (4)
```

---

## Detail par position

### Position 1 --- Les 4 plans fondamentaux

Adrian limite volontairement a **4 types de plans**. Pas de plongee/contre-plongee (trop technique). Chaque plan repond a une question narrative simple :

```typescript
// src/lib/module-filmer-data.ts
export const PLANS_FONDAMENTAUX: PlanFondamental[] = [
  {
    key: "plan-large",
    label: "Plan large",
    description: "Où sommes-nous ? Montre tout le decor et situe l'action.",
    question: "Ca se passe où ?",
    example: "La cour de l'ecole vue de loin, avec les eleves qui jouent.",
    color: "#3B82F6",   // bleu
  },
  {
    key: "plan-moyen",
    label: "Plan moyen",
    description: "Le personnage en situation. On voit ce qu'il fait.",
    question: "Que fait le personnage ?",
    example: "Deux eleves assis sur un banc, en train de discuter.",
    color: "#10B981",   // vert
  },
  {
    key: "gros-plan",
    label: "Gros plan",
    description: "Une emotion ou un detail important. On ressent ce que le personnage ressent.",
    question: "Qu'est-ce qu'on ressent ?",
    example: "Le visage en larmes d'un personnage, en gros plan.",
    color: "#EF4444",   // orange/rouge
  },
  {
    key: "plan-reaction",
    label: "Plan reaction",
    description: "Comment un personnage reagit a ce qui vient de se passer.",
    question: "Comment reagit l'autre ?",
    example: "Le visage surpris de l'ami qui vient d'apprendre la nouvelle.",
    color: "#F59E0B",   // violet/ambre
  },
];
```

**Recapitulatif :**

| Plan           | Couleur | Question narrative            | Fonction                    |
|----------------|---------|-------------------------------|-----------------------------|
| Plan large     | Bleu    | Où sommes-nous ?              | Situer l'action             |
| Plan moyen     | Vert    | Que fait le personnage ?      | Montrer l'action            |
| Gros plan      | Orange  | Qu'est-ce qu'on ressent ?     | Capter l'emotion            |
| Plan reaction  | Violet  | Comment reagit l'autre ?      | Montrer l'impact            |

### Position 2 --- Comparaison visuelle

3 paires de scenes. Chaque paire montre la **meme scene** avec **2 cadrages differents**. L'eleve choisit celui qui "raconte mieux" et explique pourquoi (textarea).

```typescript
// src/lib/module-filmer-data.ts
export const COMPARISONS: Comparison[] = [
  {
    key: "comp1",
    sceneDescription: "Un eleve decouvre un message sur son casier.",
    planA: { type: "plan-large",
             description: "On voit le couloir entier, l'eleve est petit au fond." },
    planB: { type: "gros-plan",
             description: "On voit juste le visage de l'eleve qui lit le message." },
    question: "Quel cadrage rend la scene plus emouvante ?",
    explanation: "Le gros plan montre l'emotion. Le plan large montre la solitude.",
  },
  {
    key: "comp2",
    sceneDescription: "Deux amis se disputent dans la cour.",
    planA: { type: "plan-moyen", ... },
    planB: { type: "plan-reaction", ... },
    question: "Quel cadrage montre le mieux la tension ?",
    ...
  },
  {
    key: "comp3",
    sceneDescription: "Un professeur annonce les resultats d'un concours.",
    planA: { type: "plan-large", ... },
    planB: { type: "plan-reaction", ... },
    question: "Quel cadrage cree le plus de suspense ?",
    ...
  },
];
```

**Cote facilitateur**, les resultats agreges sont visibles (`comparisonResults`) : combien d'eleves ont choisi le plan A vs le plan B pour chaque comparaison.

**Cote eleve**, les reponses precedentes sont restituees (`studentComparisons`) pour indiquer ce qui a deja ete repondu.

### Position 3 --- Mini-decoupage

Le handler selectionne les **2-3 premieres scenes cles** du Module 6 :

```typescript
// handlers/module7.ts, ligne 122
const keyScenes = (scenes || []).slice(0, 3);
```

Pour chaque scene, un **template de decoupage** est genere via `buildDecoupageTemplate()` :

```typescript
// src/lib/module-filmer-data.ts
export function buildDecoupageTemplate(scene: { title: string; description: string }) {
  return {
    sceneTitle: scene.title,
    sceneDescription: scene.description,
    slots: [
      { position: 1, planType: "", description: "", intention: "" },
      { position: 2, planType: "", description: "", intention: "" },
      { position: 3, planType: "", description: "", intention: "" },
    ],
  };
}
```

Chaque slot represente un plan a definir :
- `planType` : un des 4 plans fondamentaux
- `description` : ce que l'on voit dans ce plan
- `intention` : pourquoi ce plan a ce moment (la raison narrative)

Le decoupage est **volontairement simplifie** : pas de focale, pas d'axe camera, pas de jargon. Juste type de plan + ce que l'on voit + intention.

### Position 4 --- Mini-storyboard

Vue d'assemblage : les plans choisis par les eleves sont regroupes par scene pour former un storyboard visuel. Le facilitateur peut valider le storyboard final (`module7_storyboard.validated`).

Le handler recupere tous les decoupages (`module7_decoupages`) pour la vue facilitateur et le storyboard valide le cas echeant.

---

## Vocabulaire technique simplifie

Un glossaire reduit est disponible mais non impose :

```typescript
// src/lib/module-filmer-data.ts
export const VOCABULAIRE_TECHNIQUE = [
  { key: "sequence",   label: "Sequence",
    definition: "Un ensemble de plans qui racontent une action complete" },
  { key: "raccord",    label: "Raccord",
    definition: "Le lien visuel entre deux plans pour que ca reste fluide" },
  { key: "champ-contrechamp", label: "Champ/Contre-champ",
    definition: "Alterner entre deux personnages qui se parlent" },
];
```

Ce vocabulaire est la pour le facilitateur, pas pour etre impose aux eleves.

---

## Mapping technique

### Fichiers principaux

| Element              | Chemin                                                                 |
|----------------------|------------------------------------------------------------------------|
| Handler              | `src/app/api/sessions/[id]/situation/handlers/module7.ts`             |
| Data / Config        | `src/lib/module-filmer-data.ts`                                        |
| CRUD API             | `src/app/api/sessions/[id]/scenario/route.ts` (POST type="comparison" / type="decoupage") |
| Composant Plans      | `src/components/play/module-7/plan-types-gallery.tsx`                  |
| Composant Comparaison | `src/components/play/module-7/comparison-quiz.tsx`                    |
| Composant Decoupage  | `src/components/play/module-7/decoupage-builder.tsx`                   |
| Composant Storyboard | `src/components/play/module-7/storyboard-view.tsx`                     |
| Polling              | `Module7Data` dans `src/hooks/use-session-polling.ts`                 |
| Migration            | `supabase/migrations/061_module7_mise_en_scene.sql`                    |
| Constants            | `MODULE_SEANCE_SITUATIONS[7]` dans `src/lib/constants.ts`              |

### Tables DB

| Table                 | Description                              | Cle unique                                |
|-----------------------|------------------------------------------|-------------------------------------------|
| `module7_comparisons` | Reponses au quiz de comparaison visuelle | `(session_id, student_id, comparison_key)` |
| `module7_decoupages`  | Decoupage par scene par eleve            | `(session_id, student_id, scene_id)`       |
| `module7_storyboard`  | Storyboard final valide                  | `(session_id)` UNIQUE                      |

### Schema DB detaille

```sql
-- module7_comparisons
comparison_key TEXT NOT NULL,     -- "comp1", "comp2", "comp3"
chosen_plan TEXT NOT NULL,        -- "plan-large", "gros-plan", etc.
reasoning TEXT DEFAULT '',        -- explication libre de l'eleve

-- module7_decoupages
scene_id UUID NOT NULL REFERENCES module6_scenes(id),  -- liaison directe au M6
plans JSONB DEFAULT '[]',         -- [{ position, planType, description, intention }]

-- module7_storyboard
scenes JSONB DEFAULT '[]',        -- assemblage final
validated BOOLEAN DEFAULT FALSE
```

Note : `module7_decoupages.scene_id` reference directement `module6_scenes(id)`, creant une **dependance forte** entre M6 et M7.

### Types TypeScript

```typescript
// src/lib/module-filmer-data.ts
export interface PlanFondamental {
  key: string;
  label: string;
  description: string;
  question: string;
  example: string;
  color: string;
}

export interface Comparison {
  key: string;
  sceneDescription: string;
  planA: { type: string; description: string };
  planB: { type: string; description: string };
  question: string;
  explanation: string;
}
```

### Donnees retournees par l'API

**Position 1 (plans) :**
```typescript
module7: {
  type: "plans",
  position: 1,
  plans: PLANS_FONDAMENTAUX,  // 4 plans avec key, label, description, question, example, color
}
```

**Position 2 (comparaison) :**
```typescript
module7: {
  type: "comparaison",
  position: 2,
  comparisons: COMPARISONS,   // 3 paires
  studentComparisons: [{ comparisonKey, chosenPlan, reasoning }],
  comparisonResults: Record<string, Record<string, number>> | null,  // facilitateur uniquement
}
```

**Position 3 (decoupage) :**
```typescript
module7: {
  type: "decoupage",
  position: 3,
  keyScenes: [{ id, sceneNumber, title, description, template }],
  studentDecoupages: [{ sceneId, plans }],
  planTypes: [{ key, label }],  // reference pour le seleteur
}
```

**Position 4 (storyboard) :**
```typescript
module7: {
  type: "storyboard",
  position: 4,
  storyboard: { scenes, validated } | null,
  allDecoupages: [{ sceneId, studentId, plans }],  // facilitateur
  scenes: [{ id, sceneNumber, title }],
}
```

---

## Interseance M7 vers M8

Le passage vers le Module 8 (L'Equipe) implique le **calcul des points** pour le classement invisible :

**`POST /api/sessions/[id]/equipe-compute`**

Ce endpoint :
1. Compte les reponses de chaque eleve (participation)
2. Compte les contributions creatives M10 (creativite)
3. Compte les missions M6 completees + votes M12 (engagement)
4. Normalise chaque score sur 10
5. Classe les eleves par total decroissant
6. Insere les resultats dans `module8_points`

Le facilitateur peut aussi preparer des **documents de tournage simplifies** par role (non implemente actuellement dans le code).

---

## Principes pedagogiques Adrian

- **"Les eleves doivent commencer a voir leur film dans leur tete."** C'est la phrase cle du Module 7. Avant, c'etait des mots ; maintenant, ce sont des images.
- **Le Module 7 = "le module où l'histoire devient enfin cinema."** La transition de l'ecrit au visuel.
- **Theorie minimale.** 4 plans, pas plus. Pas de jargon (focale, axe, dolly...). Chaque plan repond a une question simple.
- **Application immediate.** La comparaison visuelle (position 2) met directement en pratique la theorie de la position 1. Le decoupage (position 3) applique a "leur" scenario.
- **Pas de plongee/contre-plongee.** Adrian considere que c'est trop technique pour le niveau cible. L'essentiel est la comprehension narrative du cadrage, pas la technique camera.

---

## Ecarts code vs document Adrian

| Point                      | Adrian                                          | Code actuel                            |
|----------------------------|-------------------------------------------------|----------------------------------------|
| 4 plans fondamentaux       | 4 plans exactement                              | 4 plans (OK, conforme)                 |
| Pas de plongee             | Exclue explicitement                            | Non present (OK)                       |
| Comparaisons visuelles     | "Meme scene, 2 cadrages"                        | 3 paires implementees (OK)             |
| Scenes pour decoupage      | "1 scene de discussion + 1 scene d'action"      | slice(0, 3) --- 2-3 premieres scenes   |
| Images storyboard          | "Possiblement generees en inter-seance"         | Non implemente (storyboard = JSONB)    |
| Documents par role         | Evoque par Adrian                                | Non implemente                         |
