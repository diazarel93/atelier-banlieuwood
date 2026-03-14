# Plan d'amélioration UX/Gaming — Banlieuwood

> Objectif : Passer d'un outil EdTech fonctionnel à une **expérience mémorable** que les élèves redemandent et dont les profs parlent.

---

## 1. Sas cinématique post-join (effort: 2h, impact: GROS)

### Problème
L'élève arrive sur `/play/{id}` et tombe directement en waiting state. Zéro mise en scène, zéro anticipation. C'est comme entrer dans un cinéma sans passer par le hall.

### Solution
Insérer un écran intermédiaire de 4-5 secondes entre le join et le waiting :

```
[Join réussi] → [Sas cinématique] → [Waiting state]
```

### Détail technique
- **Fichier** : `src/app/play/[id]/page.tsx` — nouvel état `intro` avant `waiting`
- **Animation** :
  1. Fond noir, rideau qui s'ouvre (CSS `curtain-open` keyframe existant)
  2. Titre de la session en font-cinema qui apparaît au centre (typewriter 50ms/char)
  3. Texte "Tu entres sur le plateau..." en fade-in dessous
  4. Son `jingle` joué à l'ouverture
  5. Auto-transition vers waiting après 4s ou tap pour skip
- **State** : `showCinematicIntro` boolean, `true` au premier mount, `false` après
- **Composant** : Réutiliser `CinematicIntro` existant ou l'étendre

### Critères de validation
- [ ] L'animation joue une seule fois par session (pas au refresh)
- [ ] Skip possible au tap/clic
- [ ] Son jingle synchronisé avec l'animation
- [ ] Fonctionne sur mobile (pas de clip-path non supporté)

---

## 2. Célébrations par palier de niveau (effort: 2h, impact: MOYEN)

### Problème
Le confetti est identique à chaque événement. Après 3 sessions, plus aucun effet de surprise.

### Solution
Système de célébration progressif calé sur le niveau atteint :

| Niveau | Effet |
|--------|-------|
| 1-3 (Figurant→Assistant) | Confetti simple (actuel, 50 particules) |
| 4-6 (Cadreur→Réalisateur) | Confetti 100 particules + spotlight CSS sweep sur le texte |
| 7-9 (Producteur→Légende) | Confetti 150 + screen shake léger (2px, 300ms) + son `fanfare` |
| 10 (Oscar) | Animation full-screen statuette dorée, confetti gold 200 particules, son `fanfare` + `levelUp` enchaînés |

### Détail technique
- **Fichier** : `src/components/celebrations.tsx`
- Ajouter prop `level` au `CelebrationOverlay`
- Fonction `getCelebrationIntensity(level)` → retourne `{ particles, shake, spotlight, sound }`
- CSS `@keyframes spotlight-sweep` : gradient linéaire blanc 20% opacity qui balaye de gauche à droite en 1.5s
- CSS `@keyframes screen-shake` : translate(2px, 1px) sur 300ms
- **Son** : enchaîner `cardReveal` (300ms) puis `fanfare` (850ms) pour les hauts niveaux

### Critères de validation
- [ ] Chaque palier a un rendu visuellement distinct
- [ ] Le shake ne trigger pas de scroll involontaire sur mobile
- [ ] Le son est muté si `muteSounds` est actif

---

## 3. Mini-jeu d'attente (SentState) (effort: 4h, impact: MOYEN)

### Problème
Après avoir envoyé sa réponse, l'élève est passif. Il voit un trivia mais c'est du texte statique. Il décroche et va sur son téléphone.

### Solution
Remplacer le trivia par un mini-jeu interactif optionnel :

**Option A — "Devine le score"** :
- Slider : "Combien de réponses sont déjà arrivées ?"
- Comparaison en temps réel après 5s
- +5 XP si estimation à ±3 du vrai nombre

**Option B — "Mot cinéma"** :
- Un mot lié au cinéma en lettres mélangées
- L'élève remet les lettres dans l'ordre (drag ou tap)
- Timer 15s, +5 XP si trouvé

### Détail technique
- **Fichier** : `src/components/play/states/sent-state.tsx`
- Nouveau composant `WaitingMiniGame` avec 2 variantes aléatoires
- Utiliser `responsesCount` du polling pour le "devine le score"
- Liste de 50 mots cinéma dans `src/lib/cinema-words.ts`
- Le mini-jeu est optionnel (bouton "Jouer en attendant")

### Critères de validation
- [ ] Le mini-jeu ne bloque pas la transition vers vote/result
- [ ] Le XP bonus est envoyé au serveur
- [ ] Fonctionne offline (pas de fetch supplémentaire pour le mot)

---

## 4. Écran projecteur spectaculaire (effort: 4h, impact: GROS)

