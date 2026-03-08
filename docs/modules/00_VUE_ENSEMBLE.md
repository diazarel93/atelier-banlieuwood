# Vue d'ensemble — Modules Banlieuwood

## Parcours complet (8 modules d'Adrian + 3 bonus)

```
┌─────────────────────────────────────────────────────────────────┐
│                    PARCOURS PRINCIPAL                            │
│                                                                 │
│  M1 Observer → M2 Comprendre → M3 Imaginer → M4 Clarifier     │
│  (dbModule=1)  (dbModule=2+9)  (dbModule=10s1) (dbModule=10s2) │
│                                                                 │
│  M5 Construire → M6 Écrire → M7 Visualiser → M8 Produire      │
│  (dbModule=12)   (dbModule=5)  (dbModule=7)    (dbModule=8)    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    MODULES BONUS                                │
│                                                                 │
│  Vis ma vie (dbModule=4)  │  Le Héros/Conflit/Sens (dbModule=3)│
│  Ciné-Débat (dbModule=11) │  Post-prod (dbModule=13, disabled) │
└─────────────────────────────────────────────────────────────────┘
```

## Progression invisible (Adrian)

| Étape | Module | Compétence | Ce que l'élève apprend |
|-------|--------|------------|----------------------|
| 1 | M1 Observer | Regarder | Mon regard est unique, je peux imaginer |
| 2 | M2 Comprendre | Analyser | Une scène = personnage + objectif + obstacle + changement |
| 3 | M3 Imaginer | Inventer | "Et si..." = étincelle de scénario |
| 4 | M4 Clarifier | Structurer | Mon idée existe quand je la formule simplement |
| 5 | M5 Construire | Coopérer | Nos idées individuelles = puzzle collectif |
| 6 | M6 Écrire | Écrire | Compléter/améliorer vaut mieux que partir de zéro |
| 7 | M7 Visualiser | Cadrer | Raconter en images = choisir quoi montrer et comment |
| 8 | M8 Produire | Collaborer | Chaque rôle est essentiel, le cinéma = travail d'équipe |

## Mapping technique

