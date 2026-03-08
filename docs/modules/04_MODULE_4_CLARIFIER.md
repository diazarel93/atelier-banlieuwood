# Module 4 --- Clarifier (Le Pitch)

> **Position dans le parcours** : Module 4 / 8 du parcours principal
> **Phase** : `imagination` --- Imagination (meme phase que M3)
> **Couleur** : `#06B6D4` (cyan)
> **dbModule** : `10`, **dbSeance** : `2`
> **ID code** : `m10b`
> **Duree estimee** : 30 min
> **Nombre de situations** : 5

---

## Objectif pedagogique

Transformer une idee en **proposition racontable**. L'idee existe quand elle peut etre formulee simplement. Ce module prend le "Et si..." du Module 3 et le transforme en pitch structuree : personnage + objectif + obstacle.

## Competence developpee

**Structurer.**

## Ce que l'eleve apprend

> "Mon idee existe quand je la formule simplement."

---

## Structure (dbModule=10, seance=2, 5 situations)

### Vue synoptique

| Position | Bloc | Type | Composant | Description |
|----------|------|------|-----------|-------------|
| 0 | Personnage | Special | `AvatarBuilderState` | Creation d'avatar style jeu video (DiceBear) |
| 1 | Objectif + Obstacle | Special | `ObjectifObstacleState` | Formule mixte ecriture libre + aide visuelle |
| 2 | Pitch | Special | `PitchAssemblyState` | Construction du pitch --- structure a trous |
| 3 | Chrono | Special | `ChronoTestState` | Test chronometree ~30s maximum |
| 4 | Confrontation | Special | `PitchConfrontationState` | Envoi + confrontation douce anonyme |

### Constante `MODULE_SEANCE_SITUATIONS`

```typescript
// src/lib/constants.ts
10: { 1: 7, 2: 5 }  // Seance 2 = Pitch (5 positions)
```

---

## Detail des situations

### Position 0 --- Avatar Builder (AvatarBuilderState)

**Principe** : Creation d'un personnage par avatar style **jeu video**, pas fiche scolaire. L'eleve customise un personnage DiceBear Avataaars avec de multiples options visuelles. Il donne un prenom, un age, et choisit un trait dominant.

**Pas de fiche scolaire.** On ne demande pas "decris ton personnage". On le dessine.

**Variables de customisation** :

| Categorie | Nombre d'options | Fichier source |
|-----------|------------------|----------------|
| Couleur de peau | 7 | `AVATAR_SKIN_COLOR` |
| Coiffure | 28 + chauve | `AVATAR_TOP` |
| Couvre-chef | 6 (dont "aucun") | `AVATAR_HEADWEAR` |
| Couleur cheveux | 10 | `AVATAR_HAIR_COLOR` |
| Yeux | 12 | `AVATAR_EYES` |
| Sourcils | 13 | `AVATAR_EYEBROWS` |
| Bouche | 12 | `AVATAR_MOUTH` |
| Vetement | 9 | `AVATAR_CLOTHING` |
| Couleur vetement | 12 | `AVATAR_CLOTHES_COLOR` |
| Accessoires | 8 (dont "aucun") | `AVATAR_ACCESSORIES` |
| Pilosite faciale | 6 (dont "aucune") | `AVATAR_FACIAL_HAIR` |
| Motif t-shirt | 10 | `AVATAR_GRAPHIC` |
| Couleur fond | 10 | `AVATAR_BACKGROUND` |

**8 traits de caractere disponibles** :

| Cle | Label | Description |
|-----|-------|-------------|
| `courageux` | Courageux | N'a peur de rien, fonce toujours |
| `timide` | Timide | Observe beaucoup, parle peu |
| `drole` | Drole | Fait rire tout le monde, meme dans les moments durs |
| `rebelle` | Rebelle | N'accepte pas les regles, veut tout changer |
| `reveur` | Reveur | Toujours dans sa tete, imagine des mondes |
| `loyal` | Loyal | Ferait n'importe quoi pour ses amis |
| `malin` | Malin | Toujours un plan, toujours une idee |
| `sensible` | Sensible | Ressent tout plus fort que les autres |

**Forces + faiblesses** : obligatoires. Le trait dominant implique des forces et des faiblesses narratives.

**Donnees soumises** : `POST /api/sessions/{id}/personnage`
```json
{ "studentId": "...", "prenom": "...", "age": "...", "traitDominant": "...", "avatarData": { ... } }
```

**Composant additionnel** : `AvatarDoneState` (`avatar-done-state.tsx`) --- ecran de confirmation apres soumission.

**Donnees retournees** :
```typescript
module10: {
  type: "avatar",
  personnage: { prenom, age, trait, avatar } | null,
  submitted: boolean,
  submittedCount: number,
  allSubmissions: [{ studentName, text, studentId, avatar }],  // Vue facilitateur
}
```

### Position 1 --- Objectif + Obstacle (ObjectifObstacleState)

**Principe** : Formule mixte. Ecriture libre guidee par des **objectifs-types** et **obstacles-types** visuels. L'eleve peut choisir un type predefini ou ecrire librement (prefixe `custom:`).

