# Spec Technique — Gradient de Gamification
## Banlieuwood — Reference implementation

**Objet** : definir exactement quels elements d'interface afficher ou masquer selon le niveau d'age / profondeur de session.
**Usage** : le parametre `depth` de la session (voir SPEC_NIVEAUX_SPIRALAIRES.md) controle la couche de presentation. Les mecaniques internes (points, attribution) restent identiques — seul l'affichage change.

---

## Regle absolue (tous niveaux)

**JAMAIS de classement comparatif entre eleves.** Pas de leaderboard, pas de podium, pas de "tu es Xe sur Y". Cette regle est la doctrine fondamentale Banlieuwood et ne varie pas.

---

## Matrice globale

| Element UI | Decouverte (CM1-6e) | Exploration (5e-4e) | Maitrise (3e-2nde) | Auteur (1re-Tle) |
|------------|--------------------|--------------------|-------------------|-----------------|
| **XP affiche** | Oui — barre + compteur visible apres chaque action | Oui — compteur discret (coin ecran) | Non — XP calcule en back-end, jamais affiche | Non |
| **Notification XP** | "+10 XP !" avec animation | "+10 XP" sans animation, texte simple | Non | Non |
| **Niveau / rang XP** | Affiche ("Explorateur", "Createur"...) | Affiche discretement | Non | Non |
| **Badges / succes** | Oui — popup celebratoire quand debloques | Oui — notification discrete | Non | Non |
| **Confettis / particules** | Oui — apres vote, fin de module, deblocage | Reduits — seulement fin de module | Non | Non |
| **Animations de transition** | Riches (slide, bounce, scale) | Moderees (fade, slide) | Minimales (fade uniquement) | Aucune animation ludique — transitions directes |
| **Emojis dans les prompts** | Oui (🎬 ✨ 🎤) | Quelques-uns | Non | Non |
| **Carte talent M8** | Style Pokemon — grande, coloree, emoji, forces avec superlatifs | Style carte de visite — sobre, forces factuelles | Style fiche de poste — role + responsabilites | Style portfolio — competences + lien orientation |
| **Son / feedback sonore** | Optionnel — son de validation, son de vote | Non | Non | Non |
| **Mascotte / personnage guide** | Possible si existe | Non | Non | Non |
| **Timer visible (M4)** | Grand chrono anime | Chrono simple | Chrono discret | Chrono minimal (chiffres seuls) |
| **Texte de felicitation** | "Bravo !", "Super idee !", "Tu geres !" | "Bien joue", "C'est note" | Pas de felicitation — confirmation neutre ("Reponse envoyee") | Confirmation minimale ("Enregistre") |
| **Header / barre de progression** | Barre coloree avec etapes (module 1/8) | Barre simplifiee | Indicateur de phase (texte seul) | Indicateur minimal |
| **Couleurs de l'interface** | Vives, saturees (gradients actuels) | Vives mais moins saturees | Neutres avec accents de couleur | Monochromes avec accent unique |
| **Taille de police prompts** | Grande (18-20px) | Standard (16px) | Standard (16px) | Standard (15px) |

---

## Detail par composant

### 1. Barre XP (`XpBar` / `XpNotification`)

```
Decouverte:
  - Visible en permanence en bas de l'ecran eleve
  - Animation de remplissage fluide
  - "+X XP" popup anime sur chaque action
  - Changement de niveau = animation speciale (confettis + texte)
  - Labels de niveau : "Observateur" → "Explorateur" → "Createur" → "Auteur"

Exploration:
  - Petit compteur en haut a droite (icone etoile + nombre)
  - "+X XP" texte discret, disparait en 1s
  - Changement de niveau = texte "Nouveau niveau !"
  - Memes labels

Maitrise:
  - Pas d'affichage XP
  - XP calcule en back-end (pour M8 attribution)
  - Aucune notification

Auteur:
  - Pas d'affichage XP
  - XP calcule en back-end
  - Aucune notification
```

### 2. Badges / Succes (`AchievementPopup`)

