# /propagate — Propager les updates du starter kit vers un projet

Copie les fichiers `.claude/` du starter kit vers un projet cible.

## Usage

`/propagate banlieuwood` — propage vers Banlieuwood
`/propagate all` — propage vers tous les projets
`/propagate lokivo --dry-run` — preview sans modifier

## Instructions

### 1. Lire `projects.json` pour trouver le chemin du projet

### 2. Identifier ce qui doit être propagé

Fichiers **toujours propagés** (remplacés) :
- `.claude/agents/code-reviewer.md`
- `.claude/agents/db-architect.md`
- `.claude/agents/feature-planner.md`
- `.claude/agents/cto-advisor.md`
- `.claude/agents/ai-auditor.md`
- `.claude/agents/dependency-sentinel.md`
- `.claude/agents/project-auditor.md`
- `.claude/commands/check.md`
- `.claude/commands/ship.md`
- `.claude/commands/bughunter.md`
- `.claude/commands/ultraplan.md`
- `.claude/commands/simplify.md`
- `.claude/commands/audit-project.md`
- `.claude/commands/debug.md`
- `.claude/commands/release.md`
- `.claude/commands/eval.md`
- `.claude/commands/batch.md`
- `.claude/agents/prompt-engineer.md`
- `.claude/rules/security.md`
- `.claude/rules/typescript.md`
- `.claude/hooks/protect-files.sh`
- `.claude/hooks/verify-before-stop.sh`
- `.claude/mcp-template.json`

Fichiers **propagés si absents seulement** (ne pas écraser) :
- `.claude/settings.json` — peut avoir des hooks projet-spécifiques
- `RULES.md` — peut avoir des règles projet-spécifiques
- `.claude/memory/MEMORY.md`

### 3. Mode --dry-run : afficher les diffs sans modifier

### 4. Mode normal : copier avec confirmation par fichier si settings.json existant

```bash
# Exemple pour un fichier
cp ~/starter-kit/.claude/agents/code-reviewer.md ~/[projet]/.claude/agents/code-reviewer.md
```

### 5. Rapport de propagation

```
PROPAGATE → [projet] — [date]

✅ Propagé (X fichiers) :
  - agents/code-reviewer.md
  - commands/bughunter.md
  ...

⚠️ Ignoré (existant + projet-spécifique) :
  - settings.json (a des hooks custom)

❌ Erreur :
  - [si applicable]

Projet mis à jour. Lancer /check dans [projet] pour vérifier.
```

## Règles
- Toujours faire un `--dry-run` mental avant de propager `settings.json`
- Ne jamais écraser `CLAUDE.md` — chaque projet a le sien
- Ne jamais écraser `.env` ou secrets
- Créer `.claude/` si le dossier n'existe pas
