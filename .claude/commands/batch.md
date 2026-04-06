# /batch — Migration ou refactoring parallèle multi-agents

Décompose une grosse tâche en unités indépendantes, spawn 1 agent par unité en worktree isolé. Idéal pour les migrations à grande échelle.

## Usage

`/batch migrate src/ from Solid to React`
`/batch rename all API routes from /api/v1 to /api/v2`
`/batch add error boundaries to all page components`
`/batch convert all class components to hooks`

## Quand utiliser

- Migration de framework ou bibliothèque sur N fichiers
- Refactoring systématique (renommage, pattern, style)
- Ajout d'un comportement uniforme sur de nombreux fichiers
- Tâches répétitives mais indépendantes par fichier/module

## Quand NE PAS utiliser

- Tâches avec dépendances entre elles (B a besoin du résultat de A)
- Moins de 5 fichiers — faire directement
- Changements qui nécessitent une coordination fine

## Processus interne

### Phase 1 — Research (Explore agent, read-only)
1. Analyser le codebase pour identifier toutes les unités concernées
2. Estimer la complexité de chaque unité (S/M/L)
3. Vérifier les dépendances entre unités

### Phase 2 — Plan (présenter pour validation)
```
BATCH PLAN — [description]

Unités identifiées (N fichiers) :
  ✓ src/components/Button.tsx — S
  ✓ src/components/Card.tsx — S
  ✓ src/lib/api.ts — M
  ...

Stratégie :
  - [N] agents en parallèle
  - Worktree isolé par agent
  - Chaque agent : implémente + run tests + commit

Risques :
  - [fichiers partagés qui pourraient créer des conflits]

Approuver ? [y/N]
```

### Phase 3 — Exécution (après validation)
```bash
# Chaque agent dans son propre worktree :
# 1. Checkout worktree isolé
# 2. Implémente la migration sur son unité
# 3. Run les tests locaux
# 4. Commit + push branch
# 5. Ouvre une PR
```

### Phase 4 — Rapport
```
BATCH COMPLETE — [date]

✅ Succès (N agents) :
  - src/components/Button.tsx → PR #42
  - src/components/Card.tsx → PR #43

❌ Échec (M agents) :
  - src/lib/api.ts — erreur TypeScript ligne 45

Actions : merger les PRs dans l'ordre, reviewer les échecs
```

## Limites

- 5-30 agents en parallèle (au-delà = surcharge)
- Chaque agent = contexte window séparé → ne peuvent pas se parler
- Les worktrees partagent le même repo → surveiller les conflits
- Nécessite `isolation: worktree` dans les agents

## Activation Agent Teams (expérimental)

Pour des tâches qui nécessitent une vraie coordination entre agents :

```bash
# Activer dans settings.json :
# "env": { "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1" }
```

Agent Teams = agents peer-to-peer avec task list partagée. Différent de /batch (qui utilise des subagents indépendants).
