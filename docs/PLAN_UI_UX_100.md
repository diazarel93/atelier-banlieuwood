# PLAN D'AMÉLIORATION UI/UX — Banlieuwood V2
**Objectif : 100% cohérence design + ergonomie**
**Date : 28 mars 2026**

---

## NIVEAU 1 — SYSTÈME DE DESIGN (impact global)

### 1.1 Standardiser la typographie
**Problème :** 6+ tailles de texte hardcodées (`text-[13px]`, `text-[11px]`, `text-[12px]`) au lieu d'utiliser l'échelle définie dans globals.css.

**Action :**
- Remplacer TOUS les `text-[Xpx]` par les classes existantes :
  - `text-[10px]` → `text-body-xs` (11px)
  - `text-[11px]` → `text-body-xs`
  - `text-[12px]` → `text-body-xs` ou `text-body-sm`
  - `text-[13px]` → `text-body-sm` (13px)
  - `text-[14px]` → `text-sm` (14px)
- Fichiers : app-shell.tsx, page.tsx (dashboard), seances/page.tsx, tous les composants v2/

### 1.2 Uniformiser le spacing
**Problème :** 6+ valeurs de gap différentes dans une seule page (`gap-2`, `gap-2.5`, `gap-3`, `gap-4`, `gap-5`, `gap-6`).

**Action :**
- Adopter l'échelle 8px : `gap-2` (8px), `gap-4` (16px), `gap-6` (24px), `gap-8` (32px)
- Supprimer les demi-valeurs (`gap-2.5`, `gap-3.5`, `gap-1.5`) sauf quand strictement nécessaire
- Padding des cartes : unifier à `p-5` (20px) pour toutes les cartes de même hiérarchie
- Fichiers : TOUS les composants v2/

### 1.3 Supprimer les couleurs hardcodées
**Problème :** 15+ endroits avec des `#RRGGBB` ou `rgba()` au lieu des CSS variables.

**Action :**
- `#10B981` → `var(--color-bw-green)`
- `#F59E0B` → `var(--color-bw-amber)`
- `#4ECDC4` → `var(--color-bw-teal)`
- `#8b5cf6` → `var(--color-bw-violet)`
- `#f472b6` → `var(--color-bw-pink)`
- `rgba(16,185,129,X)` → `var(--color-bw-green)` avec opacity Tailwind
- Fichiers : page.tsx (dashboard), status-badge.tsx, kpi-card.tsx

### 1.4 Ombres cohérentes
**Problème :** Les glass-shadow sont teintées violet (rgb 107,70,193) mais le design spec demande des ombres neutres.

**Action :**
- Vérifier que `--glass-shadow` utilise des ombres neutres en mode clair
- Aligner toutes les ombres sur `--shadow-sm`, `--shadow-md`, `--shadow-lg` du design spec

---

## NIVEAU 2 — ACCESSIBILITÉ (impact ergonomie)

### 2.1 Focus indicators partout
**Problème :** 60% des éléments interactifs n'ont pas d'indicateur de focus au clavier.

**Action :**
- Ajouter `focus-visible:ring-2 focus-visible:ring-bw-primary/50 focus-visible:outline-none` sur :
  - Sidebar nav items (app-shell.tsx)
  - Mobile bottom nav items
  - KPI cards (si cliquables)
  - Table rows (liens "Voir")
  - Tabs (seance-tabs.tsx)
  - Tous les boutons et liens

### 2.2 Contraste couleurs
**Problème :** La couleur teal `#4ECDC4` sur fond blanc = ratio 3.5:1 (FAIL WCAG AA).

