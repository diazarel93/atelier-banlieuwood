// ──────────────────────────────────────────────────────────
// MODULE 12 — Construction Collective
// 8 manches de votes anonymes pour construire le film de la classe
// ──────────────────────────────────────────────────────────

// ── Types ─────────────────────────────────────────────────

export interface MancheConfig {
  key: string;
  label: string;
  maxCards: number;
  description: string;
  /** B5_6 optional manches — not core, can be skipped */
  optional?: boolean;
}

export interface PoolCard {
  cardId: string;
  text: string;
  sourceType: "student" | "banlieuwood";
  contributorIds: string[];
  isBanlieuwood: boolean;
}

export interface BanlieuTemplate {
  manche: number;
  text: string;
}

// ── 8 Manches Configuration ───────────────────────────────

export const MANCHES: MancheConfig[] = [
  { key: "ton", label: "Le Ton", maxCards: 4, description: "Quel sera le ton du film ?" },
  { key: "situation", label: "La Situation", maxCards: 4, description: "Quelle situation de départ ?" },
  { key: "personnages", label: "Les Personnages", maxCards: 6, description: "Quels personnages ?" },
  { key: "objectif", label: "L'Objectif", maxCards: 4, description: "Quel objectif pour le héros ?" },
  { key: "obstacle", label: "L'Obstacle", maxCards: 4, description: "Quel obstacle principal ?" },
  { key: "scene", label: "La Première Scène", maxCards: 4, description: "Comment commence le film ?", optional: true },
  {
    key: "relation",
    label: "La Relation",
    maxCards: 4,
    description: "Quelle relation est au cœur de l'histoire ?",
    optional: true,
  },
  {
    key: "moment_fort",
    label: "Le Moment Fort",
    maxCards: 4,
    description: "Quel sera le moment le plus intense du film ?",
    optional: true,
  },
];

export function getMancheConfig(manche: number): MancheConfig | undefined {
  return MANCHES[manche - 1];
}

// ── Banlieuwood Templates (2+ par manche) ──────

export const BANLIEUWOOD_TEMPLATES: BanlieuTemplate[] = [
  // 1 — Le Ton (Adrian templates)
  { manche: 1, text: "Drôle — on rit, on se moque, mais on dit la vérité" },
  { manche: 1, text: "Mystérieux — tout est caché, rien n'est ce qu'il semble" },
  { manche: 1, text: "Dramatique — les émotions sont fortes, tout est intense" },
  { manche: 1, text: "Réaliste — comme la vraie vie, sans filtre" },
  // 2 — La Situation
  { manche: 2, text: "Un élève trouve un message caché dans son casier" },
  { manche: 2, text: "Le premier jour dans un nouveau quartier, tout est à découvrir" },
  // 3 — Les Personnages
  { manche: 3, text: "Inès, 15 ans, toujours un casque sur les oreilles pour ne pas entendre" },
  { manche: 3, text: "Karim, 14 ans, fait rire tout le monde mais ne rit jamais seul" },
  // 4 — L'Objectif
  { manche: 4, text: "Prouver à tout le monde qu'on peut réussir autrement" },
  { manche: 4, text: "Retrouver quelqu'un qui a disparu sans prévenir" },
  // 5 — L'Obstacle
  { manche: 5, text: "Sa propre peur de décevoir ceux qui comptent sur lui" },
  { manche: 5, text: "Un secret de famille que personne ne veut affronter" },
  // 6 — La Première Scène
  { manche: 6, text: "Plan fixe sur une porte qui s'ouvre lentement. On entend une voix." },
  { manche: 6, text: "Travelling sur un couloir de collège vide. Une alarme sonne au loin." },
  // 7 — La Relation
  { manche: 7, text: "Deux amis d'enfance que tout sépare depuis la rentrée" },
  { manche: 7, text: "Un grand frère qui veut protéger mais qui étouffe" },
  // 8 — Le Moment Fort
  { manche: 8, text: "Le moment où le héros dit enfin la vérité devant tout le monde" },
  { manche: 8, text: "Une confrontation silencieuse — un regard qui dit tout" },
];

// ── M10 Data Extraction ───────────────────────────────────

interface M10Data {
  etsiResponses: { id: string; student_id: string; etsi_text: string }[];
  personnages: { id: string; student_id: string; prenom: string; trait_dominant: string | null }[];
  pitchs: { id: string; student_id: string; objectif: string; obstacle: string; pitch_text: string }[];
  // QCM responses come from the standard responses table for M10 S1 P2
  qcmResponses?: { student_id: string; text: string }[];
}

interface Candidate {
  text: string;
  studentId: string;
}

/**
 * Extract candidate cards from Module 10 data for a given manche.
 */
