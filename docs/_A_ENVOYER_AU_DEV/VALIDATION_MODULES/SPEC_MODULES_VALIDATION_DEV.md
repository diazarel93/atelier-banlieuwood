# Spec Modules — Validation Développeur
## Banlieuwood · Module Designer V2

**Version :** 1.0
**Date :** 28 mars 2026
**Source :** BANLIEUWOOD_MODULE_DESIGNER_V2.html · MODULE 1–8.docx · ARCHITECTURE_FORMULES_BANLIEUWOOD
**Destinataire :** Développeur — pont de transmission Banlieuwood

---

## Note liminaire — À lire avant tout

Ce document décrit les **8 modules pédagogiques Banlieuwood (M1–M8)** et leur implémentation dans les 3 formules (F0, F1, F2).

**Ce que ce document est :**
- La spec de référence pour coder ou ajuster les modules M1–M8
- Le document qui dit ce qui est stable, ce qui est hypothèse, et ce qui ne doit pas être figé

**Ce que ce document n'est pas :**
- Une validation des modules M9–M13 (traité séparément — voir section 9)
- Une spec de déploiement terrain
- Une liste de tâches à cocher

**Règle de lecture des niveaux de maturité :**

| Niveau | Signification | Conséquence pour le dev |
|---|---|---|
| **A — Ferme** | Structure validée. Peut évoluer légèrement après terrain mais le fond ne bougera pas. | Coder librement. |
| **B — Hypothèse de travail** | Logique plausible, non testée terrain. Structure claire mais non définitive. | Coder de façon modulaire — éviter les dépendances dures. |
| **C — Esquisse structurelle** | Logique d'ensemble posée. Rien de figé. Dépend de la validation F0 puis F1. | Ne pas figer. Architecture souple obligatoire. |

---

## 1. Synthèse rapide — Tableau de bord développeur

### Statut global des modules

| ID | Nom | Arc | Maturité | F0 | F1 | F2 | Briques | Codable ? |
|---|---|---|---|---|---|---|---|---|
| M1 | Le Regard | T1 | **A — Ferme** | Core | Support | Core | 3 (A) | ✅ Oui — stable |
| M2 | Le Mécanisme d'une scène | T1 | **A — Ferme** | Optionnel | Core | Core | 1 (A) | ✅ Oui — stable |
| M3 | Générer l'idée | T2 | **A — Ferme** | Core | Core | Core | 5 (A) | ✅ Oui — 2 points ouverts mineurs |
| M4 | Le Pitch | T2 | **B — Hypothèse** | Inactif | Probable | Core | 7 (B) | ⚠ Oui avec réserves — 2 points ouverts |
| M5 | Le Récit | T2 | **B — Hypothèse** | Inactif | Plausible | Core | 6 (B) | ⚠ Oui — **différence critique F1/F2** |
| M6 | Le Scénario | T3 | **C — Esquisse** | Inactif | Inactif | Core | 5 (C) | ⚡ Partiel — ne pas figer |
| M7 | La Mise en scène | T3 | **C — Esquisse** | Inactif | Inactif | Core | 4 (C) | ⚡ Partiel — ne pas figer |
| M8 | L'Équipe | T4 | **C — Esquisse** | Inactif | Inactif | Core | 5 (C) | ⚡ Partiel — ne pas figer |

---

### Ce qui peut être codé maintenant sans risque

- **M1, M2, M3** — structure ferme, briques Maturité A, usage confirmé dans F0/F1/F2
- **M4** — structure logique validée, briques B, codable avec 2 points de vigilance (voir fiche M4)
- **M5** — briques stables, mais **la différence de finalité F1 vs F2 est structurante** (voir fiche M5)
- **M6, M7, M8** — architecture esquissée, briques documentées — **codable en souplesse** si on ne fige pas les flux

### Ce qui doit rester souple (pas de structure dure)

- La répartition des modules par séance dans F1 (3 séances minimum, répartition non arbitrée)
- La durée exacte de chaque module en F2 (estimée ~1h, non confirmée)
- Les formats de sélection M5 → M6 (comment les votes alimentent le scénario V0)
- Les critères d'affichage B5 (miroir collectif — aléatoire / représentatif / diversité)

### Ce qui ne doit pas être inventé

