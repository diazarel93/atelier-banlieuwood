# Rapport d'état des lieux — Atelier Banlieuwood

**Date :** 21 mars 2026
**Auteur :** Audit automatisé (Claude)
**Objectif :** Document de transmission — état réel du projet

---

# 1. Vue d'ensemble

## Description

**Atelier Banlieuwood** est une plateforme web éducative destinée à l'enseignement du cinéma et de l'écriture créative dans les classes françaises (primaire, collège, lycée). L'outil permet à un enseignant (appelé "facilitateur") de piloter en temps réel des ateliers interactifs où les élèves participent depuis leurs tablettes ou téléphones.

Le produit repose sur un curriculum de **13 modules** (observation, scénario, pitch, découpage, tournage, etc.) que les élèves traversent collectivement, module par module, séance par séance.

## Finalité

Remplacer les ateliers cinéma papier/oral par un outil numérique interactif qui :
- Structure le parcours pédagogique
- Collecte les réponses des élèves en temps réel
- Permet le vote collectif et la prise de décision de groupe
- Gamifie l'expérience élève (XP, achievements, leaderboard)
- Fournit à l'enseignant un cockpit de pilotage avec analytics

## État global

Le projet est **fonctionnel dans son flux principal** : un enseignant peut créer une séance, les élèves peuvent la rejoindre via un code, répondre aux questions, voter, et voir les résultats. Le cockpit enseignant affiche les réponses en temps réel.

Cependant, le produit est encore **en cours de stabilisation**. La V2 du dashboard est en place mais coexiste avec des redirections depuis la V1. Plusieurs modules ont un contenu complet mais certains comportements spécifiques par module ne sont pas tous finalisés. La base de code est conséquente (592 fichiers source) et a accumulé de la complexité liée aux itérations rapides sur le cockpit enseignant.

## Niveau de maturité

**Prototype avancé / Version testable en interne**

L'outil est utilisable en conditions réelles pour des tests internes, mais n'est pas encore stabilisé pour un déploiement terrain régulier. Des bugs de compatibilité (notamment iPad Safari) ont été corrigés récemment, ce qui indique que des tests terrain ont déjà eu lieu ou sont en préparation.

---

# 2. Architecture actuelle

## Stack technique

| Couche | Technologie | Version |
|--------|------------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| Frontend | React | 19.2.3 |
| Langage | TypeScript | 5.x (strict mode) |
| Style | Tailwind CSS | 4.x |
| Composants UI | shadcn/ui + Radix UI | — |
| Base de données | Supabase (PostgreSQL) | Cloud |
| Auth | Supabase Auth (JWT) | — |
| Data fetching | TanStack React Query | 5.x |
| Validation | Zod | 4.x |
| Animation | Motion (Framer Motion) | 12.x |
| i18n | next-intl | 4.x |
| Monitoring | Sentry | 10.x |
| Email | Resend | 6.x |
| IA | Google Gemini API | — |
| Tests unitaires | Vitest | 4.x |
| Tests E2E | Playwright | 1.58 |

## Structure du projet

```
src/
├── app/              # Routes Next.js (pages + API)
│   ├── (cockpit-v2)/ # Dashboard V2 enseignant
│   ├── (auth)/       # Pages d'authentification
│   ├── (public)/     # Pages publiques
│   ├── play/[id]/    # Interface élève
│   ├── api/          # 105 fichiers de routes API
│   └── ...
├── components/       # 293 composants React
│   ├── pilot/        # Cockpit enseignant (~100 fichiers)
│   ├── play/         # Interface élève (~80 fichiers)
│   ├── v2/           # Dashboard V2 (~100 fichiers)
│   ├── screen/       # Écran de projection (~20 fichiers)
│   └── ui/           # Primitives UI (15 fichiers)
├── hooks/            # 32 hooks React custom
├── lib/              # 65 fichiers utilitaires / logique métier
└── middleware.ts      # Protection des routes
```

## Front-end

