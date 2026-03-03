// ═══════════════════════════════════════════════════════════════
// BANLIEUWOOD — Design System Tokens v2
// "Le Studio de Production" — Dark-first · Cinema-grade
// Single source of truth for colors, typography, spacing, shadows.
// ═══════════════════════════════════════════════════════════════

// ─── Brand Colors ───────────────────────────────────────────────
export const colors = {
  // Orange Cinétique — action, création, énergie
  primary: {
    DEFAULT: "#FF6B35",
    50:  "#FFF3ED",
    100: "#FFE2D1",
    200: "#FFC4A3",
    300: "#FF9B6A",
    400: "#FF6B35",
    500: "#E85D26",
    600: "#C44B1A",
    700: "#9C3B15",
    800: "#7A3018",
    900: "#522111",
    950: "#2D1008",
  },

  // Gold — cinéma, prestige, achievement
  gold: {
    DEFAULT: "#D4A843",
    50:  "#FBF7EC",
    100: "#F5ECCE",
    200: "#EBDA9F",
    300: "#D4A843",
    400: "#C49735",
    500: "#A47C2A",
    600: "#836120",
    700: "#634A1A",
    800: "#4A3816",
    900: "#352912",
  },

  // Turquoise Électrique — feedback, validation, joueurs
  secondary: {
    DEFAULT: "#4ECDC4",
    50:  "#EDFBFA",
    100: "#D0F5F2",
    200: "#A4EBE5",
    300: "#4ECDC4",
    400: "#38B5AD",
    500: "#2B9A93",
    600: "#237C77",
    700: "#1D635F",
    800: "#194E4B",
    900: "#0F3331",
  },

  // Violet — IA, imagination, magie
  accent: {
    DEFAULT: "#8B5CF6",
    50:  "#F5F0FF",
    100: "#EDE5FF",
    200: "#D9C5FE",
    300: "#B794FC",
    400: "#8B5CF6",
    500: "#7C3AED",
    600: "#6D28D9",
    700: "#5B21B6",
    800: "#4C1D95",
    900: "#3B1578",
  },

  // Pink — émotion
  emotion: {
    DEFAULT: "#EC4899",
    50:  "#FDF2F8",
    100: "#FCE7F3",
    200: "#FBCFE8",
    300: "#F9A8D4",
    400: "#EC4899",
    500: "#DB2777",
    600: "#BE185D",
  },

  // Amber — warning, cinéma
  amber: {
    DEFAULT: "#F59E0B",
    50:  "#FFFBEB",
    100: "#FEF3C7",
    200: "#FDE68A",
    300: "#FCD34D",
    400: "#F59E0B",
    500: "#D97706",
    600: "#B45309",
  },

  // Green — terminé, succès
  success: {
    DEFAULT: "#10B981",
    50:  "#ECFDF5",
    100: "#D1FAE5",
    200: "#A7F3D0",
    300: "#6EE7B7",
    400: "#10B981",
    500: "#059669",
    600: "#047857",
  },

  // Red — erreur, danger
  danger: {
    DEFAULT: "#EF4444",
    50:  "#FEF2F2",
    100: "#FEE2E2",
    200: "#FECACA",
    400: "#EF4444",
    500: "#DC2626",
    600: "#B91C1C",
  },

  // Studio Neutrals — Deep Slate palette
  neutral: {
    0:   "#FFFFFF",
    50:  "#F5F5F7",   // ink (brightest text)
    100: "#E8EAED",   // heading
    200: "#B8BCC4",   // body text
    300: "#6B7280",   // muted
    400: "#4A4F58",   // placeholder
    500: "#2A2D35",   // subtle
    600: "#15181F",   // elevated surface
    700: "#0E1017",   // card surface
    800: "#08090E",   // background (Electric Studio)
    900: "#030406",   // deepest
    950: "#020304",   // abyss
  },
} as const;

// ─── Typography ────────────────────────────────────────────────
export const typography = {
  family: {
    display: "var(--font-cinema), 'Bebas Neue', sans-serif",
    body:    "var(--font-jakarta), 'Plus Jakarta Sans', system-ui, sans-serif",
    script:  "var(--font-courier-prime), 'Courier Prime', 'Courier New', monospace",
    mono:    "var(--font-courier-prime), 'Courier Prime', monospace",
  },
  size: {
    xs:    "0.75rem",   // 12px
    sm:    "0.8125rem", // 13px
    base:  "0.875rem",  // 14px
    md:    "1rem",      // 16px
    lg:    "1.125rem",  // 18px
    xl:    "1.25rem",   // 20px
    "2xl": "1.5rem",    // 24px
    "3xl": "2rem",      // 32px
    "4xl": "2.5rem",    // 40px
    "5xl": "3.5rem",    // 56px
    hero:  "4.5rem",    // 72px
  },
  weight: {
    normal:   "400",
    medium:   "500",
    semibold: "600",
    bold:     "700",
    black:    "800",
  },
  leading: {
    tight:   "1.1",
    snug:    "1.3",
    normal:  "1.5",
    relaxed: "1.65",
  },
} as const;

