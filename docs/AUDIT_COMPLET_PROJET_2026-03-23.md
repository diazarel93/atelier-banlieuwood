# Audit Complet — Atelier Banlieuwood
## Etat du projet au 23 mars 2026

**Commit de reference :** `ce29e47` (branche main)
**Commit precedent :** `82d2444` (21 mars 2026)
**Auteur :** audit automatise — Claude Code

---

# 1. VUE D'ENSEMBLE

## 1.1 En 5 phrases

Banlieuwood est une application Next.js 16 + React 19 + Supabase qui permet a un intervenant de piloter un atelier de creation cinematographique collective en classe. L'outil couvre 27 modules (8 phases coeur + 4 bonus) avec un cockpit temps reel, un systeme de vote, d'ecriture collaborative et de formation d'equipe. Le projet est **testable en interne** mais **pas deployable terrain** a cause de 3 contradictions doctrine actives (leaderboard, OIE, at-risk). L'architecture est solide (CI/CD, tests, Sentry pret, RLS Supabase) mais le cockpit est surchage et le polling remplace le Realtime. Depuis le 21 mars, 15 documents strategiques ont ete produits (vision 3 ans, specs spiralaires, mapping institutionnel, fiches enseignant/parent, protocole tournage).

## 1.2 Niveau de maturite

```
[ ] Prototype
[x] Testable en interne
[ ] Deployable terrain
```

**Pour passer a "deployable terrain" :**
1. Supprimer le leaderboard comparatif (R1)
2. Retirer le profil OIE (R2)
3. Desactiver l'at-risk detection (R3)
4. Implementer la separation intervenant/professeur (R4)
5. Tester sur iPad Safari reel avec 25+ eleves

---

# 2. STACK TECHNIQUE

## 2.1 Versions

| Technologie | Version | Commentaire |
|------------|---------|-------------|
| **Next.js** | 16.1.6 | Derniere version stable |
| **React** | 19.2.3 | Derniere version stable |
| **TypeScript** | ^5 | Mode strict active |
| **Tailwind CSS** | ^4 | Nouvelle architecture (PostCSS) |
| **Supabase JS** | ^2.98.0 | Client + SSR |
| **TanStack React Query** | ^5.90.21 | Cache + polling |
| **Vitest** | ^4.0.18 | Tests unitaires |
| **Playwright** | ^1.58.2 | Tests E2E |
| **Sentry** | ^10.42.0 | Monitoring (configure, pas actif en dev) |
| **Motion** | ^12.34.3 | Animations |
| **Zod** | ^4.3.6 | Validation schemas |
| **Resend** | ^6.9.3 | Emails (cle API vide) |
| **next-intl** | ^4.8.3 | Internationalisation |
| **Radix UI** | ^1.4.3 | Composants headless |
| **shadcn/ui** | ^3.8.5 | Design system (style new-york) |
| **Node.js** | 22 (CI) / 20 (local) | |

## 2.2 Dependances (28 prod + 17 dev)

**Prod (28)** : next, react, react-dom, @supabase/supabase-js, @supabase/ssr, @tanstack/react-query, @sentry/nextjs, radix-ui, lucide-react, motion, zod, resend, next-intl, sonner, canvas-confetti, html-to-image, jspdf, qrcode.react, nanoid, clsx, class-variance-authority, tailwind-merge, cheerio, @dicebear/core, @dicebear/collection, @fontsource/plus-jakarta-sans, @fontsource/courier-prime

**Dev (17)** : typescript, eslint, eslint-config-next, prettier, vitest, @vitest/coverage-v8, @playwright/test, @vitejs/plugin-react, @next/bundle-analyzer, shadcn, tailwindcss, @tailwindcss/postcss, tw-animate-css, @types/node, @types/react, @types/react-dom, @types/canvas-confetti

## 2.3 Architecture applicative