- Aucune nouvelle logique de profil élève (OIE a été retiré — le système Banlieuwood natif est B8_2)
- Aucun module intermédiaire entre M5 et M6 non documenté ici
- Aucune attribution automatique de rôles (M8) sans passer par le système de points d'implication

---

## 2. Architecture globale

### Les 3 formules

| Formule | Maturité | Durée | Modules actifs | Statut |
|---|---|---|---|---|
| **F0** — Formule Découverte | A — Ferme | 55–60 min, séance unique | M1 (core), M3 (core), M2 (optionnel) | Terrain imminent |
| **F1** — Formule Légère | B — Hypothèse | ~3 × 60 min minimum | M1 (support), M2 (core), M3 (core), M4 (probable), M5 (plausible) | À consolider après terrain F0 |
| **F2** — Formule Complète | C — Esquisse | Noyau ~8 × 60 min + extensions | M1–M8 tous core | Ne pas architecturer avant F0+F1 validés |

**F2 — extensions de production (hors noyau 8 modules) :**
- Répétitions : 0 à 2 séances (optionnel)
- Tournage : 1 à 2 sessions (constitutif de F2)
- Formats indicatifs : court (~9 séances), standard (~10), complet (~12) — **valeurs indicatives, non définitives**

### Les 4 arcs pédagogiques

| Arc | Modules | Description |
|---|---|---|
| **T1 — Observer** | M1, M2 | Développer un regard singulier sur le réel |
| **T2 — Imaginer / Structurer** | M3, M4, M5 | Générer des idées et les mettre en forme narrative |
| **T3 — Produire** | M6, M7 | Passer à l'écriture et à la mise en scène |
| **T4 — Restituer** | M8 | Constituer l'équipe et restituer le travail |

### Glossaire des rôles module dans une formule

| Terme | Sens |
|---|---|
| **Core** | Module central, obligatoire dans la formule |
| **Support** | Module présupposé acquis, rappel condensé uniquement |
| **Optionnel** | Activable selon dynamique de groupe ou temps disponible |
| **Probable** | Logique claire, non validé terrain — peut être codé mais pas figé |
| **Plausible** | Très conditionnel — n'activer qu'après validation du module précédent |
| **Inactif** | Absent de la formule |

---

## 3. Alerte de correspondance — Modules Banlieuwood vs modules code existant

**Point critique à lire avant tout développement.**

Le code existant contient des modules M9–M13 dont certains recoupent partiellement des modules Banlieuwood M3/M4/M5. Risque de duplication silencieuse.

| Module code | Contenu dev | Overlap Banlieuwood | Statut |
|---|---|---|---|
| M10 (code) | "Et si... & Pitch" — images quartier/école + pitch 30s | Recoup **M3 + M4** (Banlieuwood) | ⚠ Alerte — voir note |
| M12 (code) | "Construction Collective" — 8 votes successifs | Recoup **M5** (Banlieuwood) | ⚠ Alerte — voir note |
| M9, M11, M13 | Culture ciné générique / post-prod | Hors spec Banlieuwood M1–M8 | Décision en attente |

**Note M10 vs M3+M4 :** Les images "Et si..." de quartier/école dans M10 constituent le **contenu Banlieuwood spécifique** du module M3 (images déclencheuses). La logique pitch 30s est le **contenu de M4**. M10 (code) n'est pas un module séparé au sens Banlieuwood — c'est une instance thématique de M3+M4. Risque : si les deux coexistent dans le code, les données se dupliquent.

**Note M12 vs M5 :** Les 8 votes successifs de M12 (ton → situation → personnages → objectif → obstacle → scène → relation → moment fort) sont une version enrichie des 5 manches de M5 (B5_1 à B5_5 + B5_6). M12 (code) est fonctionnellement M5 avec un contenu Banlieuwood spécifique.

**Recommandation :** Avant de développer M5 ou M3/M4, vérifier si M10 et M12 dans le code sont bien des **contenus** de M3/M4/M5 ou des **modules séparés** dans l'architecture. Nous trancher de notre côté.

---

## 4. Fiche M1 — Le Regard

**Arc :** T1 — Observer
**Maturité :** A — Ferme · Module validé, structure stable
**Bilan formule :** Core F0, Support F1, Core F2

### Objectif pédagogique
Faire comprendre aux élèves que leur regard subjectif est une ressource créative, pas un obstacle à la "bonne" réponse.