- **293 composants React** organisés par rôle utilisateur (pilot, play, v2, screen)
- Trois interfaces distinctes :
  1. **Cockpit enseignant** (`/v2` + `/session/[id]/pilot`) — gestion en temps réel
  2. **Interface élève** (`/play/[id]`) — jeu interactif gamifié
  3. **Écran de projection** (`/session/[id]/screen`) — affichage classe
- PWA avec service worker pour support offline
- Support i18n (FR/EN) via next-intl

## Back-end

- **105 routes API** Next.js (Server-side)
- Pas de serveur séparé — tout est dans Next.js
- Auth via Supabase JWT + middleware de protection
- Rate limiting implémenté
- Validation des inputs via Zod
- Logging et audit trail

## Base de données

- **Supabase PostgreSQL** hébergé en cloud
- **117 fichiers de migration SQL** (5 847 lignes)
- Tables principales : sessions, students, responses, votes, collective_choices, modules, achievements, student_profiles, talent_profiles
- Row Level Security (RLS) activé
- Soft-delete sur les sessions
- Realtime activé côté Supabase (mais non utilisé côté client — voir section fragilité)

## Hébergement

- **Aucune configuration de déploiement trouvée** (pas de vercel.json, Dockerfile, ou netlify.toml)
- Très probablement déployé sur **Vercel** (standard pour Next.js)
- Base de données sur **Supabase Cloud**
- Pipeline CI/CD GitHub Actions (lint, type-check, build, tests, E2E)

## Services externes

| Service | Usage | État |
|---------|-------|------|
| Supabase | BDD + Auth + Realtime | Configuré et actif |
| Google Gemini | IA (analyse, suggestions) | Clé API configurée |
| Resend | Emails transactionnels | Clé API **vide** (non configuré) |
| Sentry | Monitoring d'erreurs | Configuré (prod only) |
| PostHog | Analytics | Clé **vide** (non configuré) |
| DiceBear | Avatars générés | Actif |
| Pollinations AI | Images IA | Référencé dans la config |

---

# 3. Fonctionnalités déjà réalisées

## 3.1 Authentification et gestion des comptes

| Aspect | État | Détails |
|--------|------|---------|
| Login/signup facilitateur | **Terminé** | Via Supabase Auth |
| Rôles (admin, intervenant, client) | **Terminé** | 3 rôles avec permissions différenciées |
| Statuts de compte (pending, active, rejected, deactivated) | **Terminé** | Workflow de validation admin |
| Emails de bienvenue/validation/rejet | **Templates créés** | Templates Resend présents mais **clé API vide** — non fonctionnel en l'état |
| Middleware de protection des routes | **Terminé** | Vérifié et fonctionnel |
| Multi-rôle auth | **Terminé** | Migration 111 dédiée |

## 3.2 Gestion des séances

| Aspect | État | Détails |
|--------|------|---------|
| Création de séance | **Terminé** | Wizard de création avec choix de module, niveau, thématique |
| Liste des séances | **Terminé** | Filtrage, pagination, archivage |
| Code de jointure (6 caractères) | **Terminé** | Génération automatique |
| QR code pour rejoindre | **Terminé** | Via qrcode.react |
| Duplication de séance | **Terminé** | API dédiée |
| Archivage (soft-delete) | **Terminé** | Via champ deleted_at |
| Labels de classe | **Terminé** | Catégorisation des séances |
| Notes enseignant | **Terminé** | Ajouté récemment (migration 117) |

## 3.3 Interface élève (Play)

| Aspect | État | Détails |
|--------|------|---------|
| Rejoindre une séance | **Terminé** | Code 6 chars + pseudo + emoji avatar |
| Machine à états du jeu | **Terminé** | 8 états : waiting, situation, sent, relance, vote, result, paused, done |
| Répondre aux questions | **Terminé** | Saisie texte avec soumission |
| Voter | **Terminé** | Fonctionnel mais UX à revoir (boutons radio au lieu de tap-to-vote) |
| Système XP | **Terminé** | XP par réponse/vote, niveaux, barre de progression |
| Leaderboard | **Terminé** | Mini-leaderboard en temps réel |
| Achievements | **Terminé** | 50+ achievements définis, checker automatique |
| Support offline | **Terminé** | File d'attente localStorage, sync au retour en ligne |
| Reconnexion élève | **Terminé** | Via localStorage |
| Onboarding | **Terminé** | 3 slides pour premier usage |
| Effet machine à écrire | **Terminé** | Avec son procédural (Web Audio) — mais vitesse à ajuster |