```
src/                          5.3 Mo — 613 fichiers
├── app/                      Routes Next.js (39 pages)
│   ├── (auth)/               Login, request-access, reset-password
│   ├── (cockpit-v2)/v2/      Dashboard intervenant (16 routes)
│   ├── (dashboard)/session/  Cockpit pilote + ecran projete
│   ├── (public)/badge/       Badge public partageable
│   ├── play/[id]/            Interface eleve (jeu + recap + bibliotheque)
│   ├── api/                  105 routes API
│   ├── studio/               Login studio (legacy?)
│   └── legal/, about/, etc.  Pages statiques
│
├── components/               300 fichiers
│   ├── pilot/                Cockpit intervenant (82 fichiers, 21 129 lignes)
│   ├── play/                 Interface eleve
│   ├── screen/               Ecran projete
│   ├── v2/                   Dashboard V2
│   ├── ui/                   Composants design system (shadcn)
│   ├── motion/               Animations
│   └── module10/, studio/    Composants specifiques
│
├── hooks/                    32 hooks custom
├── lib/                      72 fichiers utilitaires + email/ + supabase/
├── i18n/                     Internationalisation
└── __tests__/                17 fichiers de test unitaire

supabase/                     656 Ko
└── migrations/               76 fichiers SQL (117 migrations, gaps naturels)

docs/                         2.8 Mo — 42 fichiers markdown + sous-dossiers
├── pedagogie/                14 fichiers curriculum officiel
├── modules/                  10 fichiers specs M1-M13
├── vision/                   Documents vision long terme
└── _A_ENVOYER_AU_DEV/        Pont developpeur (rapport, doctrine, feuille de route)

scripts/                      3 fichiers + scraper output (281 Mo, gitignored)
public/                       276 Ko (PWA manifest, icones, SW)
```

---

# 3. BASE DE DONNEES

## 3.1 Supabase

- **Projet** : `ohhrmgqebwziddcicxev.supabase.co`
- **PostgreSQL** : 15.8
- **Auth** : GoTrue v2.162.0
- **REST** : PostgREST 1.16.4
- **Migrations** : 76 fichiers, numerotees 001 a 117 (gaps : 049, 052-059, 109)
- **RLS** : Active sur toutes les tables sensibles
- **Indexes** : Optimises pour le polling (migrations 113, 116)

## 3.2 Schema — tables principales (deduites des migrations)

| Table | Role | Migration |
|-------|------|-----------|
| sessions | Sessions d'atelier (module, seance, statut, options) | 001+ |
| students | Eleves connectes a une session | 001+ |
| responses | Reponses des eleves (texte, votes, etc.) | 001+ |
| situations | Stimuli et questions par module | 002+ |
| votes / collective_choices | Votes et choix collectifs | 005+ |
| module6_scenes / missions | Scenario collaboratif | 060+ |
| module7_* | Storyboard, decoupage, fiches tournage | 061, 107 |
| module8_quiz / roles / points / talent_cards | Equipe et talent | 062, 110 |
| session_oie_scores | Profil OIE (a retirer) | 048, 051 |
| student_profiles | Profils cumules inter-sessions | 043, 115 |
| audit_logs | Logs d'audit | 112 |
| facilitator_tags | Tags intervenant (creatif, leadership, etc.) | indexe 116 |

## 3.3 Dernieres evolutions schema

| # | Migration | Contenu |
|---|-----------|---------|
| 117 | session_teacher_notes | Notes enseignant sur la session |
| 116 | missing_indexes | Indexes composites performance |
| 115 | profile_code | Code unique 4 chars pour reconnexion cross-device |
| 114 | idea_bank_rls_fix | RLS restrictive sur idea_bank (facilitateur only) |
| 113 | performance_indexes | Hot-path indexes pour le polling |

## 3.4 Risque schema

- **117 migrations non-squashees** : risque d'incoherence si reset partiel. A squasher avant production.
- **Tables OIE** (session_oie_scores + talent_profiles) : a retirer proprement (R2)
- **Pas de migration "down"** : rollback manuel uniquement

---

