# /debug — Chasse au bug systématique

Diagnostic structuré avant de toucher au code. Ne jamais corriger à l'aveugle.

## Usage

`/debug` — debug le bug décrit dans la conversation
`/debug [description]` — debug un problème précis
`/debug --scope [fichier/module]` — limiter la recherche

## Processus

### Phase 1 — Comprendre (AVANT de toucher au code)

1. **Reproduire** : Est-ce que le bug est reproductible ? Comment ?
2. **Circonscrire** :
   - Quand ça marchait ? (dernier commit qui fonctionnait)
   - Depuis quand c'est cassé ?
   - Seulement en prod ou aussi en dev ?
3. **Isoler** : Quel est le plus petit cas qui reproduit le bug ?

```bash
# Trouver le commit qui a introduit le bug
git log --oneline -20
git bisect start  # si nécessaire
```

### Phase 2 — Hypothèses

Lister 3-5 hypothèses du plus probable au moins probable :

```
H1 (80%) — [hypothèse la plus probable — explication]
H2 (15%) — [deuxième hypothèse]
H3 (5%)  — [hypothèse de base]
```

Tester H1 en premier. Ne pas coder un fix avant d'avoir confirmé la cause.

### Phase 3 — Investigation

Pour chaque hypothèse :

```bash
# Lire les fichiers suspects AVANT de grep
# Grep les patterns suspects
# Vérifier les logs
# Vérifier les types TypeScript
npx tsc --noEmit
# Vérifier les tests existants
npm test -- --reporter=verbose
```

**Rapport d'investigation :**
```
CAUSE CONFIRMÉE : [description précise]
FICHIER(S) : [path:line]
POURQUOI : [explication technique]
DEPUIS : [commit ou PR si identifiable]
```

### Phase 4 — Fix

1. Fix minimal — ne corriger QUE ce qui cause le bug
2. Pas de refactoring collatéral
3. Ajouter un test qui reproduit le bug (si applicable)
4. Vérifier que les autres tests passent

```bash
npm test
npx tsc --noEmit
npm run lint
```

### Phase 5 — Post-mortem (optionnel)

Pour les bugs importants, ajouter dans `RULES.md` :
```
# [DATE] BUG : [description courte]
CAUSE : [raison technique]
RÈGLE : [comment éviter à l'avenir]
```

## Catégories de bugs

| Type | Premiers suspects |
|------|------------------|
| TypeScript error | Types incompatibles, `any` implicite, assertions incorrectes |
| Runtime error | `undefined` access, async non-awaité, race condition |
| UI glitch | CSS conflicting, hydration mismatch, z-index |
| Data bug | Query incorrecte, RLS manquant, cache périmé |
| Auth bug | Cookie expiré, middleware config, RLS policy |
| Performance | Re-render excessif, query N+1, bundle size |
| Build error | Import circulaire, version incompatible, env var manquante |
