# /bughunter — Inspection automatique de bugs

Analyse le codebase en profondeur et trouve les bugs, failles, et anti-patterns.

## Usage

`/bughunter` — scan complet
`/bughunter src/components/` — scan ciblé sur un dossier
`/bughunter src/lib/auth.ts` — scan d'un fichier

## Instructions

1. **Analyse statique** — lire les fichiers ciblés (ou tout `src/` si pas d'argument)
2. **Catégories à inspecter** :

   **Sécurité** (critique) :
   - Clés API / secrets exposés côté client
   - `SUPABASE_SERVICE_ROLE_KEY` dans du code client
   - Inputs non validés à l'entrée des routes API
   - SQL injection, XSS, CSRF
   - Auth manquante sur routes qui modifient des données

   **Logique** (élevé) :
   - Race conditions dans les hooks / mutations
   - `useEffect` avec dépendances manquantes
   - Promesses non gérées (`async` sans `await`, `.catch()` manquant)
   - Typage `any` qui masque des erreurs

   **Performance** (moyen) :
   - Re-renders inutiles (objets créés inline dans JSX)
   - Requêtes non mises en cache (TanStack Query absent là où il devrait être)
   - Images sans dimensions explicites (layout shift)
   - `useEffect` pour fetcher des données (anti-pattern Next.js)

   **Qualité** (faible) :
   - Code mort (imports, fonctions, variables non utilisées)
   - `console.log` laissés en prod
   - TODO/FIXME non résolus
   - Migrations Supabase sans RLS

3. **Format de sortie** :

```
BILAN BUGHUNTER — [date] — [scope]

🔴 CRITIQUE (X) — bloquer avant push
  [fichier:ligne] [description] → [fix suggéré]

🟠 ÉLEVÉ (X) — corriger ce sprint
  [fichier:ligne] [description] → [fix suggéré]

🟡 MOYEN (X) — backlog technique
  [fichier:ligne] [description]

⚪ FAIBLE (X) — optionnel
  [fichier:ligne] [description]

SCORE GLOBAL : X/10
```

4. Proposer de corriger les bugs 🔴 immédiatement si demandé.
