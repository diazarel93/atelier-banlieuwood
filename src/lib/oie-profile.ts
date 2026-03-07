/**
 * O-I-E Creative Profile Engine
 *
 * Maps student activity signals to 3 creative axes:
 *   O (Observation) — analytical, detail-oriented, slow & precise
 *   I (Imagination) — narrative, divergent, prolific writer
 *   E (Expression)  — social, persuasive, chosen by peers
 */

// ═══════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════

export interface OIESignal {
  axis: "O" | "I" | "E";
  value: number;
  reason: string;
}

export interface OIEScores {
  O: number; // 0-100
  I: number; // 0-100
  E: number; // 0-100
  dominant: "O" | "I" | "E";
  responseCount: number;
  isReliable: boolean;
  signals?: OIESignal[];
}

interface ResponseSignal {
  studentId: string;
  category: string | null;
  responseTimeMs: number | null;
  textLength: number;
  aiScore: number | null;
  isHighlighted: boolean;
}

interface VoteSignal {
  studentId: string; // the student whose response was voted for
  voteCount: number;
}

interface ChoiceSignal {
  studentId: string; // the student whose response became a collective choice
  choiceCount: number;
}

// ═══════════════════════════════════════════════════════
// Category → Axis mapping
// ═══════════════════════════════════════════════════════

interface AxisWeight {
  O: number;
  I: number;
  E: number;
}

const CATEGORY_AXES: Record<string, AxisWeight> = {
  // Pure O
  observation:     { O: 1.0, I: 0.0, E: 0.0 },
  positionnement:  { O: 1.0, I: 0.0, E: 0.0 },
  metiers:         { O: 1.0, I: 0.0, E: 0.0 },
  budget:          { O: 1.0, I: 0.0, E: 0.0 },
  contrainte:      { O: 1.0, I: 0.0, E: 0.0 },
  organisation:    { O: 1.0, I: 0.0, E: 0.0 },
  interpretation:  { O: 1.0, I: 0.0, E: 0.0 },
  // Pure I
  imagination:     { O: 0.0, I: 1.0, E: 0.0 },
  environnement:   { O: 0.0, I: 1.0, E: 0.0 },
  resolution:      { O: 0.0, I: 1.0, E: 0.0 },
  emotion_cachee:  { O: 0.0, I: 1.0, E: 0.0 },
  carnet:          { O: 0.0, I: 1.0, E: 0.0 },
  creativite:      { O: 0.0, I: 1.0, E: 0.0 },
  emotion:         { O: 0.0, I: 1.0, E: 0.0 },
  // Pure E
  pitch:           { O: 0.0, I: 0.0, E: 1.0 },
  collectif:       { O: 0.0, I: 0.0, E: 1.0 },
  renforcement:    { O: 0.0, I: 0.0, E: 1.0 },
  // Mixed
  image:           { O: 1.0, I: 0.4, E: 0.0 },  // O primary + I secondary
  personnage:      { O: 0.0, I: 1.0, E: 0.4 },  // I + E
  conflit:         { O: 0.0, I: 1.0, E: 0.4 },  // I + E
  trajectoire:     { O: 0.4, I: 1.0, E: 0.0 },  // I + O
  liens:           { O: 0.0, I: 0.4, E: 1.0 },  // E + I
  intention:       { O: 0.4, I: 0.0, E: 1.0 },  // E + O
};

const DEFAULT_AXES: AxisWeight = { O: 0.33, I: 0.34, E: 0.33 };

// ═══════════════════════════════════════════════════════
// Compute O-I-E for a single student
// ═══════════════════════════════════════════════════════

