# CI/CD & Sentry — Guide de configuration

## 1. Creer un projet Sentry

1. Aller sur [sentry.io](https://sentry.io) → **Create Project** → choisir **Next.js**
2. Noter le **DSN** : Settings → Client Keys → copier le DSN
3. Creer un **auth token** : Settings → Auth Tokens → scopes `project:releases`, `org:read`
4. Noter le **slug de l'org** et le **slug du projet**

## 2. Ajouter les secrets GitHub

Dans le repo GitHub : **Settings → Secrets and variables → Actions → New repository secret**

| Secret | Description |
|--------|-------------|
| `NEXT_PUBLIC_SENTRY_DSN` | Le DSN Sentry (ex: `https://xxx@xxx.ingest.sentry.io/xxx`) |
| `SENTRY_ORG` | Slug de l'organisation Sentry |
| `SENTRY_PROJECT` | Slug du projet Sentry |
| `SENTRY_AUTH_TOKEN` | Token d'auth Sentry (scopes: `project:releases`, `org:read`) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase (pour les tests E2E) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cle anon Supabase (pour les tests E2E) |
| `SUPABASE_SERVICE_ROLE_KEY` | Cle service role Supabase (pour les tests E2E) |

## 3. Configuration locale

Ajouter dans `.env.local` :

```env
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

Sans ce DSN, Sentry est installe mais **inactif** — aucune erreur ne sera remontee.

## 4. Pipeline CI

La CI (`.github/workflows/ci.yml`) comporte 3 jobs :

```
quality (lint + typecheck + build + sentry upload)
  ├── test (vitest)
  └── e2e (playwright)
```

- **Format check** : Prettier verifie le formatage (`npm run format:check`)
- **Sentry source maps** : upload automatique sur `main` uniquement
- **E2E** : Playwright avec Chromium, rapport uploade en artifact si echec

## 5. Verification

1. Pusher sur `main` → verifier les 3 jobs dans GitHub Actions
2. Ajouter le DSN dans `.env.local` → provoquer une erreur → verifier dans sentry.io
3. `npm run format:check` — verifie le formatage Prettier
