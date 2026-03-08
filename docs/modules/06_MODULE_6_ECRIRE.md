# Module 6 --- Ecrire (Le Scenario)

> **Position dans le parcours** : Module 6 / 8 du parcours principal
> **Phase** : `creation` --- Ecriture
> **dbModule** : `5`
> **Duree totale estimee** : ~50 min (1 seance, 5 positions)

---

## Objectif pedagogique

Transformer l'ossature collective (les gagnants du Module 5) en **scenario jouable**. Le travail est de completion, clarification et renforcement --- jamais de creation ex nihilo. L'IA fournit une trame incomplète ; les eleves la completent selon des roles creatifs assignes.

## Competence developpee

**Ecrire.**

## Ce que l'eleve apprend

> "Completer / ameliorer vaut mieux que partir de zero."

## Ratio tablette / oral

Adrian insiste : **30-40% tablette, 60-70% discussion humaine**. L'ecriture sur tablette est un support, pas une fin en soi. Le facilitateur organise des temps de discussion entre les positions pour que les eleves echangent sur ce qu'ils ecrivent.

---

## Structure du module (5 positions)

### Vue synoptique

| Position | Type         | Label           | Composant             | Description                                                    |
|----------|--------------|-----------------|------------------------|----------------------------------------------------------------|
| 1        | `frise`      | Frise narrative | `FriseNarrative`       | Timeline horizontale des 5 etapes narratives + gagnants M12    |
| 2        | `scenes-v0`  | Scenes V0       | `SceneCard`            | 4-6 scenes incompletes generees par l'IA                       |
| 3        | `mission`    | Ta mission      | `MissionState`         | Chaque eleve recoit un role creatif + une scene assignee       |
| 4        | `ecriture`   | Ecriture        | (textarea dans Mission) | Textarea pour completer la scene assignee                      |
| 5        | `assemblage` | Assemblage      | `ScenarioAssembly`     | Vue facilitateur : toutes contributions inserees + validation  |

### Constante `MODULE_SEANCE_SITUATIONS`

```typescript
// src/lib/constants.ts
5: { 1: 5 }  // Le Scenario: Frise (1), Scenes V0 (2), Mission (3), Ecriture (4), Assemblage (5)
```

---

## Detail par position

### Position 1 --- Frise narrative

La frise presente les **5 etapes narratives classiques**, chacune alimentee par un gagnant du Module 5 :

```typescript
// src/lib/module-scenario-data.ts
export const FRISE_STEPS = [
  { key: "situation-initiale",    label: "Situation initiale",    winnerManche: 2 },
  { key: "element-perturbateur",  label: "Element perturbateur",  winnerManche: 4 },
  { key: "peripeties",            label: "Peripeties",            winnerManche: 5 },
  { key: "climax",                label: "Climax",                winnerManche: 6 },
  { key: "denouement",            label: "Denouement",            winnerManche: 1 },
];
```

**Mapping gagnants M12 vers frise :**

| Etape narrative       | Manche M12 source | Logique                                      |
|-----------------------|--------------------|----------------------------------------------|
| Situation initiale    | Manche 2 (Situation) | La situation de depart choisie             |
| Element perturbateur  | Manche 4 (Objectif) | L'objectif du heros declenche l'action      |
| Peripeties            | Manche 5 (Obstacle) | L'obstacle cree les peripeties              |
| Climax                | Manche 6 (Premiere Scene) | La premiere scene donne le ton du climax |
| Denouement            | Manche 1 (Ton)      | Le ton determine la tonalite de la fin      |

Le handler recupere les `module12_winners` et injecte le texte gagnant dans chaque etape de la frise.

### Position 2 --- Scenes V0

L'IA a genere **4-6 scenes incompletes** entre M5 et M6 (via le endpoint inter-seance). Chaque scene comporte :

- `title` : titre court
- `description` : 2-3 phrases de contexte (pas le contenu complet)
- `act` : un des 3 actes narratifs (`setup`, `confrontation`, `resolution`)
- `status` : `incomplete` / `in_progress` / `complete`

Les 3 actes :

```typescript
export const ACTS = [
  { key: "setup",         label: "Situation initiale",
    description: "Le monde normal du heros, avant que tout bascule." },
  { key: "confrontation", label: "Confrontation",
    description: "Les obstacles s'accumulent, le heros est mis a l'epreuve." },
  { key: "resolution",    label: "Resolution",
    description: "Le climax et le denouement --- comment l'histoire se termine." },
];
```

**Le scenario V0 est une trame incomplete** (pas un scenario termine). Assez precis pour etre concret, assez incomplet pour donner du travail aux eleves.

### Position 3 --- Mission

Chaque eleve recoit **un role creatif** et **une scene assignee** :