```
Decouverte:
  - Popup central avec icone doree + description
  - Animation d'apparition (scale + shine)
  - Collection visible dans le profil eleve
  - Exemples : "Premiere idee !", "Roi du vote", "Scenario termine"

Exploration:
  - Toast notification en haut (petite, disparait en 3s)
  - Collection visible mais pas mise en avant
  - Memes badges, presentation sobre

Maitrise:
  - Aucun badge affiche
  - Les accomplissements existent en back-end (pour la carte talent M8)
  - Pas de popup, pas de collection visible

Auteur:
  - Aucun badge
  - Aucune mecanique visible de succes
```

### 3. Confettis / Particules (`canvas-confetti`)

```
Decouverte:
  - Confettis sur : fin de vote (M5), fin de scenario (M6), carte talent (M8)
  - Particules dorees sur : deblocage badge, changement niveau XP
  - Couleurs vives, duree 2-3s

Exploration:
  - Confettis uniquement sur : carte talent (M8) — moment final celebratoire
  - Pas de particules intermediaires

Maitrise:
  - Aucun confetti
  - Aucune particule

Auteur:
  - Aucun effet visuel celebratoire
```

### 4. Carte Talent M8 (`TalentCard`)

```
Decouverte:
  - Format carte Pokemon
  - Fond gradie colore selon categorie talent
  - Avatar DiceBear grande taille
  - Nom en gros
  - Role avec emoji
  - 2 "super-pouvoirs" (forces) avec icones
  - Bordure brillante / holographique
  - Animation d'apparition spectaculaire

Exploration:
  - Format carte de visite horizontale
  - Fond uni avec accent de couleur
  - Avatar moyen
  - Nom + role
  - 3 forces listees simplement
  - Pas de bordure speciale
  - Animation sobre

Maitrise:
  - Format fiche de poste verticale
  - Fond blanc / gris clair
  - Avatar petit
  - Role en titre
  - Responsabilites du role (3 lignes)
  - Competences identifiees (3 forces)
  - Mention : "Ce role au cinema : [description metier reel]"
  - Pas d'animation

Auteur:
  - Format portfolio / CV
  - Fond blanc
  - Avatar minimal
  - Role + description professionnelle
  - Competences demontrees pendant l'atelier (3-4)
  - Lien metier reel (ref BTS audiovisuel ou equivalent)
  - Section "Pour aller plus loin" (formations, stages)
  - Export PDF possible (pour Parcoursup)
  - Pas d'animation
```

### 5. Prompts et consignes

```
Decouverte:
  - Tutoiement
  - Phrases courtes (max 15 mots)
  - Emojis dans les titres
  - Ton enthousiaste : "C'est parti !", "A toi !", "Montre ce que tu imagines !"
  - Exemples fournis pour chaque consigne

Exploration:
  - Tutoiement
  - Phrases moyennes (max 20 mots)
  - Emojis rares (1-2 par ecran max)
  - Ton encourageant mais sobre : "Prends le temps", "Reflechis bien"
  - Exemples optionnels

Maitrise:
  - Vouvoiement OU tutoiement selon choix intervenant
  - Phrases normales
  - Aucun emoji
  - Ton neutre-professionnel : "Ecrivez votre analyse", "Justifiez votre choix"
  - Pas d'exemples — l'eleve est autonome

Auteur:
  - Vouvoiement par defaut
  - Phrases normales a complexes
  - Aucun emoji
  - Ton professionnel : "Defendez votre intention", "Argumentez"
  - Aucun exemple, aucune aide visible
```

### 6. Ecran d'accueil / connexion eleve

```
Decouverte:
  - "Bienvenue dans l'atelier cinema ! 🎬"
  - Grand bouton colore "C'est parti !"
  - Avatar anime

Exploration:
  - "Atelier cinema — [Nom de la session]"
  - Bouton "Commencer"
  - Avatar statique

Maitrise:
  - "Session : [Nom]"
  - Bouton "Rejoindre"
  - Pas d'avatar a l'accueil

Auteur:
  - "[Nom de la session]"
  - "Rejoindre"
  - Interface minimale
```

