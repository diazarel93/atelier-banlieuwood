# Module 2 --- Comprendre (La Mecanique de la Scene)

> **Position dans le parcours** : Module 2 / 8 du parcours principal
> **Phase** : `emotion` --- Emotion Cachee + `cinema` --- Le Cinema
> **Couleurs** : `#EC4899` (rose, Bloc B) / `#F59E0B` (ambre, Bloc A)
> **dbModules** : `9` (Bloc A) + `2` (Bloc B)
> **Duree totale estimee** : ~160 min (8 seances)

---

## Objectif pedagogique

Faire **ressentir** qu'une scene fonctionne car elle repose sur **intention + obstacle + changement**. L'eleve ne l'apprend pas par un cours : il le decouvre en construisant lui-meme une scene avec des contraintes.

## Competence developpee

**Analyser.**

## Ce que l'eleve apprend

> "Une scene = personnage + objectif + obstacle + changement."

---

## Structure en 2 blocs

Le Module 2 est compose de deux blocs distincts qui peuvent etre joues dans l'ordre ou independamment :

```
Module 2 — Comprendre
├── Bloc A — Cinema & Lecture (dbModule=9, 4 seances, ID m2a-m2d)
│   Comprendre ce que c'est que "produire un film"
│
└── Bloc B — Emotion Cachee (dbModule=2, 4 seances, ID u2a-u2d)
    Construire une scene a partir d'une emotion
```

---

## Bloc A --- Cinema & Lecture (dbModule=9)

### Vue synoptique Bloc A

| Seance | ID code | dbSeance | Situations | Titre | Duree |
|--------|---------|----------|------------|-------|-------|
| 1 | `m2a` | 1 | 8 | Le Cinema | 20 min |
| 2 | `m2b` | 2 | 5 | Les Choix (Budget) | 15 min |
| 3 | `m2c` | 3 | 8 | Les Imprevus | 20 min |
| 4 | `m2d` | 4 | 8 | Le Plan | 20 min |

### Constante `MODULE_SEANCE_SITUATIONS`

```typescript
// src/lib/constants.ts
9: { 1: 8, 2: 5, 3: 8, 4: 8 }
```

### Detail des seances Bloc A

**Seance 1 --- Le Cinema (m2a)** : 8 QCM sur les metiers, les couts, les contraintes du cinema. "Comment on fait un film ?" L'objectif est de comprendre ce que "produire un film" signifie a leur echelle.

**Seance 2 --- Les Choix (m2b)** : Jeu de budget. **100 credits d'energie creative** a repartir entre 5 categories de production : casting, decors, image, son, montage. Chaque categorie propose 3 options a cout croissant.

**Seance 3 --- Les Imprevus (m2c)** : Problemes de tournage --- acteur absent, pluie, batterie vide. 8 questions pour apprendre a s'adapter comme un vrai producteur.

**Seance 4 --- Le Plan (m2d)** : Synthese. Organiser le tournage : planning, roles, scenes cles, plan B. L'eleve devient producteur.

### Systeme de budget (Seance 2)

```typescript
// src/lib/constants.ts
BUDGET_TOTAL = 100;         // Credits disponibles
BUDGET_RESERVE_MIN = 10;    // Reserve obligatoire

PRODUCTION_CATEGORIES = [
  { key: "acteurs",   label: "Casting",  options: [5, 20, 40] },
  { key: "decors",    label: "Decors",   options: [5, 20, 35] },
  { key: "technique", label: "Image",    options: [0, 10, 25] },
  { key: "son",       label: "Son",      options: [0, 10, 20] },
  { key: "montage",   label: "Montage",  options: [0, 10, 25] },
];
```

**Options detaillees** :

| Categorie | Option economique | Option standard | Option premium |
|-----------|-------------------|-----------------|----------------|
| Casting | Figurants (toi seul) --- 5 | Amateurs (ton groupe) --- 20 | Stars (toute la classe) --- 40 |
| Decors | Huis clos (1 salle) --- 5 | Lieu simple (2-3 endroits) --- 20 | Lieu exceptionnel --- 35 |
| Image | Brut (plan fixe) --- 0 | Soigne (mouvements) --- 10 | Cinema (lumiere) --- 25 |
| Son | Muet (sous-titres) --- 0 | Direct (voix) --- 10 | Bande-son --- 20 |
| Montage | Plan-sequence --- 0 | Coupe (CapCut) --- 10 | Travaille (effets) --- 25 |

**Message** : "Plus c'est spectaculaire, plus ca coute."

Le pilote voit les moyennes budgetaires de la classe via `budgetStats` dans l'API.

### Mapping technique Bloc A

- **Handler** : standard `handleStandard()` dans `situation/route.ts` (modules 3+ et 9)
- **Composant budget** : `src/components/play/module-9/BudgetState` (seance 2 specifique)
- **Table budget** : `module2_budgets` (session_id, student_id, choices JSONB)
- **Categories** : `metiers`, `budget`, `contrainte`, `resolution`, `organisation`

---

