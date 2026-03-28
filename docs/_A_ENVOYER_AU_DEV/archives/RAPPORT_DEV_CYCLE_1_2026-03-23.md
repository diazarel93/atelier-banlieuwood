# Rapport d'etat des lieux — Banlieuwood
<!-- Remplir ce fichier et nous le renvoyer a la fin du Cycle 1. -->

**Date :** 2026-03-23
**Cycle :** 1 (mise a jour)
**Commit de reference :** `ce29e47`

---

## 1. Vue d'ensemble

**Niveau de maturite :** Testable en interne

**En 3 phrases — ou en est l'outil :**

L'outil couvre les 8 phases coeur (M1 a M8) avec un cockpit temps reel, un systeme de vote en manches, une ecriture collaborative et une formation d'equipe avec carte talent. Le flux complet fonctionne (creer une session → eleves rejoignent → repondent → votent → resultats) mais 3 fonctionnalites actives contredisent la doctrine Banlieuwood (leaderboard, OIE, at-risk) et doivent etre retirees avant tout test terrain. Depuis le 21 mars, aucune modification de code — uniquement production documentaire (15 documents strategiques et pedagogiques).

**Ce qui a change depuis le rapport du 21 mars 2026 (commit 82d2444) :**

- 1 commit ajoute : scraper Education Nationale + syntheses pivot V1
- 15 documents strategiques crees dans docs/ (vision 3 ans, specs spiralaires, mapping institutionnel, fiches enseignant/parent, protocole tournage, guide intervenant)
- Aucune modification du code applicatif
- Les demandes R1 a R5 et F1 a F7 sont toujours en attente de traitement

---

## 2. Ce qui est termine et stable

| Fonctionnalite | Teste sur | Confiance |
|---|---|---|
| Authentification (login/signup/reset) | Chrome, CI | Haute |
| Creation de session + configuration | Chrome, CI | Haute |
| Jonction eleve (code session + pseudo) | Chrome, E2E | Haute |
| Soumission de reponses (texte, vote, etc.) | Chrome, E2E | Haute |
| Systeme de vote (selection + revele) | Chrome, E2E | Haute |
| Moderation (masquer reponse) | Chrome, CI | Haute |
| Validation schemas (Zod) | CI | Haute |
| Protection rate-limit | CI | Haute |
| XP individuel (non comparatif) | CI | Moyenne |
| CI/CD (lint + build + tests + E2E) | GitHub Actions | Haute |
| RLS Supabase (row-level security) | Migrations | Haute |
| Scraper Education Nationale | Local | Moyenne |

---

## 3. Ce qui est partiel, provisoire ou fragile

| Fonctionnalite | Etat reel | Ce qui manque |
|---|---|---|
| **Cockpit intervenant** | Fonctionne mais surchage (21 000 lignes, 3 modes) | Simplifier a 1 mode (DC2), splitter teacher-docks.tsx (1 114 lignes) |
| **Polling / Realtime** | WebSocket avec fallback polling (5-30s) | Nom trompeur (`use-realtime-invalidation`), charge elevee a 30 eleves (~180 req/min en mode degrade) |
| **iPad Safari** | 5 correctifs recents, plan de classe responsive | Pas de test E2E Safari, WebSocket fragile (contexte insecure) |
| **Leaderboard** | API existe, data dans SessionState | **A supprimer** (R1) — non affiche aux eleves mais le code reste |
| **Profil OIE** | Complet (400+ lignes, 2 tables SQL, radar, resultats) | **A retirer** (R2) — blast radius 8+ fichiers, migration SQL necessaire |
| **At-risk detection** | Complet (95 lignes, widget, 3 criteres) | **A desactiver** (R3) |
| **Separation roles** | Auth distingue intervenant/professeur en DB (migration 111) | Interface cockpit pas encore differenciee (R4) |
| **Vote UX** | Radio buttons + confirmer | Passer a tap-to-vote (F2) |
| **Selection reponses** | Toutes les reponses passent au vote | Intervenant doit choisir 3-4 avant vote (F3) |
| **Module 2 budget** | Categories narratives | Remplacer par categories film : acteurs/decors/effets/musique/duree (F1) |
| **Modules M9-M13** | Code existe, curriculum non confirme | Confirmation attendue (R5) |
| **Emails** | 4 templates Resend prets | **Cle API vide** — aucun email ne part (F4) |
| **117 migrations** | Sequentielles, pas squashees | Risque d'incoherence schema — squash avant prod |

