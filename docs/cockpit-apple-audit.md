# Cockpit Banlieuwood — Audit Apple EdTech

> **Objectif** : Un cockpit tellement intuitif qu'un prof peut piloter un cours sans formation.
> Comme un iPad qu'on sort de la boite : on comprend, on fait, on maitrise.
>
> **Philosophie Apple** : Clarity > Deference > Depth. Chaque pixel sert l'action.
> **Philosophie EdTech** : Le prof regarde ses eleves, pas son ecran. 3 secondes max pour toute action.

---

## TABLE DES MATIERES

1. [Diagnostic global](#1-diagnostic-global)
2. [Architecture actuelle vs cible](#2-architecture-actuelle-vs-cible)
3. [Header — Barre superieure](#3-header--barre-superieure)
4. [Footer — Barre d'actions](#4-footer--barre-dactions)
5. [Sidebar gauche — Cockpit de classe](#5-sidebar-gauche--cockpit-de-classe)
6. [Sidebar droite — Assistant pedagogique](#6-sidebar-droite--assistant-pedagogique)
7. [Zone centrale — Reponses](#7-zone-centrale--reponses)
8. [Modales et drawers](#8-modales-et-drawers)
9. [Typographie et micro-details](#9-typographie-et-micro-details)
10. [Responsive et mobile](#10-responsive-et-mobile)
11. [Performance et code](#11-performance-et-code)
12. [Plan d'action prioritise](#12-plan-daction-prioritise)

---

## 1. DIAGNOSTIC GLOBAL

### Chiffres cles (etat actuel)

| Metrique | Valeur | Cible Apple |
|----------|--------|-------------|
| Fichiers dans `pilot/` | 76 | ~30 (apres regroupement) |
| Lignes `page.tsx` | 2 683 | < 500 (orchestrateur pur) |
| Variables d'etat (useState) | 57 | < 15 |
| useEffect hooks | 11+ | < 5 |
| Modales/drawers distincts | 19 | < 8 |
| Composants importes | 41+ | < 20 |
| Boutons d'action (footer) | 10 + 5 toggles | 4 visibles + "Plus" |
| Endroits ou le compteur eleves apparait | 8 | 1 |
| Endroits ou les eleves bloques apparaissent | 5 | 1 |
| Endroits ou le % repondu apparait | 6 | 1 |

### Les 3 peches capitaux

1. **Redondance informationnelle** — La meme info (bloques, repondus, progression) est affichee 5-8 fois simultanement. Le prof ne sait plus ou regarder.
2. **Surcharge d'actions** — 25-30 controles interactifs visibles en permanence. Un prof en situation de classe a 2 secondes de cerveau disponible.
3. **Complexite technique invisible** — 57 etats, 19 modales, 11 effets. Chaque bug est une aiguille dans une botte de foin.

---

## 2. ARCHITECTURE ACTUELLE vs CIBLE

### Actuelle : "Tableau de bord d'avion"
```
+------------------------------------------------------------------+
| COCKPIT 00:17 | Carnet d'idees 00:17 | 5 eleves | Vue | Controls |  <- 7 elements
+--------+-------------------------------+----------+--------------+
|        |  5 eleves reflechissent  ...  | Assist.  |
| Ring   |  Carnet | Plan de classe      | pedagog. |
| 0/5    |  +--------------------------+ | Analyse  |
| Stats  |  | 0 REPONSES sur 5  0:17  | | en       |
| x3     |  | [empty state]            | | direct   |
|        |  | 0/5 ont repondu          | |          |
| List   |  | Message classe           | | Timeline |
| x5     |  | PAS ENCORE REPONDU (5)   | | 1 event  |
| eleves |  +--------------------------+ |          |
|        |                               |          |
| Const  |                               |          |
+--------+-------------------------------+----------+
| Indice Relancer Exemple | Discussion Q.libre Debat Sondage | Comparer Idees Synthese |
+------------------------------------------------------------------+
```

### Cible : "iPad du prof"
```
+----------------------------------------------------------+
|  <- Module 1     Carnet d'idees    3:42    [5 eleves]    |  <- 4 elements, respires
+----------------------------------------------------------+
|                                                          |
|     +----------------------------------------------+     |
|     |                                              |     |
|     |     [crayon anime]                           |     |
|     |                                              |     |
|     |     En attente de reponses                   |     |
|     |     ████████░░  2/5                          |     |
|     |                                              |     |
|     |     Projetez la question >                   |     |
|     |                                              |     |
|     +----------------------------------------------+     |
|                                                          |
|     jhjhjhj  fsfsdf  ghghg  Adri  adri                  |  <- chips cliquables
|     (en reflexion...)                                     |
|                                                          |
+----------------------------------------------------------+
|    [Relancer]    [Projeter]    [...Plus]    [Suivant ->]  |  <- 4 boutons max
+----------------------------------------------------------+
```

**Principes de la cible :**
- **Un seul endroit** pour chaque information
- **Progressive disclosure** : on ne montre que ce qui est utile MAINTENANT
- **Le centre est roi** : 70% de l'ecran pour les reponses
- **Footer : 4 actions max**, le reste dans un menu contextuel

---

## 3. HEADER — BARRE SUPERIEURE

### Problemes actuels

| # | Probleme | Severite |
|---|----------|----------|
| H1 | 7 elements sur une ligne (COCKPIT + timer + exercice + timer2 + eleves + Vue + Controls) | CRITIQUE |
| H2 | Le mot "COCKPIT" prend de la place sans rien apporter | HAUTE |
| H3 | Le timer apparait 2 fois (elapsed + countdown) | HAUTE |
| H4 | `pilot-top-bar.tsx` existe encore (code mort potentiel) | MOYENNE |
| H5 | Le popover "Controls" contient 7 sous-items caches | MOYENNE |
| H6 | Connection status invisible sous 640px (pas d'aria-label) | BASSE |

### Corrections Apple

**H1-H2 : Simplifier a 4 elements**
```
Fichier : src/components/pilot/cockpit-header.tsx

AVANT : [Menu] COCKPIT 00:17 | Carnet d'idees 00:17 | O 5 eleves | Vue eleve | Controls
APRES : [<-]  Carnet d'idees         3:42         [5 eleves connectes]

- Supprimer le mot "COCKPIT" (on sait ou on est)
- Un seul timer (celui qui compte, countdown si actif sinon elapsed)
- Le badge eleves devient un chip cliquable qui ouvre la sidebar
- "Vue eleve" et "Controls" fusionnes dans un menu [...] ou swipe
```

**H3 : Un seul timer intelligent**
```
Fichier : src/components/pilot/cockpit-header.tsx

Logique :
- Si countdown actif -> afficher countdown (ex: "1:23 restantes")
- Sinon -> afficher elapsed (ex: "3:42")
- Jamais les deux en meme temps
- Couleur : vert < 50%, orange < 25%, rouge < 10% du temps
```

**H4 : Supprimer `pilot-top-bar.tsx`**
```
Fichier : src/components/pilot/pilot-top-bar.tsx

ACTION : Verifier si importe quelque part, puis supprimer.
Ce fichier est l'ancienne version du header. cockpit-header.tsx le remplace.
```

---

## 4. FOOTER — BARRE D'ACTIONS

### Probleme central

10 boutons d'action + 5 toggles visibles en permanence. C'est un **panneau de controle de centrale nucleaire**, pas un outil pour un prof debout devant 30 ados.

### Etat actuel detaille

```
STIMULATION          INTERACTION              ANALYSE
[Indice]             [Discussion]             [Comparer]
[Relancer (5)]       [Question libre]         [Idees]
[Exemple]            [Debat]                  [Synthese]
                     [Sondage]

+ [Focus] [Share] [Help] [Mute] [Shortcuts]   + [CTA contextuel]
```

Chaque bouton a sa propre couleur inline (pas de design tokens) :
- Indice : `rgba(255,240,230,0.8)` / `#8B4513`
- Relancer : `rgba(235,242,255,0.8)` / `#3B5998`
- Exemple : `rgba(255,252,245,0.8)` / `#8B6914`
- etc.

### Correction Apple : Max 4 boutons visibles

```
Fichier : src/components/pilot/cockpit-footer-bar.tsx

NOUVELLE ARCHITECTURE :

Phase "responding" (eleves en train de repondre) :
  [Relancer N]   [Message]   [Plus...]   [--CTA principal--]

Phase "voting" :
  [Message]   [Plus...]   [Voir resultats -->]

Phase "reviewing" :
  [Comparer]   [Debat]   [Plus...]   [Question suivante -->]

Phase "done" :
  [Exporter]   [Resultats]

Le menu "Plus..." (popover ou bottom sheet) contient :
  Stimulation : Indice, Exemple
  Interaction : Discussion, Question libre, Sondage
  Analyse : Comparer, Idees, Synthese, Nuage de mots
  Reglages : Focus, Aide eleve, Son, Raccourcis
```

**Regle Apple** : Le CTA principal est TOUJOURS le bouton le plus a droite, le plus gros, le plus visible. C'est l'action que le prof doit faire MAINTENANT.

### Couleurs : passer aux design tokens

```
Fichier : src/components/pilot/cockpit-footer-bar.tsx

AVANT (inline styles x10, chacun different) :
  style={{ background: 'rgba(255,240,230,0.8)', color: '#8B4513', ... }}

APRES (3 niveaux semantiques) :
  className="btn-footer-primary"    // CTA : orange #FF6B35, gros
  className="btn-footer-secondary"  // Actions courantes : lavande bg, texte sombre
  className="btn-footer-ghost"      // Actions secondaires dans le menu Plus
```

---

## 5. SIDEBAR GAUCHE — COCKPIT DE CLASSE

### Probleme : 6 infos qui disent la meme chose

| Info | Endroit 1 | Endroit 2 | Endroit 3 |
|------|-----------|-----------|-----------|
| Nb repondus | Ring 0/5 | "Repondu 0" legende | Centre "0/5 ont repondu" |
| Nb en reflexion | "Reflexion 5" legende | "En attente (5)" titre | "PAS ENCORE REPONDU (5)" |
| Eleves bloques | Ring segment | Liste "En difficulte" | AI panel "Attention" |
| Etat classe | Cognitive state phrase | AI "Analyse en direct" | Suggestion banner |

### Correction Apple : Une seule source de verite visuelle

```
Fichier : src/components/pilot/class-dashboard-panel.tsx

NOUVELLE STRUCTURE (de haut en bas) :

1. DONUT SIMPLIFIE
   - Juste le ring avec le nombre central "2/5"
   - Couleurs : vert (repondu), jaune (reflexion), rouge (bloque), gris (absent)
   - PAS de legende separee — les couleurs suffisent (tooltip au hover)
   - PAS de "EN ATTENTE" label redondant

2. CHIPS ELEVES (horizontaux, wrapping)
   - Chaque chip = avatar + prenom + dot de couleur (etat)
   - Cliquable -> ouvre la fiche eleve
   - Ordre : bloques en premier (rouge), puis reflexion (jaune), puis repondus (vert)
   - Espace pour "main levee" : icone main sur le chip

3. PLAN DE CLASSE (collapsible, ferme par defaut)
   - Toggle grille/constellation
   - Uniquement si le prof l'a configure

SUPPRIMER :
- "Classe en reflexion active" badge (redondant avec le ring)
- "Tous reflechissent — Laissez du temps" message (redondant avec AI)
- Section "En attente (5)" avec badges (doublon des chips)
- ClassCognitiveState one-liner (subsume par AI panel)
- Suggestion banner ("3 bloques — Donnez un exemple") -> AI panel le fait mieux
```

### Fichiers impactes

| Fichier | Action |
|---------|--------|
| `class-dashboard-panel.tsx` (527 lignes) | Simplifier a ~200 lignes |
| `class-cognitive-state.tsx` (120 lignes) | SUPPRIMER (subsume par AttentionPriority) |
| `student-pulse-grid.tsx` (203 lignes) | SUPPRIMER (doublon des chips + spatial grid) |
| `spatial-classroom-grid.tsx` | Garder comme vue alternative |
| `student-constellation.tsx` | Garder comme vue alternative |
| `mini-classroom-grid.tsx` | SUPPRIMER (doublon de spatial-classroom-grid) |

---

## 6. SIDEBAR DROITE — ASSISTANT PEDAGOGIQUE

### Probleme : Le "Prof IA" parle trop

L'assistant affiche simultanement :
- AttentionPriority (alerte unique)
- Detail alertes (mains + bloques — doublon d'AttentionPriority)
- "Analyse en direct" (phrase contextuelle)
- NarrativeRadar (radar 5 axes)
- ClassDynamicsRadar (radar 7 axes)
- Suggestions pedagogiques (3 groupes)
- "Qui a vote quoi" (breakdown QCM)
- "En difficulte" (avatars — 3eme doublon des bloques)

**Un prof debout devant sa classe ne va JAMAIS lire un radar 7 axes.**

### Correction Apple : Un assistant qui donne UNE info a la fois

```
Fichier : src/components/pilot/ai-assistant-panel.tsx

NOUVELLE STRUCTURE :

1. ALERTE PRIORITAIRE (si il y en a une)
   - Carte pleine largeur, couleur contextuelle
   - UN message : "3 eleves bloques depuis 2min"
   - UN bouton d'action : "Envoyer un indice"
   - Dismiss -> montre la suivante

2. SUGGESTION CONTEXTUELLE (si pas d'alerte)
   - Phase-aware : change selon responding/voting/reviewing
   - "responding" + < 30% repondu : "Laissez-leur du temps..."
   - "responding" + > 70% : "La majorite a repondu. Lancez le vote ?"
   - "responding" + classe divisee : "Opinions partagees — lancez un debat ?"
   - "reviewing" : "Comparez les 2 meilleures reponses"

3. TIMELINE (toujours visible, compacte)
   - 3-5 derniers evenements
   - Expandable

SUPPRIMER :
- Les 2 radars (NarrativeRadar, ClassDynamicsRadar) -> les deplacer dans les resultats post-seance
- Le detail alertes (doublon d'AttentionPriority)
- Le bloc "En difficulte" avatars (3eme surface pour la meme info)
- Le breakdown "Qui a vote quoi" (le deplacer dans VotingResults au centre)

DEPLACER :
- Les radars -> page resultats (/session/[id]/results)
- Le breakdown QCM -> zone centrale pendant la phase voting
```

### Impact code

```
Fichier : src/components/pilot/ai-assistant-panel.tsx
AVANT : 543 lignes, 8 useMemo, fake state reconstruction
APRES : ~150 lignes, 2 useMemo (alerte + suggestion)

La fausse reconstruction de studentStates :
  AVANT : Array.from({ length: totalStudents }, (_, i) => i < respondedCount ? "responded" : ...)
  APRES : Supprimer. Passer les vrais studentStates depuis le context.
```

---

## 7. ZONE CENTRALE — REPONSES

### Problemes actuels

| # | Probleme | Severite |
|---|----------|----------|
| C1 | "5 eleves reflechissent" header + "0 REPONSES sur 5" + "0/5 eleves ont repondu" = 3x la meme info | CRITIQUE |
| C2 | La barre d'outils (flag/nudge/screen/resize) a des icones de 16px sans labels | HAUTE |
| C3 | "PAS ENCORE REPONDU (5)" en majuscules + badges = agressif et redondant | HAUTE |
| C4 | L'empty state n'a pas de CTA clair | MOYENNE |
| C5 | Le tab "Carnet / Plan de classe" duplique le plan deja dans la sidebar | MOYENNE |
| C6 | L'image dans le type "Image" (screenshot 6-7) prend trop de place vs zone reponses | BASSE |

### Corrections Apple

**C1 : Un seul indicateur de progression**
```
Fichier : src/components/pilot/response-stream-section.tsx

AVANT :
  "5 eleves reflechissent" (header)
  "0 REPONSES sur 5 | 0:17" (compteur)
  "0/5 eleves ont repondu" (empty state)

APRES :
  Barre de progression inline :
  ████████░░░░░░░░  2/5 reponses  (3:42)
  - Verte quand > 50%
  - Pas de texte "sur 5" — le denominateur est dans la barre
  - Le timer est integre a droite de la barre
```

**C3 : "PAS ENCORE REPONDU" -> chips discrets**
```
Fichier : src/components/pilot/response-stream-section.tsx ou page.tsx

AVANT :
  * PAS ENCORE REPONDU (5)
  [jhjhjhj] [fsfsdf] [ghghg] [Adri] [adri]

APRES :
  En attente : jhjhjhj, fsfsdf, ghghg, Adri, adri
  (texte gris sm, inline, pas de section separee)
  -> ou mieux : juste les chips dans la sidebar gauche, pas au centre
```

**C4 : Empty state avec CTA**
```
AVANT :
  [crayon anime]
  0/5
  eleves ont repondu
  Les reponses apparaitront ici au fur et a mesure.
  [Message classe]
  Astuce : projetez la question sur l'ecran

APRES :
  [crayon anime]
  En attente de reponses...
  ████░░░░░░░░  0/5

  [Projeter la question]   <- CTA primaire, orange
  [Envoyer un indice]      <- CTA secondaire, ghost
```

**C5 : Supprimer le tab "Plan de classe" du centre**
```
Le plan de classe est deja dans la sidebar gauche.
Le tab au centre duplique l'information et prend la place des reponses.
SUPPRIMER le tab "Plan de classe" de la zone centrale.
Garder uniquement le contenu reponses au centre.
```

---

## 8. MODALES ET DRAWERS

### Probleme : 19 modales/drawers differents

| Type | Nombre | Exemples |
|------|--------|----------|
| Modales plein ecran | 3 | Spotlight, WordCloud, StudentFiche |
| Modales dialog | 6 | Broadcast, Compare, Export, Shortcuts, KickConfirm, ModuleSwitch |
| Drawers lateraux | 5 | Students, Sidebar, MobileContext, MobileLeft, MobileRight |
| Panneaux inline | 3 | InlineReformulation, BulkToolbar, DebatePanel |
| Confirm dialogs | 2 | ConfirmAction, PendingModuleSwitch |

**Apple rule** : Une app bien faite n'a presque jamais besoin de modales. L'info est contextuelle.

### Corrections

**Fusionner les drawers mobiles**
```
AVANT : 5 drawers separes (Students, Sidebar, MobileContext, MobileLeft, MobileRight)
APRES : 1 drawer generique avec des "pages" internes

Fichier a creer : src/components/pilot/mobile-drawer.tsx
  - Un seul composant Drawer avec un `content` prop
  - Gere l'overlay, le swipe-to-close, l'animation
  - Les 5 anciens drawers deviennent des `content` variants
```

**Supprimer les modales evitables**
```
- KeyboardShortcutsModal -> tooltip/popover inline (comme Notion)
- BroadcastModal -> inline dans la zone centrale (comme iMessage)
- CompareResponsesModal -> vue split inline dans la zone reponses
```

### Apres nettoyage : 8 surfaces maximum

| Surface | Usage |
|---------|-------|
| 1. Drawer mobile (generique) | Navigation mobile |
| 2. SpotlightModal | Projection reponse (necessite plein ecran) |
| 3. WordCloud | Visualisation (necessite plein ecran) |
| 4. ConfirmDialog | Actions destructives uniquement |
| 5. StudentFiche | Detail eleve (slide-over) |
| 6. DebatePanel | Organisation debat |
| 7. ExportModal | Export seance |
| 8. InlineReformulation | Edition inline |

---

## 9. TYPOGRAPHIE ET MICRO-DETAILS

### Accents manquants (partout)

```
CORRECTIONS A FAIRE (rechercher/remplacer global) :

"eleves reflechissent"  -> "eleves reflechissent" (ok si intentionnel sans accents)
"Repondu"               -> "Repondu" (ok) OU "Repondu" avec accent si voulu
"PAS ENCORE REPONDU"    -> "En attente de reponse" (minuscules, plus doux)
"Reflexion"             -> coherent avec le reste
"Analyse en direct"     -> OK
"Laissez du temps"      -> OK

REGLE : Choisir un style (avec ou sans accents techniques) et s'y tenir partout.
```

### Casing inconsistant

```
AVANT (melange) :
- "PAS ENCORE REPONDU" (SCREAMING_CAPS)
- "En attente" (Title Case)
- "eleves ont repondu" (sentence case)
- "CONSTELLATION" (CAPS)
- "PLAN DE CLASSE" (CAPS)
- "STIMULATION" (CAPS)
- "TABLEAU" (CAPS)

APRES (Apple style = sentence case partout) :
- "En attente de reponse"
- "En attente"
- "Constellation"
- "Plan de classe"
- "Stimulation"
- "Tableau"

Les CAPS sont reserves aux acronymes (QCM, IA) et aux labels de formulaire.
```

### Bordures et ombres

```
AVANT :
- Bordure jaune-doree sur les cards = OK (identite visuelle)
- Trait pointille autour de la zone reponses (screenshot 7) = CASSER le style
- Ombres incoherentes : certaines cards ont shadow-bw-lg, d'autres border-black/[0.06]

APRES :
- Une seule elevation : shadow-sm pour les cards, shadow-md pour les modales
- Pas de bordure pointillee
- Bordure lavande (#DDD7EC) uniforme pour les separateurs
```

### Icones

```
AVANT : Icones de 16px pour flag/nudge/screen/resize (zone compteur)
  - Trop petites (< 44px touch target Apple)
  - Pas de labels
  - Trop rapprochees

APRES :
  - Minimum 44x44px touch targets
  - Tooltip au hover avec le label
  - Espacement minimum 8px entre icones
  - OU regrouper dans un menu "..." si > 3 icones
```

---

## 10. RESPONSIVE ET MOBILE

### Problemes critiques

| # | Probleme | Impact |
|---|----------|--------|
| R1 | Les 10 boutons footer deviennent un scroll horizontal sur mobile | Prof ne voit pas toutes les actions |
| R2 | Les labels de boutons disparaissent sous 640px sans aria-label | Accessibilite brisee |
| R3 | Les categories (Stimulation/Interaction/Analyse) disparaissent sous 640px | Perte de contexte |
| R4 | Le timer header disparait sous 640px | Info critique invisible |
| R5 | Le connection status disparait sous 640px | Pas de feedback reseau |
| R6 | La hauteur footer est fixee a 68px inline | Pas de reflow |
| R7 | ClassDashboardPanel et AIAssistantPanel sont rendus 2x (desktop + mobile drawer) | DOM double, perf |

### Corrections

**R1-R3 : Footer mobile = 3 boutons + bottom sheet**
```
Fichier : src/components/pilot/cockpit-footer-bar.tsx

MOBILE (< 768px) :
  [Relancer]   [...]   [--CTA--]

  Le bouton [...] ouvre un bottom sheet (pas un scroll horizontal)
  avec toutes les actions groupees par categorie.
```

**R4-R5 : Le timer et le status sont toujours visibles**
```
Fichier : src/components/pilot/cockpit-header.tsx

Retirer les classes "hidden sm:block" et "hidden sm:flex" sur :
- Le timer
- Le LiveIndicator
Ces infos sont critiques, elles doivent etre visibles meme sur mobile.
```

**R7 : Render unique avec repositionnement CSS**
```
AVANT (page.tsx) :
  {/* Desktop */}
  <div className="hidden lg:block"><ClassDashboardPanel /></div>
  {/* Mobile drawer */}
  <AnimatePresence>
    {mobileSidePanel === "left" && <ClassDashboardPanel />}
  </AnimatePresence>

APRES :
  <ClassDashboardPanel className="max-lg:hidden" />
  // Sur mobile, un portal deplace le meme composant dans le drawer
  // OU : un seul render, positionne via CSS (fixed on mobile, static on desktop)
```

---

## 11. PERFORMANCE ET CODE

### Fichiers trop gros a refactorer

| Fichier | Lignes | Action |
|---------|--------|--------|
| `page.tsx` (PilotPage + CockpitContent) | 2 683 | Extraire useCockpitContent hook (~800 lignes de logique) |
| `teacher-docks.tsx` | 1 114 | Splitter en 4 fichiers (guide/stats/students/broadcast docks) |
| `response-actions.tsx` | 770 | Extraire NudgePicker, ScorePicker, CommentInput en composants partages |
| `module-briefing.tsx` | 735 | Extraire les patterns CSS et les activity cards |
| `ai-assistant-panel.tsx` | 543 | Simplifier a ~150 lignes (voir section 6) |
| `class-dashboard-panel.tsx` | 527 | Simplifier a ~200 lignes (voir section 5) |

### Code mort a supprimer

| Fichier | Raison |
|---------|--------|
| `pilot-top-bar.tsx` (~180 lignes) | Remplace par cockpit-header.tsx |
| `seat-card.tsx` (11 lignes) | Juste un type, deplacer dans desk-pair.tsx |
| `mini-classroom-grid.tsx` (~100 lignes) | Doublon de spatial-classroom-grid.tsx |
| `student-pulse-grid.tsx` (~203 lignes) | Doublon des chips eleves |
| `class-cognitive-state.tsx` (~120 lignes) | Subsume par AttentionPriority |

### Duplication de logique a factoriser

| Logique dupliquee | Fichiers concernes | Fix |
|-------------------|--------------------|-----|
| `QUICK_NUDGES` array | student-fiche.tsx, student-action-popover.tsx | Deplacer dans pilot-settings.ts |
| Division QCM (30%/30%/diff<15%) | class-cognitive-state.tsx, ai-assistant-panel.tsx, ai-suggestions.ts | Extraire `computeClassDivision()` dans un lib/ |
| Couleurs d'etat eleve (responded/stuck/...) | state-styles.ts, spatial-classroom-grid.tsx, mini-classroom-grid.tsx, class-dashboard-panel.tsx | Tout pointer vers state-styles.ts |
| InlineActions vs GenericInlineActions | response-actions.tsx (~350 lignes dupliquees) | Fusionner en un seul composant generique |
| Contexte AIAssistantPanel (desktop + mobile) | page.tsx (20 lignes x2) | Extraire `useAIAssistantContext()` hook |

### Radar chart inconsistance

```
Fichier : src/components/pilot/pedagogical-radar.tsx

Ce composant a sa propre implementation SVG (236 lignes)
alors que oie-radar, narrative-radar, class-dynamics-radar utilisent tous BaseRadar.

FIX : Migrer pedagogical-radar.tsx vers BaseRadar (economie ~150 lignes).
```

### Module flag chains illisibles

```
Fichier : page.tsx (lignes 641-956)

AVANT :
  const showStandardQA = (isStandardQA || (isM2ECAny && !showM2ECSpecial && !showM2ECComparison)
    || (isM10Any && !showM10Special) || showM13Standard)
    && !isM12Any && !(isM13Any && !showM13Standard)
    && !isM6Any && !isM7Any && !isM8Any;

APRES : Pattern strategy
  type ModuleView = "standard-qa" | "m1-image" | "m1-notebook" | "m6-frise" | "m7-plans" | ...
  const moduleView = getModuleView(session, situationData); // pure function
  // Usage :
  if (moduleView === "standard-qa") { ... }
```

---

## 12. PLAN D'ACTION PRIORITISE

### Sprint 1 — "Desencombrer" (impact UX maximum, risque faible)

| # | Tache | Fichiers | Effort |
|---|-------|----------|--------|
| 1.1 | Footer : reduire a 4 boutons + menu "Plus" | cockpit-footer-bar.tsx | 1 jour |
| 1.2 | Centre : dedupliquer compteurs (1 barre de progression) | response-stream-section.tsx, page.tsx | 0.5 jour |
| 1.3 | Header : supprimer "COCKPIT", un seul timer | cockpit-header.tsx | 0.5 jour |
| 1.4 | Centre : supprimer "PAS ENCORE REPONDU" section | page.tsx | 0.5 jour |
| 1.5 | Centre : supprimer tab "Plan de classe" du centre | page.tsx | 0.5 jour |
| 1.6 | Sidebar gauche : supprimer doublons (cognitive state, suggestion banner) | class-dashboard-panel.tsx | 0.5 jour |
| 1.7 | Fixer les accents et le casing partout | global grep/replace | 0.5 jour |

**Total Sprint 1 : ~4 jours**

### Sprint 2 — "Clarifier" (architecture, risque moyen)

| # | Tache | Fichiers | Effort |
|---|-------|----------|--------|
| 2.1 | AI panel : simplifier a alerte + suggestion + timeline | ai-assistant-panel.tsx | 1 jour |
| 2.2 | Deplacer radars dans page resultats | ai-assistant-panel.tsx, results page | 1 jour |
| 2.3 | Deplacer breakdown QCM dans zone centrale voting | ai-assistant-panel.tsx, voting-results.tsx | 0.5 jour |
| 2.4 | Fusionner InlineActions et GenericInlineActions | response-actions.tsx | 1 jour |
| 2.5 | Extraire computeClassDivision() | lib/class-analysis.ts | 0.5 jour |
| 2.6 | Migrer pedagogical-radar vers BaseRadar | pedagogical-radar.tsx | 0.5 jour |
| 2.7 | Supprimer code mort (pilot-top-bar, seat-card, mini-classroom-grid, student-pulse-grid, class-cognitive-state) | 5 fichiers | 0.5 jour |

**Total Sprint 2 : ~5 jours**

### Sprint 3 — "Refondre" (refactoring profond, risque eleve)

| # | Tache | Fichiers | Effort |
|---|-------|----------|--------|
| 3.1 | Extraire useCockpitContent() hook depuis page.tsx | page.tsx -> nouveau hook | 2 jours |
| 3.2 | Pattern strategy pour les module views | page.tsx, nouveau module-view-resolver.ts | 1 jour |
| 3.3 | Splitter teacher-docks.tsx en 4 fichiers | teacher-docks.tsx | 1 jour |
| 3.4 | Drawer mobile generique (fusionner 5 drawers) | nouveau mobile-drawer.tsx | 1 jour |
| 3.5 | Render unique ClassDashboardPanel/AIAssistantPanel (portal mobile) | page.tsx | 1 jour |
| 3.6 | Footer : design tokens (supprimer 10 inline styles) | cockpit-footer-bar.tsx, globals.css | 0.5 jour |
| 3.7 | Accessibilite : aria-labels sur tous les boutons footer | cockpit-footer-bar.tsx | 0.5 jour |
| 3.8 | Organiser pilot/ en sous-dossiers | 76 fichiers, imports | 1 jour |

**Total Sprint 3 : ~8 jours**

---

## RESUME EXECUTIF

| Metrique | Avant | Apres Sprint 1 | Apres Sprint 3 |
|----------|-------|-----------------|-----------------|
| Boutons footer visibles | 15 | 4 | 4 |
| Endroits compteur repondus | 8 | 2 | 1 |
| Endroits eleves bloques | 5 | 2 | 1 |
| Modales/drawers | 19 | 15 | 8 |
| Fichiers pilot/ | 76 | 71 | ~45 |
| Lignes page.tsx | 2 683 | 2 400 | ~800 |
| Actions pour le prof | Chercher dans 15 boutons | 4 boutons + menu | 4 boutons + menu |
| Temps pour agir | 5-10 secondes | 2-3 secondes | < 2 secondes |

> **L'objectif final** : un prof ouvre le cockpit, voit la progression en un coup d'oeil,
> et n'a besoin que d'un seul bouton pour faire la bonne action au bon moment.
> Comme le bouton vert "Envoyer" dans iMessage. Simple. Evident. Immanquable.
