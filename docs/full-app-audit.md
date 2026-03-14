# Audit Complet — Atelier Banlieuwood

> Date : 2026-03-14 | 28 items identifiés sur ~90 routes API, ~15 pages, ~74 migrations

---

## CRITIQUE — Bugs et failles à corriger immédiatement (7 items)

### C1. `STUDENT_TOKEN_SECRET` pas configuré en production
- **Fichier** : `src/lib/student-token.ts`
- **Problème** : Le secret HMAC pour signer les tokens étudiants a un fallback `"dev-secret-change-me"`. Si la variable d'env `STUDENT_TOKEN_SECRET` n'est pas définie en production, n'importe qui peut forger un token étudiant valide.
- **Fix** : Ajouter `STUDENT_TOKEN_SECRET` dans `.env.example` ET dans les variables d'environnement Vercel. Vérifier qu'il est bien défini en prod.

### C2. Bug `/api/v2/stats` — class_label manquant dans le SELECT
- **Fichier** : `src/app/api/v2/stats/route.ts` ligne 31
- **Problème** : La requête sessions fait `.select("id, title, status")` mais ensuite accède à `class_label` via un cast TypeScript. Résultat : le filtre par classe sur la page `/v2/statistiques` est TOUJOURS vide.
- **Fix** : Changer `.select("id, title, status")` → `.select("id, title, status, class_label")`

### C3. Aucune auth sur `/api/sessions/[id]/facilitator-tags`
- **Fichier** : `src/app/api/sessions/[id]/facilitator-tags/route.ts`
- **Problème** : GET/POST/DELETE utilisent `createAdminClient()` sans vérifier l'identité. N'importe qui avec un UUID de session peut lire, ajouter ou supprimer des tags prof sur les élèves.
- **Fix** : Ajouter `requireFacilitator()` ou `requireAuth()` en début de chaque handler.

### C4. Aucune auth sur `/api/sessions/[id]/scenario-generate`
- **Fichier** : `src/app/api/sessions/[id]/scenario-generate/route.ts`
- **Problème** : Déclenche des appels Gemini API (payants) sans vérification d'identité. Abuse possible.
- **Fix** : Ajouter `requireFacilitator()` + rate limiting.

### C5. Migration `060` en double
- **Fichiers** : `supabase/migrations/060_module6_scenario.sql` ET `supabase/migrations/060_profile_code.sql`
- **Problème** : Deux migrations partagent le préfixe 060. Supabase les exécute alphabétiquement, mais c'est fragile et confus.
- **Fix** : Renommer `060_profile_code.sql` → `061_profile_code.sql`

### C6. `totalVotes` jamais persisté — achievements vote cassés
- **Fichier** : `src/app/play/[id]/page.tsx` (PATCH student-context)
- **Problème** : Le PATCH envoie `responses`, `retained`, `streak`, `bestStreak` mais PAS `totalVotes`. Le compteur de votes n'est jamais écrit dans `student_profiles.total_votes`. Résultat : les achievements `electeur`, `curateur`, `public` sont bloqués à 0 pour toujours.
- **Fix** : Ajouter `totalVotes` au body du PATCH + le persister côté API dans student_profiles.

### C7. Creative Assistant appelle une API inexistante
- **Fichier** : `src/components/play/creative-assistant.tsx`
- **Problème** : Le composant appelle `/api/sessions/${sessionId}/creative` mais cette route n'existe pas. L'assistant IA échoue silencieusement à chaque utilisation.
- **Fix** : Soit créer la route API, soit retirer le Creative Assistant du SentState.

---

## HAUT — Features mortes ou jamais connectées (7 items)

### H1. PowerUpsBar importé mais jamais rendu
- **Fichier** : `src/components/play/power-ups-bar.tsx` (importé dans `src/app/play/[id]/page.tsx` ligne 89)
- **Problème** : 4 power-ups (Double Temps, Indice, Coup de Pouce, Bouclier) sont entièrement codés avec UI, tooltips, animations. Le composant est importé mais JAMAIS placé dans le JSX. Le joueur ne peut pas y accéder.
- **Action** : Soit brancher le composant dans le jeu, soit le retirer pour alléger le bundle.

