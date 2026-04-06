# /audit-project — Auditer n'importe quel projet contre le standard du starter kit

Analyse un projet existant et produit un rapport de conformité complet.

## Usage

`/audit-project ~/mon-projet`
`/audit-project ~/lokivo-app`
`/audit-project ~/kura-v4`

## Instructions

### Phase 1 — Discovery
Lire dans le projet cible :
- `CLAUDE.md` (existe ? complet ?)
- `.claude/settings.json` (existe ? hooks configurés ?)
- `.claude/agents/` (quels agents présents ?)
- `.claude/commands/` (quelles commandes ?)
- `.gitignore` (`.env` ignoré ? `settings.local.json` ignoré ?)
- `package.json` (scripts `check-all`, `format`, `type-check` présents ?)
- `RULES.md` (existe ?)

### Phase 2 — Audit sécurité
```bash
# Chercher secrets exposés
grep -r "SUPABASE_SERVICE_ROLE_KEY\|API_KEY\|SECRET" src/ --include="*.ts" --include="*.tsx" -l
# Chercher any TypeScript
grep -r ": any\|as any" src/ --include="*.ts" --include="*.tsx" -c
# Chercher console.log en prod
grep -r "console\.log" src/ --include="*.ts" --include="*.tsx" -l
```

### Phase 3 — Audit DB (si Supabase)
```bash
# Vérifier RLS sur toutes les migrations
grep -r "ROW LEVEL SECURITY\|ENABLE ROW" supabase/migrations/ -l
```

### Phase 4 — Rapport

```
AUDIT PROJET : [nom] — [date]
Standard de référence : starter-kit (avril 2026)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SETUP CLAUDE CODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[ ] CLAUDE.md présent et complet       → [statut]
[ ] settings.json avec hooks           → [statut]
[ ] settings.local.json gitignored     → [statut]
[ ] Agents disponibles : [liste]       → [manquants]
[ ] Commands disponibles : [liste]     → [manquants]
[ ] RULES.md présent                   → [statut]
[ ] Memory system configuré            → [statut]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUALITÉ CODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[ ] TypeScript strict, 0 `any`         → [X occurrences]
[ ] check-all script présent           → [statut]
[ ] Prettier configuré                 → [statut]
[ ] Tests présents (Vitest)            → [statut]
[ ] E2E présents (Playwright)          → [statut]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SÉCURITÉ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[ ] .env dans .gitignore               → [statut]
[ ] 0 secret exposé dans le code       → [statut]
[ ] RLS sur toutes les tables          → [statut]
[ ] Validation zod aux frontières API  → [statut]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GIT WORKFLOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[ ] Branch protection sur main         → [statut]
[ ] Conventional commits               → [statut]
[ ] Husky / lint-staged configuré      → [statut]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCORE GLOBAL : XX/20 points
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 CRITIQUE (à corriger maintenant) :
  - [item]

🟠 IMPORTANT (à corriger ce sprint) :
  - [item]

🟡 AMÉLIORATION (backlog) :
  - [item]

PLAN DE MISE À JOUR SUGGÉRÉ :
  1. [action prioritaire 1]
  2. [action prioritaire 2]
  ...
```

## Règles
- Ne jamais modifier le projet cible sans confirmation explicite
- Signaler mais ne pas corriger automatiquement les problèmes de sécurité
- Proposer un plan d'action concret après le rapport
