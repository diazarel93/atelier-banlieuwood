# Feuille de route active — Cycle 1

**Date :** 21 mars 2026
**Base :** Rapport état des lieux — commit `82d2444`
**Documents joints dans ce dossier :** voir section "Documents à lire"

---

## Avant de commencer

Merci pour le rapport — il est précis et exploitable.

Cette feuille de route contient deux types de demandes :
- **Priorité 1 — Recadrages** : fonctionnalités actives en contradiction avec la doctrine pédagogique Banlieuwood. À traiter avant tout test terrain.
- **Priorité 2 — Fonctionnel** : corrections et améliorations issues de ton rapport.

Pour les recadrages, les documents de doctrine sont joints dans ce dossier. Lire avant d'implémenter.

---

## Priorité 1 — Recadrages de conception

> Ces points ne sont pas des bugs — ce sont des décisions de conception à corriger avant le premier test en classe.

### R1 — Leaderboard → suppression complète

**Problème :** Le leaderboard classe les élèves les uns par rapport aux autres en temps réel. C'est en contradiction directe avec la doctrine Banlieuwood : la data élève ne sert pas à classer les élèves entre eux.

**Décision (21 mars 2026) :** Suppression complète pour Terrain 1.

**Demande :**
- **Supprimer** le leaderboard et toute interface de classement comparatif entre élèves.
- Ne pas le remplacer provisoirement par un autre système — pas de bricolage.
- L'XP individuel peut rester si il n'est pas comparatif.
- Cette question sera rouverte après Terrain 1 avec une vraie définition produit/pédagogique.

**Référence :** `docs/NOTE_DOCTRINE_DATA_ELEVE.md` — Section 0 et Section 7.

---

### R2 — Profil OIE → retrait complet

**Problème :** Le profil OIE (Originalité / Initiative / Exécution) n'existe dans aucun document Banlieuwood. Il n'a pas été commandé et n'est pas arrimé à la méthode.

**Décision (21 mars 2026) :** Retrait complet pour Terrain 1.

**Demande :**
- **Retirer le profil OIE** de toutes les interfaces (élève, enseignant, cockpit).
- Ne pas le remplacer provisoirement par une autre grille équivalente.
- Cette question sera rouverte après Terrain 1 uniquement si elle peut être rattachée à une logique validée dans la méthode Banlieuwood.

Pour information : Banlieuwood dispose de ses propres profils (M6 : Acteur / Créatif / Détective / Provocateur / Stratège) et affinités (M8 : 3 familles) — mais leur intégration dans l'outil n'est pas prévue pour Terrain 1.

**Référence :** `docs/NOTE_DOCTRINE_DATA_ELEVE.md` — Section 4.1.

---

### R3 — At-risk detection → désactiver

**Problème :** Le widget at-risk détecte automatiquement des élèves "à risque" à partir des données de participation. C'est du profilage prématuré — exactement ce que la doctrine interdit.

**Demande :**
- **Désactiver ce widget** avant tout déploiement terrain.
- À terme : une alerte simple "élève sans réponse depuis X minutes" dans le cockpit est acceptable — factuelle, visible uniquement pendant la séance, non stockée.

**Référence :** `docs/NOTE_DOCTRINE_DATA_ELEVE.md` — Section 7.

---

### R4 — Architecture des rôles : intervenant ≠ professeur

**Problème :** L'outil fusionne les deux rôles en un seul "facilitateur/enseignant". En réalité, Banlieuwood fonctionne avec deux acteurs distincts :

| Rôle | Qui | Accès |
|---|---|---|
| **Intervenant** | Animateur externe | Cockpit temps réel pendant la séance |
| **Professeur** | Enseignant de classe | Dashboard post-séance — tendances de groupe uniquement |

Ces deux interfaces ne sont pas la même chose et n'ont pas le même accès aux données.

**Demande :**
- Implémenter les deux rôles avec des accès différenciés.
- Pour Terrain 1 (F0, séance courte) : si les deux rôles sont tenus par la même personne, un seul compte peut suffire provisoirement — mais l'architecture doit les distinguer dès maintenant.

**Référence :** `docs/NOTE_DOCTRINE_DATA_ELEVE.md` — Sections 5 et 6. `docs/GUIDE_INTERVENANTS.md`.

---

### R5 — Modules M9 à M13 : clarification de la spec

**Problème :** Les modules M9 à M13 existent dans le code mais n'ont pas de curriculum officiel Banlieuwood documenté.

**Demande :**
- Pour chaque module (M9 Budget, M10 Et si…, M11 Ciné-débat, M12 Vote par manche, M13 Post-production) : nous envoyer le contenu pédagogique actuel (questions, activités, textes).
- Indiquer si ce contenu a été défini par Banlieuwood ou conçu indépendamment.

---

## Priorité 2 — Corrections fonctionnelles

| # | Demande | Priorité |
|---|---|---|
| F1 | **Module 2 (Budget)** — remplacer les catégories narratives par les catégories film : acteurs / décors / effets / musique / durée + réserve obligatoire 10 crédits | 🔴 Urgent |
| F2 | **Vote tap-to-vote** — remplacer radio buttons + confirmer par un tap direct | 🟠 Important |
| F3 | **Sélection manuelle des réponses pour le vote** — l'intervenant choisit 3-4 réponses parmi toutes avant le vote | 🟠 Important |
| F4 | **Configurer Resend** — les templates existent, la clé API est vide | 🟠 Important |
| F5 | **Animation révélation résultats** — séquence cinématique : noir 0.5s → fade → slide → barres animées | 🟡 À planifier |
| F6 | **Page récap élève** (`/play/[id]/recap`) — permettre de revoir les choix collectifs après la séance | 🟡 À planifier |
| F7 | **Test unitaire en échec** (Cadreur vs Cameraman) — renommer dans le test ou dans le code | 🟡 Quick fix |

---

## Points en attente de décision (côté Banlieuwood)

Ces points nécessitent une décision de notre part. On te revient dessus rapidement.

| # | Question |
|---|---|
| DC1 | Polling vs Supabase Realtime — migrer pour Terrain 1 ou après ? |
| DC2 | 3 modes de cockpit — simplifier à 1 seul avant Terrain 1 ? |
| DC3 | PostHog — à configurer ou supprimer la dépendance ? |

---

## Documents à lire pour les recadrages

Ces documents sont dans le dossier `docs/` joint :

| Document | Concerne |
|---|---|
| `NOTE_DOCTRINE_DATA_ELEVE.md` | R1 · R2 · R3 · R4 — à lire avant de toucher aux interfaces analytics |
| `GUIDE_INTERVENANTS.md` | R4 — rôle et posture de l'intervenant, distinction avec le professeur |

---

*Banlieuwood — Feuille de route développeur — Cycle 1 — 21 mars 2026*