### H2. CelebrationOverlay rendu mais jamais déclenché
- **Fichier** : `src/app/play/[id]/page.tsx` lignes 118 + 1298-1307
- **Problème** : L'état `celebration` est déclaré, le composant est rendu dans le JSX avec `onDismiss`, mais `setCelebration()` n'est JAMAIS appelé avec une valeur non-null. Le overlay ne s'affiche jamais.
- **Action** : Soit brancher les événements (level up, combo, achievement) vers `setCelebration()`, soit retirer le composant.

### H3. 8 achievements sur 30 impossibles à débloquer
- **Fichier** : `src/lib/achievement-checker.ts`
- **Problème** : `checkAchievements()` retourne `undefined` pour 8 achievements car ils nécessitent des données non disponibles :
  - `tribun` (score IA)
  - `pitcheur` (données pitch)
  - `mentor` (aide donnée)
  - `festival_star` (festival)
  - `perfectionniste` (score IA parfait)
  - `noctambule` (heure de jeu)
  - `speed_runner` (temps de réponse)
  - `mission_hero` (missions)
  - `critique` (festival)
- **Impact** : Ces badges s'affichent verrouillés dans la galerie du profil avec "? / X pour débloquer" mais ne peuvent JAMAIS se remplir.
- **Action** : Soit implémenter le tracking des données manquantes, soit masquer ces achievements tant qu'ils ne sont pas implémentés.

### H4. Bouton QR Code sur /join sans fonctionnalité
- **Fichier** : `src/app/join/page.tsx` lignes 399-411
- **Problème** : Un bouton "ou scanner un QR code" avec icône caméra est affiché. Il a un style clickable (cursor pointer) mais AUCUN `onClick` handler. Cliquer dessus ne fait rien.
- **Action** : Soit implémenter le scanner QR (avec une lib comme `html5-qrcode`), soit retirer le bouton.

### H5. Son `fanfare` défini mais jamais joué
- **Fichier** : `src/hooks/use-sound.ts`
- **Problème** : Le son `fanfare` est dans le map SOUNDS mais `play("fanfare")` n'est jamais appelé nulle part dans l'app.
- **Action** : L'utiliser pour les moments importants (achievement gold, combo x5, etc.) ou le retirer.

### H6. Intro cinématique rejouée à chaque rechargement
- **Fichier** : `src/components/play/cinematic-intro.tsx` + `src/app/play/[id]/page.tsx`
- **Problème** : Contrairement à l'onboarding (gated par `bw-onboarded` en localStorage), l'intro cinématique de 5 secondes se rejoue à chaque chargement de page — refresh, retour navigateur, changement d'onglet. Bloquant pendant une session active.
- **Fix** : Ajouter un check localStorage `bw-intro-seen-{sessionId}` pour ne la jouer qu'une fois par session.

### H7. Pas de bouton Mute côté joueur
- **Fichier** : `src/hooks/use-sound.ts` + `src/app/play/[id]/page.tsx`
- **Problème** : Le mute est contrôlé uniquement par le prof via `session.muteSounds`. L'élève n'a aucun moyen de couper les sons de son côté.
- **Fix** : Ajouter un petit bouton 🔊/🔇 dans le header joueur, qui toggle un état localStorage `bw-muted`.

---

## MOYEN — Manques UX vs concurrence (6 items)

### M1. Onboarding impossible à revoir
- **Fichier** : `src/components/play/onboarding-slides.tsx`
- **Problème** : Une fois `bw-onboarded` set en localStorage, l'onboarding ne se montre plus jamais, même sur une autre session. Pas de bouton "Revoir le tuto".
- **Fix** : Ajouter un lien "?" ou "Revoir le tuto" dans le WaitingState ou le header joueur.