**8 objectifs-types** :

| Cle | Label | Exemple |
|-----|-------|---------|
| `sauver` | Sauver quelqu'un | Mon personnage veut sauver son meilleur ami |
| `prouver` | Prouver quelque chose | Mon personnage veut prouver qu'il a raison |
| `fuir` | S'echapper | Mon personnage veut fuir un endroit dangereux |
| `trouver` | Trouver la verite | Mon personnage veut decouvrir un secret |
| `gagner` | Gagner un defi | Mon personnage veut remporter la competition |
| `proteger` | Proteger un secret | Mon personnage veut cacher quelque chose |
| `changer` | Changer sa vie | Mon personnage veut tout recommencer |
| `venger` | Reparer une injustice | Mon personnage veut que justice soit faite |

**8 obstacles-types** :

| Cle | Label | Exemple |
|-----|-------|---------|
| `rival` | Un rival puissant | Quelqu'un d'autre veut la meme chose |
| `mensonge` | Un mensonge | Tout repose sur un mensonge qui pourrait eclater |
| `temps` | Le temps qui presse | Il n'a que 24 heures pour agir |
| `trahison` | Une trahison | Quelqu'un de proche l'a trahi |
| `peur` | Sa propre peur | Il doit affronter ce qui le terrifie |
| `regles` | Les regles | Le systeme est contre lui |
| `solitude` | La solitude | Personne ne le croit, il est seul |
| `secret` | Un secret du passe | Le passe revient le hanter |

**L'avatar du personnage** est rechargee en contexte pour rappeler a l'eleve qui est son heros.

**Donnees retournees** :
```typescript
module10: {
  type: "objectif",
  personnage: { prenom, age, trait, avatar } | null,
  objectif: string | null,
  obstacle: string | null,
  submitted: boolean,
  submittedCount: number,
  allSubmissions: [{ studentName, text: "objectif — obstacle", studentId }],
}
```

### Position 2 --- Construction du pitch (PitchAssemblyState)

**Principe** : Structure a trous commune. Le pitch academique est **identique pour tous** : "[Prenom] veut [objectif]. Mais [obstacle]. Alors [resolution]." L'eleve remplit les trous a partir des elements deja collectes (personnage, objectif, obstacle) et ajoute la resolution.

**Le "Et si..."** du Module 3 est rechargee comme contexte (`etsiText`) pour rappeler l'idee de depart.

**Donnees retournees** :
```typescript
module10: {
  type: "pitch",
  personnage: { prenom, age, trait, avatar } | null,
  objectif: string | null,
  obstacle: string | null,
  pitchText: string | null,
  etsiText: string | undefined,  // Rechargee depuis M3
  submitted: boolean,
  submittedCount: number,
  allSubmissions: [{ studentName, text: pitchText, studentId }],
}
```

### Position 3 --- Test chrono (ChronoTestState)

**Principe** : L'eleve lit son pitch a voix haute en **~30 secondes maximum**. Le chrono tourne. Si le pitch est trop long, il faut l'editer pour le rendre plus concis.

**Configuration** :
```typescript
// src/lib/module10-data.ts
CHRONO_DURATION = 30;  // secondes
```

**Message** : "Parle calmement, comme a un adulte."

**Bouton "Envoyer"** : Le composant enregistre le temps (`chrono_seconds`) dans `module10_pitchs`.

**Donnees retournees** :
```typescript
module10: {
  type: "chrono",
  pitchText: string | null,
  chronoSeconds: number | null,
  submitted: boolean,
  submittedCount: number,
  allSubmissions: [{ studentName, text: "prenom — Xs", studentId }],  // Trie par temps asc
}
```

### Position 4 --- Confrontation douce (PitchConfrontationState)

**Principe** : Envoi du pitch + confrontation anonyme. Le pilote peut choisir 2 pitchs a confronter via query params (`pitchA`, `pitchB`). Sinon, les 2 premiers sont selectionnes par defaut.

**3 questions d'auto-audit** :
- Qui est le personnage ?
- Que veut-il ?
- Qu'est-ce qui l'empeche ?

Si l'eleve ne peut pas repondre clairement a ces 3 questions, le pitch n'est pas encore assez clair.

**Donnees retournees** :
```typescript
module10: {
  type: "confrontation",
  confrontation: {
    pitchA: { text, studentId, prenom },
    pitchB: { text, studentId, prenom },
  } | null,
  pitchList: [{ studentId, prenom, text (80 chars) }],  // Pour le picker pilote
  submittedCount: number,
}
```

---

## Mapping technique complet

### Fichiers cle

