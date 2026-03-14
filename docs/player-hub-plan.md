# Plan Player Hub — "La Maison du Joueur"

> Objectif : Donner au joueur une raison de revenir. Aujourd'hui après /done = rien. Demain : un profil, des badges, un historique, un streak cross-session.

---

## Contexte : Ce qui existe DEJA dans le code

### Infrastructure DB prête (migration 043)
- `student_profiles` : total_xp, current_streak, best_streak, sessions_played, total_responses, retained_count, level, avatar_accessories, avatar_frame, custom_title, particle_effect, streak_updated_date
- `student_achievements` : profile_id, achievement_id, tier (bronze/silver/gold), progress, unlocked_at, seen
- `achievement_definitions` : 30 badges x 3 tiers = 90 unlockables (seeded en SQL)
- `students.profile_id` FK vers student_profiles

### API prête
- `GET /api/sessions/[id]/student-context?studentId=X` — lit le profil persistant
- `PATCH /api/sessions/[id]/student-context` — écrit les stats en fin de session
- `GET /api/v2/student-profiles/[profileId]` — profil complet (stats, scores, portfolio, achievements, notes)

### Code UI prêt mais pas branché
- `achievements-v2.ts` : 30 définitions complètes (catégories, seuils, icônes, récompenses)
- `power-ups-bar.tsx` : 4 power-ups UI-ready (double_temps, indice, coup_de_pouce, bouclier)

### Ce qui MANQUE
- ❌ Aucune page `/profile` accessible au joueur
- ❌ Achievements jamais affichés dans le jeu
- ❌ Power-ups : UI sans logique
- ❌ Streak cross-session pas exploité visuellement
- ❌ Après /done → le joueur part, pas de hub
- ❌ Pas de login étudiant léger (pseudo+code pour reconnecter)

---

## Feature 1 — Page Profil Joueur `/profile` (effort: 4h, impact: CRITIQUE)

### Problème
Après une session, le joueur n'a nulle part où aller. Pas de "maison". Duolingo a un profil central. Kahoot a un historique. Nous : rien.

### Solution
Page `/profile` accessible via localStorage `bw-profile-id` (set quand le profil est créé en fin de session).

### Sections de la page

#### 1A. Hero Section
- Avatar (emoji actuel) + cadre débloqué (avatar_frame) + titre custom (custom_title)
- Pseudo
- Niveau + nom (ex: "Nv.5 — Réalisateur")
- XP Bar large avec "1300 / 1900 XP → Producteur"
- Streak cross-session : "🔥 3 sessions d'affilée"

#### 1B. Stats Grid (4 cards)
- Sessions jouées (sessions_played)
- Réponses totales (total_responses)
- Idées retenues (retained_count)
- Meilleur streak (best_streak)

#### 1C. Badges Gallery (achievements)
- Grid 3 colonnes
- Chaque badge : icône + nom + tier (bronze/argent/or) + barre de progression vers le prochain tier
- Badges non débloqués en grisé avec "? / X pour débloquer"
- 6 catégories filtrables : narration, vote, expression, streak, social, spécial

#### 1D. Historique des sessions
- Liste chronologique des sessions jouées
- Par session : titre, date, XP gagné, réponses, retenues, meilleur streak
- Clic → lien vers `/play/[id]/bibliotheque` (si dispo)

#### 1E. Prochaine session (optionnel)
- Si le prof a une session `scheduled_at` dans le futur pour cette classe → "Prochaine session dans 2j"

### Fichiers
- `src/app/(public)/profile/page.tsx` — page profil joueur
- `src/app/api/player-profile/route.ts` — GET profil joueur (reuse student-profiles logic)

### Accès
- localStorage `bw-profile-id` stocké quand PATCH student-context crée/link un profil
- Si pas de profil → page "Joue ta première session pour créer ton profil" avec lien /join

### Critères
- [ ] Page accessible sans login Supabase (anonymous, basée sur localStorage profileId)
- [ ] Hero section avec avatar, niveau, XP bar, streak
- [ ] Grid stats 4 cards
- [ ] Badges gallery avec progression (30 badges, 3 tiers)
- [ ] Historique sessions scrollable
- [ ] Responsive mobile-first
- [ ] Lien depuis DoneState ("Voir mon profil →")

---

## Feature 2 — Achievements visibles en jeu (effort: 2h, impact: CRITIQUE)

### Problème
30 badges existent dans le code. 90 tiers. Le joueur n'en voit jamais un seul.

### Solution