export function extractCandidates(manche: number, m10: M10Data): Candidate[] {
  switch (manche) {
    case 1: // Le Ton — from QCM direction responses (M10 S1 P2)
      return (m10.qcmResponses || []).map((r) => ({
        text: r.text.slice(0, 80),
        studentId: r.student_id,
      }));

    case 2: // La Situation — from etsi_text
      return m10.etsiResponses.map((r) => ({
        text: r.etsi_text.slice(0, 120),
        studentId: r.student_id,
      }));

    case 3: // Les Personnages — from personnages (prénom + trait)
      return m10.personnages
        .filter((p) => p.prenom)
        .map((p) => ({
          text: `${p.prenom}${p.trait_dominant ? ` — ${p.trait_dominant}` : ""}`,
          studentId: p.student_id,
        }));

    case 4: // L'Objectif — from pitchs.objectif
      return m10.pitchs
        .filter((p) => p.objectif)
        .map((p) => ({
          text: p.objectif.slice(0, 100),
          studentId: p.student_id,
        }));

    case 5: // L'Obstacle — from pitchs.obstacle
      return m10.pitchs
        .filter((p) => p.obstacle)
        .map((p) => ({
          text: p.obstacle.slice(0, 100),
          studentId: p.student_id,
        }));

    case 6: // La Première Scène — from pitch_text (first sentence)
      return m10.pitchs
        .filter((p) => p.pitch_text)
        .map((p) => {
          const firstSentence = p.pitch_text.split(/[.!?]/)[0]?.trim() || p.pitch_text.slice(0, 100);
          return { text: firstSentence.slice(0, 120), studentId: p.student_id };
        });

    case 7: // La Relation — from personnages (cross-references: pairs of characters)
      // Use pitch_text to extract relationship dynamics, fallback to personnage pairs
      return m10.pitchs
        .filter((p) => p.pitch_text && p.pitch_text.length > 20)
        .map((p) => {
          // Extract a relationship-oriented sentence from the pitch
          const sentences = p.pitch_text.split(/[.!?]/).filter((s) => s.trim().length > 10);
          const relSentence =
            sentences.find((s) =>
              /ami|frère|sœur|famille|rival|ennemi|confiance|trahis|protég|lien|relation|ensemble/i.test(s),
            ) ||
            sentences[1] ||
            sentences[0];
          return { text: (relSentence?.trim() || p.pitch_text).slice(0, 120), studentId: p.student_id };
        });

    case 8: // Le Moment Fort — from etsi_text (most dramatic "et si" scenarios)
      return m10.etsiResponses
        .filter((r) => r.etsi_text && r.etsi_text.length > 15)
        .map((r) => ({
          text: r.etsi_text.slice(0, 120),
          studentId: r.student_id,
        }));

    default:
      return [];
  }
}

// ── Deduplication ─────────────────────────────────────────

/**
 * Check if two texts are too similar (>60% keyword overlap).
 */
export function areTooSimilar(a: string, b: string): boolean {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-zàâäéèêëïîôùûüÿç0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2);
  const wordsA = normalize(a);
  const wordsB = normalize(b);
  if (wordsA.length === 0 || wordsB.length === 0) return false;
  const setB = new Set(wordsB);
  const overlap = wordsA.filter((w) => setB.has(w)).length;
  const ratio = overlap / Math.min(wordsA.length, wordsB.length);
  return ratio > 0.6;
}

// ── Card Selection Algorithm ──────────────────────────────

/**
 * Select cards for a manche using the entonnoir algorithm.
 * 1. Prioritize students not yet covered by previous pools
 * 2. Filter quasi-duplicates
 * 3. Fill with Banlieuwood templates if < 3
 * 4. Cap at maxCards
 */
export function selectCards(
  candidates: Candidate[],
  maxCards: number,
  uncoveredIds: Set<string>,
  mancheNum: number,
): PoolCard[] {
  const templates = BANLIEUWOOD_TEMPLATES.filter((t) => t.manche === mancheNum);
  let cardCounter = 0;
  const makeId = () => `m${mancheNum}-c${++cardCounter}`;

  // Step 1: Separate into uncovered-priority and rest
  const uncoveredCandidates = candidates.filter((c) => uncoveredIds.has(c.studentId));
  const coveredCandidates = candidates.filter((c) => !uncoveredIds.has(c.studentId));
  const ordered = [...uncoveredCandidates, ...coveredCandidates];

  // Step 2: Pick cards, filtering duplicates
  const picked: PoolCard[] = [];
  for (const candidate of ordered) {
    if (picked.length >= maxCards) break;
    if (!candidate.text.trim()) continue;
    // Check duplicate against already picked
    const isDuplicate = picked.some((p) => areTooSimilar(p.text, candidate.text));
    if (isDuplicate) continue;
    picked.push({
      cardId: makeId(),
      text: candidate.text,
      sourceType: "student",
      contributorIds: [candidate.studentId],
      isBanlieuwood: false,
    });
  }

  // Step 3: Fill with templates if < 3
  if (picked.length < 3) {
    for (const tmpl of templates) {
      if (picked.length >= maxCards) break;
      const isDuplicate = picked.some((p) => areTooSimilar(p.text, tmpl.text));
      if (isDuplicate) continue;
      picked.push({
        cardId: makeId(),
        text: tmpl.text,
        sourceType: "banlieuwood",
        contributorIds: [],
        isBanlieuwood: true,
      });
    }
  }

  // Step 4: Ensure at least 2 cards (both templates if needed)
  if (picked.length < 2) {
    for (const tmpl of templates) {
      if (picked.length >= 2) break;
      const alreadyUsed = picked.some((p) => p.text === tmpl.text);
      if (alreadyUsed) continue;
      picked.push({
        cardId: makeId(),
        text: tmpl.text,
        sourceType: "banlieuwood",
        contributorIds: [],
        isBanlieuwood: true,
      });
    }
  }

  return picked.slice(0, maxCards);
}

// ── Coverage Tracking ─────────────────────────────────────

/**
 * Get student IDs that haven't contributed to any pool yet.
 */
export function getUncoveredStudents(existingPools: { cards: PoolCard[] }[], allStudentIds: string[]): Set<string> {
  const covered = new Set<string>();
  for (const pool of existingPools) {
    for (const card of pool.cards) {
      for (const id of card.contributorIds) {
        covered.add(id);
      }
    }
  }
  return new Set(allStudentIds.filter((id) => !covered.has(id)));
}