---

## 4. Ce qui bloque

**Blocages techniques :**
- Rien de techniquement bloquant — tout compile, les tests passent (sauf 1 mineur)

**Decisions en attente (cote Banlieuwood) :**
- DC1 : Polling vs Supabase Realtime — migrer pour Terrain 1 ou apres ?
- DC2 : 3 modes de cockpit — simplifier a 1 seul avant Terrain 1 ?
- DC3 : PostHog — configurer ou supprimer la dependance ?
- DC4 : Modules M9-M13 — curriculum officiel ou code independant ?

**Contenus ou specifications manquants :**
- Cle API Resend (emails)
- DSN Sentry (monitoring production)
- Contenu pedagogique confirme pour M9-M13

---

## 5. Ce qui est pret pour le terrain

**Pret :**
- Creation de session
- Jonction eleve (code + pseudo)
- Reponses (tous types : texte, vote, QCM, etc.)
- Systeme de vote en manches
- Ecran projete (mode spotlight, celebration)
- Carte talent M8

**Fonctionnel mais pas encore terrain :**
- Cockpit (fonctionne mais trop complexe — 3 modes, risque confusion intervenant)
- iPad Safari (fonctionne mais pas teste E2E)
- XP (fonctionne mais le leaderboard doit etre retire avant)