export function computeOIE(
  responses: ResponseSignal[],
  votes: VoteSignal | undefined,
  choices: ChoiceSignal | undefined,
  includeSignals = false,
): OIEScores {
  const rawO = { score: 0, count: 0 };
  const rawI = { score: 0, count: 0 };
  const rawE = { score: 0, count: 0 };
  const signals: OIESignal[] = [];

  const track = (axis: "O" | "I" | "E", value: number, reason: string) => {
    if (includeSignals) signals.push({ axis, value, reason });
  };

  // ── Response-based signals ──
  for (const r of responses) {
    const axes = (r.category && CATEGORY_AXES[r.category]) || DEFAULT_AXES;

    // Category contribution
    if (axes.O > 0) {
      rawO.score += axes.O; rawO.count++;
      track("O", axes.O, `catégorie "${r.category || "?"}"`);
    }
    if (axes.I > 0) {
      rawI.score += axes.I; rawI.count++;
      track("I", axes.I, `catégorie "${r.category || "?"}"`);
    }
    if (axes.E > 0) {
      rawE.score += axes.E; rawE.count++;
      track("E", axes.E, `catégorie "${r.category || "?"}"`);
    }

    // O bonuses: slow & precise
    if (r.responseTimeMs && r.responseTimeMs > 45000) {
      rawO.score += 0.3; rawO.count++;
      track("O", 0.3, `temps > 45s (${Math.round(r.responseTimeMs / 1000)}s)`);
    }
    if (r.aiScore != null && r.aiScore >= 4) {
      rawO.score += 0.2; rawO.count++;
      track("O", 0.2, `score IA élevé (${r.aiScore}/5)`);
    }

    // I bonuses: long text
    if (r.textLength > 150) {
      rawI.score += 0.3; rawI.count++;
      track("I", 0.3, `texte long (${r.textLength} car.)`);
    } else if (r.textLength > 80) {
      rawI.score += 0.15; rawI.count++;
      track("I", 0.15, `texte moyen (${r.textLength} car.)`);
    }

    // E bonuses: highlighted
    if (r.isHighlighted) {
      rawE.score += 0.5; rawE.count++;
      track("E", 0.5, "mis en avant par le prof");
    }
  }

  // ── Vote-based E signal ──
  if (votes && votes.voteCount > 0) {
    const voteBonus = Math.min(votes.voteCount * 0.15, 3.0);
    rawE.score += voteBonus;
    rawE.count++;
    track("E", voteBonus, `${votes.voteCount} vote(s) reçu(s)`);
  }

  // ── Collective choice E signal ──
  if (choices && choices.choiceCount > 0) {
    const choiceBonus = choices.choiceCount * 0.4;
    rawE.score += choiceBonus;
    rawE.count++;
    track("E", choiceBonus, `${choices.choiceCount} choix collectif(s)`);
  }

  // ── Normalize to 0-100 ──
  const responseCount = responses.length;
  const normalize = (raw: { score: number; count: number }) => {
    if (raw.count === 0) return 0;
    const density = (raw.score / raw.count) * 50;
    const volumeBonus = Math.min(responseCount / 10, 1) * 30;
    const base = responseCount >= 5 ? 10 : responseCount >= 3 ? 5 : 0;
    return Math.min(100, Math.round(density + volumeBonus + base));
  };

  const O = normalize(rawO);
  const I = normalize(rawI);
  const E = normalize(rawE);

  // Dominant axis
  let dominant: "O" | "I" | "E" = "O";
  if (I >= O && I >= E) dominant = "I";
  else if (E >= O && E >= I) dominant = "E";

  const result: OIEScores = {
    O,
    I,
    E,
    dominant,
    responseCount,
    isReliable: responseCount >= 15,
  };

  if (includeSignals) result.signals = signals;

  return result;
}

// ═══════════════════════════════════════════════════════
// Aggregate cross-session O-I-E (weighted average)
// ═══════════════════════════════════════════════════════

export function aggregateOIE(
  scores: { observation: number; imagination: number; expression: number; response_count: number }[],
): { O: number; I: number; E: number; dominant: "O" | "I" | "E"; responseCount: number } {
  let totalWeight = 0;
  let sumO = 0, sumI = 0, sumE = 0, totalResponses = 0;

  for (const s of scores) {
    const w = s.response_count || 1;
    sumO += s.observation * w;
    sumI += s.imagination * w;
    sumE += s.expression * w;
    totalWeight += w;
    totalResponses += s.response_count;
  }

  if (totalWeight === 0) return { O: 0, I: 0, E: 0, dominant: "O", responseCount: 0 };

  const O = Math.round(sumO / totalWeight);
  const I = Math.round(sumI / totalWeight);
  const E = Math.round(sumE / totalWeight);

  let dominant: "O" | "I" | "E" = "O";
  if (I >= O && I >= E) dominant = "I";
  else if (E >= O && E >= I) dominant = "E";

  return { O, I, E, dominant, responseCount: totalResponses };
}
