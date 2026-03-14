# Audit CTO-Level — Banlieuwood EdTech Platform

> **Perspective** : CTO de Kahoot / Duolingo
> **Date** : 2026-03-14
> **Scope** : Architecture, scalabilité, gamification, sécurité, ops
> **Verdict global** : **7.2 / 10** — Production-ready pour 30 élèves/séance, fragilités à 200+

---

## Score par domaine

| Domaine | Score | Verdict |
|---------|-------|---------|
| Real-time & Scalabilité | 6/10 | Polling redondant, pas de caching |
| Race conditions & Data integrity | 6.5/10 | Respond protégé, vote non |
| DB Performance | 7/10 | Bons indexes de base, composite manquant |
| Caching | 3/10 | Aucun Cache-Control nulle part |
| Gamification | 8/10 | 28 achievements, missions, festival, XP |
| UX & Performance frontend | 7/10 | Dynamic imports OK, Suspense quasi-absent |
| Image optimization | 6/10 | SafeImage existe mais bypassé pour TMDB |
| Security & Compliance | 8/10 | CSP, RLS, rate limiting, RGPD conforme |
| Error monitoring & Ops | 8.5/10 | Sentry complet, audit logs, PostHog |
| Testing | 4/10 | 14 unit tests, E2E skippés, pas de coverage |

---

## 1. REAL-TIME & SCALABILITÉ

### Architecture actuelle

**Tier 1 — Supabase Realtime (WebSocket `postgres_changes`)** :
- 13 tables souscrites : `responses`, `votes`, `students`, `collective_choices`, `module2_budgets`, `response_reactions`, `teams`, `module6_*`, `module7_*`
- Filtrées par `session_id=eq.{sessionId}`
- Toutes les mutations déclenchent `invalidateQueries()` — pas de mutation d'état directe, propre

**Tier 2 — Supabase Broadcast** :
- La table `sessions` est exclue de `postgres_changes` (RLS bloque les clients anonymes)
- Le PATCH route envoie `broadcastSessionUpdate(id)` — événement `session-update` qui bypasse RLS
- Les élèves reçoivent les changements de statut/question par ce canal

**Tier 3 — Polling HTTP fallback** :
- `use-session-polling.ts` : **5 000 ms** (élève gameplay)
- `use-pilot-session.ts` : **10 000–15 000 ms** (cockpit pilote)
- `use-dashboard-v2.ts` : **30 000 ms** (dashboard V2)
- `use-session-detail.ts` : **10 000 ms**

### Issues identifiées

| # | Sév. | Issue | Impact |
|---|------|-------|--------|
| RT-1 | **P1** | Polling redondant : `refetchInterval` tourne même quand Realtime est connecté | 30 élèves × poll 5s = 6 req/s inutiles vers Supabase |
| RT-2 | **P1** | `/api/sessions/[id]/situation` fait **6-8 queries séquentielles** par requête (session, situation, response, student, votes, collective_choice, students count, responses count) — aucun `Promise.all()` | Latence cumulée 300-500ms par poll |
| RT-3 | **P2** | Pas de reconnexion manuelle sur `TIMED_OUT` — dépend uniquement du retry intégré Supabase | Perte silencieuse de temps réel si WiFi instable en classe |
| RT-4 | **P2** | Invalidation trop large pour modules M6/M7/M8 — toute mutation invalide `["session-state", sid]` entier | Re-fetch complet de l'état session à chaque changement |

### Capacité estimée

| Élèves/séance | Requêtes/s (polling seul) | Verdict |
|---------------|--------------------------|---------|
| 10 | ~2/s | OK |
| 30 | ~6/s | OK mais brûle du quota |
| 100 | ~20/s | Latence visible |
| 200+ | ~40/s | **Dégradation** — Supabase free/pro rate limits atteints |

### Recommandations

1. **Conditionner le polling** : `refetchInterval: isRealtimeConnected ? false : 5000`
2. **Paralléliser les queries** : `Promise.all()` dans le handler `/situation`
3. **Ajouter staleTime** TanStack Query : `staleTime: 2000` évite les refetches sur re-mount
4. **Granulariser l'invalidation** : invalidate `["responses", sid]` au lieu de `["session-state", sid]`

---

## 2. RACE CONDITIONS & DATA INTEGRITY

### Ce qui est protégé

