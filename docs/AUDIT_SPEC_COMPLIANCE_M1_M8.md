# Audit de conformite spec M1-M8 — Code vs Module Designer V2

**Date :** 28 mars 2026
**Commit :** `e46c03c`
**Source spec :** BANLIEUWOOD_MODULE_DESIGNER_V2.html + SPEC_MODULES_VALIDATION_DEV.md
**Auditeur :** Dev (Claude Code)

---

## Resume executif

| Module | Conformite | Verdict |
|---|---|---|
| **M1 Le Regard** | 60% | B2b manquant, m1e hors spec |
| **M2 Le Mecanisme** | ✅ Resolu | "Emotion Cachee" reclasse bonus. B_QCM = vrai M2, integre dans M3. |
| **M3 Generer l'idee** | 95% | Conforme, B3a/B3b implicites |
| **M4 Le Pitch** | 95% | Conforme, B4_1 implicite |
| **M5 Le Recit** | 70% | 8 manches au lieu de 5+1 optionnel |
| **M6 Le Scenario** | Non audite | Maturite C, pas encore code |
| **M7 La Mise en scene** | Non audite | Maturite C, code existant |
| **M8 L'Equipe** | Non audite | Maturite C, code existant |

---

## M1 — Le Regard (dbModule 1)

### Ce qui est conforme
- **B1 (m1a)** : 8 questions de positionnement, anonymes, QCM ✅
- **B2a (m1b/m1c/m1d)** : 3 images + question ouverte + confrontation anonyme ✅
- **Bonus** : m1c a un mode 2 phases (observation + interpretation) — enrichissement pedagigique

### Ce qui manque
- **B2b — Decadrage oral** : brique core, maturite A, intervenant uniquement
  - Aucun marqueur dans le cockpit pour signaler au facilitateur le moment du decadrage
  - Spec dit : "B2b est intentionnellement presentielle — pas d'outil numerique"
  - **Action** : ajouter un signal cockpit "Pause — Decadrage oral" apres chaque confrontation

### Ce qui est hors spec
- **m1e (Carnet d'idees)** : seance 5, ecriture libre
  - Non mentionne dans la spec (B1, B2a, B2b = 3 briques seulement)
  - Pedagogiquement pertinent mais non documente
  - **Action** : garder, documenter comme extension post-spec

---

## M2 — Le Mecanisme d'une scene (dbModule 2)

### Ecart structurel majeur

| Spec | Code |
|---|---|
| 1 brique : B_QCM (QCMs cadrage narratif) | 4 seances completes (u2a checklist, u2b scene builder, u2c debat, u2d cloture) |
| Optionnel en F0 (integre dans M3 B4a) | Module separe avec 29 situations SQL |
| Core en F1/F2 | Toujours affiche comme module complet |

### Analyse
Le code implemente un module "Emotion Cachee" complet qui n'existe pas dans la spec. La spec ne prevoit qu'une brique QCM pour M2. Le module code inclut :
- Checklist culturelle (20 items)
- Scene builder avec jetons et contraintes
- Feedback IA
- Debat collectif
- Cloture thematique

### Resolution (28 mars 2026)
- **Confirme par Module Designer V2** : M2 = B_QCM seulement
- dbModule 2 (u2a-u2d "Emotion Cachee") reclasse comme **bonus**
- M2 spec n'a pas de dbModule propre — B_QCM integre dans M3 (etsi-writer)
- Phase "scene" deplacee dans les bonus, renommee "Emotion Cachee"
- MAIN_PHASE_IDS mis a jour

---

## M3 — Generer l'idee (dbModule 10, seance 1)

### Ce qui est conforme
- **B4a** : images + "Et si..." + QCMs optionnels ✅
- **B4b** : aide activable (3 types, gate par facilitateur) ✅
- **B5** : cloture + miroir collectif (idea-bank-state.tsx) ✅
- Anonymat respecte ✅
- Pas de generation IA ✅

### Points mineurs
- **B3a/B3b** (intervenant oral) : pas de checkpoint digital — suppose que l'intervenant parle avant que les eleves interagissent. Acceptable si le flux est respecte en classe.
- **Idea Bank** : composant additionnel (vote sur les idees) — enrichissement, pas dans la spec

### Action
- Aucune correction requise. Documenter B3a/B3b comme briques non digitales.

---

## M4 — Le Pitch (dbModule 10, seance 2)

### Ce qui est conforme
- **B4_2** : avatar builder (mini-jeu creation personnage) ✅
- **B4_3** : objectif du personnage (presets + texte libre) ✅
- **B4_4** : tension/obstacle ✅
- **B4_5** : construction pitch fill-in-blanks (PAS genere par IA) ✅
- **B4_6** : chrono 30 secondes (bloquant si >30s) ✅
- **B4_7** : envoi + confrontation douce anonyme + auto-audit ✅

### Points mineurs
- **B4_1** (intro intervenant) : pas de checkpoint digital — meme logique que M3
- **Force/Faiblesse** dans avatar builder : bonus hors spec (enrichissement positif)
- **pitchMiroir** : affichage optionnel, generation a documenter

### Action
- Aucune correction requise. Confirmer que pitchMiroir n'est pas genere par IA.

---

## M5 — Le Recit (dbModule 12)

### Ce qui est conforme
- **Manches 1-5** (Ton, Situation, Personnages, Objectif, Obstacle) : ✅
  - Nombre de cartes correct (4 sauf Personnages = 6)
  - Cartes anonymisees ✅
  - Sources : pitchs eleves + templates Banlieuwood ✅
  - Vote facilitateur-valide ✅

### Ce qui differe de la spec
- **8 manches au lieu de 5+1** : le code traite les manches 6 (Scene), 7 (Relation), 8 (Moment fort) comme core obligatoire
- La spec definit B5_6 comme **optionnel** : "elements creatifs complementaires — pas une sixieme manche obligatoire"
- Le cockpit affiche "Manche 6/8, 7/8, 8/8" sans distinction core/optionnel

### Action
- Marquer manches 6-7-8 comme optionnelles dans module12-data.ts
- Ajouter un indicateur visuel dans le cockpit (separateur "Bonus" apres manche 5)
- Permettre au facilitateur de terminer apres la manche 5

---

## M6, M7, M8 — Non audites en detail

Ces modules sont maturite C (esquisse). Le code existant semble fonctionnel mais l'audit detail n'est pas prioritaire tant que F0/F1 sont l'objectif terrain.

**A auditer quand la spec sera consolidee (post-terrain F0).**

---

## Actions correctives

### A faire maintenant (code)
1. **M1 B2b** : ajouter marqueur facilitateur "Decadrage oral" dans le cockpit
2. **M5 B5_6** : marquer manches 6-7-8 comme optionnelles

### A clarifier avec Banlieuwood
3. **M2** : ecart structurel — "Emotion Cachee" (code) vs B_QCM (spec)
4. **M1 m1e** : confirmer si le carnet d'idees est un ajout intentionnel

### Documentation
5. Documenter B3a/B3b/B4_1 comme briques non digitales (intervenant oral)
6. Documenter les enrichissements hors spec (Force/Faiblesse M4, Idea Bank M3)

---

*Audit realise le 28 mars 2026 — Banlieuwood*
