# Corrections Jeune Public — Primaire / Collège / Lycée

> Objectif : Un élève de CM2 (10 ans) qui n'a jamais touché une caméra doit comprendre TOUT immédiatement.

---

## 1. Vocabulaire — Remplacement global (effort: 1h, impact: CRITIQUE)

### 1A. "XP" → "Points"
Remplacer dans le texte visible au joueur (pas dans le code/variables) :
- `src/components/play/xp-bar.tsx` : "X XP → prochain niveau" → "X points → prochain niveau"
- `src/components/play/states/sent-state.tsx` : "+{lastXpGain} XP" → "+{lastXpGain} pts"
- `src/components/play/mini-leaderboard.tsx` : "{entry.xp} XP" → "{entry.xp} pts"
- `src/components/play/states/done-state.tsx` : toutes les occurrences visibles
- `src/components/play/onboarding-slides.tsx` : "+10 XP" → "+10 points"
- `src/components/celebrations.tsx` : XPDelta "+{amount} XP" → "+{amount} pts"
- `src/components/play/session-badge.tsx` : "XP gagné" → "Points gagnés"

### 1B. "Streak" → "Série"
- `src/components/play/states/sent-state.tsx` : "x{streak} streak" → "x{streak} série"
- `src/components/play/states/done-state.tsx` : "Meilleur streak" → "Meilleure série"
- `src/components/play/onboarding-slides.tsx` : "streak" → "série"
- `src/components/play/session-badge.tsx` : "Meilleur streak" → "Meilleure série"

### 1C. "Facilitateur" → "prof"
- `src/components/play/states/waiting-state.tsx` : "Le facilitateur va bientôt..." → "Le prof va bientôt..."
- `src/components/play/onboarding-slides.tsx` : "Le facilitateur pose une question" → "Le prof pose une question"

### 1D. "Idées retenues" → "Idées choisies"
- `src/components/play/states/done-state.tsx`
- `src/components/play/session-badge.tsx`

### 1E. "CHOIX COLLECTIF" → "LE CHOIX DU GROUPE"
- `src/components/play/states/result-state.tsx`

### 1F. "Bibliothèque" → "Mes créations"
- `src/components/play/states/done-state.tsx` : "Ma bibliothèque complète" → "Toutes mes créations"

### 1G. Niveaux plus parlants
- `src/lib/xp.ts` : "Cadreur" → "Cameraman", "Scénariste" → "Auteur"

### 1H. "Aléatoire" → "Au hasard"
- `src/app/join/page.tsx` : bouton pseudo aléatoire

---

## 2. Taille tactile tablette (effort: 1h, impact: CRITIQUE)

### 2A. Bouton Envoyer — minimum 44px hauteur
- `src/components/play/states/situation-state.tsx` : `py-2.5` → `py-3` + `min-h-[44px]`

### 2B. Vote letter badges — 36px minimum
- `src/components/play/states/vote-state.tsx` : `w-7 h-7` → `w-9 h-9`

### 2C. Texte minimum 12px partout
- Remplacer tous les `text-[10px]` par `text-xs` (12px) minimum dans les composants joueur
- Fichiers : xp-bar.tsx, done-state.tsx, session-badge.tsx, cinematic-intro.tsx

### 2D. Textarea scroll-into-view au focus
- `src/components/play/states/situation-state.tsx` : ajouter `scrollIntoView` dans onChange quand le clavier est ouvert

### 2E. Protection double-tap sur submit
- `src/components/play/states/situation-state.tsx` : debounce 400ms sur handleSubmit

---

## 3. Onboarding simplifié (effort: 30min, impact: GROS)

### Texte actuel → Texte simplifié

Slide 1 :
- "Le facilitateur pose une question. Écris ta meilleure idée !"
- → "Le prof pose une question. Écris ta meilleure idée !"
- "+10 XP par réponse" → "+10 points par réponse"

Slide 2 :
- "+5 XP par vote" → "+5 points par vote"

Slide 3 :
- "Si ton idée est retenue : +25 XP ! Enchaîne pour un streak 🔥"
- → "Si le groupe choisit ton idée : +25 points ! Fais une série pour gagner plus 🔥"
- "Monte de niveau !" → "Passe au niveau suivant !"

---

## 4. Textes résultats et fin de session (effort: 30min, impact: GROS)

### ResultState
- "CHOIX COLLECTIF" → "LE CHOIX DU GROUPE"
- "Encore ton idée choisie par le groupe !" (déjà OK)

### DoneState
- "Idées retenues" → "Idées choisies"
- "Meilleur streak" → "Meilleure série"
- "Ma bibliothèque complète" → "Toutes mes créations"
- "XP" → "Points" partout

---

## Ordre d'exécution

```
1. Vocabulaire global         (1h) — le plus impactant, tout le monde comprend
2. Taille tactile tablette    (1h) — utilisabilité physique
3. Onboarding simplifié       (30min) — première impression
4. Textes résultats/fin       (30min) — récompense compréhensible
```

**Total : ~3h**

---

## Fichiers impactés (~12 fichiers)

| Fichier | Changements |
|---------|------------|
| `src/components/play/xp-bar.tsx` | "XP" → "pts", text-[10px] → text-xs |
| `src/components/play/states/sent-state.tsx` | "XP" → "pts", "streak" → "série" |
| `src/components/play/states/result-state.tsx` | "CHOIX COLLECTIF" → "LE CHOIX DU GROUPE" |
| `src/components/play/states/done-state.tsx` | "XP/streak/retenues/bibliothèque" |
| `src/components/play/states/situation-state.tsx` | min-h-[44px], scrollIntoView, debounce |
| `src/components/play/states/vote-state.tsx` | w-7 h-7 → w-9 h-9 |
| `src/components/play/mini-leaderboard.tsx` | "XP" → "pts" |
| `src/components/play/onboarding-slides.tsx` | facilitateur→prof, XP→points, streak→série |
| `src/components/play/session-badge.tsx` | "XP/streak/retenues" |
| `src/components/celebrations.tsx` | XPDelta "XP" → "pts" |
| `src/lib/xp.ts` | Cadreur→Cameraman, Scénariste→Auteur |
| `src/app/join/page.tsx` | "aléatoire" → "au hasard" |
