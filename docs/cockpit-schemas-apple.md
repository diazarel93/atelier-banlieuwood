# Cockpit Banlieuwood — Schemas Optimaux Apple EdTech

> **Contrainte absolue** : Un prof debout devant 30 ados doit comprendre et agir en < 2 secondes.
> Chaque schema est concu pour etre utilisable sans formation, comme un iPad sorti de la boite.

---

## TABLE DES MATIERES

1. [Schema A — "Focus Mode" (minimaliste radical)](#schema-a--focus-mode)
2. [Schema B — "Command Center" (iPad Split View)](#schema-b--command-center)
3. [Schema C — "Flow Mode" (vertical mobile-first)](#schema-c--flow-mode)
4. [Schema D — "Theater Mode" (projection-driven)](#schema-d--theater-mode)
5. [Comparatif des 4 schemas](#comparatif)
6. [Composants partages (Design System)](#composants-partages)
7. [Comportement par phase](#comportement-par-phase)
8. [Schema recommande](#schema-recommande)

---

## SCHEMA A — "FOCUS MODE"

> Inspiration : Apple Notes + iMessage
> Philosophie : une seule zone, zero distraction, le CTA domine

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  <- Le Regard · 2        Image — La rue     3:42  [5]  │  HEADER (48px)
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │                                                 │    │
│  │  Observe cette image. Decris ce que tu vois,    │    │  QUESTION
│  │  ce que tu ressens, et imagine ce qui va         │    │  (hero card)
│  │  se passer.                                     │    │
│  │                                                 │    │
│  │  ┌───────────────────────────────┐              │    │
│  │  │        [photo La rue]         │              │    │  MEDIA
│  │  │                               │              │    │  (si applicable)
│  │  └───────────────────────────────┘              │    │
│  │                                                 │    │
│  │  ████████████░░░░░░  3/5 reponses    1:23       │    │  PROGRESS
│  │                                                 │    │  (barre unique)
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐        │    │
│  │  │ Amine    │ │ Fatou    │ │ Jules    │        │    │  REPONSES
│  │  │ "Je vois │ │ "Ca me   │ │ "Y'a un │        │    │  (cards)
│  │  │  un mec  │ │  fait    │ │  gars    │        │    │
│  │  │  qui..." │ │  penser  │ │  qui..." │        │    │
│  │  └──────────┘ └──────────┘ └──────────┘        │    │
│  │                                                 │    │
│  │  En attente : Lucas, Sarah                      │    │  WAITING
│  │                                                 │    │  (texte discret)
│  └─────────────────────────────────────────────────┘    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [Relancer 2]        [Projeter]     [Lancer le vote >] │  FOOTER (56px)
│                                          ^^^^^^^^^^^    │  CTA toujours
│                                          bouton hero    │  a droite
└─────────────────────────────────────────────────────────┘
```

### Principes

- **Zero sidebar** : tout est dans le flux central vertical
- **La question est la hero** : toujours visible en haut
- **Les reponses scrollent en dessous** comme une conversation iMessage
- **3 boutons max en footer** : Relancer (contextuel) + Projeter + CTA principal
- **Le CTA change selon la phase** (voir section "Comportement par phase")
- **Swipe left** sur une reponse : cacher/selectionner
- **Tap long** sur un eleve : ouvre sa fiche en slide-over

### Quand utiliser ce schema

- Classes de < 20 eleves
- Prof qui decouvre l'outil
- Seances courtes (< 20 min)
- Tablette / iPad

### Details du header (48px)

```
┌──────────────────────────────────────────────────────┐
│ [<-]  Le Regard · 2    Image — La rue    3:42  [●5] │
│  ^       ^                  ^              ^     ^   │
│  |       |                  |              |     |   │
│ retour  phase+seance    type+titre      timer  eleves│
│ modules  (tap=sidebar)  (tap=guide)            actifs│
└──────────────────────────────────────────────────────┘

- [<-] : retour a la liste des seances (ou sidebar modules)
- Phase+seance : chip colore, tap ouvre le panneau modules
- Type+titre : label de la situation actuelle, tap ouvre le guide pedagogique
- Timer : elapsed par defaut, countdown si timer actif, couleur adaptive
- [●5] : pastille verte + nb eleves connectes, tap ouvre la liste eleves
```

### Details du footer (56px)

```
Phase "responding" :
┌──────────────────────────────────────────────────────┐
│  [💡 Relancer 2]    [📺 Projeter]    [Vote (3) ──>] │
└──────────────────────────────────────────────────────┘
  contextuel:          toggle:          CTA principal:
  nb bloques           on/off ecran     desactive si < 2 selectionnees
  grise si 0           etat visible     orange quand pret

Phase "voting" :
┌──────────────────────────────────────────────────────┐
│  [📢 Message]    [📺 Projeter]    [Voir resultats >] │
└──────────────────────────────────────────────────────┘

Phase "reviewing" :
┌──────────────────────────────────────────────────────┐
│  [⚡ Debat]     [🔄 Comparer]    [Question suiv. >]  │
└──────────────────────────────────────────────────────┘

Phase "done" (dernier module) :
┌──────────────────────────────────────────────────────┐
│               [📊 Voir les resultats]                │
└──────────────────────────────────────────────────────┘
```

### Interactions avancees (progressive disclosure)

```
Actions cachees accessibles par :

- [●5] tap          -> slide-over liste eleves avec etat (repondu/reflexion/bloque)
- Titre tap         -> panneau guide pedagogique (reponse attendue, relances)
- [<-] tap          -> sidebar modules (progression globale)
- Swipe gauche card -> [Cacher] [Selectionner] [Mettre en avant]
- Tap long card     -> menu contextuel (commenter, noter, relancer cet eleve)
- 3 doigts swipe up -> bottom sheet "Plus d'actions" :
                        Stimulation : Indice, Exemple
                        Interaction : Discussion, Question libre, Sondage
                        Analyse : Comparer, Nuage de mots, Synthese
                        Reglages : Timer, Mode sombre, Aide eleves, Sons
```

---

## SCHEMA B — "COMMAND CENTER"

> Inspiration : iPad Split View + Apple Classroom
> Philosophie : vue d'ensemble permanente, pour les profs experimentes

### Layout

```
┌────────────────────────────────────────────────────────────────┐
│  <- Le Regard · 2      Image — La rue       3:42    [●5] [⚙]  │  HEADER
├──────────┬─────────────────────────────────────┬───────────────┤
│          │                                     │               │
│  CLASSE  │           CENTRE                    │   ASSISTANT   │
│  (240px) │           (flex)                    │   (260px)     │
│          │                                     │               │
│ ┌──────┐ │  Observe cette image...             │  ┌─────────┐  │
│ │ 3/5  │ │                                     │  │ ! 2     │  │
│ │ ●●●  │ │  ┌──────────────────────┐           │  │ bloques │  │
│ │ ○○   │ │  │   [photo La rue]     │           │  │         │  │
│ └──────┘ │  │                      │           │  │[Relancer│  │
│          │  └──────────────────────┘           │  │  tous]  │  │
│ Amine ●  │                                     │  └─────────┘  │
│ Fatou ●  │  ████████████░░░░  3/5    1:23      │               │
│ Jules ●  │                                     │  Laissez-leur │
│ Lucas ○  │  ┌──────────┐ ┌──────────┐          │  le temps de  │
│ Sarah ○  │  │ Amine    │ │ Fatou    │          │  repondre...  │
│          │  │ "Je vois │ │ "Ca me   │          │               │
│ ──────── │  │  un mec" │ │  fait"   │          │  ─────────    │
│ Plan de  │  └──────────┘ └──────────┘          │  Timeline     │
│ classe   │  ┌──────────┐                       │  00:00 Q1     │
│ [grille] │  │ Jules    │                       │  01:30 1ere   │
│          │  │ "Y'a un" │                       │    reponse    │
│          │  └──────────┘                       │  02:15 3/5    │
│          │                                     │               │
├──────────┴─────────────────────────────────────┴───────────────┤
│  [Relancer 2]    [📢 Message]    [···]    [Lancer le vote  >]  │  FOOTER
└────────────────────────────────────────────────────────────────┘
```

### Principes

- **3 colonnes** : Classe (gauche) + Reponses (centre) + Assistant (droite)
- **Gauche = scan rapide** : donut simplifie + liste eleves avec dots d'etat
- **Centre = action** : question + reponses (comme Schema A mais plus large)
- **Droite = intelligence** : UNE alerte prioritaire + UNE suggestion + timeline
- **Footer = 4 boutons** : 2 contextuels + "Plus" + CTA hero

### Sidebar gauche (240px) — "Classe"

```
┌────────────────────┐
│     ┌────────┐     │
│     │  3/5   │     │  Donut minimal
│     │  ●●●○○ │     │  Vert=repondu, Jaune=reflexion
│     └────────┘     │  Rouge=bloque, Gris=absent
│                    │
│  Amine        ● ✓  │  Liste eleves (ordre: bloques en haut)
│  Fatou        ● ✓  │  ● = dot d'etat
│  Jules        ● ✓  │  ✓ = a repondu
│  ─────────────────  │
│  Lucas        ○     │  ○ = en reflexion
│  Sarah        ○     │  Tap = ouvre fiche eleve
│                    │
│  ▼ Plan de classe  │  Collapsible
│  ┌────────────────┐│
│  │ [A] [F] [J]    ││  Grille spatiale (miniature)
│  │ [L] [S]        ││  Cliquable aussi
│  └────────────────┘│
└────────────────────┘
```

### Sidebar droite (260px) — "Assistant"

```
┌──────────────────────┐
│  ⚠️ Alerte            │  UNE SEULE alerte a la fois
│  2 eleves bloques     │  La plus urgente (AttentionPriority)
│  depuis 1min30        │
│  [Envoyer un indice]  │  UN bouton d'action
│  [✕ Ignorer]          │  Dismiss -> montre la suivante
├──────────────────────┤
│                      │
│  💬 Suggestion        │  UN conseil contextuel
│  "La majorite a      │  Change selon la phase
│   repondu. Lancez    │  Pas d'action, juste un conseil
│   le vote ?"         │
│                      │
├──────────────────────┤
│  📋 Timeline          │  Derniers 5 evenements
│  00:00  Q1 lancee    │
│  01:30  1ere reponse │
│  02:15  3/5 repondu  │
│  02:45  Lucas bloque │
│  03:10  Indice envoye│
│  ▼ Voir tout         │
└──────────────────────┘
```

### Quand utiliser ce schema

- Classes de 20-35 eleves
- Prof qui connait l'outil
- Desktop / grand ecran (> 1280px)
- Seances longues avec beaucoup d'interactions

### Breakpoints

```
> 1280px : 3 colonnes (layout complet)
1024-1280px : 2 colonnes (gauche cachee, accessible par swipe/bouton)
< 1024px : bascule vers Schema A (Focus Mode) automatiquement
```

---

## SCHEMA C — "FLOW MODE"

> Inspiration : Apple Music Now Playing + Instagram Stories
> Philosophie : scroll vertical infini, immersif, zero chrome

### Layout

```
┌──────────────────────────────────────┐
│  Le Regard · 2    3:42    ●5    [⚙] │  HEADER COMPACT (40px)
├──────────────────────────────────────┤  barre invisible au scroll
│                                      │
│  ┌──────────────────────────────┐    │
│  │ Image                        │    │  BADGE type
│  │                              │    │
│  │ Observe cette image.         │    │  QUESTION
│  │ Decris ce que tu vois...     │    │  (sticky au scroll)
│  └──────────────────────────────┘    │
│                                      │
│  ┌──────────────────────────────┐    │
│  │       [photo La rue]         │    │  MEDIA CARD
│  │                              │    │  (pleine largeur)
│  │                              │    │
│  └──────────────────────────────┘    │
│                                      │
│  ████████████░░░░░░  3/5      1:23   │  PROGRESS BAR
│                                      │
│  ┌──────────────────────────────┐    │
│  │ Amine · ●                    │    │  REPONSE 1
│  │ "Je vois un mec qui porte   │    │  (card pleine largeur)
│  │  un carton dans la rue. On  │    │
│  │  dirait qu'il demenage..."  │    │
│  │                    [👍][💡]  │    │  Quick reactions (swipe)
│  └──────────────────────────────┘    │
│                                      │
│  ┌──────────────────────────────┐    │
│  │ Fatou · ●                    │    │  REPONSE 2
│  │ "Ca me fait penser a quand  │    │
│  │  on a change de quartier.   │    │
│  │  Le mec il a l'air fatigue" │    │
│  │                    [👍][🔥]  │    │  Quick reactions
│  └──────────────────────────────┘    │
│                                      │
│  ┌──────────────────────────────┐    │
│  │ Jules · ●                    │    │  REPONSE 3
│  │ "Y'a un gars avec un carton │    │
│  │  et plein de monde autour.  │    │
│  │  Personne le regarde."      │    │
│  │                    [👍][💡]  │    │
│  └──────────────────────────────┘    │
│                                      │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐    │
│  │                              │    │  WAITING SECTION
│  │  ⏳ Lucas, Sarah             │    │  (discret, gris)
│  │     en reflexion...          │    │
│  │                              │    │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘    │
│                                      │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─    │
│                                      │
│  ⚠️ 2 bloques · Envoyer un indice?  │  ALERTE INLINE
│                         [Envoyer]    │  (apparait quand pertinent)
│                                      │
├──────────────────────────────────────┤
│       [💡 Relancer]  [Vote (3) ──>]  │  FOOTER FLOATING (48px)
└──────────────────────────────────────┘  2 boutons max
```

### Principes

- **Full vertical scroll** comme un feed Instagram/TikTok
- **Zero sidebar** : tout dans le flux
- **Header qui disparait au scroll** (comme Safari)
- **Reponses = cards pleine largeur** avec quick reactions en overlay
- **L'alerte IA est inline** dans le flux (pas dans une sidebar)
- **Footer flottant** : 2 boutons seulement, semi-transparent
- **Swipe horizontal** sur une card : cacher / selectionner / mettre en avant

### Interactions gestuelles

```
Scroll down        : parcourir les reponses
Swipe gauche card  : [Cacher]
Swipe droite card  : [★ Selectionner pour le vote]
Tap reactions      : [👍] [🔥] [💡] [🤔] quick feedback
Tap long card      : menu complet (commenter, noter, relancer, nudge)
Tap ●5 (header)    : bottom sheet liste eleves
Tap ⚙ (header)     : bottom sheet reglages
Pull to refresh    : actualiser les reponses
```

### Quand utiliser ce schema

- Prof qui se deplace dans la classe (mobile/tablette)
- Petites classes (< 15 eleves)
- Mode "je regarde les reponses en marchant"
- iPad tenu a la main

---

## SCHEMA D — "THEATER MODE"

> Inspiration : Keynote + Apple TV
> Philosophie : l'ecran projete EST l'interface, le cockpit est la telecommande

### Architecture double ecran

```
ECRAN PROJETE (ce que les eleves voient) :
┌──────────────────────────────────────────────────────┐
│                                                      │
│                                                      │
│     Observe cette image. Decris ce que tu vois,      │
│     ce que tu ressens, et imagine ce qui va           │
│     se passer.                                       │
│                                                      │
│     ┌────────────────────────────┐                   │
│     │      [photo La rue]        │                   │
│     │                            │                   │
│     │                            │                   │
│     └────────────────────────────┘                   │
│                                                      │
│     █████████████░░░░░░  3/5 reponses                │
│                                                      │
│     ┌─────────────────────────────────────┐          │
│     │  "Je vois un mec qui porte un       │          │
│     │   carton. On dirait qu'il demenage" │          │
│     │                         — Amine     │          │
│     └─────────────────────────────────────┘          │
│                                                      │
│     banlieuwood.vercel.app/join · Code: ABCD         │
│                                                      │
└──────────────────────────────────────────────────────┘


COCKPIT PROF (tablette/telephone = telecommande) :
┌──────────────────────────────────────┐
│  Le Regard · 2        3:42    [●5]  │
├──────────────────────────────────────┤
│                                      │
│  ┌──────────────────────────────┐    │
│  │  ECRAN EN DIRECT             │    │  Miniature de
│  │  ┌────────────────────┐      │    │  ce que voient
│  │  │  [preview ecran]   │      │    │  les eleves
│  │  └────────────────────┘      │    │
│  │  Affiche : Question + Image  │    │
│  └──────────────────────────────┘    │
│                                      │
│  ████████████░░░░░░  3/5      1:23   │
│                                      │
│  NOUVELLES REPONSES                  │
│  ┌──────────────────────────────┐    │
│  │ ● Amine : "Je vois un mec"  │    │  Notifications
│  │ ● Fatou : "Ca me fait..."   │    │  style de
│  │ ● Jules : "Y'a un gars..."  │    │  reponses
│  └──────────────────────────────┘    │
│                                      │
│  ⚠️ Lucas, Sarah en attente         │
│                                      │
├──────────────────────────────────────┤
│  ACTIONS ECRAN :                     │
│  [Montrer reponse]  [Ecran noir]    │
│                                      │
│  [💡 Relancer]       [Vote (3) ──>] │
└──────────────────────────────────────┘
```

### Principes

- **2 ecrans** : le videoprojecteur montre aux eleves, la tablette controle
- **Le cockpit est une telecommande** : minimaliste, gros boutons
- **Les reponses arrivent comme des notifications** (style Apple Watch)
- **"Montrer reponse"** = spotlight instantane sur l'ecran projete
- **"Ecran noir"** = pause, comme une telecommande TV

### Modes d'affichage ecran (controles depuis le cockpit)

```
┌──────────────────────────────────────┐
│  MODE ECRAN :                        │
│                                      │
│  [Question]     Affiche la question  │
│                 + media              │
│                                      │
│  [Reponses]     Affiche les reponses │
│                 validees             │
│                                      │
│  [Vote]         Affiche les options  │
│                 de vote en direct    │
│                                      │
│  [Resultats]    Affiche le graphique │
│                 des votes            │
│                                      │
│  [Spotlight]    Affiche UNE reponse  │
│                 en grand             │
│                                      │
│  [Nuage]        Affiche le nuage     │
│                 de mots              │
│                                      │
│  [Noir]         Ecran noir           │
│                 (attention sur prof) │
└──────────────────────────────────────┘
```

### Quand utiliser ce schema

- Salle avec videoprojecteur
- Classes de 25-35 eleves
- Prof qui reste a son bureau/au tableau
- Seances longues avec debats et votes

---

## COMPARATIF

| Critere | A — Focus | B — Command | C — Flow | D — Theater |
|---------|-----------|-------------|----------|-------------|
| **Ecran min** | 768px | 1280px | 375px | 375px + proj |
| **Nb eleves** | < 20 | 20-35 | < 15 | 25-35 |
| **Niveau prof** | Debutant | Avance | Intermediaire | Intermediaire |
| **Boutons visibles** | 3 | 4 | 2 | 4 |
| **Sidebars** | 0 | 2 | 0 | 0 |
| **Info simultanee** | Faible | Elevee | Faible | Moyenne |
| **Mobilite prof** | Tablette | Bureau | Main (marche) | Bureau |
| **Courbe apprentissage** | 30 sec | 5 min | 1 min | 2 min |
| **Force** | Simplicite | Vue globale | Immersion | Impact visuel |
| **Faiblesse** | Manque vue classe | Complexite | Pas de vue macro | 2 ecrans requis |

### Quel schema pour quel prof ?

```
Prof qui decouvre Banlieuwood pour la 1ere fois :
  -> Schema A (Focus Mode)
  -> Puis bascule automatique vers B apres 3 seances

Prof qui fait un atelier cinema complet (8 seances) :
  -> Schema B (Command Center) sur desktop
  -> Schema C (Flow Mode) quand il se deplace

Salle equipee videoprojecteur :
  -> Schema D (Theater Mode) toujours

Intervention ponctuelle / demo :
  -> Schema A (Focus Mode) sur tablette
```

---

## COMPOSANTS PARTAGES

### Les 7 briques universelles (presentes dans tous les schemas)

```
1. PROGRESS BAR
   ████████████░░░░░░  3/5 reponses    1:23
   - Barre horizontale, couleur adaptive
   - Vert > 70%, Orange 30-70%, Rouge < 30%
   - Timer integre a droite
   - Denominateur implicite (dans la barre, pas en texte)

2. RESPONSE CARD
   ┌──────────────────────────────────┐
   │ ● Amine                    2:15 │  Avatar + prenom + timestamp
   │ "Je vois un mec qui porte un    │  Texte de la reponse
   │  carton dans la rue..."         │
   │                    [👍][💡][···] │  Quick reactions + menu
   │  ★ Selectionnee pour le vote    │  Badge d'etat (si applicable)
   └──────────────────────────────────┘

   Etats visuels :
   - Default : fond blanc, bordure grise
   - Selectionnee : fond lavande, bordure violette, badge ★
   - Cachee : opacity 40%, croix
   - Gagnante : fond dore, confetti icon
   - En avant : bordure orange, badge 🔥

3. STUDENT CHIP
   [● Amine]  [○ Lucas]  [⚠ Sarah]
   - Dot colore = etat (vert/jaune/rouge/gris)
   - Tap = ouvre fiche eleve
   - Long press = menu rapide (relancer, avertir)
   - Badge main levee = icone main ✋

4. CTA BUTTON (hero)
   ┌─────────────────────────┐
   │   Lancer le vote (3) >  │  Toujours a droite du footer
   │                         │  Couleur = couleur du module
   └─────────────────────────┘  Anime : scale on tap

   Labels selon la phase :
   - waiting    : "Ouvrir les reponses"
   - responding : "Lancer le vote (N)"
   - voting     : "Voir les resultats"
   - reviewing  : "Question suivante >"
   - done       : "Terminer le module"

5. ALERT CARD
   ┌──────────────────────────────────┐
   │ ⚠️ 2 eleves bloques depuis 1:30  │  Icone + message
   │ Lucas, Sarah                     │  Noms concernes
   │ [Envoyer un indice]    [Ignorer] │  1 action + dismiss
   └──────────────────────────────────┘

   Priorite (une seule a la fois) :
   1. Bloques > 2 min (rouge)
   2. Main levee > 1 min (orange)
   3. Classe divisee 50/50 (bleu)
   4. Silence prolonge (gris)
   5. Tous ont repondu (vert)

6. HEADER MINIMAL
   [<-]  Phase · Seance    Type — Titre    Timer  [●N]
   - 48px max
   - 5 elements max
   - Tout est tappable (navigation contextuelle)

7. FOOTER ADAPTATIF
   [Action 1]    [Action 2]    [···]    [===CTA===]
   - 56px max
   - CTA toujours a droite, toujours le plus gros
   - Actions changent selon la phase
   - [···] = menu "Plus d'actions" (bottom sheet)
   - Backdrop blur semi-transparent
```

### Le menu "Plus d'actions" (bottom sheet)

```
┌──────────────────────────────────────┐
│  ─────   (barre de drag)             │
│                                      │
│  STIMULATION                         │
│  ┌──────┐ ┌──────┐ ┌──────┐        │
│  │💡    │ │📝    │ │🎯    │        │
│  │Indice│ │Exemple│ │Defi  │        │
│  └──────┘ └──────┘ └──────┘        │
│                                      │
│  INTERACTION                         │
│  ┌──────┐ ┌──────┐ ┌──────┐        │
│  │💬    │ │❓    │ │📊    │        │
│  │Discus│ │Q.libre│ │Sondage│       │
│  └──────┘ └──────┘ └──────┘        │
│                                      │
│  ANALYSE                             │
│  ┌──────┐ ┌──────┐ ┌──────┐        │
│  │⚖️    │ │☁️    │ │📋    │        │
│  │Compar│ │Nuage │ │Synth.│        │
│  └──────┘ └──────┘ └──────┘        │
│                                      │
│  REGLAGES                            │
│  ┌──────┐ ┌──────┐ ┌──────┐        │
│  │⏱     │ │🌙    │ │🔇    │        │
│  │Timer │ │Sombre│ │Son   │        │
│  └──────┘ └──────┘ └──────┘        │
│                                      │
└──────────────────────────────────────┘
Style : grille d'icones comme le Control Center iOS
```

---

## COMPORTEMENT PAR PHASE

### Phase 1 : WAITING (avant d'ouvrir les reponses)

```
┌──────────────────────────────────────────────┐
│  <- Le Regard · 2    Image — La rue    [●5]  │
├──────────────────────────────────────────────┤
│                                              │
│  Observe cette image. Decris ce que tu vois, │
│  ce que tu ressens, et imagine ce qui va     │
│  se passer.                                  │
│                                              │
│  ┌────────────────────────┐                  │
│  │     [photo La rue]     │                  │
│  └────────────────────────┘                  │
│                                              │
│  ┌────────────────────────────────────┐      │
│  │  📺 Projetez la question pour que  │      │  CALL TO ACTION
│  │     les eleves puissent la lire    │      │  guide le prof
│  │              [Projeter]            │      │
│  └────────────────────────────────────┘      │
│                                              │
├──────────────────────────────────────────────┤
│          [📺 Projeter]    [Ouvrir les rep >] │
└──────────────────────────────────────────────┘
```

### Phase 2 : RESPONDING (eleves repondent)

```
┌──────────────────────────────────────────────┐
│  <- Le Regard · 2    Image — La rue   1:23   │
├──────────────────────────────────────────────┤
│                                              │
│  ████████████░░░░░░  3/5 reponses            │  PROGRESS BAR
│                                              │  apparait des l'ouverture
│  ┌──────────────────────────────┐            │
│  │ ● Amine                2:15 │            │  Reponses arrivent
│  │ "Je vois un mec qui..."     │            │  en temps reel
│  └──────────────────────────────┘            │  avec animation
│  ┌──────────────────────────────┐            │
│  │ ● Fatou                1:45 │            │
│  │ "Ca me fait penser..."      │            │
│  └──────────────────────────────┘            │
│                                              │
│  ⏳ En attente : Lucas, Sarah                │
│                                              │
│  ┌──────────────────────────────────┐        │
│  │ ⚠️ 2 en attente depuis 1:30      │        │  ALERTE
│  │ [Relancer Lucas et Sarah]        │        │  (si pertinent)
│  └──────────────────────────────────┘        │
│                                              │
├──────────────────────────────────────────────┤
│  [Relancer 2]    [···]    [Lancer le vote >] │  CTA : vote
└──────────────────────────────────────────────┘  (grise si < 2 selectionnees)
```

### Phase 3 : VOTING (vote en cours)

```
┌──────────────────────────────────────────────┐
│  <- Le Regard · 2    Vote en cours     0:45  │
├──────────────────────────────────────────────┤
│                                              │
│  ████████████████░░  4/5 ont vote            │
│                                              │
│  OPTIONS EN LICE :                           │
│                                              │
│  ┌──────────────────────────────┐            │
│  │ A. "Je vois un mec qui..."  │  3 votes   │  Option cards
│  │    — Amine           ██████ │  60%        │  avec barres
│  └──────────────────────────────┘            │  en temps reel
│  ┌──────────────────────────────┐            │
│  │ B. "Ca me fait penser..."   │  1 vote    │
│  │    — Fatou           ██     │  20%        │
│  └──────────────────────────────┘            │
│  ┌──────────────────────────────┐            │
│  │ C. "Y'a un gars avec..."   │  1 vote    │
│  │    — Jules           ██     │  20%        │
│  └──────────────────────────────┘            │
│                                              │
│  ⏳ Sarah n'a pas encore vote                │
│                                              │
├──────────────────────────────────────────────┤
│  [📢 Message]    [···]    [Voir resultats >] │
└──────────────────────────────────────────────┘
```

### Phase 4 : REVIEWING (analyse des resultats)

```
┌──────────────────────────────────────────────┐
│  <- Le Regard · 2    Resultats         4:12  │
├──────────────────────────────────────────────┤
│                                              │
│  🏆 GAGNANTE                                 │
│  ┌──────────────────────────────────┐        │
│  │ "Je vois un mec qui porte un    │        │  Card doree
│  │  carton dans la rue. On dirait  │        │  mise en avant
│  │  qu'il demenage mais personne   │        │
│  │  le regarde."                   │        │
│  │                      — Amine    │        │
│  │                   3 votes (60%) │        │
│  └──────────────────────────────────┘        │
│                                              │
│  AUTRES REPONSES :                           │
│  B. Fatou — 1 vote (20%)                     │
│  C. Jules — 1 vote (20%)                     │
│                                              │
│  💬 "Tres bien ! Amine a capte l'isolement   │  Suggestion prof
│      du personnage. Rebondissez dessus."     │
│                                              │
├──────────────────────────────────────────────┤
│  [⚡ Debat]   [🔄 Comparer]  [Suivante -->]  │
└──────────────────────────────────────────────┘
```

### Transitions entre phases

```
WAITING ──[CTA: "Ouvrir"]──> RESPONDING
  - Animation : progress bar apparait avec spring
  - Son : ding subtil
  - Ecran projete : affiche la question

RESPONDING ──[CTA: "Lancer le vote"]──> VOTING
  - Animation : cards non-selectionnees disparaissent
  - Son : whoosh
  - Ecran projete : affiche les options de vote

VOTING ──[CTA: "Voir resultats"]──> REVIEWING
  - Animation : barres de vote se remplissent
  - Son : ta-da si unanime, ding si partage
  - Ecran projete : affiche le resultat

REVIEWING ──[CTA: "Question suivante"]──> WAITING (Q+1)
  - Animation : slide horizontal
  - Son : swoosh page
  - Ecran projete : affiche la nouvelle question

REVIEWING (derniere Q) ──[CTA: "Terminer"]──> DONE
  - Animation : confetti
  - Son : applaudissements
  - Ecran projete : ecran de fin avec stats
```

---

## EXERCICES SPECIAUX — Adaptation des schemas

### Module 1 : Positionnement (QCM batch)

```
Schema A/C adapte :

┌──────────────────────────────────────┐
│  Le Regard · 1    Positionnement     │
├──────────────────────────────────────┤
│                                      │
│  Q3/8 : "Qu'est-ce qui te marque    │  Question QCM
│  en premier dans une image ?"        │
│                                      │
│  ┌─────────────────────────────┐     │
│  │  A. Les couleurs      ████ 40%│   │  Barres en direct
│  │  B. Les personnages   ██   20%│   │  (pas de "bonne reponse")
│  │  C. L'ambiance        ████ 40%│   │
│  │  D. Les details       ░     0%│   │
│  └─────────────────────────────┘     │
│                                      │
│  4/5 ont repondu                     │
│                                      │
├──────────────────────────────────────┤
│            [Question suivante -->]   │  Pas de vote ici
└──────────────────────────────────────┘  (c'est du diagnostic)
```

### Module 10 : Et si... (Image + ecriture)

```
Schema A/C adapte :

┌──────────────────────────────────────┐
│  Et si... · 1      Et si...    2:30 │
├──────────────────────────────────────┤
│                                      │
│  Choisis une image et ecris          │
│  ton "Et si..."                      │
│                                      │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐       │  Galerie images
│  │ 1  │ │ 2✓ │ │ 3  │ │ 4  │       │  (selectionnables)
│  └────┘ └────┘ └────┘ └────┘       │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐       │
│  │ 5  │ │ 6  │ │ 7✓ │ │ 8  │       │
│  └────┘ └────┘ └────┘ └────┘       │
│                                      │
│  ████████░░░░░░  2/5 soumis          │
│                                      │
│  ┌──────────────────────────────┐    │
│  │ Fatou · Image 2              │    │
│  │ "Et si le personnage etait  │    │
│  │  en fait invisible ?"       │    │
│  └──────────────────────────────┘    │
│                                      │
├──────────────────────────────────────┤
│  [Relancer]     [Etape suivante -->] │
└──────────────────────────────────────┘
```

### Module 12 : Construction Collective (vote par manches)

```
Schema B adapte :

┌──────────────────────────────────────────────────┐
│  Collectif · 1    Manche 3/8    Vote    1:15     │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌─────────────────┐  ┌─────────────────┐       │
│  │ OPTION A         │  │ OPTION B         │      │
│  │ "Le heros entre │  │ "Tout le monde  │       │  2 cards
│  │  dans le bar"   │  │  se retourne"   │       │  cote a cote
│  │                 │  │                 │       │
│  │   ████ 60%      │  │   ██   40%      │       │  Votes live
│  └─────────────────┘  └─────────────────┘       │
│                                                  │
│  4/5 ont vote                                    │
│                                                  │
│  ┌──────────────────────────────────────┐        │
│  │ 🏆 Historique : Manche 1 ✓ Manche 2 ✓│       │
│  └──────────────────────────────────────┘        │
│                                                  │
├──────────────────────────────────────────────────┤
│  [📢 Message]    [Valider le gagnant ──>]        │
└──────────────────────────────────────────────────┘
```

### Module 8 : L'Equipe (quiz metiers)

```
Schema A adapte :

┌──────────────────────────────────────┐
│  L'Equipe · 1    Quiz metiers  0:45  │
├──────────────────────────────────────┤
│                                      │
│  Q2/5 : "Le realisateur decide      │
│  de tout sur un tournage"            │
│                                      │
│  ┌─────────────────────────────┐     │
│  │  ✅ Vrai         ████   60% │     │  QCM simple
│  │  ❌ Faux         ██     40% │     │  vrai/faux
│  └─────────────────────────────┘     │
│                                      │
│  💡 La realite :                     │
│  "Le realisateur collabore avec     │  Debrief inline
│   toute son equipe..."               │  (apres le vote)
│                                      │
├──────────────────────────────────────┤
│            [Question suivante -->]   │
└──────────────────────────────────────┘
```

---

## SCHEMA RECOMMANDE

### Approche hybride : A + B adaptatif

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  MOBILE / TABLETTE        DESKTOP (> 1024px)        │
│  ─────────────────        ──────────────────        │
│                                                     │
│  Schema A (Focus)   <--automatique-->  Schema B     │
│                                       (Command)     │
│                                                     │
│  Si videoprojecteur actif :                         │
│  Schema D (Theater) sur les 2 ecrans               │
│                                                     │
│  Personnalisable :                                  │
│  Le prof peut forcer un schema via [⚙] > Layout    │
│                                                     │
└─────────────────────────────────────────────────────┘

Implementation :

const CockpitLayout = () => {
  const { width } = useWindowSize();
  const { isProjecting } = useScreenMode();
  const { preferredLayout } = useUserPreferences();

  if (preferredLayout) return <layouts[preferredLayout] />;
  if (isProjecting) return <TheaterMode />;
  if (width < 1024) return <FocusMode />;
  return <CommandCenter />;
};
```

### Migration progressive (3 etapes)

```
ETAPE 1 : Implementer Schema A (Focus Mode)
  - C'est le plus simple, le plus Apple
  - Remplace le cockpit actuel sur mobile/tablette
  - Sert de base pour les composants partages
  - Temps : 1 sprint (2 semaines)

ETAPE 2 : Implementer Schema B (Command Center)
  - Reutilise les composants de l'etape 1
  - Ajoute les 2 sidebars simplifiees
  - Remplace le cockpit actuel sur desktop
  - Temps : 1 sprint (2 semaines)

ETAPE 3 : Implementer Schema D (Theater Mode)
  - Reutilise les composants des etapes 1-2
  - Ajoute la synchronisation ecran projete
  - Mode optionnel active par le prof
  - Temps : 1 sprint (2 semaines)

Schema C (Flow Mode) est un bonus futur, pas prioritaire.
```

---

> **Resume** : Le cockpit ideal pour Banlieuwood n'est pas UN layout fixe,
> c'est un layout adaptatif qui s'ajuste au contexte (ecran, experience du prof,
> presence d'un projecteur). Les 4 schemas partagent les memes 7 briques
> de base. La difference est dans l'agencement, pas dans les composants.
>
> Comme un iPhone qui est le meme appareil en mode portrait et paysage :
> les boutons changent de place, pas de nature.