| Module Adrian | ID code | dbModule | dbSeance | Situations | Status |
|---|---|---|---|---|---|
| M1 Positionnement | m1a | 1 | 1 | 8 QCM | ✅ Actif |
| M1 Image 1 (La rue) | m1b | 1 | 2 | 1 | ✅ Actif |
| M1 Image 2 (L'intérieur) | m1c | 1 | 3 | 1 | ✅ Actif |
| M1 Image 3 (Le banc) | m1d | 1 | 4 | 1 | ✅ Actif |
| M1 Carnet d'idées | m1e | 1 | 5 | 1 | ✅ Actif |
| M2 Mise en bain | u2a | 2 | 1 | 3 | ✅ Actif |
| M2 Émotion Cachée | u2b | 2 | 2 | 2 | ✅ Actif |
| M2 Phase Collective | u2c | 2 | 3 | 2 | ✅ Actif |
| M2 Clôture | u2d | 2 | 4 | 2 | ✅ Actif |
| M3 Et si... | m10a | 10 | 1 | 7 | ✅ Actif |
| M4 Pitch | m10b | 10 | 2 | 5 | ✅ Actif |
| M5 Construction Collective | m12a | 12 | 1 | 8 | ✅ Actif |
| M6 Le Scénario | m6 | 5 | 1 | 5 | ✅ Actif |
| M7 La Mise en scène | m7 | 7 | 1 | 4 | ✅ Actif |
| M8 L'Équipe | m8 | 8 | 1 | 5 | ✅ Actif |
| Cinéma (Bloc A M2) | m2a-m2d | 9 | 1-4 | 8+5+8+8 | ✅ Actif |
| Vis ma vie | m2-perso | 4 | 1 | 8 | ✅ Actif |
| Le Héros | m3 | 3 | 1 | 8 | ✅ Actif |
| Le Conflit | m4 | 3 | 2 | 8 | ✅ Actif |
| Le Sens | m5 | 3 | 3 | 5 | ✅ Actif |
| Ciné-Débat (×4) | m11a-d | 11 | 1-4 | 6×4 | ✅ Actif |
| Post-prod | m9 | 13 | 1 | 8 | ❌ Disabled |

## Architecture technique

```
src/
├── lib/
│   ├── constants.ts          ← MODULE_SEANCE_SITUATIONS (source unique)
│   ├── modules-data.ts       ← MODULES[] + PHASES[] (définitions UI)
│   ├── module-scenario-data.ts   ← M6 data (frise, missions, prompt IA)
│   ├── module-filmer-data.ts     ← M7 data (4 plans, comparaisons)
│   ├── module-equipe-data.ts     ← M8 data (quiz, points, talents)
│   ├── module5-data.ts           ← M2 Bloc B (éléments de scène, tokens)
│   ├── module10-data.ts          ← M3+M4 (images "Et si", avatars, pitchs)
│   ├── module11-data.ts          ← Ciné-Débat (stimuli cinéma)
│   └── module12-data.ts          ← M5 (entonnoir, extraction, templates BW)
│
├── app/api/sessions/[id]/
│   ├── situation/
│   │   ├── route.ts              ← Dispatch GET par current_module
│   │   └── handlers/
│   │       ├── module1.ts        ← M1 (QCM batch + images)
│   │       ├── module2.ts        ← M2 Bloc B (émotion cachée)
│   │       ├── module6.ts        ← M6 (scénario, 5 positions)
│   │       ├── module7.ts        ← M7 (mise en scène, 4 positions)
│   │       ├── module8.ts        ← M8 (équipe, 5 positions)
│   │       ├── module10.ts       ← M3+M4 (et si + pitch)
│   │       ├── module11.ts       ← Ciné-Débat
│   │       └── module12.ts       ← M5 (vote manches)
│   ├── scenario/route.ts        ← CRUD scénario + quiz métiers + rôles
│   ├── scenario-generate/route.ts ← Inter-séance M6 (IA génère scènes)
│   ├── equipe-compute/route.ts   ← Inter-séance M8 (calcul points)
│   └── collective-pools/route.ts ← Inter-séance M5 (prépare cartes)
│
├── components/play/
│   ├── module-1/     ← Positioning, Image, Notebook
│   ├── module-2/     ← Checklist, SceneBuilder
│   ├── module-6/     ← Frise, SceneCard, Mission, Assembly
│   ├── module-7/     ← PlanGallery, ComparisonQuiz, Decoupage, Storyboard
│   ├── module-8/     ← MetierQuiz, RolePicker, TalentCard, TeamRecap
│   ├── module-9/     ← BudgetState
│   ├── module-10/    ← EtsiWriter, Avatar, Pitch, Chrono, Confrontation
│   ├── module-11/    ← CineDebatState
│   ├── module-12/    ← MancheVoteState
│   └── states/       ← Shared (Waiting, Sent, Vote, Result, Done, Paused)
│
└── hooks/
    └── use-session-polling.ts  ← Module1-12Data interfaces + polling

supabase/migrations/
├── 024_module10_etsi_pitch.sql      ← M3+M4 tables
├── 040_module12_construction.sql    ← M5 tables
├── 042_modules_6_7_8_stubs.sql      ← Anciens stubs (remplacés)
├── 060_module6_scenario.sql         ← M6 tables (scenes, missions, scenario)
├── 061_module7_mise_en_scene.sql    ← M7 tables (comparisons, decoupages, storyboard)
└── 062_module8_equipe.sql           ← M8 tables (quiz, points, roles, talent_cards)
```

## Inter-séances

| Transition | API | Ce qui se passe |
|---|---|---|
| M3→M4 | Automatique | QCM structure l'idée, pitch miroir généré |
| M4→M5 | `/collective-pools` POST | Extraction des idées M10 → cartes par manche (entonnoir) |
| M5→M6 | `/scenario-generate` POST | Gagnants M12 → prompt IA → scènes V0 + missions assignées |
| M6→M7 | Automatique | Scènes M6 disponibles pour le découpage M7 |
| M7→M8 | `/equipe-compute` POST | Calcul des points (participation + créativité + engagement) |

## Principes pédagogiques transverses

1. **Expérience > théorie** — Les élèves apprennent en faisant
2. **Implication > performance** — Récompenser l'engagement, pas le talent
3. **Bienveillance** — Pas d'humiliation, les erreurs sont normales
4. **Force du collectif** — Les idées individuelles deviennent des ressources
5. **Complexité progressive** — Chaque module construit sur le précédent
6. **Approche ludique** — Toujours le jeu, jamais le scolaire
7. **Centré sur le processus** — Le parcours compte plus que le résultat
8. **Facilitateur ≠ évaluateur** — Guide, anime, ne juge pas
