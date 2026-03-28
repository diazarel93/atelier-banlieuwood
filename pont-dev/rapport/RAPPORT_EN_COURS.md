# Rapport d'état des lieux — Banlieuwood
<!-- Remplir ce fichier et nous le renvoyer à la fin du Cycle 1. -->

**Date :** 2026-03-21
**Cycle :** 1
**Commit de référence :** `82d2444`

---

## 1. Vue d'ensemble

**Niveau de maturité :** Testable en interne

**En 3 phrases — où en est l'outil :**
Le flux principal fonctionne : un intervenant crée une séance, les élèves rejoignent via un code 6 caractères, répondent, votent, voient les résultats. Le cockpit temps réel affiche les réponses et permet la modération. Cependant, plusieurs fonctionnalités actives contredisent la doctrine Banlieuwood (leaderboard comparatif, profil OIE, détection at-risk) et doivent être retirées avant tout test terrain.

**Ce qui a changé depuis le rapport du 21 mars 2026 (commit 82d2444) :**
Rapport initial — pas de cycle précédent. Audit réalisé sur l'état du code à ce commit. La feuille de route et la doctrine ont été lues et intégrées.

---

## 2. Ce qui est terminé et stable

| Fonctionnalité | Testé sur | Confiance |
|---|---|---|
| Auth intervenant (login/signup/reset) | E2E (login.spec.ts) + CI | Haute |
| Création de séance (wizard + code 6 chars + QR) | E2E (session-create.spec.ts) | Haute |
| Rejoindre une séance (élève : code + pseudo + emoji) | E2E (student-join.spec.ts) | Haute |
| Machine à états élève (8 états : waiting→done) | Tests unitaires (session-state.test.ts) | Haute |
| Soumission de réponses + stockage BDD | E2E + tests de charge | Haute |
| Vote collectif (fonctionne, UX à refaire) | E2E (respond-vote.spec.ts) | Moyenne |
| Modération réponses (masquer/commenter/scorer) | Tests unitaires | Haute |
| Protection des routes (middleware + RLS) | Tests unitaires | Haute |
| Validation Zod sur inputs API | Tests unitaires (schemas.test.ts) | Haute |
| Système XP individuel (non comparatif si leaderboard retiré) | Tests unitaires (1 échec mineur sur un nom de niveau) | Haute |
| Pipeline CI/CD (lint + typecheck + build + tests + E2E) | GitHub Actions | Haute |
| Reconnexion élève via localStorage | Tests unitaires | Moyenne |
| Écran de projection (question, nuage mots, spotlight, confetti) | Manuel uniquement | Moyenne |

---

## 3. Ce qui est partiel, provisoire ou fragile

| Fonctionnalité | État réel | Ce qui manque |
|---|---|---|
| **Vote élève** | Radio buttons + bouton confirmer | Refonte tap-to-vote (F2) |
| **Sélection réponses pour vote** | Toutes les réponses vont au vote | Sélection manuelle 3-4 réponses par l'intervenant (F3) |
| **Module 2 (Budget)** | Catégories narratives (personnage, liens, environnement) | Catégories film production : acteurs/décors/effets/musique/durée + réserve 10 crédits (F1) |
| **Cockpit enseignant** | 3 modes (standard, focus, commande). 57 useState, 19 modales. 30 commits d'itérations récentes. | Stabilisation. Décision DC2 en attente (simplifier à 1 mode ?) |
| **Synchro temps réel** | Polling HTTP 10-60s. Le hook `use-realtime-invalidation.ts` ne fait QUE du polling malgré son nom. | Supabase Realtime activé serveur, jamais utilisé client. Décision DC1 en attente. |
| **Leaderboard** | Actif. Mini-leaderboard dans 3 états play + leaderboard complet en fin de séance. | **Contraire doctrine** — suppression demandée (R1) |
| **Profil OIE** | Actif. 8 fichiers, 2 tables BDD, 6 colonnes student_profiles, API dédiée, cockpit, résultats. | **Non commandé** — retrait demandé (R2) |
| **Détection at-risk** | Active. Widget dashboard identifiant des élèves "à risque" par algorithme. | **Profilage prématuré** — désactivation demandée (R3) |
| **Emails** | Templates Resend créés (4 templates) | Clé API vide — aucun email ne part (F4) |
| **iPad Safari** | 5 correctifs récents (crypto, replaceAll, WebSocket, localStorage, error boundaries) | Fonctionnel mais environnement fragile. Device principal en classe. |
| **Modules M9-M13** | Code présent, cockpit implémenté. M10-M11 = 8/10. M9, M12, M13 = 6-7.5/10. | Confirmation que le contenu est officiel Banlieuwood (R5) |
| **Rôles** | 1 seul profil "facilitateur" (admin/intervenant/client). Pas de rôle professeur. | Séparation intervenant/professeur à implémenter (R4) |
| **Animation résultats** | Affichage instantané | Séquence cinématique demandée (F5) |
| **Coexistence V1/V2** | Redirects en place (/dashboard → /v2). Route group (dashboard) coexiste avec (cockpit-v2). | Code V1 potentiellement mort à nettoyer. |

