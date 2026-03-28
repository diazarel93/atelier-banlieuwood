# Rapport d'état des lieux — Banlieuwood
<!-- Remplir ce fichier et nous le renvoyer à la fin du Cycle 2. -->

**Date :** 2026-03-28
**Cycle :** 2
**Commit de référence :** `4ce9c90`

---

## 1. Vue d'ensemble

**Niveau de maturité :** Testable en interne

**En 3 phrases — où en est l'outil :**

Toutes les demandes bloquantes terrain du Cycle 2 sont traitées : leaderboard supprimé, OIE retiré, at-risk désactivé, cockpit simplifié à 1 mode. Les features terrain sont livrées (budget catégories film, animation résultats, récap élève, retour intervenant post-session). L'architecture modules a été alignée avec la spec M1-M8 : mapping layer, système de formules F0/F1/F2, filtrage sidebar, table B8_2 prête.

**Ce qui a changé depuis le cycle précédent (commit `ce29e47`) :**

- 5238 lignes supprimées (nettoyage leaderboard, OIE, at-risk, PostHog, cockpit legacy)
- pilot/page.tsx réduit de 2685 à 527 lignes (suppression CockpitContent mort)
- 4 nouvelles features terrain (F1, F5, F6, D11)
- Architecture modules alignée avec spec M1-M8 (6 phases, 6 PRs mergées)
- Système de formules F0/F1/F2 implémenté avec modules_enabled par session
- Labels phases renommés pour matcher la spec officielle
- Table implication_scores (B8_2) prête pour quand la spec scoring sera confirmée
- Migrations 118-121 ajoutées
- CLAUDE.md ajouté (conventions projet pour workflow dev)
- Workflow pro en place : conventional commits, feature branches, 6 PRs mergées
- 204 tests passent (16 suites), TypeScript compile proprement

---

## 2. Ce qui est terminé et stable

