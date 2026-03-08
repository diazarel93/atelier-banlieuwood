# Briefing complet — Cockpit Banlieuwood (etat actuel)

Tu m'aides a ameliorer mon cockpit pedagogique. Avant de proposer des idees, lis ce document qui decrit TOUT ce qui est deja implemente. Ca t'evitera de proposer des choses qui existent deja.

---

## Architecture 3 ecrans

Mon systeme a 3 ecrans completement separes :

| Ecran | URL | Role | Principe |
|-------|-----|------|----------|
| **Cockpit prof** | `/session/[id]/pilot` | Piloter | Voir, comprendre, agir en temps reel |
| **Projecteur classe** | `/session/[id]/screen` | Montrer / Stimuler | Question + reponses live + celebrations |
| **Tablette eleve** | `/play/[id]` | Repondre / Creer | Question + input + envoi + feedback |

Les 3 ecrans sont synchronises en temps reel. Le prof pilote, les eleves repondent, le projecteur affiche les resultats live. Aucun outil cockpit n'est visible sur le projecteur ni sur la tablette eleve.

---

## Cockpit prof — Ce qui est implemente

### Layout general
```
HEADER (phase stepper + status + timer + controles)
QUESTION HERO (texte question + sous-titre pedagogique)
GAUCHE 20% | CENTRE 58% | DROITE 22%
ACTION BAR (9 boutons groupes)
```

### Colonne gauche — Cockpit de classe
- **Donut SVG anime** : montre N/total reponses (pas un pourcentage trompeur) avec spring animation quand le compteur change
- **Celebration glow** quand 100% ont repondu (anneau vert pulsant + texte "complet !")
- **Barre de progression** reponses avec gradient couleur
- **Banniere suggestion contextuelle** : "3 bloques — Donnez un exemple", "Tous reflechissent — Laissez du temps", "70% — Lancez la discussion ?", "Tous ont repondu !"
- **ClassCognitiveState** : phrase humaine qui resume l'etat de la classe ("Classe hesitante", "Classe en difficulte (N bloques)", "Classe partagee entre A et B", "Excellente dynamique !")
- **Mains levees** triees par urgence (plus long en premier) avec duree "depuis 2min"
- **Plan de classe spatial** (collapsible) : 2-4 colonnes adaptatives selon l'effectif (12→2col, 20→3col, 21+→4col), cercles colores par etat, animation pop quand un eleve repond, glow ring pulsant sur les mains levees, auto-scale CSS pour toujours tenir sans scroll
- **Carte cognitive** (barres QCM avec styles cognitifs : Visuel / Narratif / Emotionnel / Analytique)

### Colonne centre — Activite pedagogique
- **CenterStateBanner** : banniere contextuelle 48px qui change selon l'etat de la classe :
  - "24 eleves reflechissent..." (dots animes)
  - "Classe partagee entre A et B" (vibration horizontale + dot clignotant)
  - "72% preferent [option]"
  - "Beaucoup d'eleves bloques" (icone qui pulse)
- **Onglets** : Reponses / Plan de classe / Nuage d'idees
- **Compteur reponses** : badge "N/total" a cote du label avec couleur (vert si complet, bleu sinon)
- **Timer elapsed** depuis l'ouverture de la question (ambre a 2min, rouge a 5min)
- **Flux de reponses** : cartes animees spring (stiffness 400), swipe gauche=masquer / droite=selectionner
- **Pulse border bleu** sur les nouvelles reponses (< 3 secondes)
- **Actions inline par reponse** : commenter, projeter, nudge, score 1-5 etoiles, avertir, reset, 4 reactions emoji rapides
- **Fiche eleve** : quand on clique un eleve, le centre affiche sa fiche avec toutes ses reponses, son etat, ses warnings, le temps de reponse (rapide/normal/lent avec icone), des boutons d'action rapide (relancer, indice prive, avertir, message classe, voir progression)
- **Mode focus** : masque les panneaux lateraux pour se concentrer sur les reponses

