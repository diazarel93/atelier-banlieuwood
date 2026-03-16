# Sprint Cockpit — 4 chantiers post Schema B

> Etat actuel : Schema A (Focus Mode) + Schema B (Command Center 3 colonnes) sont implementes.
> Le projecteur (`/screen`) et le jeu eleve (`/play`) existent et fonctionnent.
> Ce sprint consolide, enrichit et connecte tout.

---

## Vue d'ensemble

| # | Chantier | Impact | Effort |
|---|----------|--------|--------|
| A | Remote Control Mode | Le prof se deplace tablette en main | Moyen |
| B | Polish Command Center | Les sidebars deviennent vraiment utiles | Leger |
| C | Ecran projete — enrichissement | Transitions Keynote, spotlight, controle fin | Moyen |
| D | Boutons ecran dans le cockpit | Acces direct ecran + play depuis le cockpit | Leger |

---

## Chantier A — "Remote Control Mode"

> Le prof quitte son bureau, prend sa tablette, et pilote la classe en marchant.
> L'interface se simplifie en gros boutons tactiles — style telecommande Apple TV.

### Principe

Pas un nouveau layout. C'est un **toggle** dans le cockpit : quand le prof active "Mode tablette", le FocusCockpit se transforme :
- La question se reduit a 1 ligne (titre tronque)
- Les reponses disparaissent (elles sont sur le projecteur)
- 4 gros boutons occupent 80% de l'ecran
- Le donut de progression reste visible en haut

### Layout Remote Control

```
┌──────────────────────────────────┐
│  Le Regard · 2    3/5    [●24]  │  Header compact (40px)
├──────────────────────────────────┤
│                                  │
│  ┌────────────┐                  │
│  │    72%     │  3/5 repondu     │  Donut + compteur
│  └────────────┘                  │
│                                  │
│  "Observe cette image..."        │  Question (1 ligne, truncate)
│                                  │
│  ┌──────────┐  ┌──────────┐     │
│  │          │  │          │     │
│  │  📢      │  │  ⏭️      │     │  4 GROS boutons
│  │ Relancer │  │ Suivante │     │  (min 72px height)
│  │          │  │          │     │  touch-friendly
│  └──────────┘  └──────────┘     │
│                                  │
│  ┌──────────┐  ┌──────────┐     │
│  │          │  │          │     │
│  │  🗳️      │  │  ⏸️      │     │
│  │  Vote    │  │  Pause   │     │
│  │          │  │          │     │
│  └──────────┘  └──────────┘     │
│                                  │
│  ⚠️ 2 bloques (Lucas, Sarah)    │  Alerte inline (si pertinente)
│                                  │
└──────────────────────────────────┘
```

### Boutons adaptatifs selon la phase

| Phase | Bouton 1 | Bouton 2 | Bouton 3 | Bouton 4 |
|-------|----------|----------|----------|----------|
| waiting | Projeter | Ouvrir reponses | Timer | Pause |
| responding | Relancer | Lancer vote | Timer | Pause |
| voting | Message | Voir resultats | Timer | Pause |
| reviewing | Debat | Question suiv. | Comparer | Pause |

### Implementation

**Fichier** : `src/components/pilot/focus/remote-control-view.tsx` (~150 lignes)
- Composant conditionnel dans FocusCockpit
- Active via un state `isRemoteMode` dans `useFocusCockpitState`
- Toggle via le menu Plus (+) ou un bouton dans le header

**Donnees** : reutilise `useCockpitData()` + `useCockpitActions()` (zero nouveau hook)

**Activation** :
- Bouton dans le menu Plus : "Mode tablette"
- Ou auto-detect : si `window.innerWidth < 768` et que `/screen` est ouvert dans un autre onglet (via BroadcastChannel)

---

## Chantier B — Polish Command Center

> Les sidebars fonctionnent mais sont basiques. On les rend vraiment utiles.

### B1. Sidebar gauche — Fiche eleve en slide-over

**Actuellement** : tap sur un eleve dans la sidebar = `onSelectStudent` (qui ouvre le student fiche dans le centre).

**Amelioration** : tap ouvre un slide-over par-dessus la sidebar (comme le composant `StudentFiche` existant dans `student-fiche.tsx`), sans quitter le flux central.

**Implementation** :
- Dans `classe-sidebar.tsx` : ajouter un state `selectedStudent`
- Au tap : ouvrir `StudentFiche` en overlay absolue (position absolute, z-30, w-80)
- Le slide-over depasse la sidebar vers la droite (~320px)
- Bouton "Retour" pour fermer

### B2. Sidebar gauche — Animations dots temps reel

**Actuellement** : les dots sont statiques (couleur fixe).

**Amelioration** :
- Dot vert : petit scale-in quand un eleve repond (transition 300ms)
- Dot rouge/orange : pulse subtil (comme un heartbeat) pour les bloques
- Checkmark : apparait avec une micro-animation (scale spring)

