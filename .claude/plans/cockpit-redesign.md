# PLAN — Cockpit Intervenant Redesign

## Brief validé (Phase 1)

**Score actuel** : 4.5/10
**Cible** : 8/10
**Emotion** : Maitrise calme — l'intervenant se sent en controle, pas submerge
**Anti-brief** : Pas gaming, pas scolaire, pas surcharge, pas froid

## Chantiers par priorité

### P1 — Accessibilité (obligatoire avant toute chose)

| # | Chantier | Fichiers | Effort | Critère de succès |
|---|----------|----------|--------|-------------------|
| P1.1 | Touch targets >= 44px | v6-sidebar.tsx, focus-question-card.tsx, cockpit-footer-bar.tsx, response-card.tsx, v6-vote-controls.tsx, v6-activity-feed.tsx, cockpit-header.tsx, v6-control-panels.tsx | M | 0 élément cliquable sous 44x44px |
| P1.2 | Contraste >= 4.5:1 | v6-sidebar.tsx, v6-activity-feed.tsx, focus-cockpit.tsx, focus-header.tsx, v6-control-panels.tsx | S | `#64748b` → `#94a3b8` partout (5.5:1 sur fond dark) |
| P1.3 | Focus states | globals.css (1 règle globale) | S | Anneau violet visible sur chaque bouton en focus |

### P2 — Cohérence système (fondation)

| # | Chantier | Fichiers | Effort | Critère de succès |
|---|----------|----------|--------|-------------------|
| P2.1 | Tokens dark cockpit | globals.css | S | 3 tokens surface + bordures rgba. 0 hex dark hardcodé |
| P2.2 | Tokens couleurs sémantiques | globals.css + state-styles.ts | M | Chaque couleur brand a .main/.text/.border/.bg |
| P2.3 | Échelle typo | globals.css | S | 5 tailles max (xs/sm/md/lg/display) |
| P2.4 | Search-replace couleurs | 20 fichiers pilot/ | L | 120+ hex → tokens CSS |
| P2.5 | Search-replace spacings | 25 fichiers pilot/ | M | 80+ .5 spacings → multiples de 8 |
| P2.6 | Search-replace typo | 30 fichiers pilot/ | L | 180+ tailles arbitraires → scale système |

### P3 — Polish (après P1+P2)

| # | Chantier | Fichiers | Effort | Critère de succès |
|---|----------|----------|--------|-------------------|
| P3.1 | Stagger animations ResponseStream | response-stream.tsx | S | Entrées staggerées 80ms |
| P3.2 | Pulse on completion StatRing | stat-ring.tsx, focus-cockpit.tsx | S | Pulse visible quand 100% atteint |
| P3.3 | Skeleton loading cockpit | focus-cockpit.tsx | M | Skeleton au lieu d'écran vide au load |
| P3.4 | Différencier sections visuellement | v6-vote-controls.tsx | S | Vote controls ont plus de poids que activity feed |
| P3.5 | Élève déconnecté plus visible | v6-sidebar.tsx | S | Texte rouge "HORS LIGNE" + badge compteur |
| P3.6 | Confirmation "Terminer session" | v6-control-panels.tsx | S | Modal de confirmation avant fin |
| P3.7 | Drag-to-dismiss BottomSheet | bottom-sheet.tsx | M | Swipe down pour fermer |

## Ordre d'exécution optimal

```
Batch 1 (fondation) — faire en premier, tout en parallèle :
├── P2.1 — Tokens dark (globals.css)
├── P2.2 — Tokens sémantiques (globals.css + state-styles.ts)
├── P2.3 — Échelle typo (globals.css)
└── P1.3 — Focus states (globals.css)
    → 1 seul fichier touché (globals.css) + state-styles.ts
    → Effort total : M

Batch 2 (search-replace) — dépend du Batch 1 :
├── P2.4 — Replace couleurs (20 fichiers)
├── P2.5 — Replace spacings (25 fichiers)
├── P2.6 — Replace typo (30 fichiers)
└── P1.1 — Touch targets (8 fichiers)
    → Les fichiers se chevauchent — faire par fichier, pas par chantier
    → Fichier par fichier : sidebar → cockpit → header → cards → footer
    → Effort total : L

Batch 3 (contraste) — peut être fait en parallèle du Batch 2 :
└── P1.2 — Replace #64748b → #94a3b8 (5 fichiers)
    → Effort : S

Batch 4 (polish) — après Batch 1+2+3 :
├── P3.1 → P3.2 → P3.4 → P3.5 → P3.6 (tous S, faire séquentiellement)
└── P3.3 → P3.7 (M, peuvent être parallèles)
    → Effort total : M
```

## Estimation totale

| Batch | Effort | Résultat |
|-------|--------|----------|
| Batch 1 | ~1h | Fondation tokens prête |
| Batch 2 | ~3-4h | 400+ remplacements, cockpit cohérent |
| Batch 3 | ~20min | Contraste fixé |
| Batch 4 | ~2h | Animations + états + polish |

**Total : ~7h de travail → score cockpit de 4.5/10 à 8/10**

## Critères de succès global (Phase 5 checklist)

- [ ] 0 couleur hex hardcodée dans pilot/
- [ ] 0 spacing .5 dans pilot/
- [ ] 0 taille typo arbitraire dans pilot/
- [ ] 0 touch target < 44px
- [ ] 0 texte sous 4.5:1 de contraste
- [ ] Focus visible sur chaque bouton
- [ ] Loading skeleton au démarrage
- [ ] Error banner si connexion perdue
- [ ] Stagger sur les listes temps réel
- [ ] Pulse sur StatRing à 100%
- [ ] `npm run build` passe
- [ ] `npm test` passe
