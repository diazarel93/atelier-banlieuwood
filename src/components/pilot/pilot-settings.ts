/**
 * Cockpit settings — centralized configuration.
 * All hardcoded values extracted here for easy tuning.
 */

/** Timer presets in seconds, mapped to keyboard shortcuts 1-5 */
export const TIMER_PRESETS = [30, 60, 120, 180, 300] as const;

/** How long (ms) before a non-responding student is flagged "stuck" */
export const STUCK_THRESHOLD_MS = 60_000;

/** Minimum time (ms) before stuck detection starts */
export const STUCK_DETECTION_DELAY_MS = 60_000;

/** Broadcast message max length */
export const BROADCAST_MAX_CHARS = 200;

/** Default broadcast quick phrases */
export const DEFAULT_BROADCAST_PRESETS = [
  { emoji: "⏰", label: "Temps", text: "Il reste 30 secondes !" },
  { emoji: "📝", label: "Justifier", text: "Pensez à justifier votre réponse" },
  { emoji: "👀", label: "Relire", text: "Relisez bien avant de valider" },
  { emoji: "🤫", label: "Silence", text: "Silence s'il vous plaît" },
  { emoji: "💪", label: "Courage", text: "N'hésitez pas, il n'y a pas de mauvaise réponse !" },
  { emoji: "🔔", label: "Répondez", text: "N'oubliez pas de répondre à la question !" },
] as const;

/** Default nudge presets */
export const NUDGE_PRESETS: { label: string; text: string }[] = [
  { label: "Développe", text: "Ta réponse est trop courte. Développe ton idée !" },
  { label: "Sérieux", text: "Merci de répondre sérieusement." },
  { label: "Hors-sujet", text: "Attention, ta réponse est hors-sujet. Relis la question." },
  { label: "Bravo, +", text: "Bonne piste ! Peux-tu aller plus loin ?" },
];

/** Quick one-click emoji reactions */
export const QUICK_REACTIONS: { emoji: string; text: string; color: string }[] = [
  { emoji: "👍", text: "Bien vu !", color: "#4ECDC4" },
  { emoji: "🔥", text: "Excellente réponse !", color: "#F59E0B" },
  { emoji: "💡", text: "Idée originale !", color: "#8B5CF6" },
  { emoji: "🤔", text: "Creuse un peu plus cette idée...", color: "#EC4899" },
];

/** Polling intervals in ms */
export const POLLING = {
  responses: 10_000,
  liveData: 15_000,
} as const;

/** Elapsed timer color thresholds in seconds */
export const ELAPSED_THRESHOLDS = {
  amber: 120,  // 2 min
  red: 300,    // 5 min
} as const;
