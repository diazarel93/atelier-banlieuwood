# Feuille de route active — Cycle 2

**Date :** 23 mars 2026
**Base :** Rapport état des lieux reçu le 23 mars 2026 — commit `ce29e47`
**Documents joints dans ce dossier :** voir section "Documents à lire"

---

## Contexte de ce cycle

Rapport reçu — précis et honnête, merci.

Bilan Cycle 1 : aucune des demandes R1–R5 / F1–F7 n'a été traitée. Tu as produit 15 documents stratégiques entre-temps — c'est utile côté vision, mais ça ne débloque pas le terrain. Ce cycle reprend donc **l'intégralité des demandes Cycle 1**, plus quelques ajouts.

Deux bonnes nouvelles dans ton rapport :
- Le flux principal fonctionne bout en bout (session → jonction → réponses → vote → résultats)
- R4 (rôles) est partiellement avancé en base de données (migration 111)

---

## Réponses aux questions DC que tu avais posées

Avant de commencer, voici nos décisions sur les points en attente :

| # | Ta question | Notre décision |
|---|---|---|
| DC1 | Polling vs Supabase Realtime pour Terrain 1 ? | **Garder le polling.** Ne pas migrer ce cycle — ça fonctionne pour un terrain limité. On planifiera Realtime après Terrain 1. |
| DC2 | Simplifier le cockpit à 1 seul mode avant Terrain 1 ? | **Oui — simplifier à 1 mode avant Terrain 1.** Un intervenant débutant avec 3 modes = risque terrain. Détail dans R4 ci-dessous. |
| DC3 | PostHog — configurer ou supprimer ? | **Supprimer la dépendance** — pas de tracking analytics externe pour l'instant. |
| DC4 | Modules M9–M13 — curriculum officiel ou code indépendant ? | **En attente de notre part.** Ne pas toucher ces modules ce cycle. Laisser le code en place, non activé par défaut côté interface. On te confirme avant la fin du cycle. |

---

## Priorité 1 — Recadrages de conception (bloquants terrain)

> Ces trois points bloquent tout test en classe. À traiter en premier, dans cet ordre.

### R1 — Leaderboard → suppression complète

**Décision (21 mars 2026, confirmée) :** Suppression complète.

**Demande :**
- Supprimer le leaderboard et toute interface de classement comparatif entre élèves.
- L'XP individuel peut rester — s'il n'est pas comparatif et non affiché entre élèves.
- Aucun remplacement provisoire.

**Référence :** `docs/NOTE_DOCTRINE_DATA_ELEVE.md` — Sections 0 et 7.

---

### R3 — At-risk detection → désactiver

**Demande :**
- Désactiver le widget at-risk avant tout déploiement terrain.
- Supprimer ou commenter la logique de scoring (3 critères, 95 lignes).

**Référence :** `docs/NOTE_DOCTRINE_DATA_ELEVE.md` — Section 7.

---

### R2 — Profil OIE → retrait complet

**Décision (21 mars 2026, confirmée) :** Retrait complet.

**Demande :**
- Retirer le profil OIE de toutes les interfaces (élève, enseignant, cockpit).
- Attention au blast radius : 2 tables SQL, 6 colonnes, 8+ fichiers TS, 1 API route, 1 composant radar, 1 section résultats, 1 fichier test. À faire soigneusement, après R1 et R3.
- Migration SQL nécessaire pour supprimer les tables.
- Aucun remplacement provisoire.

**Référence :** `docs/NOTE_DOCTRINE_DATA_ELEVE.md` — Section 4.1.

---

## Priorité 2 — Architecture

### R4 — Cockpit : simplification + différenciation des rôles