**Implementation** : dans `classe-sidebar.tsx`, ajouter `motion.span` sur les dots avec `animate` conditionnel.

### B3. Sidebar droite — Actions d'alerte connectees

**Actuellement** : les actions d'alerte sont des raccourcis simples (toast + broadcast generique).

**Amelioration** : connecter les vraies actions :
- "Envoyer un indice" → ouvre le modal broadcast avec prefill "Petit indice : ..."
- "Voir l'eleve" → `onSelectStudent` sur l'eleve concerne
- "Lancer un debat" → ouvre le modal broadcast avec prefill debat
- "Lancer le vote" → `updateSession({ status: "voting" })`
- "Relancer la classe" → ouvre le modal broadcast (vide)

**Implementation** : dans `command-cockpit.tsx`, enrichir `useAlertActions` pour dispatcher vers les bons handlers. Passer `modals.openBroadcast` depuis `useFocusCockpitState` via un callback.

### B4. Sidebar droite — Timeline enrichie

**Actuellement** : la timeline tracke question_launched, first_response, 50%, all_responded, vote, phase.

**Amelioration** : ajouter le tracking de :
- `broadcast_sent` : quand le prof envoie un message
- `nudge_sent` : quand le prof relance un eleve
- `stuck_detected` : quand des eleves sont detectes bloques (>90s)
- `class_divided` : quand la classe est divisee 50/50

**Implementation** : dans `useCommandSidebarData`, observer `session.broadcast_at` et les `stuckLevels` pour ajouter des events.

### B5. Header FocusCockpit — Boutons ecran

Voir Chantier D ci-dessous (integre dans le header).

---

## Chantier C — Ecran projete enrichi

> L'ecran `/screen` existe et fonctionne. On le rend plus "Keynote".

### C1. Transitions entre phases

**Actuellement** : le contenu change instantanement.

**Amelioration** : transitions fluides entre les modes :
- Question → Reponses : slide horizontal (comme un carousel)
- Reponses → Vote : les cards non-selectionnees fade out, les selectionnees scale up
- Vote → Resultats : les barres de vote se remplissent progressivement (spring animation)
- Question suivante : slide vertical (nouvelle question entre par le bas)

**Implementation** : dans `screen/page.tsx`, wrapper les sections avec `AnimatePresence` + `motion.div` avec `layoutId` pour les transitions.

### C2. Mode Spotlight

**Actuellement** : les reponses highlighted s'affichent dans un panneau.

**Amelioration** : mode "Spotlight" — UNE reponse en grand au centre de l'ecran :
- Fond sombre avec une seule card eclairee au centre
- Nom de l'eleve + avatar en grand
- Texte de la reponse en 24px
- Le prof choisit quelle reponse projeter depuis le cockpit
- Navigation prev/next pour passer d'une reponse a l'autre

**Implementation** :
- Nouveau screen mode : `__SCREEN_MODE:spotlight`
- Nouvelle commande : `__SCREEN_SPOTLIGHT:responseId`
- Composant : `src/components/screen/spotlight-view.tsx` (~80 lignes)

### C3. Ecran noir ameliore

**Actuellement** : fond noir simple.

**Amelioration** :
- Fond noir avec un subtil logo Banlieuwood en watermark (opacity 5%)
- Message optionnel du prof affiche en grand (ex: "Regardez vers le tableau")
- Timer visible si actif

**Implementation** : modifier le cas `blank` dans `screen/page.tsx`.

### C4. Celebration de fin

**Actuellement** : ecran de fin basique.

**Amelioration** :
- Confetti animation
- Stats de la seance (nb reponses, temps total, participation)
- "Merci et bravo !" avec le nom de la classe

**Implementation** : enrichir le `DoneState` dans `screen/page.tsx`.

---

## Chantier D — Boutons ecran et play dans le cockpit

> Le prof doit pouvoir ouvrir l'ecran projete ET l'ecran joueur en 1 tap.

### Etat actuel

- `CockpitHeader` (legacy) a un bouton "Ecran" qui ouvre `/screen` dans un nouvel onglet
- `FocusHeader` n'a PAS de bouton ecran/play
- Le bouton screen mode (question/reponses/nuage/noir/geler) est dans le legacy header seulement

### Plan

**D1. Boutons dans FocusHeader**

Ajouter 2 boutons compacts dans le header du FocusCockpit :

```
┌──────────────────────────────────────────────┐
│  [<]  Positionnement  Q1/8   00:07  [📺][🎮][●24]  │
│                                    ^    ^          │
│                             Projecteur Play        │
└──────────────────────────────────────────────┘
```

- `📺` : ouvre `/session/{id}/screen` dans un nouvel onglet (ou focus si deja ouvert)
- `🎮` : ouvre `/play/{id}` dans un nouvel onglet (pour tester la vue eleve)
- Tooltip sur hover : "Ouvrir l'ecran de projection" / "Tester la vue eleve"

