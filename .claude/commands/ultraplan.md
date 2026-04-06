# /ultraplan — Planification profonde avant de coder

Analyse une feature en profondeur et produit un plan d'implémentation complet avant de toucher au code.

## Usage

`/ultraplan <description de la feature>`

Exemple : `/ultraplan système de notifications en temps réel avec Supabase Realtime`

## Instructions

### Phase 1 — Compréhension (ne pas coder)
1. Lire le CLAUDE.md du projet
2. Explorer l'architecture existante (`src/app/`, `src/lib/`, `src/components/`)
3. Identifier les fichiers impactés
4. Comprendre les contraintes (auth, RLS, doctrine)

### Phase 2 — Analyse de complexité
Évaluer :
- **Scope** : combien de fichiers modifiés ? (S < 3, M 3-10, L 10+)
- **Risque** : touche à l'auth ? la DB ? des flows critiques ?
- **Dépendances** : nouveaux packages nécessaires ?
- **Tests** : quels tests écrire ?

### Phase 3 — Plan d'implémentation

Produire un plan ordonné :

```
ULTRAPLAN — [Feature]
Complexité : S/M/L | Risque : faible/moyen/élevé
Modèle recommandé : Haiku/Sonnet/Opus

ÉTAPES (ordre strict) :
□ 1. [Migration DB si besoin] — supabase/migrations/
□ 2. [Types TypeScript] — src/types/
□ 3. [Logique métier] — src/lib/
□ 4. [Route API / Server Action] — src/app/api/
□ 5. [Hook React] — src/hooks/
□ 6. [Composant UI] — src/components/
□ 7. [Page] — src/app/
□ 8. [Tests] — src/tests/ ou e2e/
□ 9. [Build + vérification] — npm run check-all

FICHIERS CRÉÉS :
- [liste]

FICHIERS MODIFIÉS :
- [liste]

RISQUES IDENTIFIÉS :
- [risque 1] → [mitigation]

ESTIMATION : ~XX K tokens → ~X.XX€ avec Sonnet
```

### Phase 4 — Validation
Demander confirmation avant de commencer à coder.

## Règles
- JAMAIS commencer à coder avant que le plan soit approuvé
- Si complexité L → recommander de découper en plusieurs PRs
- Si risque élevé → recommander Opus
