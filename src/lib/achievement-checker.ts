// ═══════════════════════════════════════════════════════════════
// BANLIEUWOOD — Achievement Checker
// Pure function: maps profile stats to earned achievement tiers
// ═══════════════════════════════════════════════════════════════

import { ACHIEVEMENTS, type AchievementTier } from "./achievements-v2";

export interface ProfileStats {
  totalResponses: number;
  retainedCount: number;
  sessionsPlayed: number;
  bestStreak: number;
  currentStreak: number;
  totalXp: number;
  totalVotes: number;
  level: number;
}

export interface AchievementUnlock {
  achievementId: string;
  tier: AchievementTier;
  progress: number;
}

/**
 * Maps an achievement ID to a progress value derived from profile stats.
 * Returns undefined for achievements that can't be evaluated from stats alone
 * (e.g. time-based, AI-score-based, or event-driven achievements).
 */
function getProgress(achievementId: string, stats: ProfileStats): number | undefined {
  switch (achievementId) {
    // ── Narration ──
    case "narrateur":
      return stats.totalResponses;
    case "plume_or":
      return stats.retainedCount;
    case "scenariste":
      return stats.sessionsPlayed;
    case "poete":
      // Approximation: no direct "figures de style" metric, use half totalResponses
      return Math.floor(stats.totalResponses / 2);
    case "dialoguiste":
      // Approximation: no direct "long responses" metric, use half totalResponses
      return Math.floor(stats.totalResponses / 2);

    // ── Vote ──
    case "electeur":
      return stats.totalVotes;
    case "kingmaker":
      return stats.retainedCount;
    case "curateur":
      return stats.totalVotes;

    // ── Expression ──
    case "tribun":
      // AI score-based — can't evaluate from stats alone
      return undefined;
    case "pitcheur":
      // Pitch-based — can't evaluate from stats alone
      return undefined;
    case "debatteur":
      return stats.sessionsPlayed;
    case "improvisateur":
      return stats.totalResponses;

    // ── Streak ──
    case "flamme":
      return stats.bestStreak;
    case "marathonien":
      return stats.sessionsPlayed;
    case "regulier":
      return stats.currentStreak;

    // ── Social ──
    case "collaborateur":
      return stats.sessionsPlayed;
    case "mentor":
      // Help-based — can't evaluate from stats alone
      return undefined;
    case "star":
      return stats.retainedCount;
    case "public":
      return stats.totalVotes;
    case "festival_star":
      // Festival-based — can't evaluate from stats alone
      return undefined;

    // ── Special ──
    case "premier_pas":
      return stats.sessionsPlayed >= 1 ? 1 : 0;
    case "explorateur":
      return stats.sessionsPlayed;
    case "perfectionniste":
      // AI perfect-score-based — can't evaluate from stats alone
      return undefined;
    case "noctambule":
      // Time-based — can't evaluate from stats alone
      return undefined;
    case "speed_runner":
      // Time-based — can't evaluate from stats alone
      return undefined;
    case "combo_master":
      return stats.bestStreak;
    case "mission_hero":
      // Mission-based — can't evaluate from stats alone
      return undefined;
    case "cinephile":
      return stats.totalResponses;
    case "critique":
      // Festival-based — can't evaluate from stats alone
      return undefined;
    case "legende":
      // "Atteindre le niveau Oscar" — level 9 is max (Oscar)
      return stats.level >= 9 ? 1 : 0;

    default:
      return undefined;
  }
}

/**
 * Check all achievements against current profile stats.
 * Returns every achievement+tier that the player has earned.
 * The caller is responsible for comparing with existing unlocks
 * to determine which ones are genuinely new.
 */
export function checkAchievements(stats: ProfileStats): AchievementUnlock[] {
  const unlocks: AchievementUnlock[] = [];

  for (const def of ACHIEVEMENTS) {
    const progress = getProgress(def.id, stats);
    if (progress === undefined) continue;

    // Walk through tiers from lowest to highest — emit all earned tiers
    for (const tierDef of def.tiers) {
      if (progress >= tierDef.threshold) {
        unlocks.push({
          achievementId: def.id,
          tier: tierDef.tier,
          progress,
        });
      }
    }
  }

  return unlocks;
}
