/**
 * Talent profiles — previously derived from OIE scoring.
 * OIE has been removed (R2 doctrine compliance).
 * Creative profiles from Module 6 (M6 roles) are still valid.
 * This stub preserves the API for components that display creative_profile.
 */

export interface TalentProfileDef {
  key: string;
  label: string;
  emoji: string;
  description: string;
  color: string;
}

const LEGACY_PROFILES: Record<string, TalentProfileDef> = {
  // M6 curriculum roles (authorized)
  acteur: { key: "acteur", label: "Acteur", emoji: "\uD83C\uDFAD", description: "Aime incarner les personnages", color: "#FF6B35" },
  creatif: { key: "creatif", label: "Créatif", emoji: "\uD83C\uDFA8", description: "Déborde d'idées originales", color: "#8B5CF6" },
  detective: { key: "detective", label: "Détective", emoji: "\uD83D\uDD0D", description: "Observe et analyse les détails", color: "#4ECDC4" },
  provocateur: { key: "provocateur", label: "Provocateur", emoji: "\u26A1", description: "Aime bousculer les idées reçues", color: "#EF6461" },
  stratege: { key: "stratege", label: "Stratège", emoji: "\u265F\uFE0F", description: "Planifie et organise", color: "#10B981" },
};

/**
 * Resolve a creative_profile key to its definition.
 * Returns null if the key is not a recognized curriculum profile.
 */
export function resolveTalentProfile(key?: string | null): TalentProfileDef | null {
  if (!key) return null;
  return LEGACY_PROFILES[key] ?? null;
}
