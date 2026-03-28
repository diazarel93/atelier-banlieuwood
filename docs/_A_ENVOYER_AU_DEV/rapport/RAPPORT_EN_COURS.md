# Rapport d'état des lieux — Banlieuwood
<!-- Remplir ce fichier et nous le renvoyer à la fin du Cycle 2. -->

**Date :** 2026-03-28
**Cycle :** 2
**Commit de référence :** `74b5fef`

---

## 1. Vue d'ensemble

**Niveau de maturité :** Testable en interne

**En 3 phrases — où en est l'outil :**

Toutes les demandes bloquantes terrain du Cycle 2 sont traitées : leaderboard supprimé, OIE retiré, at-risk désactivé, cockpit simplifié à 1 mode. Les features terrain sont livrées (budget catégories film, animation résultats, récap élève, retour intervenant post-session). Le flux complet (session → jonction → réponses → vote → résultats → récap) est conforme à la doctrine et prêt pour un test interne.

**Ce qui a changé depuis le cycle précédent (commit `ce29e47`) :**

- 5238 lignes supprimées (nettoyage leaderboard, OIE, at-risk, PostHog, cockpit legacy)
- pilot/page.tsx réduit de 2685 à 527 lignes (suppression CockpitContent mort)
- 4 nouvelles features terrain (F1, F5, F6, D11)
- Migration 118 ajoutée (table session_facilitator_feedback)
- CLAUDE.md ajouté (conventions projet pour workflow dev)
- Workflow pro en place : conventional commits, feature branches, PR (#1 mergée)
- 172 tests passent (14 suites), TypeScript compile proprement

---

## 2. Ce qui est terminé et stable

| Fonctionnalité | Testé sur | Confiance |
|---|---|---|
| Authentification (login/signup/reset) | Chrome, CI | Haute |
| Création de session + configuration | Chrome, CI | Haute |
| Jonction élève (code session + pseudo) | Chrome, E2E | Haute |
| Soumission de réponses (texte, vote, etc.) | Chrome, E2E | Haute |
| Système de vote tap-to-vote | Chrome, E2E | Haute |
| Sélection manuelle réponses pour vote | Chrome, CI | Haute |
| Modération (masquer réponse) | Chrome, CI | Haute |
| Validation schemas (Zod) | CI | Haute |
| Protection rate-limit | CI | Haute |
| XP individuel (non comparatif) | CI | Haute |
| CI/CD (lint + build + tests + E2E) | GitHub Actions | Haute |
| RLS Supabase (row-level security) | Migrations | Haute |
| Budget catégories film (acteurs/décors/effets/musique/durée) | CI | Haute |
| Animation cinématique résultats (4 phases) | Chrome | Moyenne |
| Retour intervenant post-session (D11) | Chrome | Moyenne |
| Page récap élève (/play/[id]/recap) | Chrome | Moyenne |
| Suppression leaderboard (R1) | CI | Haute |
| Retrait OIE (R2) | CI | Haute |
| Désactivation at-risk (R3) | CI | Haute |
| Cockpit 1 mode — FocusCockpit + CommandCockpit (R4 2a) | Chrome | Haute |

---

## 3. Ce qui est partiel, provisoire ou fragile

| Fonctionnalité | État réel | Ce qui manque |
|---|---|---|
| **Cockpit intervenant** | Simplifié à 1 mode (FocusCockpit + CommandCockpit wrapper) | Interfaces intervenant/professeur pas encore différenciées (R4 2b) |
| **Polling / Realtime** | WebSocket avec fallback polling (5-30s) | Nom trompeur (`use-realtime-invalidation`), charge élevée à 30 élèves |
| **iPad Safari** | 5 correctifs appliqués, plan de classe responsive | Pas de test E2E Safari, WebSocket fragile |
| **Séparation rôles** | Auth distingue intervenant/professeur en DB (migration 111) | Interface cockpit pas encore différenciée (R4 2b) |
| **V2 Stats (axes compétences)** | Structure maintenue, données vides | Source de données OIE retirée — à remplacer par système curriculum |
| **Modules M9-M13** | Code présent, non activé par défaut | Décision curriculum en attente (R5) — voir section 12 |
| **Emails** | 4 templates Resend prêts | **Clé API vide** — aucun email ne part (F4) |
| **117 migrations** | Séquentielles + migration 118 ajoutée | Risque d'incohérence schema — squash avant prod |

---

## 4. Ce qui bloque

**Blocages techniques :**
- Rien de techniquement bloquant — tout compile, les tests passent

**Décisions en attente (côté Banlieuwood) :**
- R5 : Modules M9-M13 — garder, retirer, ou remplacer ? (voir section 12)
- V2 Stats : Quel système remplace OIE pour les axes de compétences ?

**Contenus ou spécifications manquants :**
- Clé API Resend (emails — F4)
- DSN Sentry (monitoring production — basse priorité)
- Décision curriculum M9-M13

---

## 5. Ce qui est prêt pour le terrain

**Prêt :**
- Création de session
- Jonction élève (code + pseudo)
- Réponses (tous types)
- Système de vote tap-to-vote avec sélection manuelle
- Animation cinématique résultats
- Écran projeté (mode spotlight, celebration)
- Budget catégories film (M9 séance 2)
- Page récap élève
- Retour intervenant post-session
- Carte talent M8
- Cockpit simplifié (1 mode, responsive mobile/tablette/desktop)

**Fonctionnel mais pas encore terrain :**
- iPad Safari (fonctionne mais pas testé E2E)
- XP (fonctionne, non comparatif, conforme doctrine)

**Pas terrain :**
- Dashboard professeur (n'existe pas encore — vue agrégée post-séance)
- Emails (pas de clé API)
- Modules M9/M11/M13 (en attente décision)

---

## 6. Zones de risque

- **Polling sous charge** : 30 élèves en mode dégradé = 180 req/min. Pas testé à cette charge.
- **iPad Safari** : cible principale sans aucun test E2E automatisé. WebSocket tombe souvent en fallback polling.
- **118 migrations non squashées** : risque de drift schema si on reset la DB en dev.
- **V2 Stats vides** : les axes de compétences (compréhension/créativité/expression/engagement) n'ont plus de source de données depuis le retrait OIE. Les pages s'affichent mais sans data.
- **Cockpit** : encore ~20 000 lignes dans use-focus-cockpit-state.ts — hook monolithique à splitter.

---

## 7. État des tests

| Type | État | Détail |
|---|---|---|
| Tests unitaires | 172 pass, 0 fail | 14 suites (Vitest) |
| Tests E2E | 7 specs, Chromium uniquement | login, student-join, respond-vote, view-results, session-create |
| Coverage | > 60% statements, > 50% branches | Seuils CI respectés |
| Safari E2E | **Non testé** | Cible principale non couverte |

---

## 8. Services externes

| Service | État | Commentaire |
|---|---|---|
| Supabase (DB + Auth + RLS) | Opérationnel | Projet `ohhrmgqebwziddcicxev`, PG 15.8 |
| Sentry (monitoring) | Configuré, inactif en dev | DSN vide en local, source maps CI ok |
| Resend (emails) | **Non fonctionnel** | Clé API vide, 4 templates prêts |
| Gemini (IA) | Opérationnel | Génération scènes M6, suggestions |
| PostHog (analytics) | **Supprimé** | Retiré du code, CSP, config (DC3) |
| TMDB / Unsplash / Pollinations | Références | Images dans next.config remote patterns |

---

## 9. Décisions attendues

| Question | Urgence | Bloquant ? |
|---|---|---|
| R5 — Modules M9-M13 : garder / retirer / remplacer ? | Haute | Oui pour finaliser le curriculum |
| V2 Stats — Quel système remplace OIE pour les axes ? | Moyenne | Non (pages vides mais fonctionnelles) |
| Clé API Resend | Moyenne | Oui pour onboarding/invitations |
| DSN Sentry | Basse | Non en dev, oui avant prod |
| R4 (2b) — Specs précises de la différenciation intervenant/prof ? | Moyenne | Non pour Terrain 1 (1 compte suffit) |

---

## 10. Statut des demandes du Cycle 2

| Demande | Statut | Commentaire |
|---|---|---|
| R1 — Leaderboard → suppression | ✅ Fait | API, composants, polling, profil, stats — 13 fichiers |
| R2 — Profil OIE → retrait complet | ✅ Fait | Computation, radar, talent derivation, queries — 25+ fichiers, 3 test suites |
| R3 — At-risk detection → désactiver | ✅ Fait | Lib, widget, notifications, dashboard — 8 fichiers |
| R4 (2a) — Cockpit → 1 seul mode | ✅ Fait | CockpitContent supprimé (2050 lignes), pilot/page.tsx 2685→527 lignes |
| R4 (2b) — Interface intervenant / professeur | ❌ Non traité | En attente specs précises. Pour Terrain 1, un compte suffit. |
| R5 — Modules M9–M13 → contenu envoyé | ✅ Fait | Voir section 12 ci-dessous |
| F7 — Test Cadreur/Cameraman | ✅ Fait | Quick fix — test corrigé |
| DC3 — PostHog → supprimé | ✅ Fait | Analytics, CSP, cookie-consent, env vars nettoyés |
| F1 — Module 2 catégories budget | ✅ Fait | technique→effets, son→musique, montage→durée |
| F2 — Vote tap-to-vote | ✅ Déjà en place | handleTap → onVote immédiat, pas de bouton confirmer |
| F3 — Sélection manuelle réponses vote | ✅ Déjà en place | is_vote_option toggle, min 2 pour voter |
| F4 — Resend configuré | ❌ Non traité | Clé API attendue de votre côté |
| F5 — Animation révélation résultats | ✅ Fait | Séquence 4 phases : blackout → fade → slide → celebrate |
| F6 — Page récap élève | ✅ Fait | API publique recap-student + fallback dans la page existante |
| D11 — Retour intervenant post-session | ✅ Fait | Migration 118, API, formulaire 4 questions + texte libre |

---

## 11. Tes priorités pour le prochain cycle

1. **R4 (2b)** — Différencier les interfaces intervenant/professeur (quand specs confirmées)
2. **F4** — Configurer Resend dès réception de la clé API
3. **R5** — Appliquer la décision M9-M13 (garder/retirer/remplacer)
4. **V2 Stats** — Implémenter un nouveau système de scoring compétences (post-OIE)
5. **Test iPad Safari** — Session de test réel avant terrain
6. **Squash migrations** — Réduire les 118 migrations avant prod

---

## 12. Contenu des modules M9–M13 (demandé par R5)

### M9 — Le Cinéma (4 séances)
- **Contenu :** Quiz cinéma (métiers, coûts, contraintes), jeu budget 100 crédits, imprévus de tournage, plan de production
- **Origine :** Conçu indépendamment par le développeur. Pédagogie cinéma générique, pas spécifique Banlieuwood.
- **Remarque :** La séance 2 (budget) a été mise à jour avec les catégories film Banlieuwood (acteurs/décors/effets/musique/durée).

### M10 — Et si... & Le Pitch (2 séances)
- **Contenu :** 10 images stimulus quartier/école → écriture "et si..." + création personnage + objectif/obstacle + pitch oral 30s
- **Origine :** **Contenu Banlieuwood.** Images spécifiquement quartier/école (banc vide, escalier, cantine, arrêt de bus). Personnages ancrés banlieue (Inès au casque, Karim qui fait rire tout le monde).
- **Intégration :** Les réponses M10 alimentent les cartes de vote M12.

### M11 — Ciné-Débat (4 séances)
- **Contenu :** Analyse filmique (art de raconter, émotions à l'écran, héros/anti-héros, coulisses). Citations Hitchcock, Miyazaki, Pixar, Marvel, Naruto, Dune.
- **Origine :** Conçu indépendamment par le développeur. Culture cinéma grand public, pas spécifique Banlieuwood.

### M12 — Construction Collective (1 séance)
- **Contenu :** 8 votes successifs pour construire un film ensemble (ton → situation → personnages → objectif → obstacle → scène → relation → moment fort). Templates pré-écrits en fallback.
- **Origine :** **Contenu Banlieuwood.** Templates ancrés banlieue/lycée ("Un élève trouve un message caché dans son casier", "Prouver à tout le monde qu'on peut réussir autrement"). Le contenu principal vient des élèves (via M10).

### M13 — La Post-prod (1 séance)
- **Contenu :** Workflow post-production (montage, musique, titre, affiche, bande-annonce, générique, projection).
- **Origine :** Scaffold conçu par le développeur. **Désactivé dans le code.** Non implémenté, en attente d'activation.
- **Remarque :** Code présent mais `disabled: true` dans la config modules.

### Résumé attribution

| Module | Banlieuwood ? | Développeur ? | Recommandation |
|---|---|---|---|
| M9 — Le Cinéma | Non | Oui (générique) | Garder comme bonus ou remplacer par curriculum officiel |
| M10 — Et si... & Pitch | **Oui** (images, personnages) | Structure oui | **Garder** — cœur curriculum |
| M11 — Ciné-Débat | Non | Oui (générique) | Garder comme culture ciné ou remplacer |
| M12 — Construction Collective | **Oui** (templates) | Système oui | **Garder** — cœur curriculum |
| M13 — La Post-prod | Non | Oui (scaffold) | Activer quand specs prêtes, ou retirer |

---

*Rapport mis à jour le 28 mars 2026 — Banlieuwood — Pont développeur Cycle 2*