### M2. Page profil thème clair ≠ jeu thème sombre
- **Fichier** : `src/app/profile/page.tsx` vs `src/app/play/[id]/page.tsx`
- **Problème** : Le profil utilise un fond crème (`#F7F3EA`) tandis que le jeu utilise le thème cinéma sombre (`bg-studio`). La transition est visuellement brutale.
- **Fix** : Harmoniser vers le même thème sombre, ou ajouter une transition douce.

### M3. Pas de message encourageant si 0 badges
- **Fichier** : `src/app/profile/page.tsx`
- **Problème** : Si un joueur n'a aucun badge, la galerie affiche 30 badges grisés sans message d'encouragement.
- **Fix** : Ajouter un empty state : "Continue à jouer pour débloquer ton premier badge !"

### M4. Classement classe dépend de class_label
- **Fichier** : `src/app/api/player-profile/route.ts`
- **Problème** : Le leaderboard de classe ne s'affiche que si la session la plus récente a un `class_label`. Si le prof ne le remplit pas → pas de classement.
- **Fix** : Fallback sur un classement par session_id si pas de class_label.

### M5. Offline queue sans retry visible
- **Fichier** : `src/lib/offline-queue.ts` + `src/hooks/use-offline-queue.ts`
- **Problème** : Quand le flush échoue, un toast s'affiche mais le joueur n'a aucun bouton pour retenter. Les items restent coincés jusqu'au prochain reconnect ou purgés après 30min.
- **Fix** : Ajouter un bouton "Réessayer" dans le toast d'échec.

### M6. Badge image canvas — fonts pas garanties
- **Fichier** : `src/components/play/session-badge.tsx`
- **Problème** : Le canvas utilise `'Bebas Neue'` et `'Plus Jakarta Sans'`. Si ces fonts ne sont pas chargées, l'image téléchargée ne ressemble pas au preview.
- **Fix** : Précharger les fonts avec `document.fonts.ready` avant de dessiner le canvas.

---

## INFRA & SÉCURITÉ — Dette technique (8 items)

### I1. 76 routes API sur 90 sans try/catch
- **Impact** : Les erreurs runtime (JSON parse, type errors) crashent le handler avec un 500 générique sans info utile ni Sentry.
- **Fix** : Créer un wrapper `withErrorHandler()` qui catch, log vers Sentry, et retourne un 500 propre. L'appliquer à toutes les routes.

### I2. Rate limiting manquant sur routes critiques
- **Routes sans rate limit** :
  - `/api/sessions` POST (création session illimitée)
  - `/api/sessions/[id]/scenario-generate` (appels IA payants)
  - `/api/sessions/[id]/responses/evaluate` (évaluation IA batch)
  - `/api/sessions/[id]/bilan` (génération bilan IA)
  - `/api/analytics` POST (insertion events sans limite)
  - `/api/contact` POST (envoi emails)
- **Fix** : Ajouter le helper `rateLimit()` existant à ces routes.

### I3. Auth étudiante incohérente
- **Problème** : Le token HMAC étudiant est vérifié sur `respond` et `vote`, mais PAS sur `hand-raise`, `reactions`, `team-chat`, `checklist`, `budget`, etc. Un étudiant peut usurper l'identité d'un autre sur ces routes.
- **Fix** : Étendre la vérification token à toutes les routes student-facing.

### I4. RLS "service write" trop permissif
- **Fichier** : `supabase/migrations/104_indexes_and_rls_tighten.sql`
- **Problème** : Les policies `USING(true) WITH CHECK(true)` sur les tables modules permettent à tout user `authenticated` de modifier les données de n'importe quelle session.
- **Fix** : Restreindre les policies au `service_role` ou ajouter un check `session_id` via une join sur `sessions.facilitator_id`.