# 4. COCKPIT (zone critique)

## 4.1 Metriques

| Metrique | Valeur | Seuil de risque |
|----------|--------|-----------------|
| Fichiers dans pilot/ | 82 | Complexite elevee |
| Lignes totales pilot/ | 21 129 | > 10 000 = refacto a planifier |
| Plus gros composant | teacher-docks.tsx (1 114 lignes) | > 500 = splitter |
| useState dans pilot/ | ~225 invocations | Indique etat local non centralise |
| Modales | 6 majeures | Gerees via use-cockpit-modals |
| Modes de cockpit | 3 (Command Center, Focus, Teacher Docks) | DC2 : simplifier a 1 ? |

## 4.2 Flux temps reel

```
iPad eleve
    │
    ▼
POST /api/sessions/[id]/respond     ← ecriture
    │
    ▼
Supabase PostgreSQL
    │
    ├── WebSocket (si disponible)  → use-realtime-invalidation.ts
    │                                 ├── 11 tables ecoutees (postgres_changes)
    │                                 └── broadcast session-level
    │
    └── Polling HTTP (fallback)    → use-session-polling.ts
         ├── connecte : 30s intervalle
         └── deconnecte : 5s intervalle
    │
    ▼
GET /api/sessions/[id]/situation    ← lecture
    │
    ▼
Cockpit intervenant (React Query + invalidation)
```

**Charge estimee a 30 eleves** : ~180 req/min en polling deconnecte (5s), ~60 req/min connecte (30s).

**Nom trompeur** : `use-realtime-invalidation.ts` fait du WebSocket avec fallback polling — pas du "realtime" pur.

## 4.3 Compatibilite iPad Safari

- 5 correctifs recents (commits 8a3d93c → 82d2444)
- Plan de classe responsive
- Mode fullscreen (touche F)
- **Non teste en E2E** sur Safari (seulement Chromium)
- WebSocket fragile sur iPad Safari (contexte insecure → fallback polling)

---

# 5. MODULES

## 5.1 Inventaire (27 entrees, 12 phases)

### Coeur (8 phases — curriculum officiel Banlieuwood)

| Phase | Module | Seances | Description |
|-------|--------|---------|-------------|
| 1 | M1 Le Regard | 5 (m1a→m1e) | Observation, analyse d'images |
| 2 | M2 La Scene | 4 (u2a→u2d) | Emotions, mise en scene |
| 3 | M10 Et si... | 1 (m10a) | Imagination, idee de film |
| 4 | M10 Le Pitch | 1 (m10b) | Presenter son idee en 30s |
| 5 | M12 Construction Collective | 1 (m12a) | Vote democratique en 8 manches |
| 6 | M5 Le Scenario | 1 (m6) | Ecriture collaborative |
| 7 | M7 La Mise en scene | 1 (m7) | Storyboard, decoupage |
| 8 | M8 L'Equipe | 1 (m8) | Formation equipe, roles, carte talent |

### Bonus (4 phases — statut curriculum a confirmer R5)

| Phase | Module | Seances | Description |
|-------|--------|---------|-------------|
| B1 | M9 Le Cinema | 4 (m2a→m2d) | Budget, production |
| B2 | M4 L'Histoire | 4 | Narration avancee |
| B3 | M11 Cine-Debat | 4 | Analyse filmique |
| B4 | M13 Post-prod | 1 (m9) | Finalisation |

## 5.2 Roles M8 (6 metiers cinema)

| Role technique | Id | Famille talent |
|---------------|-----|----------------|
| Realisateur | realisateur | image |
| Cadreur | cadreur | image |
| Ingenieur son | son | technique |
| Assistant realisateur | assistant-real | technique |
| Scripte | script | technique |
| Acteur | acteur | jeu |

**Systeme de points M8** : participation + creativite + engagement → score 0-100 → classement invisible → choix de role par ordre de merite. Conforme a la doctrine (classement invisible, pas affiche aux eleves).

## 5.3 Ce qui manque pour le terrain (M9+)

