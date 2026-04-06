# /ship — Workflow complet : vérifier → commit → push → PR

Commande tout-en-un pour shipper une feature proprement.

## Usage

`/ship` — workflow interactif complet
`/ship "feat: description courte"` — avec message de commit pré-rempli

## Instructions

### Étape 1 — Vérification qualité
```bash
npm run check-all
```
- Si erreur TypeScript → stopper, afficher l'erreur, proposer le fix
- Si erreur ESLint → stopper, afficher, proposer le fix
- Si test fail → stopper, afficher, proposer le fix
- Si tout passe → continuer

### Étape 2 — Revue du diff
```bash
git status
git diff --stat
```
Afficher un résumé des changements pour validation.

### Étape 3 — Staging sélectif
- JAMAIS `git add -A` ou `git add .`
- Lister chaque fichier modifié et l'ajouter par nom
- Exclure : `.env`, `*.local`, fichiers de build

### Étape 4 — Commit
- Proposer un message conventional commit basé sur le diff
- Format : `feat|fix|chore|refactor|docs|test|style: description`
- `git commit -m "..."`

### Étape 5 — Push
- Vérifier qu'on n'est PAS sur `main`/`master`
- `git push -u origin <branche>` — demander confirmation

### Étape 6 — Pull Request
```bash
gh pr create \
  --title "..." \
  --body "..."
```
Body template :
```markdown
## Résumé
- [bullet points des changements]

## Test plan
- [ ] Build passe (`npm run build`)
- [ ] Tests passent (`npm test`)
- [ ] Testé manuellement

## Screenshots (si UI)
[optionnel]

🤖 Generated with Claude Code
```

### Fin
Afficher l'URL de la PR.

### Bonus — PR auto-correction (Claude Code Desktop)
Si tu utilises Claude Code Desktop, une fois la PR créée :
- Claude surveille automatiquement les **échecs CI**
- Claude surveille les **commentaires de review**
- Il peut corriger et répondre tout seul

Tu n'as rien à faire — juste activer "Correction automatique des pull requests" dans Settings.

## Règles strictes
- JAMAIS push sur `main` ou `master`
- JAMAIS `--no-verify`
- JAMAIS commit de `.env` ou secrets
- Stopper à la première erreur de `check-all`