**Modules élève implémentés :**
- M1 : Positionnement (8 questions diagnostic), questions images, carnet
- M2 : Checklist, scene builder
- M3 : Choix collectifs (personnage, liens, environnement, conflit, trajectoire)
- M6 : Assemblage de scénario, frise narrative, missions
- M7 : Galerie de types de plans, quiz comparatif, builder de découpage
- M8 : Picker de rôles, quiz métiers, récap équipe
- M9 : Budget (allocation de crédits)
- M10 : Écriture "Et si", pitch, avatar builder, cartes personnage
- M11 : Ciné-débat
- M12 : Vote par manche
- M13 : Post-production

**Important :** Chaque module a son composant côté élève ET côté cockpit. L'implémentation est présente mais le degré de finition varie selon les modules. Les modules 1-3 et 10 semblent les plus aboutis. Certains modules (4, 5) ne semblent avoir que des composants de base.

## 3.4 Cockpit enseignant (Pilot)

| Aspect | État | Détails |
|--------|------|---------|
| Tableau de bord temps réel | **Terminé** | Réponses, étudiants, votes visibles en direct |
| Navigation par module/question | **Terminé** | Phase stepper |
| Modération des réponses | **Terminé** | Masquer/afficher, commenter, scorer |
| Sélection pour vote | **Partiellement terminé** | Existe mais pas de sélection manuelle (toutes les réponses vont au vote) |
| Timer | **Terminé** | Chronomètre avec timer_ends_at |
| Gestion des étudiants | **Terminé** | Kick, avertissement (3 = auto-kick), main levée |
| Plan de classe | **Terminé récemment** | Layout réaliste de classe française avec paires de bureaux |
| Broadcast message | **Terminé** | Envoi de message à toute la classe |
| Mode focus | **Terminé** | Interface minimale "Apple EdTech" |
| Mode commande | **Terminé** | Layout 3 colonnes avancé |
| Fiche élève (slide-over) | **Terminé** | Clic sur un nom pour voir le détail |
| Dark mode | **Terminé** | Toggle dans le cockpit |
| Raccourcis clavier | **Terminé** | F = fullscreen, + d'autres |
| Fullscreen | **Terminé** | Bouton + raccourci F |
| Panel IA | **Terminé** | Suggestions IA (via Gemini) |
| Reformulation inline | **Terminé** | IA pour améliorer le texte |
| Session replay | **Prototype** | Rejeu des événements — état incertain |

**État réel du cockpit :** Le cockpit est la partie qui a reçu le plus d'itérations. Il existe en **3 modes** (standard, focus, commande) ce qui crée de la complexité. Les 30 derniers commits sont quasi-exclusivement dédiés au cockpit. La documentation interne signale : "57 useState, 19 modales, 11 useEffect, 41+ composants importés" — signe d'accumulation de complexité.

## 3.5 Écran de projection

| Aspect | État | Détails |
|--------|------|---------|
| Affichage de la question courante | **Terminé** | Grand format projeté |
| Nuage de mots | **Terminé** | Fréquence des réponses |
| Mode spotlight | **Terminé** | Mise en avant d'une réponse |
| Animations | **Terminé** | Transitions, gradients ambiants |
| Applause meter | **Terminé** | Jauge d'engagement |
| Réactions flottantes | **Terminé** | Emojis animés |
| Célébration (confetti) | **Terminé** | Canvas confetti |
| Reveal mode | **Terminé** | Révélation progressive |

## 3.6 Dashboard V2