**Output attendu :** Les élèves ont identifié que leur point de vue sur une image diffère de celui des autres, et que cette différence est matière à création.

### Rôle par formule

| Formule | Rôle | Mode | Note d'usage |
|---|---|---|---|
| F0 | **Core** | Collectif | Fondation du regard. Déclencheur d'attention et de désencadrement perceptif. Module principal de la séance. |
| F1 | **Support** | Individuel | Réactivation condensée. M1 est présupposé partiellement acquis depuis F0. Rappel court — ne pas ré-enseigner intégralement. |
| F2 | **Core** | Collectif | Ancre le regard au début du cycle complet. Même structure que F0. |

**Point critique F1 :** En F1, M1 passe de Core → Support. Ne pas le ré-enseigner entièrement. C'est un rappel, pas un cours.

### Briques

| ID | Nom | Type | Rôle | Durée | Maturité | Point ouvert |
|---|---|---|---|---|---|---|
| B1 | Questions de positionnement | Core | Outil | 8–10 min | A | Aucun |
| B2a | Confrontation visuelle anonyme | Core | Outil + Collectif | 12–15 min | A | Aucun |
| B2b | Décadrage oral | Core | Intervenant | — | A | Aucun |

**Toutes les briques sont Maturité A. Aucun point ouvert. Structure codable librement.**

