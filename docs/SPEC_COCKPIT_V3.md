# SPEC — Cockpit Intervenant V3 (Dashboard Redesign)

**Projet :** Banlieuwood
**Date :** 28 mars 2026
**Auteur :** Dev (Claude Code)
**Destinataires :** Equipe dev + cowork design
**Base :** Cockpit V6 (maquette JSX) + architecture existante (FocusCockpit + CommandCockpit)

---

## 1. Contexte — Pourquoi ce redesign

Le cockpit actuel (FocusCockpit V2) est fonctionnel mais :
- Le code est monolithique (use-focus-cockpit-state = 517 lignes, focus-cockpit = 890 lignes)
- L'UX manque de fonctionnalites demandees (projection, notes, command palette)
- Le flow presession → session est basique (pas de selection classe/formule)

Une maquette V6 a ete produite avec de bonnes idees UX mais des violations de doctrine Banlieuwood. Ce plan integre les bonnes idees en respectant les regles.

---

## 2. Doctrine — Ce que l'intervenant PEUT et NE PEUT PAS voir

Source : `NOTE_DOCTRINE_DATA_ELEVE.md` + `GUIDE_INTERVENANTS.md`

### L'intervenant VOIT :
- Taux global de reponses (collectif, pas individuel)
- Controles de seance : lancer/arreter, passer au module suivant, reveler
- Signal factuel "X eleves n'ont pas repondu" (nombre, PAS de noms si possible)
- Reponses pour moderation (contenu texte, sans nom associe si possible)
- Modules actifs de la session en cours

### L'intervenant NE VOIT PAS :
- Scores ou niveaux individuels (PAS de XP, PAS de "Figurant/Technicien")
- Classement ou comparaison entre eleves
- Donnees de seances passees
- Streak/serie par eleve
- Tags comportementaux (leader/creative)
- Profilage derive de l'utilisation

### Regle d'or :
> "Si une fonctionnalite permet a un adulte d'identifier un eleve et de l'evaluer a partir de ses donnees, cette fonctionnalite ne doit pas exister."

---

## 3. Architecture existante (a conserver)

```
pilot/page.tsx (603 lignes) — racine, auth, CockpitProvider
  └─ CommandCockpit (252 lignes) — layout responsive 3 colonnes
     ├─ ClasseSidebar (225 lignes) — gauche, liste eleves
     ├─ FocusCockpit (890 lignes) — centre, orchestrateur
     │  ├─ FocusHeader — barre superieure
     │  ├─ FocusQuestionCard — question active
     │  ├─ FocusModuleContent — contenu par module (lazy)
     │  ├─ ResponseStreamSection — flux reponses
     │  └─ FocusFooter — actions contextuelles
     └─ AssistantSidebar (163 lignes) — droite, priorites + timeline
```

**A conserver :** CockpitProvider, context split (data/actions), lazy loading modules, responsive breakpoints, keyboard shortcuts.

**A refactorer :** use-focus-cockpit-state (517 → split en hooks par feature), screen/page.tsx (3062 → split par module).

---

## 4. Features V3 — Matrice de conformite

### GARDER TEL QUEL (de la maquette V6)

| # | Feature | Pourquoi |
|---|---------|----------|
| A | **Flow presession** — selection classe + formule F0/F1/F2 | Deja implemente (API + wizard). A connecter au cockpit. |
| B | **Ecran QR code** — compteur connexion + seuil auto-start | WelcomePanel existant. Ajouter seuil 80% + bouton rappel. |
| D | **Contenu par module** — image, ecriture, quiz, pitch, vote, scenario, storyboard | Deja implementé dans FocusModuleContent (lazy loaded). |
| E | **Ecran projection** — multi-vues (vote, resultat, QR, consigne, attente, noir) | screen/page.tsx existant. Ajouter vues manquantes. |
| G | **Sidebar reponses** — filtre + actions (valider/signaler/masquer/projeter) | Deja dans ResponseStreamSection. Enrichir filtres. |
| H | **Timeline** — historique manches | Deja dans AssistantSidebar (timeline events). |
| J | **Command palette ⌘K** | A creer. Pattern standard, haute valeur UX. |
| K | **Feed notifications** — toggle son | Partiellement existant (toasts). Centraliser en panneau. |
| L | **Theme dark/light** | useCockpitDarkMode existant. |
| M | **Timer global + temps ecoule** | ElapsedTimer existant dans FocusHeader. |
| N | **Controles vote** — ouvrir/fermer/reveler/suivant | Deja dans FocusFooter (handleSelectionBarAction). |

### MODIFIER (idees V6 avec corrections doctrine)

