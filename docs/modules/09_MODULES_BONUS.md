# Modules Bonus / Complémentaires

> Documentation exhaustive des modules bonus de la plateforme Atelier Banlieuwood.
> Ces modules complètent le parcours principal et offrent des angles d'exploration variés : immersion personnage, approfondissement narratif, débat cinématographique et post-production.

---

## Table des matières

1. [Vis ma vie (dbModule=4)](#1-vis-ma-vie-dbmodule4)
2. [Le Héros / Le Conflit / Le Sens (dbModule=3)](#2-le-héros--le-conflit--le-sens-dbmodule3)
3. [Ciné-Débat (dbModule=11)](#3-ciné-débat-dbmodule11)
4. [Post-production (dbModule=13, DISABLED)](#4-post-production-dbmodule13-disabled)
5. [Table récapitulative](#5-table-récapitulative)

---

## 1. Vis ma vie (dbModule=4)

### Identité

| Champ | Valeur |
|---|---|
| **ID module** | `m2-perso` |
| **dbModule** | `4` |
| **Nombre de séances** | 1 |
| **Nombre de situations** | 8 |
| **Statut** | Actif |

### Objectif pédagogique

Module personnel qui permet aux élèves de se mettre dans la peau d'un personnage. L'élève explore l'empathie narrative en adoptant le point de vue, les émotions et les contraintes d'un personnage fictif. Ce module développe la capacité d'identification et de projection, compétences fondamentales pour l'écriture scénaristique.

### Architecture technique

- **Handler** : `handleStandard()` (handler générique standard)
- **Configuration situations** :
  ```typescript
  MODULE_SEANCE_SITUATIONS: {
    4: { 1: 8 }
  }
  ```
- **Pas de handler dédié** : les 8 situations suivent le flux standard (QCM, texte libre, etc.)
- **Pas de table DB dédiée** : utilise les tables de situations standard

### Flux de la séance

1. L'élève entre dans la séance unique (séance 1)
2. Il traverse 8 situations successives gérées par le handler standard
3. Chaque situation l'invite à répondre en adoptant la perspective d'un personnage
4. Progression linéaire classique avec évaluation par situation

---

## 2. Le Héros / Le Conflit / Le Sens (dbModule=3)

### Identité

Ce groupe de 3 séances partage le même `dbModule=3` mais constitue visuellement 3 modules distincts dans l'interface.

| Séance | ID module | dbModule | Séance n° | Situations | Statut |
|---|---|---|---|---|---|
| **Le Héros** | `m3` | `3` | 1 | 8 | Actif |
| **Le Conflit** | `m4` | `3` | 2 | 8 | Actif |
| **Le Sens** | `m5` | `3` | 3 | 5 | Actif |

### Objectif pédagogique

Trois modules thématiques d'approfondissement narratif. Chacun cible un pilier fondamental de la construction d'une histoire :

- **Le Héros (m3)** : Construction et compréhension du personnage principal, ses motivations, son arc narratif, ce qui le rend attachant ou complexe.
- **Le Conflit (m4)** : Exploration du conflit dramatique sous toutes ses formes (interne, externe, relationnel, sociétal). Le conflit comme moteur de l'histoire.
- **Le Sens (m5)** : Réflexion sur le sens profond de l'histoire, son thème, son message. Ce que l'auteur veut transmettre au-delà de l'intrigue.

### Architecture technique

- **Handler** : `handleStandard()` pour les trois séances
- **Configuration situations** :
  ```typescript
  MODULE_SEANCE_SITUATIONS: {
    3: { 1: 8, 2: 8, 3: 5 }
  }
  ```
- **Pas de handler dédié** : flux standard pour chaque séance
- **Pas de table DB dédiée** : utilise les tables de situations standard

### Flux des séances

Les trois séances sont indépendantes les unes des autres mais partagent le même `dbModule`. Chacune suit le flux standard :

1. **Le Héros** (séance 1) : 8 situations explorant la construction du héros
2. **Le Conflit** (séance 2) : 8 situations explorant les mécaniques du conflit
3. **Le Sens** (séance 3) : 5 situations explorant le thème et le sens de l'histoire

### Note sur le regroupement

Le fait que les trois modules partagent `dbModule=3` est un choix de modélisation. Dans la base de données, ils sont identifiés par la combinaison `(dbModule, séance)`. Dans l'interface, ils apparaissent comme trois modules distincts grâce à leurs IDs visuels séparés (`m3`, `m4`, `m5`).

---

## 3. Ciné-Débat (dbModule=11)

### Identité

| Champ | Valeur |
|---|---|
| **IDs module** | `m11a`, `m11b`, `m11c`, `m11d` |
| **dbModule** | `11` |
| **Nombre de séances** | 4 |
| **Situations par séance** | 6 |
| **Total situations** | 24 |
| **Statut** | Actif |

### Objectif pédagogique

Discussions structurées autour du cinéma. Ce module utilise des stimuli cinématographiques variés (citations de réalisateurs, analyses de scènes, affiches de films, débats thématiques) pour provoquer la réflexion et l'échange entre les élèves. Chaque séance est organisée autour d'un thème :

| Séance | Thème | ID | Description |
|---|---|---|---|
| 1 | **Raconter** | `m11a` | L'art de raconter une histoire au cinéma |
| 2 | **Émotion** | `m11b` | Comment le cinéma crée et transmet les émotions |
| 3 | **Héros** | `m11c` | Les figures héroïques au cinéma |
| 4 | **Coulisses** | `m11d` | Les métiers et la fabrication d'un film |

### Architecture technique

- **Handler dédié** : `handlers/module11.ts`
- **Données statiques** : `src/lib/module11-data.ts`
- **Composant UI** : `src/components/play/module-11/CineDebatState`
- **Polling** : `Module11Data` dans `use-session-polling.ts`
- **Configuration situations** :
  ```typescript
  MODULE_SEANCE_SITUATIONS: {
    11: { 1: 6, 2: 6, 3: 6, 4: 6 }
  }
  ```
- **Base de données** : pas de table dédiée, utilise les situations standard

### Données : `module11-data.ts`

Le fichier de données statiques contient les stimuli cinéma organisés par séance. Chaque stimulus comprend :

- **Type de stimulus** : `citation`, `scene`, `poster`, `debat`
- **Contenu** : le texte, l'image ou la description du stimulus
- **Auteur** : nom du réalisateur ou de la personnalité citée
- **Bio** : courte biographie contextuelle
- **Filmographie** : films notables de l'auteur

#### Types de stimuli détaillés

| Type | Description | Utilisation |
|---|---|---|
| `citation` | Citation d'un réalisateur ou professionnel du cinéma | Amorce de discussion, réflexion individuelle |
| `scene` | Description ou référence à une scène de film | Analyse collective, identification des techniques |
| `poster` | Affiche de film | Lecture d'image, interprétation visuelle |
| `debat` | Question ou thèse à débattre | Discussion structurée, argumentation |

### Flux d'une séance Ciné-Débat

1. L'enseignant lance une des 4 séances thématiques
2. Pour chaque situation (6 par séance), un stimulus cinéma est présenté
3. Le composant `CineDebatState` gère l'affichage du stimulus et la collecte des réponses
4. Le handler `module11.ts` traite les réponses spécifiquement
5. Le polling via `Module11Data` dans `use-session-polling.ts` assure le suivi en temps réel

---

## 4. Post-production (dbModule=13, DISABLED)

### Identité

| Champ | Valeur |
|---|---|
| **ID module** | `m9` |
| **dbModule** | `13` |
| **Nombre de séances** | 1 |
| **Nombre de situations** | 8 |
| **Statut** | **Désactivé** |

### Historique

- Originellement prévu comme "La Post-prod" dans le plan d'Adrian
- Le `dbModule` était initialement `7`, changé à `13` pour éviter une collision avec le module M7 "Mise en scène"
- Le module est défini dans la configuration mais désactivé (`disabled`)

### Objectif pédagogique (prévu)

Module de post-production destiné à explorer les étapes qui suivent le tournage : montage, son, effets, colorimétrie, etc. Ce module n'a pas encore été implémenté.

### Architecture technique

- **Handler** : N/A (module désactivé)
- **Configuration situations** :
  ```typescript
  MODULE_SEANCE_SITUATIONS: {
    13: { 1: 8 }
  }
  ```
- **Implémentation** : aucune pour le moment

### Perspectives

Ce module pourra être activé dans une future itération. Les 8 situations sont prévues mais leur contenu reste à définir. L'activation nécessitera :

1. La création du contenu des 8 situations
2. L'implémentation du handler (standard ou dédié selon les besoins)
3. Le retrait du flag `disabled`
4. Les éventuelles migrations DB si des types de données spécifiques sont nécessaires

---

## 5. Table récapitulative

| Module | ID | dbModule | Séances | Situations | Statut | Handler |
|---|---|---|---|---|---|---|
| Vis ma vie | `m2-perso` | 4 | 1 | 8 | Actif | Standard |
| Le Héros | `m3` | 3 | 1 | 8 | Actif | Standard |
| Le Conflit | `m4` | 3 | 2 | 8 | Actif | Standard |
| Le Sens | `m5` | 3 | 3 | 5 | Actif | Standard |
| Ciné-Débat (Raconter) | `m11a` | 11 | 1 | 6 | Actif | `module11.ts` |
| Ciné-Débat (Émotion) | `m11b` | 11 | 2 | 6 | Actif | `module11.ts` |
| Ciné-Débat (Héros) | `m11c` | 11 | 3 | 6 | Actif | `module11.ts` |
| Ciné-Débat (Coulisses) | `m11d` | 11 | 4 | 6 | Actif | `module11.ts` |
| Post-production | `m9` | 13 | 1 | 8 | Disabled | N/A |

### Totaux

- **Modules actifs** : 8 (dont 4 Ciné-Débat)
- **Situations actives** : 55
- **Situations totales** (incluant désactivées) : 63
- **Handlers utilisés** : 2 (`handleStandard`, `handlers/module11.ts`)

---

## Fichiers clés

| Fichier | Rôle |
|---|---|
| `src/lib/module11-data.ts` | Données statiques Ciné-Débat (stimuli, auteurs, bios, filmographies) |
| `handlers/module11.ts` | Handler dédié Ciné-Débat |
| `src/components/play/module-11/CineDebatState` | Composant UI pour les situations Ciné-Débat |
| `src/hooks/use-session-polling.ts` | Polling temps réel (inclut `Module11Data`) |
