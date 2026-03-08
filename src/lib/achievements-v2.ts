// ═══════════════════════════════════════════════════════════════
// BANLIEUWOOD V2 — Achievement System
// 30 badges × 3 tiers = 90 total unlockables
// ═══════════════════════════════════════════════════════════════

export type AchievementTier = "bronze" | "silver" | "gold";

export type AchievementCategory =
  | "narration"
  | "vote"
  | "expression"
  | "streak"
  | "social"
  | "special";

export interface AchievementTierDef {
  tier: AchievementTier;
  threshold: number;
  label: string;
}

export interface AchievementDef {
  id: string;
  category: AchievementCategory;
  name: string;
  description: string;
  icon: string;
  tiers: AchievementTierDef[];
  rewardType?: "accessory" | "frame" | "title" | "effect";
  rewardValue?: string;
}

export interface UnlockedAchievement {
  achievementId: string;
  tier: AchievementTier;
  progress: number;
  unlockedAt: string;
  seen: boolean;
}

// ── All 30 achievement definitions ──
export const ACHIEVEMENTS: AchievementDef[] = [
  // Narration (5)
  {
    id: "narrateur",
    category: "narration",
    name: "Narrateur",
    description: "Ecrire des reponses",
    icon: "✍️",
    tiers: [
      { tier: "bronze", threshold: 5, label: "Bronze" },
      { tier: "silver", threshold: 25, label: "Argent" },
      { tier: "gold", threshold: 100, label: "Or" },
    ],
    rewardType: "title",
    rewardValue: "Conteur",
  },
  {
    id: "plume_or",
    category: "narration",
    name: "Plume d'Or",
    description: "Reponses retenues par le vote",
    icon: "🖊️",
    tiers: [
      { tier: "bronze", threshold: 3, label: "Bronze" },
      { tier: "silver", threshold: 15, label: "Argent" },
      { tier: "gold", threshold: 50, label: "Or" },
    ],
    rewardType: "frame",
    rewardValue: "gold_quill",
  },
  {
    id: "scenariste",
    category: "narration",
    name: "Scenariste",
    description: "Completer des modules",
    icon: "🎬",
    tiers: [
      { tier: "bronze", threshold: 2, label: "Bronze" },
      { tier: "silver", threshold: 5, label: "Argent" },
      { tier: "gold", threshold: 8, label: "Or" },
    ],
    rewardType: "accessory",
    rewardValue: "beret",
  },
  {
    id: "poete",
    category: "narration",
    name: "Poete",
    description: "Utiliser des figures de style",
    icon: "📜",
    tiers: [
      { tier: "bronze", threshold: 5, label: "Bronze" },
      { tier: "silver", threshold: 20, label: "Argent" },
      { tier: "gold", threshold: 50, label: "Or" },
    ],
    rewardType: "title",
    rewardValue: "Poete",
  },
  {
    id: "dialoguiste",
    category: "narration",
    name: "Dialoguiste",
    description: "Reponses longues et detaillees",
    icon: "💬",
    tiers: [
      { tier: "bronze", threshold: 10, label: "Bronze" },
      { tier: "silver", threshold: 30, label: "Argent" },
      { tier: "gold", threshold: 75, label: "Or" },
    ],
    rewardType: "accessory",
    rewardValue: "megaphone",
  },

  // Vote (3)
  {
    id: "electeur",
    category: "vote",
    name: "Electeur",
    description: "Voter pour des reponses",
    icon: "🗳️",
    tiers: [
      { tier: "bronze", threshold: 10, label: "Bronze" },
      { tier: "silver", threshold: 50, label: "Argent" },
      { tier: "gold", threshold: 150, label: "Or" },
    ],
    rewardType: "title",
    rewardValue: "Critique",
  },
  {
    id: "kingmaker",
    category: "vote",
    name: "Faiseur de Roi",
    description: "Voter pour la carte retenue par le groupe",
    icon: "👑",
    tiers: [
      { tier: "bronze", threshold: 5, label: "Bronze" },
      { tier: "silver", threshold: 20, label: "Argent" },
      { tier: "gold", threshold: 50, label: "Or" },
    ],
    rewardType: "frame",
    rewardValue: "crown",
  },
  {
    id: "curateur",
    category: "vote",
    name: "Curateur",
    description: "Voter dans toutes les situations d'une session",
    icon: "🎯",
    tiers: [
      { tier: "bronze", threshold: 3, label: "Bronze" },
      { tier: "silver", threshold: 10, label: "Argent" },
      { tier: "gold", threshold: 25, label: "Or" },
    ],
    rewardType: "accessory",
    rewardValue: "monocle",
  },

  // Expression (4)
  {
    id: "tribun",
    category: "expression",
    name: "Tribun",
    description: "Reponses avec score IA eleve",
    icon: "🎤",
    tiers: [
      { tier: "bronze", threshold: 5, label: "Bronze" },
      { tier: "silver", threshold: 20, label: "Argent" },
      { tier: "gold", threshold: 50, label: "Or" },
    ],
    rewardType: "title",
    rewardValue: "Orateur",
  },
  {
    id: "pitcheur",
    category: "expression",
    name: "Pitcheur",
    description: "Completer des pitchs",
    icon: "🎯",
    tiers: [
      { tier: "bronze", threshold: 3, label: "Bronze" },
      { tier: "silver", threshold: 10, label: "Argent" },
      { tier: "gold", threshold: 25, label: "Or" },
    ],
    rewardType: "effect",
    rewardValue: "spotlight",
  },
  {
    id: "debatteur",
    category: "expression",
    name: "Debatteur",
    description: "Participer aux debats",
    icon: "⚔️",
    tiers: [
      { tier: "bronze", threshold: 5, label: "Bronze" },
      { tier: "silver", threshold: 15, label: "Argent" },
      { tier: "gold", threshold: 40, label: "Or" },
    ],
    rewardType: "accessory",
    rewardValue: "shield",
  },
  {
    id: "improvisateur",
    category: "expression",
    name: "Réactif",
    description: "Répondre à chaque question sans hésiter",
    icon: "⚡",
    tiers: [
      { tier: "bronze", threshold: 5, label: "Bronze" },
      { tier: "silver", threshold: 25, label: "Argent" },
      { tier: "gold", threshold: 75, label: "Or" },
    ],
    rewardType: "effect",
    rewardValue: "lightning",
  },

  // Streak (3)
  {
    id: "flamme",
    category: "streak",
    name: "Flamme",
    description: "Jours consecutifs actifs",
    icon: "🔥",
    tiers: [
      { tier: "bronze", threshold: 3, label: "Bronze" },
      { tier: "silver", threshold: 7, label: "Argent" },
      { tier: "gold", threshold: 30, label: "Or" },
    ],
    rewardType: "effect",
    rewardValue: "flame_aura",
  },
  {
    id: "marathonien",
    category: "streak",
    name: "Marathonien",
    description: "Sessions jouees",
    icon: "🏃",
    tiers: [
      { tier: "bronze", threshold: 5, label: "Bronze" },
      { tier: "silver", threshold: 20, label: "Argent" },
      { tier: "gold", threshold: 50, label: "Or" },
    ],
    rewardType: "frame",
    rewardValue: "marathon",
  },
  {
    id: "regulier",
    category: "streak",
    name: "Regulier",
    description: "Semaines avec au moins 1 session",
    icon: "📅",
    tiers: [
      { tier: "bronze", threshold: 4, label: "Bronze" },
      { tier: "silver", threshold: 12, label: "Argent" },
      { tier: "gold", threshold: 30, label: "Or" },
    ],
    rewardType: "title",
    rewardValue: "Fidele",
  },

  // Social (5)
  {
    id: "collaborateur",
    category: "social",
    name: "Collaborateur",
    description: "Jouer en equipe",
    icon: "🤝",
    tiers: [
      { tier: "bronze", threshold: 5, label: "Bronze" },
      { tier: "silver", threshold: 20, label: "Argent" },
      { tier: "gold", threshold: 50, label: "Or" },
    ],
    rewardType: "accessory",
    rewardValue: "handshake_badge",
  },
  {
    id: "mentor",
    category: "social",
    name: "Mentor",
    description: "Aider des coequipiers",
    icon: "🧑‍🏫",
    tiers: [
      { tier: "bronze", threshold: 3, label: "Bronze" },
      { tier: "silver", threshold: 10, label: "Argent" },
      { tier: "gold", threshold: 25, label: "Or" },
    ],
    rewardType: "title",
    rewardValue: "Mentor",
  },
  {
    id: "star",
    category: "social",
    name: "Star",
    description: "Recevoir des reactions sur ses reponses",
    icon: "⭐",
    tiers: [
      { tier: "bronze", threshold: 10, label: "Bronze" },
      { tier: "silver", threshold: 50, label: "Argent" },
      { tier: "gold", threshold: 200, label: "Or" },
    ],
    rewardType: "effect",
    rewardValue: "sparkle",
  },
  {
    id: "public",
    category: "social",
    name: "Public",
    description: "Reagir aux reponses des autres",
    icon: "👏",
    tiers: [
      { tier: "bronze", threshold: 20, label: "Bronze" },
      { tier: "silver", threshold: 100, label: "Argent" },
      { tier: "gold", threshold: 300, label: "Or" },
    ],
    rewardType: "accessory",
    rewardValue: "clap_badge",
  },
  {
    id: "festival_star",
    category: "social",
    name: "Star du Festival",
    description: "Recolter des votes au Festival",
    icon: "🏆",
    tiers: [
      { tier: "bronze", threshold: 5, label: "Bronze" },
      { tier: "silver", threshold: 25, label: "Argent" },
      { tier: "gold", threshold: 100, label: "Or" },
    ],
    rewardType: "frame",
    rewardValue: "festival_laurel",
  },

  // Special (10)
  {
    id: "premier_pas",
    category: "special",
    name: "Premier Pas",
    description: "Completer sa premiere session",
    icon: "👣",
    tiers: [{ tier: "bronze", threshold: 1, label: "Unique" }],
    rewardType: "accessory",
    rewardValue: "first_step_badge",
  },
  {
    id: "explorateur",
    category: "special",
    name: "Explorateur",
    description: "Essayer tous les types de modules",
    icon: "🧭",
    tiers: [
      { tier: "bronze", threshold: 3, label: "Bronze" },
      { tier: "silver", threshold: 6, label: "Argent" },
      { tier: "gold", threshold: 8, label: "Or" },
    ],
    rewardType: "frame",
    rewardValue: "compass",
  },
  {
    id: "perfectionniste",
    category: "special",
    name: "Persévérant",
    description: "Recommencer ou améliorer une réponse",
    icon: "💎",
    tiers: [
      { tier: "bronze", threshold: 1, label: "Bronze" },
      { tier: "silver", threshold: 5, label: "Argent" },
      { tier: "gold", threshold: 20, label: "Or" },
    ],
    rewardType: "effect",
    rewardValue: "diamond_sparkle",
  },
  {
    id: "noctambule",
    category: "special",
    name: "Noctambule",
    description: "Jouer apres 20h",
    icon: "🌙",
    tiers: [
      { tier: "bronze", threshold: 1, label: "Bronze" },
      { tier: "silver", threshold: 5, label: "Argent" },
      { tier: "gold", threshold: 15, label: "Or" },
    ],
    rewardType: "accessory",
    rewardValue: "moon_badge",
  },
  {
    id: "speed_runner",
    category: "special",
    name: "Assidu",
    description: "Participer à tous les exercices d'un module",
    icon: "⏱️",
    tiers: [
      { tier: "bronze", threshold: 1, label: "Bronze" },
      { tier: "silver", threshold: 3, label: "Argent" },
      { tier: "gold", threshold: 10, label: "Or" },
    ],
    rewardType: "title",
    rewardValue: "Impliqué",
  },
  {
    id: "combo_master",
    category: "special",
    name: "Série en cours",
    description: "Répondre à 5+ questions d'affilée sans lâcher",
    icon: "🔥",
    tiers: [
      { tier: "bronze", threshold: 1, label: "Bronze" },
      { tier: "silver", threshold: 5, label: "Argent" },
      { tier: "gold", threshold: 15, label: "Or" },
    ],
    rewardType: "effect",
    rewardValue: "combo_fire",
  },
  {
    id: "mission_hero",
    category: "special",
    name: "Heros des Missions",
    description: "Completer des missions solo",
    icon: "🦸",
    tiers: [
      { tier: "bronze", threshold: 5, label: "Bronze" },
      { tier: "silver", threshold: 20, label: "Argent" },
      { tier: "gold", threshold: 50, label: "Or" },
    ],
    rewardType: "frame",
    rewardValue: "hero_shield",
  },
  {
    id: "cinephile",
    category: "special",
    name: "Cinephile",
    description: "Repondre a des questions cinema",
    icon: "🎞️",
    tiers: [
      { tier: "bronze", threshold: 10, label: "Bronze" },
      { tier: "silver", threshold: 30, label: "Argent" },
      { tier: "gold", threshold: 75, label: "Or" },
    ],
    rewardType: "accessory",
    rewardValue: "film_reel_badge",
  },
  {
    id: "critique",
    category: "special",
    name: "Critique",
    description: "Soumettre des entrees au Festival",
    icon: "📽️",
    tiers: [
      { tier: "bronze", threshold: 3, label: "Bronze" },
      { tier: "silver", threshold: 10, label: "Argent" },
      { tier: "gold", threshold: 25, label: "Or" },
    ],
    rewardType: "title",
    rewardValue: "Critique",
  },
  {
    id: "legende",
    category: "special",
    name: "Legende",
    description: "Atteindre le niveau Oscar",
    icon: "🏅",
    tiers: [{ tier: "gold", threshold: 1, label: "Legendaire" }],
    rewardType: "effect",
    rewardValue: "golden_aura",
  },
];

