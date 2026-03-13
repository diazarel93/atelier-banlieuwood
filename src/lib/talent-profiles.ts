/**
 * Cartographie des Talents Créatifs — 6 profils (Adrian)
 *
 * Derived from O-I-E scores using relative thresholds.
 * Maps to the 5 M6 mission roles for backward compatibility.
 */

// ═══════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════

export type TalentProfileKey =
  | "imaginatif"
  | "observateur"
  | "narrateur"
  | "metteur_en_scene"
  | "acteur"
  | "organisateur";

/** Legacy 5-profile keys from M6 mission system */
export type LegacyProfileKey =
  | "acteur"
  | "creatif"
  | "detective"
  | "provocateur"
  | "stratege";

export interface TalentProfileDef {
  key: TalentProfileKey;
  label: string;
  emoji: string;
  color: string;
  description: string;
}

// ═══════════════════════════════════════════════════════
// 6 Creative Talent Profiles
// ═══════════════════════════════════════════════════════

export const TALENT_PROFILES: Record<TalentProfileKey, TalentProfileDef> = {
  imaginatif: {
    key: "imaginatif",
    label: "Imaginatif",
    emoji: "🎨",
    color: "#9B59B6",
    description: "Déborde d'idées et d'univers originaux",
  },
  observateur: {
    key: "observateur",
    label: "Observateur",
    emoji: "🔍",
    color: "#3498DB",
    description: "Analyse, repère les détails, comprend les mécanismes",
  },
  narrateur: {
    key: "narrateur",
    label: "Narrateur",
    emoji: "📖",
    color: "#E67E22",
    description: "Raconte, structure et donne vie aux histoires",
  },
  metteur_en_scene: {
    key: "metteur_en_scene",
    label: "Metteur en scène",
    emoji: "🎬",
    color: "#E54D2E",
    description: "Organise la vision d'ensemble et dirige l'action",
  },
  acteur: {
    key: "acteur",
    label: "Acteur",
    emoji: "🎭",
    color: "#F39C12",
    description: "S'exprime, incarne et transmet les émotions",
  },
  organisateur: {
    key: "organisateur",
    label: "Organisateur",
    emoji: "🧩",
    color: "#27AE60",
    description: "Planifie, coordonne et assure la cohérence",
  },
};

// ═══════════════════════════════════════════════════════
// Derivation from O-I-E scores
// ═══════════════════════════════════════════════════════

/**
 * Derives a 6-profile talent key from O-I-E scores.
 *
 * Logic (relative thresholds):
 * - I dominant & I-O gap ≥ 10 → imaginatif
 * - O dominant & O-I gap ≥ 10 → observateur
 * - I ≈ E (gap < 10) & both > O → narrateur
 * - O ≈ E (gap < 10) & both > I → metteur_en_scene
 * - E dominant & E-I gap ≥ 10 → acteur
 * - O ≈ I ≈ E (all within 10) → organisateur
 * - Fallback → organisateur
 */
export function deriveTalentProfile(oie: {
  O: number;
  I: number;
  E: number;
}): TalentProfileKey {
  const { O, I, E } = oie;

  // All balanced → organisateur
  if (Math.abs(O - I) < 10 && Math.abs(I - E) < 10 && Math.abs(O - E) < 10) {
    return "organisateur";
  }

  // I dominant & clearly above O → imaginatif
  if (I >= O && I >= E && I - O >= 10) {
    return "imaginatif";
  }

  // O dominant & clearly above I → observateur
  if (O >= I && O >= E && O - I >= 10) {
    return "observateur";
  }

  // I ≈ E & both above O → narrateur
  if (Math.abs(I - E) < 10 && I > O && E > O) {
    return "narrateur";
  }

  // O ≈ E & both above I → metteur_en_scene
  if (Math.abs(O - E) < 10 && O > I && E > I) {
    return "metteur_en_scene";
  }

  // E dominant & clearly above I → acteur
  if (E >= O && E >= I && E - I >= 10) {
    return "acteur";
  }

  // Fallback
  return "organisateur";
}

// ═══════════════════════════════════════════════════════
// Resolution: any key (old 5 or new 6) → TalentProfileDef
// ═══════════════════════════════════════════════════════

/** Maps legacy 5-profile keys to the new 6-profile system */
const LEGACY_TO_TALENT: Record<LegacyProfileKey, TalentProfileKey> = {
  acteur: "acteur",
  creatif: "imaginatif",
  detective: "observateur",
  provocateur: "narrateur",
  stratege: "organisateur",
};

/**
 * Resolves any profile key (old 5-key or new 6-key) to a TalentProfileDef.
 * Returns null if the key is unknown.
 */
export function resolveTalentProfile(
  key: string | null | undefined,
): TalentProfileDef | null {
  if (!key) return null;

  // Direct match on new 6-profile keys
  if (key in TALENT_PROFILES) {
    return TALENT_PROFILES[key as TalentProfileKey];
  }

  // Legacy 5-profile key → remap
  if (key in LEGACY_TO_TALENT) {
    const mapped = LEGACY_TO_TALENT[key as LegacyProfileKey];
    return TALENT_PROFILES[mapped];
  }

  return null;
}

// ═══════════════════════════════════════════════════════
// Talent → M6 Mission Role mapping
// ═══════════════════════════════════════════════════════

/** Maps 6 talent profile keys to 5 M6 mission role keys */
export const TALENT_TO_MISSION_ROLE: Record<TalentProfileKey, string> = {
  imaginatif: "description",
  observateur: "coherence",
  narrateur: "dialogue",
  metteur_en_scene: "structure",
  acteur: "tension",
  organisateur: "structure",
};
