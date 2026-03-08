# Module 5 --- Construire (Construction Collective)

> **Position dans le parcours** : Module 5 / 8 du parcours principal
> **Phase** : `creation` --- Construction
> **Couleur** : identifie visuellement par les couleurs des manches
> **dbModule** : `12`
> **Duree totale estimee** : ~45 min (1 seance, 8 manches)

---

## Objectif pedagogique

Les idees individuelles cessent d'appartenir a quelqu'un pour devenir des **ressources communes**. "Les idees deviennent des pieces d'un puzzle narratif." Chaque eleve a contribue au Module 3 (Et si...) et au Module 4 (Pitch) ; ici, toutes ces contributions sont brassees, anonymisees, et soumises au vote collectif.

## Competence developpee

**Cooperer.**

## Ce que l'eleve apprend

> "Nos idees individuelles = puzzle collectif."

## Le vrai enjeu psychologique

Passer de **"j'espere que mon idee sera choisie"** a **"comment on fabrique la meilleure histoire avec tout ca ?"**. L'anonymisation des cartes est la cle : personne ne sait qui a propose quoi. Le vote porte sur l'idee, pas sur la personne. C'est un glissement psychologique majeur dans la dynamique de classe.

---

## Structure du module

### Vue synoptique

| Manche | Cle      | Label              | Max cartes | Description                        |
|--------|----------|--------------------|------------|------------------------------------|
| 1      | `ton`    | Le Ton             | 4          | Quel sera le ton du film ?         |
| 2      | `situation` | La Situation    | 4          | Quelle situation de depart ?       |
| 3      | `personnages` | Les Personnages | 6         | Quels personnages ?                |
| 4      | `objectif` | L'Objectif       | 4          | Quel objectif pour le heros ?      |
| 5      | `obstacle` | L'Obstacle       | 4          | Quel obstacle principal ?          |
| 6      | `scene`  | La Premiere Scene  | 4          | Comment commence le film ?         |
| 7      | `relation` | La Relation      | 4          | Quelle relation est au coeur de l'histoire ? |
| 8      | `moment_fort` | Le Moment Fort | 4          | Quel sera le moment le plus intense du film ? |

### Constante `MODULE_SEANCE_SITUATIONS`

```typescript
// src/lib/constants.ts
12: { 1: 8 }  // Construction Collective: 8 manches de vote
```

---

## L'algorithme entonnoir

L'algorithme de selection des cartes est le coeur technique du module. Il est implemente dans `selectCards()` et suit une logique en 4 etapes :

### Etape 1 : Priorite aux eleves "non couverts"

```typescript
// src/lib/module12-data.ts — selectCards()
const uncoveredCandidates = candidates.filter((c) => uncoveredIds.has(c.studentId));
const coveredCandidates = candidates.filter((c) => !uncoveredIds.has(c.studentId));
const ordered = [...uncoveredCandidates, ...coveredCandidates];
```

Les eleves dont **aucune idee** n'est apparue dans les manches precedentes sont prioritaires. C'est la regle de representation minimale : chaque eleve doit voir **au moins une trace** de sa contribution quelque part dans le processus.

Le suivi de couverture est assure par `getUncoveredStudents()` qui parcourt tous les pools deja generes et identifie les `contributorIds` absents.

### Etape 2 : Deduplication

```typescript
// src/lib/module12-data.ts — areTooSimilar()
const ratio = overlap / Math.min(wordsA.length, wordsB.length);
return ratio > 0.6;
```

Deux textes sont consideres comme **quasi-identiques** si plus de 60% de leurs mots-cles se chevauchent (apres normalisation : minuscules, suppression des accents courts, mots > 2 caracteres). Les doublons sont fusionnes/elimines pour eviter les cartes redondantes.

### Etape 3 : Templates Banlieuwood si < 3 cartes

Si une manche a moins de 3 cartes apres filtrage, le systeme complete avec des **templates Banlieuwood** predefinies. Exemples pour la manche 1 (Le Ton) :

