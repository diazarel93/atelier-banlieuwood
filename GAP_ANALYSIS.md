# Gap Analysis — Spec vs Implémentation actuelle

_Mis à jour : 1er mars 2026_

## FAIT (OK)

- [x] Auth facilitateur (login / signup / forgot password / reset)
- [x] Middleware protection routes (/dashboard, /session)
- [x] Dashboard sessions (liste, filtres, template badge)
- [x] Création session (titre, niveau, template genre)
- [x] Join élève (code 6 chars + prénom + emoji)
- [x] QR Code (join pre-fill, pilot panel, screen waiting)
- [x] Module 3 — 21 situations × 3 niveaux d'âge (seed SQL)
- [x] Module 3 — Flow complet (responding → voting → reviewing → next)
- [x] Module 3 — Typewriter effect (student)
- [x] Module 3 — Son procédural (Web Audio API, 4 sons)
- [x] Module 2 — Budget game (100 crédits, sliders)
- [x] Pilot cockpit (réponses live, compteur, contrôles, modération)
- [x] Screen projection (QR, question géante, vote live, budget bars)
- [x] Modération réponses (is_hidden, toggle facilitateur)
- [x] Export Markdown (résumé structuré par catégorie)
- [x] Results page (choix collectifs + budget averages)
- [x] Polling 3s (élèves + facilitateur)
- [x] localStorage reconnexion élève
- [x] Online/offline detection

## WRONG (à corriger)

### 1. Module 2 : mauvaises catégories
- **Actuel** : personnage, liens, environnement, conflit, trajectoire, intention (= catégories narratives)
- **Spec** : Acteurs (Figurants 5 / Amateurs 15 / Stars 40), Décors (Gratuit 0 / Simple 10 / Exceptionnel 30), Effets (Aucun 0 / Basiques 15 / Impressionnants 40), Musique (Silence 0 / Libre 5 / Compositeur 25), Durée (Court 3min 0 / Moyen 10min 10 / Long 25min 25) + réserve obligatoire 10 crédits min

### 2. Vote UX
- **Actuel** : sélection radio + bouton "Voter"
- **Spec UI/UX** : tap = vote direct (style Instagram poll), pas de bouton confirm. Carte pulse orange + haptic. Peut changer d'avis en tappant une autre.

### 3. Typewriter speed
- **Actuel** : 35ms par LETTRE
- **Spec** : 30ms par MOT (student), 50ms par MOT (projection) — c'est par MOT

### 4. Emoji dans l'UI
- **Actuel** : emoji partout (🎬⏸️🎯👤🔗🌍⚡🛤️💡)
- **Spec** : zéro emoji dans l'interface, sauf avatars élèves. UI sobre, cinématique.

### 5. Résultat reveal animation
- **Actuel** : affichage direct
- **Spec** : noir 0.5s (suspense) → fade-in "La classe a choisi" → slide-in carte (spring bounce) → barres animées 0→valeur (1.5s, ease-out)

## MISSING (à implémenter)

### Priorité HAUTE

- [ ] **Module 1 — Diagnostic + Confiance** : 3 images × 4 questions, moment collectif (facilitateur sélectionne réponses), analyse AI entre sessions
- [ ] **Module 2 — Refonte catégories** : 5 catégories film (Acteurs/Décors/Effets/Musique/Durée) avec 3 options chacune + réserve 10 crédits + résumé auto-généré
- [ ] **Reformulation facilitateur** : pouvoir éditer le texte du choix collectif validé (merge, reformuler)
- [ ] **Retour arrière** : facilitateur peut revenir à la situation précédente
- [ ] **Skip situation** : facilitateur peut passer une situation
- [ ] **Sélection manuelle pour vote** : facilitateur choisit 3-4 réponses parmi toutes pour le vote (pas tout envoyer au vote)

### Priorité MOYENNE

- [ ] **Page /play/[id]/recap** : récap des choix collectifs accessible par l'élève (web page avec code)
- [ ] **Analyse AI (Claude API)** : entre sessions, analyse tendances + forces + recommandations (Module 1 + Module 3)
- [ ] **PDF export** : en plus du Markdown actuel
- [ ] **Page /legal** : RGPD, mentions légales, hébergement EU
- [ ] **Résumé auto budget** : texte généré "Ton film a des acteurs amateurs, un décor exceptionnel..."

### Priorité BASSE

- [ ] **Supabase Realtime** : remplacer polling par Realtime pour facilitateur + screen (hybrid strategy spec)
- [ ] **Nudge < 10 mots** : slide-up suggestion si réponse courte (non bloquant, turquoise border)
- [ ] **Haptic feedback** : navigator.vibrate() sur join success, vote, send
- [ ] **Confetti join** : 5-6 particules micro-confetti à la connexion
- [ ] **Cron 6 mois** : suppression auto sessions inactives > 6 mois
- [ ] **Recap nouveau élève** : 30s résumé S1 quand élève rejoint en S2
- [ ] **Résultat reveal animation** : séquence noir→fade→slide→barres

## REJOUABILITÉ

Les 21 situations sont fixes par niveau d'âge. La spec assume que la variété vient des réponses des élèves (toujours différentes) et du facilitateur (guide différemment). Pistes d'amélioration :
- Variantes de prompts par genre/template (horreur ≠ comédie)
- Contextualisation : intégrer les choix précédents dans les prompts suivants
- Randomisation de l'ordre dans un même bloc catégoriel

## ORDRE D'IMPLÉMENTATION RECOMMANDÉ

1. **Corriger Module 2** (catégories film, 3 options par catégorie, réserve, résumé)
2. **Corriger Vote UX** (tap = vote, pas de bouton confirm)
3. **Corriger typewriter** (par mot, pas par lettre)
4. **Remplacer emoji par SVG/icônes**
5. **Ajouter sélection manuelle vote** (facilitateur choisit quelles réponses)
6. **Ajouter reformulation** (facilitateur édite texte validé)
7. **Ajouter retour arrière + skip**
8. **Implémenter Module 1**
9. **Page recap élève**
10. **AI Analysis (Claude)**
11. **PDF export**
12. **Page /legal**
13. **Polish (haptic, confetti, reveal animation, nudge)**
