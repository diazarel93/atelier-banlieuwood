# Analyse Cockpit — Diagnostic de lisibilité (2026-03-15)

## Le probleme central

Le cockpit est **un fichier de 2 714 lignes** (`pilot/page.tsx`) qui fait tout. Un nouveau dev qui ouvre ce fichier voit 36 `useState`, 38 props drillées, 75 composants importés, et aucun fil rouge pour comprendre "par où commencer".

---

## Les 5 vrais problemes

### 1. `CockpitContent` = 2 087 lignes sans structure

Tout est dedans : timer, auto-advance, broadcast, stuck detection, navigation, module-specific data, keyboard shortcuts, modals, responsive layout.

**Solution :** Extraire en 5 hooks ciblés :

| Hook a créer | Ce qu'il absorbe | ~lignes |
|---|---|---|
| `useCockpitNavigation` | goToSituation, nextSituation, prevSituation, skipSituation, handleNextAction, auto-advance, respondingOpenedAt | ~200 |
| `useCockpitModals` | showBroadcast, showExport, showDebate, showWordCloud, showCompare, showShortcuts, spotlightResponse | ~80 |
| `useCockpitTimer` | timerMode, setTimer, autoAdvance, countdown logic | ~100 |
| `useCockpitDarkMode` | isDarkMode, localStorage sync | ~20 |
| `useCockpitTimeline` | timelineEvents, createTimelineEvent, allRespondedNotified | ~60 |

### 2. Prop drilling x4 niveaux sans contexte

Les 14 mutations de `usePilotSession` sont passées en props a chaque niveau :
```
PilotPage → CockpitContent → ResponseStreamSection → ResponseStream → ResponseCard
```

**Solution :** `CockpitContext` React pour les mutations et l'état partagé.

### 3. 74 fichiers dans `src/components/pilot/` sans organisation

**Solution :** Sous-dossiers par domaine :
```
pilot/
  layout/          cockpit-header, cockpit-footer-bar, module-sidebar, phase-stepper
  responses/       response-card, response-stream, response-stream-section, response-actions, bulk-toolbar
  students/        classroom-map, desk-pair, student-fiche, student-action-popover, spatial-grid, constellation, pulse-ring
  modals/          broadcast, compare, debate, word-cloud, spotlight, export, keyboard-shortcuts
  radars/          oie-radar, emotional-radar, narrative-radar, class-dynamics-radar (→ BaseRadar)
  ai/              ai-assistant-panel, attention-priority, cognitive-state, center-banner
  modules/         module1-cockpit ... module13-cockpit
  shared/          pilot-settings, state-styles, seat-card, elapsed-timer, question-card
```

### 4. Nommage confus (6 fichiers)

| Fichier actuel | Probleme | Nom clair |
|---|---|---|
| `emotional-radar.tsx` | Axes pédagogiques, pas émotionnels | `pedagogical-radar.tsx` |
| `cognitive-map.tsx` | C'est un bar chart, pas une carte | `m1-cognitive-bars.tsx` |
| `module5-emotion-distribution.tsx` | Utilisé par module 2, pas 5 | `emotion-distribution.tsx` |
| `context-panel.tsx` | Pas de rapport avec React Context | `teacher-docks.tsx` |
| `get-next-action.ts` | Logique pure dans components/ | → `src/lib/cockpit-next-action.ts` |
| `session-replay.tsx` | Contient moteur d'analyse | Extraire logique vers `src/lib/replay-analysis.ts` |

### 5. Duplication massive (5 clusters)

| Cluster | Fichiers | Solution |
|---|---|---|
| Student chip (avatar+état+nom) | 4 implémentations | 1 composant `StudentChip` |
| Radar SVG (axes+polygone+points) | 4 radars quasi-identiques | 1 composant `BaseRadar` |
| Détection "classe bloquée" | 4 endroits | 1 pure function `computeClassState()` |
| EnergyDonut SVG | 2 endroits | 1 composant `EnergyDonut` |
| Quick nudge chips | 2 endroits | 1 composant `NudgeChips` |

### God components (> 500 lignes)

| Fichier | Lignes | Action |
|---|---|---|
| `context-panel.tsx` | ~1 200 | Séparer en `GuideDocksUpper` + `StudentDocksLower` |
| `module-briefing.tsx` | ~1 200 | Extraire `MODULE_ACTIVITIES` vers `src/lib/` |
| `response-actions.tsx` | 771 | Fusionner `GenericInlineActions` + `InlineActions` |
| `ai-assistant-panel.tsx` | 716 | Extraire `generateSuggestions()` vers `src/lib/` |
| `session-replay.tsx` | 601 | Extraire `detectKeyMoments()` + `generateReplaySummary()` |
| `class-dashboard-panel.tsx` | 550 | Extraire `EnergyDonut` inline |

### Code probablement mort

| Fichier | Indice |
|---|---|
| `competency-report.tsx` | Bouton PDF sans onClick, aucun import trouvé |
| `pilot-top-bar.tsx` | Top bar alternative a cockpit-header |
| `session-state-banner.tsx` (mode full) | Header a déja son propre status |

## Plan d'action

| Priorité | Action | Impact |
|---|---|---|
| P0 | Créer `CockpitContext` React | Élimine prop drilling x4 |
| P1 | Extraire 5 hooks de `CockpitContent` | Page -900 lignes |
| P2 | Organiser `pilot/` en sous-dossiers | Navigabilité x5 |
| P3 | Créer `BaseRadar` + `StudentChip` | -400 lignes duplication |
| P4 | Renommer 6 fichiers confus | Clarté immédiate |
| P5 | Découper 6 god components | Fichiers < 300 lignes |
