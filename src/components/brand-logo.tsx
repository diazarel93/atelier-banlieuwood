"use client";

import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════
   BANLIEUWOOD — Brand Identity System
   Logomark: Film clapper + "BW" monogram, geometric & modern
   Exports: BrandMark, BrandLogo, BrandWordmark
   ═══════════════════════════════════════════════════════════════ */

type LogoSize = "sm" | "md" | "lg" | "xl";
type LogoColor = "primary" | "cinema" | "white" | "muted";

const SIZE_MAP: Record<LogoSize, number> = {
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
};

const WORDMARK_SCALE: Record<LogoSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
  xl: "text-2xl",
};

const GAP_MAP: Record<LogoSize, string> = {
  sm: "gap-1.5",
  md: "gap-2",
  lg: "gap-3",
  xl: "gap-3.5",
};

function getColorProps(color: LogoColor) {
  switch (color) {
    case "primary":
      return { fill: "#FF6B35", gradient: false };
    case "cinema":
      return { fill: "url(#bw-gradient-cinema)", gradient: true };
    case "white":
      return { fill: "#E8EAED", gradient: false };
    case "muted":
      return { fill: "#7D828A", gradient: false };
  }
}

/* ── Animated SVG Logomark ──
   Clean geometric clapperboard with diagonal stripes.
   Instantly recognizable at any size (24px → 64px).
   ────────────────────────────────────────────────────────────────── */

interface BrandMarkProps {
  size?: LogoSize;
  color?: LogoColor;
  className?: string;
  animated?: boolean;
}

export function BrandMark({ size = "md", color = "cinema", className, animated = true }: BrandMarkProps) {
  const px = SIZE_MAP[size];
  const { fill } = getColorProps(color);

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("bw-logomark shrink-0", animated && "bw-logo-animated", className)}
      aria-label="Banlieuwood logomark"
      role="img"
    >
      <defs>
        <linearGradient id="bw-gradient-cinema" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF6B35" />
          <stop offset="100%" stopColor="#D4A843" />
        </linearGradient>
        <clipPath id="bw-arm-clip">
          <rect x="6" y="4" width="52" height="14" rx="3" />
        </clipPath>
      </defs>

      {/* ── Clapper Arm with classic diagonal stripes ── */}
      <g className="bw-clapper-arm" clipPath="url(#bw-arm-clip)">
        <rect x="6" y="4" width="52" height="14" fill={fill} />
        {/* Diagonal stripes — the iconic clapperboard identifier */}
        <path d="M10 18L16 18L22 4L16 4Z" fill="#08090E" opacity="0.85" />
        <path d="M24 18L30 18L36 4L30 4Z" fill="#08090E" opacity="0.85" />
        <path d="M38 18L44 18L50 4L44 4Z" fill="#08090E" opacity="0.85" />
        <path d="M52 18L58 18L64 4L58 4Z" fill="#08090E" opacity="0.85" />
      </g>

      {/* ── Hinge pivots ── */}
      <circle cx="9" cy="18" r="3" fill={fill} />
      <circle cx="55" cy="18" r="3" fill={fill} />

      {/* ── Slate Body ── */}
      <rect x="6" y="21" width="52" height="39" rx="4" fill={fill} />

      {/* ── Inner frame (the "screen") ── */}
      <rect x="10" y="25" width="44" height="31" rx="2.5" fill="#08090E" />

      {/* ── Play triangle — subtle cinema accent ── */}
      <path d="M27 35L27 47L39 41Z" fill={fill} opacity="0.12" />
    </svg>
  );
}

/* ── Wordmark: "BANLIEUWOOD" in cinema display font ── */

interface BrandWordmarkProps {
  size?: LogoSize;
  color?: LogoColor;
  className?: string;
}

export function BrandWordmark({ size = "md", color = "cinema", className }: BrandWordmarkProps) {
  const textClass = cn(
    "bw-display font-bold tracking-wider select-none",
    WORDMARK_SCALE[size],
    color === "cinema" && "text-gradient-cinema",
    color === "primary" && "text-bw-primary",
    color === "white" && "text-bw-heading",
    color === "muted" && "text-bw-muted",
    className,
  );

  return <span className={textClass}>BANLIEUWOOD</span>;
}

/* ── Full Brand Logo: Mark + Wordmark side by side ── */

interface BrandLogoProps {
  size?: LogoSize;
  color?: LogoColor;
  className?: string;
  animated?: boolean;
  /** Show only the icon (no wordmark) */
  iconOnly?: boolean;
  /** @deprecated Use `color` instead. Kept for backward compatibility. */
  variant?: "primary" | "cinema";
}

export function BrandLogo({
  size = "md",
  color,
  className,
  animated = true,
  iconOnly = false,
  variant,
}: BrandLogoProps) {
  // Backward compat: resolve `variant` into `color` if color is not explicitly set
  const resolvedColor: LogoColor =
    color ?? (variant === "cinema" ? "cinema" : variant === "primary" ? "primary" : "cinema");

  if (iconOnly) {
    return <BrandMark size={size} color={resolvedColor} className={className} animated={animated} />;
  }

  return (
    <span className={cn("inline-flex items-center", GAP_MAP[size], className)}>
      <BrandMark size={size} color={resolvedColor} animated={animated} />
      <BrandWordmark size={size} color={resolvedColor} />
    </span>
  );
}

/* ══════════════════════════════════════════════════
   CSS Keyframes (injected via style tag on mount)
   Clapper arm "snap" on load, glow pulse on hover
   ══════════════════════════════════════════════════ */

const LOGO_STYLES = `
/* ── Clapper arm snap animation on load ── */
.bw-logo-animated .bw-clapper-arm {
  transform-origin: 9px 18px;
  animation: bw-clapper-snap 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both;
}

@keyframes bw-clapper-snap {
  0% {
    transform: rotate(-20deg);
    opacity: 0.5;
  }
  60% {
    transform: rotate(1.5deg);
  }
  100% {
    transform: rotate(0deg);
    opacity: 1;
  }
}

/* ── Subtle scale + glow on hover ── */
.bw-logo-animated {
  transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1),
              filter 300ms ease;
}
.bw-logo-animated:hover {
  transform: scale(1.06);
  filter: drop-shadow(0 0 12px rgba(255, 107, 53, 0.35));
}
`;

/* Inject styles once via a tiny component rendered alongside */
let stylesInjected = false;

export function BrandStyles() {
  if (typeof window === "undefined") return null;
  if (stylesInjected) return null;
  stylesInjected = true;

  return <style dangerouslySetInnerHTML={{ __html: LOGO_STYLES }} />;
}

/* ── Default export for backward compatibility ── */

export default function BrandLogoDefault({ variant = "primary" }: { variant?: "primary" | "cinema" }) {
  return (
    <>
      <BrandStyles />
      <BrandLogo size="md" color={variant === "cinema" ? "cinema" : "primary"} />
    </>
  );
}