| Fonctionnalité | Testé sur | Confiance |
|---|---|---|
| Authentification (login/signup/reset) | Chrome, CI | Haute |
| Création de session + configuration + formule | Chrome, CI | Haute |
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
| Mapping spec M1-M8 ↔ dbModules (spec-modules.ts) | CI | Haute |
| Système formules F0/F1/F2 (formulas.ts) | CI | Haute |
| Filtrage sidebar par modules_enabled | Chrome | Haute |
| Labels phases conformes spec (Le Mécanisme, Générer l'idée, Le Récit) | Chrome | Haute |

---

## 3. Ce qui est partiel, provisoire ou fragile

| Fonctionnalité | État réel | Ce qui manque |
|---|---|---|
| **Cockpit intervenant** | Simplifié à 1 mode, sidebar filtrée par formule | Interfaces intervenant/professeur pas encore différenciées (R4 2b) |
| **Polling / Realtime** | WebSocket avec fallback polling (5-30s) | Nom trompeur (`use-realtime-invalidation`), charge élevée à 30 élèves |
| **iPad Safari** | 5 correctifs appliqués, plan de classe responsive | Pas de test E2E Safari, WebSocket fragile |
| **Séparation rôles** | Auth distingue intervenant/professeur en DB (migration 111) | Interface cockpit pas encore différenciée (R4 2b) |
| **V2 Stats (axes compétences)** | Structure maintenue, données vides | Source OIE retirée — table B8_2 prête mais mapping non spécifié |
| **Modules M9-M13** | Marqués `bonus: true`, exclus des formules par défaut | Décision curriculum en attente (R5) — voir section 12 |
| **Emails** | 4 templates Resend prêts | **Clé API vide** — aucun email ne part (F4) |
| **121 migrations** | Séquentielles, non squashées | Risque d'incohérence schema — squash avant prod |
| **Sélecteur formule UI** | API prête (formula dans createSession) | Sélecteur F0/F1/F2 pas encore ajouté dans le wizard de création |

---

## 4. Ce qui bloque

**Blocages techniques :**
- Rien de techniquement bloquant — tout compile, les tests passent

**Décisions en attente (côté Banlieuwood) :**
- B8_2 → axes V2 Stats : quelle correspondance entre points d'implication et les 4 axes ?
- M9/M11 : garder comme bonus, remplacer par curriculum officiel, ou retirer ?
- M10/M12 vs M3/M4/M5 : confirmer que M10 (code) = M3+M4 (spec) et M12 (code) = M5 (spec)

**Contenus ou spécifications manquants :**
- Clé API Resend (emails — F4)
- DSN Sentry (monitoring production — basse priorité)
- Specs R4 (2b) — différenciation interface intervenant/professeur

---

## 5. Ce qui est prêt pour le terrain

**Prêt :**
- Création de session avec formule (F0 par défaut)
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
- Sidebar filtrée par formule (F0 = M1+M3 seulement)

**Fonctionnel mais pas encore terrain :**
- iPad Safari (fonctionne mais pas testé E2E)
- XP (fonctionne, non comparatif, conforme doctrine)
- Sélecteur formule dans le wizard (API prête, UI à connecter)

**Pas terrain :**
- Dashboard professeur (n'existe pas encore — vue agrégée post-séance)
- Emails (pas de clé API)
- V2 Stats compétences (données vides, en attente spec B8_2)

---

## 6. Zones de risque

- **Polling sous charge** : 30 élèves en mode dégradé = 180 req/min. Pas testé à cette charge.
- **iPad Safari** : cible principale sans aucun test E2E automatisé. WebSocket tombe souvent en fallback polling.
- **121 migrations non squashées** : risque de drift schema si on reset la DB en dev.
- **V2 Stats vides** : table B8_2 prête mais la logique de calcul attend votre spec.
- **Cockpit** : encore ~20 000 lignes dans use-focus-cockpit-state.ts — hook monolithique à splitter.
- **Overlap M10/M12 vs M3/M4/M5** : le mapping layer est en place mais si on développe M3/M4/M5 spec sans clarifier la correspondance avec M10/M12 code, risque de duplication.

---

## 7. État des tests

| Type | État | Détail |
|---|---|---|
| Tests unitaires | 204 pass, 0 fail | 16 suites (Vitest) — dont spec-modules et formulas |
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
| B8_2 → axes V2 Stats : quelle correspondance ? | Haute | Oui pour réactiver le dashboard compétences |
| M10 (code) = M3+M4 (spec) et M12 (code) = M5 (spec) ? | Haute | Oui avant tout développement M3/M4/M5 |
| M9/M11 : garder comme bonus ou retirer ? | Moyenne | Non (marqués bonus, exclus des formules) |
| Clé API Resend | Moyenne | Oui pour onboarding/invitations |
| R4 (2b) — Specs interface intervenant/prof | Moyenne | Non pour Terrain 1 (1 compte suffit) |
| DSN Sentry | Basse | Non en dev, oui avant prod |

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

## 11. Travail supplémentaire — Alignement spec M1-M8

En réponse à la spec `SPEC_MODULES_VALIDATION_DEV.md` reçue le 28 mars, 6 chantiers ont été réalisés :

| Phase | Contenu | PR |
|---|---|---|
| 1 — Mapping Layer | `spec-modules.ts` : source de vérité mapping M1-M8 ↔ dbModules. 20 tests. | #2 |
| 2 — Formules F0/F1/F2 | `formulas.ts` + migrations 119-120 + session creation auto-populate | #3 |
| 3 — Nommage | Labels phases alignés spec (Le Mécanisme, Générer l'idée, Le Récit) | #4 |
| 4 — Visibilité UI | Sidebar filtre modules par `modules_enabled` (formule session) | #6 |
| 5 — Modules bonus | `bonus: true` sur dbModules 3, 4, 9, 11, 13 — exclus des formules | #5 |
| 6 — B8_2 prep | Migration 121 : table `implication_scores` prête (vide) | #5 |

**Points ouverts de la spec non traités (par design — en attente de votre décision) :**
- Durée plancher B4a, critères miroir collectif B5, labels B4_2
- Algo cartes M5 depuis pitchs M4, algo M5→scénario V0 pour M6
- Génération images storyboard M7
- Correspondance B8_2 → axes V2 Stats

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
- **Alerte overlap :** M10 séance 1 = M3 spec (Générer l'idée), M10 séance 2 = M4 spec (Le Pitch). Le mapping layer est en place — à confirmer de votre côté.

### M11 — Ciné-Débat (4 séances)
- **Contenu :** Analyse filmique (art de raconter, émotions à l'écran, héros/anti-héros, coulisses). Citations Hitchcock, Miyazaki, Pixar, Marvel, Naruto, Dune.
- **Origine :** Conçu indépendamment par le développeur. Culture cinéma grand public, pas spécifique Banlieuwood.

### M12 — Construction Collective (1 séance)
- **Contenu :** 8 votes successifs pour construire un film ensemble (ton → situation → personnages → objectif → obstacle → scène → relation → moment fort). Templates pré-écrits en fallback.
- **Origine :** **Contenu Banlieuwood.** Templates ancrés banlieue/lycée.
- **Alerte overlap :** M12 = M5 spec (Le Récit). Le mapping layer est en place — à confirmer de votre côté.

### M13 — La Post-prod (1 séance)
- **Contenu :** Workflow post-production (montage, musique, titre, affiche, bande-annonce, générique, projection).
- **Origine :** Scaffold conçu par le développeur. **Désactivé dans le code.** Non implémenté, en attente d'activation.

### Résumé attribution

| Module | Banlieuwood ? | Développeur ? | Mapping spec | Recommandation |
|---|---|---|---|---|
| M9 — Le Cinéma | Non | Oui (générique) | Hors spec (bonus) | Garder comme bonus ou remplacer |
| M10 — Et si... & Pitch | **Oui** | Structure oui | = M3 + M4 spec | **Garder** — confirmer le mapping |
| M11 — Ciné-Débat | Non | Oui (générique) | Hors spec (bonus) | Garder comme bonus ou retirer |
| M12 — Construction Collective | **Oui** | Système oui | = M5 spec | **Garder** — confirmer le mapping |
| M13 — La Post-prod | Non | Oui (scaffold) | Hors spec (bonus) | Activer quand specs prêtes |

---

## 13. Tes priorités pour le prochain cycle

1. **Confirmer mappings** M10=M3+M4 et M12=M5 (bloquant pour tout développement M3/M4/M5)
2. **B8_2 spec** — Correspondance points d'implication → axes V2 Stats (table prête, logique TBD)
3. **R4 (2b)** — Différencier interface intervenant/professeur (quand specs confirmées)
4. **F4** — Configurer Resend dès réception de la clé API
5. **Sélecteur formule UI** — Connecter le sélecteur F0/F1/F2 dans le wizard de création
6. **Test iPad Safari** — Session de test réel avant terrain
7. **Squash migrations** — Réduire les 121 migrations avant prod

---

*Rapport mis à jour le 28 mars 2026 — Banlieuwood — Pont développeur Cycle 2*
