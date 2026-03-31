# RULES — Règles auto-générées

> Ce fichier est lu automatiquement par Claude à chaque conversation.
> Quand une erreur se répète ou qu'un pattern est validé, ajouter une règle ici.
> Format : "Ne jamais X" / "Toujours Y" + raison courte.

## TypeScript

- Ne jamais utiliser `any` dans les props de composants — utiliser des generics ou `unknown`
- Toujours utiliser `timestamptz` dans les migrations Supabase — jamais `timestamp` sans timezone
- Toujours typer les return types des fonctions publiques (lib/, api routes)

## Supabase / Database

- Toujours activer RLS sur chaque nouvelle table — RLS désactivé = faille en prod
- Toujours écrire `IF NOT EXISTS` dans les migrations — idempotence obligatoire
- Jamais modifier une migration déjà appliquée en prod — créer une nouvelle migration
- Toujours régénérer `src/types/database.ts` après une migration (`npm run db:types`)

## Next.js / React

- Ne pas utiliser `useEffect` pour fetcher des données — utiliser TanStack Query
- Toujours utiliser `next/image` avec des dimensions explicites — évite le layout shift
- Les server actions doivent valider les inputs avec zod avant tout traitement

## Git / Workflow

- Jamais `git add -A` ou `git add .` — toujours ajouter les fichiers par nom
- Toujours lancer `npm run check-all` avant push
- Jamais skip les hooks avec `--no-verify`

## Sécurité

- Jamais exposer `SUPABASE_SERVICE_ROLE_KEY` côté client — server-side uniquement
- Toujours valider les données utilisateur à l'entrée des routes API (zod)
- Les routes API qui modifient des données doivent vérifier l'auth

---

> Ajouter une règle : "Ajoute une règle dans RULES.md pour que [erreur] ne se reproduise plus"