### Colonne droite — Assistant pedagogique IA
Structure en 5 blocs :

**Bloc 1 — Alertes** (toujours visible)
- Mains levees avec duree
- Eleves bloques avec noms

**Bloc 2 — Analyse en direct**
- Messages contextuels bases sur le timing + le taux de reponse :
  - 0 reponses < 30s : "Les eleves decouvrent la question"
  - 0 reponses >= 90s : "Aucune reponse apres 1min30. Reformulez ou donnez un indice"
  - < 30% + stuck >= 3 : "N eleves bloques. Donnez un indice collectif"
  - >= 80% < 120s : "Excellente dynamique ! Lancez le debat"
- Micro-conseils italiques sous les messages

**Bloc 2.5 — Radar narratif** (5 axes SVG anime)
- Imagination / Emotion / Observation / Construction / Expression
- Scores calcules depuis les modules completes + engagement courant
- Polygon anime + score chips

**Bloc 2.75 — Radar dynamique de classe** (6 axes SVG, visible pendant responding)
- Participation / Comprehension / Imagination / Debat / Blocage / Attention
- Alimente par les donnees live (taux reponse, temps moyen, % bloques, spread des votes, etc.)
- Resume intelligent en bas : "Participation forte, blocage faible"

**Bloc 3 — Suggestions pedagogiques** (groupees)
- 3 groupes : Stimulation / Interaction / Analyse
- Boutons cliquables : "Donner un indice", "Lancer un debat", "Reformuler la consigne"
- Priorite haute = alerte visuelle (bordure rouge)
- Detection "total-silence" apres 90s sans reponse

**Bloc 4 — Qui a vote quoi** (QCM uniquement)
- Colonnes par option avec avatars des votants

**Timeline de seance** (en bas du panneau droit)
- 12 types d'events tracks automatiquement :
  - question_launched, first_response, half_responded, all_responded
  - stuck_detected, class_divided, debate_launched, vote_launched
  - broadcast_sent, nudge_sent, module_completed, phase_changed
- Format MM:SS depuis le debut de la seance
- Collapsible, 5 derniers events visibles par defaut

### Barre d'actions (footer)
3 groupes etiquetes avec icones :

| Groupe | Boutons |
|--------|---------|
| Stimulation | Indice, Relancer (N), Exemple |
| Interaction | Discussion, Debat, Sondage |
| Analyse | Comparer, Idees (nuage), Synthese |

+ CTA "Question suivante" a droite

### Modales et outils
- **Broadcast** : message classe 200 chars, 6 presets, presets custom sauvegardables, historique
- **Debat** : regroupe les reponses en camps par similarite textuelle, spotlight par reponse
- **Nuage d'idees** : 2 vues (Idees / Mots). Vue Idees = clustering Jaccard des reponses completes, label auto, compteur eleves par cluster, clic pour voir les reponses individuelles, barre de repartition. Vue Mots = nuage de frequence classique
- **Comparer** : cote a cote de 2 reponses
- **Spotlight** : zoom plein ecran sur une reponse
- **Export** : export Markdown de la seance complete
- **Timer** : presets clavier 1-5 (30s/1min/2min/3min/5min)

### Raccourcis clavier
| Touche | Action |
|--------|--------|
| Espace | Pause / Reprendre |
| N | Action suivante |
| F | Mode focus |
| B | Broadcast |
| E | Export |
| C | Comparer |
| T | Timer (puis 1-5) |
| ? | Aide raccourcis |
| Esc | Fermer modales |

### Micro-interactions implementees
- Pop animation (scale 1.25→1) quand un eleve repond sur le plan de classe
- Glow ring pulsant rouge sur les mains levees (desk-pair + spatial grid)
- Vibration horizontale de la banniere "classe divisee"
- Icone qui pulse sur "classe bloquee"
- Pulse border bleu sur les nouvelles cartes reponse (< 3s)
- Celebration donut (glow vert + "complet !") quand 100% ont repondu
- 3 dots animes "classe reflechit..."
- Spring animations sur toutes les entrees/sorties de composants
- Toast sonner sur toutes les mutations (nudge, broadcast, warn, vote, etc.)
- Son (useSound hook) sur events cles

