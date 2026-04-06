# /eval — Evaluer la qualité d'un système AI

Les evals sont la différence entre un produit AI qui dérive et un produit qui s'améliore.
Sans evals → tu codes à l'aveugle. Avec evals → tu sais exactement où tu en es.

## Usage

`/eval [feature-ai]` — créer un eval pour une feature AI
`/eval --run` — lancer les evals existants
`/eval --report` — rapport de qualité AI

## Pourquoi les evals sont critiques

Un LLM peut régresser entre deux versions sans que tu t'en rendes compte.
Les evals = tests unitaires pour le comportement AI.

Exemples de régressions silencieuses :
- Réponse qui était en français passe à l'anglais
- Verdict "A vérifier" qui devient "Autorisé" (catastrophique pour Kura)
- Latence qui passe de 2s à 8s
- Coût par requête qui triple

## Structure d'un eval

### 1. Définir les cas de test

```typescript
// evals/[feature].eval.ts
interface EvalCase {
  input: string | object;
  expected: {
    contains?: string[];      // réponse doit contenir ces mots
    notContains?: string[];   // réponse ne doit PAS contenir ces mots
    format?: "json" | "text" | "markdown";
    maxLatencyMs?: number;    // seuil de performance
    maxCostUSD?: number;      // seuil de coût
  };
  label: string;             // description du cas
  priority: "critical" | "high" | "medium";
}
```

### 2. Catégories d'evals à implémenter

**Evals de comportement (critique) :**
- Cas nominaux — ce que la feature doit faire normalement
- Cas limites — inputs vides, très longs, caractères spéciaux
- Cas d'adversité — tentatives de jailbreak, inputs malveillants
- Cas de régression — bugs corrigés qui ne doivent pas revenir

**Evals de guardrails (critique pour Kura) :**
- Un RED ne peut jamais être labélé "autorisé"
- Entité inconnue → "A vérifier", jamais inventée
- Disclaimer Canada toujours présent

**Evals de performance :**
- Latence p50, p95, p99
- Coût par requête (tokens input + output)
- Taux de succès (pas d'erreur API)

**Evals de qualité :**
- Pertinence de la réponse (LLM-as-judge)
- Cohérence sur des inputs similaires
- Langue correcte (français si configuré)

### 3. Exemple concret (Kura)

```python
# evals/ask_service_eval.py
eval_cases = [
    {
        "input": {"substance": "EPO", "sport": "cyclisme", "level": "elite"},
        "expected": {
            "verdict": "PROHIBITED",
            "contains": ["Liste Interdite", "S2"],
            "not_contains": ["autorisé", "permitted", "allowed"],
        },
        "label": "EPO doit être PROHIBITED — jamais autorisé",
        "priority": "critical"
    },
    {
        "input": {"substance": "caféine", "sport": "tennis"},
        "expected": {
            "verdict": "MONITORED",
            "disclaimer_present": True,  # si substance canadienne
        },
        "label": "Caféine = substance surveillée",
        "priority": "high"
    },
    {
        "input": {"substance": "XYZ_INCONNU_123"},
        "expected": {
            "verdict": "A_VERIFIER",
            "not_contains": ["autorisé", "interdit"],  # pas d'invention
        },
        "label": "Substance inconnue → A vérifier, jamais inventée",
        "priority": "critical"
    }
]
```

### 4. LLM-as-judge (pour la qualité subjective)

```typescript
async function judgeResponse(response: string, criteria: string): Promise<number> {
  // Utiliser un modèle (Haiku suffit) pour noter la réponse
  const prompt = `
    Critère : ${criteria}
    Réponse à évaluer : ${response}
    Note de 0 à 10. Réponds UNIQUEMENT avec un nombre.
  `;
  // retourne un score 0-10
}
```

### 5. Dashboard de résultats

```
EVAL REPORT — [feature] — [date]

CRITICAL (0 tolérance)
  ✅ EPO toujours PROHIBITED              [100% sur 50 runs]
  ✅ Inconnue → A vérifier               [100% sur 30 runs]
  ✅ Disclaimer Canada présent            [100% sur 20 runs]

HIGH
  ✅ Format JSON valide                   [98% — 1 fail sur 50]
  ⚠️ Réponse en français                 [92% — 4 fails sur 50]
  ❌ Latence < 3s                         [78% — 11 fails sur 50]

MEDIUM
  ✅ Cohérence inter-runs                 [95%]
  ⚠️ Coût < $0.01/requête               [88%]

SCORE GLOBAL : 18/20
RÉGRESSION vs dernière version : -2 points (latence)
ACTION : Optimiser le prompt système — trop long → tokens inutiles
```

## Fréquence recommandée

- **Avant chaque PR** qui touche à du code AI
- **Quotidien** en production (cron automatique)
- **Après chaque changement de modèle** (Haiku → Sonnet, etc.)
- **Après une mise à jour de prompt** système

## Intégration CI

```yaml
# .github/workflows/eval.yml
on:
  pull_request:
    paths: ['src/lib/ai/**', 'src/app/api/ai/**']

jobs:
  eval:
    runs-on: ubuntu-latest
    steps:
      - run: npm run eval:ci
      - if: failure()
        run: echo "Evals échouent — PR bloquée"
```