Les modules M9 a M13 (tournage, montage, projection) **n'existent pas dans le cockpit**. Le document `PROTOCOLE_TOURNAGE.md` compense en mode papier/oral (seances S9 a S13).

---

# 6. CONFORMITE DOCTRINE

## 6.1 Etat des recadrages Cycle 1

| # | Demande | Statut | Detail |
|---|---------|--------|--------|
| **R1** | Leaderboard → suppression | **Actif — a supprimer** | API `/leaderboard` existe, `topStudents` + `currentRank` dans SessionState. Non affiche aux eleves mais le code est la. |
| **R2** | Profil OIE → retrait | **Actif — a retirer** | `oie-profile.ts` (400+ lignes), 2 tables SQL, API, composant radar, section resultats. Blast radius : 8+ fichiers. |
| **R3** | At-risk detection → desactiver | **Actif — a desactiver** | `at-risk-detection.ts` (95 lignes), widget dashboard, 3 criteres (score < 30, drop > 15pts, inactivite 14j). |
| **R4** | Roles intervenant ≠ professeur | **Partiellement implemente** | Auth distingue les roles en DB (migration 111), mais l'interface cockpit ne differencie pas encore les acces data. |
| **R5** | Modules M9-M13 contenu | **En attente** | Code existe, curriculum a confirmer. |

## 6.2 Points conformes

- Contributions anonymes : **OK** — les eleves ne voient pas qui a ecrit quoi
- Vote democratique : **OK** — systeme de manches en place
- Attribution de roles par merite invisible : **OK** — points M8 non affiches
- XP individuel non comparatif : **A VERIFIER** — l'XP existe mais le leaderboard doit etre supprime
- Data pedagogique : **PARTIELLEMENT OK** — le dashboard V2 montre des tendances groupe, mais les profils OIE sont du profilage

---

# 7. SERVICES EXTERNES

| Service | Statut | Detail |
|---------|--------|--------|
| **Supabase** | Operationnel | Projet `ohhrmgqebwziddcicxev`, PostgreSQL 15.8, RLS active |
| **Sentry** | Configure, pas actif (dev) | DSN vide en local, source maps uploadees en CI (main) |
| **Resend** | **Non fonctionnel** | Cle API vide. 4 templates prets (welcome, validation, rejet, invitation) |
| **PostHog** | **Non configure** | Dependance absente du package.json mais reference dans CSP headers et .env.example |
| **Gemini (Google AI)** | Configure | Cle active — utilise pour generation de scenes (M6) et suggestions IA |
| **TMDB** | Reference | Images films dans next.config.ts (remote patterns) |
| **Pollinations AI** | Reference | Generation d'images IA |
| **Unsplash** | Reference | Images stock |

---

# 8. TESTS

## 8.1 Tests unitaires (Vitest)

| Metrique | Valeur |
|----------|--------|
| Fichiers de test | 17 |
| Tests passants | 211 |
| Tests en echec | 1 (XP : "Cameraman" vs "Cadreur") |
| Couverture statements | > 60% (seuil CI) |
| Couverture branches | > 50% (seuil CI) |
| Couverture fonctions | > 55% (seuil CI) |
| Couverture lignes | > 60% (seuil CI) |

**Fichiers testes :**
design-tokens, session-state, axes-mapping, sessions-create, vote-race, talent-profiles, api-utils, gamification, rate-limit, auth-roles, oie-profile, constants, session-patch, reactions, situation-parallel, sessions-join, vote

## 8.2 Tests E2E (Playwright)

| Metrique | Valeur |
|----------|--------|
| Specs | 7 |
| Navigateurs | Chromium uniquement |
| Safari | **Non teste** |
| Scenarios | login, student-join, respond-vote, view-results, session-create |
| Timeout | 15 min (CI) |

**Risque** : iPad Safari est la cible principale et n'est pas teste en E2E.

## 8.3 CI/CD (GitHub Actions)

