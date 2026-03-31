# Verdict Creative Director — Direction C
**Date : 2026-03-30**
**Décision : Direction C — Cabine de Projection ✅**

---

## Synthèse du choix

Après Phase 0 (veille EdTech 2026) + analyse des 3 directions contre le contexte physique réel (intervenant debout, iPad posé, salle avec projecteur), Direction C est retenue.

---

## Pourquoi pas A — Fil de Séance

Direction A (timeline horizontale + stream séparé) échouait au test critique : l'enseignant debout à 60cm de son iPad ne peut pas "lire une timeline" entre deux questions. La navigation par étapes impose une charge cognitive incompatible avec l'enseignement en live.

**Anti-pattern Phase 0 :** "Navigation qui requiert de chercher une action pendant que les élèves attendent."

---

## Pourquoi pas B — Scène Immersive

Direction B (3 colonnes dark, immersion maximale) est le bon choix pour un utilisateur assis devant un écran. Mais le contexte Banlieuwood invalide cette direction :

1. iPad posé sur pupitre = angle non optimal pour 3 colonnes denses
2. Fond très sombre + projecteur allumé dans la salle = interface lavée sur grand écran
3. Aucun concurrent EdTech ne fait ce choix — aucune validation terrain

---

## Pourquoi C — Cabine de Projection

**1. Focus exclusif = zéro charge cognitive**
Une question. Un CTA. Pas de navigation pendant la session.

**2. Drawers = révélation volontaire**
L'enseignant voit les données classe/réponses QUAND il le décide. Pas de surcharge permanente.

**3. Validation Phase 0**
- Card-based progressive disclosure ✅ (pattern #1 EdTech 2026)
- Badges statut (pas tableaux) ✅ (pattern #3 — <200ms lecture)
- Fond crème + textes foncés ✅ (lisible projecteur allumé)

**4. Opportunité de différenciation**
Aucun concurrent (Kahoot, Wooclap, Nearpod, Mentimeter) n'est conçu pour un enseignant debout. Direction C adresse directement ce vide.

---

## Audit post-implémentation (2026-03-30)

### ✅ Conforme

| Critère | Résultat |
|---------|----------|
| Architecture Direction C | Focus central + 2 drawers latéraux |
| Responsive ordi/iPad | lg+ = colonnes fixes, <lg = overlays |
| Touch targets | min-h-11 (44px) partout |
| Brand tokens | #FF6B35, #4ECDC4, #F7F3EA |
| Doctrine Banlieuwood | Aucun score, aucun classement |
| Animations | motion/react — LIVE pulse, drawers spring |
| Header compact | h-12 (48px) |
| CockpitContext | Source unique — pas de prop drilling |

### ⚠️ Corrigé en audit

| Problème | Correction |
|----------|-----------|
| FocusQuestionCard dark (#161633) incompatible fond crème | Créé `ProjectionQuestionCard` (fond blanc, 24px) |
| Texte question 18-22px < 24px minimum Phase 0 | Corrigé dans `ProjectionQuestionCard` |

### 🔴 Dette technique à traiter

| Problème | Priorité | Fichier |
|----------|----------|---------|
| Logique CTA dupliquée Center/Footer | Moyen | projection-center.tsx + projection-footer.tsx |
| Swipe gesture iPad | Bas | lateral-drawer.tsx |

### ✅ Faux positifs (audit corrigé)

| Item | Réalité |
|------|---------|
| Route `/screen` inexistante | Existe déjà (2090 lignes) — `DarkLayout` dark mode pour projecteur |
| Bouton Projection silencieux | `onOpenScreen` câblé dans pilot/page.tsx L431 — `window.open(ROUTES.screen(id), "_blank")` |

---

## Score par critère (1-10)

| Critère | Score |
|---------|-------|
| Contexte physique (debout/iPad) | 8/10 |
| Doctrine Banlieuwood | 10/10 |
| Cohérence visuelle | 8/10 (corrigé en audit) |
| Touch targets | 9/10 |
| Phase 0 compliance | 9/10 (après correction 24px) |
| Architecture technique | 9/10 |

**Score global : 8.8/10**

---

## Prochaine phase

1. **Route `/screen`** — affichage grand écran dédié (tableau connecté / projecteur)
2. **Tests terrain** — valider sur vrai iPad posé sur pupitre
3. **Phase 2 brief créatif** — si le cockpit est stabilisé, documenter le brief final