| Role         | Cle         | Emoji | Description                                    |
|--------------|-------------|-------|------------------------------------------------|
| Dialoguiste  | `dialogue`  | `💬`  | Ecris les repliques de la scene                |
| Descripteur  | `description` | `🏠` | Decris les lieux et l'ambiance                 |
| Choregraphe  | `action`    | `🎬`  | Decris les actions et mouvements               |
| Emotionnel   | `emotion`   | `💭`  | Ajoute les emotions et pensees des personnages |

**Attribution des roles :**

L'algorithme `assignMissions()` fonctionne en round-robin priorise par profil creatif :

```typescript
// src/lib/module-scenario-data.ts
const profileToRole: Record<string, string> = {
  observateur: "description",   // L'observateur decrit naturellement
  narrateur:   "dialogue",      // Le narrateur sait faire parler
  emotif:      "emotion",       // L'emotif capte les sentiments
  audacieux:   "action",        // L'audacieux met en mouvement
};
```

Les eleves avec un profil creatif connu (issu du Module 1 - Positionnement) sont priorises et recoivent le role qui leur correspond. Les autres sont distribues en round-robin sur les 4 roles. Chaque eleve est assigne a `scenes[i % scenes.length]` (distribution circulaire sur les scenes).

### Position 4 --- Ecriture

L'eleve voit **sa mission** (role + scene) et dispose d'un **textarea** pour ecrire sa contribution. Les donnees retournees incluent le contenu existant de la scene (`sceneContent`) pour contexte.

Lorsque l'eleve soumet, le PATCH API :
1. Met a jour `module6_missions.content` et passe le status a `"done"`
2. Ajoute automatiquement la contribution au `module6_scenes.content` avec un prefixe de role (ex: `[DIALOGUE] ...`)

### Position 5 --- Assemblage

Vue reservee au **facilitateur**. Affiche :
- Toutes les scenes avec leur contenu enrichi par les contributions
- La liste des missions et leur status (pending/done)
- Le scenario final (`module6_scenario.full_text`) avec possibilite de validation

---

## Interseance M5 vers M6

**`POST /api/sessions/[id]/scenario-generate`**

Ce endpoint est appele par le facilitateur entre les deux modules. Flux complet :

1. **Recupere les gagnants M12** (`module12_winners`)
2. **Genere le prompt IA** via `generateScenesPrompt(winners, level)` :
   - Inclut ton, situation, personnages, objectif, obstacle, premiere scene
   - Adapte la complexite selon le niveau (`primaire`: 4 scenes, vocabulaire simple ; `lycee`: 5-6 scenes, vocabulaire riche)
3. **Appelle l'IA** (Ollama local ou Claude fallback) avec `temperature: 0.7`
4. **Parse le JSON** retourne par l'IA (tableau de scenes)
5. **Fallback** si l'IA echoue : genere 5 scenes generiques a partir des gagnants
6. **Insere les scenes** dans `module6_scenes` (upsert)
7. **Assigne les missions** via `assignMissions()`
8. **Cree l'entree scenario vide** dans `module6_scenario`

**Exemple de prompt genere :**

```
Tu es un scenariste experimente qui aide des eleves a ecrire leur premier scenario.

A partir des elements votes par la classe, genere des scenes INCOMPLETES.

## Elements collectifs :
- Ton/genre : Mysterieux
- Situation de depart : Un eleve trouve un message cache dans son casier
- Personnages : Ines, 15 ans --- toujours un casque sur les oreilles
- Objectif du heros : Prouver a tout le monde qu'on peut reussir autrement
- Obstacle principal : Un secret de famille que personne ne veut affronter
- Premiere scene : Plan fixe sur une porte qui s'ouvre lentement

## Instructions :
Utilise un vocabulaire accessible mais precis. 5 scenes.
[...]
```

---

## Mapping technique

### Fichiers principaux

| Element                | Chemin                                                               |
|------------------------|----------------------------------------------------------------------|
| Handler                | `src/app/api/sessions/[id]/situation/handlers/module6.ts`           |
| Data / Config          | `src/lib/module-scenario-data.ts`                                    |
| Inter-seance API       | `src/app/api/sessions/[id]/scenario-generate/route.ts`              |
| CRUD API (scenes/missions) | `src/app/api/sessions/[id]/scenario/route.ts`                  |
| Composant Frise        | `src/components/play/module-6/frise-narrative.tsx`                   |
| Composant Scene        | `src/components/play/module-6/scene-card.tsx`                        |
| Composant Mission      | `src/components/play/module-6/mission-state.tsx`                     |
| Composant Assemblage   | `src/components/play/module-6/scenario-assembly.tsx`                 |
| Polling                | `Module6Data` dans `src/hooks/use-session-polling.ts`               |
| Migration              | `supabase/migrations/060_module6_scenario.sql`                       |
| Constants              | `MODULE_SEANCE_SITUATIONS[5]` dans `src/lib/constants.ts`            |