```
ci.yml — 3 jobs
│
├── quality (10 min max)
│   ├── npm ci
│   ├── prettier --check
│   ├── eslint
│   ├── tsc --noEmit
│   ├── next build
│   └── sentry source maps (main only)
│
├── unit-tests (5 min max)
│   └── vitest run --coverage
│
└── e2e-tests (15 min max)
    └── playwright test (chromium)
```

---

# 9. DOCUMENTATION

## 9.1 Inventaire docs/ (42 fichiers + sous-dossiers)

### Documents strategiques (crees 22-23 mars 2026)

| Fichier | Taille | Sujet |
|---------|--------|-------|
| VISION_BANLIEUWOOD_3_ANS.md | 33 Ko | Vision 3 ans — 7 disciplines, modele economique, roadmap |
| VISION_BANLIEUWOOD_3_ANS.pdf | 927 Ko | Version PDF stylee |
| AUDIT_GLOBAL_PIVOT_V1.md | 53 Ko | Audit croise programmes EN x Banlieuwood |
| SYNTHESE_PIVOT_COLLEGE_PRIMAIRE_V1.md | 53 Ko | Synthese programmes college/primaire |
| SYNTHESE_PIVOT_LYCEE_V1.md | 31 Ko | Synthese programmes lycee |
| SPEC_NIVEAUX_SPIRALAIRES.md | 18 Ko | 4 niveaux de profondeur par module |
| SPEC_GRADIENT_GAMIFICATION.md | 11 Ko | Config gamification par niveau |
| MAPPING_INSTITUTIONNEL.md | 15 Ko | Socle, PEAC, CRCN, programmes |
| FICHES_ENSEIGNANT.md | 10 Ko | Fiches par discipline x cycle |
| FICHE_PARENT.md | 5 Ko | Communication parents + RGPD |
| PROTOCOLE_TOURNAGE.md | 11 Ko | Guide S9-S13 hors cockpit |
| GUIDE_INTERVENANT_PAR_NIVEAU.md | 18 Ko | Posture adaptee CM1 → Tle |

### Documents techniques (crees avant le 21 mars)

| Fichier | Sujet |
|---------|-------|
| rapport-etat-des-lieux-2026-03-21.md | Premier rapport d'audit (commit 82d2444) |
| cockpit-apple-audit.md | Audit iPad/Apple EdTech |
| cockpit-schemas-apple.md | Schemas de cockpit compares |
| cockpit-next-sprint.md | Planification sprint cockpit |
| full-app-audit.md | Audit applicatif complet |
| api-reference.md | Reference API complète |
| audit-scraping-education-nationale-2026.md | Audit sources EN a scraper |

### Pedagogie (docs/pedagogie/ — 14 fichiers)
Curriculum officiel Banlieuwood — stable, ne pas modifier.

### Modules (docs/modules/ — 10 fichiers)
Specs par module M1 a M13 — reference pour le developpeur.

## 9.2 Pont developpeur (docs/_A_ENVOYER_AU_DEV/)

```
_A_ENVOYER_AU_DEV/
├── README.md                    Mode d'emploi du cycle
├── FEUILLE_ROUTE_ACTIVE.md      Demandes Cycle 1 (R1-R5, F1-F7, DC1-DC3)
├── docs/
│   ├── NOTE_DOCTRINE_DATA_ELEVE.md    Doctrine data eleve
│   └── GUIDE_INTERVENANTS.md          Guide intervenant
├── rapport/
│   ├── RAPPORT_EN_COURS.md            Template pre-rempli Cycle 1
│   └── TEMPLATE_RAPPORT.md            Template vierge
└── archives/                          (vide — premier cycle)
```

---

# 10. ZONES DE RISQUE

## 10.1 Risques critiques (bloquent le terrain)