### Ce qui est stable et codable
- Séquence B1 → B2a → B2b : fixe dans les 3 formules
- B2b est intentionnellement présentielle (intervenant seul — pas d'outil numérique)
- Fonctionnement anonyme de B1 et B2a : structurant

### Ce qui ne doit pas être figé
- Rien — M1 est le module le plus stable de la spec

### Risques d'interprétation
- Ne pas confondre "Support" en F1 avec "facultatif". M1 reste présent en F1 — simplement en format condensé.
- B2b (Décadrage oral) n'est pas une brique à numériser. C'est une intervention de l'intervenant. L'outil ne la remplace pas.

---

## 5. Fiche M2 — Le Mécanisme d'une scène

**Arc :** T1 — Observer
**Maturité :** A — Ferme
**Bilan formule :** Optionnel F0, Core F1, Core F2

### Objectif pédagogique
Comprendre les composantes narratives et visuelles d'une scène cinématographique.

**Output attendu :** Les élèves peuvent nommer et distinguer les éléments constitutifs d'une scène (cadrage, son, jeu, montage).

### Rôle par formule

| Formule | Rôle | Note |
|---|---|---|
| F0 | **Optionnel** | Activable selon dynamique de groupe. QCMs de cadrage narratif intégrés dans le Bloc 4 (B4a) de M3. |
| F1 | **Core** | Changement de statut clé. En F1, M2 devient fondation technique obligatoire — enseigné formellement avant la génération d'idée. |
| F2 | **Core** | Héritier de F1. Base technique pour l'arc de production. |

### Briques

| ID | Nom | Type | Rôle | Maturité | Point ouvert |
|---|---|---|---|---|---|
| B_QCM | QCMs cadrage narratif | Optionnel (F0) / Core (F1, F2) | Outil | A | Aucun |

### Ce qui est stable et codable
- La logique QCM est simple et stable — Maturité A
- En F0, B_QCM est intégré dans le flux de M3 (pas un module séparé affiché)
- En F1 et F2, M2 devient une séquence dédiée avant M3

### Ce qui ne doit pas être figé
- Le contenu exact des QCMs (questions spécifiques) peut évoluer légèrement après terrain
- La durée de la séquence M2 en F1 n'est pas encore calibrée

### Risques d'interprétation
- En F0, M2 n'est pas un module à part entière visible — il est intégré dans M3 via B_QCM. Ne pas créer une entrée séparée dans l'interface F0.
- Ne pas confondre "Optionnel" (activable selon dynamique) avec "jamais activé".

---

## 6. Fiche M3 — Générer l'idée

**Arc :** T2 — Imaginer / Structurer
**Maturité :** A — Ferme · Core dans les 3 formules
**Bilan formule :** Core F0, Core F1, Core F2

### Objectif pédagogique
Amorcer un processus de création narrative par l'imagination guidée à partir d'images déclencheuses.

**Output attendu :** Chaque élève a formulé une idée de scène ou d'histoire, exprimée oralement ou par écrit, issue d'une image déclencheuse.

### Rôle par formule

| Formule | Rôle | Mode | Note |
|---|---|---|---|
| F0 | **Core** | Individuel + Collectif | Cœur narratif de la séance. M2 optionnel intégré dans B4a. |
| F1 | **Core** | Individuel | Génération d'idée individuelle. Base technique plus solide grâce à M2 core. |
| F2 | **Core** | Individuel | Point de départ du projet personnel — l'idée devient source du projet de film. |

**Même rôle dans les 3 formules — structure identique.**

### Briques

| ID | Nom | Type | Rôle | Durée | Maturité | Point ouvert |
|---|---|---|---|---|---|---|
| B3a | Exemples Et si… | Core | Intervenant | 8–10 min | A | Aucun |
| B3b | Entrée par l'émotion | Core | Intervenant | — | A | Aucun |
| B4a | Défilement images + Et si… + QCMs | Core | Outil + Intervenant | 15–20 min | A | ⚠ Durée plancher |
| B4b | Aide activable | Aide | Outil | — | A | Aucun |
| B5 | Clôture + Miroir collectif | Core | Outil + Intervenant + Collectif | 10 min | A | ⚠ Critères d'affichage |

### Points ouverts à ne pas figer dans le code

**B4a — Durée plancher :** Risque de précipitation si la durée de cette brique tombe sous 15 minutes. La valeur exacte du seuil sera définie après terrain pilote. **Ne pas coder une durée minimum fixe pour l'instant.**

**B5 — Critères de sélection affichage :** Lors du miroir collectif, quelles réponses afficher ? Aléatoire / représentatif / diversité ? Non arbitré. **Ne pas coder de logique de sélection définitive — prévoir un paramètre configurable ou laisser en aléatoire provisoirement.**

### Ce qui est stable et codable
- Séquence B3a → B3b → B4a → B4b → B5 : fixe
- B3a et B3b sont des briques d'intervenant — présentiel uniquement, pas numérisé
- B4b (Aide activable) : optionnelle, activable par l'élève ou l'intervenant
- Fonctionnement de B4a : images déclencheuses + questions "Et si..." + réponse libre élève

### Risques d'interprétation
- **B_QCM (M2) est intégré dans B4a en F0** — pas un bloc séparé affiché à l'écran. L'outil passe naturellement des questions "Et si..." aux QCMs de cadrage dans le même flux.
- B3a et B3b ne sont pas des écrans — ce sont des balises de déroulement pour l'intervenant. Ne pas créer d'interfaces pour ces deux briques.
- Le miroir collectif (B5) doit être **anonyme** — ne jamais afficher le nom des élèves avec leurs réponses.

---

## 7. Fiche M4 — Le Pitch

**Arc :** T2 — Imaginer / Structurer
**Maturité :** B — Hypothèse de travail
**Bilan formule :** Inactif F0, Probable F1, Core F2

### Objectif pédagogique
Apprendre à formuler une idée de film en une phrase claire, convaincante et mémorable.

**Output attendu :** Chaque élève produit un pitch oral de ~30 secondes : personnage + objectif + obstacle + idée. Pitch envoyé, confronté doucement, auto-audité.

### Rôle par formule

| Formule | Rôle | Mode | Note |
|---|---|---|---|
| F0 | **Inactif** | — | M4 n'existe pas en F0. |
| F1 | **Probable** | Individuel | Synthèse narrative individuelle. Non validé terrain. Chaque élève construit et défend sa propre proposition. |
| F2 | **Core** | Individuel | Pivot de décision narrative — le pitch collectif sert à sélectionner le projet à développer. |

**Attention : M4 est individuel dans F1 ET dans F2.** Le pitch permet à chaque élève de formuler son idée — la dimension collective vient plus tard (M5).

### Briques

| ID | Nom | Type | Durée | Maturité | Point ouvert |
|---|---|---|---|---|---|
| B4_1 | Introduction pitch (intervenant) | Core | 5–8 min | B | Aucun |
| B4_2 | Personnage — interface mini-jeu | Core | 12–15 min | B | ⚠ Formulations genre/apparence |
| B4_3 | Objectif du personnage | Core | 8–10 min | B | Aucun |
| B4_4 | Tension / obstacle | Core | — | B | ⚠ Libellé exact non figé |
| B4_5 | Construction du pitch académique | Core | 10–12 min | B | Aucun |
| B4_6 | Test chrono 30 secondes | Core | — | B | Aucun |
| B4_7 | Envoi + confrontation douce + auto-audit | Core | 10–15 min | B | Aucun |

### Points ouverts à ne pas figer dans le code

**B4_2 — Formulations genre/apparence :** La logique de l'interface mini-jeu (création de personnage style jeu vidéo) est validée. Le vocabulaire exact des options (genre, apparence, style) doit encore être affiné pour être éthiquement et techniquement juste. **Coder la structure de l'interface — ne pas figer les libellés des options.**

**B4_4 — Libellé exact :** Le rôle pédagogique de cette brique est validé (ajouter une couche de tension narrative). La formulation exacte de la question posée à l'élève n'est pas encore figée. **Coder l'emplacement de cette brique dans le flux — ne pas figer le texte de la question.**

### Ce qui est stable et codable
- Séquence B4_1 → B4_2 → B4_3 → B4_4 → B4_5 → B4_6 → B4_7 : fixe
- B4_1 est une intervention d'intervenant — pas d'écran
- B4_5 (Construction du pitch) : phrase à trous, éléments récoltés dans B4_2/B4_3/B4_4 — **le pitch n'est pas généré par IA**, l'élève formule lui-même
- B4_6 (Chrono 30s) : le bouton "Envoyer" est bloquant tant que la durée n'est pas respectée
- B4_7 (Confrontation douce) : séquence en 3 temps — envoi / mini-confrontation collective anonyme / auto-audit

### Ce qui ne doit pas être figé
- M4 est probable en F1 — ne pas architecturer une dépendance dure F1→M4
- Les briques sont Maturité B — prévoir une modification possible du contenu après terrain

### Risques d'interprétation
- **Le pitch N'EST PAS généré par IA.** L'outil présente les éléments (personnage + objectif + obstacle) et l'élève formule la phrase. Ne pas introduire de suggestion automatique.
- La "confrontation douce" (B4_7) est **anonyme** — les pitchs présentés ne sont pas nominatifs.
- En F2, M4 sert à **sélectionner** le projet collectif à développer en M5. La logique de sélection (vote ? choix intervenant ?) n'est pas encore specifiée — ne pas inventer une mécanique.

---

## 8. Fiche M5 — Le Récit

**Arc :** T2 — Imaginer / Structurer
**Maturité :** B — Hypothèse de travail
**Bilan formule :** Inactif F0, Plausible F1, Core F2

### Objectif pédagogique
Construire l'ossature narrative d'une histoire par manches de contributions et de votes — individuellement (F1) ou collectivement (F2).

**Output attendu :** Une ossature narrative structurée : ton + situation + personnage(s) + objectif + obstacle. Socle pour le scénario (F2) ou pour un storyboard individuel (F1).

### DIFFÉRENCE STRUCTURANTE F1 / F2 — À lire impérativement

| | F1 | F2 |
|---|---|---|
| **Usage** | Individuel | Collectif |
| **Ce que construisent les élèves** | Chacun construit le storyboard de **sa propre histoire** | Ensemble, ils construisent **l'histoire de groupe** partagée |
| **Les manches votent sur** | L'histoire personnelle de l'élève | Un projet collectif unique |
| **Output final** | Storyboard individuel (N storyboards pour N élèves) | Une ossature collective unique (1 histoire pour toute la classe) |
| **Dépendance** | Très conditionnelle — n'activer qu'après M4 terrain validé | Core — fondation de M6 |

**Les briques sont identiques en F1 et F2. La finalité est radicalement différente.**

### Rôle par formule

| Formule | Rôle | Note |
|---|---|---|
| F0 | **Inactif** | Absent de F0. |
| F1 | **Plausible** | Très conditionnel. Les manches guident chaque élève vers le storyboard de SA propre histoire. Ne pas activer avant validation terrain de M4. |
| F2 | **Core** | Passage de l'idée individuelle (M4) à la trame collective. Construction de groupe. |

### Briques

| ID | Nom | Type | Rôle | Maturité | Point ouvert |
|---|---|---|---|---|---|
| B5_1 | Manche 1 — Ton | Core | Outil + Collectif | B | Aucun |
| B5_2 | Manche 2 — Situation | Core | Outil + Collectif | B | Aucun |
| B5_3 | Manche 3 — Personnages | Core | Outil + Collectif | B | Aucun |
| B5_4 | Manche 4 — Objectif | Core | Outil + Collectif | B | Aucun |
| B5_5 | Manche 5 — Obstacle | Core | Outil + Collectif | B | Aucun |
| B5_6 | Éléments créatifs complémentaires | Optionnel | Outil + Collectif | B | Aucun |

**Note B5_3 :** Manche personnages = 5–6 cartes (plus large que les autres). Règle de représentation minimale : chaque élève doit pouvoir retrouver au moins une trace de sa contribution dans l'ensemble du module.

**Note B5_6 :** Éléments bonus post-manches (première scène, relation principale, moment fort). Pas une sixième manche obligatoire — matière supplémentaire pour M6.

### Ce qui est stable et codable
- Séquence B5_1 → B5_2 → B5_3 → B5_4 → B5_5 (→ B5_6 optionnel) : fixe
- Toutes les cartes sont **anonymisées** — les réponses d'élèves ne sont jamais nominatives
- Système de vote : 3–4 cartes par manche (sauf B5_3 : 5–6)

### Ce qui ne doit pas être figé
- Les cartes elles-mêmes (contenu des propositions) peuvent être améliorées après terrain
- La logique de génération des cartes (issues des pitchs M4 + suggestions Banlieuwood) n'est pas encore specifiée en détail

### Risques d'interprétation
- **Le plus grand risque de ce module** : confondre la finalité F1 (individuel) et F2 (collectif). Ne pas coder un seul comportement pour les deux.
- Les cartes doivent provenir des **pitchs des élèves (M4) + suggestions Banlieuwood en renfort** — ne pas inventer un générateur automatique.
- B5_6 est optionnel — ne pas l'afficher par défaut.

---

## 9. Fiche M6 — Le Scénario

**Arc :** T3 — Produire
**Maturité :** C — Esquisse structurelle
**Bilan formule :** Inactif F0, Inactif F1, Core F2 (exclusif F2)

### Objectif pédagogique
Transformer l'ossature narrative collective en scénario jouable, par complétion de zones ciblées.

**Output attendu :** Un scénario renforcé : scènes clarifiées, dialogues amorcés, incohérences corrigées. Récit stable pour passer à la mise en scène.

### Rôle par formule
M6 est **exclusif F2**. Inactif dans F0 et F1.

### Briques

| ID | Nom | Type | Rôle | Maturité | Point ouvert |
|---|---|---|---|---|---|
| B6_1 | Scénario V0 + liane narrative | Core | Outil | C | Aucun |
| B6_2 | Lecture collective du scénario V0 | Core | Intervenant + Collectif | C | Aucun |
| B6_3 | Profils créatifs + distribution missions | Core | Outil + Intervenant | C | Aucun |
| B6_4 | Missions d'écriture collective | Core | Outil + Collectif | C | Aucun |
| B6_5 | Retour collectif + recomposition | Core | Intervenant + Collectif | C | Aucun |

**Aucun point ouvert sur les briques — la logique est documentée. Mais la Maturité C s'applique à l'ensemble.**

### Ce qui est stable et codable
- Séquence B6_1 → B6_2 → B6_3 → B6_4 → B6_5 : logique posée
- B6_1 : scénario V0 généré **en inter-séance** à partir des résultats M5 (4 à 6 scènes max, résumés, personnages, objectifs)
- B6_3 : 5 profils créatifs — Acteur / Créatif / Détective / Provocateur / Stratège. Ce sont des **suggestions** basées sur la data modules précédents — pas des assignations forcées
- B6_4 : travail 30–40% tablette / 60–70% discussion humaine

### Ce qui ne doit pas être figé
- La logique exacte de génération du scénario V0 (algorithme de transformation M5 → scénario)
- Le format exact de la liane narrative
- La logique de distribution des missions selon les profils

### Risques d'interprétation
- **B6_1 est généré en inter-séance** — pas pendant la séance avec les élèves. Ne pas créer un générateur temps réel.
- Les profils (B6_3) sont des **suggestions, pas des prisons**. L'élève n'est pas contraint à son profil. L'intervenant peut ré-assigner.
- **Ce module dépend entièrement des résultats de M5.** Si M5 n'a pas produit une ossature suffisante, M6 ne peut pas démarrer.

---

## 10. Fiche M7 — La Mise en scène

**Arc :** T3 — Produire
**Maturité :** C — Esquisse structurelle
**Bilan formule :** Inactif F0, Inactif F1, Core F2 (exclusif F2)

### Objectif pédagogique
Comprendre que raconter au cinéma consiste à choisir quoi montrer et comment le montrer.

**Output attendu :** Un mini-storyboard et un mini-découpage des scènes clés. Première vision visuelle concrète du film.

### Rôle par formule
M7 est **exclusif F2**. Inactif dans F0 et F1.

### Briques

| ID | Nom | Type | Rôle | Maturité | Point ouvert |
|---|---|---|---|---|---|
| B7_1 | Initiation — 4 types de plans | Core | Outil + Intervenant | C | Aucun |
| B7_2 | Choix des scènes clés à travailler | Core | Intervenant + Collectif | C | Aucun |
| B7_3 | Mini-découpage | Core | Outil + Collectif | C | Aucun |
| B7_4 | Storyboard simplifié | Core | Outil | C | Aucun |

### Ce qui est stable et codable
- Séquence B7_1 → B7_2 → B7_3 → B7_4 : logique posée
- B7_1 : découverte des 4 plans **par comparaison d'images** (pas par définition abstraite) — Plan large / Plan moyen / Gros plan / Plan réaction
- B7_2 : sélection de **2 à 3 scènes structurantes** (obligatoirement 1 scène discussion + 1 scène action/tension) — faite **en inter-séance M6→M7**
- B7_3 : mini-découpage simplifié — type de plan / ce qu'on voit / intention. **Pas de jargon technique** (pas de focale, pas d'axe caméra)
- B7_4 : storyboard généré **en inter-séance** (pas en direct) à partir du découpage

