# /check — Vérification complète avant push

Lance `npm run check-all` (TypeScript + Lint + Format + Tests) et résume les résultats.

## Instructions

1. Lance `npm run check-all` et capture la sortie complète
2. Analyse les erreurs/warnings :
   - TypeScript errors → lister fichier:ligne + message
   - ESLint errors vs warnings → distinguer les bloquants
   - Prettier issues → lister les fichiers mal formatés
   - Test failures → nom du test + raison
3. Donne un verdict clair :
   - ✅ Tout passe → "Prêt à push"
   - ❌ Erreurs bloquantes → liste priorisée avec fix suggéré
   - ⚠️ Warnings → liste non-bloquante

## Format de réponse

```
VERDICT : ✅ Prêt à push / ❌ X erreurs bloquantes

ERREURS (si applicable) :
- [fichier:ligne] [type] : [message] → [fix suggéré]

WARNINGS (si applicable) :
- [description]
```