| # | Risque | Impact | Action |
|---|--------|--------|--------|
| 1 | Leaderboard actif | Contradiction doctrine — interdit avant tout test | Supprimer API + code client |
| 2 | Profil OIE actif | Profilage non autorise — 8+ fichiers touches | Retrait complet + migration SQL |
| 3 | At-risk detection actif | Profilage premature | Desactiver widget + lib |
| 4 | iPad Safari non teste E2E | Cible principale sans couverture | Ajouter Playwright Safari ou test manuel |

## 10.2 Risques eleves (a surveiller)

| # | Risque | Impact | Action |
|---|--------|--------|--------|
| 5 | Cockpit 21 000+ lignes | Maintenabilite, bugs | Refacto progressif apres terrain 1 |
| 6 | 117 migrations non squashees | Schema fragile | Squash avant mise en prod |
| 7 | Polling 180 req/min (30 eleves) | Charge serveur | Migrer vers Realtime quand iPad stable |
| 8 | Emails non fonctionnels | Pas d'onboarding, pas d'invitations | Configurer cle Resend |
| 9 | PostHog non configure | Pas d'analytics | Decision DC3 en attente |

## 10.3 Risques faibles

| # | Risque | Impact | Action |
|---|--------|--------|--------|
| 10 | 1 test unitaire en echec | CI passe quand meme | Renommer Cadreur/Cameraman |
| 11 | README generique Next.js | Pas bloquant | Reecrire quand stable |
| 12 | Pas de Vercel config | Deploiement par defaut | OK pour MVP |

---

# 11. DECISIONS EN ATTENTE

| # | Question | Urgence | Impact |
|---|----------|---------|--------|
| DC1 | Polling vs Supabase Realtime pour Terrain 1 ? | Moyenne | Performance a 30 eleves |
| DC2 | Garder 3 modes cockpit ou simplifier a 1 ? | Haute | UX intervenant, maintenance |
| DC3 | PostHog — configurer ou supprimer ? | Basse | Analytics vs complexite |
| DC4 | Modules M9-M13 — curriculum officiel ou independant ? | Haute | Garde ou retrait du code |
| DC5 | Qualiopi — preparer la certification ? | Basse (An 2) | Business model formation |

---

# 12. ROADMAP TERRAIN 1

## Phase A — Recadrages (pre-terrain, bloquant)

1. Supprimer leaderboard (R1)
2. Retirer OIE (R2) — migration SQL + 8 fichiers
3. Desactiver at-risk (R3)
4. Differencier acces intervenant/professeur (R4)
5. Tester iPad Safari reel 25+ eleves

## Phase B — Corrections fonctionnelles (terrain 1)

1. Module 2 categories budget (F1) — remplacer categories narratives par film
2. Vote tap-to-vote (F2) — enlever radio buttons
3. Selection manuelle reponses (F3) — intervenant choisit avant vote
4. Configurer Resend (F4) — emails fonctionnels
5. Fix test Cadreur/Cameraman (F7)

## Phase C — Ameliorations (post-terrain 1)

1. Animation revelation resultats (F5)
2. Page recap eleve (F6)
3. Dashboard professeur (nouvelle interface)
4. Migration vers Supabase Realtime (DC1)
5. Simplification cockpit a 1 mode (DC2)

---

# 13. METRIQUES PROJET

| Metrique | Valeur |
|----------|--------|
| **Fichiers source** | 613 |
| **Composants** | 300 |
| **Hooks** | 32 |
| **Routes API** | 105 |
| **Pages** | 39 |
| **Migrations SQL** | 76 fichiers (117 numerotees) |
| **Tests unitaires** | 211 pass / 1 fail |
| **Tests E2E** | 7 specs (Chromium) |
| **Dependances prod** | 28 |
| **Dependances dev** | 17 |
| **Taille src/** | 5.3 Mo |
| **Taille docs/** | 2.8 Mo |
| **Commits totaux** | ~222 |
| **Documents produits** | 42 markdown + sous-dossiers |
| **Couverture tests** | > 60% statements |

---

*Audit genere le 23 mars 2026 — Atelier Banlieuwood*
*Prochain audit : apres Terrain 1*