export const ACHIEVEMENT_MAP = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));

export const CATEGORIES: { id: AchievementCategory; label: string; icon: string }[] = [
  { id: "narration", label: "Narration", icon: "✍️" },
  { id: "vote", label: "Vote", icon: "🗳️" },
  { id: "expression", label: "Expression", icon: "🎤" },
  { id: "streak", label: "Regularite", icon: "🔥" },
  { id: "social", label: "Social", icon: "🤝" },
  { id: "special", label: "Special", icon: "⭐" },
];

export function getAchievementsByCategory(category: AchievementCategory): AchievementDef[] {
  return ACHIEVEMENTS.filter((a) => a.category === category);
}

export function getNextTier(
  achievement: AchievementDef,
  currentProgress: number,
): AchievementTierDef | null {
  for (const tier of achievement.tiers) {
    if (currentProgress < tier.threshold) return tier;
  }
  return null;
}

export function getCurrentTier(
  achievement: AchievementDef,
  currentProgress: number,
): AchievementTierDef | null {
  let current: AchievementTierDef | null = null;
  for (const tier of achievement.tiers) {
    if (currentProgress >= tier.threshold) current = tier;
  }
  return current;
}

export const TIER_COLORS: Record<AchievementTier, { bg: string; border: string; text: string }> = {
  bronze: { bg: "bg-amber-100", border: "border-amber-400", text: "text-amber-700" },
  silver: { bg: "bg-slate-100", border: "border-slate-400", text: "text-slate-700" },
  gold: { bg: "bg-yellow-100", border: "border-yellow-500", text: "text-yellow-700" },
};