#### 2A. Toast achievement unlock pendant le jeu
Quand un achievement est débloqué (progress >= threshold) :
- Toast doré : "🏆 Badge débloqué : Narrateur Bronze !"
- Son `levelUp`
- Apparaît pendant 4s, empilable

#### 2B. Achievement check en fin de session
Au moment du PATCH student-context, vérifier les seuils de tous les achievements :
- Comparer `total_responses`, `retained_count`, `sessions_played`, `best_streak`, etc. aux seuils
- Insérer/update `student_achievements` pour ceux qui sont atteints

#### 2C. "Nouveau badge !" dans DoneState
Si des achievements ont été débloqués pendant cette session :
- Section "Badges débloqués" avec les nouveaux badges animés
- Lien "Voir tous mes badges →" vers /profile

### Fichiers
- `src/lib/achievement-checker.ts` — vérifier les seuils, retourner les nouveaux unlocks
- `src/app/api/sessions/[id]/student-context/route.ts` — appeler le checker dans PATCH
- `src/components/play/states/done-state.tsx` — section badges débloqués
- `src/app/play/[id]/page.tsx` — toast si achievement unlock

### Critères
- [ ] Check automatique sur PATCH student-context
- [ ] Toast en jeu quand badge débloqué
- [ ] Section dans DoneState pour les nouveaux badges
- [ ] Progress incrémenté correctement (pas de doublon)

---

## Feature 3 — Streak cross-session visible (effort: 2h, impact: GROS)

### Problème
`student_profiles` a `current_streak` et `streak_updated_date`. Mais le joueur ne voit jamais son streak global. Duolingo construit toute sa rétention sur ça.

### Solution

#### 3A. Streak logic dans student-context PATCH
- Si `streak_updated_date` == aujourd'hui → déjà compté
- Si `streak_updated_date` == hier → `current_streak += 1`
- Si `streak_updated_date` < hier → `current_streak = 1` (reset)
- Update `streak_updated_date = today`
- Update `best_streak = max(best_streak, current_streak)`

#### 3B. Streak visible au join (avant la session)
Quand le joueur arrive sur `/play/[id]`, pendant le WaitingState :
- "🔥 Streak : 3 sessions d'affilée !" (si streak > 0)
- "⚠️ Joue aujourd'hui pour garder ton streak !" (si last_date = hier)

#### 3C. Streak dans le profil
- Calendrier simplifié des 7 derniers jours (dots verts/gris)
- "Record : 12 sessions d'affilée"

### Fichiers
- `src/app/api/sessions/[id]/student-context/route.ts` — streak cross-session logic
- `src/components/play/states/waiting-state.tsx` — affichage streak global
- `src/app/(public)/profile/page.tsx` — streak section

### Critères
- [ ] Streak incrémenté si session jouée jour consécutif
- [ ] Streak reset si plus de 1 jour d'écart
- [ ] Visible dans WaitingState
- [ ] Visible dans le profil

---

## Feature 4 — Historique sessions joueur (effort: 2h, impact: GROS)

### Problème
Le joueur n'a aucun accès à ses anciennes sessions. Pas d'historique, pas de nostalgie, pas de progression visible dans le temps.

### Solution
L'API `/api/v2/student-profiles/[profileId]` retourne DEJA `sessionHistory`. Il suffit de l'exposer côté joueur.

#### 4A. API joueur pour l'historique
- `GET /api/player-profile?profileId=X` — retourne profil + sessionHistory + achievements
- Pas d'auth Supabase, juste profileId en query param

#### 4B. Liste dans /profile
- Cards par session : titre, date, XP, réponses, retenues
- Badge "record" sur la session avec le plus d'XP
- Lien vers la bibliothèque si encore accessible

### Fichiers
- `src/app/api/player-profile/route.ts` — endpoint joueur
- `src/app/(public)/profile/page.tsx` — section historique

### Critères
- [ ] Liste chronologique (plus récent en premier)
- [ ] Stats par session
- [ ] Lien vers bibliothèque

---

## Feature 5 — Redirect DoneState → Profil (effort: 30min, impact: GROS)

### Problème
Après DoneState, le joueur est perdu. Nulle part où aller.

### Solution
- Bouton proéminent dans DoneState : "🏠 Mon profil" → `/profile`
- Stocker `bw-profile-id` dans localStorage dès que PATCH retourne le profileId
- Si pas de profil encore → le créer au PATCH (déjà le cas)

