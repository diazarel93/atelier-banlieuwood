# /release — Livraison complète en production

Checklist exhaustive avant toute mise en prod. Ne pas skipper d'étape.

## Usage

`/release` — checklist interactive complète
`/release --patch` — bug fix mineur (0.0.X)
`/release --minor` — nouvelle feature (0.X.0)
`/release --major` — breaking change (X.0.0)

## Instructions

### 1. Pre-release checks

```bash
# TypeScript propre
npx tsc --noEmit

# Lint sans erreur
npm run lint

# Tests passent
npm test

# Build production OK
npm run build

# Pas de secrets dans le diff
git diff main...HEAD | grep -E "(SECRET|API_KEY|PASSWORD|TOKEN)" && echo "⚠️ SECRETS DÉTECTÉS" || echo "✅ Pas de secrets"
```

Si un check échoue → STOP. Corriger avant de continuer.

### 2. Vérification du diff complet

```bash
# Vue d'ensemble de tous les changements
git diff main...HEAD --stat

# Diff complet
git diff main...HEAD
```

Vérifier :
- [ ] Pas de `console.log` de debug oubliés
- [ ] Pas de `TODO` bloquants
- [ ] Pas de code commenté inutile
- [ ] Pas de fichiers de test ou debug commités
- [ ] `.env` et secrets exclus du diff

### 3. Variables d'environnement

Lister toutes les nouvelles env vars ajoutées :
```bash
git diff main...HEAD -- .env.example
```

Vérifier qu'elles sont :
- [ ] Dans `.env.example` (avec valeur factice)
- [ ] Documentées dans le CLAUDE.md si critiques
- [ ] Configurées en prod (Vercel, Railway, etc.)

### 4. Migrations base de données

```bash
ls supabase/migrations/ | tail -5
```

Si nouvelles migrations :
- [ ] Idempotentes (`IF NOT EXISTS`)
- [ ] Testées en local (`supabase db reset`)
- [ ] RLS configuré sur les nouvelles tables
- [ ] Pas de modification de migration existante

### 5. Changelog (optionnel mais recommandé)

Résumer les changements :
```
## [VERSION] — [DATE]

### Ajouté
- [feature]

### Corrigé
- [bug fix]

### Modifié
- [changement]
```

### 6. Tag de version

```bash
# Créer le tag
git tag -a v[VERSION] -m "Release v[VERSION]"

# Push le tag
git push origin v[VERSION]
```

### 7. Déploiement

```bash
# Vercel (auto sur merge main)
gh pr merge --squash

# Ou déploiement manuel
vercel --prod
```

### 8. Vérification post-déploiement

- [ ] Page d'accueil accessible
- [ ] Auth fonctionne
- [ ] Feature principale testée à la main
- [ ] Pas d'erreur dans les logs Vercel/Supabase
- [ ] Performance OK (pas de régression)

## En cas de problème en prod

```bash
# Revenir au commit précédent
git revert HEAD
git push origin main

# Ou rollback Vercel
vercel rollback
```
