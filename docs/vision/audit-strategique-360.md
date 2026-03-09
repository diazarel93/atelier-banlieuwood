# AUDIT 360° — BANLIEUWOOD
### Etude de Positionnement & Trajectoire World Class
*Mars 2026 — Product & UX Audit*

---

## TABLE DES MATIERES

1. [Executive Summary](#1--executive-summary)
2. [Etude de Marche & Benchmark](#2--etude-de-marche--benchmark)
3. [Matrice SWOT](#3--matrice-swot)
4. [Audit UX/UI du Cockpit Actuel](#4--audit-uxui-du-cockpit-actuel)
5. [Strategie de Transformation — Roadmap Prestige](#5--strategie-de-transformation--roadmap-prestige)
6. [Potentiel de Scalabilite](#6--potentiel-de-scalabilite)
7. [Sources](#7--sources)

---

## 1 — EXECUTIVE SUMMARY

**Banlieuwood occupe une niche vide au niveau mondial.** Apres benchmark exhaustif de Kahoot, Quizizz/Wayground, Duolingo for Schools, Classcraft et des references UX (Linear, Vercel) : il n'existe aucune plateforme gamifiee d'education au cinema pour le K-12. Zero.

Le marche de la gamification en education pese **3,5 milliards $ en 2024**, projete a **14,3 milliards $ en 2030** (CAGR 26,6%). Le segment creatif/artistique est entierement non-conteste.

L'application actuelle a des fondations solides (design system coherent, gamification implementee, architecture modulaire). Mais le cockpit prof reste dans un registre "SaaS utilitaire" qui ne transmet pas l'emotion du cinema. La trajectoire ci-dessous propose 3 phases pour atteindre le niveau "World Class".

---

## 2 — ETUDE DE MARCHE & BENCHMARK

### 2.1 Kahoot — Le Geant du Quiz Live

| Dimension | Detail |
|-----------|--------|
| **Utilisateurs** | 8M+ enseignants, 10 milliards de participations cumulees, 200+ pays |
| **Modele** | Quiz live synchrone, ecran partage, leaderboard temps reel |
| **Prix** | Gratuit (10 joueurs) → 3,99-9,99$/mois/prof |
| **Force principale** | Barriere d'entree zero (PIN, pas de compte eleve), energie game-show |
| **Faiblesse fatale** | Apprentissage superficiel uniquement (reconnaissance/rappel). Aucune creation. Pression temporelle exclut les eleves lents. Free tier aggressivement limite (10 joueurs). |
| **UX** | Dopamine-first : musique forte, compte a rebours, podium. Efficace mais epuisant. |

**Lecon pour BW** : Kahoot prouve que le format "ecran partage + reponse mobile" fonctionne massivement. Mais son plafond est la surface — il ne pourra jamais faire creer.

### 2.2 Quizizz / Wayground — L'Alternative Self-Paced

| Dimension | Detail |
|-----------|--------|
| **Utilisateurs** | 50M+ utilisateurs mondiaux |
| **Modele** | Quiz auto-rythme, mode devoirs, builder de lecons interactives |
| **Prix** | Gratuit (100 joueurs!) → 19-37$/mois |
| **Force principale** | Free tier genereux, supprime le stress du chrono, utilisable en devoir |
| **Faiblesse** | Rebrand recent (juin 2025) = confusion. Reste fondamentalement un outil de quiz. Aucune creation. |

**Lecon pour BW** : Le self-paced est plus inclusif que le live. A considerer pour les modules reflexifs (M1, M5).

### 2.3 Duolingo for Schools — Le Maitre de l'Engagement

| Dimension | Detail |
|-----------|--------|
| **Utilisateurs** | 47,7M DAU, 10,9M abonnes payants, CA > 1 milliard $ |
| **Gamification** | Streaks (+60% engagement), Leagues (+40% lecons/semaine), Badges (+30% completion), Hearts, XP |
| **Dashboard prof** | Gratuit, suivi granulaire, assignation par eleve |
| **Force principale** | Le systeme de gamification le plus prouve au monde. A/B teste a echelle massive. |
| **Faiblesse** | Langues uniquement. Pas de creation. Le dashboard prof est limité (monitoring, pas de pilotage). |
| **Design** | 3 formes fondamentales, mascotte emotionnelle, typo custom, vert = energie. Joyeux, rond, bouncy. |

**Lecon pour BW** : Le systeme de streaks est le levier #1 de la retention quotidienne. BW a deja streaks + badges + niveaux — il faut les rendre aussi visibles et addictifs que Duolingo.

### 2.4 Classcraft — Le RPG de Classe (Mort au Combat)

| Dimension | Detail |
|-----------|--------|
| **Histoire** | Fonde 2013, acquis par HMH en mai 2023, **ferme le 30 juin 2024** |
| **Modele** | RPG persistant : Guerriers/Mages/Soigneurs, XP/HP/AP, pouvoirs d'equipe, quetes |
| **Force** | La gamification la plus profonde jamais creee en EdTech. Les eleves "qui se fichent des notes" se souciaient de leur personnage. |
| **Cause de mort** | Acquisition → vidage de l'ame du produit. Cout de setup trop eleve pour les profs. Complexite RPG excluait les non-gamers. |

**Lecon pour BW** :
- ⚠️ **Conte cautionne** : meme le produit le plus aime peut etre acquis et detruit. Proteger l'ame du produit.
- La gamification profonde et persistante fonctionne MAIS doit etre simple a maintenir pour le prof.
- Le systeme d'equipe interdependant (tank/healer/mage) est genial — BW a deja les equipes (M8) avec roles cinema.

### 2.5 References UX — Linear & Vercel

#### Linear (le standard du SaaS craft)
- **Vitesse comme feature** : chaque interaction parait instantanee (local-first, updates optimistes)
- **Keyboard-first** : tout faisable sans souris, raccourcis apprenable progressivement
- **Animations qui communiquent** : jamais decoratives, toujours fonctionnelles (~150-200ms)
- **Workflows opiniatres** : defaults forts = moins de fatigue decisionnelle
- **Couleurs LCH** : uniformite perceptuelle entre themes
- Devise : *"Doux, rapide, previsible"*

#### Vercel (le standard du design system)
- **Geist Design System** : tokens semantiques (`foreground`/`background`), 3 fontes, theming trivial
- **Design state-aware** : chaque composant gere empty, loading, error, success
- **Mise en page resiliente** : gere tout contenu de toute longueur
- **Guidelines publiques** : transparence = confiance

**Lecon pour BW** : Adopter la philosophie Linear (vitesse, animations fonctionnelles, keyboard-first) + la rigueur Vercel (states, tokens semantiques, resilience).

### 2.6 Concurrence Directe — Cinema/Art Education

**Resultat de la recherche : AUCUN concurrent direct.**

| Plateforme | Description | Pourquoi ce n'est pas BW |
|-----------|-------------|--------------------------|
| Seesaw | Portfolio digital eleve | Outil de stockage, pas de gamification |
| BandLab for Education | Creation musicale en classe | Musique, pas cinema |
| Filmmakers Academy | Cours de cinema en ligne | Pas K-12, pas gamifie, pas de dashboard prof |
| Celtx | Logiciel de scenarisation | Outil pro, pas educatif |
| Scholastic Awards | Concours d'ecriture | Competition, pas plateforme d'apprentissage |

**Conclusion : Banlieuwood est seul sur son segment.**

---

## 3 — MATRICE SWOT

### FORCES (Internes)

| # | Force | Detail |
|---|-------|--------|
| F1 | **Niche monopolistique** | Zero concurrent en education gamifiee au cinema K-12 |
| F2 | **Creation, pas consommation** | Seul outil ou les eleves PRODUISENT (scenarios, pitchs, personnages, storyboards) vs quiz/choix multiple |
| F3 | **Gamification deja profonde** | Stars, badges, streaks, niveaux, achievements, XP — foundation Duolingo-like deja en place |
| F4 | **Architecture 8 modules** | Pipeline complet de creation cinematographique (idee → scenario → tournage → equipe) |
| F5 | **Design system mature** | Tokens semantiques, typo optique, palette chaude distinctive, animations spring-based |
| F6 | **IA integree** | Mentor socratique adaptatif, evaluation, feedback — pas juste generation de quiz |
| F7 | **Cockpit temps reel** | Supabase Realtime + polling = feedback live pour le prof |
| F8 | **Mode equipe** | Roles cinematographiques (M8) = version cinema du systeme Guerrier/Mage/Soigneur de Classcraft |

### FAIBLESSES (Internes)

| # | Faiblesse | Detail |
|---|-----------|--------|
| W1 | **Cockpit generique** | L'interface prof ressemble a un dashboard SaaS (Google Classroom vibes), pas a un studio de cinema |
| W2 | **Charge cognitive header** | Status bar dense : module pill + timer + students + auto-advance + controles — trop d'info en une ligne |
| W3 | **Grille eleves plate** | Liste de noms avec dots de couleur. Pas de spatialisation, pas d'emotion, pas de dynamique de classe |
| W4 | **Bruit visuel** | Bordures uniformes (`border-black/[0.06]`) partout, shadows generiques, tout au meme niveau |
| W5 | **Cinema invisible cote prof** | Metaphores cinematographiques presentes cote eleve (clap, iris, wipe) mais absentes du cockpit |
| W6 | **Pas de pricing/modele defini** | Le modele economique n'est pas encore formalise |
| W7 | **V2 Lavande incomplete** | Migration de theme en cours — deux systemes visuels coexistent |
| W8 | **Pas de mode offline** | Dependance au reseau, problematique en milieu scolaire |
| W9 | **Styles inline residuels** | Certains composants utilisent des hex hardcodes au lieu des tokens |

### OPPORTUNITES (Externes)

| # | Opportunite | Detail |
|---|------------|--------|
| O1 | **Marche de 14,3 Mds $ en 2030** | Gamification en education en croissance de 26,6%/an |
| O2 | **Mort de Classcraft** | Communaute orpheline de profs gamificateurs cherchant un remplacant |
| O3 | **IA generative mature** | GPT-4/Claude peuvent generer des feedbacks pedagogiques riches a cout marginal |
| O4 | **Education artistique sous-equipee** | Les profs d'art n'ont PAS d'equivalent Kahoot — demande latente enorme |
| O5 | **Tendance "learning by doing"** | Pedagogie active en hausse, les institutions veulent des outils de creation |
| O6 | **Extension multi-arts** | Architecture modulaire transposable : theatre, musique, ecriture creative |
| O7 | **International** | Format universel (cinema = langage mondial), localisable facilement |

### MENACES (Externes)

| # | Menace | Detail |
|---|--------|--------|
| T1 | **Kahoot ajoute un "mode creation"** | Avec leurs 8M profs, un pivot vers la creation creative serait devastateur |
| T2 | **Duolingo s'etend au-dela des langues** | Leur gamification + base utilisateurs pourrait ecraser tout nouvel entrant |
| T3 | **Budget EdTech en contraction** | Post-COVID, certains districts reduisent les licences logicielles |
| T4 | **Dependance Supabase/Vercel** | Infrastructure tierce, risques de pricing/disponibilite |
| T5 | **Complexite produit** | 8 modules = courbe d'apprentissage prof potentiellement elevee (piege Classcraft) |
| T6 | **Risque d'acquisition** | Succes = cible d'acquisition par un HMH/Pearson qui pourrait vider le produit |

---

## 4 — AUDIT UX/UI DU COCKPIT ACTUEL

### 4.1 Architecture Actuelle

```
┌─ Header (Phase Stepper + Status Bar) ──────────────────────┐
├────────────────────────────────────────────────────────────┤
│ LEFT SIDEBAR     │  CENTER               │  RIGHT SIDEBAR  │
│ (Module Guide)   │  (Response Stream)     │  (Student List)  │
│ 280px fixe       │  flex-1               │  300px toggle    │
├────────────────────────────────────────────────────────────┤
└─ Footer (CTA Bar + Timer) ────────────────────────────────┘
```

### 4.2 Charge Cognitive — Zones de Bruit Visuel

**Header (2 rangees) : SURCHARGE**
- Rangee 1 : Hamburger + "cockpit" + Phase Stepper centre
- Rangee 2 : Module pill + Timer(s) + Student count + Auto-advance toggle + Pause + Sound + Share + Settings
- **Verdict** : 10+ elements dans 80px de hauteur. L'intervenant doit scanner toute la barre pour trouver l'info pertinente. Violation du principe "urgence en < 1 seconde".

**Panneau central : BON mais generique**
- Stream de reponses bien hierarchise (cards avec animations spring)
- Mais : toutes les cards ont le meme style visuel (meme radius, meme shadow, meme border) → pas de differenciation visuelle entre reponse banale et reponse remarquable
- Le tab system (Reponses | Carte | Radar) ajoute une couche de navigation dans un espace deja dense

**Panneau droit (Eleves) : PLAT**
- Liste verticale de noms avec dots de statut (vert/orange/rouge)
- Aucune spatialisation : pas de notion de groupes, d'equipes, de dynamique
- Un dot vert = "connecte" mais ne communique pas l'engagement reel
- Pour 30 eleves, c'est un scroll infini sans hierarchie

**Footer : CORRECT**
- CTA claire (Question suivante), timer visible
- Onglets Stimulation/Interaction/Analyse bien separes

### 4.3 Hierarchie — Le Test de la Seconde

**Question : L'intervenant comprend-il l'urgence en < 1 seconde ?**

| Signal d'urgence | Visible en < 1s ? | Probleme |
|-----------------|-------------------|----------|
| Nombre de reponses recues | ✅ Oui (badge vert) | OK |
| Qui n'a PAS repondu | ❌ Non | Necessite de scanner la liste eleves |
| Timer restant | ⚠️ Moyen | Petit pill dans la status bar, pas assez saillant |
| Status de la session | ✅ Oui (pill colore) | OK |
| Qualite des reponses | ❌ Non | Faut lire chaque card individuellement |
| Energie de la classe | ❌ Non | Aucun indicateur d'engagement global |

**Score hierarchie : 3/6** — L'intervenant voit les chiffres mais pas la dynamique.

### 4.4 Immersion — Pourquoi l'Interface Echoue a Transmettre l'Emotion du Cinema

| Cote Eleve (Play) | Cote Prof (Pilot) |
|-------------------|-------------------|
| Background cinematique | Background cream uniforme |
| Clap board anime | Aucune metaphore cinema |
| Iris reveal, wipe, curtain | Fade-in generique |
| Film strip perforations | Bordures droites standard |
| Police cinema (Bebas Neue) | Police neutre (Inter/Jakarta Sans) |
| Coach mascotte | Pas de personnage |

**L'ecart est massif.** L'eleve vit une experience cinematographique. Le prof utilise un Google Classroom premium. Il n'y a aucune raison pour que le prof ne vive pas aussi l'emotion du cinema.

### 4.5 Score Design Actuel

| Dimension | Score | Detail |
|-----------|-------|--------|
| Coherence tokens | 8/10 | Tokens solides, quelques hex hardcodes |
| Typo | 9/10 | Sizing optique montre de la maturite |
| Layout | 8/10 | 3-col claire, responsive correct |
| Animation | 7/10 | Spring physics bon, quelques sur-animations |
| Accessibilite | 8/10 | AA+, reduced-motion respecte |
| Identite cinema | 4/10 | Presente cote eleve, absente cote prof |
| Immersion prof | 3/10 | SaaS utilitaire, pas studio cinema |
| **Score global** | **6.7/10** | **Bon outil. Pas encore une experience.** |

---

## 5 — STRATEGIE DE TRANSFORMATION — ROADMAP PRESTIGE

### PHASE 1 : QUICK WINS UI (2-3 semaines)
*Objectif : Passer de "SaaS" a "Studio" sans tout refaire*

#### 1.1 Typographie Cinema

| Avant | Apres |
|-------|-------|
| `Inter` partout dans le cockpit | **Bebas Neue** pour les titres de module, numeros de scene, compteurs |
| Tailles uniformes | Compteurs en `text-[56px] font-extrabold tabular-nums` — hero numbers a la Linear |
| Pas de hierarchie typo forte | 3 niveaux clairs : Display (Bebas) → Heading (Jakarta) → Body (Inter) |

**Impact** : Le simple changement de police des titres en Bebas Neue transforme instantanement le registre visuel.

#### 1.2 Texture & Grain

| Element | Implementation |
|---------|---------------|
| Background cockpit | Ajouter un `film-grain` overlay subtil (CSS noise, opacity 0.02-0.04) |
| Cards reponses | Micro-texture papier sur hover (comme un script imprime) |
| Dividers | Remplacer les `border-black/[0.06]` par des lignes en pointilles style storyboard |
| Accents | Perforation film-strip en decoration des sidebars |

**Cout** : ~2 jours. **Impact** : Enorme sur le ressenti.

#### 1.3 Suppression des Cadres Rigides

```
AVANT : Chaque card = rounded-[18px] + border + shadow uniforme
         → Tout au meme niveau, hierarchie plate

APRES : 3 niveaux de surface
         Niveau 1 (fond) : bg transparent, pas de border
         Niveau 2 (card) : bg-white/80, backdrop-blur, border subtile
         Niveau 3 (hero) : bg-white, shadow-lg, accent colore
```

Principe : **Moins de boites = plus de respiration = plus de focus.**

#### 1.4 Palette "Nuit de Tournage" pour le Cockpit

Le cockpit prof peut basculer vers une palette sombre (comme une cabine de regie) :

```css
--cockpit-bg: #0D0F14;        /* Noir profond cinema */
--cockpit-surface: #161922;    /* Surface cabine */
--cockpit-border: #1E2230;     /* Bordures subtiles */
--cockpit-glow-orange: rgba(255,107,53,0.15); /* Lueur orange */
--cockpit-glow-teal: rgba(78,205,196,0.12);   /* Lueur teal */
```

Pas un dark mode generique — une **ambiance de regie** avec des lueurs colorees sur les elements actifs.

### PHASE 2 : EVOLUTION PRODUIT UX (4-6 semaines)
*Objectif : De la Grille a la Constellation*

#### 2.1 Constellation d'Eleves (remplace la liste plate)

**Concept** : Les eleves sont representes comme des etoiles dans une constellation, pas comme des lignes dans un tableau.

```
    ★ Marie (active, ecrit)
         ╲
  ○ Thomas (idle)──────★ Sophia (soumis!)
         │               ╱
    ★ Lucas (ecrit)     ★ Lea (soumis!)
         │
    ◐ Ahmed (en retard)
```

| Etat | Representation visuelle |
|------|------------------------|
| Connecte, actif | Etoile brillante, pulsation lente |
| En train d'ecrire | Etoile avec halo d'ecriture (lueur orange) |
| A soumis | Etoile pleine, eclat vert |
| Inactif/idle | Cercle gris, sans lueur |
| En retard | Cercle orange clignotant |
| Equipe | Noeud de connexion entre etoiles (liens) |

**Implementation** : Canvas 2D ou SVG anime. Les etoiles se regroupent par equipe. L'intervenant voit la "forme" de sa classe d'un coup d'oeil — pas besoin de lire 30 noms.

#### 2.2 Radar Emotionnel Temps Reel

Visualisation en temps reel de l'etat emotionnel de la classe, derivee des donnees existantes :

```
        Creativite
           ↑
    ───────●───────
   ╱       │       ╲
 Engagement ●───────● Expression
             │
        Comprehension
```

- Se met a jour a chaque reponse recue
- Utilise les axes V2 deja implementes (comprehension, creativite, expression, engagement)
- Le prof voit si la classe est "en zone creative" ou "en zone de reflexion"

#### 2.3 Timeline Narrative du Cockpit

Remplacer le stepper lineaire du header par une **timeline cinematographique** :

```
──●──────●──────◉──────○──────○──
  Idee    Perso   [SCENE]  Tournage  Equipe
  ✓       ✓       EN COURS
```

- Chaque module = un acte du film de la classe
- L'acte en cours est mis en valeur (◉) avec apercu du contenu
- Les actes passes montrent les artefacts produits
- Les actes futurs sont en silhouette

#### 2.4 Spotlight Mode Repense

Quand le prof selectionne une reponse pour la projeter :

| Avant | Apres |
|-------|-------|
| Card blanche agrandie | **Iris cinematique** : la reponse apparait comme un plan de cinema, avec effect de profondeur de champ (blur du fond, focus center) |
| Texte brut | Texte stylise comme un extrait de scenario (police Courier Prime, marges scenario) |
| Pas d'ambiance | Ambiance sonore subtile (optionnel) |

### PHASE 3 : INNOVATION DISRUPTIVE (8-12 semaines)
*Objectif : Fonctionnalites "Signature" qui rendent BW indispensable*

#### 3.1 "Le Film de la Classe" — Artefact Final

A la fin des 8 modules, la classe a produit :
- Un scenario complet (M6)
- Un storyboard (M7)
- Une equipe de tournage assignee (M8)
- Des personnages avec avatars (M10)

**Innovation** : Generer automatiquement un **"trailer" du film de la classe** — un document visuel anime qui assemble tous les artefacts :

```
┌────────────────────────────────┐
│  🎬 BANLIEUWOOD PRESENTE       │
│                                │
│  [Film de la Classe 3B]       │
│                                │
│  Scenario par : 28 eleves     │
│  Scenes : 6                    │
│  Genre : Comedie dramatique   │
│                                │
│  ★ Personnages ★              │
│  [Avatar] Sarah - La Revoltee │
│  [Avatar] Karim - Le Mentor   │
│                                │
│  Equipe technique :           │
│  Realisateur : Marie          │
│  Scenariste : Lucas           │
│  ...                          │
│                                │
│  [VOIR LE SCENARIO COMPLET]   │
└────────────────────────────────┘
```

Export en PDF/image partageable. Le prof l'affiche en classe. Les eleves le montrent a leurs parents. **C'est le trophee tangible.**

#### 3.2 "Salle de Projection" — Mode Restitution

Un mode d'affichage dedie pour le grand ecran (TNI/projecteur) qui transforme l'ecran en salle de cinema :

- Rideau qui s'ouvre a l'ouverture
- Chaque reponse projetee = un "plan" avec transition cinematique
- Le vote collectif = une "seance de rushes" avec bandeaux de vote style festival
- Les resultats = ceremonie de prix avec effets particules

#### 3.3 "Carnet du Realisateur" — Portfolio Eleve

Chaque eleve accumule au fil des sessions :
- Ses textes ecrits (scenarios, pitchs, descriptions)
- Son role dans l'equipe
- Sa carte talent
- Ses badges et achievements
- Son "style" emerge (quels themes reviennent, quel vocabulaire)

**Visible par** : l'eleve, le prof, les parents (avec permissions).
**Innovation** : L'IA analyse le portfolio et genere des "notes de production" : *"Sarah montre une forte affinite pour les personnages complexes et les retournements de situation. Elle excelle dans les dialogues."*

#### 3.4 "Festival de Classe" — Evenement de Culmination

En fin de parcours, le prof declenche un "Festival" :
- Les travaux des equipes sont presentes dans un format "selection officielle"
- La classe vote pour differents "prix" (Meilleur scenario, Meilleur personnage, Prix du public)
- Chaque eleve recoit un "palmares" personnalise
- Le tout genere un "journal du festival" exportable

**Pourquoi c'est signature** : Aucun outil EdTech ne propose une ceremonie de culmination gamifiee. C'est le moment "fin de Duolingo tree" mais en 100x plus memorable.

#### 3.5 "Studio IA" — Co-creation Assistee

L'IA ne fait pas que evaluer — elle co-cree avec les eleves :
- **Illustrateur** : genere des concept arts pour les scenes decrites
- **Directeur casting** : suggere des ajustements aux personnages bases sur les arcs narratifs
- **Monteur** : propose des reordonnancements de scenes pour plus de tension
- **Critique** : donne un feedback "presse" sur le scenario ("Le Monde du Cinema : Un debut prometteur avec des dialogues percutants, mais l'acte 2 manque de tension")

---

## 6 — POTENTIEL DE SCALABILITE

### 6.1 L'Architecture Actuelle est Deja Extensible

Le pattern BW est :
```
Module = {
  situations[],      // 3-5 positions sequentielles
  gamification,      // stars, badges, streaks, XP
  cockpit_view,      // rendu facilitateur
  play_view,         // rendu eleve
  ai_mentor,         // feedback adaptatif
  team_mechanics,    // optionnel
}
```

Ce pattern est **domain-agnostic**. Il fonctionne pour toute discipline creative.

### 6.2 Extension Multi-Arts — Sans Perdre l'Ame

| Domaine | Adaptation BW | Ce qui change | Ce qui reste |
|---------|--------------|---------------|-------------|
| **Theatre** | "Banlieuwood Theatre" | Lexique (scene → acte, plan → mise en espace), artefacts (texte theatral vs scenario), metaphores visuelles (rideau, projecteur, coulisses) | Modules de base (idee, personnage, scenario), gamification, equipes, IA mentor |
| **Musique** | "Banlieuwood Music" | Integration audio (BandLab-like), notation musicale, artefacts sonores | Modules creatifs (composition, arrangement = scenario, storyboard), equipes (orchestre), gamification |
| **Ecriture Creative** | "Banlieuwood Atelier" | Deja partiellement implemente (M1 L'Histoire). Focus texte pur, pas de visuel | Mentor socratique, gamification, portfolio |
| **Arts Plastiques** | "Banlieuwood Studio" | Integration dessin/collage, artefacts visuels, critique d'oeuvre | Progression gamifiee, feedback IA, exposition finale |

### 6.3 Strategie de Pivot : "Banlieuwood Creative Platform"

```
                    BANLIEUWOOD
                    Creative Education Platform
                         │
          ┌──────────────┼──────────────┐
          │              │              │
      🎬 Cinema      🎭 Theatre    🎵 Music
      (Module 1)     (Module 2)   (Module 3)
          │              │              │
          └──────────────┼──────────────┘
                         │
                  Shared Engine:
                  - Gamification (streaks, XP, badges)
                  - AI Mentor (adaptatif par domaine)
                  - Cockpit Prof (constellation, radar)
                  - Portfolio Eleve (multi-arts)
                  - Festival (ceremonies de culmination)
```

**Principe** : Le cinema reste le HERO produit (c'est la, le positionnement unique). Les autres arts sont des extensions du meme moteur. Le nom "Banlieuwood" reste car il porte l'identite — les sous-marques s'ajoutent.

### 6.4 Calendrier Strategique

| Phase | Objectif | Horizon |
|-------|----------|---------|
| Maintenant | Cinema K-12 en France | Deploye |
| +6 mois | Cinema K-12 francophone (Belgique, Suisse, Quebec, Afrique) | Localisation |
| +12 mois | Cinema K-12 anglophone (UK, US, Canada) | Traduction + adaptation culturelle |
| +18 mois | Extension Theatre (premier art additionnel) | Nouveau module pack |
| +24 mois | Plateforme multi-arts avec marketplace de modules | Ecosysteme |

---

## 7 — SOURCES

### Benchmark & Marche
- [Kahoot Statistics — 10 Billion Participants](https://kahoot.com/blog/2023/11/09/kahoot-reaches-10-billion/)
- [Kahoot Pricing 2026 (Brighterly)](https://brighterly.com/blog/kahoot-pricing/)
- [Kahoot Review — Strengths & Weaknesses (Wooclap)](https://www.wooclap.com/en/blog/kahoot-review/)
- [Quizizz Becomes Wayground (PR Newswire, June 2025)](https://www.prnewswire.com/news-releases/quizizz-becomes-wayground-announces-new-ai-and-curriculum-supports-302489367.html)
- [Duolingo Gamification Secrets (Orizon)](https://www.orizon.co/blog/duolingos-gamification-secrets)
- [Duolingo $15B App Gaming Principles (Deconstructor of Fun)](https://www.deconstructoroffun.com/blog/2025/4/14/duolingo-how-the-15b-app-uses-gaming-principles-to-supercharge-dau-growth)
- [Duolingo Shape Language & Art Style](https://blog.duolingo.com/shape-language-duolingos-art-style/)
- [HMH Acquires Classcraft (2023)](https://www.hmhco.com/about-us/press-releases/hmh-acquires-canadian-edtech-company-classcraft)
- [The End of Classcraft (Educatoral, 2024)](https://educatoral.com/wordpress/2024/02/22/the-end-of-the-best-student-engagement-gamification-tool-ive-ever-seen/)
- [Gamification in Education Market — $14.3B by 2030 (GlobeNewsWire)](https://www.globenewswire.com/news-release/2025/02/21/3030401/28124/en/Gamification-in-Education-Market-to-Reach-Revenues-of-14-3-Billion-by-2030.html)

### UX References
- [Linear UI Redesign](https://linear.app/now/how-we-redesigned-the-linear-ui)
- [The Linear Method — Opinionated Software (Figma Blog)](https://www.figma.com/blog/the-linear-method-opinionated-software/)
- [Linear Design Trend (LogRocket)](https://blog.logrocket.com/ux-design/linear-design/)
- [Vercel Web Interface Guidelines](https://vercel.com/design/guidelines)
- [Vercel Dashboard UX (Medium)](https://medium.com/design-bootcamp/vercels-new-dashboard-ux-what-it-teaches-us-about-developer-centric-design-93117215fe31)
- [Geist Design System (Vercel)](https://vercel.com/geist/theme-switcher)

### Recherche Academique
- [Interactive Art Forms & Gamification in Modern Art Education (Springer, 2025)](https://link.springer.com/article/10.1007/s10639-025-13856-3)

---

*Document genere le 9 mars 2026 — Audit strategique Banlieuwood v1.0*