| Point | Mécanisme | Verdict |
|-------|-----------|---------|
| Double-submit réponse | `upsert` avec `onConflict: "session_id,student_id,situation_id"` | OK — idempotent |
| Réponse sur question passée | 409 guard — vérifie position/module/séance vs session courante | OK |
| Timer expiré | Comparaison serveur `timer_ends_at` vs `Date.now()` | OK |

### Ce qui ne l'est pas

| # | Sév. | Issue | Scénario |
|---|------|-------|----------|
| RC-1 | **P1** | Vote sans guard de position — vérifie seulement `session.status !== "voting"` | Si le pilote ferme le vote au moment exact où un élève vote → vote accepté malgré statut changé |
| RC-2 | **P1** | Pas de version field (`version INTEGER`) sur `sessions` | Deux PATCH concurrents (pilote + auto-avance mode libre) → last write wins, perte de données |
| RC-3 | **P2** | Auto-avance mode libre : séquence de `UPDATE sessions` sans vérification de version | Un second élève qui répond pendant l'avance automatique peut trigger un double-avance |

### Recommandation

Ajouter `version INTEGER DEFAULT 0` à `sessions`, incrémenter à chaque PATCH, rejeter si `WHERE version = expected_version` n'affecte aucune ligne.

---

## 3. DATABASE INDEXES

### Indexes existants (confirmés)

```sql
-- Schema initial
idx_sessions_join_code(join_code)
idx_sessions_facilitator(facilitator_id)
idx_students_session(session_id)
idx_responses_session(session_id)
idx_responses_situation(situation_id)
idx_votes_session(session_id)
idx_collective_choices_session(session_id)

-- Renforcement 104
idx_responses_student_id(student_id)
idx_responses_student_situation(student_id, situation_id)
idx_responses_teacher_flag(session_id, teacher_flag) WHERE teacher_flag IS NOT NULL
idx_responses_teacher_score(session_id, teacher_score) WHERE teacher_score IS NOT NULL

-- V2 profils
idx_student_profiles_auth(auth_user_id)
idx_student_profiles_email(email)
idx_students_profile(profile_id)
idx_student_achievements_profile(profile_id)
```

### Indexes manquants

| # | Sév. | Index recommandé | Justification |
|---|------|-----------------|---------------|
| IX-1 | **P1** | `responses(session_id, situation_id)` composite | Pattern de query le plus fréquent (situation GET) — 2 indexes séparés vs 1 composite = scan beaucoup plus lent |
| IX-2 | **P2** | `responses(session_id, situation_id) WHERE is_vote_option = true` partial | Requête vote/résultats — table `responses` est la plus large |
| IX-3 | **P2** | `sessions(status) WHERE status NOT IN ('done','paused')` partial | Filtrage constant dans dashboards et polling |
| IX-4 | **P2** | `students(session_id) WHERE is_active = true` partial | Requête dans chaque poll élève |

---

## 4. CACHING

### Constat

**0 header `Cache-Control` dans toute l'application.** Chaque appel API est un round-trip non caché vers Supabase.

### Données cachables identifiées

| Donnée | Fréquence de changement | Cache recommandé |
|--------|------------------------|-------------------|
| Catalogue de situations (seed data) | Jamais en runtime | `Cache-Control: public, max-age=86400` |
| Fiche-cours (contenu pédagogique) | Rarement | `Cache-Control: public, max-age=3600` |
| Stats dashboard (agrégats) | ~30s | `Cache-Control: private, max-age=30` |
| Profil élève (avatar, niveau) | ~minutes | `stale-while-revalidate=60` |
| Modules data (PHASES, MODULES) | Build-time | Export statique, pas d'API |

### Impact business

À 30 élèves pollant toutes les 5s sans cache : **~6 req/s × 6-8 queries/req = 36-48 queries/s vers Supabase**. Avec cache `staleTime` de 2s côté TanStack + `Cache-Control: private, max-age=2` : réduit à **~6-10 queries/s** (÷5).

---

## 5. GAMIFICATION (Perspective Duolingo)

### Ce qui existe (score 8/10)