### I5. Variables d'env manquantes dans .env.example
- **Manquantes** : `STUDENT_TOKEN_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `SENTRY_ORG`, `SENTRY_PROJECT`
- **Fix** : Les ajouter dans `.env.example` avec des commentaires.

### I6. 5 pages legacy dans le bundle
- **Fichiers** : `src/app/(dashboard)/dashboard/page.tsx`, `fiche-cours/page.tsx`, `session/[id]/page.tsx`, `session/[id]/results/page.tsx`, `session/new/page.tsx`
- **Problème** : Redirigées par middleware + next.config mais toujours dans le bundle compilé.
- **Action** : Les supprimer et ne garder que les redirects.

### I7. Pas de cache serveur sur l'endpoint situation
- **Fichier** : `src/app/api/sessions/[id]/situation/route.ts`
- **Problème** : Polled par chaque élève toutes les 3-5 secondes. Avec 30 élèves = 6-10 req/s, chacune fait ~12 queries Supabase. Aucun cache.
- **Fix** : Ajouter un cache mémoire de 2-3 secondes (Map avec TTL) pour le même sessionId.

### I8. Index DB manquants
- **Tables** :
  - `team_messages(session_id, team_id)` — requis pour le chat d'équipe
  - `facilitator_tags(session_id, student_id)` — requis pour les tags prof
  - `session_oie_scores(student_id, session_id)` — requis pour dashboard + stats
  - `module12_winners(session_id)` — requis pour scenario-generate
  - `mission_submissions(profile_id)` — requis pour missions
- **Fix** : Migration avec CREATE INDEX.

---

## Fichiers impactés par fix (~30 fichiers)

| Fichier | Fix(es) |
|---------|---------|
| `src/lib/student-token.ts` | C1 |
| `.env.example` | C1, I5 |
| `src/app/api/v2/stats/route.ts` | C2 |
| `src/app/api/sessions/[id]/facilitator-tags/route.ts` | C3 |
| `src/app/api/sessions/[id]/scenario-generate/route.ts` | C4, I2 |
| `supabase/migrations/060_profile_code.sql` → `061` | C5 |
| `src/app/play/[id]/page.tsx` | C6, H2, H6, H7 |
| `src/app/api/sessions/[id]/student-context/route.ts` | C6 |
| `src/components/play/creative-assistant.tsx` | C7 |
| `src/components/play/states/sent-state.tsx` | C7 |
| `src/components/play/power-ups-bar.tsx` | H1 |
| `src/lib/achievement-checker.ts` | H3 |
| `src/app/profile/page.tsx` | H3, M2, M3 |
| `src/app/join/page.tsx` | H4 |
| `src/hooks/use-sound.ts` | H5, H7 |
| `src/components/play/cinematic-intro.tsx` | H6 |
| `src/components/play/onboarding-slides.tsx` | M1 |
| `src/components/play/states/waiting-state.tsx` | M1 |
| `src/app/api/player-profile/route.ts` | M4 |
| `src/hooks/use-offline-queue.ts` | M5 |
| `src/components/play/session-badge.tsx` | M6 |
| `src/app/api/sessions/route.ts` | I2 |
| `src/app/api/sessions/[id]/responses/evaluate/route.ts` | I2 |
| `src/app/api/sessions/[id]/bilan/route.ts` | I2 |
| `src/app/api/analytics/route.ts` | I2 |
| `src/app/api/sessions/[id]/hand-raise/route.ts` | I3 |
| `src/app/api/sessions/[id]/reactions/route.ts` | I3 |
| `src/app/api/team-chat/route.ts` | I3 |
| `supabase/migrations/104_indexes_and_rls_tighten.sql` | I4 |
| `supabase/migrations/XXX_missing_indexes.sql` | I8 |

---

## Ordre d'exécution recommandé

| Phase | Items | Effort | Impact |
|-------|-------|--------|--------|
| 1. Quick fixes critiques | C1, C2, C5 | 15min | Sécurité + bug prof |
| 2. Auth manquante | C3, C4, I3 | 1h | Sécurité |
| 3. Features mortes | C6, C7, H1-H7 | 3h | UX joueur |
| 4. Polish UX | M1-M6 | 2h | Qualité perçue |
| 5. Infra | I1, I2, I4-I8 | 4h | Robustesse |

**Total estimé : ~10h**