| Element | Chemin |
|---------|--------|
| Handler API | `src/app/api/sessions/[id]/situation/handlers/module10.ts` |
| Handler standard M10 | `handleStandardWithModule10()` (meme fichier) |
| Dispatch | `src/app/api/sessions/[id]/situation/route.ts` (L.69-72) |
| Composants eleve | `src/components/play/module-10/avatar-builder-state.tsx` |
| | `src/components/play/module-10/avatar-done-state.tsx` |
| | `src/components/play/module-10/objectif-obstacle-state.tsx` |
| | `src/components/play/module-10/pitch-assembly-state.tsx` |
| | `src/components/play/module-10/chrono-test-state.tsx` |
| | `src/components/play/module-10/pitch-confrontation-state.tsx` |
| Types polling | `src/hooks/use-session-polling.ts` (`Module10Data`) |
| Donnees statiques | `src/lib/module10-data.ts` |
| Definition module | `src/lib/modules-data.ts` (ID `m10b`) |
| API personnage | `src/app/api/sessions/[id]/personnage/route.ts` |
| API pitch | `src/app/api/sessions/[id]/pitch/route.ts` |

### Tables Supabase

| Table | Colonnes cle | Usage |
|-------|-------------|-------|
| `module10_personnages` | session_id, student_id, prenom, age, trait_dominant, avatar_data, submitted_at | Avatars personnages |
| `module10_pitchs` | session_id, student_id, objectif, obstacle, pitch_text, chrono_seconds, created_at | Pitchs complets |
| `module10_etsi` | (partagee avec M3) | Rechargee pour contexte |
| `module10_help_requests` | (partagee avec M3) | Aide activable par intervenant |

### Migration

- `024_module10_etsi_pitch.sql` --- Tables module10 completes (partagee avec M3)

### Categorie narrative

```typescript
{ key: "pitch", label: "Pitch", color: "#F59E0B" }
```

---

## Flux de donnees complet M3 + M4

```
Module 3 (seance 1)                Module 4 (seance 2)
────────────────────                ────────────────────
pos 0: EtsiWriter ─────────────────── rechargee dans PitchAssembly (etsiText)
  └─> module10_etsi

pos 1-5: QCM narratifs              pos 0: AvatarBuilder
  └─> responses                        └─> module10_personnages
                                           └─> rechargee dans pos 1, 2

pos 6: IdeaBank                     pos 1: ObjectifObstacle
  └─> module10_idea_bank               └─> module10_pitchs (objectif, obstacle)

                                    pos 2: PitchAssembly
                                       └─> module10_pitchs (pitch_text)

                                    pos 3: ChronoTest
                                       └─> module10_pitchs (chrono_seconds)

                                    pos 4: Confrontation
                                       └─> lecture module10_pitchs + module10_personnages
```

---

## Architecture du handler module10.ts

Le handler `handleModule10()` est un switch sur `currentSeance` puis `currentIndex` :

```
handleModule10(req, session, sessionId, admin)
├── seance === 1 (M3 — Et si...)
│   ├── index === 0 → etsi (special)
│   ├── index 1-5 → handleStandardWithModule10() (QCM)
│   └── index === 6 → idea-bank (special)
│
├── seance === 2 (M4 — Pitch)
│   ├── index === 0 → avatar (special)
│   ├── index === 1 → objectif (special)
│   ├── index === 2 → pitch (special)
│   ├── index === 3 → chrono (special)
│   └── index === 4 → confrontation (special)
│
└── fallback → handleStandardWithModule10()
```

---

## Interseance M4 vers M5

La transition vers le Module 5 (Construire --- Construction Collective) est la plus importante du parcours :

- **Simulations de groupes** : les pitchs permettent de constituer des groupes complementaires
- **Pools de cartes pour M5** : les idees individuelles sont extraites et transformees en cartes de vote (processus "entonnoir"). Chaque manche du M5 utilise des cartes issues des pitchs M4.
- **Regle de representation minimale** : chaque eleve retrouve une trace de son travail dans les cartes proposees
- **API de preparation** : `POST /api/sessions/{id}/collective-pools` declenche l'extraction

---

## Principes pedagogiques Adrian

1. **Rester ludique, pas scolaire.** L'avatar remplace la fiche de personnage. Le chrono remplace la redaction. Le pitch remplace la dissertation.
2. **Les incoherences ne bloquent pas le processus.** Un personnage courageux qui a peur, un objectif qui contredit l'obstacle --- tout est permis a ce stade. La coherence viendra avec la pratique.
3. **Le personnage reste modifiable.** Rien n'est fige. L'eleve peut revenir sur ses choix. Le processus est iteratif, pas lineaire.
4. **Le chrono force la concision.** 30 secondes maximum. Si l'eleve ne peut pas raconter son film en 30 secondes, l'idee n'est pas encore claire. Le chrono n'est pas punitif : il est revelateur.
5. **La confrontation est douce.** Anonyme, sans jugement. Les 3 questions (qui ? que veut-il ? qu'empeeche ?) sont des outils de clarification, pas d'evaluation.
6. **L'avatar n'est pas un dessin de soi.** C'est le personnage du film. La diversite des options (28 coiffures, 7 tons de peau, 9 vetements) permet a chaque eleve de creer un personnage **different de lui**.
7. **Le pitch est une formule, pas une performance.** La structure a trous egalise les niveaux. Chaque eleve produit un pitch, meme celui qui "n'aime pas ecrire".