| Feature | Implémenté | Détails |
|---------|-----------|---------|
| Achievements / Badges | **28 achievements** × 3 tiers (bronze/silver/gold) | 6 catégories : Narration, Vote, Expression, Streak, Special, Social |
| XP & Levels | 10 tiers (Apprenti → Légende) | `total_xp` + `level` sur `student_profiles` |
| Streaks | Compteur de sessions consécutives | `streak` + `best_streak` |
| Avatar customisation | Cadres, accessoires, effets | Récompenses des achievements |
| Festival | Soumission + vote communautaire | `festival_entries` + `festival_votes` |
| Daily missions | **Schema prêt** (`is_daily`, `available_from/until`) | Endpoint `/api/missions` existe |
| Leaderboard | Endpoint par session + global profil | `total_xp` ranking |
| Power-ups | 3 sur table `students` | Joker, double-temps, vote-bonus |
| Combo system | Multiplication de score | Compteur de combos |
| Sounds | 8 effets sonores | `useSound` hook |
| Confetti | canvas-confetti | Milestones + achievements |
| Mentor avatar | 6 humeurs dynamiques | Réactions IA contextuelles |

### Ce qui manque vs Duolingo

| # | Feature manquante | Impact engagement | Effort |
|---|------------------|-------------------|--------|
| G-1 | **Notifications push** (rappel de session planifiée) | HIGH — rétention J7/J30 | Medium |
| G-2 | **Spaced repetition** (revisiter concepts faibles) | HIGH — apprentissage long-terme | High |
| G-3 | **Weekly challenges** (classement hebdo classe) | MEDIUM — compétition sociale | Low |
| G-4 | **Feedback IA par réponse** (pas seulement par chapitre) | HIGH — engagement micro-loop | Medium |
| G-5 | **Power-up shop** (dépenser XP pour acheter) | MEDIUM — économie interne | Low |
| G-6 | **Social sharing** (partager badge/résultat) | LOW — viralité organique | Low |

### Anomalie technique

Les triggers de compteurs (`103_profile_counter_triggers.sql`) ne fire que sur `INSERT`, pas sur `UPSERT` qui remplace une ligne existante. Si un élève re-soumet (reset + re-réponse), le compteur incrémente à tort → inflation d'XP.

---

## 6. UX & PERFORMANCE FRONTEND

### Points forts

| Aspect | Détail |
|--------|--------|
| Dynamic imports | QRCodeSVG (4 endroits), canvas-confetti, export-image, module5-data — toujours async |
| Loading states | `PageSkeleton` avec variantes (dashboard/list/detail) |
| Empty states | Illustrés dans tous les listings |
| Error states | `error.tsx` + `global-error.tsx` (Sentry) |
| Animations | Framer Motion avec stagger, AnimatePresence |
| Forms | Validation côté client (title 100, scheduledAt pas dans le passé) |
| Keyboard | Command Palette (⌘K), Ctrl+Z undo, raccourcis cockpit |

### Points faibles

| # | Sév. | Issue | Impact |
|---|------|-------|--------|
| UX-1 | **P1** | **1 seul Suspense** boundary dans toute l'app (`join/page.tsx`) — aucun `loading.tsx` de route | Pas de skeleton UI pendant les transitions de route |
| UX-2 | **P2** | **Raw `<img>` pour TMDB** dans `screen/page.tsx` (lignes 1449, 1465, 1504) et `module1-cockpit.tsx` (ligne 113) | Pas de WebP auto, pas de lazy loading, pas de srcset responsive |
| UX-3 | **P2** | Aucun `staleTime` TanStack Query — chaque query est stale au mount | Refetch systématique sur chaque navigation |
| UX-4 | **P3** | Pas de breakpoint tablette dédié | Gap entre mobile (sm) et desktop (lg) |

### Recommandation images

`SafeImage` (composant wrapper `next/image`) existe déjà. Remplacer les 5 `<img>` tags dans `screen/page.tsx` et `module1-cockpit.tsx` par `<SafeImage>` — gain automatique WebP + lazy + srcset.

---

## 7. SECURITY & COMPLIANCE

### Ce qui est en place (8/10)

| Mesure | Status |
|--------|--------|
| `.env*` dans `.gitignore` | OK — wildcard couvre tous les fichiers env |
| CSP (Content Security Policy) | Présent, mais `unsafe-eval` activé |
| `X-Frame-Options: DENY` | OK |
| `X-Content-Type-Options: nosniff` | OK |
| `Referrer-Policy: strict-origin-when-cross-origin` | OK |
| Permissions-Policy (camera/mic/geo disabled) | OK |
| RLS sur toutes les tables | OK |
| Rate limiting API | OK — in-memory, configurable par route |
| UUID validation | OK — toutes les routes API vérifient les IDs |
| Input validation | OK — longueurs max, enums, ranges |
| Cookie consent (RGPD) | OK — distingue essentiel vs analytics |
| Privacy policy (mineurs) | OK — conforme au cadre scolaire RGPD |
| Auth (Supabase Auth + RLS) | OK |
| Admin separation (requireAdmin) | OK |
| XSS protection (DOMPurify) | OK — SVG sanitization |