### Tables DB

| Table               | Description                              | Cle unique                           |
|---------------------|------------------------------------------|--------------------------------------|
| `module6_scenes`    | Scenes generees par l'IA (V0)            | `(session_id, scene_number)`         |
| `module6_missions`  | Missions assignees aux eleves            | `(session_id, student_id, scene_id)` |
| `module6_scenario`  | Scenario assemble final                  | `(session_id)` UNIQUE                |

### Schema DB detaille

```sql
-- module6_scenes
scene_number INT CHECK (scene_number BETWEEN 1 AND 6)
act TEXT CHECK (act IN ('setup', 'confrontation', 'resolution'))
status TEXT DEFAULT 'incomplete' CHECK (status IN ('incomplete', 'in_progress', 'complete'))

-- module6_missions
role TEXT CHECK (role IN ('dialogue', 'description', 'action', 'emotion'))
status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'done'))

-- module6_scenario
full_text TEXT DEFAULT ''
validated BOOLEAN DEFAULT FALSE
```

### Types TypeScript

```typescript
// src/lib/module-scenario-data.ts
export interface ScenarioScene {
  id: string;
  sessionId: string;
  sceneNumber: number;
  title: string;
  description: string;
  act: "setup" | "confrontation" | "resolution";
  status: "incomplete" | "in_progress" | "complete";
  content: string;
}

export interface ScenarioMission {
  id: string;
  sessionId: string;
  sceneId: string;
  studentId: string;
  role: string;
  task: string;
  content: string;
  status: "pending" | "done";
}
```

### Donnees retournees par l'API

**Position 1 (frise) :**
```typescript
module6: {
  type: "frise",
  position: 1,
  friseSteps: [{ key, label, description, winnerManche, winnerText }],
  winners: Record<number, string>,
}
```

**Position 2 (scenes-v0) :**
```typescript
module6: {
  type: "scenes-v0",
  position: 2,
  scenes: [{ id, sceneNumber, title, description, act, status, content }],
  scenesReady: boolean,
}
```

**Position 3 (mission) :**
```typescript
module6: {
  type: "mission",
  position: 3,
  mission: { id, role, roleLabel, roleEmoji, task, sceneTitle, sceneDescription, status } | null,
  missionTypes: MISSION_TYPES,
}
```

**Position 4 (ecriture) :**
```typescript
module6: {
  type: "ecriture",
  position: 4,
  mission: { id, role, task, content, sceneTitle, sceneContent, status } | null,
}
```

**Position 5 (assemblage) :**
```typescript
module6: {
  type: "assemblage",
  position: 5,
  scenes: [{ id, sceneNumber, title, description, act, content, status }],
  missions: [{ id, studentId, role, content, status, sceneTitle }],
  scenario: { fullText, validated } | null,
}
```

---

## Interseance M6 vers M7

Le passage est **automatique**. Les scenes du Module 6 (`module6_scenes`) sont directement disponibles pour le decoupage du Module 7 (Visualiser). Le handler `handleModule7()` fait un SELECT sur `module6_scenes` pour recuperer les scenes cles a decouper.

---

## Principes pedagogiques Adrian

- **Pas de page blanche.** L'IA fournit toujours un brouillon incomplet. Les eleves ne partent jamais de zero.
- **Missions par profil creatif.** Chaque eleve recoit un role qui correspond (autant que possible) a son profil du Module 1. Observateur → description, narrateur → dialogue, etc.
- **Scribe unique par mission.** Un seul eleve tape pour une mission donnee. Pas tout le monde qui ecrit en meme temps sur le meme texte.
- **Minimum 2 eleves par mission possible.** Avec la distribution round-robin, plusieurs eleves peuvent avoir le meme role sur des scenes differentes.
- **Variantes locales possibles.** Le facilitateur peut reorganiser les missions selon les besoins de la classe.
- **L'ecriture est un prolongement du vote.** Le scenario est la materialisation des choix collectifs du Module 5. Les eleves ecrivent "leur" histoire.

---

## Ecarts code vs document Adrian

| Point                          | Adrian                                    | Code actuel                         |
|--------------------------------|-------------------------------------------|-------------------------------------|
| Nombre de scenes               | 4-6                                       | 4-6 (configurable par l'IA)         |
| Roles creatifs                 | 4 roles decrits                           | 4 roles implementes (OK)            |
| Profil creatif pour attribution | Attendu                                  | Implemente via `profileToRole`      |
| Validation scenario            | Facilitateur valide                       | `module6_scenario.validated` (OK)   |
| Discussion orale               | "60-70% du temps"                         | Non enforce techniquement (normal)  |
