# AUDIT DESIGN EXPERT — Banlieuwood V2
## Inspiré des meilleures références 2026
**Date :** 29 mars 2026

---

## RÉFÉRENCES ANALYSÉES

| Site | Catégorie | Leçon clé |
|------|-----------|-----------|
| **Linear.app** | SaaS dark dashboard | Hiérarchie texte 4 niveaux, animations subtiles, spacing 8px grid |
| **Classroomscreen** | EdTech enseignants | Font Quicksand (ronde, amicale), couleurs sémantiques, widgets modulaires |
| **Duolingo** | EdTech gamification | Font Din Round, gamification visuelle, progress bars expressives |
| **Glenn Catteeuw** | Portfolio minimaliste | Épure totale, chaque pixel a une raison d'être |
| **Ribbit.dk** | Agence motion | Micro-animations au service de la navigation, pas décoratives |
| **1x.tech** | Tech minimaliste | Typographie aérée, espaces blancs généreux, contraste maîtrisé |

---

## CE QUI NE VA PAS DANS BANLIEUWOOD AUJOURD'HUI

### 1. TYPOGRAPHIE — Plate et générique
**Problème :** Plus Jakarta Sans est bien mais utilisée de façon monotone. Tous les textes se ressemblent. Pas de personnalité.

**Inspiration Linear :** 9 niveaux de titres + 5 niveaux de corps, chacun avec line-height et letter-spacing calibrés.

**Fix :**
- Titres principaux (h1) : **Plus Jakarta Sans 800** à 32px, letter-spacing -0.02em
- Sous-titres (h2) : 22px 700, letter-spacing -0.01em
- Labels de section : 11px 700 UPPERCASE tracking 0.08em (déjà fait via label-caps)
- Corps : 14px 400, line-height 1.65
- Micro texte : 12px 500, opacity 0.6
- **Chiffres KPI : font-variant-numeric: tabular-nums; font-feature-settings: "tnum"**
- Ajouter un **font secondaire pour les titres cinema** : Bebas Neue déjà dans le projet

### 2. SPACING — Chaotique
**Problème :** gap-2, gap-2.5, gap-3, gap-4, gap-5, gap-6 utilisés aléatoirement. Pas de rythme vertical.

**Inspiration Linear :** Base 8px stricte. Tout est multiple de 8.

**Fix — Échelle 8px :**
```
4px  → micro (entre icône et texte)
8px  → xs (entre éléments inline)
16px → sm (entre items de liste)
24px → md (entre sections dans une carte)
32px → lg (entre cartes)
48px → xl (entre sections de page)
64px → 2xl (entre blocs majeurs)
```

### 3. CARDS — Toutes identiques, pas de profondeur
**Problème :** Toutes les cartes ont le même fond `bg-card` + `border`. Pas de hiérarchie.

**Inspiration Linear + Classroomscreen :**
- **Carte primaire** (session en cours) : fond légèrement plus lumineux, border accent, shadow-md
- **Carte standard** (KPI, modules) : fond card, border subtle, shadow-sm
- **Carte secondaire** (historique) : pas de shadow, border très subtile
- **Carte interactive** (hover) : lift -2px + shadow-lg + border accent

**Fix CSS :**
```css
.card-primary { background: var(--card); border: 1px solid var(--border); box-shadow: 0 4px 24px rgba(0,0,0,0.12); }
.card-standard { background: var(--card); border: 1px solid var(--border); box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.card-subtle { background: transparent; border: 1px solid var(--border-subtle); }
.card-interactive:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(139,92,246,0.12); border-color: var(--accent)/30; }
```

### 4. ANIMATIONS — Quasi inexistantes
**Problème :** Les seules animations sont les `motion.div` de framer-motion. Pas de micro-interactions.

**Inspiration Ribbit :** Chaque interaction a un feedback visuel subtil. Le motion est au service de la navigation.

**Fix :**
- **Page transitions** : fade 200ms entre les pages (`AnimatePresence` sur le layout)
- **Hover boutons** : scale(1.02) + shadow shift sur 150ms
- **Hover cards** : translateY(-2px) sur 200ms ease-out
- **Skeleton loading** : shimmer gradient animé (déjà présent)
- **KPI chiffres** : count-up animation au scroll (comme le landing)
- **Progress bars** : animation width sur 600ms ease-out (déjà présent)
- **Sidebar active** : background slide avec transition 200ms
- **Notifications** : slide-in depuis la droite + fade

