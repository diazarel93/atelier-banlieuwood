# Module 3 --- Imaginer (Le "Et si...")

> **Position dans le parcours** : Module 3 / 8 du parcours principal
> **Phase** : `imagination` --- Imagination
> **Couleur** : `#06B6D4` (cyan)
> **dbModule** : `10`, **dbSeance** : `1`
> **ID code** : `m10a`
> **Duree estimee** : 25 min
> **Nombre de situations** : 7

---

## Objectif pedagogique

Amener chaque eleve a produire **au moins un "Et si..."** suffisamment solide pour devenir la base d'un recit. Ce module ne demande pas d'ecrire une histoire : il demande de **formuler une question** qui contient une histoire en puissance.

## Competence developpee

**Inventer.**

## Ce que l'eleve apprend

> '"Et si..." = etincelle de scenario.'

## Caracteristiques

Ce module est **INTROSPECTIF**. Calme, concentre, peu bavard. L'idee a besoin de silence pour emerger. Le facilitateur ne pousse pas, ne relance pas de maniere insistante. Il cree les conditions pour que l'imagination travaille seule.

---

## Structure (dbModule=10, seance=1, 7 situations)

### Vue synoptique

| Position | Type | Composant | Description |
|----------|------|-----------|-------------|
| 0 | Special | `EtsiWriterState` | Selection d'images + ecriture "Et si..." |
| 1 | QCM standard | --- | Ton de l'histoire |
| 2 | QCM standard | --- | Type de personnage |
| 3 | QCM standard | --- | Type de declencheur |
| 4 | QCM standard | --- | Duree/format |
| 5 | QCM standard | --- | Type de fin |
| 6 | Special | `IdeaBankState` | Banque d'idees collaborative |

### Constante `MODULE_SEANCE_SITUATIONS`

```typescript
// src/lib/constants.ts
10: { 1: 7, 2: 5 }  // Seance 1 = Et si... (7), Seance 2 = Pitch (5)
```

---

## Detail des situations

### Situation 0 --- Selection d'images + "Et si..." (EtsiWriterState)

**Principe** : 10 images "legerement desequilibrees" sont presentees. L'eleve traverse 3 phases :

1. **Phase `select3`** : Parcourir les 10 images et en selectionner jusqu'a 3 (maximum)
2. **Phase `narrow1`** : N'en choisir qu'une seule parmi les 3
3. **Phase `write`** : Ecriture de la phrase "Et si..." dans un champ texte libre

**Seule ecriture obligatoire** : la phrase "Et si..." (minimum 5 caracteres).

**Les 10 images "Et si..."** :

| ID | Titre | Description |
|----|-------|-------------|
| `etsi-banc` | Le banc vide | Un banc vide dans une cour d'ecole, un sac oublie dessus |
| `etsi-fenetre` | La fenetre | Quelqu'un regarde par la fenetre d'un immeuble, la nuit |
| `etsi-escalier` | L'escalier | Un escalier sombre dans un immeuble, une lumiere au bout |
| `etsi-terrain` | Le terrain vague | Un terrain vague entre deux immeubles, des traces de pas dans la boue |
| `etsi-bus` | L'arret de bus | Un arret de bus la nuit, deux personnes dos a dos |
| `etsi-miroir` | Le miroir | Un miroir brise dans une salle de bain, un reflet fragmente |
| `etsi-cafe` | Le cafe | Un cafe presque vide, une tasse encore chaude sur une table abandonnee |
| `etsi-graffiti` | Le graffiti | Un mur tague avec un message a moitie efface, des couleurs vives |
| `etsi-parking` | Le parking | Un parking souterrain desert, une seule voiture sous un neon |
| `etsi-toit` | Le toit | Le toit d'un immeuble au coucher du soleil, la ville s'etend a perte de vue |

**Images SVG** : stockees dans `/public/images/etsi/{id}.svg`

**Systeme d'aide** :
- L'aide est **activable par l'intervenant**, pas automatique
- 3 types d'aide : `example` (exemple), `reformulate` (reformulation), `starter` (debut de phrase)
- Maximum 3 aides par etape (`MAX_HELP_PER_STEP = 3`)
- L'aide est generee par IA avec fallbacks statiques
- Le champ `helpUsed` trace si l'eleve a utilise l'aide

**Fonctionnement technique** :

```typescript
// Composant: src/components/play/module-10/etsi-writer-state.tsx
// Phase machine: "select3" → "narrow1" → "write"
// Submit: POST /api/sessions/{id}/etsi
// Body: { studentId, imageId, etsiText, helpUsed }
```

**Donnees retournees par l'API** :
```typescript
module10: {
  type: "etsi",
  image: { id, url, title, description } | null,  // Image choisie
  images: ETSI_IMAGES,                             // Les 10 images
  etsiText: string | undefined,
  helpUsed: boolean,
  submitted: boolean,
  submittedCount: number,
  allSubmissions: [{ studentName, text, studentId }],  // Vue facilitateur
}
```

### Situations 1-5 --- QCM narratifs (standard)

Apres l'ecriture du "Et si...", l'eleve repond a 5 QCM qui **structurent** son idee sans qu'il s'en rende compte :

| Position | Theme | Question type |
|----------|-------|---------------|
| 1 | Ton de l'histoire | "Plutot drole ? Tendu ? Triste ?" |
| 2 | Type de personnage | "Qui est le heros ?" |
| 3 | Type de declencheur | "Qu'est-ce qui declenche tout ?" |
| 4 | Duree / format | "Court ou long ?" |
| 5 | Type de fin | "Comment ca finit ?" |

**Handler** : `handleStandardWithModule10()` --- delegue au handler standard avec donnees module10 attachees.

