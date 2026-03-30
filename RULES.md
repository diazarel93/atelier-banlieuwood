# REGLES PROJET — Atelier Banlieuwood

> Toutes les regles, conventions et standards du projet. A lire avant toute contribution.
> Derniere MAJ: 30 mars 2026

---

## 1. REGLES DOCTRINE (non-negotiable)

| # | Regle | Detail |
|---|-------|--------|
| D1 | **JAMAIS de classement comparatif** | Pas de leaderboard, pas de podium, pas de ranking entre eleves |
| D2 | **Pas de profilage comportemental** | OIE interdit, at-risk interdit, pas de scoring comportemental |
| D3 | **2 roles distincts** | Intervenant (cockpit seance) ≠ Professeur (dashboard post-seance agrege) |
| D4 | **Data = pedagogique** | Pas de notation, pas d'evaluation performative, pas de jugement |
| D5 | **Profils autorises** | Uniquement curriculum Banlieuwood (M6 roles, M8 affinites) |

---

## 2. REGLES CODE

| # | Regle | Detail |
|---|-------|--------|
| C1 | **TypeScript strict** | Pas de `any`. Utiliser `unknown` + type guards si necessaire |
| C2 | **Lire avant modifier** | TOUJOURS lire un fichier avant de le modifier |
| C3 | **Build obligatoire** | `npm run build` doit passer a 0 errors avant tout push |
| C4 | **Tests** | `npm test` doit passer. Ne pas casser les tests existants |
| C5 | **Format** | `npx prettier --write "src/**/*.{ts,tsx}"` avant chaque commit |
| C6 | **Pas de bonus** | Pas de refactoring non demande, pas de features bonus |
| C7 | **iPad Safari** | Cible principale. Tester les interactions touch |
| C8 | **Tailwind CSS 4** | Pas de CSS custom sauf globals.css. Utiliser @theme pour les tokens |
| C9 | **Imports** | Pas d'imports inutilises. Pas de variables inutilisees |
| C10 | **Server vs Client** | Marquer `'use client'` uniquement quand necessaire (hooks, events) |

---

## 3. REGLES DESIGN / BRAND

| # | Regle | Detail |
|---|-------|--------|
| BR1 | **Couleur primaire** | `#FF6B35` (orange cinema) |
| BR2 | **Couleur secondaire** | `#D4A843` (or) |
| BR3 | **Accent** | `#4ECDC4` (teal) |
| BR4 | **Font titres** | Bebas Neue |
| BR5 | **Font body** | Plus Jakarta Sans |
| BR6 | **Dark mode** | Theme sombre pour le cockpit intervenant |
| BR7 | **Esthetique** | Cinema premium. Pas de design "scolaire" ou "gamifie" |

---

## 4. REGLES GIT

| # | Regle | Detail |
|---|-------|--------|
| G1 | **Conventional commits** | `type(scope): description` — feat, fix, refactor, chore, docs |
| G2 | **Branches** | `feature/`, `fix/`, `chore/` → PR → main |
| G3 | **JAMAIS push sur main** | Toujours passer par une PR |
| G4 | **JAMAIS --no-verify** | Ne jamais skip les hooks |
| G5 | **JAMAIS commit .env** | Secrets = env vars Vercel uniquement |
| G6 | **CI doit passer** | Lint + TypeScript + Tests doivent etre verts avant merge |

---

## 5. REGLES ARCHITECTURE

| # | Regle | Detail |
|---|-------|--------|
| A1 | **App Router** | Next.js 16 App Router. Pas de pages/ |
| A2 | **Composants** | `src/components/` — reutilisables. Sous-dossiers par domaine |
| A3 | **Logique metier** | `src/lib/` — pas dans les composants |
| A4 | **Hooks** | `src/hooks/` — un hook = une responsabilite |
| A5 | **State** | TanStack React Query pour le server state. useState pour le local |
| A6 | **Supabase** | PostgreSQL + Auth + RLS. Pas d'ORM |
| A7 | **Migrations** | `supabase/migrations/` — ne pas modifier les migrations existantes |

---

## 6. CONVENTIONS NOMMAGE

| Element | Convention | Exemple |
|---------|-----------|---------|
| Composants | PascalCase | `SessionCard`, `FocusCockpit` |
| Fichiers composants | kebab-case.tsx | `session-card.tsx` |
| Hooks | camelCase avec use | `useSession`, `useRealtimeInvalidation` |
| Fichiers hooks | kebab-case.ts | `use-session.ts` |
| Utilitaires | camelCase | `formatDate`, `cn` |
| Types | PascalCase | `Session`, `StudentProfile` |
| Routes API | kebab-case | `/api/sessions`, `/api/class-data` |
| Tables DB | snake_case | `sessions`, `student_profiles` |
| Env vars | SCREAMING_SNAKE | `NEXT_PUBLIC_SUPABASE_URL` |

---

## 7. REGLES ERREURS RECURRENTES (auto-generated)

> Ajouter ici les erreurs qui se repetent pour que Claude ne les refasse plus.

| # | Erreur | Regle |
|---|--------|-------|
| E1 | Tints de fond sur les cards en dark mode | Ne pas ajouter bg-white ou bg-gray sur les session cards. Utiliser bg-transparent ou les tokens theme |
| E2 | @theme inline vs @theme | Utiliser `@theme { }` dans globals.css, pas `@theme inline` |
| E3 | Accents dans le code | Pas d'accents dans les noms de variables, fichiers, imports. Accents uniquement dans les strings UI |