---

## 4. Ce qui bloque

**Blocages techniques :**
- Aucun blocage technique dur. Le build passe, les tests tournent (1 échec mineur), l'app fonctionne en dev.

**Décisions en attente (côté Banlieuwood) :**
- DC1 : Polling vs Supabase Realtime — migrer pour Terrain 1 ou après ?
- DC2 : 3 modes cockpit — simplifier à 1 seul avant Terrain 1 ?
- DC3 : PostHog — configurer ou retirer ?
- R4 : Dashboard professeur — quelles données agrégées montrer exactement ?

**Contenus ou spécifications manquants :**
- R5 : Confirmation que le contenu M9-M13 est officiel Banlieuwood (détail envoyé dans la section 10)
- Spec du dashboard professeur : quelles données, quel niveau de granularité, quel format d'export
- Clé API Resend pour activer les emails (F4)

---

## 5. Ce qui est prêt pour le terrain

> Terrain = séance réelle, vrais élèves, WiFi scolaire instable, iPad Safari, 25-30 élèves.

**Prêt :**
- Auth intervenant
- Création séance + code + QR
- Rejoindre séance (élève)
- Flux question → réponse → résultat (modules sans leaderboard/OIE)
- Cockpit temps réel (modération, navigation, timer)
- Écran de projection (question, nuage mots, spotlight)
- Reconnexion élève
- XP individuel (si non comparatif, après retrait leaderboard)

**Fonctionnel mais pas encore terrain :**
- Vote collectif (UX trop lent pour 30 élèves — tap-to-vote nécessaire)
- Module 2 (catégories incorrectes)
- Plan de classe (stabilisé récemment, non testé en conditions réelles)
- Support offline (implémenté, non testé en WiFi scolaire)
- Polling 10-60s (fonctionne mais latence perceptible)

