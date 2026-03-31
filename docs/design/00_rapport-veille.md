# Rapport de Veille — Phase 0
**Date :** 2026-03-30
**Sujet :** Cockpit intervenant EdTech (live session)
**Projet :** Banlieuwood

---

## Patterns dominants en 2026

### 1. Card-based progressive disclosure
**Source :** adamfard.com/blog/edtech-design-trends + Muzli Dashboard 2026
**Principe :** L'enseignant voit les données actives sans surcharge. Les cartes permettent de n'afficher que ce qui est pertinent maintenant. Zones modulaires indépendantes — si une zone est vide, elle disparaît sans casser le layout.
**Applicable :** Valide le pattern Direction A (question centrale + stream séparé) et Direction C (drawers indépendants).

### 2. Dark mode premium avec accents haute saturation
**Source :** Muzli 2026 — Orbix Studio, Felix/Mirhayot
**Principe :** Fonds très sombres (#0A0A16) + accents néon/saturés. Particulièrement adapté aux environnements de projection : salle sombre = dark mode lisible, light mode = lavé par le projecteur.
**Applicable :** Valide fonctionnellement la Direction B (premium dark). Suggère que Direction A devrait proposer un mode sombre optionnel.

### 3. Badges de statut temps réel sans tableaux
**Source :** Multiple sources EdTech dashboard 2025-2026
**Principe :** Statut élèves = badge coloré (vert/orange/gris), jamais un tableau à colonnes. Reconnaissance visuelle < 200ms. Un tableau requiert de lire. Un badge se lit d'un coup d'oeil.
**Applicable :** Drawer Classe Direction C — les badges par élève sont le pattern validé. Les tableaux de données sont l'anti-pattern.

---

## Patterns morts — À éviter absolument

| Pattern | Preuve | Risque |
|---------|--------|--------|
| Navigation à dropdowns pendant session live | Anti-pattern explicite — retours Mentimeter | L'enseignant cherche une action pendant que les élèves attendent |
| Dense tabular layouts | Anti-pattern dans tous les dashboards EdTech 2026 | Illisible sur iPad debout à 60cm |
| Modals emboîtées pour actions urgentes | Cité — adamfard.com | 3+ taps pour une action fréquente = bug d'architecture |

---

## Ce que les utilisateurs détestent

1. **"Tracking individual student progress is tedious"**
   *Source : Common Sense Education — reviews Kahoot enseignants*
   → La vue classe doit montrer le statut en un coup d'oeil. Drawer Classe = scanning-first, pas navigation-first.

2. **"Hard to read questions and answers on a projected screen"**
   *Source : Reviews Kahoot — Common Sense Education, GetApp*
   → Mode projection ≠ juste un autre écran. Textes minimum 24px en mode projection (lu à 3-8m par 24 élèves).

3. **"Template changes broke our workflow" (Mentimeter 2024)**
   *Source : Reviews Capterra Mentimeter*
   → Les enseignants ont des rituels. Tout redesign en cours d'année = trahison. Design system stable obligatoire.

4. **Interface gamifiée inadaptée au secondaire/professionnel**
   *Source : Mission.io blog + comparatifs 2025-2026*
   → Valide la doctrine Banlieuwood "pas de gamification agressive, cinema premium".

---

## Lacune de l'état de l'art EdTech

**Aucun outil existant n'est conçu pour la posture physique réelle :**

Tous les concurrents (Kahoot, Nearpod, Mentimeter, Wooclap) sont conçus pour un utilisateur **assis devant un ordinateur de bureau**. L'intervenant Banlieuwood est :
- Debout devant la classe
- En mouvement
- iPad posé sur un pupitre (pas tenu en main en permanence)
- En train de parler en même temps
- Interrompu toutes les 30 secondes

C'est le vide que Banlieuwood peut occuper seul.

---

## Implication directe pour ce projet

La Phase 2 doit tester chaque direction contre cette contrainte physique. Toute direction qui requiert de "chercher" une action échoue dès le départ.

- Le dark mode est validé fonctionnellement (projecteur allumé en salle)
- Le système de badges (pas de tableaux) est la norme de l'industrie 2026
- La révélation des résultats est un moment absent chez tous les concurrents — c'est l'opportunité de différenciation la plus forte de Banlieuwood

---

## Sources

- [EdTech Design Trends 2025 — Adam Fard](https://adamfard.com/blog/edtech-design-trends)
- [Dashboard Design Inspirations 2026 — Muzli](https://muz.li/blog/best-dashboard-design-examples-inspirations-for-2026/)
- [Kahoot Reviews — Common Sense Education](https://www.commonsense.org/education/reviews/kahoot)
- [Kahoot Alternatives — Mission.io](https://mission.io/blog/kahoot-alternatives)
