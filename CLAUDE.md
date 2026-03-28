# Banlieuwood

## Stack

- Framework : Next.js 16 (App Router)
- Language : TypeScript (strict mode)
- Database : Supabase (PostgreSQL + Auth + RLS)
- AI : Gemini API (scene generation)
- Deploy : Vercel
- Style : Tailwind CSS 4
- State : TanStack React Query
- Tests : Vitest + Playwright (E2E)

## Commands

- `npm run dev` — serveur local
- `npm run build` — build production (DOIT passer avant push)
- `npm run lint` — verifier le code
- `npm test` — lancer les tests (Vitest)
- `npx playwright test` — tests E2E

## Architecture

- `src/app/` — pages et routes API (App Router)
- `src/components/` — composants reutilisables
- `src/components/pilot/` — cockpit intervenant (FocusCockpit + CommandCockpit)
- `src/components/play/` — interface eleve
- `src/components/v2/` — dashboard V2 (cockpit-v2)
- `src/lib/` — logique metier, utilitaires, API clients
- `src/hooks/` — hooks React custom
- `supabase/migrations/` — migrations SQL (117 fichiers)

## Conventions

- Commits : conventional commits (`feat/fix/refactor/chore`)
- Branches : `feature/`, `fix/`, `chore/` -> PR -> main
- TypeScript strict, pas de `any`
- Toujours lire un fichier avant de le modifier
- Verifier build + tests avant push

## Doctrine Banlieuwood (non-negotiable)

- **JAMAIS de classement comparatif entre eleves** — pas de leaderboard, pas de podium
- **Pas de profilage comportemental** — OIE interdit, at-risk interdit
- **2 roles distincts** : intervenant (cockpit seance) != professeur (dashboard post-seance)
- **Data eleve = pedagogique, pas performative** — pas de notation
- Profils autorises : uniquement curriculum Banlieuwood (M6 roles, M8 affinites)
- Reference : `docs/_A_ENVOYER_AU_DEV/docs/NOTE_DOCTRINE_DATA_ELEVE.md`

## Brand

- Couleur primaire : `#FF6B35` (orange cinema)
- Couleur secondaire : `#D4A843` (or)
- Accent : `#4ECDC4` (teal)
- Font titres : Bebas Neue
- Font body : Plus Jakarta Sans

## Rules

- JAMAIS push sur main directement
- JAMAIS commit des fichiers .env
- JAMAIS skip les hooks (`--no-verify`)
- TOUJOURS verifier build + tests avant push
- TOUJOURS lire un fichier avant de le modifier
- Pas de refactoring non demande
- Pas de features bonus non demandees
- iPad Safari = cible principale
