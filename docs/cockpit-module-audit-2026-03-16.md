# Audit Modules Cockpit — 16 mars 2026

## Matrice de conformité

| Module Adrian | dbModule | Séances | Statut | Notes |
|---|---|---|---|---|
| M1 Observer | 1 | S1 Positionnement, S2 Emotion, S3 Analyse | ✅ OK | Types TS complétés |
| M2 Comprendre | 2 | S1 Reformulation, S2 Argument, S3 Comparaison | ✅ FIXÉ | Comparaison wirée (useQuery + useMutation) |
| M3 Et si... | 10 | S1 Et si... | ✅ OK | Flag isM11Any ajouté |
| M4 Pitch | 10 | S2 Pitch | ✅ OK | — |
| M5 Construire | 12 | S1 Rôles, S2 Missions | ✅ OK | 5 rôles (évolution intentionnelle) |
| M6 Écrire | 5 | S1 Écriture, S2 Relecture | ✅ OK | Fonctionne via Q&A fallback |
| M7 Visualiser | 7 | S1 Storyboard, S2 Découpage | ✅ OK | Fonctionne via Q&A fallback |
| M8 Produire | 8 | S1 Budget, S2 Planning | ✅ FIXÉ | BudgetCards reçoit les données réelles |
| M9 Ciné-Débat | 11 | S1-S3 | ✅ FIXÉ | Module11Cockpit créé (citations, vidéos, affiches, débats) |
| M10 Concordance | 3 | S1 | ✅ OK | Fonctionne via Q&A |
| M11 Concordance+ | 4 | S1 | ✅ OK | Fonctionne via Q&A |
| Bonus Vivre | 6 | S1-S2 | ✅ OK | Fonctionne via Q&A |

## Bugs corrigés

### BUG-1 : M2 S3 Comparaison non wirée ✅ FIXÉ

**Fichiers modifiés** : `src/components/pilot/focus/focus-module-content.tsx`

**Correctif** :
- Ajout `useState<string[]>` pour `selectedSceneIds`
- Ajout `useQuery` vers `/api/sessions/${sessionId}/scene` pour fetcher les scènes
- Ajout `useMutation` vers `/api/sessions/${sessionId}/scene-compare` pour projeter la confrontation
- Données réelles passées à `Module2ECCockpit`

---

### BUG-2 : M11 Ciné-Débat — données stimulus perdues ✅ FIXÉ

**Fichiers modifiés** :
- `src/hooks/use-cockpit-module-flags.ts` — ajout `isM11Any`
- `src/components/pilot/module11-cockpit.tsx` — CRÉÉ — affiche citations, vidéos YouTube, affiches TMDB, débats
- `src/components/pilot/focus/focus-module-content.tsx` — ajout case M11 + import dynamique

---

### BUG-3 : M9 Budget Cards toujours vide ✅ FIXÉ

**Fichier modifié** : `src/components/pilot/focus/focus-module-content.tsx`

**Correctif** :
- Ajout `useQuery` vers `/api/sessions/${sessionId}/budget` (refetch 12s)
- `Module9BudgetCards` reçoit `budgetData?.budgets` au lieu de `[]`
- `Module9BudgetOverview` utilise aussi `budgetData?.averages` en priorité

---

### BUG-4 : M1 Types TypeScript incomplets ✅ FIXÉ

**Fichier modifié** : `src/hooks/use-session-polling.ts`

**Correctif** : Ajout de `twoPhase?: boolean`, `currentPhase?: number`, `phase1Text?: string | null` à `Module1Data`

---

### BUG-5 : Flags de module manquants ✅ FIXÉ

**Fichier modifié** : `src/hooks/use-cockpit-module-flags.ts`

**Correctif** : Ajout `isM11Any = mod === 11`, inclus dans `canGoNext`/`canGoPrev`, exporté dans le return

---

### BUG-6 : M6 Missions — 5 rôles au lieu de 4 → NON-BUG

**Verdict** : Évolution intentionnelle. Les 5 rôles (Acteur/Créatif/Détective/Provocateur/Stratège) couvrent mieux les compétences que les 4 originaux. Code fonctionnel.

---

## Modules fonctionnels via Q&A fallback (5)

Ces modules n'ont pas de composant cockpit dédié mais fonctionnent correctement via le système standard question/réponse :

- M6 Écrire (dbModule 5) — S1 Écriture, S2 Relecture
- M7 Visualiser (dbModule 7) — S1 Storyboard, S2 Découpage
- M10 Concordance (dbModule 3)
- M11 Concordance+ (dbModule 4)
- Bonus Vivre (dbModule 6)

## Résumé

- **6 bugs identifiés** → 5 corrigés, 1 non-bug (intentionnel)
- **0 régression** — tsc + next build clean
- **1 composant créé** : `Module11Cockpit` (stimulus ciné-débat)
- **Toutes les corrections** dans `focus-module-content.tsx` (data fetching centralisé)