### Ce qui ne doit pas être figé
- Le format exact du storyboard
- La logique de génération des images illustrant les plans (technologie à définir)

### Risques d'interprétation
- **B7_4 est généré en inter-séance** — pas en temps réel avec les élèves. Risque de confusion avec une fonctionnalité de dessin en direct.
- Pas de jargon : aucun terme comme "focale", "axe 180°", "contre-plongée" dans l'interface élève.
- B7_2 : la sélection des scènes est faite par l'intervenant en inter-séance, pas par vote élève.

---

## 11. Fiche M8 — L'Équipe

**Arc :** T4 — Restituer
**Maturité :** C — Esquisse structurelle
**Bilan formule :** Inactif F0, Inactif F1, Core F2 (exclusif F2)

### Objectif pédagogique
Transformer le groupe en équipe de tournage en distribuant des rôles selon l'implication et en préparant chacun à sa responsabilité.

**Output attendu :** Équipe constituée, rôles attribués, cartes talents remises, documents de tournage par poste générés. Film prêt à être tourné.

### Rôle par formule
M8 est **exclusif F2**. Inactif dans F0 et F1.

### Briques

| ID | Nom | Type | Rôle | Durée | Maturité | Point ouvert |
|---|---|---|---|---|---|---|
| B8_1 | Quiz des métiers du cinéma | Core | Outil + Intervenant | 15 min + 5–8 min débrief | C | Aucun |
| B8_2 | Système de points d'implication | Core | Outil + Intervenant | — | C | Aucun |
| B8_3 | Choix des rôles de tournage | Core | Outil + Intervenant | — | C | Aucun |
| B8_4 | Cartes talents | Core | Outil | — | C | Aucun |
| B8_5 | Documents par poste | Core | Outil | — | C | Aucun |