**Action :**
- Utiliser `--color-bw-teal-readable` (#2AB5A8, ratio 4.6:1) pour tout texte teal
- Vérifier les badges de statut "En cours" (responding) utilisent la version lisible
- Fichier : status-badge.tsx, STATUS_BAR_COLORS

### 2.3 Information non-couleur-seule
**Problème :** Les barres de statut latérales et les pastilles de module utilisent la couleur comme seul indicateur.

**Action :**
- Ajouter un aria-label sur les barres de statut : `aria-label="Statut: En cours"`
- Ajouter un texte sr-only pour les pastilles de module

### 2.4 Animations respectent prefers-reduced-motion
**Problème :** Les animations pulse (badges LIVE, EN COURS) ne respectent pas `prefers-reduced-motion`.

**Action :**
- Envelopper les `animate-pulse` dans `motion-safe:animate-pulse`
- Ou utiliser la class existante dans globals.css qui désactive les animations

---

## NIVEAU 3 — COMPOSANTS (impact par page)

### 3.1 Transitions hover manquantes
**Problème :** KPI cards, action links, table rows n'ont pas de transition fluide au hover.

**Action :**
- KPI cards : ajouter `hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`
- Table rows : ajouter `transition-colors duration-150`
- Action links sidebar droite : ajouter `transition-colors duration-150`

### 3.2 Bouton CTA cohérent
**Problème :** Le bouton "Nouvelle séance" utilise `bg-bw-primary` dans la sidebar et `bg-gradient-to-r from-[#8b5cf6] to-[#f472b6]` dans le dashboard.

**Action :**
- Unifier : utiliser `bg-bw-primary` (orange #FF6B35) dans la sidebar et gradient violet→pink dans le dashboard (c'est un choix hiérarchique OK)
- OU créer une classe `.btn-cta` réutilisable

### 3.3 Empty state button
**Problème :** Le composant EmptyState a un bouton CTA hardcodé au lieu d'utiliser un composant Button réutilisable.

**Action :**
- Extraire le bouton dans un composant `<Button variant="primary">` partagé
- L'utiliser partout (empty states, dialogs, forms)

---

## NIVEAU 4 — PAR PAGE (polish spécifique)

### 4.1 Dashboard `/v2`
- [ ] Remettre le calendrier/agenda dans la colonne droite
- [ ] KPI : ajouter hover effect (lift + shadow)
- [ ] Greeting : vérifier que `text-gradient-cinema` rend bien en mode clair
- [ ] Table récentes : ajouter badge statut coloré dans la colonne PARTICIPATION

### 4.2 Séances `/v2/seances`
- [ ] Tabs : ajouter badges compteurs avec couleur de fond (spec 4.8)
- [ ] Vérifier que l'onglet "En cours" s'active automatiquement si sessions actives

### 4.3 Nouvelle séance `/v2/seances/new`
- [ ] Stepper : augmenter le contraste des étapes inactives
- [ ] Sélecteur formule : rendre F1/F2 plus lisibles quand non sélectionnés
- [ ] Date/heure : vérifier que l'input natif datetime-local est lisible sur fond lavande

### 4.4 Détail séance `/v2/seances/{id}`
- [ ] Modules : remplacer les lettres par les vrais emoji (👁️, ✨, 🎤, etc.)
- [ ] Boutons secondaires : augmenter la visibilité (bordure + fond léger)
- [ ] Titre de la séance : texte plus gros/gras pour la hiérarchie

### 4.5 Settings `/v2/settings`
- [ ] Ajouter un bouton "Enregistrer" dans la section Profil
- [ ] Espacement entre les sections : uniformiser à `gap-6` (24px)

### 4.6 Bibliothèque `/v2/bibliotheque`
- [ ] Section méthodologie : augmenter le contraste du texte descriptif
- [ ] Badges domaines D1-D5 : vérifier la lisibilité en mode clair

### 4.7 Aide `/v2/aide`
- [ ] Ajouter une 6ème carte guide (la spec en demande 6)
- [ ] Raccourcis clavier : vérifier que les touches sont bien visibles

---

## NIVEAU 5 — RESPONSIVE (mobile/tablette)

### 5.1 Mobile drawer
- [ ] Limiter la largeur à `max-w-[85vw]` au lieu de fixe 280px
- [ ] Ajouter un indicateur de swipe-to-close

### 5.2 Tables
- [ ] Ajouter un indicateur de scroll horizontal quand la table dépasse
- [ ] Ou transformer en liste de cartes sur mobile

### 5.3 KPI grid
- [ ] Tester sur tablette portrait (768px) — s'assurer que 2 colonnes fonctionnent
- [ ] Sur mobile paysage, considérer 4 colonnes

### 5.4 Contenu sous barres fixes
- [ ] Vérifier que le `pt-16 lg:pt-6` fonctionne sur tous les écrans
- [ ] Tester avec la bottom nav mobile (pb-20)

---

## ORDRE D'EXÉCUTION RECOMMANDÉ

```
Phase 1 (Système — impact maximum)
  1.1 Standardiser typographie
  1.3 Supprimer couleurs hardcodées
  2.1 Focus indicators

Phase 2 (Composants — impact moyen)
  3.1 Transitions hover
  2.2 Contraste teal
  1.2 Uniformiser spacing

Phase 3 (Pages — polish)
  4.1-4.7 Fixes par page
  2.3 Information non-couleur

Phase 4 (Responsive — finition)
  5.1-5.4 Mobile/tablette
  2.4 Animations prefers-reduced-motion
```

---

## MÉTRIQUES DE SUCCÈS

- [ ] 0 couleur hardcodée dans les composants (tout via CSS variables)
- [ ] 0 `text-[Xpx]` — tout via l'échelle typographique
- [ ] 100% des éléments interactifs ont un focus indicator
- [ ] WCAG AA sur tous les textes (ratio ≥ 4.5:1)
- [ ] Spacing uniforme (échelle 8px)
- [ ] Transitions sur tous les hover states (200ms)