**Implementation** :
- Dans `focus-header.tsx` : ajouter 2 boutons icon
- `onClick` : `window.open(ROUTES.screen(sessionId), "bw-screen")` / `window.open(ROUTES.play(sessionId), "bw-play")`
- Le 2e parametre de `window.open` permet de reutiliser le meme onglet si deja ouvert

**D2. Controles ecran dans le menu Plus**

Ajouter dans le menu Plus (+) du FocusCockpit les controles de l'ecran projete :

```
ECRAN PROJETE
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│📋    │ │💬    │ │☁️    │ │⬛    │
│Quest.│ │Repon.│ │Nuage │ │Noir  │
└──────┘ └──────┘ └──────┘ └──────┘
[❄️ Geler l'ecran]
```

- Les 4 modes envoient `updateSession({ broadcast_message: "__SCREEN_MODE:xxx" })`
- Le toggle gel envoie `__SCREEN_FROZEN`
- L'etat actif est surligne (fond colore)

**Implementation** :
- Dans `plus-menu-content.tsx` : ajouter une section "Ecran" avec les 4 boutons + toggle gel
- Necessite de passer `updateSession` en prop ou via `useCockpitActions()`
- Tracker le mode actif via `session.broadcast_message` (parser le `__SCREEN_MODE:`)

**D3. Indicateur ecran connecte**

Petit indicateur dans le header pour savoir si l'ecran projete est ouvert :

- Dot vert a cote de `📺` si `/screen` est ouvert dans un autre onglet
- Detection via `BroadcastChannel` API (le screen envoie un heartbeat toutes les 5s)
- Si pas de heartbeat depuis 10s → dot gris

**Implementation** :
- Hook `useScreenConnection()` (~30 lignes) avec BroadcastChannel
- Screen page envoie `{ type: "screen-heartbeat" }` toutes les 5s
- Cockpit ecoute et met a jour un state `isScreenConnected`

---

## Ordre d'implementation recommande

```
Phase 1 — Quick wins (1 session)
  D1. Boutons ecran/play dans FocusHeader          (~30 min)
  D2. Controles ecran dans menu Plus               (~45 min)
  B2. Animations dots temps reel                   (~20 min)

Phase 2 — Valeur ajoutee (1 session)
  B3. Actions d'alerte connectees                  (~30 min)
  B4. Timeline enrichie                            (~30 min)
  D3. Indicateur ecran connecte (BroadcastChannel) (~30 min)

Phase 3 — Remote Control (1 session)
  A. Remote Control Mode complet                   (~90 min)

Phase 4 — Ecran projete (1 session)
  C1. Transitions entre phases                     (~45 min)
  C2. Mode Spotlight                               (~45 min)
  C3. Ecran noir ameliore                          (~15 min)
  C4. Celebration de fin                           (~30 min)

Phase 5 — Polish (1 session)
  B1. Fiche eleve slide-over dans sidebar          (~45 min)
```

---

## Fichiers a creer

| Fichier | Chantier | Lignes |
|---------|----------|--------|
| `src/components/pilot/focus/remote-control-view.tsx` | A | ~150 |
| `src/components/screen/spotlight-view.tsx` | C2 | ~80 |
| `src/hooks/use-screen-connection.ts` | D3 | ~30 |

## Fichiers a modifier

| Fichier | Chantier | Changement |
|---------|----------|------------|
| `src/components/pilot/focus/focus-header.tsx` | D1 | +2 boutons ecran/play |
| `src/components/pilot/focus/plus-menu-content.tsx` | D2 | +section controles ecran |
| `src/components/pilot/focus/focus-cockpit.tsx` | A | +toggle remote mode |
| `src/components/pilot/command/classe-sidebar.tsx` | B1,B2 | +slide-over, +animations dots |
| `src/components/pilot/command/assistant-sidebar.tsx` | B3 | +actions enrichies |
| `src/components/pilot/command/command-cockpit.tsx` | B3,B4 | +alert actions, +timeline events |
| `src/app/(dashboard)/session/[id]/screen/page.tsx` | C1-C4, D3 | +transitions, +spotlight, +heartbeat |

---

## Verification finale

- [ ] Desktop >= 1280px : 3 colonnes, boutons ecran visibles, controles ecran dans Plus
- [ ] Tablette 1024-1279 : 2 colonnes, boutons ecran visibles
- [ ] Mobile < 768 : Focus Mode, toggle Remote Control disponible
- [ ] Ecran projete ouvert : dot vert dans header, modes changent en direct
- [ ] Vue eleve testable : bouton play ouvre la vue en 1 tap
- [ ] Remote Control : 4 gros boutons, phase-adaptifs, touch-friendly
- [ ] Spotlight : 1 reponse en grand sur le projecteur
- [ ] Timeline : 8+ types d'events trackes
- [ ] Alerts : actions connectees (broadcast modal, select student, vote)
- [ ] Transitions ecran : slide/fade/spring entre les phases
