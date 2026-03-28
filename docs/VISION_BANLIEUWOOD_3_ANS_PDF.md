---
pdf_options:
  format: A4
  margin: 25mm 20mm 25mm 20mm
  printBackground: true
  displayHeaderFooter: true
  headerTemplate: '<div style="width:100%;font-size:8px;color:#888;padding:0 20mm;text-align:right;font-family:sans-serif;">🌸 Banlieuwood — Vision 3 ans 🌺</div>'
  footerTemplate: '<div style="width:100%;font-size:8px;color:#888;padding:0 20mm;display:flex;justify-content:space-between;font-family:sans-serif;"><span>🌷 Document strategique V1 — Mars 2026</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>'
stylesheet: https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.1/github-markdown.min.css
body_class: markdown-body
css: |-
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #1a1a2e;
    line-height: 1.7;
  }

  .markdown-body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  /* ── Couverture ── */
  .cover {
    page-break-after: always;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 85vh;
    text-align: center;
    padding: 40px;
  }
  .cover h1 {
    font-size: 42px;
    font-weight: 900;
    color: #e63946;
    margin-bottom: 8px;
    letter-spacing: -1px;
    border-bottom: none;
  }
  .cover .subtitle {
    font-size: 18px;
    color: #457b9d;
    font-weight: 600;
    margin-bottom: 40px;
    max-width: 500px;
  }
  .cover .slogan {
    font-size: 24px;
    font-weight: 700;
    color: #1d3557;
    margin-top: 30px;
    padding: 16px 32px;
    border: 3px solid #e63946;
    border-radius: 8px;
  }
  .cover .date {
    font-size: 14px;
    color: #888;
    margin-top: 40px;
  }
  .cover .badge {
    display: inline-block;
    background: #e63946;
    color: white;
    padding: 4px 16px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    margin-top: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  /* ── Titres ── */
  h1 {
    font-size: 28px;
    font-weight: 900;
    color: #e63946;
    border-bottom: 3px solid #e63946;
    padding-bottom: 8px;
    margin-top: 50px;
    page-break-before: always;
  }

  h1:first-of-type {
    page-break-before: avoid;
  }

  h2 {
    font-size: 20px;
    font-weight: 700;
    color: #1d3557;
    border-bottom: 1px solid #a8dadc;
    padding-bottom: 4px;
    margin-top: 30px;
  }

  h3 {
    font-size: 16px;
    font-weight: 700;
    color: #457b9d;
    margin-top: 24px;
  }

  /* ── Tableaux ── */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    font-size: 13px;
  }
  thead {
    background: #1d3557;
    color: white;
  }
  th {
    padding: 10px 12px;
    text-align: left;
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  td {
    padding: 8px 12px;
    border-bottom: 1px solid #e8e8e8;
  }
  tr:nth-child(even) {
    background: #f8f9fa;
  }

  /* ── Code blocks ── */
  pre {
    background: #f1faee !important;
    border: 1px solid #a8dadc;
    border-radius: 6px;
    padding: 16px;
    font-size: 12px;
    line-height: 1.5;
    overflow-x: auto;
  }
  code {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 12px;
  }

  /* ── Listes ── */
  ul, ol {
    padding-left: 24px;
  }
  li {
    margin: 4px 0;
  }

  /* ── Accents ── */
  strong {
    color: #1d3557;
  }

  blockquote {
    border-left: 4px solid #e63946;
    background: #fff5f5;
    padding: 12px 16px;
    margin: 16px 0;
    color: #333;
  }

  /* ── Separateurs ── */
  hr {
    border: none;
    border-top: 2px solid #a8dadc;
    margin: 32px 0;
  }

  /* ── Page breaks ── */
  .page-break {
    page-break-before: always;
  }

  /* ── Checkboxes ── */
  li input[type="checkbox"] {
    margin-right: 8px;
  }

  /* ── Print ── */
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
---

<div class="cover">

# 🌺 BANLIEUWOOD 🌺

<div class="subtitle">
Plateforme de Creation Collective<br/>
D'un outil cinema a un ecosysteme de decouverte des metiers creatifs
</div>

<div class="slogan">🌸 On cree. On decouvre un metier. 🌸</div>

<div class="date">Mars 2026</div>
<div class="badge">🌷 Vision strategique V1 🌷</div>

</div>

# 🌻 PARTIE 1 — LE MOTEUR QUE BANLIEUWOOD A CONSTRUIT

## 1.1 Le moteur universel

Banlieuwood n'est pas un outil de cinema. Banlieuwood est un **moteur de creation collective** qui utilise le cinema comme premier habillage.

Si on retire le mot "cinema" des 8 modules, voila ce qui reste :

| Module | Ce que ca fait vraiment |
|--------|------------------------|
| M1 Observer | Montrer un stimulus → l'eleve observe et interprete |
| M2 Comprendre | Deconstruire la mecanique cachee derriere une oeuvre |
| M3 Imaginer | Generer une idee a partir d'une contrainte |
| M4 Clarifier | Structurer et defendre son idee en 30 secondes |
| M5 Construire | Choisir collectivement par vote democratique |
| M6 Ecrire | Concevoir a plusieurs avec des roles specialises |
| M7 Visualiser | Planifier la production (passer de l'idee au concret) |
| M8 Produire | Former une equipe avec des roles professionnels reels |

C'est un pipeline universel : **Observer → Comprendre → Imaginer → Clarifier → Construire → Concevoir → Planifier → Produire.**

Les mecaniques qui font la force de Banlieuwood sont independantes du sujet :
- Contributions anonymes (pas de jugement social)
- Vote democratique (le groupe decide, pas l'adulte)
- Attribution de roles par merite invisible (pas par popularite)
- Zero classement comparatif (doctrine fondamentale)
- Progression spiralaire sur 4 niveaux (on ne refait jamais la meme chose)
- Facilitateur ≠ professeur (l'adulte partage son metier, il n'enseigne pas)

Tout ca fonctionne pour n'importe quelle discipline creative ou le processus est : idee individuelle → projet collectif → production reelle.

---

## 1.2 Le positionnement : creatif, metier, ecole — dans cet ordre

La question strategique fondamentale n'est pas "pour qui on construit ?" mais "qu'est-ce qu'on est ?". Trois identites possibles. Les trois sont vraies. Mais l'ordre compte.

### Creatif — ce que l'eleve VIT

Si Banlieuwood se pense comme un outil scolaire :
- Les prompts deviennent des consignes
- L'intervenant devient un animateur pedagogique
- Le pitch devient un exercice d'oral
- Le vote devient une "activite de cooperation"
- Le film devient un "projet de classe"
- Le dashboard devient un outil d'evaluation deguise
- Et les eleves le sentent en 30 secondes

Le lyceen de voie pro qui entre dans la salle, qui voit un tableau, un intervenant avec un badge, et une tablette qui dit "Bienvenue dans ton parcours d'apprentissage !" — il decroche. C'est fini. C'est un cours de plus.

**L'ecole est le lieu. L'ecole n'est pas l'identite.**

Si Banlieuwood se pense comme un outil creatif qui passe par l'ecole :
- Les prompts sont des provocations ("Et si...")
- L'intervenant est un realisateur qui partage son metier
- Le pitch est un acte de creation (defendre SON idee)
- Le vote est un choix artistique collectif
- Le film est un FILM — pas un livrable pedagogique
- L'eleve le sent : c'est pas un cours, c'est un projet

**La difference tient en une phrase :**
- Ecole : "Qu'est-ce que tu as appris aujourd'hui ?"
- Creatif : "Qu'est-ce que tu as fait aujourd'hui ?"

### Metier — ce que l'eleve DECOUVRE

Le metier est le chainon manquant. C'est ce qui rend le creatif serieux et l'ecole supportable.

Un eleve qui "fait un truc creatif" → sympa mais ca s'oublie.
Un eleve qui "decouvre qu'il est bon dans un metier reel" → ca reste. Ca change une trajectoire.

Un gamin de 14 ans en REP qui decouvre qu'il a un oeil pour le cadrage et que ca peut devenir un **metier** — c'est pas un atelier. C'est un point de bascule.

**Pour le lyceen de voie pro** : il est forme A un metier. Il comprend ce que c'est. Il respecte le geste technique. Quand l'intervenant dit "je suis ingenieur son, voila mon micro, voila comment je travaille" — le lyceen pro ecoute. Parce que c'est un pair professionnel, pas un animateur culturel.

**Pour les parents** : "Mon fils a fait un atelier creatif" → OK. "Mon fils a decouvert les metiers du cinema et il veut faire du son" → ca, les parents ecoutent. Le metier rassure. Surtout dans les milieux ou la culture est percue comme un luxe et pas comme un debouche.

**Pour l'institution** : le Parcours Avenir est obligatoire du CP a la Terminale. Chaque eleve doit decouvrir des metiers. Un atelier Banlieuwood coche trois parcours sur quatre :
- PEAC (creation artistique) ✅
- Parcours Avenir (decouverte des metiers) ✅
- Parcours Citoyen (cooperation, expression, esprit critique) ✅

Trois parcours en une intervention. Presque aucun autre dispositif ne fait ca.

### Ecole — ce que l'institution VALIDE

Tout le travail d'alignement institutionnel (socle commun, PEAC, CRCN, programmes par discipline, Pass Culture) est indispensable — mais c'est le back-office. C'est ce que l'enseignant recoit, ce que le chef d'etablissement lit, ce que le DAAC valide.

L'eleve ne le voit jamais. L'eleve voit : "On fait un film."

### La formule

```
CREATIF    →  ce que l'eleve VIT       →  "j'ai fait un film"
METIER     →  ce que l'eleve DECOUVRE   →  "j'ai decouvert que je suis bon en son"
ECOLE      →  ce que l'institution VALIDE  →  "il a travaille 4 domaines du socle"
```

On cree → On decouvre un metier → L'ecole valide. Dans cet ordre.

### Ce que chaque public entend

| Public | Ce qu'on lui dit |
|--------|-----------------|
| **L'eleve** | "Tu vas faire un film / un son / un jeu. Et tu vas decouvrir quel role te correspond." |
| **Le parent** | "Votre enfant va decouvrir les metiers de la creation en pratiquant." |
| **L'enseignant** | "Vos eleves travaillent le socle, le PEAC et le parcours avenir en meme temps." |
| **Le chef d'etablissement** | "Un dispositif qui coche 3 parcours et qui est finance par le Pass Culture." |
| **L'intervenant** | "Tu partages ton metier avec des jeunes. L'outil gere la pedagogie." |
| **Le DAAC** | "Creation collective + decouverte professionnelle + ancrage programme." |

### Deux langages, un seul produit

- **Face eleve / intervenant** : 100% creatif. On fait des films, de la musique, des jeux. C'est beau, c'est rapide, ca donne envie. L'interface ne ressemble pas a Pronote, pas a PIX, pas a un ENT. Elle ressemble a une appli de creation.
- **Face institution** : 100% aligne. PEAC, socle, CRCN, Pass Culture, fiches enseignant. Tout est la, documente, referençable.

C'est pas de la schizophrenie — c'est du design d'audience. Chaque utilisateur voit ce qui compte pour lui.

---

# 🌹 PARTIE 2 — LES DISCIPLINES

## 🎬 2.1 Cinema (discipline fondatrice — existante)

Le cinema reste le coeur. C'est la premiere discipline, la plus aboutie, celle qui a prouve la methode.

**Metiers decouverts** : realisateur, cadreur, ingenieur son, assistant real, scripte, acteur, monteur, producteur
**Production finale** : un court-metrage collectif
**Alignement EN** : arts plastiques (image animee), francais (narration, oral), EMI, PEAC, CRCN
**Financement** : Pass Culture (4e-Tle), collectivites (primaire), DRAC (PEAC)

---

## 🎵 2.2 Musique / Beatmaking

Le plus evident apres le cinema. Meme logique collective, meme culture chez les 12-18 ans.

| Module | Version musique |
|--------|----------------|
| M1 Observer | Ecouter 3 extraits → "Qu'est-ce que tu ressens ? Pourquoi ?" |
| M2 Comprendre | Deconstruire un morceau : melodie, rythme, texte, production |
| M3 Imaginer | "Et si on faisait un son qui raconte..." — sujet, ambiance, emotion |
| M4 Pitcher | Decrire le morceau en 30s : ambiance, message, style, audience |
| M5 Construire | Voter en 8 manches : tempo, style, theme, hook, refrain, instru, featuring, drop |
| M6 Ecrire | Ecrire avec des roles : parolier, topliner, storyteller, punchlineur |
| M7 Visualiser | Maquette audio : structure couplet-refrain-pont, arrangement, sons |
| M8 Equipe | Beatmaker, parolier, interprete, ingenieur son, videaste clip, DA |

**Production finale** : un morceau enregistre (telephone + BandLab/GarageBand).
**Metiers decouverts** : beatmaker, parolier, interprete, ingenieur son/mixage, directeur artistique, manager, videaste

---

## 🎮 2.3 Jeu Video / Game Design

Le plus engageant pour les collegiens. Et le moins present a l'ecole.

| Module | Version jeu video |
|--------|-------------------|
| M1 Observer | Jouer a 3 mini-jeux → analyser : pourquoi c'est fun ? |
| M2 Comprendre | Mecaniques : objectif, regle, feedback, progression, recompense |
| M3 Imaginer | "Et si on faisait un jeu ou..." — le concept en une phrase |
| M4 Pitcher | Concept en 30s : le joueur fait quoi, pourquoi c'est unique |
| M5 Construire | Voter : genre, mecanique, monde, personnage, objectif, twist |
| M6 Ecrire | Game Design Document : level designer, narrative designer, UX designer, game balancer |
| M7 Visualiser | Maquette papier : plateau, ecrans cles, parcours joueur, regles |
| M8 Equipe | Game designer, graphiste/DA, developpeur, testeur QA, sound designer, producteur |

**Production finale** : un prototype jouable (jeu de plateau/cartes ou Scratch/Twine).
**Metiers decouverts** : game designer, level designer, graphiste, developpeur gameplay, testeur QA, sound designer, producteur, narrative designer

---

## 🎙️ 2.4 Podcast / Radio / Documentaire sonore

Le plus accessible techniquement. Un telephone suffit.

| Module | Version podcast |
|--------|----------------|
| M1 Observer | Ecouter 3 podcasts courts → qu'est-ce qui capte l'attention ? |
| M2 Comprendre | Structure : accroche, developpement, chute. Pouvoir du son et du silence. |
| M3 Imaginer | "Et si on racontait l'histoire de..." — sujet, angle, singularite |
| M4 Pitcher | L'angle en 30s : de quoi, pourquoi, pour qui, quel format |
| M5 Construire | Voter : sujet, angle, format, ton, invite, duree, conclusion |
| M6 Ecrire | Conducteur : redacteur, interviewer, narrateur, documentaliste |
| M7 Visualiser | Planning : qui on interviewe, ou, quand, habillage sonore |
| M8 Equipe | Journaliste/redac chef, preneur de son, monteur, voix off, community manager |

**Production finale** : un episode de podcast de 5-10 minutes.
**Metiers decouverts** : journaliste, redacteur en chef, preneur de son, monteur son, animateur radio, community manager

---

## 🎭 2.5 Theatre / Performance

Le plus physique. Pas d'ecran pour la production finale. Le corps est l'outil.

| Module | Version theatre |
|--------|----------------|
| M1 Observer | 3 scenes jouees → qu'est-ce que le corps dit que les mots ne disent pas ? |
| M2 Comprendre | Presence, regard, silence, rythme, tension. Pourquoi une pause change tout. |
| M3 Imaginer | "Et si on jouait une scene ou..." — situation, personnages, conflit |
| M4 Pitcher | Situation en 30s : qui, ou, quel conflit, quelle emotion cachee |
| M5 Construire | Voter : lieu, personnages, conflit, genre, denouement |
| M6 Ecrire | Dialoguiste, didascaleur, constructeur de climax, architecte de scene |
| M7 Visualiser | Mise en espace : placements, deplacements, lumiere, rapport au public |
| M8 Equipe | Metteur en scene, comedien, scenographe, regisseur, eclairagiste, costumier |

**Production finale** : une representation de 10-15 minutes devant un public.
**Metiers decouverts** : metteur en scene, comedien, scenographe, regisseur, eclairagiste, costumier, dramaturge

---

## 📰 2.6 Journalisme / Media

Le plus aligne avec l'EMI — et le plus demande par l'institution.

| Module | Version journalisme |
|--------|---------------------|
| M1 Observer | Analyser 3 Unes / posts / videos → qu'est-ce qu'on te montre ? Qu'est-ce qu'on te cache ? |
| M2 Comprendre | Cadrage mediatique : angle, source, titre, image, contexte |
| M3 Imaginer | "Et si on faisait un reportage sur..." — sujet local, actuel |
| M4 Pitcher | Angle journalistique en 30s : sujet, angle, source, format |
| M5 Construire | Voter : sujet, format, angle, Une, titre |
| M6 Ecrire | Reporter, fact-checker, editorialiste, photographe/illustrateur |
| M7 Visualiser | Maquetter la Une : titraille, chapeau, image, hierarchie de l'info |
| M8 Equipe | Redacteur en chef, journaliste, photographe, maquettiste, fact-checker |

**Production finale** : un journal 4 pages ou un compte Instagram/TikTok de classe.
**Metiers decouverts** : journaliste, redacteur en chef, photographe, maquettiste, infographiste, fact-checker, community manager

---

## 🚀 2.7 Entrepreneuriat / Design de projet

Le plus adapte a la voie professionnelle et au chef-d'oeuvre.

| Module | Version entrepreneuriat |
|--------|------------------------|
| M1 Observer | Identifier un probleme quotidien → observer comme un designer |
| M2 Comprendre | 3 cas concrets : cycle probleme → solution → test → iteration |
| M3 Imaginer | "Et si on creait un produit / service qui..." — l'idee brute |
| M4 Pitcher | Pitch startup en 30s : probleme, solution, pour qui, pourquoi nous |
| M5 Construire | Voter : probleme, solution, nom, public, modele, slogan |
| M6 Ecrire | Mini business plan : stratege, designer, financier, communicant |
| M7 Visualiser | Prototyper : maquette produit, mockup appli, affiche, pitch deck |
| M8 Equipe | CEO, directeur produit, directeur marketing, directeur financier, designer, developpeur |

**Production finale** : un pitch de 5 minutes devant un jury + maquette du projet.
**Metiers decouverts** : entrepreneur, chef de produit, directeur marketing, designer UX, developpeur, charge de com, directeur financier

---

# 🌼 PARTIE 3 — LA CARTE TALENT COMME OUTIL D'ORIENTATION

## 3.1 L'evolution de la carte

La carte talent M8 est aujourd'hui un objet ludique (style Pokemon). Dans la vision 3 ans, elle devient un **outil d'orientation professionnelle** progressif.

### Niveau Decouverte (CM1-6e) — La carte ludique

```
🎧 INGENIEUR·E SON
Super-pouvoirs : Oreille musicale ⭐ Discretion ⭐
"Tu entends ce que les autres n'entendent pas !"
```

L'enfant decouvre qu'il a un talent. C'est un souvenir, un objet qu'il garde.

### Niveau Exploration (5e-4e) — La carte de visite

```
INGENIEUR·E SON
Atelier Cinema — College [nom] — [date]

Tes forces :
• Ecoute precise
• Sens du detail sonore
• Concentration

Le savais-tu ?
L'ingenieur du son est indispensable sur un tournage.
Sans lui, pas de dialogue, pas de musique, pas de film.
```

L'ado comprend que son talent correspond a un vrai role.

### Niveau Maitrise (3e-2nde) — La fiche metier

```
INGENIEUR·E SON
Atelier Cinema — [etablissement] — [date]

Competences demontrees :
• Ecoute et precision sonore
• Discretion et concentration
• Sens du detail technique

Ce metier dans la vraie vie :
Tournage cinema, TV, publicite, clip, podcast,
spectacle vivant, studio d'enregistrement

Formations :
• BTS Audiovisuel option Son (bac+2) — 2 500 places/an
• Ecole Louis-Lumiere, FEMIS, ENSATT
• Licence pro metiers du son

Salaire debutant : 1 800 - 2 500 EUR/mois
```

### Niveau Auteur (1re-Tle) — Le portfolio

```
PORTFOLIO — COMPETENCES CREATIVES
[Prenom Nom] — [etablissement] — [date]

Ateliers realises :
1. Cinema (4e) — Role : Ingenieur son
2. Podcast (2nde) — Role : Preneur de son / Monteur
3. Musique (1re) — Role : Ingenieur son / Mixeur

Competences transversales demontrees :
• Ecoute active et precision technique
• Travail en equipe sous contrainte de temps
• Gestion du materiel et des fichiers audio
• Sens du detail et de la continuite

Secteurs professionnels explores :
• Audiovisuel — cinema, TV, streaming
• Musique — studio, live, edition
• Media — podcast, radio, documentaire

Formations recommandees :
• BTS Audiovisuel option Son
• DN MADE mention Spectacle (volet son)
• Ecoles specialisees (Louis-Lumiere, SAE Institute)

[QR code vers le profil en ligne — optionnel]
```

Ce document est exportable en PDF et utilisable pour Parcoursup, un dossier de candidature, ou un entretien de stage.

## 3.2 Le cumul inter-disciplines

Un eleve qui fait 3 ateliers Banlieuwood dans sa scolarite (cinema en 4e, podcast en 2nde, game design en 1re) a explore **18 metiers differents** — sans stage, sans convention, sans deplacement.

Son portfolio cumule les roles, les competences, les secteurs. Et des patterns emergent : si l'eleve est toujours attire par les roles techniques (ingenieur son en cinema, preneur de son en podcast, sound designer en game design), c'est un signal d'orientation fort.

**Banlieuwood ne dit pas a l'eleve quoi faire.** Il lui montre ce qu'il fait bien, dans des contextes differents, et il laisse l'eleve tirer ses propres conclusions.

---

# 🌿 PARTIE 4 — L'ARCHITECTURE LOGICIELLE DANS 3 ANS

## 4.1 La structure

```
Banlieuwood Platform
│
├── Core Engine (le moteur universel)
│   ├── Observation (stimuli configurables)
│   ├── Analysis (grille configurable par discipline)
│   ├── Ideation ("Et si..." — contraintes configurables)
│   ├── Pitch (structure configurable)
│   ├── Collective Build (vote N manches — categories configurables)
│   ├── Collaborative Writing (roles configurables, V0 scaffolding)
│   ├── Production Planning (templates par discipline)
│   └── Team Formation (roles configurables, points invisibles)
│
├── Discipline Packs (le contenu par sujet)
│   ├── Cinema (existant)
│   ├── Musique / Game Design / Podcast
│   ├── Theatre / Journalisme / Entrepreneuriat
│   └── [Pack Custom — l'intervenant cree le sien]
│
├── Depth System (4 niveaux spiralaires — universel)
│   ├── Decouverte / Exploration / Maitrise / Auteur
│   └── Gradient de gamification
│
├── Career Discovery Layer (la couche metier)
│   ├── Fiches metier par discipline (6-8 roles)
│   ├── Carte talent progressive (ludique → portfolio)
│   ├── Cumul inter-ateliers
│   └── Liens formations / debouches (BTS, ecoles, RNCP)
│
├── Doctrine Layer (ce qui ne change JAMAIS)
│   ├── Zero classement comparatif
│   ├── Contributions anonymes
│   ├── Facilitateur ≠ professeur
│   └── Data pedagogique, pas performative
│
└── Institutional Layer (le back-office ecole)
    ├── Mapping (Socle, PEAC, CRCN, Parcours Avenir)
    ├── Dashboard enseignant post-seance
    ├── Export PEAC / LSU
    └── Referencement ADAGE / Pass Culture
```

## 4.2 Le modele de donnees

La session actuelle a un `module` et un `seance`. Dans 3 ans, elle a aussi :

```typescript
interface SessionConfig {
  discipline: "cinema" | "musique" | "gamedesign" | "podcast"
            | "theatre" | "journalisme" | "entrepreneuriat" | "custom";
  depth: "decouverte" | "exploration" | "maitrise" | "auteur";
  // ... autres params existants
}
```

Le `discipline` charge le bon pack de contenu. Le `depth` controle la profondeur et la gamification. Le moteur (vote, anonymat, points invisibles, attribution de roles) reste strictement identique.

## 4.3 Le Pack Custom

Le Pack Custom transforme Banlieuwood d'un produit a une **plateforme**. L'intervenant peut creer son propre pack :

```
Pack Custom : "Documentaire scientifique"
- M1 stimuli : 3 photos de phenomenes naturels
- M2 grille : hypothese → experience → conclusion
- M3 contrainte : "Et si on expliquait [phenomene] ?"
- M5 categories : sujet, format, angle, expert, experience
- M6 roles : redacteur scientifique, vulgarisateur, graphiste
- M8 metiers : journaliste scientifique, mediateur, realisateur doc
```

Un enseignant de SVT cree ce pack en 30 minutes. Le moteur Banlieuwood gere le reste.

---

# 💐 PARTIE 5 — LE MODELE ECONOMIQUE

## 5.1 Aujourd'hui

Banlieuwood vend des ateliers cinema avec intervenant. Le financement vient du Pass Culture (4e-Tle) + collectivites (primaire-college).

**Probleme** : chaque atelier = 1 intervenant × 1 classe × 8 seances. Ca ne scale pas.

## 5.2 Dans 3 ans — trois sources de revenus

### Source 1 — L'outil (SaaS)

| Formule | Prix | Contenu |
|---------|------|---------|
| **Gratuit** | 0 | 1 discipline (cinema), niveau Decouverte, 1 session/mois |
| **Pro** | ~30 EUR/mois | Toutes disciplines, tous niveaux, sessions illimitees, dashboard, export PDF |
| **Structure** | ~150 EUR/mois | Multi-intervenants, analytics, Pack Custom, API, marque blanche |

L'intervenant paye pour l'outil. L'ecole ne paye pas l'outil — elle paye l'intervenant (via Pass Culture).

### Source 2 — Les packs disciplinaires

- Packs inclus (cinema, podcast) — gratuits avec l'abo Pro
- Packs premium (game design, entrepreneuriat) — achat unique ou abo Structure
- Packs partenaires (CLEMI, CNC, SACEM) — gratuits car finances par le partenaire

### Source 3 — La formation

- Formation courte (1 jour) : 200-400 EUR/participant
- Formation longue (3-5 jours) : certification "Facilitateur Banlieuwood" — 800-1 500 EUR/participant

Si Banlieuwood est certifie Qualiopi, ces formations sont finançables par les OPCO.

## 5.3 Les terrains de deploiement

| Terrain | Financement | Discipline naturelle |
|---------|-------------|---------------------|
| **College 4e-3e** | Pass Culture (25 EUR/eleve) | Cinema, Podcast, Journalisme |
| **Lycee GT 2nde** | Pass Culture (30 EUR/eleve) | Cinema, Game Design, Podcast |
| **Voie pro** | Pass Culture + chef-d'oeuvre | Cinema, Entrepreneuriat, Musique |
| **Primaire** | Mairie / DRAC / PEAC | Cinema, Theatre |
| **MJC / centre social** | Subventions CAF | Musique, Cinema, Game Design |
| **Cites educatives** | Fonds cite educative (208 territoires) | Toutes disciplines |
| **Formation insertion** | OPCO, missions locales | Entrepreneuriat, Podcast |
| **Entreprise** | Budget formation | Entrepreneuriat, Cinema |

L'ecole est le premier terrain mais pas le seul.

---

# 🌸 PARTIE 6 — LE NOM ET L'IDENTITE

## 6.1 Banlieuwood reste le nom

"Banlieuwood" dit exactement ce que le projet fait : **amener la creation professionnelle la ou elle n'est pas**. Le nom porte la mission, pas le medium.

Les disciplines s'appellent :
- **Banlieuwood Cinema** (la fondatrice)
- **Banlieuwood Music**
- **Banlieuwood Games**
- **Banlieuwood Press**
- **Banlieuwood Stage** (theatre)
- **Banlieuwood Lab** (entrepreneuriat)
- **Banlieuwood Podcast**

Le logo et l'identite visuelle restent les memes. Ce qui change : la couleur d'accent par discipline et les icones.

## 6.2 Le slogan

Pas "plateforme pedagogique de creation collective en milieu scolaire".
Pas "outil de creation numerique pour jeunes".

**"On cree. On decouvre un metier."**

Sept mots. Les deux promesses. Dans le bon ordre.

---

# 🌺 PARTIE 7 — LA FEUILLE DE ROUTE

## Annee 1 (2026-2027) — Valider le cinema sur le terrain

- [ ] Tester en 4e college REP (1 classe, 1 intervenant, 8 seances)
- [ ] Tester en 2nde pro (1 lycee, format chef-d'oeuvre)
- [ ] Corriger le produit apres retour terrain
- [ ] Publier les retours : est-ce que ca marche ?
- [ ] Se faire connaitre aupres de 2-3 DAAC

**La regle** : rien d'autre avant d'avoir valide le cinema sur le terrain.

## Annee 2 (2027-2028) — Ajouter 2 disciplines, structurer le modele

- [ ] Extraire le moteur universel du code cinema (refactoring)
- [ ] Lancer Banlieuwood Podcast (le plus simple techniquement)
- [ ] Lancer Banlieuwood Music (le plus demande)
- [ ] Passer en SaaS (abonnement intervenant)
- [ ] Lancer la formation certifiante "Facilitateur Banlieuwood"
- [ ] Deployer sur 10-20 etablissements

## Annee 3 (2028-2029) — Plateforme ouverte

- [ ] Lancer Games + Press + Lab
- [ ] Ouvrir le Pack Custom
- [ ] Lancer la carte talent cumulative (portfolio inter-ateliers)
- [ ] Partenariats institutionnels (CNC, CLEMI, SACEM, Pass Culture)
- [ ] Deployer hors ecole (MJC, cites educatives, formation insertion)
- [ ] Objectif : 100 intervenants actifs, 500 sessions/an, 15 000 eleves touches

---

# 🌷 PARTIE 8 — CE QUI NE CHANGE JAMAIS

Quelle que soit la discipline, quelle que soit l'annee, quelle que soit la taille :

1. **Zero classement comparatif entre eleves.** Jamais.
2. **Contributions anonymes.** L'idee compte, pas qui l'a eue.
3. **Le facilitateur n'est pas un professeur.** Il partage son metier.
4. **Le produit final existe.** Un film, un morceau, un jeu, un podcast — la promesse est tenue.
5. **La data est pedagogique, pas performative.** On mesure la participation, pas la qualite.
6. **Les profils viennent du curriculum Banlieuwood.** Pas d'analyse comportementale.
7. **Deux langages, un produit.** L'eleve voit du creatif. L'institution voit de l'alignement.

C'est la doctrine. C'est la marque. C'est ce qui distingue Banlieuwood de tout le reste.

---

<div style="text-align:center; margin-top:60px; color:#888; font-size:13px;">

🌸🌺🌻🌹🌼🌷💐🌿

*Document strategique V1 — Mars 2026*
*Atelier Banlieuwood*

**"On cree. On decouvre un metier."**

🌸🌺🌻🌹🌼🌷💐🌿

</div>