### Issues de sécurité

| # | Sév. | Issue | Détail |
|---|------|-------|--------|
| SEC-1 | **P1** | `unsafe-eval` dans CSP | Requis par Next.js dev mode mais **aussi actif en production**. Affaiblit significativement la protection XSS. Devrait être conditionnel `NODE_ENV`. |
| SEC-2 | **P2** | RLS policy `"Anyone can update ideas"` dans `030_fix_rls_policies.sql` | `FOR UPDATE USING (true)` — tout utilisateur authentifié peut modifier n'importe quelle idée. Probablement corrigé dans une migration ultérieure mais historique inquiétant. |
| SEC-3 | **P2** | Pas de Content-Security-Policy `report-uri` | Les violations CSP ne sont pas remontées — impossible de détecter des attaques XSS en production |
| SEC-4 | **P3** | Rate limiting en mémoire (pas distribué) | OK pour un seul process, mais si Vercel scale horizontalement, chaque instance a son propre compteur |

### COPPA vs RGPD

L'app est sur le marché français (cadre scolaire), donc **RGPD s'applique, pas COPPA**. La politique de confidentialité est conforme : participation supervisée par l'enseignant, aucune PII collectée auprès des mineurs (pas d'email, pas de nom de famille, pas de photo). L'auth est gérée par l'enseignant (facilitator), les élèves rejoignent par code sans créer de compte.

---

## 8. ERROR MONITORING & OPS

### Stack de monitoring (8.5/10)

| Outil | Configuration |
|-------|--------------|
| **Sentry** (`@sentry/nextjs ^10.42.0`) | Client + Server + Edge configs |
| Traces | `tracesSampleRate: 0.1` (10%) |
| Session replay | Désactivé sauf on-error (`replaysOnErrorSampleRate: 1.0`) — bon pour vie privée élèves |
| Error boundaries | `error.tsx` + `global-error.tsx` |
| **PostHog** | Analytics via cookie consent |
| **Audit logs** | Table `audit_logs` (SQL `112_audit_logs.sql`), indexé par `session_id, created_at DESC` |
| **Event logger** | `src/lib/event-logger.ts` — fire-and-forget structured events |
| **Bundle analyzer** | `@next/bundle-analyzer` via `ANALYZE=true` |

### Logging API

Pattern consistent : `console.error("[route-name METHOD]", error.message)` dans toutes les routes. Minimal mais structuré. Sentry capture automatiquement les erreurs non-catchées.

### Ce qui manque