### Problème
L'écran `/session/[id]/screen` est fonctionnel mais plat. Projeté en classe, il ne crée pas de "waouh". Les réponses apparaissent comme une simple liste.

### Solution

### 4A. Compteur flip-clock animé
- Gros chiffre central "23/30" avec effet flip (comme les tableaux d'aéroport)
- Chaque nouvelle réponse fait tourner le digit
- Barre de progression circulaire autour du compteur

### 4B. Entrée des réponses en "ticket de cinéma"
- Chaque réponse highlighted glisse depuis le bas de l'écran
- Design ticket : bord dentelé, nom+avatar à gauche, texte à droite
- Stack des 3 derniers tickets visibles, les anciens glissent vers le haut

### 4C. Grain de pellicule
- Overlay CSS film-grain (le keyframe existe dans globals.css)
- Opacité 3-5%, permanent, donne le côté "cinéma"

### 4D. Ambiance sonore optionnelle
- Bouton pour le prof (dans le cockpit, pas sur l'écran) : "Activer musique d'ambiance"
- Utiliser AudioContext existant pour un drone low-fi généré procéduralement
- Volume faible (gain 0.05), fade-in/out 2s

### Détail technique
- **Fichier** : `src/app/(dashboard)/session/[id]/screen/page.tsx`
- Nouveau composant `FlipCounter` dans `src/components/screen/flip-counter.tsx`
- Nouveau composant `TicketReveal` dans `src/components/screen/ticket-reveal.tsx`
- Activer `.film-grain::after` en overlay sur le screen layout
- Ambiance audio : nouveau son `ambiance` dans `use-sound.ts`

### Critères de validation
- [ ] Le flip counter est fluide à 60fps
- [ ] Les tickets ne s'accumulent pas (max 3 visibles)
- [ ] Le film grain ne ralentit pas le rendu
- [ ] L'ambiance audio est contrôlée par le prof uniquement

---

## 5. Avatar builder étendu (effort: 2h, impact: MOYEN)

### Problème
12 emojis pour se différencier. Dans une classe de 30, tout le monde a le même. Pas de sentiment d'identité.

### Solution en 2 phases :

### Phase 1 (immédiat) — 30 emojis + combo
- Passer à 30 emojis organisés en 3 rangées thématiques :
  - Cinéma : 🎬🎭🎥🎤🎞️🎦🎪🎶🎼🎹
  - Énergie : 🌟💫🔥⚡🎯🚀💎✨🌈🦋
  - Fun : 🎨🎵🧙‍♂️🦊🐱🦁🎃👻🤖🦄
- Générer un surnom aléatoire associé à l'emoji : "🔥 Le Flamboyant", "🦊 Rusé Comme Un Renard"

### Phase 2 (futur) — DiceBear
- Le type `AvatarOptions` existe déjà dans le code
- Promouvoir le DiceBear avatar builder du Module 10 en feature globale
- L'avatar DiceBear suit l'élève dans toutes les sessions

### Détail technique
- **Fichier** : `src/app/join/page.tsx`
- Étendre `AVATARS` array de 12 à 30
- Nouveau fichier `src/lib/avatar-nicknames.ts` : map emoji → surnom
- Afficher le surnom sous l'avatar sélectionné
- Stocker le surnom dans localStorage avec le studentId

### Critères de validation
- [ ] La grille 30 emojis reste lisible sur mobile (5 colonnes au lieu de 6)
- [ ] Le surnom s'affiche dans le jeu (waiting, sent, done states)
- [ ] Rétrocompatible avec les sessions existantes (12 anciens emojis toujours valides)

---

## 6. Récap session / badge partageable (effort: 3h, impact: GROS)

### Problème
Quand la session finit, l'élève voit ses stats et ferme l'onglet. Aucune trace, aucun souvenir, aucune viralité.

### Solution
Un badge de session généré côté client, accessible via `/play/{id}/recap` (route existante).

### Design du badge
```
┌─────────────────────────────────┐
│  🎬  BANLIEUWOOD                │
│  ─────────────────              │
│  Session : "Emotions et Cinéma" │
│                                 │
│  🏆 Niveau : Scénariste         │
│  ⚡ XP gagné : 180              │
│  🔥 Meilleur streak : 5         │
│  💡 1 idée retenue              │
│                                 │
│  [avatar] [pseudo]              │
│  14 mars 2026                   │
└─────────────────────────────────┘
```

### Détail technique
- **Fichier** : `src/app/play/[id]/recap/page.tsx` (la route existe, l'enrichir)
- Composant `SessionBadge` dans `src/components/play/session-badge.tsx`
- Utiliser `html-to-image` ou Canvas API pour générer un PNG
- Boutons : "Copier l'image" + "Télécharger" + "Partager" (Web Share API)
- Le badge utilise les données de `gameStats` déjà calculées dans le DoneState
- Le prof peut activer/désactiver la génération de badge dans les settings

### Critères de validation
- [ ] Le badge est généré côté client (pas de serveur image)
- [ ] Le partage fonctionne sur iOS Safari (Web Share API)
- [ ] Fallback "Copier l'image" sur desktop
- [ ] Le design est cohérent avec la charte graphique

---

## 7. Feedback IA mode libre (effort: 3h, impact: MOYEN)

### Problème
En mode `free`, l'élève enchaîne seul. Il n'a aucun retour entre les questions. C'est comme un QCM — aucun coaching.

### Solution
Un micro-feedback IA (1 phrase) affiché pendant 3s après chaque réponse en mode libre :

- "Bonne piste ! Continue dans cette direction."
- "Essaie de développer un peu plus ton idée."
- "Réponse originale, j'aime l'angle que tu prends !"

### Détail technique
- **Fichier** : `src/app/api/sessions/[id]/respond/route.ts` — en mode free, après l'upsert
- Appel IA court (max 30 tokens) via `claude-provider.ts` avec prompt :
  ```
  Tu es un mentor de cinéma bienveillant. L'élève (niveau {level}) a répondu "{text}" à la question "{prompt}".
  Donne un feedback encourageant en UNE phrase courte (max 15 mots). Pas de note, juste un encouragement ou un conseil.
  ```
- Retourner le feedback dans la réponse JSON : `{ ...data, aiFeedback: "..." }`
- **Fallback** : Si l'IA timeout (>2s) ou erreur, retourner un feedback générique random parmi 10 phrases prédéfinies
- Côté client : afficher dans un toast stylisé "mentor" avec l'icône 🎬

### Critères de validation
- [ ] Le feedback n'ajoute pas plus de 2s au temps de réponse
- [ ] Fallback phrases si l'IA est indisponible
- [ ] Le feedback n'apparaît PAS en mode guidé (seulement free)
- [ ] Le prof peut désactiver le feedback IA dans les settings

---

## 8. Leaderboard + streaks visibles (effort: 3h, impact: GROS)

### Problème
Le XP s'accumule mais personne ne le voit sauf l'élève lui-même. Pas de compétition sociale, pas de motivation par les pairs.

### Solution

### 8A. Leaderboard en waiting
- Top 3 affiché pendant le waiting state (entre les questions)
- Design podium : 🥇🥈🥉 avec pseudo + niveau + XP
- Mis à jour en temps réel via le polling existant

### 8B. Streak flames
- Quand un élève est en streak ≥ 3, son avatar dans le cockpit prof + l'écran projecteur affiche 🔥
- Streak ≥ 5 : flamme animée (pulse CSS)
- Streak ≥ 8 : double flamme 🔥🔥

### 8C. Power-ups activation
- Le composant `PowerUpsBar` existe déjà dans `src/components/play/power-ups-bar.tsx`
- L'activer : après streak de 5, l'élève peut utiliser "Double XP" sur la prochaine question
- UI : bouton qui pulse en or, disparaît après utilisation

### Détail technique
- **Leaderboard** : Nouveau composant `src/components/play/mini-leaderboard.tsx`
  - Données : ajouter `topStudents` au payload de `/api/sessions/[id]/situation`
  - Query côté serveur : top 3 students par XP dans cette session
  - Afficher dans WaitingState entre l'animation et le tip
- **Streaks** : Ajouter `currentStreak` au student model (déjà dans responses?)
  - Afficher dans le cockpit prof à côté du pseudo
  - Afficher sur l'écran projecteur à côté des réponses highlighted
- **Power-ups** : Lire `src/components/play/power-ups-bar.tsx` et l'intégrer dans le flow XP

### Critères de validation
- [ ] Le leaderboard ne spoile pas les réponses (juste pseudo + XP)
- [ ] Les streaks sont calculées côté serveur (pas manipulables)
- [ ] Le power-up est consommé après utilisation (pas de double-spend)

---

## 9. Micro-détails UI (effort: 2h, impact: PETIT mais perceptible)

### 9A. Bouton "Envoyer" — feedback visuel
- Quand le texte > 20 caractères : le bouton passe de gris à couleur avec un micro-bounce (scale 1→1.05→1, 200ms)
- Quand le texte > 100 caractères : texte du bouton change "Envoyer" → "Envoyer ta super réponse !"

### 9B. Timer dernières secondes
- Quand `remainingSeconds < 10` :
  - Le countdown passe en rouge
  - Pulse animation (scale 1→1.1→1 chaque seconde)
  - Son `tick` joué chaque seconde
- Quand `remainingSeconds < 3` :
  - Shake léger du container

### 9C. Transition question→question
- Remplacer le simple fade par le `wipe-right` CSS existant
- Durée : 600ms
- Le numéro de question glisse depuis la droite

### Détail technique
- **9A** : `src/components/play/states/situation-state.tsx` — conditionner le style du bouton sur `text.length`
- **9B** : `src/components/countdown-timer.tsx` — ajouter classes conditionnelles + trigger `playSound("tick")`
- **9C** : `src/app/play/[id]/page.tsx` — changer la variant d'AnimatePresence

### Critères de validation
- [ ] Le bounce bouton ne cause pas de layout shift
- [ ] Le tick sonore respecte le mute global
- [ ] La transition wipe fonctionne sur Safari iOS

---

## 10. PWA / Installable (effort: 1h, impact: GROS)

### Problème
Les élèves accèdent via QR code → navigateur mobile. La barre d'URL Chrome/Safari prend 60px et casse l'immersion. Le site ne ressemble pas à une app.

### Solution
Ajouter le manifest PWA + icônes pour permettre l'installation en "app".

### Détail technique
- **Créer** `public/manifest.json` :
  ```json
  {
    "name": "Banlieuwood",
    "short_name": "BW",
    "description": "L'atelier cinéma interactif",
    "start_url": "/join",
    "display": "standalone",
    "background_color": "#F7F3EA",
    "theme_color": "#FF6B35",
    "orientation": "portrait",
    "icons": [
      { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
      { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
    ]
  }
  ```
- **Modifier** `src/app/layout.tsx` : ajouter `<link rel="manifest" href="/manifest.json" />`
- **Ajouter** meta tags :
  ```html
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="theme-color" content="#FF6B35" />
  ```
- **Créer** icônes 192x192 et 512x512 dans `public/icons/`
- **Optionnel** : Prompt install après 2e visite via `beforeinstallprompt` event

### Critères de validation
- [ ] L'app s'installe sur Android Chrome (Add to Home Screen)
- [ ] L'app s'installe sur iOS Safari (Add to Home Screen)
- [ ] En mode standalone, pas de barre d'URL
- [ ] Le splash screen affiche le logo + couleur de fond
- [ ] Le thème color s'affiche dans la barre de status

---

## Ordre d'exécution recommandé

```
Priorité 1 — Impact maximal, effort minimal :
  10. PWA manifest              (1h)  → immersion mobile instantanée
   1. Sas cinématique           (2h)  → première impression mémorable
   5. Avatars étendus           (2h)  → identité + fun

Priorité 2 — Différenciateurs :
   6. Badge récap partageable   (3h)  → viralité + souvenir
   8. Leaderboard + streaks     (3h)  → compétition sociale
   4. Écran projecteur waouh    (4h)  → effet classe

Priorité 3 — Polish :
   2. Célébrations par niveau   (2h)  → surprise renouvelée
   9. Micro-détails UI          (2h)  → finition pro
   3. Mini-jeu d'attente        (4h)  → engagement continu
   7. Feedback IA mode libre    (3h)  → coaching personnalisé
```

**Total estimé : ~25h de développement**

---

## Fichiers impactés (~25 fichiers)

| Fichier | Chantiers |
|---------|-----------|
| `src/app/play/[id]/page.tsx` | 1, 2, 3, 8, 9 |
| `src/app/join/page.tsx` | 5 |
| `src/app/play/[id]/recap/page.tsx` | 6 |
| `src/app/(dashboard)/session/[id]/screen/page.tsx` | 4 |
| `src/app/layout.tsx` | 10 |
| `src/components/celebrations.tsx` | 2 |
| `src/components/play/states/sent-state.tsx` | 3 |
| `src/components/play/states/waiting-state.tsx` | 8 |
| `src/components/play/states/situation-state.tsx` | 9 |
| `src/components/play/xp-bar.tsx` | 8 |
| `src/components/play/power-ups-bar.tsx` | 8 |
| `src/components/countdown-timer.tsx` | 9 |
| `src/components/screen/flip-counter.tsx` | 4 (nouveau) |
| `src/components/screen/ticket-reveal.tsx` | 4 (nouveau) |
| `src/components/play/mini-leaderboard.tsx` | 8 (nouveau) |
| `src/components/play/session-badge.tsx` | 6 (nouveau) |
| `src/components/play/waiting-mini-game.tsx` | 3 (nouveau) |
| `src/lib/cinema-words.ts` | 3 (nouveau) |
| `src/lib/avatar-nicknames.ts` | 5 (nouveau) |
| `src/lib/free-mode-feedback.ts` | 7 (nouveau) |
| `src/hooks/use-sound.ts` | 4 |
| `src/app/api/sessions/[id]/situation/route.ts` | 8 |
| `src/app/api/sessions/[id]/respond/route.ts` | 7 |
| `public/manifest.json` | 10 (nouveau) |
| `public/icons/` | 10 (nouveau) |