---

## Implementation technique

### Approche recommandee

Un composant wrapper ou un contexte React qui fournit le `depth` a toute l'arborescence :

```typescript
// SessionDepthContext.tsx
const SessionDepthContext = createContext<SessionDepth>("decouverte");

// Hook utilitaire
function useSessionDepth() {
  return useContext(SessionDepthContext);
}

// Usage dans un composant
function XpNotification({ amount }: { amount: number }) {
  const depth = useSessionDepth();

  if (depth === "maitrise" || depth === "auteur") return null;

  if (depth === "exploration") {
    return <Toast>{`+${amount} XP`}</Toast>;
  }

  // decouverte
  return <AnimatedPopup>{`+${amount} XP !`}</AnimatedPopup>;
}
```

### Constantes de configuration

```typescript
const GAMIFICATION_CONFIG: Record<SessionDepth, {
  showXp: boolean;
  showXpNotification: boolean;
  showBadges: boolean;
  showConfetti: boolean;
  showEmojisInPrompts: boolean;
  animationLevel: "rich" | "moderate" | "minimal" | "none";
  talentCardStyle: "pokemon" | "business" | "job" | "portfolio";
  promptTone: "enthusiastic" | "encouraging" | "neutral" | "professional";
  felicitationLevel: "celebratory" | "simple" | "confirmation" | "minimal";
}> = {
  decouverte: {
    showXp: true,
    showXpNotification: true,
    showBadges: true,
    showConfetti: true,
    showEmojisInPrompts: true,
    animationLevel: "rich",
    talentCardStyle: "pokemon",
    promptTone: "enthusiastic",
    felicitationLevel: "celebratory",
  },
  exploration: {
    showXp: true,
    showXpNotification: true,
    showBadges: true,
    showConfetti: false, // seulement M8
    showEmojisInPrompts: false,
    animationLevel: "moderate",
    talentCardStyle: "business",
    promptTone: "encouraging",
    felicitationLevel: "simple",
  },
  maitrise: {
    showXp: false,
    showXpNotification: false,
    showBadges: false,
    showConfetti: false,
    showEmojisInPrompts: false,
    animationLevel: "minimal",
    talentCardStyle: "job",
    promptTone: "neutral",
    felicitationLevel: "confirmation",
  },
  auteur: {
    showXp: false,
    showXpNotification: false,
    showBadges: false,
    showConfetti: false,
    showEmojisInPrompts: false,
    animationLevel: "none",
    talentCardStyle: "portfolio",
    promptTone: "professional",
    felicitationLevel: "minimal",
  },
};
```

### Fichiers impactes

| Fichier | Modification |
|---------|-------------|
| `sessions` (table SQL) | Ajout colonne `depth` |
| Composants XP (play/) | Condition `showXp` |
| `AchievementPopup` | Condition `showBadges` |
| `canvas-confetti` calls | Condition `showConfetti` |
| Tous les prompts (modules-data ou nouveau fichier) | Switch sur `promptTone` |
| `TalentCard` (M8) | Switch sur `talentCardStyle` — 4 rendus differents |
| Animations Framer Motion | Switch sur `animationLevel` |
| Couleurs / theme | Optionnel — palette par depth |

### Effort estime

- Migration SQL : triviale (1 colonne)
- Contexte React + hook : 1 fichier, ~30 lignes
- Config constantes : 1 fichier, ~60 lignes
- Conditionnels dans composants existants : ~15-20 composants a modifier (ajout de `if (depth === ...)`)
- TalentCard 4 variantes : chantier le plus lourd — 4 designs differents
- Prompts par niveau : voir SPEC_NIVEAUX_SPIRALAIRES.md — nouveau fichier de prompts

**Priorite** : commencer par le mode `maitrise` (desactiver tout le ludique) — c'est le minimum pour tester au lycee.

---

*Document genere le 23 mars 2026 — Atelier Banlieuwood*
*Usage : reference pour l'implementation du gradient de gamification*