### Système de points d'implication (B8_2) — Note importante

**Ce système est le système de scoring natif Banlieuwood. Il remplace l'OIE retiré.**

Il calcule un classement non public à partir de 3 sources :
1. Participation aux activités des modules précédents (3 niveaux : description / description+analyse / description+analyse+interprétation)
2. Carnet d'idées (notes, observations, inspirations)
3. Observations de l'intervenant (tags : très créatif / force de proposition / bonne écoute…)

**Règle doctrine :** Le classement est visible uniquement par l'outil (intervenant) — jamais public, jamais affiché aux élèves.

**Conséquence V2 Stats :** Les axes de compétences (compréhension / créativité / expression / engagement) du dashboard doivent être alimentés par ce système — pas par l'OIE. La définition exacte de la correspondance axes ↔ données B8_2 n'est pas encore specifiée — **ne pas inventer cette logique**.

### Ce qui est stable et codable
- Séquence B8_1 → B8_2 → B8_3 → B8_4 → B8_5 : logique posée
- B8_1 : quiz interactif + débrief intervenant 5–8 min
- B8_3 : choix des rôles dans l'**ordre du classement points** — le premier n'est pas obligé de prendre réalisateur. Veto Banlieuwood possible (rare).
- Rôles disponibles : réalisateur / cadreur / ingénieur son / assistant réalisateur / script / acteurs
- B8_4 : carte format Pokémon/FIFA — **uniquement des forces et axes de progression, jamais de faiblesses**. 3 familles : jeu-interprétation / mise en scène-image / technique-organisation
- B8_5 : documents générés automatiquement depuis scénario + découpage + rôles

