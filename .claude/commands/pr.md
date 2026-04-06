# /pr — Créer une Pull Request complète

Workflow complet : vérification → commit → push → PR GitHub.

## Usage

`/pr` — lance le workflow PR interactif

## Instructions

1. **Vérification pré-push**
   - `git status` — lister les fichiers modifiés
   - `git diff --stat` — résumé des changements
   - `npm run check-all` — TypeScript + Lint + Tests (stopper si erreur)

2. **Commit** (si non commité)
   - Proposer un message conventional commit basé sur le diff
   - `git add <fichiers spécifiques>` — JAMAIS `git add -A`
   - `git commit -m "feat/fix/chore: description"`

3. **Push**
   - Vérifier la branche courante (JAMAIS push sur main)
   - `git push -u origin <branche>` — demander confirmation

4. **PR GitHub**
   - `gh pr create` avec :
     - Titre court (< 70 chars) basé sur les commits
     - Body structuré :

```
## Résumé
- [bullet 1]
- [bullet 2]

## Test plan
- [ ] Build passe
- [ ] Tests passent
- [ ] Testé manuellement sur [page/feature]

🤖 Generated with Claude Code
```

5. Afficher l'URL de la PR créée

## Règles

- JAMAIS push sur `main` ou `master` directement
- JAMAIS `--no-verify`
- Toujours vérifier `check-all` avant push