| Aspect | État | Détails |
|--------|------|---------|
| Shell d'application | **Terminé** | Layout avec navigation |
| Liste des séances | **Terminé** | Cards, filtres, création |
| Page de détail séance | **Terminé** | Hero, QR, objectifs, progression, checklist |
| Page de résultats | **Terminé** | Synthèse, compétences, réponses notables, insights IA |
| Profils étudiants | **Terminé** | Hero, progression, achievements, historique, portfolio |
| KPI rapides | **Terminé** | Stats en cartes |
| Calendrier | **Terminé** | Mini-calendrier + sidebar |
| Recherche globale | **Terminé** | Command palette |
| Comparaison inter-classes | **Terminé** | Graphiques comparatifs |
| Détection d'élèves à risque | **Terminé** | Widget at-risk |
| Timeline facilitateur | **Terminé** | Fil d'activité |

## 3.7 Analytics et IA

| Aspect | État | Détails |
|--------|------|---------|
| Question analytics | **Terminé** | Stats par question |
| Notable responses | **Terminé** | Détection des réponses remarquables |
| Class comparison | **Terminé** | Comparaison entre classes |
| Évolution des étudiants | **Terminé** | Suivi de progression |
| Profil OIE (Originalité, Initiative, Exécution) | **Terminé** | Scoring créatif |
| Suggestions IA (Gemini) | **Terminé** | Panel dans le cockpit |
| Analyse inter-séances (Claude) | **Mentionné dans la doc** | Pas d'implémentation visible côté Claude API |

## 3.8 Tests

| Type | État | Détails |
|------|------|---------|
| Tests unitaires (Vitest) | **211 pass, 1 fail** | 17 fichiers de test. Le test en échec est un nom de niveau XP ("Cameraman" vs "Cadreur" attendu) — probablement un renommage non répercuté dans les tests |
| Tests E2E (Playwright) | **Présents** | 7 specs : login, student join, vote, results, session creation |
| Tests de charge | **Présents** | 2 scripts (burst de réponses, polling de situations) |
| Seuils de couverture | **Configurés** | 60% statements, 50% branches, 55% functions, 60% lines |
| CI/CD | **Terminé** | GitHub Actions : lint + typecheck + build + tests + E2E |

---

# 4. Parcours utilisateur actuel

## 4.1 Parcours enseignant

1. **Login** → L'enseignant se connecte via email/mot de passe (Supabase Auth)
2. **Dashboard V2** → Il voit la liste de ses séances, des stats rapides, un calendrier
3. **Créer une séance** → Wizard de création : choix du module, du niveau (primaire/collège/lycée), de la thématique, du label de classe
4. **Page de préparation** → Il voit le code de jointure, le QR code, les objectifs pédagogiques, une checklist pré-séance
5. **Lancer la séance** → Il passe en mode Cockpit (pilot)
6. **Cockpit en direct** → Il voit :
   - La question courante affichée aux élèves
   - Le flux des réponses en temps réel
   - La liste des élèves connectés (avec main levée, statut)
   - Le plan de classe (disposition réaliste des bureaux)
   - Le timer
   - Les contrôles : avancer, pause, broadcast, spotlight
7. **Modération** → Il peut masquer des réponses, les commenter, les scorer
8. **Phase de vote** → Il passe en mode vote, les élèves votent
9. **Résultats** → Il affiche les résultats, peut projeter sur l'écran
10. **Avancer** → Il passe à la question/module suivant
11. **Fin de séance** → Il voit les résultats agrégés, analytics, réponses notables

**Ce qui ne fonctionne pas encore dans ce parcours :**
- La sélection manuelle des réponses pour le vote (toutes y vont)
- Le undo/retour en arrière entre questions
- Le skip de question
- La reformulation du choix collectif validé
- Les emails ne partent pas (clé Resend vide)

## 4.2 Parcours élève