| Template                                                   |
|------------------------------------------------------------|
| "Drole --- on rit, on se moque, mais on dit la verite"    |
| "Mysterieux --- tout est cache, rien n'est ce qu'il semble" |
| "Dramatique --- les emotions sont fortes, tout est intense" |
| "Realiste --- comme la vraie vie, sans filtre"              |

Chaque manche a au moins 2 templates disponibles dans `BANLIEUWOOD_TEMPLATES`.

### Etape 4 : Plafond a maxCards

Le nombre final de cartes est plafonne a `maxCards` (4 pour la plupart des manches, **6 pour les personnages**).

---

## Sources des cartes (extraction M10)

Chaque manche puise dans des donnees specifiques du Module 10 (Et si... + Pitch). L'extraction est realisee par `extractCandidates()` :

| Manche | Source M10                          | Table DB               | Champ extrait                |
|--------|-------------------------------------|------------------------|------------------------------|
| 1 - Ton | QCM direction narrative (M10 S1 P2) | `responses` (M10)      | `text` (tronque a 80 car.)  |
| 2 - Situation | Textes "Et si..."            | `module10_etsi`        | `etsi_text` (tronque a 120) |
| 3 - Personnages | Avatars personnages        | `module10_personnages` | `prenom + age + trait_dominant` |
| 4 - Objectif | Pitchs                         | `module10_pitchs`      | `objectif` (tronque a 100)  |
| 5 - Obstacle | Pitchs                         | `module10_pitchs`      | `obstacle` (tronque a 100)  |
| 6 - Premiere Scene | Pitchs                   | `module10_pitchs`      | `pitch_text` (1ere phrase)  |

---

## Anonymisation

Cote eleve, les cartes sont **toujours anonymes**. Le handler `handleModule12()` retire explicitement les `contributorIds` avant de retourner les cartes :

```typescript
// handlers/module12.ts, ligne 56-60
const cards = rawCards.map((c) => ({
  cardId: c.cardId,
  text: c.text,
  isBanlieuwood: c.isBanlieuwood,
}));
```

Les `contributorIds` sont conserves en base (dans le JSONB `module12_pools.cards`) uniquement pour le suivi de couverture interne et le tableau de bord facilitateur.

---

## Le vote

- Chaque eleve vote **une seule fois** par manche (contrainte `UNIQUE(session_id, student_id, manche)`)
- Le facilitateur voit les **compteurs de votes** en temps reel (`voteCounts`)
- Les eleves ne voient que s'ils ont deja vote (`studentVote`)
- Le facilitateur valide le gagnant via `module12_winners` (pas forcement le plus vote --- veto pedagogique possible)

---

## Mapping technique

### Fichiers principaux

| Element          | Chemin                                                                    |
|------------------|---------------------------------------------------------------------------|
| Handler          | `src/app/api/sessions/[id]/situation/handlers/module12.ts`               |
| Data / Config    | `src/lib/module12-data.ts`                                                |
| Inter-seance API | `src/app/api/sessions/[id]/collective-pools/route.ts`                    |
| Vote API         | `src/app/api/sessions/[id]/manche-vote/` (non lu, dedie au POST vote)    |
| Winner API       | `src/app/api/sessions/[id]/manche-winner/`                               |
| Composant eleve  | `src/components/play/module-12/manche-vote-state.tsx`                    |
| Cockpit pilote   | `src/components/pilot/module12-cockpit.tsx`                              |
| Polling          | `Module12Data` dans `src/hooks/use-session-polling.ts`                   |
| Migration        | `supabase/migrations/040_module12_construction_collective.sql`           |
| Constants        | `MODULE_SEANCE_SITUATIONS[12]` dans `src/lib/constants.ts`               |

### Tables DB

