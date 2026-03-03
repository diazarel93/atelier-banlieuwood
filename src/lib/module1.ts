// ============================================================
// Module 1 — Redesign Adrian — Helpers
// Positionnement (8 QCM) + 1 question/image + Carnet
// ============================================================

// ── Positioning axes ──

export const POSITIONING_AXES = [
  { key: "observation", label: "Observation", icon: "eye", color: "#4ECDC4" },
  { key: "narration", label: "Narration", icon: "book", color: "#FF6B35" },
  { key: "emotion", label: "Émotion", icon: "heart", color: "#F59E0B" },
  { key: "audace", label: "Audace", icon: "zap", color: "#8B5CF6" },
] as const;

// Map each question's option keys to the axis they score
export const POSITIONING_SCORING: Record<number, Record<string, string>> = {
  1: { a: "observation", b: "narration", c: "emotion", d: "narration" },
  2: { a: "observation", b: "narration", c: "audace" },
  3: { a: "emotion", b: "emotion", c: "audace", d: "observation" },
  4: { a: "narration", b: "emotion", c: "observation", d: "emotion" },
  5: { a: "observation", b: "narration", c: "audace", d: "emotion" },
  6: { a: "audace", b: "narration", c: "emotion", d: "observation" },
  7: { a: "emotion", b: "emotion", c: "audace", d: "audace" },
  8: { a: "observation", b: "audace", c: "emotion", d: "narration" },
};

// ── Creative profile ──

export interface CreativeProfile {
  dominant: string;  // strongest axis key
  scores: Record<string, number>;  // score per axis (0-8)
}

export function computeCreativeProfile(answers: Record<number, string>): CreativeProfile {
  const scores: Record<string, number> = {
    observation: 0,
    narration: 0,
    emotion: 0,
    audace: 0,
  };

  for (const [qStr, optionKey] of Object.entries(answers)) {
    const qNum = parseInt(qStr);
    const axis = POSITIONING_SCORING[qNum]?.[optionKey];
    if (axis && axis in scores) {
      scores[axis]++;
    }
  }

  // Find dominant axis
  let dominant = "observation";
  let maxScore = 0;
  for (const [axis, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      dominant = axis;
    }
  }

  return { dominant, scores };
}

// ── Analysis (kept from previous version) ──

export interface Module1Analysis {
  id: string;
  sessionId: string;
  classSummary: string;
  creativityAvg: number; // 1-5
  detailAvg: number;     // 1-5
  emotionAvg: number;    // 1-5
  analysisAvg: number;   // 1-5
  remarkableResponses: {
    studentName: string;
    studentAvatar: string;
    imagePosition: number;
    questionIndex: number;
    text: string;
  }[];
  recommendations: string;
  generatedAt: string;
}

/** Gauge colors based on score */
export function getGaugeColor(score: number): string {
  if (score >= 4) return "#4ECDC4";
  if (score >= 3) return "#F59E0B";
  if (score >= 2) return "#FF6B35";
  return "#EF4444";
}

/** Gauge labels */
export const MODULE1_GAUGES = [
  { key: "detail", label: "Observation", icon: "👁️", description: "Capacité à décrire ce qu'on voit" },
  { key: "analysis", label: "Interprétation", icon: "🔍", description: "Comprendre ce qui se passe" },
  { key: "creativity", label: "Imagination", icon: "✨", description: "Inventer une suite, projeter" },
  { key: "emotion", label: "Sensibilité", icon: "💡", description: "Relier un ressenti à un détail" },
] as const;
