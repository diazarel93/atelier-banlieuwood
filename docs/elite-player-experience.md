# Plan Elite — Player Experience

> Objectif : Passer du niveau "pro" au niveau "Kahoot/Duolingo/Wordle" sur l'expérience joueur.

---

## 1. Barre XP + prochain niveau toujours visible (effort: 2h, impact: CRITIQUE)

### Problème
La barre XP fait 16px, cachée dans le header. L'élève ne sait jamais où il en est ni combien il lui manque pour monter de niveau. Duolingo affiche "48/100 XP → Niveau 3" en permanence.

### Solution
Remplacer la micro-barre par un composant `XpProgressBar` visible et informatif :
- Barre large (h-2.5, max-w-[200px]) avec gradient gold→orange
- Texte au-dessus : "Niveau 3 — Cadreur" en font-cinema
- Texte en-dessous : "32 XP → prochain niveau" en text-bw-muted
- Animation de remplissage fluide (motion, 600ms ease-out)
- Flash doré quand XP augmente (+pulse scale 1→1.05→1)

### Fichiers
- `src/components/play/xp-bar.tsx` — réécriture complète
- `src/lib/xp.ts` — vérifier que `getLevel()` retourne `nextThreshold` (déjà le cas)

### Critères
- [ ] Le niveau + nom sont toujours visibles
- [ ] "X XP → prochain niveau" affiché
- [ ] Animation fluide sur gain d'XP
- [ ] Compact sur mobile (pas de débordement)

---

## 2. Classement live entre chaque question (effort: 3h, impact: CRITIQUE)

### Problème
Le leaderboard n'apparaît qu'à la fin (DoneState). Kahoot montre le classement après CHAQUE question. Ça crée la compétition sociale qui manque.

### Solution
Afficher le `MiniLeaderboard` (déjà créé) dans plus d'endroits :
- **SentState** : après l'envoi, montrer le top 3 + le rang du joueur actuel
- **ResultState** : après le résultat, montrer qui a gagné des XP
- **WaitingState** : déjà intégré — enrichir avec le rang du joueur ("Tu es 5e")

### Ajout API
- `GET /api/sessions/[id]/situation` — ajouter `topStudents` au payload (top 5 par XP)
- Requête Supabase : `students.select("id, display_name, avatar").order("xp", { ascending: false }).limit(5)`

### Ajout composant
- `MiniLeaderboard` : ajouter prop `currentRank?: number` pour afficher "Tu es Xe"
- Si le joueur n'est pas dans le top 3, ajouter une ligne séparée "... Toi : 5e — 120 XP"

### Fichiers
- `src/components/play/mini-leaderboard.tsx` — ajouter currentRank + "Toi" line
- `src/components/play/states/sent-state.tsx` — intégrer MiniLeaderboard
- `src/components/play/states/result-state.tsx` — intégrer MiniLeaderboard
- `src/app/api/sessions/[id]/situation/route.ts` — ajouter topStudents au payload

### Critères
- [ ] Top 3 visible après chaque envoi et chaque résultat
- [ ] Le joueur voit toujours son rang même s'il n'est pas top 3
- [ ] Pas de spoil des réponses (juste pseudo + XP)
- [ ] Données à jour via le polling existant

---

## 3. Onboarding premier join — 3 écrans (effort: 2h, impact: CRITIQUE)

### Problème
L'élève arrive sur /play/[id] sans aucune explication. Il ne sait pas ce que veut dire XP, streak, retenu. Kahoot explique le format en 10s.

### Solution
3 slides rapides (auto-avance 3s ou tap) affichés AVANT le CinematicIntro, seulement au tout premier join (localStorage flag) :

1. **Slide "Réponds"** : icône crayon + "Réponds aux questions du facilitateur. Chaque réponse = +10 XP"
2. **Slide "Vote"** : icône pouce + "Vote pour la meilleure idée de la classe. +5 XP par vote"
3. **Slide "Gagne"** : icône trophée + "Si ton idée est retenue : +25 XP ! Enchaîne les bonnes réponses pour un streak 🔥"

### Design
- Fond sombre, icône centrale animée (scale 0→1 spring)
- Texte en 2 lignes max, font-cinema pour le titre
- Dots de progression en bas (3 dots)
- Bouton "C'est parti !" sur le dernier slide
- Skip link discret "Passer →" en haut à droite

### Fichiers
- `src/components/play/onboarding-slides.tsx` — nouveau composant
- `src/app/play/[id]/page.tsx` — insérer avant cinematic intro, check localStorage `bw-onboarded`

### Critères
- [ ] S'affiche une seule fois (localStorage flag)
- [ ] Skip possible à tout moment
- [ ] Pas plus de 10s au total
- [ ] Fonctionne sur mobile (pas de scroll)

---

## 4. Sons sur chaque action utilisateur (effort: 2h, impact: GROS)

### Problème
On a du son sur send/vote/reveal/jingle mais RIEN sur : frappe clavier, press bouton, perte de streak, gain d'XP. Wordle a un son par lettre. Duolingo a un son sur chaque interaction.

### Solution
Ajouter 4 nouveaux sons dans `use-sound.ts` :
- **`tap`** : micro-click 1200Hz sine, 30ms, gain 0.06 — pour les boutons
- **`type`** : 800Hz triangle, 20ms, gain 0.03 — pour la frappe (throttle 80ms)
- **`streakLost`** : descente 400→150Hz saw, 400ms, gain 0.15 — dramatique
- **`xpGain`** : montée 600→900Hz sine + shimmer, 200ms, gain 0.08