## Bloc B --- Emotion Cachee (dbModule=2)

### Vue synoptique Bloc B

| Seance | ID code | dbSeance | Situations | Titre | Duree | Composant special |
|--------|---------|----------|------------|-------|-------|-------------------|
| 1 | `u2a` | 1 | 3 | Mise en bain | 20 min | `ChecklistState` (index 0) |
| 2 | `u2b` | 2 | 2 | Emotion Cachee | 25 min | `SceneBuilderState` (index 1) |
| 3 | `u2c` | 3 | 2 | Phase Collective | 20 min | Comparaison enrichie |
| 4 | `u2d` | 4 | 2 | Cloture | 15 min | Standard |

### Constante `MODULE_SEANCE_SITUATIONS`

```typescript
// src/lib/constants.ts
2: { 1: 3, 2: 2, 3: 2, 4: 2 }
```

### Detail des seances Bloc B

#### Seance 1 --- Mise en bain (u2a)

**3 situations** articulees autour de l'entree dans l'emotion :

- **Index 0 : Checklist culturelle** (composant special `ChecklistState`). L'eleve selectionne parmi 20 contenus connus (films, series, anime). Le pilote voit les `topItems` (les 3 plus populaires).
- **Index 1-2 : Questions standard** (QCM/ouvertes). Raconter une scene marquante, decryptage de l'emotion cachee.

**5 emotions disponibles** :
| Cle | Label | Couleur | Description |
|-----|-------|---------|-------------|
| `exclusion` | Peur d'etre exclu | `#8B5CF6` | Se sentir rejete, invisible |
| `injustice` | Colere face a une injustice | `#EF4444` | Quelque chose de profondement injuste |
| `honte` | Honte apres une erreur | `#F59E0B` | Vouloir disparaitre |
| `jalousie` | Jalousie envers un ami | `#10B981` | Envier ce que l'autre a |
| `joie_fragile` | Joie fragile | `#EC4899` | Un bonheur qui pourrait s'effondrer |

**Catalogue culturel** (20 items) : Squid Game, One Piece, Spider-Verse, Stranger Things, Naruto, Harry Potter, Demon Slayer, Black Panther, Mercredi, L'Attaque des Titans, Encanto, The Last of Us, Jujutsu Kaisen, Top Gun, Euphoria, Dragon Ball, Hunger Games, La Casa de Papel, Minecraft, My Hero Academia.

#### Seance 2 --- Emotion Cachee (u2b)

**2 situations** :

- **Index 0 : QCM emotion** (question fermee standard). L'eleve choisit son emotion parmi les 5.
- **Index 1 : Scene Builder** (composant special `SceneBuilderState`). L'eleve construit une scene :
  - **Zone A** : "Mon personnage veut... / Mais... / A la fin..." (intention, obstacle, changement --- texte libre)
  - **Zone B** : 5 emplacements, 8 jetons. Choisir des elements de scene a "acheter" selon leur cout en jetons.

#### Seance 3 --- Phase Collective (u2c)

**2 situations** avec comparaison enrichie. Le pilote selectionne 2 scenes contrastees. Le handler charge les scenes depuis `module5_scenes` et enrichit les elements via `getElement()` pour afficher labels, tiers et couts.

Donnees supplementaires dans la reponse :
```typescript
module5: {
  type: "comparison",
  comparison: {
    sceneA: { emotion, intention, obstacle, changement, elements[] },
    sceneB: { emotion, intention, obstacle, changement, elements[] },
  }
}
```

#### Seance 4 --- Cloture (u2d)

**2 situations** standard. L'eleve nomme le theme et l'arc du personnage. Bilan du module.

---

## Systeme de jetons (Scene Builder)

Le constructeur de scene utilise un systeme economique a 4 paliers :

### Elements disponibles (25 elements, 4 tiers)

| Tier | Cout | Couleur | Elements |
|------|------|---------|----------|
| 0 --- Gratuit | 0 jeton | `#4ECDC4` (teal) | Dialogue, Silence, Gros plan, Ralenti, Objet symbolique |
| 1 | 1 jeton | `#F59E0B` (ambre) | Mensonge, Secret cache, Revelation, Conflit verbal, Rivalite explicite |
| 2 | 2 jetons | `#FF6B35` (orange) | Tournage de nuit, Musique marquee, Personnage secondaire, Figurants, Vehicule |
| 3 --- Cher | 3 jetons | `#EF4444` (rouge) | Explosion, Accident majeur, Effet special, Cascade, Changement d'epoque |

### Contraintes

```typescript
// src/lib/module5-data.ts
MAX_SLOTS = 5;   // Nombre maximum d'emplacements
MAX_TOKENS = 8;  // Nombre maximum de jetons
MIN_CHECKLIST = 3; // Minimum pour la checklist seance 1
```

**Message pedagogique** : "Plus c'est spectaculaire, plus ca coute." L'eleve decouvre que la contrainte budgetaire force la creativite.

---

## Mapping technique complet

### Fichiers cle