| Table              | Description                                    | Cle unique                      |
|--------------------|------------------------------------------------|---------------------------------|
| `module12_pools`   | Cartes par manche (JSONB)                      | `(session_id, manche)`          |
| `module12_votes`   | Votes des eleves                               | `(session_id, student_id, manche)` |
| `module12_winners` | Gagnants valides par le facilitateur           | `(session_id, manche)`          |

### Types TypeScript

```typescript
// src/lib/module12-data.ts
export interface MancheConfig {
  key: string;      // "ton", "situation", "personnages"...
  label: string;    // "Le Ton", "La Situation"...
  maxCards: number;  // 4 ou 6
  description: string;
}

export interface PoolCard {
  cardId: string;
  text: string;
  sourceType: "student" | "banlieuwood";
  contributorIds: string[];
  isBanlieuwood: boolean;
}
```

### Donnees retournees par l'API (cote eleve)

```typescript
module12: {
  type: "manche-vote",
  manche: number,            // 1-6 (theoriquement 1-8)
  mancheLabel: string,       // "Le Ton"
  cards: { cardId, text, isBanlieuwood }[],  // sans contributorIds
  studentVote: string | null,
  voteCounts: null,          // null cote eleve, objet cote facilitateur
  winner: { cardId, text } | null,
  allWinners: { manche, text }[],
  poolReady: boolean,
}
```

### Interseance API

**`POST /api/sessions/[id]/collective-pools`** --- Genere les pools de cartes a partir des donnees M10.

Flux :
1. Recupere toutes les donnees M10 (etsi, personnages, pitchs, QCM)
2. Pour chaque manche (1-6), appelle `extractCandidates()` + `selectCards()`
3. Insere les pools en base (`module12_pools`)
4. Retourne le nombre de cartes eleve vs Banlieuwood par manche

Supporte `force=true` pour regenerer les pools (supprime les existants d'abord).

---

## Interseance M5 vers M6

A la fin du Module 5 (Construction Collective), les gagnants des 6 manches sont stockes dans `module12_winners`. Le passage au Module 6 (Ecrire) se fait via :

**`POST /api/sessions/[id]/scenario-generate`**

Ce endpoint :
1. Recupere les `module12_winners` de la session
2. Genere un prompt IA avec les gagnants
3. L'IA produit 4-6 scenes V0 incompletes
4. Les scenes sont inserees dans `module6_scenes`
5. Les missions sont assignees aux eleves dans `module6_missions`

---

## Principes pedagogiques Adrian

- **Pas de concours ni d'elimination.** On assemble, on ne jette pas. Meme les idees non votees ont participe au processus.
- **Le vote est la mecanique centrale**, pas le debat oral. L'oral sert d'explicitation apres le vote, pas de moteur de decision.
- **Cartes anonymes.** Le vote est social (quelle idee est la meilleure ?) et non personnel (qui a eu la meilleure idee ?).
- **Regle de representation minimale.** Chaque eleve doit voir au moins une trace de sa contribution dans l'ensemble du processus. L'algorithme d'entonnoir le garantit par la priorite aux eleves "non couverts".
- **Templates Banlieuwood.** Si la classe n'a pas assez de materiel (classes petites, M10 incomplet), les templates Banlieuwood comblent les trous avec des propositions calibrees.
- **Veto facilitateur.** Le gagnant n'est pas forcement le plus vote. Le facilitateur peut valider un autre choix si le plus vote pose un probleme pedagogique (violence, discrimination, hors-sujet).

---

## Ecarts code vs document Adrian

| Point                            | Adrian                           | Code actuel                    |
|----------------------------------|----------------------------------|--------------------------------|
| Nombre de manches                | 8 manches                        | 6 manches (config TS)          |
| Manches 7-8                      | Relation + Moment Fort           | Seedees en base, pas dans MANCHES |
| MODULE_SEANCE_SITUATIONS         | 8                                | 6                              |
| DB CHECK constraint              | `BETWEEN 1 AND 8`               | Coherent avec Adrian           |
| Nombre de cartes max personnages | "5-6 cartes (plus que les autres)" | `maxCards: 6` (OK)          |
