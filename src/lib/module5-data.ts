// ============================================================
// Module 2 "Émotion Cachée" — Catalogues statiques
// ============================================================

// ── Content Catalog (20 items for the checklist) ──

export interface ContentItem {
  key: string;
  label: string;
  type: "film" | "series" | "anime" | "game" | "other";
  emoji: string;
}

export const CONTENT_CATALOG: ContentItem[] = [
  { key: "squid-game", label: "Squid Game", type: "series", emoji: "🦑" },
  { key: "one-piece", label: "One Piece", type: "anime", emoji: "🏴‍☠️" },
  { key: "spider-verse", label: "Spider-Verse", type: "film", emoji: "🕷️" },
  { key: "stranger-things", label: "Stranger Things", type: "series", emoji: "🔦" },
  { key: "naruto", label: "Naruto", type: "anime", emoji: "🍥" },
  { key: "harry-potter", label: "Harry Potter", type: "film", emoji: "⚡" },
  { key: "demon-slayer", label: "Demon Slayer", type: "anime", emoji: "🗡️" },
  { key: "black-panther", label: "Black Panther", type: "film", emoji: "🐾" },
  { key: "mercredi", label: "Mercredi", type: "series", emoji: "🖤" },
  { key: "attack-on-titan", label: "L'Attaque des Titans", type: "anime", emoji: "⚔️" },
  { key: "encanto", label: "Encanto", type: "film", emoji: "🦋" },
  { key: "the-last-of-us", label: "The Last of Us", type: "series", emoji: "🍄" },
  { key: "jujutsu-kaisen", label: "Jujutsu Kaisen", type: "anime", emoji: "👁️" },
  { key: "top-gun", label: "Top Gun: Maverick", type: "film", emoji: "✈️" },
  { key: "euphoria", label: "Euphoria", type: "series", emoji: "💊" },
  { key: "dragon-ball", label: "Dragon Ball", type: "anime", emoji: "🐉" },
  { key: "hunger-games", label: "Hunger Games", type: "film", emoji: "🏹" },
  { key: "casa-de-papel", label: "La Casa de Papel", type: "series", emoji: "🎭" },
  { key: "minecraft", label: "Minecraft (le film)", type: "film", emoji: "⛏️" },
  { key: "my-hero-academia", label: "My Hero Academia", type: "anime", emoji: "💪" },
];

const CONTENT_KEYS = new Set(CONTENT_CATALOG.map((c) => c.key));
export function isValidContentKey(key: string): boolean {
  return CONTENT_KEYS.has(key);
}

// ── Emotions (5) ──

export interface Emotion {
  key: string;
  label: string;
  color: string;
  desc: string;
}

export const EMOTIONS: Emotion[] = [
  { key: "exclusion", label: "Peur d'être exclu", color: "#8B5CF6", desc: "Se sentir rejeté, invisible" },
  { key: "injustice", label: "Colère face à une injustice", color: "#EF4444", desc: "Quelque chose de profondément injuste" },
  { key: "honte", label: "Honte après une erreur", color: "#F59E0B", desc: "Vouloir disparaître" },
  { key: "jalousie", label: "Jalousie envers un ami", color: "#10B981", desc: "Envier ce que l'autre a" },
  { key: "joie_fragile", label: "Joie fragile", color: "#EC4899", desc: "Un bonheur qui pourrait s'effondrer" },
];

const EMOTION_KEYS = new Set(EMOTIONS.map((e) => e.key));
export function isValidEmotion(key: string): boolean {
  return EMOTION_KEYS.has(key);
}

// ── Scene Elements (25, 4 tiers) ──

export interface SceneElement {
  key: string;
  label: string;
  tier: 0 | 1 | 2 | 3;
  cost: number;   // tokens
  slots: number;  // always 1
}

export const SCENE_ELEMENTS: SceneElement[] = [
  // Tier 0 — gratuit (0 jeton, 1 emplacement)
  { key: "dialogue", label: "Dialogue", tier: 0, cost: 0, slots: 1 },
  { key: "silence", label: "Silence", tier: 0, cost: 0, slots: 1 },
  { key: "gros-plan", label: "Gros plan", tier: 0, cost: 0, slots: 1 },
  { key: "ralenti", label: "Ralenti", tier: 0, cost: 0, slots: 1 },
  { key: "objet-symbolique", label: "Petit objet symbolique", tier: 0, cost: 0, slots: 1 },

  // Tier 1 — 1 jeton
  { key: "mensonge", label: "Mensonge", tier: 1, cost: 1, slots: 1 },
  { key: "secret-cache", label: "Secret caché", tier: 1, cost: 1, slots: 1 },
  { key: "revelation", label: "Révélation", tier: 1, cost: 1, slots: 1 },
  { key: "conflit-verbal", label: "Conflit verbal", tier: 1, cost: 1, slots: 1 },
  { key: "rivalite-explicite", label: "Rivalité explicite", tier: 1, cost: 1, slots: 1 },

  // Tier 2 — 2 jetons
  { key: "nuit", label: "Tournage de nuit", tier: 2, cost: 2, slots: 1 },
  { key: "musique", label: "Musique marquée", tier: 2, cost: 2, slots: 1 },
  { key: "perso-secondaire", label: "Personnage secondaire", tier: 2, cost: 2, slots: 1 },
  { key: "figurants", label: "Figurants", tier: 2, cost: 2, slots: 1 },
  { key: "vehicule", label: "Véhicule / déplacement", tier: 2, cost: 2, slots: 1 },

  // Tier 3 — 3 jetons
  { key: "explosion", label: "Explosion", tier: 3, cost: 3, slots: 1 },
  { key: "accident", label: "Accident majeur", tier: 3, cost: 3, slots: 1 },
  { key: "effet-special", label: "Effet spécial", tier: 3, cost: 3, slots: 1 },
  { key: "cascade", label: "Cascade", tier: 3, cost: 3, slots: 1 },
  { key: "changement-epoque", label: "Changement d'époque", tier: 3, cost: 3, slots: 1 },
];

const ELEMENT_KEYS = new Set(SCENE_ELEMENTS.map((e) => e.key));
export function isValidElement(key: string): boolean {
  return ELEMENT_KEYS.has(key);
}

export function getElement(key: string): SceneElement | undefined {
  return SCENE_ELEMENTS.find((e) => e.key === key);
}

// ── Constraints ──

export const MAX_SLOTS = 5;
export const MAX_TOKENS = 8;
export const MIN_CHECKLIST = 3;

// ── Tier colors for UI ──
export const TIER_COLORS: Record<number, string> = {
  0: "#4ECDC4",  // teal — free
  1: "#F59E0B",  // amber
  2: "#FF6B35",  // orange
  3: "#EF4444",  // red — expensive
};

export const TIER_LABELS: Record<number, string> = {
  0: "Gratuit",
  1: "1 jeton",
  2: "2 jetons",
  3: "3 jetons",
};
