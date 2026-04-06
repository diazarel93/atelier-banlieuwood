# /simplify — Review + simplification du code modifié

Analyse le code récemment modifié et suggère des simplifications sans changer le comportement.

## Usage

`/simplify` — review du dernier diff
`/simplify src/components/MyComponent.tsx` — review d'un fichier

## Instructions

1. **Identifier le scope** : `git diff HEAD` ou le fichier fourni
2. **Analyser selon ces critères** :

   **Réutilisation** :
   - Duplication de logique existante dans `src/lib/`
   - Composant UI déjà présent dans `src/components/ui/`
   - Hook existant dans `src/hooks/`
   - Constante dans `src/lib/constants.ts`

   **Qualité** :
   - `any` TypeScript → proposer le type précis
   - `useEffect` pour fetcher → remplacer par TanStack Query
   - Logique métier dans un composant → extraire dans `src/lib/`
   - Prop drilling > 2 niveaux → suggérer Context ou Zustand

   **Efficacité** :
   - Promise non awaited
   - Re-render évitable (useMemo, useCallback, memo)
   - Requête non cachée

   **Lisibilité** :
   - Nom de variable peu clair
   - Fonction trop longue (> 50 lignes) → découper
   - Commentaire qui explique le "quoi" au lieu du "pourquoi"

3. **Format de sortie** :

```
SIMPLIFY REPORT

✅ Bon : [ce qui est bien fait]

🔧 Suggestions :
  [ligne X] [problème] → [solution concrète]
  [ligne Y] [problème] → [solution concrète]

Veux-tu que j'applique ces changements ?
```

4. Appliquer uniquement si confirmation explicite.

## Règles
- Ne jamais changer le comportement observable
- Ne pas refactorer ce qui n'est pas dans le scope
- Maximum 5 suggestions — prioriser les plus impactantes