---

## Projecteur — Ce qui est implemente

- Question affichee en grand, centree
- Compteur de reponses anime (+1 avec animation scale)
- Nuage de mots live pendant les reponses
- Distribution des options QCM en barres temps reel
- Podium des votes (top 3 avec hauteurs)
- Liste complete des votes avec pourcentages et barres de reactions
- Revelation collective en 5 phases avec celebration
- Applause meter (reactions live des eleves)
- Broadcast overlay plein ecran quand le prof envoie un message
- Gradients ambients animes en fond
- Transition confetti entre les questions
- Story filmstrip (affichage sequentiel)
- Galerie de posters
- Aucun outil cockpit visible — 100% stimulation
- Polling votes 5s, reactions 8s

---

## Tablette eleve — Ce qui est implemente

- Question + zone de reponse + bouton envoyer (ultra simple)
- "Reponse envoyee" avec stats (X/Y reponses, streak, XP)
- Etat d'attente anime entre les questions
- Interface de vote quand le prof lance un vote
- Resultats avec celebration si la reponse de l'eleve est choisie (combo)
- Messages du prof : broadcast (banner haut, auto-dismiss 12s), nudge, avertissement
- Systeme XP + streaks + combos + niveaux
- Chat d'equipe et power-ups
- Support offline (useOfflineQueue)
- 10+ etats specifiques par module (positionnement, image, budget, etc.)

---

## Modules supportes

Le cockpit supporte 12+ modules pedagogiques differents, chacun avec des situations et interactions specifiques :
- Module 1 : Positionnement (QCM + texte libre)
- Module 2 : Cinema / Emotion cachee
- Module 3-4 : Story / Personnages
- Module 5 : Sens & Theme (emotions)
- Module 6 : Scenario
- Module 9 : Budget production (categories)
- Module 10 : Et si... + Pitch (image+ecriture, avatar builder, chrono 60s)
- Module 11 : Cine-debat
- Module 12 : Manche voting (cartes, pool, vote)
- Et d'autres...

---

## Stack technique

- Next.js 16 (App Router) + TypeScript
- Supabase (auth + DB + realtime)
- TanStack Query (cache + polling + mutations optimistes)
- motion/react (Framer Motion) pour toutes les animations
- Sonner pour les toasts
- shadcn/ui + Tailwind CSS
- Glassmorphism design system (blur, transparence, bordures blanches)

---

## Ce qui N'EST PAS encore implemente

- **Replay cliquable post-seance** : la timeline track les events en live mais ne persiste pas en DB. Pas de mode "film de la seance" ou le prof peut cliquer un moment et revoir l'etat exact
- **Clustering IA semantique** : le nuage d'idees utilise du Jaccard simple (mots en commun), pas d'embeddings ni de LLM
- **Carte mentale arborescente** : pas de visualisation en arbre des idees de la classe
- **Profil psychologique de classe** genere par IA
- **Tableau de bord post-seance** avance (analyse de progression, comparaison entre seances)
- **Mode revelation progressive** sur le projecteur (afficher les reponses une par une avec suspense)

---

## Resume

Quand tu me proposes des ameliorations, verifie d'abord dans ce document si ca existe deja. La plupart des suggestions "radar", "etats cognitifs", "assistant intelligent", "timeline", "micro-interactions", "plan de classe" sont DEJA implementees.

Les vrais axes d'amelioration sont :
1. Persistance des donnees de seance pour le replay post-cours
2. Analyse IA semantique des reponses (clustering avance, embeddings)
3. Tableau de bord enseignant post-seance (comparaison entre classes/seances)
4. Mode revelation progressive sur le projecteur
5. Optimisation de la lisibilite projecteur a 6-8 metres