1. **Rejoindre** → L'élève accède à `/join`, saisit le code 6 caractères
2. **Profil** → Il choisit un pseudo et un emoji comme avatar
3. **Onboarding** → 3 slides d'introduction (premier usage)
4. **Attente** → Il voit l'écran d'attente jusqu'à ce que l'enseignant lance
5. **Question** → La question s'affiche avec un effet machine à écrire + son
6. **Réponse** → Il tape sa réponse et l'envoie
7. **Confirmation** → Écran "envoyé" avec animation
8. **Relance** (optionnel) → L'enseignant peut envoyer un nudge
9. **Vote** → L'élève vote parmi les réponses sélectionnées (boutons radio + confirmation)
10. **Résultat** → Le choix collectif s'affiche
11. **XP** → Il gagne des XP, voit sa progression, le leaderboard
12. **Boucle** → Retour à l'étape 5 pour la question suivante
13. **Fin** → Écran de fin de séance

**Ce qui ne fonctionne pas encore dans ce parcours :**
- Le vote par tap direct (actuellement boutons radio + bouton confirmer)
- La vitesse de la machine à écrire est par lettre (35ms) au lieu de par mot (30ms)
- L'animation de révélation des résultats est instantanée (devrait être une séquence cinématique)
- Pas de page récap (`/play/[id]/recap`) accessible après la séance

## 4.3 Écran de projection

L'enseignant projette `/session/[id]/screen` sur le vidéoprojecteur de la classe.
- Affiche la question en grand
- Nuage de mots des réponses
- Résultats de vote avec barres animées
- Mode spotlight pour mettre en avant une réponse
- Effets visuels (gradients, confetti, réactions)

Ce parcours est **fonctionnel** mais dépend du polling (pas de WebSocket) pour la mise à jour.

---

# 5. Parties encore manquantes

## Fonctionnalités absentes

- **Sélection manuelle des réponses pour le vote** — L'enseignant ne peut pas choisir quelles réponses vont au vote
- **Undo / retour en arrière** — Pas de possibilité de revenir à la question précédente (hook `use-undo-stack.ts` existe mais intégration incertaine)
- **Skip de question** — L'enseignant ne peut pas sauter une situation
- **Page récap élève** — `/play/[id]/recap` n'existe pas
- **Analyse inter-séances par IA (Claude)** — Mentionné dans la doc mais pas implémenté
- **Export PDF** — La lib jspdf est installée mais l'export PDF complet n'est pas confirmé comme fonctionnel partout
- **Page légale (RGPD)** — Route `/legal` peut exister mais contenu non vérifié
- **Cron de nettoyage 6 mois** — Non implémenté
- **Récap en cours de route** — Un élève qui rejoint en milieu de séance ne voit pas ce qu'il a manqué

## Blocs incomplets

- **Module 2 (budget)** — Les catégories sont des catégories narratives (personnage, liens, environnement) alors qu'elles devraient être des catégories de production film (acteurs, décors, effets, musique, durée + réserve obligatoire de 10 crédits)
- **Modules 4 et 5** — Semblent avoir une implémentation minimale comparée aux autres
- **Emails transactionnels** — Templates créés mais service non branché (clé API Resend vide)
- **PostHog analytics** — Dépendance installée mais pas configuré (clé vide)

## Automatisations non branchées

- **Supabase Realtime** — Activé côté serveur mais le client utilise du polling (10-60s) au lieu de WebSockets. Le hook `use-realtime-invalidation.ts` existe mais ne fait que du polling adaptatif.
- **Haptic feedback** — Mentionné comme souhaité, non implémenté
- **Nudge automatique** — Prévu pour les élèves qui ne répondent pas, non automatisé

## Interfaces non finalisées

- **Le vote** — UX à refaire (tap-to-vote au lieu de radio + bouton)
- **Animation de révélation** — Devrait être une séquence cinématique (noir 0.5s → fade → slide → barres animées), actuellement instantanée
- **Emojis dans l'UI** — La doc interne dit "ZÉRO emoji sauf avatars, utiliser des SVG icons" — mais des emojis sont encore présents dans l'interface

---

# 6. Inter-séances / logique métier / automatisation

## Ce qui est implémenté entre les séances

