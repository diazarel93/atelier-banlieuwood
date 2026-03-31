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

## Coaching Mode

Quand l'utilisateur dit "coach", "coach moi", "formation", ou "tips" :
1. Observe ce qu'il vient de faire (le dernier code, la derniere feature)
2. Donne 1 feedback constructif sur ce qu'il peut ameliorer (archi, secu, perf, pattern)
3. Explique POURQUOI c'est mieux (pas juste "fais ca")
4. Donne un exemple concret dans le contexte de son code actuel

Quand l'utilisateur fait une erreur de pattern (any, pas de validation, mauvaise archi) :
- Corrige ET explique pourquoi c'est mieux, en 2-3 phrases max
- Ne pas faire de cours non demande — juste signaler et expliquer brievement

## Agents disponibles

- `design-director` — DA senior Banlieuwood (doctrine cinema, iPad-first, 5 phases) → invoquer pour tout travail UI/design
- `code-reviewer` — review securite + patterns + bugs avant push → invoquer avec "review" ou "pret a pusher ?"
- `db-architect` — schema Supabase, RLS, migrations, index → invoquer pour tout travail DB
- `feature-planner` — planifie avant de coder, decoupe en taches atomiques → invoquer avant toute feature M/L
- `cto-advisor` — veille tech, architecture scalable, dette technique, decisions strategiques → invoquer pour vision long terme

## Token Routing — OBLIGATOIRE

| Tache | Modele | Commande |
|-------|--------|----------|
| Lire fichiers, typos, boilerplate, questions simples | Haiku | `/model haiku` |
| Feature, debug, tests, composants UI, migrations | **Sonnet (defaut)** | `/model sonnet` |
| Archi complexe, debug impossible, refacto 10+ fichiers | Opus | `/model opus` |

**Regles d'economie :**
- Lire le CLAUDE.md avant d'explorer le projet
- Utiliser Glob/Grep avant de lancer un Agent (10x moins cher)
- Ne jamais relire un fichier deja lu dans la conversation
- Suggerer `/compact` si la conversation depasse ~50 echanges

## Rules

> Voir aussi `RULES.md` — regles auto-generees qui s'enrichissent au fil du projet.

- JAMAIS push sur main directement
- JAMAIS commit des fichiers .env
- JAMAIS skip les hooks (`--no-verify`)
- TOUJOURS verifier build + tests avant push
- TOUJOURS lire un fichier avant de le modifier
- TOUJOURS formater avec Prettier avant de commit (`npx prettier --write "src/**/*.{ts,tsx}"`)
- Pas de refactoring non demande
- Pas de features bonus non demandees
- iPad Safari = cible principale
