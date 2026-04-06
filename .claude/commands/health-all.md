# /health-all — Rapport de santé global de tous les projets

Audite tous les projets listés dans `projects.json` et produit un dashboard de santé.

## Usage

`/health-all` — audit complet de tous les projets
`/health-all --quick` — vérification rapide (existence fichiers clés seulement)

## Instructions

1. **Lire `projects.json`** pour obtenir la liste des projets
2. Pour chaque projet, vérifier (mode rapide) :
   ```bash
   ls ~/[projet]/.claude/settings.json 2>/dev/null && echo "✅" || echo "❌"
   ls ~/[projet]/CLAUDE.md 2>/dev/null && echo "✅" || echo "❌"
   ls ~/[projet]/.gitignore 2>/dev/null && echo "✅" || echo "❌"
   grep -q "check-all" ~/[projet]/package.json 2>/dev/null && echo "✅" || echo "❌"
   ```
3. Pour chaque projet, vérifications sécurité rapides :
   ```bash
   grep -r "SERVICE_ROLE_KEY" ~/[projet]/src/ --include="*.ts" --include="*.tsx" -l 2>/dev/null
   grep -r ": any" ~/[projet]/src/ --include="*.ts" --include="*.tsx" -c 2>/dev/null
   ```
4. Mettre à jour `projects.json` avec les scores et alertes

## Format de rapport

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HEALTH DASHBOARD — [date]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJET              SCORE   CLAUDE  HOOKS   SÉCURITÉ  ALERTES
Banlieuwood         XX/20   ✅      ✅      ✅        —
Lokivo              XX/20   ✅      ❌      ⚠️        [1]
Kura V4             XX/20   ❌      ❌      ✅        —
Kura Player         XX/20   ❌      ❌      ✅        —
Turn Up Formation   XX/20   ✅      ✅      ✅        —

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALERTES ACTIVES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[1] Lokivo — settings.json manquant → lancer /propagate lokivo

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACTIONS PRIORITAIRES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. /propagate kura-v4 — setup Claude Code manquant
2. /propagate lokivo — hooks manquants
3. /audit-project ~/kura-player — audit complet recommandé
```
