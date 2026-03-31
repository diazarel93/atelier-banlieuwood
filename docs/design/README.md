# Design Cockpit — Banlieuwood

Dossier des rapports et livrables design, générés phase par phase par les agents.

## Structure

```
docs/design/
  00_rapport-veille.md     Phase 0 — Veille web (patterns dominants, anti-patterns, plaintes)
  01_brief-creatif.md      Phase 1 — Brief créatif structuré (à générer)
  02_directions/           Phase 2 — Specs texte des 3 directions (à générer)
    direction-A.md
    direction-B.md
    direction-C.md
  03_verdict.md            Verdict Creative Director (à générer après choix)
```

## Interface visuelle

→ http://localhost:3011/design-preview

Onglet **Rapports** : tous les rapports écrits ci-dessus
Onglet **Directions** : visuels interactifs des 3 directions (MiniCockpit avec tous les états)
Onglet **Comparative** : comparaison côte à côte + scores

## Comment générer les phases manquantes

**Phase 1 — Brief créatif :**
```
Lancer l'agent design-director, commande :
"Phase 1 — Brief créatif pour le cockpit intervenant Banlieuwood"
Sauvegarder l'output dans docs/design/01_brief-creatif.md
```

**Verdict — Creative Director :**
```
Après avoir choisi une direction, lancer l'agent creative-director avec
les rapports des 3 personas (intervenant, élève, décideur).
Sauvegarder dans docs/design/03_verdict.md
```
