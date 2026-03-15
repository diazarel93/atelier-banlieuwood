# Cockpit Plugins — Audit d'optimisation

> Date : 2026-03-15
> Scope : `src/components/pilot/`, `src/hooks/use-pilot-session.ts`, `src/app/(dashboard)/session/[id]/pilot/page.tsx`

---

## HIGH IMPACT

### 1. CockpitContext monolithique
- **Fichier** : `src/components/pilot/cockpit-context.tsx`
- **Problème** : Un seul context porte données + 14 mutations + 4 callbacks. Quand UNE valeur change (ex: 1 nouvelle réponse), TOUS les consumers re-render.
- **Fix** : Séparer en `CockpitDataContext` (données) et `CockpitActionsContext` (mutations stables).

### 2. useEffect+useState → useMemo dans ai-assistant-panel
- **Fichier** : `src/components/pilot/ai-assistant-panel.tsx:117-126`
- **Problème** : `generateSuggestions(context)` tourne dans un `useCallback` → `useEffect` → `setSuggestions`. Chaque changement de `context` déclenche un render supplémentaire via le setState.
- **Fix** : Remplacer par `useMemo(() => generateSuggestions(context).filter(...), [context, dismissed])`.

### 3. 7 polling queries concurrentes
- **Fichier** : `src/hooks/use-pilot-session.ts:85-190`
- **Problème** : 7 queries TanStack avec refetchInterval (6 à 10s en mode déconnecté = ~36 req/min).
- **Fix** : Consolider session+situation+responses en 1 endpoint combiné. Ajouter `staleTime` pour éviter les refetch au re-mount.

### 4. O(n²) lookups dans class-dashboard-panel
- **Fichier** : `src/components/pilot/class-dashboard-panel.tsx:449-476`
- **Problème** : `studentStates.map(s => session.students?.find(st => st.id === s.id))` — O(n) find dans un O(n) map = O(n²). 30 élèves = 900 comparaisons/render.
- **Fix** : Pre-build `Map<string, Student>` via `useMemo`.

### 5. ~35 imports synchrones de composants modaux/panels
- **Fichier** : `src/app/(dashboard)/session/[id]/pilot/page.tsx:63-120`
- **Problème** : WordCloud, ClassroomMap, SpotlightModal, DebatePanel, StudentFiche, SessionExport, SessionReplay etc. importés synchrone alors qu'ils ne sont pas visibles au chargement initial.
- **Fix** : `dynamic(() => import(...), { ssr: false })` pour les composants modaux/conditionnels (~90KB économisés).

---

## MEDIUM IMPACT

### 6. 200 lignes de navigation dupliquées
- **Fichiers** : `page.tsx:530-625` + `use-cockpit-navigation.ts:77-217`
- **Problème** : La logique de navigation (goToSituation, nextSituation, handleNextAction, auto-advance) existe en double.
- **Fix** : Supprimer la version inline de `page.tsx`, ne garder que le hook.

### 7. hasPrimaryAttention calculé 2x
- **Fichiers** : `page.tsx:771-786` + `use-cockpit-timeline.ts:131-146`
- **Problème** : `computeAttentionQueue` appelé avec les mêmes inputs aux deux endroits.
- **Fix** : Centraliser dans le hook ou le context.

### 8. Dérivées dupliquées (visibleResponses, voteOptionCount, respondedStudentIds)
- **Fichiers** : `page.tsx:255-257` + `use-cockpit-navigation.ts:24-25` + `page.tsx:496/764`
- **Problème** : Les mêmes `.filter()` et `new Set()` tournent 2x par cycle.
- **Fix** : Calculer une seule fois et passer via context ou props.

### 9. fetch() brut hors TanStack Query
- **Fichier** : `page.tsx:241-248`
- **Problème** : `fetch(/api/sessions/${id}/situations-preview)` dans un useEffect — pas de cache, pas de retry, pas d'invalidation Realtime.
- **Fix** : Migrer vers `useQuery`.

### 10. 30 animations CSS infinies + GPU layers dans StudentConstellation
- **Fichier** : `student-constellation.tsx:148-203`
- **Problème** : `will-change: transform` sur chaque étoile (30 GPU layers) + 3 @keyframes infinies + feGaussianBlur filters.
- **Fix** : `@media (prefers-reduced-motion: reduce)`, limiter `will-change` au hover, cap les glow filters à 10 étoiles.

---

## LOW IMPACT

### 11. attentionSignals dépend de tout `context`
- **Fichier** : `ai-assistant-panel.tsx:189`
- **Fix** : Décomposer en champs spécifiques `[context.stuckCount, context.handsRaised, ...]`.

### 12. BaseRadar motion.path sur données fréquentes
- **Fichier** : `base-radar.tsx:127-146`
- **Fix** : Passer `animated={false}` après le mount initial pour les radars en mise à jour fréquente.

### 13. Celebration glow ring en motion infini
- **Fichier** : `class-dashboard-panel.tsx:198-204`
- **Fix** : Remplacer `motion.div` infini par CSS `@keyframes` avec `will-change: transform`.

### 14. teacher-docks.tsx (47KB) importé synchrone
- **Fichier** : `teacher-docks.tsx` (1200+ lignes)
- **Fix** : `dynamic()` import ou split en sous-composants.
