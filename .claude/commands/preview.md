# /preview — Vérification visuelle avec le serveur de développement

Exploite la feature Preview de Claude Code Desktop : Claude démarre ton serveur, ouvre un aperçu live, prend des screenshots et inspecte le DOM.

## Usage

`/preview` — démarre le serveur et vérifie l'état actuel
`/preview [url-path]` — vérifie une page spécifique (ex: `/preview /dashboard`)
`/preview --after-change` — vérifie après une modification de code

## Prérequis

- Claude Code **Desktop** uniquement (pas CLI pur)
- Feature "Aperçu" activée dans Settings → Claude Code

## Ce que Claude peut faire en mode Preview

- Démarrer `npm run dev` automatiquement
- Ouvrir l'app dans un browser intégré
- **Prendre des screenshots** de ce qu'il voit
- **Inspecter le DOM** (équivalent DevTools)
- Détecter les erreurs visuelles, les éléments cassés, le layout
- Comparer avant/après une modification

## Workflow

### 1. Démarrage
```bash
npm run dev  # Claude lance ça et attend que le serveur soit prêt
```

### 2. Capture initiale
Claude ouvre l'URL cible et prend un screenshot.
Il note :
- Ce qui s'affiche correctement
- Ce qui est cassé (layout, couleurs, texte manquant)
- Les erreurs console visibles

### 3. Vérification DOM (si besoin)
Claude inspecte les éléments ciblés :
- Styles appliqués vs attendus
- Props/attributs
- Erreurs hydration React

### 4. Rapport
```
PREVIEW REPORT — [page] — [date]

STATUT : ✅ OK / ⚠️ Problèmes / ❌ Cassé

CE QUI MARCHE :
- [élément] s'affiche correctement

PROBLÈMES DÉTECTÉS :
1. [problème] — [localisation dans le code]
2. [problème] — [localisation]

CORRECTIONS APPLIQUÉES :
- [fix 1]
- [fix 2]

Screenshot : [avant] → [après]
```

## Cas d'usage typiques

```
"vérifie que le cockpit s'affiche bien sur iPad (1024px)"
→ /preview /cockpit

"la landing page est cassée après mon refactor"
→ /preview /

"vérifie que le dark mode fonctionne"
→ /preview --theme dark

"est-ce que le formulaire de login s'affiche bien ?"
→ /preview /login
```

## Conserver les sessions

Dans Settings → "Conserver les sessions de prévisualisation" :
- Tes cookies/localStorage sont sauvegardés entre les previews
- Tu restes connecté dans les pages auth
- Pratique pour tester des pages qui nécessitent un compte
