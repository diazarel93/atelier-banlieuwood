# Direction C — Cabine de Projection
**Statut : CHOISIE ✅**
**Date choix : 2026-03-30**

---

## Concept

**Métaphore :** La cabine de projection d'un cinéma. L'intervenant a le contrôle total de ce qu'on projette, sans jamais chercher une action.

**Structure :**
- Zone centrale exclusive : 1 question à la fois, lisible depuis n'importe quel point de la salle
- Drawer gauche : Classe (badges élèves, progression)
- Drawer droit : Réponses (stream en temps réel)
- Sur desktop : drawers = colonnes fixes toujours visibles
- Sur iPad/mobile : drawers = overlays latéraux déclenchés par boutons footer

---

## Architecture technique

```
ProjectionCockpit (orchestrateur — état drawers + timer)
├── ProjectionHeader (48px — LIVE pill, module, timer, bouton Projection)
├── LateralDrawer[left] → ProjectionClasseDrawer
├── ProjectionCenter (question card 24px + progress bar + CTA)
├── LateralDrawer[right] → ProjectionResponsesDrawer
└── ProjectionFooter (lg:hidden — [← Classe] [CTA] [Réponses →])
```

**Fichiers :**
- `src/components/pilot/projection/` (8 fichiers)
- Remplace : CommandCockpit + V6Sidebar + FocusCockpit

**Responsive :**
- `lg+` (desktop/ordi) : drawers = colonnes fixes, footer masqué
- `<lg` (iPad/mobile) : drawers = overlays spring, footer visible

---

## Contraintes physiques respectées

| Contrainte | Implémentation |
|-----------|----------------|
| Karim debout, interrompu toutes 30s | CTA unique visible (Révéler / Suivant), pas de menu |
| iPad posé sur pupitre | Touch targets min 44px (min-h-11), footer toujours visible |
| Projecteur allumé, salle sombre | Fond #F7F3EA (crème), textes foncés sur fond clair |
| Lecture à 3-8m par 24 élèves | Texte question 24px minimum (Phase 0 compliance) |
| Interférence multi-écrans | Architecture ordi + iPad + /screen route (à venir) |

---

## Tokens Banlieuwood

| Usage | Token | Hex |
|-------|-------|-----|
| Fond principal | cream | #F7F3EA |
| Texte principal | dark | #2C2C2C |
| Texte secondaire | mid | #4A4A4A |
| Bords / séparateurs | light | #E8DFD2 |
| CTA principal / LIVE | orange | #FF6B35 |
| Répondu / progression | teal | #4ECDC4 |
| En attente | orange | #FF6B35 |
| Absent / inactif | gris | #9CA3AF |

---

## Doctrine Banlieuwood (respectée)

- ✅ Aucun score visible dans ProjectionClasseDrawer
- ✅ Aucun classement entre élèves
- ✅ Badge statut = répondu / en attente (pas de valeur)
- ✅ CockpitContext = source unique (pas de prop drilling)

---

## Faiblesses connues

1. **FocusQuestionCard** (dark) ne peut pas être réutilisée → `ProjectionQuestionCard` créé (24px, fond blanc)
2. **Logique CTA dupliquée** entre `ProjectionCenter` et `ProjectionFooter` — dette technique
3. **Swipe gesture** : non implémenté (drawers iPad = boutons footer uniquement)
4. **Logique CTA dupliquée** : `ProjectionCenter` + `ProjectionFooter` ont chacun `handleReveal/handleNext`

---

## Évolutions prévues

- [x] Route `/screen` — existe déjà (2090 lignes, DarkLayout dark mode)
- [x] Bouton Projection — câblé (`window.open(ROUTES.screen(id), "_blank")`)
- [ ] Swipe depuis bord iPad pour ouvrir drawers
- [ ] Déduplication logique CTA (hook `useProjectionCTA`)
- [ ] Module picker (changer de module sans quitter le cockpit)