// ─── Spacing Scale (4px/8px grid) ────────────────────────────
export const spacing = {
  page:    { x: "1rem", y: "2rem" },     // 16/32 mobile
  pageSm:  { x: "1.5rem", y: "2.5rem" }, // 24/40 sm+
  pageLg:  { x: "2rem", y: "3rem" },     // 32/48 lg+
  card:    "1.5rem",    // 24px
  cardSm:  "1rem",     // 16px
  section: "4rem",     // 64px between sections
  gap: {
    xs: "0.25rem",  // 4px
    sm: "0.5rem",   // 8px
    md: "0.75rem",  // 12px
    lg: "1rem",     // 16px
    xl: "1.5rem",   // 24px
    "2xl": "2rem",  // 32px
  },
} as const;

// ─── Radius (12px base) ──────────────────────────────────────
export const radius = {
  sm:   "0.25rem",  // 4px  — micro elements
  md:   "0.5rem",   // 8px  — inputs, small cards
  lg:   "0.75rem",  // 12px — buttons, standard cards
  xl:   "1rem",     // 16px — large cards
  "2xl": "1.5rem",  // 24px — modals, hero cards
  full: "9999px",   // pills, avatars
} as const;

// ─── Shadows (dark, cinematic) ───────────────────────────────
export const shadows = {
  sm:   "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.25)",
  md:   "0 4px 16px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)",
  lg:   "0 8px 32px rgba(0,0,0,0.55), 0 4px 8px rgba(0,0,0,0.3)",
  xl:   "0 16px 48px rgba(0,0,0,0.6), 0 8px 16px rgba(0,0,0,0.3)",
  glow: {
    primary:   "0 0 24px rgba(255,107,53,0.3), 0 4px 16px rgba(255,107,53,0.2)",
    gold:      "0 0 24px rgba(212,168,67,0.2), 0 4px 16px rgba(212,168,67,0.15)",
    secondary: "0 0 24px rgba(78,205,196,0.2), 0 4px 16px rgba(78,205,196,0.15)",
    accent:    "0 0 24px rgba(139,92,246,0.2), 0 4px 16px rgba(139,92,246,0.15)",
  },
} as const;

// ─── Animation ────────────────────────────────────────────────
export const animation = {
  duration: {
    fast:    "150ms",
    normal:  "250ms",
    slow:    "400ms",
    slower:  "600ms",
  },
  easing: {
    default: "cubic-bezier(0.4, 0, 0.2, 1)",
    in:      "cubic-bezier(0.4, 0, 1, 1)",
    out:     "cubic-bezier(0, 0, 0.2, 1)",
    bounce:  "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
} as const;

// ─── Gradients ────────────────────────────────────────────────
export const gradients = {
  primary:    `linear-gradient(135deg, ${colors.primary.DEFAULT}, ${colors.primary[500]})`,
  gold:       `linear-gradient(135deg, ${colors.gold.DEFAULT}, ${colors.gold[500]})`,
  cinema:     `linear-gradient(135deg, ${colors.primary.DEFAULT}, ${colors.gold.DEFAULT})`,
  turquoise:  `linear-gradient(135deg, ${colors.secondary.DEFAULT}, ${colors.secondary[500]})`,
  violet:     `linear-gradient(135deg, ${colors.accent.DEFAULT}, ${colors.accent[500]})`,
  // Studio surfaces — Deep Slate
  surface:    "linear-gradient(135deg, #0E1017, #15181F)",
  elevated:   "linear-gradient(135deg, #15181F, #1A1D24)",
  // Ambient backgrounds — stronger presence
  ambient:    "radial-gradient(ellipse at 15% 10%, rgba(255,107,53,0.08), transparent 50%), radial-gradient(ellipse at 85% 80%, rgba(78,205,196,0.06), transparent 50%)",
} as const;

// ─── Z-Index Scale ────────────────────────────────────────────
export const zIndex = {
  base:    0,
  card:    1,
  sticky:  10,
  header:  20,
  overlay: 30,
  modal:   40,
  toast:   50,
  grain:   9999,
} as const;

// ─── Breakpoints ─────────────────────────────────────────────
export const breakpoints = {
  sm:  "640px",
  md:  "768px",
  lg:  "1024px",
  xl:  "1280px",
} as const;

// ─── Helper: module color variants ───────────────────────────
export function moduleColorVars(color: string) {
  return {
    bg:         `${color}12`,
    bgStrong:   `${color}25`,
    bgHover:    `${color}18`,
    border:     `${color}20`,
    borderStrong: `${color}40`,
    text:       color,
    glow:       `0 0 24px ${color}30`,
    gradient:   `linear-gradient(135deg, ${color}, ${color}CC)`,
    gradientBg: `linear-gradient(135deg, ${color}15, ${color}05)`,
  };
}
