/**
 * Outfit bust SVGs — shoulders + upper torso worn below the DiceBear head.
 * Designed to fade into the card background, NOT a full body.
 * Matches the circular DiceBear avatar style with soft rounded shapes.
 */

interface OutfitSvgProps {
  outfit: string;
  color: string; // hex with #
  width?: number;
}

/* viewBox: 0 0 90 50 — wide for shoulders, short for bust only */

function TShirt({ color }: { color: string }) {
  return (
    <>
      <path d="M8 12 L18 4 L30 0 L60 0 L72 4 L82 12 L82 20 L70 18 L68 12 L60 8 L30 8 L22 12 L20 18 L8 20 Z" fill={color} />
      <path d="M20 18 L20 50 L70 50 L70 18 L62 12 L58 10 L32 10 L28 12 Z" fill={color} />
      <path d="M36 2 Q45 10 54 2" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1.2" />
    </>
  );
}

function Hoodie({ color }: { color: string }) {
  return (
    <>
      <path d="M30 -2 Q24 -2 20 2 L16 8 L18 10 L22 6 L30 2 L45 0 L60 2 L68 6 L72 10 L74 8 L70 2 Q66 -2 60 -2 Z" fill={color} opacity={0.6} />
      <path d="M6 12 L18 4 L30 0 L60 0 L72 4 L84 12 L84 22 L72 20 L70 14 L60 8 L30 8 L20 14 L18 20 L6 22 Z" fill={color} />
      <path d="M18 20 L18 50 L72 50 L72 20 L62 12 L28 12 Z" fill={color} />
      <path d="M32 32 L58 32 Q60 32 60 34 L60 44 Q60 46 58 46 L32 46 Q30 46 30 44 L30 34 Q30 32 32 32 Z" fill="rgba(0,0,0,0.06)" />
      <line x1="42" y1="4" x2="40" y2="14" stroke="rgba(0,0,0,0.08)" strokeWidth="0.7" />
      <line x1="48" y1="4" x2="50" y2="14" stroke="rgba(0,0,0,0.08)" strokeWidth="0.7" />
    </>
  );
}

function Veste({ color }: { color: string }) {
  return (
    <>
      <path d="M6 12 L18 4 L30 0 L60 0 L72 4 L84 12 L84 22 L72 20 L70 14 L60 8 L30 8 L20 14 L18 20 L6 22 Z" fill={color} />
      <path d="M18 20 L18 50 L42 50 L42 6 L28 10 Z" fill={color} />
      <path d="M72 20 L72 50 L48 50 L48 6 L62 10 Z" fill={color} />
      <path d="M42 6 L42 50 L48 50 L48 6" fill="rgba(255,255,255,0.1)" />
      <line x1="45" y1="4" x2="45" y2="50" stroke="rgba(0,0,0,0.12)" strokeWidth="1.2" />
      <path d="M36 0 L40 6 L45 8 L50 6 L54 0" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1.2" />
      <rect x="43.5" y="14" width="3" height="4" rx="1" fill="rgba(255,255,255,0.18)" />
    </>
  );
}

function Chemise({ color }: { color: string }) {
  return (
    <>
      <path d="M6 12 L18 4 L30 0 L60 0 L72 4 L84 12 L84 22 L72 20 L70 14 L60 8 L30 8 L20 14 L18 20 L6 22 Z" fill={color} />
      <path d="M18 20 L18 50 L72 50 L72 20 L62 12 L28 12 Z" fill={color} />
      <path d="M38 -2 L32 8 L42 14 L45 6 Z" fill={color} stroke="rgba(0,0,0,0.06)" strokeWidth="0.5" />
      <path d="M52 -2 L58 8 L48 14 L45 6 Z" fill={color} stroke="rgba(0,0,0,0.06)" strokeWidth="0.5" />
      <line x1="45" y1="14" x2="45" y2="50" stroke="rgba(0,0,0,0.05)" strokeWidth="0.7" />
      <circle cx="45" cy="22" r="1" fill="rgba(0,0,0,0.1)" />
      <circle cx="45" cy="30" r="1" fill="rgba(0,0,0,0.1)" />
      <circle cx="45" cy="38" r="1" fill="rgba(0,0,0,0.1)" />
      <circle cx="45" cy="46" r="1" fill="rgba(0,0,0,0.1)" />
    </>
  );
}