### 5. COULEURS — Pas assez de hiérarchie dans le dark
**Problème :** Le dark theme a 2 niveaux de surface (#0c0c18 bg + #161633 card). Pas assez de profondeur.

**Inspiration Linear :** 4+ niveaux de surface + bordures subtiles + glows d'accent.

**Fix — Palette dark étendue :**
```
Surface 0 : #08081a (fond absolu — derrière tout)
Surface 1 : #0c0c18 (fond de page — bg principal)
Surface 2 : #13132a (sidebar, header — éléments structurels)
Surface 3 : #161633 (cartes — contenu principal)
Surface 4 : #1a1a35 (cartes hover, popovers — élevé)
Surface 5 : #1e1e40 (modales, dropdowns — le plus élevé)

Border 1 : rgba(255,255,255,0.04) — le plus subtil
Border 2 : #2a2a50 — standard
Border 3 : rgba(139,92,246,0.2) — accent hover

Glow accent : 0 0 20px rgba(139,92,246,0.15) — sur les éléments actifs
```

### 6. SIDEBAR — Trop basique
**Problème :** La sidebar est une liste de liens avec des emoji. Pas de personnalité.

**Inspiration Notion :** Sidebar avec sections collapsibles, indicateurs visuels, animations fluides.

**Fix :**
- Logo Banlieuwood en haut avec glow subtil
- Séparateur visuel entre navigation et actions
- Active state : barre latérale violette 3px à gauche + fond accent
- Hover : fond très subtil + transition 150ms
- Bouton "Nouvelle séance" : gradient violet→pink avec glow pulsé
- Footer sidebar : séparateur + items plus petits (settings, aide, logout)

### 7. HEADER — Trop discret
**Problème :** Le header a juste "Banlieuwood" + recherche + notifications. Pas de breadcrumb, pas de contexte.

**Fix :**
- Ajouter un breadcrumb dynamique ("Dashboard > Séances > Détail")
- Badge de notification avec animation pulse quand nouvelles notifs
- Avatar utilisateur à droite (pas juste le nom dans la sidebar)
- Séparateurs visuels entre les actions

### 8. TABLE — Design générique
**Problème :** La table "Séances récentes" ressemble à n'importe quelle table HTML.

**Inspiration Linear :** Tables avec hover row highlight, status dots, actions au hover.

**Fix :**
- Row hover : fond accent très subtil + transition
- Status badge dans la colonne DATE ou CLASSE
- Actions : apparaissent au hover seulement (pas toujours visibles)
- Alternating row : pas de zebra, mais séparateurs très subtils
- Header : font-weight 600, uppercase tracking, couleur muted

### 9. KPI CARDS — Trop simples
**Problème :** Juste un chiffre + label. Pas d'émotion.

**Inspiration Duolingo :** Chaque stat a une icône expressive, une couleur, un contexte.

**Fix :**
- Chaque KPI a une **icône dans un cercle coloré** (déjà fait)
- Ajouter une **tendance** : flèche ↑↓ + pourcentage + "vs semaine dernière"
- Ajouter un **sparkline** mini graphique en arrière-plan (7 derniers jours)
- Accent bar en haut : **gradient** au lieu de couleur unie
- Au hover : **scale légèrement + glow de la couleur d'accent**

### 10. EMPTY STATES — Froids
**Problème :** "Aucune séance dans cette catégorie" + bouton. C'est fonctionnel mais pas engageant.

**Inspiration Duolingo :** Chaque état vide a une illustration, un message encourageant, une action claire.

**Fix :**
- Illustration 🎬 emoji plus grand (64px) avec animation float subtile
- Message principal en bold : "C'est calme ici !"
- Sous-message en muted : "Créez votre première séance pour voir la magie opérer"
- Bouton CTA avec gradient + glow

---

## PLAN D'IMPLÉMENTATION

### Phase A — Fondations (impact global, 1 PR)
1. Étendre la palette dark (6 niveaux de surface)
2. Ajouter les utility classes de cards (.card-primary, .card-standard, etc.)
3. Calibrer la typographie (letter-spacing, line-height)
4. Uniformiser le spacing sur l'échelle 8px

### Phase B — Sidebar + Header (1 PR)
5. Sidebar : active state avec barre violette
6. Sidebar : glow sur le bouton CTA
7. Header : breadcrumb dynamique
8. Header : avatar utilisateur

### Phase C — Dashboard (1 PR)
9. KPI cards : gradient accent bar + hover glow
10. Table : row hover transitions + status badges inline
11. Session en cours : card-primary avec glow
12. Empty states : illustrations animées

### Phase D — Micro-animations (1 PR)
13. Page transitions (layout-level AnimatePresence)
14. Hover boutons : scale + shadow
15. Card hover : lift + glow
16. Notification badge : pulse animation
17. KPI count-up au scroll

### Phase E — Pages secondaires (1 PR)
18. Séances list : cards avec status bar + hover
19. Settings : sections avec icônes + spacing
20. Bibliothèque : module cards avec couleur accent forte
21. Aide : cards avec icônes expressives

---

## MÉTRIQUES DE QUALITÉ DESIGN

| Critère | Actuel | Cible |
|---------|--------|-------|
| Niveaux de surface dark | 2 | 6 |
| Niveaux typographiques | ~4 | 7+ |
| Micro-animations | ~3 | 15+ |
| Hover states explicites | ~40% | 100% |
| Spacing cohérent (8px grid) | ~50% | 100% |
| Transitions sur interactions | ~30% | 100% |
| Empty states expressifs | 0 | 5+ |
| Cards avec hiérarchie visuelle | 1 type | 4 types |