**Pas terrain :**
- Dashboard professeur (n'existe pas encore — juste les maquettes V2)
- Page recap eleve (/play/[id]/recap — a creer F6)
- Emails (pas de cle API)
- Profil OIE (doit etre retire)
- At-risk detection (doit etre desactivee)

---

## 6. Zones de risque

- **Cockpit surchage** : 82 fichiers, 21 129 lignes, 225 useState. Le plus gros composant (teacher-docks.tsx) fait 1 114 lignes. Risque de regression a chaque modification.
- **Polling sous charge** : 30 eleves en mode degrade = 180 req/min. Pas teste a cette charge.
- **iPad Safari** : cible principale sans aucun test E2E automatise. WebSocket tombe souvent en fallback polling.
- **Retrait OIE (R2)** : blast radius eleve — 2 tables SQL, 6 colonnes, 8+ fichiers TS, 1 API route, 1 composant radar, 1 section resultats, 1 fichier test. A faire avec soin.
- **117 migrations non squashees** : la plus ancienne a 6 mois. Risque de drift schema si on reset la DB en dev.

---

## 7. Etat des tests

| Type | Etat | Detail |
|---|---|---|
| Tests unitaires | 211 pass, 1 fail | Fail : nom de niveau XP "Cameraman" vs "Cadreur" (F7) |
| Tests E2E | 7 specs, Chromium uniquement | login, student-join, respond-vote, view-results, session-create |
| Coverage | > 60% statements, > 50% branches | Seuils CI respectes |
| Safari E2E | **Non teste** | Cible principale non couverte |

---

## 8. Services externes

| Service | Etat | Commentaire |
|---|---|---|
| Supabase (DB + Auth + RLS) | Operationnel | Projet `ohhrmgqebwziddcicxev`, PG 15.8 |
| Sentry (monitoring) | Configure, inactif en dev | DSN vide en local, source maps CI ok |
| Resend (emails) | **Non fonctionnel** | Cle API vide, 4 templates prets |
| Gemini (IA) | Operationnel | Generation scenes M6, suggestions |
| PostHog (analytics) | Non configure | Reference dans CSP mais pas installe |
| TMDB / Unsplash / Pollinations | References | Images dans next.config remote patterns |

---

## 9. Decisions attendues

| Question | Urgence | Bloquant ? |
|---|---|---|
| DC1 — Polling vs Realtime pour Terrain 1 | Moyenne | Non (polling fonctionne) mais perf a surveiller |
| DC2 — Simplifier cockpit a 1 mode | Haute | Oui — intervenant risque confusion avec 3 modes |
| DC3 — PostHog configurer ou retirer | Basse | Non |
| DC4 — Modules M9-M13 curriculum officiel ? | Haute | Oui — garde ou retrait du code |
| Cle API Resend | Moyenne | Oui pour onboarding/invitations |
| DSN Sentry | Basse | Non en dev, oui avant prod |

---

## 10. Statut des demandes du Cycle 1

| Demande | Statut | Commentaire |
|---|---|---|
| R1 — Leaderboard → suppression | ❌ Non traite | API + SessionState encore presents |
| R2 — Profil OIE → retrait complet | ❌ Non traite | 8+ fichiers a toucher, migration SQL |
| R3 — At-risk detection → desactive | ❌ Non traite | Widget + lib toujours actifs |
| R4 — Roles intervenant / professeur | 🟡 Partiellement | Auth en DB ok (migration 111), interface pas differenciee |
| R5 — Modules M9-M13 → contenu envoye | ❌ Non traite | En attente confirmation curriculum |
| F1 — Module 2 categories budget | ❌ Non traite | |
| F2 — Vote tap-to-vote | ❌ Non traite | |
| F3 — Selection manuelle reponses vote | ❌ Non traite | |
| F4 — Resend configure | ❌ Non traite | Cle API attendue |
| F5 — Animation revelation resultats | ❌ Non traite | |
| F6 — Page recap eleve | ❌ Non traite | |
| F7 — Test unitaire Cadreur/Cameraman | ❌ Non traite | Quick fix 2 min |

---

## 11. Tes priorites pour le prochain cycle

1. **R1 + R2 + R3** — Retrait leaderboard + OIE + at-risk (bloquant terrain)
2. **R4** — Differencier les interfaces intervenant/professeur
3. **F1 + F2 + F3** — Module 2 budget + tap-to-vote + selection reponses
4. **F4** — Configurer Resend (cle API a fournir)
5. **F7** — Fix test Cadreur/Cameraman
6. **Test iPad Safari** — Session de test reel avant terrain

---

## 12. Documents produits depuis le dernier cycle

> 15 documents strategiques et pedagogiques crees les 22-23 mars 2026. Ils ne modifient pas le code mais cadrent la vision produit et l'alignement institutionnel.

| Document | Usage |
|---|---|
| `VISION_BANLIEUWOOD_3_ANS.md` + `.pdf` | Vision strategique — 7 disciplines, modele eco, roadmap |
| `AUDIT_GLOBAL_PIVOT_V1.md` | Audit croise programmes Education Nationale x Banlieuwood |
| `SYNTHESE_PIVOT_COLLEGE_PRIMAIRE_V1.md` | Synthese programmes college/primaire |
| `SYNTHESE_PIVOT_LYCEE_V1.md` | Synthese programmes lycee |
| `SPEC_NIVEAUX_SPIRALAIRES.md` | 4 niveaux de profondeur par module (code-ready) |
| `SPEC_GRADIENT_GAMIFICATION.md` | Config gamification par niveau (TypeScript) |
| `MAPPING_INSTITUTIONNEL.md` | Socle commun, PEAC, CRCN, programmes |
| `FICHES_ENSEIGNANT.md` | Fiches par discipline x cycle |
| `FICHE_PARENT.md` | Communication parents + consentement RGPD |
| `PROTOCOLE_TOURNAGE.md` | Guide S9-S13 hors cockpit (papier/oral) |
| `GUIDE_INTERVENANT_PAR_NIVEAU.md` | Posture adaptee CM1 a Terminale |
| `AUDIT_COMPLET_PROJET_2026-03-23.md` | Cet audit complet |

---

*Rapport mis a jour le 23 mars 2026 — Banlieuwood — Pont developpeur Cycle 1*