### Ce qui ne doit pas être figé
- La correspondance exacte B8_2 → axes V2 Stats (à spécifier de notre côté)
- Le format exact des cartes talents
- Le format exact des documents par poste

### Risques d'interprétation
- **B8_4 (cartes talents) n'affiche jamais de faiblesses.** Uniquement forces et axes de progression. Point non négociable.
- Le classement B8_2 n'est pas un leaderboard — il n'est jamais affiché aux élèves. C'est un outil de décision interne pour l'attribution des rôles.
- B8_5 génère des documents **simplifiés et proportionnés à l'âge** — pas des feuilles de service professionnelles.

---

## 12. Points ouverts consolidés — Ce qui attend une décision Banlieuwood

| Module | Brique | Question ouverte | Impact code |
|---|---|---|---|
| M3 | B4a | Durée plancher — seuil exact à définir après terrain | Ne pas coder de minimum fixe |
| M3 | B5 | Critères de sélection miroir collectif (aléatoire / représentatif / diversité) | Prévoir paramètre configurable |
| M4 | B4_2 | Formulations genre/apparence — vocabulaire éthique à préciser | Coder structure, pas les libellés |
| M4 | B4_4 | Formulation exacte de la question obstacle | Coder emplacement, pas le texte |
| M5 | — | Logique de génération des cartes de vote depuis pitchs M4 | Ne pas inventer l'algorithme |
| M6 | — | Algorithme de transformation M5 → scénario V0 | Prévoir génération inter-séance, algo à définir |
| M7 | — | Technologie de génération storyboard (images inter-séance) | Prévoir le slot, technologie à définir |
| M8 | B8_2 | Correspondance B8_2 → axes V2 Stats dashboard | Attendre spec de notre côté |
| Global | — | Correspondance modules Banlieuwood M3/M4/M5 ↔ modules code M10/M12 | Clarifier avant développement |