### Fichiers
- `src/components/play/states/done-state.tsx` — bouton profil
- `src/app/play/[id]/page.tsx` — stocker profileId après PATCH

### Critères
- [ ] Bouton visible dans DoneState
- [ ] localStorage `bw-profile-id` toujours set après session
- [ ] Lien fonctionnel vers /profile

---

## Feature 6 — Reconnexion profil cross-session (effort: 2h, impact: GROS)

### Problème
Chaque session crée un nouveau `students` row. Le `profile_id` est linkédans PATCH mais seulement si même device/browser. Si l'élève change de tablette → nouveau profil.

### Solution

#### 6A. Code profil 4 chars
- Quand un profil est créé, générer un `profile_code` unique (4 chars alphanumériques, ex: "BW42")
- Stocker dans `student_profiles.profile_code`
- L'afficher dans le profil : "Ton code joueur : BW42"

#### 6B. Champ optionnel au join
- Sur `/join`, ajouter un champ optionnel : "Tu as déjà un code joueur ?"
- Si rempli → lier le nouveau student au profil existant via profile_code
- Si pas rempli → nouveau profil créé en fin de session (comportement actuel)

### Fichiers
- `supabase/migrations/XXX_profile_code.sql` — ajouter colonne profile_code + unique index
- `src/app/api/sessions/join/route.ts` — accepter profileCode optionnel, lier au profil
- `src/app/join/page.tsx` — champ optionnel profile code
- `src/app/api/sessions/[id]/student-context/route.ts` — générer profile_code si absent

### Critères
- [ ] Code 4 chars unique généré à la création du profil
- [ ] Affiché dans /profile
- [ ] Accepté optionnellement au /join
- [ ] Permet de retrouver son XP/badges sur un autre device

---

## Feature 7 — Notifications session prochaine (effort: 1h, impact: MOYEN)

### Problème
Le joueur n'a aucune raison de revenir. Pas de notification, pas de "prochaine session".

### Solution
- Dans le profil, si une session `scheduled_at` existe dans le futur pour la même `class_label` → l'afficher
- "📅 Prochaine session : Mercredi 19 mars à 14h"
- Bouton "Ajouter au calendrier" (lien .ics)

### Fichiers
- `src/app/api/player-profile/route.ts` — query next session by class_label
- `src/app/(public)/profile/page.tsx` — section prochaine session

### Critères
- [ ] Affiche la prochaine session si trouvée
- [ ] Lien calendrier .ics

---

## Feature 8 — Classement global classe (effort: 2h, impact: MOYEN)

### Problème
Le leaderboard est uniquement intra-session. Pas de classement all-time.

### Solution
- Section dans /profile : "Classement de ta classe"
- Top 10 par XP total, filtré par class_label
- Le joueur voit son rang global

### Fichiers
- `src/app/api/player-profile/route.ts` — query class leaderboard
- `src/app/(public)/profile/page.tsx` — section classement

### Critères
- [ ] Top 10 par XP total
- [ ] Le joueur voit son rang
- [ ] Filtré par class_label

---

## Ordre d'exécution

```
1. Page Profil /profile         (4h) — la "maison" du joueur
2. Achievements visibles        (2h) — activer les 30 badges
3. Redirect DoneState → profil  (30min) — fermer la boucle
4. Streak cross-session         (2h) — rétention à la Duolingo
5. Historique sessions          (2h) — progression dans le temps
6. Reconnexion profil           (2h) — cross-device
7. Classement global            (2h) — compétition long-terme
8. Notifications prochaine      (1h) — raison de revenir
```

**Total : ~15h30 de développement**

---

## Fichiers impactés (~15 fichiers)

| Fichier | Action | Feature |
|---------|--------|---------|
| `src/app/(public)/profile/page.tsx` | Créer | 1,3,4,7,8 |
| `src/app/api/player-profile/route.ts` | Créer | 1,4,7,8 |
| `src/lib/achievement-checker.ts` | Créer | 2 |
| `src/app/api/sessions/[id]/student-context/route.ts` | Modifier | 2,3,6 |
| `src/components/play/states/done-state.tsx` | Modifier | 2,5 |
| `src/app/play/[id]/page.tsx` | Modifier | 2,5 |
| `src/components/play/states/waiting-state.tsx` | Modifier | 3 |
| `src/app/join/page.tsx` | Modifier | 6 |
| `src/app/api/sessions/join/route.ts` | Modifier | 6 |
| `supabase/migrations/XXX_profile_code.sql` | Créer | 6 |
