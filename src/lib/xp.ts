// XP constants
export const XP_RESPOND = 10;
export const XP_VOTE = 5;
export const XP_RETAINED = 25;
export const XP_STREAK_BONUS_PER = 5; // streak * 5 when streak >= 2
export const XP_COMBO_PER = 15; // 15 * combo_count

export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 850, 1300, 1900, 2600, 3500, 5000];

export const LEVEL_NAMES = [
  "Figurant",
  "Stagiaire",
  "Assistant",
  "Cadreur",
  "Scenariste",
  "Realisateur",
  "Producteur",
  "Star",
  "Legende",
  "Oscar",
];

export function getLevel(xp: number): {
  level: number;
  name: string;
  progress: number;
  nextThreshold: number;
  currentXp: number;
} {
  let level = 0;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i;
      break;
    }
  }
  const currentThreshold = LEVEL_THRESHOLDS[level];
  const nextThreshold = LEVEL_THRESHOLDS[level + 1] ?? LEVEL_THRESHOLDS[level] + 1000;
  const progress = (xp - currentThreshold) / (nextThreshold - currentThreshold);

  return {
    level,
    name: LEVEL_NAMES[level] || LEVEL_NAMES[LEVEL_NAMES.length - 1],
    progress: Math.min(progress, 1),
    nextThreshold,
    currentXp: xp,
  };
}