| # | Feature V6 | Probleme | Solution V3 |
|---|-----------|----------|-------------|
| C | Module rail P1-P8 avec % progression | P1-P8 ≠ spec M1-M8. % individuel interdit. | Rail M1-M8 (spec-modules.ts). Progression = % classe ayant repondu, pas XP individuel. Modules filtres par formule (modules_enabled). |
| F | Sidebar eleves avec XP/niveaux/streak/tags | 5 violations doctrine (XP, niveaux, streak, tags, classement). | **Sidebar eleves anonymisee :** pastilles colorees (vert=actif, orange=idle, rouge=deconnecte), compteur "X ont repondu", signal "X mains levees". PAS de noms sur les metriques. Noms visibles UNIQUEMENT pour les actions (encourager/relancer). |
| I | Notes avec tags comportement lies aux eleves | Tags "comportement" sur eleves nommes = profilage. | Notes de session anonymes. Tags factuels : "observation", "a revoir", "idee". PAS de tag "comportement" lie a un eleve. |

### AJOUTER (nouveau)

| # | Feature | Justification |
|---|---------|---------------|
| O | **Marqueur B2b** — signal decadrage oral | Spec M1. Deja implemente (PR #7). |
| P | **Feedback post-session** (D11) | Deja implemente (PR #1). Integrer dans le flow "Terminer". |
| Q | **Selection formule dans le cockpit** | API prete (formulas.ts). Connecter au presession flow. |

### NE PAS IMPLEMENTER

| Feature V6 | Raison |
|---|---|
| XP bars par eleve | Doctrine §5 — l'intervenant ne voit pas les scores individuels |
| Niveaux Figurant/Technicien/etc visibles | Doctrine §7 — classement implicite interdit |
| Streak par eleve | Doctrine §7 — metrique comparative |
| Tags "leader"/"creative" | Doctrine §4.1 — profilage comportemental |
| Bouton "+10 XP" | L'intervenant ne manipule pas les scores |
| Classement/leaderboard | Doctrine §0 — interdit |

---

## 5. Plan d'implementation — 8 chantiers

### Chantier 1 : Flow presession enrichi
**Fichiers :** `pilot/page.tsx`, `welcome-panel.tsx`
**Effort :** Petit

Actuellement le cockpit demarre directement sur WelcomePanel (QR + code). Ajouter :
- Selection classe (depuis les sessions existantes de l'intervenant)
- Affichage formule active (F0/F1/F2) avec description
- Seuil auto-demarrage a 80% des eleves attendus
- Bouton "Envoyer rappel" aux non-connectes
- Liste des non-connectes (noms, car c'est pre-session)

**Contrainte :** La classe et la formule sont deja dans la session (crees via le wizard). Ici on AFFICHE, on ne re-selectionne pas.

### Chantier 2 : Module rail conforme M1-M8
**Fichiers :** `module-sidebar.tsx`, `spec-modules.ts`
**Effort :** Petit (deja fait a 80%)

Le sidebar filtre deja par `modulesEnabled`. Ajouter :
- Progression par phase = % de la classe ayant complete (pas XP individuel)
- Indicateur visuel "module actif" avec animation pulse
- Icone cadenas pour les modules non deverrouilles
- Labels spec (Le Regard, Generer l'idee, Le Recit, etc.)

### Chantier 3 : Ecran projection multi-vues
**Fichiers :** `screen/page.tsx` (3062 lignes — a splitter)
**Effort :** Gros

Ajouter les vues manquantes a l'ecran projete :
- Vue "Consigne" (texte plein ecran, editable depuis le cockpit)
- Vue "Attente" (animation + message "Preparez-vous")
- Vue "Mode noir" (ecran noir, bloque les tablettes eleves)
- Vue "Debat" (3 propositions cote a cote pour discussion orale)
- Vue "Bracket" (historique manches eliminees)

Splitter screen/page.tsx en composants par module (~490 lignes cible).

**Communication cockpit → ecran :** Utiliser le broadcast Supabase existant (`broadcastSessionUpdate`). Ajouter un champ `projection_view` a la session ou utiliser broadcast channel.

### Chantier 4 : Command palette ⌘K
**Fichiers :** nouveau `src/components/pilot/command-palette.tsx`
**Effort :** Moyen

Composant modal avec :
- Input recherche avec focus auto
- Liste d'actions filtrees par recherche
- Categories : Session (pause/reprendre/terminer), Module (switcher), Projection (changer vue), Navigation (sidebar tabs)
- Raccourci ⌘K pour ouvrir, Esc pour fermer
- Actions executent les mutations existantes du CockpitContext

### Chantier 5 : Sidebar eleves conforme doctrine
**Fichiers :** `command/classe-sidebar.tsx`
**Effort :** Moyen

Refonte de la sidebar gauche :
- **Vue liste :** Pastilles colorees (vert/orange/rouge) + nom + avatar
- **Signal factuel :** "12/25 ont repondu" (barre de progression)
- **Signal mains levees :** "3 mains levees" (nombre, pas de noms dans le badge)
- **Detail eleve (au clic) :** Nom + statut + derniere reponse (texte seul) + boutons "Encourager" / "Relancer"
- **PAS DE :** XP, niveau, streak, tags, classement

**Filtre :** Tous / Actifs / Idle / Deconnectes / Mains levees
**Recherche :** Par nom (pour les actions individuelles)

### Chantier 6 : Panneau notes de session
**Fichiers :** nouveau dans `focus-cockpit.tsx` ou sidebar tab
**Effort :** Petit

Ajouter un onglet "Notes" dans la sidebar (ou le plus menu) :
- Textarea avec sauvegarde auto
- Bouton "Horodater" (insere [MM:SS])
- Tags rapides : Observation, A revoir, Idee (PAS "Comportement")
- Notes stockees en `session.teacher_notes` (colonne existante)
- PAS de notes liees a des eleves nommes

### Chantier 7 : Feed notifications centralise
**Fichiers :** nouveau `src/components/pilot/notification-feed.tsx`
**Effort :** Petit

Remplacer les toasts eparpilles par un panneau unifie :
- Derniers 10 evenements avec icone + texte + horodatage
- Categories : reponse, vote, technique, systeme
- Toggle son on/off
- Bouton "Effacer tout"
- **Contrainte doctrine :** Les notifications sont JAMAIS nominatives. "5 eleves ont repondu" pas "Rayan a repondu".

### Chantier 8 : Split use-focus-cockpit-state
**Fichiers :** `use-focus-cockpit-state.ts` (517 lignes)
**Effort :** Moyen

Splitter en hooks par domaine :
- `use-cockpit-preview.ts` — navigation situations, preview mode
- `use-cockpit-responses.ts` — filtres, tri, selection reponses
- `use-cockpit-broadcast.ts` — broadcast messages, history
- `use-cockpit-module-state.ts` — module flags, question data

Le hook principal importe et compose les sous-hooks.

---

## 6. Ordre d'execution

```
Chantier 8 (split hook)     ← fondation, debloque tout
    │
    ├── Chantier 1 (presession)    [independant]
    ├── Chantier 2 (module rail)   [independant]
    ├── Chantier 5 (sidebar eleves) [independant]
    ├── Chantier 6 (notes)         [independant]
    └── Chantier 7 (notifications) [independant]
    │
    ├── Chantier 4 (command palette) [apres 5+6+7 pour avoir toutes les actions]
    └── Chantier 3 (projection)      [le plus gros, peut etre fait en parallele]
```

Chantiers 1, 2, 5, 6, 7 sont independants et peuvent etre faits en parallele.
Chantier 8 est la fondation (facilite les autres mais ne les bloque pas).
Chantier 3 est le plus gros (split de 3062 lignes).
Chantier 4 vient en dernier (a besoin de toutes les actions pour le menu).

---

## 7. Ce qui est DEJA fait (ne pas refaire)

| Element | Statut | Ou |
|---|---|---|
| Formule F0/F1/F2 | Implemente | `formulas.ts`, `schemas.ts`, API sessions |
| Selection formule UI | Implemente | `session-create-wizard.tsx` |
| Mapping M1-M8 | Implemente | `spec-modules.ts`, `modules-data.ts` |
| Sidebar filtre par modulesEnabled | Implemente | `module-sidebar.tsx` |
| Labels spec (Le Regard, etc.) | Implemente | `modules-data.ts` PHASES |
| Marqueur B2b decadrage oral | Implemente | `focus-cockpit.tsx` |
| Feedback post-session D11 | Implemente | `facilitator-feedback-form.tsx` |
| Theme dark/light | Implemente | `use-cockpit-dark-mode.ts` |
| Timer elapsed | Implemente | `FocusHeader` |
| Vote controls | Implemente | `FocusFooter` |
| Role separation intervenant/prof | Implemente | `auth.ts`, middleware |

---

## 8. Stack technique

| Outil | Usage |
|---|---|
| **Next.js 16** | App Router, Server Components |
| **React 19** | Client Components pour le cockpit |
| **Tailwind 4** | Styles (PAS d'inline styles) |
| **Framer Motion** | Animations (via `motion/react`) |
| **TanStack Query** | Data fetching + cache |
| **Supabase** | DB + Auth + Realtime broadcast |
| **Vitest** | Tests unitaires |

---

## 9. Verification

Apres chaque chantier :
- `npx tsc --noEmit` — zero erreur TypeScript
- `npm test` — tous les tests passent
- `npm run build` — build production OK
- Test manuel sur iPad Safari (cible principale)
- Verification doctrine : aucune donnee individuelle visible par l'intervenant

---

## 10. Resume pour le cowork design

**Ce qu'on garde du V6 :**
Flow presession, ecran projection multi-vues, command palette ⌘K, notes horodatees, feed notifications, theme dark/light, controles vote.

**Ce qu'on change :**
Module rail = M1-M8 (pas P1-P8). Sidebar eleves = anonymisee (pastilles de statut, pas de XP/niveaux/streak/tags). Notes = session-level sans noms d'eleves sur les tags. Notifications = jamais nominatives.

**Ce qu'on ne fait PAS :**
XP visible, niveaux par eleve, streak, tags comportementaux, leaderboard, profilage.

**Pourquoi :** La donnee eleve dans Banlieuwood est pedagogique, pas performative. L'intervenant pilote la seance — il ne juge pas les eleves.

---

*Banlieuwood — Spec Cockpit V3 — 28 mars 2026*