function Robe({ color }: { color: string }) {
  return (
    <>
      <path d="M22 6 L30 0 L45 -2 L60 0 L68 6 L64 10 L56 6 L45 4 L34 6 L26 10 Z" fill={color} />
      <path d="M22 6 L20 22 L45 26 L70 22 L68 6 L56 12 L45 14 L34 12 Z" fill={color} />
      <path d="M20 22 L10 50 L80 50 L70 22 L45 26 Z" fill={color} />
      <path d="M22 22 Q45 28 68 22" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.8" />
      <line x1="32" y1="28" x2="22" y2="50" stroke="rgba(0,0,0,0.04)" strokeWidth="0.6" />
      <line x1="45" y1="28" x2="45" y2="50" stroke="rgba(0,0,0,0.03)" strokeWidth="0.6" />
      <line x1="58" y1="28" x2="68" y2="50" stroke="rgba(0,0,0,0.04)" strokeWidth="0.6" />
    </>
  );
}

function Bomber({ color }: { color: string }) {
  return (
    <>
      <path d="M6 12 L18 4 L30 0 L60 0 L72 4 L84 12 L84 22 L72 20 L70 14 L60 8 L30 8 L20 14 L18 20 L6 22 Z" fill={color} />
      <path d="M18 20 L18 50 L42 50 L42 6 L28 10 Z" fill={color} />
      <path d="M72 20 L72 50 L48 50 L48 6 L62 10 Z" fill={color} />
      <rect x="32" y="0" width="26" height="5" rx="2" fill="rgba(0,0,0,0.1)" />
      <rect x="18" y="46" width="54" height="4" rx="1.5" fill="rgba(0,0,0,0.08)" />
      <line x1="20" y1="28" x2="70" y2="28" stroke="rgba(0,0,0,0.04)" strokeWidth="0.6" />
      <line x1="20" y1="38" x2="70" y2="38" stroke="rgba(0,0,0,0.04)" strokeWidth="0.6" />
    </>
  );
}

function Maillot({ color }: { color: string }) {
  return (
    <>
      <path d="M4 12 L16 4 L30 0 L60 0 L74 4 L86 12 L86 24 L74 22 L72 14 L60 8 L30 8 L18 14 L16 22 L4 24 Z" fill={color} />
      <path d="M16 22 L16 50 L74 50 L74 22 L64 14 L26 14 Z" fill={color} />
      <path d="M36 2 L45 14 L54 2" fill="rgba(0,0,0,0.05)" />
      <path d="M36 2 L45 14 L54 2" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="0.8" />
      <text x="45" y="38" textAnchor="middle" fontSize="14" fontWeight="bold" fill="rgba(255,255,255,0.15)" fontFamily="sans-serif">10</text>
      <line x1="6" y1="14" x2="16" y2="22" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
      <line x1="84" y1="14" x2="74" y2="22" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
    </>
  );
}

function Costume({ color }: { color: string }) {
  return (
    <>
      <path d="M6 12 L18 4 L30 0 L60 0 L72 4 L84 12 L84 22 L72 20 L70 14 L60 8 L30 8 L20 14 L18 20 L6 22 Z" fill={color} />
      <path d="M18 20 L18 50 L42 50 L42 4 L28 8 Z" fill={color} />
      <path d="M72 20 L72 50 L48 50 L48 4 L62 8 Z" fill={color} />
      <path d="M42 4 L42 50 L48 50 L48 4" fill="rgba(255,255,255,0.2)" />
      <path d="M38 -2 L32 8 L42 16 L45 6 Z" fill="rgba(0,0,0,0.05)" />
      <path d="M52 -2 L58 8 L48 16 L45 6 Z" fill="rgba(0,0,0,0.05)" />
      <path d="M44 8 L45 12 L46 8 L46.5 26 L45 30 L43.5 26 Z" fill="rgba(0,0,0,0.18)" />
      <circle cx="42" cy="36" r="1" fill="rgba(0,0,0,0.1)" />
    </>
  );
}

const OUTFIT_MAP: Record<string, React.FC<{ color: string }>> = {
  tshirt: TShirt,
  hoodie: Hoodie,
  veste: Veste,
  chemise: Chemise,
  robe: Robe,
  bomber: Bomber,
  maillot: Maillot,
  costume: Costume,
};

export function OutfitSvg({ outfit, color, width = 90 }: OutfitSvgProps) {
  const Component = OUTFIT_MAP[outfit];
  if (!Component) return null;

  const height = width * 0.56;
  return (
    <svg
      viewBox="0 -4 90 54"
      width={width}
      height={height}
      fill="none"
      style={{ display: "block" }}
    >
      <Component color={color} />
    </svg>
  );
}