- **Profils étudiants cross-sessions** — Le champ `profile_id` permet de suivre un même élève d'une séance à l'autre. Le système de profils V2 est en place.
- **Progression et achievements** — L'XP et les achievements sont cumulés au niveau du profil
- **Profil OIE** (Originalité, Initiative, Exécution) — Scoring créatif calculé
- **Dashboard analytics** — L'enseignant peut voir l'évolution d'une classe ou d'un élève sur plusieurs séances
- **Comparaison inter-classes** — API et composant fonctionnels
- **Détection d'élèves à risque** — Algorithme de scoring en place

## Ce qui est manuel

- **Passage d'un module à l'autre** — Entièrement contrôlé par l'enseignant
- **Modération des réponses** — L'enseignant cache/montre manuellement
- **Scoring des réponses** — L'enseignant score manuellement (0-10)
- **Notes sur les élèves** — Ajout manuel de notes par l'enseignant

## Ce qui est semi-automatique

- **Suggestions IA** — Le panel IA (Gemini) propose des suggestions, mais l'enseignant décide de les utiliser ou non
- **Scoring IA** — Le champ `ai_score` existe sur les réponses, le scoring IA peut être déclenché en batch via l'API `/evaluate`
- **Détection notable responses** — Algorithmique mais l'enseignant les consulte manuellement

## Ce qui devrait être automatisé plus tard

- **Analyse Claude inter-séances** — Prévu dans la doc : analyse des tendances, forces, recommandations entre les séances. Non implémenté.
- **Nudge automatique** — Relancer automatiquement les élèves inactifs
- **Résumé auto de budget** — Module 2 : texte de synthèse auto-généré à partir des allocations
- **Nettoyage des données** — Cron job de suppression des données > 6 mois

## Décisions de conception en attente

- **Faut-il passer de polling à Supabase Realtime (WebSockets) ?** — Le polling fonctionne mais ajoute de la latence (10-60s). Realtime est prêt côté serveur.
- **Que faire des modules 4 et 5 ?** — Leur niveau de finition est inférieur aux autres
- **L'IA Gemini est-elle le bon choix long terme ?** — Claude est mentionné dans la doc pour l'analyse, Gemini est branché en pratique

---

# 7. Contenu / données / ressources

## Contenu intégré

- **Définitions des 13 modules** — Complet (modules-data.ts : 13 modules × 5 séances = 65 activités)
- **Situations/questions** — Présentes pour les 3 niveaux d'âge (primaire, collège, lycée)
- **Cinema facts** — ~100 faits cinéma intégrés
- **Cinema tips** — ~50 conseils cinéma
- **Coach tips** — ~100 messages de coaching
- **Introductions de séance** — Textes d'intro par module
- **Achievements** — 50+ achievements définis avec conditions
- **Talent profiles** — Profils de rôles créatifs définis
- **XP levels** — Barème de niveaux défini (le nom du niveau 3 a changé — "Cameraman" au lieu de "Cadreur" — test en échec)
- **Avatars DiceBear** — Générés dynamiquement
- **Trivia bonus** — Questions de culture cinéma

## Contenu à produire / injecter

- **Module 2 : nouvelles catégories de budget** — Les catégories film (acteurs 5/15/40 crédits, décors 0/10/30, etc.) doivent remplacer les catégories narratives actuelles
- **Documentation pédagogique modules 9-13** — La doc dans `/docs/pedagogie/` couvre les modules 1-8. Les modules 9-13 existent en code mais leur documentation pédagogique formelle semble incomplète.
- **Page légale** — Contenu RGPD / mentions légales
- **Traductions anglaises complètes** — Le fichier `en.json` existe mais son exhaustivité n'est pas confirmée

## Images et assets