**État actuel (d'après ton rapport) :** Auth distingue intervenant/professeur en DB (migration 111). Interface cockpit pas encore différenciée. 3 modes toujours actifs.

**Demande — deux chantiers liés :**

**2a — Simplifier le cockpit à 1 seul mode**
- Choisir 1 seul mode d'affichage parmi les 3 existants (standard / focus / commande).
- Supprimer les 2 autres modes.
- Objectif : réduire les 225 useState, splitter teacher-docks.tsx (1 114 lignes) en composants plus petits.

**Quel mode garder ?** Notre priorité terrain est lisibilité pour un intervenant débutant. Le mode le plus simple et le plus clair — pas le plus riche.

**2b — Différencier les interfaces intervenant / professeur**

| Rôle | Qui | Accès attendu |
|---|---|---|
| **Intervenant** | Animateur externe | Cockpit temps réel — piloter la séance |
| **Professeur** | Enseignant de classe | Dashboard post-séance — tendances de groupe uniquement, pas de data individuelle nominative |

- Pour Terrain 1 : si les deux rôles sont tenus par la même personne, un seul compte peut suffire provisoirement.
- L'architecture doit malgré tout distinguer les droits d'accès dès maintenant.

**Référence :** `docs/NOTE_DOCTRINE_DATA_ELEVE.md` — Sections 5 et 6. `docs/GUIDE_INTERVENANTS.md`.

---

### R5 — Modules M9–M13 : en attente

**État :** ❌ En attente de notre confirmation curriculum.

**Ce qu'on te demande pour ce cycle :**
- Nous envoyer le contenu actuel de chaque module (M9 à M13) : questions, activités, textes — tel qu'implémenté.
- Indiquer si ce contenu a été défini par nous ou conçu indépendamment.

On te confirme la décision de garder / retirer avant la fin du cycle.

---

## Priorité 3 — Corrections fonctionnelles

| # | Demande | Priorité | État |
|---|---|---|---|
| F7 | **Test unitaire en échec** — renommer "Cadreur" → "Cameraman" dans le test ou dans le code source (le renommage doit être cohérent partout) | 🔴 Quick fix | ❌ Non traité |
| DC3 | **Supprimer la dépendance PostHog** — retirer de la config CSP et des imports | 🔴 Quick fix | ❌ Non traité |
| F1 | **Module 2 (Budget)** — remplacer les catégories narratives par les catégories film : acteurs / décors / effets / musique / durée + réserve obligatoire 10 crédits | 🟠 Important | ❌ Non traité |
| F2 | **Vote tap-to-vote** — remplacer radio buttons + confirmer par un tap direct | 🟠 Important | ❌ Non traité |
| F3 | **Sélection manuelle des réponses pour le vote** — l'intervenant choisit 3–4 réponses parmi toutes avant le vote | 🟠 Important | ❌ Non traité |
| F4 | **Configurer Resend** — les templates existent, la clé API est vide. On te transmet la clé séparément (hors document). | 🟠 Important | ❌ Non traité |
| F5 | **Animation révélation résultats** — séquence cinématique : noir 0.5s → fade → slide → barres animées | 🟡 À planifier | ❌ Non traité |
| F6 | **Page récap élève** (`/play/[id]/recap`) — permettre de revoir les choix collectifs après la séance | 🟡 À planifier | ❌ Non traité |

---

## Priorité 4 — Nouvelle demande

### D11 — Retour intervenant post-session

**Contexte :** L'outil capture bien les données élèves pendant la séance. Ce qu'il ne capte pas : l'observation de l'intervenant — ce qui s'est passé en salle, les signaux faibles, les dynamiques de groupe.

**Demande :** Implémenter un écran post-session de retour intervenant, accessible après la clôture d'une séance.

**Contraintes :**
- Post-session, non bloquant, optionnel
- 4 questions fermées + 1 champ texte libre optionnel
- Mobile-first, 2 minutes maximum de remplissage
- Données non tracées nominativement (conformes à la doctrine data élève)

**Schéma BDD V1 :** disponible dans `02_pédagogie/OBSERVATION_TERRAIN_INTERVENANT_BANLIEUWOOD.docx` — Partie 5.

---

## Ordre d'exécution conseillé

Si tu devais prioriser ce cycle dans le temps :

1. **F7 + DC3** — quick fixes, aucun risque, CI repassera au vert
2. **R1 + R3** — blast radius faible, bloquants terrain
3. **R2** — blast radius élevé, à faire séparément avec soin
4. **R4 (2a)** — simplification cockpit
5. **R4 (2b)** — différenciation des rôles interface
6. **F1 + F2 + F3** — cœur fonctionnel terrain
7. **D11** — retour intervenant (si R1/R2/R3 bouclés)
8. **R5** — attente de notre confirmation curriculum

F4 (Resend), F5, F6 : selon la bandwidth restante.

---

## Ce qu'on te fournit nous-mêmes

| Élément | Statut |
|---|---|
| Clé API Resend | ⏳ À transmettre séparément |
| Curriculum M9–M13 (décision) | ⏳ À transmettre avant fin de cycle |
| DSN Sentry | Basse priorité — pas bloquant en dev |

---

## Documents à lire

| Document | Concerne |
|---|---|
| `docs/NOTE_DOCTRINE_DATA_ELEVE.md` | R1 · R2 · R3 · R4 — à lire avant de toucher aux interfaces analytics |
| `docs/GUIDE_INTERVENANTS.md` | R4 — rôle et posture de l'intervenant, distinction avec le professeur |

---

*Banlieuwood — Feuille de route développeur — Cycle 2 — 23 mars 2026*