### Intégration
- `SituationState` textarea `onChange` : `playSound("type")` (throttle 80ms)
- `SituationState` bouton Envoyer `onClick` : `playSound("tap")` avant submit
- `VoteState` bouton vote `onClick` : `playSound("tap")`
- `XpBar` / `XPDelta` quand xp augmente : `playSound("xpGain")`
- Quand streak reset à 0 (dans play page) : `playSound("streakLost")`

### Fichiers
- `src/hooks/use-sound.ts` — ajouter 4 sons
- `src/components/play/states/situation-state.tsx` — type + tap sons
- `src/components/play/states/vote-state.tsx` — tap son
- `src/app/play/[id]/page.tsx` — streakLost + xpGain

### Critères
- [ ] Tous les sons respectent le mute global
- [ ] Le son "type" est throttlé (pas de mitraillette)
- [ ] Le son "streakLost" est mémorable (pas juste un bip)
- [ ] Aucun son ne joue si `prefers-reduced-motion` + mute

---

## 5. Streak lost animation dramatique (effort: 1h, impact: GROS)

### Problème
Le streak disparaît en silence quand il se casse. Duolingo fait un drame (animation triste, "Tu as perdu ton streak !"). Chez nous : rien.

### Solution
Quand `streak` passe de ≥2 à 0 :
1. Son `streakLost` (descente dramatique)
2. Toast spécial rouge/orange : "🔥💔 Streak perdu ! Recommence à enchaîner"
3. Micro-shake sur le container (150ms)
4. Le badge streak dans SentState montre brièvement "streak: 0" en rouge avant de disparaître

### Fichiers
- `src/app/play/[id]/page.tsx` — détecter la perte de streak (useEffect sur streak value)
- `src/components/play/states/sent-state.tsx` — animation de perte

### Critères
- [ ] Feedback visuel + sonore immédiat
- [ ] Ne se trigger pas au premier envoi (streak 0→0 = pas de perte)
- [ ] Respecte le mute
- [ ] Pas de shake si prefers-reduced-motion

---

## 6. Banner connexion visible (effort: 1h, impact: MOYEN)

### Problème
Quand l'élève perd sa connexion, la réponse est queue silencieusement. Aucun feedback visible. Il peut croire que ça marche alors que rien ne part.

### Solution
Banner fixe en haut de l'écran play :
- **Offline** : fond rouge/orange, "📡 Hors ligne — tes réponses seront envoyées au retour"
- **Reconnecting** : fond amber, "🔄 Reconnexion en cours..."
- **Back online** : fond vert, "✅ Reconnecté !" (disparaît après 2s)

### Fichiers
- `src/components/play/connection-banner.tsx` — nouveau composant
- `src/app/play/[id]/page.tsx` — intégrer avec `navigator.onLine` + `useRealtimeInvalidation` status

### Critères
- [ ] Apparaît immédiatement quand offline
- [ ] Disparaît 2s après reconnexion
- [ ] Ne bloque pas l'interaction (position fixed, z-40)
- [ ] Compact (h-8, texte xs)

---

## 7. prefers-reduced-motion (effort: 1h, impact: MOYEN)

### Problème
Aucun respect de `prefers-reduced-motion`. Les élèves avec des troubles vestibulaires ou épileptiques subissent toutes les animations.

### Solution
- Hook `useReducedMotion()` : lit `window.matchMedia("(prefers-reduced-motion: reduce)")`
- CSS global : `@media (prefers-reduced-motion: reduce)` → désactiver confetti, shake, spotlight, transitions >300ms
- Passer le flag aux composants CelebrationOverlay, CinematicIntro, FlipCounter

### Fichiers
- `src/hooks/use-reduced-motion.ts` — nouveau hook
- `src/app/globals.css` — media query globale
- `src/components/celebrations.tsx` — skip confetti/shake/spotlight si reduced
- `src/components/play/cinematic-intro.tsx` — skip directement au welcome si reduced

### Critères
- [ ] Aucune animation de mouvement si activé (fade OK, translate/rotate NON)
- [ ] Confetti désactivé
- [ ] Shake désactivé
- [ ] L'app reste fonctionnelle (pas de blocage)

---

## 8. Contraste WCAG rehaussé (effort: 1h, impact: MOYEN)

### Problème
- Or (#D4A843) sur noir (#0a0a0a) = ratio 2.3:1 (WCAG AA demande 4.5:1)
- Muted (#6b7280) sur noir = ratio 3.2:1 (fail AA)
- Teal (#4ECDC4) sur noir = ratio 8.2:1 (OK)

### Solution
Rehausser les couleurs dans le thème dark sans casser l'esthétique :
- `bw-gold` : #D4A843 → #E8C060 (ratio ~4.8:1 sur noir)
- `bw-muted` : vérifier qu'on utilise #9CA3AF (ratio ~4.6:1) au lieu de #6b7280
- Ajouter `bw-gold-text` variante pour le texte (plus claire que le border/bg)

### Fichiers
- `src/app/globals.css` ou `tailwind.config.ts` — ajuster les variables CSS
- Vérifier que les badges/labels gold restent lisibles

### Critères
- [ ] Tous les textes ≥ 4.5:1 ratio sur le fond
- [ ] L'esthétique cinéma préservée
- [ ] Les badges gold restent visuellement distincts

---

## Ordre d'exécution

```
1. XP bar + prochain niveau        (2h) — le plus visible
2. Sons sur chaque action          (2h) — le plus ressenti
3. Onboarding 3 slides             (2h) — le plus impactant pour les nouveaux
4. Classement live                 (3h) — compétition sociale
5. Streak lost animation           (1h) — drame + engagement
6. Banner connexion                (1h) — confiance
7. prefers-reduced-motion          (1h) — accessibilité
8. Contraste WCAG                  (1h) — accessibilité
```

**Total : ~13h de développement**