| Element | Chemin |
|---------|--------|
| Handler Bloc B | `src/app/api/sessions/[id]/situation/handlers/module2.ts` |
| Handler Bloc B (standard) | `src/app/api/sessions/[id]/situation/handlers/module5.ts` |
| Dispatch | `src/app/api/sessions/[id]/situation/route.ts` (L.49-52 pour module 2) |
| Composants eleve | `src/components/play/module-2/checklist-state.tsx` |
| | `src/components/play/module-2/scene-builder-state.tsx` |
| Composant budget | `src/components/play/module-9/` (BudgetState) |
| Types polling | `src/hooks/use-session-polling.ts` (`Module5Data`) |
| Donnees statiques M2B | `src/lib/module5-data.ts` |
| Donnees budget | `src/lib/constants.ts` (PRODUCTION_CATEGORIES, BUDGET_*) |
| Definitions modules | `src/lib/modules-data.ts` (IDs `u2a`-`u2d`, `m2a`-`m2d`) |
| Categories | `src/lib/constants.ts` (`emotion_cachee`, `metiers`, `budget`, etc.) |

### Tables Supabase

| Table | Usage |
|-------|-------|
| `situations` | Questions (module=2 pour Bloc B, module=9 pour Bloc A) |
| `responses` | Reponses eleves (QCM + texte libre) |
| `module5_checklists` | Checklist culturelle (selected_items, chosen_item) |
| `module5_scenes` | Scenes construites (emotion, intention, obstacle, changement, elements, tokens_used, slots_used) |
| `module5_comparisons` | Paire de scenes pour la phase collective (scene_a_id, scene_b_id) |
| `module2_budgets` | Choix budgetaires Bloc A (choices JSONB) |

### Migrations

- `020_module2_situations.sql` --- Situations du module 2
- `021_module5_emotion_cachee.sql` --- Tables scenes + checklists + comparisons
- `022_renumber_modules.sql` --- Renumerotation (ancien M2 cinema -> M9)

### Categories narratives

```typescript
// Bloc B
{ key: "emotion_cachee", label: "Emotion", color: "#EC4899" }

// Bloc A
{ key: "metiers",      label: "Metiers",      color: "#3B82F6" }
{ key: "budget",       label: "Budget",       color: "#F59E0B" }
{ key: "contrainte",   label: "Contrainte",   color: "#8B5CF6" }
{ key: "resolution",   label: "Resolution",   color: "#EF4444" }
{ key: "organisation", label: "Organisation", color: "#10B981" }
```

---

## Interface `Module5Data`

```typescript
// src/hooks/use-session-polling.ts
export interface Module5Data {
  type: "checklist" | "scene-builder" | "comparison";
  // Checklist (seance 1 index 0)
  checklist?: { selected_items: string[]; chosen_item: string | null } | null;
  topItems?: { key: string; count: number }[];
  submitted?: boolean;
  submittedCount?: number;
  // Scene builder (seance 2 index 1)
  scene?: {
    id: string;
    emotion: string;
    intention: string;
    obstacle: string;
    changement: string;
    elements: { key: string; label: string; tier: number; cost: number }[];
    tokens_used: number;
    slots_used: number;
    ai_feedback: { strengths: string[]; suggestions: string[]; summary: string } | null;
  } | null;
  chosenEmotion?: string | null;
  emotionDistribution?: Record<string, number>;
  // Comparison (seance 3)
  comparison?: {
    sceneA: { id; emotion; intention; obstacle; changement; elements[] };
    sceneB: { id; emotion; intention; obstacle; changement; elements[] };
  } | null;
}
```

---

## Interseance M2 vers M3

Les donnees accumulees pendant le Module 2 alimentent la preparation du Module 3 (Imaginer) :

- **Emotions dominantes** de la classe (distribution visible via `emotionDistribution`)
- **Types de scenes reussies** : analyse des elements choisis, diversite ou convergence
- **Premiers indices narratifs** : les intentions et obstacles ecrits en texte libre
- **Profil budgetaire** (Bloc A) : ou la classe investit (casting ? effets ? son ?)
- Les aides M3 seront adaptees aux tendances observees

---

## Principes pedagogiques Adrian

1. **L'emotion n'est pas nommee, elle est vecue.** L'eleve choisit une emotion parce qu'elle resonne, pas parce qu'il la comprend intellectuellement.
2. **La contrainte de jetons est ludique, pas punitive.** "Plus c'est spectaculaire, plus ca coute" --- l'eleve decouvre naturellement que les choix simples sont souvent les plus forts.
3. **La confrontation de scenes est bienveillante.** On compare des constructions, pas des eleves. L'anonymat protege.
4. **Le budget n'est pas un exercice de maths.** C'est une experience de choix : chaque decision raconte quelque chose sur la vision du film.
5. **Les inchoerences ne bloquent pas.** Un eleve qui met "explosion" dans une scene sur la honte ne se trompe pas --- il explore.
6. **Le facilitateur observe, ne juge pas.** Les differences sont des donnees, pas des erreurs.