| # | Item | Effort |
|---|------|--------|
| OPS-1 | Alertes Sentry configurées (email/Slack sur spike d'erreurs) | Config Sentry dashboard |
| OPS-2 | Health check endpoint (`/api/health`) | 10 lignes de code |
| OPS-3 | Métriques custom (durée de séance, taux de complétion) | PostHog events |
| OPS-4 | Backup/restore strategy documentée | Doc + Supabase backup config |

---

## 9. TESTING

### Couverture actuelle (4/10)

**14 tests unitaires** (Vitest) :

| Test | Couverture |
|------|-----------|
| `rate-limit.test.ts` | Rate limit logic + IP extraction |
| `api-utils.test.ts` | Shared API utilities |
| `constants.test.ts` | Module/seance constants |
| `sessions-create.test.ts` | Session creation |
| `sessions-join.test.ts` | Student join flow |
| `reactions.test.ts` | Response reactions |
| `session-state.test.ts` | `getSessionState()` logic |
| `axes-mapping.test.ts` | O-I-E axis mapping |
| `design-tokens.test.ts` | Design system tokens |
| `oie-profile.test.ts` | OIE profile computation |
| `talent-profiles.test.ts` | Talent profile logic |
| `auth-roles.test.ts` | Multi-role auth |
| `vote.test.ts` | Vote API (7 cas) |
| `session-patch.test.ts` | PATCH session |

**5 specs E2E** (Playwright) — login, create-session, student-join, respond-vote, view-results — mais les tests nécessitant une session active sont **`test.skip(true)`**.

### Gaps critiques

| # | Sév. | Gap | Risque |
|---|------|-----|--------|
| TEST-1 | **P0** | **Aucune config de coverage** — pas de seuil, pas d'enforcement CI | Régressions silencieuses |
| TEST-2 | **P1** | **E2E skippés** — les tests live session ne tournent jamais | Le flow critique (élève répond → vote → résultats) n'est jamais testé automatiquement |
| TEST-3 | **P1** | **0 tests sur gamification** — achievements, XP, streaks, combos | Le système le plus complexe n'a aucun filet |
| TEST-4 | **P2** | **0 tests composants React** — pas de Testing Library | Régressions UI non détectées |
| TEST-5 | **P2** | **Pas de fixtures de test** pour E2E — pas de seed data | Impossible de tester sans setup manuel |

### Recommandation Kahoot

Chez Kahoot, le **flow critique** (join → respond → vote → results) est couvert par 3 niveaux :
1. **Unit** : chaque handler API testé en isolation (mock Supabase)
2. **Integration** : flow complet avec Supabase test instance
3. **E2E** : Playwright avec seed data automatique

Minimum viable : ajouter coverage enforcement (`vitest --coverage`, seuil 60%) + un vrai test E2E du flow complet avec seed fixtures.

---

## 10. RÉSUMÉ EXÉCUTIF

### Forces (ce qu'un CTO Kahoot/Duolingo approuverait)

1. **Gamification riche** — 28 achievements, 10 tiers XP, streaks, combos, festival, missions, power-ups. Comparable à Duolingo pour un outil scolaire.
2. **Security posture solide** — CSP, RLS, rate limiting, UUID validation, DOMPurify. Au-dessus de la moyenne EdTech.
3. **Monitoring production-grade** — Sentry complet (client+server+edge), audit logs, event logging, PostHog.
4. **Architecture modulaire** — Séparation claire hooks/API/composants, TanStack Query pour le data layer.
5. **Offline resilience** — Queue localStorage (50 items, 30min expiry) pour WiFi dropout en classe.
6. **Real-time fonctionnel** — Supabase Realtime + Broadcast + polling fallback. Fonctionne de manière fiable pour 30 élèves.

### Faiblesses (ce qu'un CTO exigerait de corriger avant scale)

1. **Polling redondant** — Gaspille 80% des requêtes quand Realtime est connecté
2. **Zéro caching HTTP** — Chaque requête est un round-trip DB
3. **Queries séquentielles** — 6-8 queries en série par poll élève au lieu de parallèle
4. **Tests insuffisants** — 14 unit tests, E2E skippés, pas de coverage
5. **Race condition sur vote** — Pas de guard de position comme sur respond
6. **Pas de Suspense** — Transitions de route sans skeleton UI

### Roadmap recommandée (par priorité)

| Priorité | Action | Impact | Effort |
|----------|--------|--------|--------|
| **P0** | Coverage enforcement (60% seuil) + tests gamification | Fiabilité | 2-3j |
| **P1** | Conditionner polling sur état Realtime | ÷5 requêtes | 2h |
| **P1** | `Promise.all()` dans situation handler | ÷2 latence | 1h |
| **P1** | Guard de position sur vote route | Intégrité données | 30min |
| **P1** | CSP `unsafe-eval` conditionnel (dev only) | Sécurité | 30min |
| **P2** | Cache-Control headers sur routes statiques | ÷3 charge DB | 2h |
| **P2** | staleTime TanStack Query (2-5s) | ÷2 refetches | 1h |
| **P2** | Index composite `responses(session_id, situation_id)` | Query performance | 15min |
| **P2** | Remplacer `<img>` par `<SafeImage>` (5 endroits) | LCP, bandwidth | 1h |
| **P2** | Suspense boundaries + loading.tsx | UX transitions | 2h |
| **P3** | E2E fixtures + unskip tests | Test coverage | 1-2j |
| **P3** | Health check endpoint | Ops monitoring | 15min |
| **P3** | CSP report-uri vers Sentry | Détection attaques | 30min |

---

## Conclusion

L'application est **fonctionnellement complète et sécurisée** pour un usage en classe (10-30 élèves). La gamification est au-dessus de la moyenne EdTech française. Le monitoring est production-grade.

Les faiblesses sont principalement de l'**optimisation de performance** (polling, caching, queries parallèles) et de la **couverture de tests**. Ces items sont critiques pour scaler au-delà de 200 élèves simultanés ou pour une adoption large (plusieurs écoles).

**Verdict** : Ready pour un lancement limité. Les items P0-P1 doivent être adressés avant un rollout large.