- **Images de modules** — Présentes dans `public/images/` (cinema, etsi, module1, plans)
- **Icônes** — Lucide-react (bibliothèque d'icônes SVG)
- **Pas de vidéos volumineuses** — Le dossier `public/videos/` existe mais son contenu n'est pas vérifié
- **Manifest PWA** — En place

## Bloqué par manque de contenu

- Rien de critique n'est bloqué par du contenu manquant. Le principal blocage est fonctionnel (module 2 à refaire) et non lié à du contenu absent.

---

# 8. Points de fragilité / zones de risque

## Dette technique

### Complexité du cockpit
C'est le point le plus fragile. La documentation interne le dit explicitement : **57 useState, 19 modales, 11 useEffect, 41+ composants importés** dans le cockpit. Trois modes d'affichage coexistent (standard, focus, commande). Les 30 derniers commits sont presque exclusivement du travail sur le cockpit, avec des allers-retours sur le positionnement du plan de classe (sidebar → bottom sheet → header → main scroll → full-width center). Cela indique une instabilité dans la conception de cette interface.

### Polling au lieu de Realtime
Le système utilise du polling HTTP (10-60s) pour la synchronisation temps réel. Supabase Realtime est activé côté serveur mais **jamais utilisé côté client**. Le hook `use-realtime-invalidation.ts` ne fait que du polling adaptatif — le nom est trompeur. Avec 30 élèves qui pollent toutes les 10 secondes, ça représente ~180 requêtes/minute. Ça fonctionne mais c'est sous-optimal et pourrait poser des problèmes d'échelle.

### Coexistence V1/V2
Les redirections V1→V2 sont en place (`/dashboard` → `/v2`), mais du code V1 peut encore traîner. Le route group `(dashboard)` coexiste avec `(cockpit-v2)`.

### iPad Safari
Les 5 commits les plus anciens parmi les 30 derniers sont des correctifs iPad Safari (crypto.randomUUID, replaceAll, WebSocket crash, localStorage guards, error boundaries). Cela montre que **iPad Safari est un environnement fragile** pour cette app, et c'est probablement le device principal en classe.

## Logique bricolée

- **Le vote** — Le mécanisme est fonctionnel mais l'UX (radio buttons + confirmer) ne correspond pas à la cible (tap-to-vote instantané). C'est un prototype qui tient.
- **Module 2** — Les catégories de budget ne correspondent pas à la spec. C'est codé mais avec les mauvaises données.
- **3 modes de cockpit** — Le fait d'avoir 3 layouts (standard, focus, commande) pour la même fonctionnalité crée de la surface de maintenance.

## Hypothèses non validées

- **Performance à 30 élèves simultanés** — Les tests de charge existent mais leur résultat n'est pas documenté
- **Fiabilité offline** — Le queue offline est implémenté (50 items, 30min TTL) mais son comportement en conditions réseau dégradées réelles (école) n'est pas confirmé
- **Compatibilité navigateurs** — iPad Safari a nécessité des correctifs majeurs. Pas de visibilité sur Android/Chrome/Firefox en contexte scolaire

## Le produit semble plus avancé qu'il ne l'est

- **Le dashboard V2 avec analytics** fait très professionnel mais repose sur du polling et pas sur du streaming temps réel
- **Les 293 composants** impressionnent en nombre mais certains sont des variantes (3 modes de cockpit = 3× les composants)
- **Les 117 migrations SQL** montrent une base de données riche mais aussi une évolution très itérative (corrections, ajouts, renommages) qui pourrait contenir des incohérences
- **Les profils OIE, les talent profiles, les at-risk detection** sont implémentés côté code mais leur valeur pédagogique réelle dépend de données suffisantes (plusieurs séances d'un même groupe)

---

# 9. Alignement avec l'objectif produit

## Rappel de l'objectif

Permettre à un enseignant de piloter des ateliers cinéma interactifs en classe, avec une expérience élève engageante de type Kahoot/Duolingo, et un suivi pédagogique de qualité.

## Ce qui est bien orienté

- **Le flux principal fonctionne** : créer une séance → élèves rejoignent → répondent → votent → résultats. C'est le coeur du produit et il est en place.
- **L'expérience élève gamifiée** (XP, achievements, leaderboard) va dans la bonne direction pour l'engagement.
- **Le curriculum de 13 modules** est un vrai actif — c'est du contenu pédagogique structuré, pas juste une coquille technique.
- **Le plan de classe** répond à un vrai besoin terrain (l'enseignant doit voir qui est où).
- **Le support offline** est pertinent pour un contexte scolaire (WiFi instable).
- **Les analytics et profils** permettent un vrai suivi pédagogique longitudinal.

## Ce qui semble partir dans la mauvaise direction

- **L'investissement massif dans le cockpit** — 30 commits récents quasi-exclusivement sur le cockpit, 3 modes d'affichage, des allers-retours sur le placement du plan de classe. L'énergie est concentrée sur le confort de l'enseignant au lieu de stabiliser le parcours élève et la logique métier.
- **3 modes de cockpit au lieu d'1** — Standard, Focus, Command. C'est une sur-ingénierie pour un produit qui n'est pas encore stabilisé en v1. Un seul mode bien fait serait plus efficace.
- **Polling au lieu de Realtime** — C'est un compromis technique qui a pu se justifier au début mais qui va devenir un frein à l'expérience (latence, consommation réseau).

## Ce qui risque de coûter du temps inutilement

- **Polir le cockpit avant de stabiliser les modules** — Chaque module a ses propres composants cockpit ET play. Si le cockpit change encore de layout, tout sera à refaire.
- **Maintenir 3 modes d'affichage** — Triple surface de maintenance et de bugs.
- **Garder le polling** — Plus on avance, plus la migration vers Realtime sera coûteuse.

## Ce qui devrait être repriorisé

1. **Stabiliser le parcours élève** avant de polir le cockpit
2. **Fixer le Module 2** (catégories de budget incorrectes)
3. **Implémenter le vote tap-to-vote** — C'est un point d'expérience critique
4. **Migrer vers Supabase Realtime** — Réduire la latence et la charge serveur
5. **Simplifier le cockpit** — Un seul mode, bien fait

---

# 10. Ce qu'il faudrait faire maintenant

## Feuille de route priorisée

### URGENT (à faire maintenant)

1. **Fixer le test unitaire en échec** — Renommer "Cadreur" → "Cameraman" dans le test ou dans le code source. C'est un quick fix mais un test rouge en CI bloque la confiance.

2. **Refactoriser le Module 2** — Remplacer les catégories narratives par les catégories de production film (acteurs, décors, effets, musique, durée + réserve 10 crédits). C'est un module fondamentalement mal implémenté par rapport à la spec.

3. **Implémenter le vote tap-to-vote** — Remplacer les radio buttons + bouton confirmer par un tap direct. C'est un élément central de l'expérience élève.

4. **Ajouter la sélection manuelle des réponses pour le vote** — L'enseignant doit pouvoir choisir 3-4 réponses parmi toutes pour le vote. Actuellement tout va au vote.

### IMPORTANT (à faire bientôt)

5. **Simplifier le cockpit à 1 seul mode** — Fusionner les 3 modes en un seul layout clair. Réduire les 57 useState et 19 modales. C'est la plus grosse source de dette technique.

6. **Migrer le polling vers Supabase Realtime** — Le serveur est prêt. Le client utilise du polling. La migration réduirait la latence de 10-60s à <1s et diviserait la charge réseau.

7. **Configurer Resend (emails)** — Les templates existent. Il manque juste la clé API. Sans emails, pas de workflow de validation de compte.

8. **Implémenter l'animation de révélation des résultats** — La séquence cinématique (noir → fade → slide → barres) fait partie de l'ADN "Banlieuwood" du produit.

### PLUS TARD (à planifier)

9. **Créer la page récap élève** (`/play/[id]/recap`) — Permettre aux élèves de revoir les choix collectifs après la séance.

10. **Implémenter l'analyse inter-séances par IA** — C'est un différenciateur produit fort mais qui nécessite d'abord des données de plusieurs séances réelles.

---

*Ce rapport reflète l'état du code au 21 mars 2026 (commit 82d2444). Il a été produit par analyse automatisée du code source, des configurations, des migrations SQL, de la documentation, et de l'historique git. Les jugements sur la qualité et la direction sont basés sur les patterns observés et la documentation interne du projet.*