Les situations sont stockees dans la table `situations` avec `module=10, seance=1, position=2..6`.

### Situation 6 --- Banque d'idees (IdeaBankState)

**Principe** : Bouton "Je partage pour aider" --- solidarite inter-eleves. Les eleves qui le souhaitent partagent leur "Et si..." dans une banque commune. Les autres peuvent voter (upvote) pour les idees qui les inspirent.

**Composant** : `IdeaBankState` (`src/components/play/module-10/idea-bank-state.tsx`)

**Donnees retournees** :
```typescript
module10: {
  type: "idea-bank",
  ideaBankItems: [{ id, text, votes }],  // Triees par votes desc
  ideaBankCount: number,
  submitted: boolean,
  submittedCount: number,
}
```

---

## Mapping technique complet

### Fichiers cle

| Element | Chemin |
|---------|--------|
| Handler API | `src/app/api/sessions/[id]/situation/handlers/module10.ts` |
| Handler standard M10 | `handleStandardWithModule10()` dans le meme fichier |
| Dispatch | `src/app/api/sessions/[id]/situation/route.ts` (L.69-72) |
| Composants eleve | `src/components/play/module-10/etsi-writer-state.tsx` |
| | `src/components/play/module-10/idea-bank-state.tsx` |
| Types polling | `src/hooks/use-session-polling.ts` (`Module10Data`) |
| Donnees statiques | `src/lib/module10-data.ts` (ETSI_IMAGES, helpers) |
| Definitions module | `src/lib/modules-data.ts` (ID `m10a`) |
| API submit "Et si" | `src/app/api/sessions/[id]/etsi/route.ts` |
| API banque d'idees | `src/app/api/sessions/[id]/idea-bank/route.ts` |
| API aide | `src/app/api/sessions/[id]/help-request/route.ts` |

### Tables Supabase

| Table | Usage |
|-------|-------|
| `situations` | Questions QCM (module=10, seance=1, positions 2-6) |
| `responses` | Reponses QCM standard |
| `module10_etsi` | Textes "Et si..." (session_id, student_id, image_id, etsi_text, help_used, submitted_at) |
| `module10_idea_bank` | Banque d'idees (session_id, student_id, text, votes) |
| `module10_help_requests` | Demandes d'aide (session_id, student_id, step, type, hint, count) |

### Migration

- `024_module10_etsi_pitch.sql` --- Tables module10 (etsi + personnages + pitchs + idea_bank + help_requests)

### Categorie narrative

```typescript
{ key: "imagination", label: "Imagination", color: "#06B6D4" }
```

---

## Interface `Module10Data` (partage avec M4)

```typescript
// src/hooks/use-session-polling.ts
export interface Module10Data {
  type: "etsi" | "qcm" | "idea-bank" | "avatar" | "objectif" | "pitch" | "chrono" | "confrontation";
  // Et si (seance 1)
  image?: { id; url; title; description } | null;
  images?: EtsiImage[];
  etsiText?: string;
  helpUsed?: boolean;
  submitted?: boolean;
  ideaBankCount?: number;
  ideaBankItems?: { id; text; votes }[];
  // ... (types pitch dans Module 4)
  submittedCount?: number;
  allSubmissions?: { studentName; text; studentId; avatar? }[];
}
```

---

## Systeme d'aide

L'aide n'est **pas automatique**. L'intervenant active l'aide pour un eleve qui bloque.

```typescript
// src/lib/module10-data.ts
HELP_TYPES = ["example", "reformulate", "starter"];
MAX_HELP_PER_STEP = 3;
HELP_STEPS = ["etsi", "pitch"];
```

| Type | Description |
|------|-------------|
| `example` | Montre un exemple de "Et si..." pour inspirer |
| `reformulate` | Reformule l'idee de l'eleve pour la clarifier |
| `starter` | Propose un debut de phrase a completer |

L'aide est generee par IA (Ollama/Claude) avec des fallbacks statiques en cas d'echec.

---

## Interseance M3 vers M4

La transition vers le Module 4 (Clarifier / Pitch) exploite directement les donnees M3 :

- **Pitch miroir imparfait** genere automatiquement a partir du "Et si..." + reponses QCM
- **Regroupements d'idees** : les facilitateurs peuvent voir les themes emergents
- **Lecture des envies narratives** : quels tons dominent ? quels types de personnages ?
- **Banque d'idees** : les idees partagees alimentent l'inspiration collective

Le `etsi_text` est rechargee en seance 2 position 2 (pitch assembly) pour rappeler a l'eleve son idee de depart.

---

## Principes pedagogiques Adrian

1. **Cadre scolaire obligatoire.** Les images representent des lieux connus (cour d'ecole, arret de bus, immeuble). Pas d'histoire "ingerable" (pas de guerre, pas de fantasy debridee).
2. **L'objectif est l'emergence, pas la qualite finale.** Un "Et si le sac sur le banc appartenait a quelqu'un qui a disparu ?" suffit. On ne demande pas un scenario.
3. **Silence = travail.** Le facilitateur ne relance pas. Il laisse le temps. L'imagination a besoin d'espace.
4. **Pas d'aide automatique.** L'aide est un choix de l'intervenant, pas un reflexe de l'application. L'eleve doit d'abord essayer seul.
5. **Le partage est volontaire.** La banque d'idees repose sur la generosite, pas sur la contrainte. "Je partage pour aider" est un acte delibere.
6. **Les QCM ne sont pas evaluatifs.** Ils structurent la pensee sans que l'eleve le sache. Il n'y a pas de mauvaise reponse.
7. **Les 10 images sont "legerement desequilibrees".** Elles suggerent une tension sans la nommer. C'est l'eleve qui decide ce qui "ne va pas" dans l'image.