---

## 13. Statut des modules M9–M13 du code existant

| Module code | Contenu | Origine | Décision |
|---|---|---|---|
| M9 — Le Cinéma | Quiz cinéma, budget, imprévus de tournage | Dev — générique | ⏳ En attente Banlieuwood |
| M10 — Et si... & Pitch | Images quartier/école + pitch 30s | Banlieuwood (images/personnages) + Dev (structure) | ⚠ Recoup M3+M4 — clarification architecture en cours |
| M11 — Ciné-Débat | Culture ciné grand public (Hitchcock, Miyazaki…) | Dev — générique | ⏳ En attente Banlieuwood |
| M12 — Construction Collective | 8 votes successifs (Banlieuwood) | Banlieuwood (contenu) + Dev (système) | ⚠ Recoup M5 — clarification architecture en cours |
| M13 — La Post-prod | Workflow post-production | Dev — scaffold | Désactivé (`disabled: true`) — ne pas activer |

**Pour M9, M11 :** Banlieuwood confirme dans ce cycle si on garde (culture ciné bonus), remplace (curriculum officiel), ou retire.

**Pour M10, M12 :** Avant tout développement M3/M4/M5, clarifier si M10 et M12 sont des **contenus** de ces modules ou des **modules séparés** dans l'architecture. Cette décision est critique pour éviter la duplication de données.

---

*Banlieuwood — Spec Modules Validation Développeur — V1.0 — 28 mars 2026*
*Source de vérité : BANLIEUWOOD_MODULE_DESIGNER_V2.html · Sections BRICKS, FORMULAS, MODULES*