**Pas terrain :**
- Leaderboard (à retirer)
- Profil OIE (à retirer)
- At-risk detection (à désactiver)
- Emails (non configurés)
- Dashboard professeur (n'existe pas)
- Page récap élève (n'existe pas)

---

## 6. Zones de risque

- **Cockpit surchargé** — 57 useState, 19 modales, 3 modes. Zone la plus fragile. Chaque modification risque des régressions. Les 30 derniers commits sont quasi-exclusivement du cockpit.
- **Hook `use-realtime-invalidation.ts` mal nommé** — Fait du polling, pas du Realtime. Trompeur pour tout développeur reprenant le code.
- **iPad Safari** — 5 correctifs récents pour des crashes basiques. D'autres problèmes possibles en conditions réelles. Pas de tests E2E Safari.
- **Charge polling à 30 élèves** — ~180 requêtes/minute vers Supabase. Non testé en charge réelle.
- **Retrait OIE = blast radius élevé** — 2 tables BDD, 6 colonnes, 8 fichiers, API, cockpit context, résultats, talent profiles. Le retrait le plus coûteux du cycle.
- **117 migrations SQL non squashées** — Évolution très itérative. Risque d'incohérence entre migrations anciennes et état actuel.
- **Impression de maturité trompeuse** — 293 composants et un dashboard analytics riche, mais polling, 3 modes cockpit, et pas de séparation de rôles montrent que l'architecture n'est pas stabilisée.

---

## 7. État des tests

| Type | État | Détail |
|---|---|---|
| Tests unitaires | 17 fichiers, 211 pass, **1 échec** | Nom de niveau XP : "Cameraman" dans le code vs "Cadreur" dans le test. Quick fix (F7). |
| Tests E2E | 7 specs Playwright, Chromium uniquement | Login, student-join, respond-vote, view-results, session-create. Pas de tests Safari. |
| Tests de charge | 2 scripts (burst réponses, polling) | Présents. Résultats non documentés. |
| Couverture | Seuils : 60% statements, 50% branches | Respectés à date. |

---

## 8. Services externes

| Service | État | Commentaire |
|---|---|---|
| Supabase (BDD + Auth) | ✅ Actif | PostgreSQL cloud. Realtime activé serveur, non utilisé client. |
| Google Gemini | ✅ Clé configurée | Suggestions IA cockpit, scoring réponses. |
| Resend (emails) | ❌ Clé vide | Templates créés, aucun email ne part. |
| Sentry (monitoring) | ⚠️ Prod only | DSN vide en dev. Actif si déployé. |
| PostHog (analytics) | ❌ Clé vide | Dépendance installée, non configuré. DC3 en attente. |
| DiceBear (avatars) | ✅ Actif | Aucune dépendance externe critique. |
| TMDB (images films) | ✅ Référencé | Images de films pour M11 ciné-débat. |

---

## 9. Décisions attendues

| Question | Urgence | Bloquant ? |
|---|---|---|
| DC1 — Polling vs Realtime pour Terrain 1 ? | 🟠 Important | Non bloquant mais impacte la latence (10-60s actuellement). |
| DC2 — Simplifier cockpit à 1 mode ? | 🟠 Important | Non bloquant mais triple surface de maintenance. |
| DC3 — PostHog : configurer ou retirer ? | 🟡 Faible | Non. |
| R4 — Spec du dashboard professeur ? | 🟠 Important | Bloquant pour l'interface. L'architecture rôle peut être posée sans. |
| R5 — Contenu M9-M13 officiel ? | 🟡 Moyen | Non bloquant si Terrain 1 se limite à M1-M8. |
| F4 — Clé API Resend ? | 🟠 Important | Bloquant pour les emails de validation de comptes. |

---

## 10. Statut des demandes du Cycle 1

| Demande | Statut | Commentaire |
|---|---|---|
| R1 — Leaderboard → suppression complète | ❌ Non traité | Audit fait. 7 fichiers impactés : mini-leaderboard.tsx, 3 play states (waiting/sent/result), done-state.tsx, API /leaderboard. Couplé au système XP — l'XP individuel reste si non comparatif. Difficulté : modérée. |
| R2 — Profil OIE → retrait complet | ❌ Non traité | Audit fait. 8 fichiers + 2 tables BDD (session_oie_scores + 6 cols student_profiles) + API /oie-profile + cockpit context + résultats + talent profiles. Retrait le plus coûteux du cycle. Question : les talent profiles (deriveTalentProfile) dépendent de OIE — les retirer aussi ? |
| R3 — At-risk detection → désactivé | ❌ Non traité | Audit fait. 5 fichiers découplés. Facile. Si OIE retiré, at-risk perd ses données source et tombe automatiquement. |
| R4 — Rôles intervenant / professeur | ❌ Non traité | Audit fait. Rôle "client" existe mais bloqué sur tout /v2. Ajout rôle "professeur" estimé 2-3 jours : auth.ts + migration SQL + middleware + RLS + UI conditionals. Bloqué sur spec dashboard professeur. |
| R5 — Modules M9-M13 → contenu envoyé | ❌ Non traité | Audit fait. Contenu détaillé envoyé : M9 = budget film 5 catégories, M10 = Et si + pitch + avatar, M11 = ciné-débat 24 stimuli vrais films, M12 = 8 manches vote collectif, M13 = 8 étapes post-prod. À confirmer côté Banlieuwood. |
| F1 — Module 2 catégories budget | ❌ Non traité | Catégories actuelles = narratives. Catégories cibles = production film. Spec claire dans la feuille de route. |
| F2 — Vote tap-to-vote | ❌ Non traité | |
| F3 — Sélection manuelle réponses vote | ❌ Non traité | |
| F4 — Resend configuré | ❌ Non traité | Besoin de la clé API. |
| F5 — Animation révélation résultats | ❌ Non traité | |
| F6 — Page récap élève | ❌ Non traité | |
| F7 — Test unitaire Cadreur/Cameraman | ❌ Non traité | Quick fix. |

---

## 11. Tes priorités pour le prochain cycle

1. **R1 + R3 — Retirer leaderboard + désactiver at-risk** — Les plus urgents doctrinalement et les moins coûteux. At-risk tombe si OIE retiré.
2. **R2 — Retirer profil OIE** — Le plus coûteux mais non négociable pour Terrain 1. Besoin de décision sur les talent profiles (retirer aussi ou pas ?).
3. **F7 — Fixer le test en échec** — Quick fix pour rétablir le vert CI.
4. **F1 — Refaire Module 2 (catégories budget)** — Données incorrectes par rapport à la spec.
5. **R4 — Poser l'architecture 2 rôles** — Ajouter rôle professeur dans auth.ts + middleware + RLS. Interface professeur peut attendre la spec.
6. **F2 + F3 — Vote tap-to-vote + sélection manuelle** — Essentiels pour l'expérience terrain.
