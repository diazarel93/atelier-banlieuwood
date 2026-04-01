"use client";

/**
 * Layered SVG avatar builder — a real character face built from composable SVG parts.
 * viewBox is 200x200, each layer is positioned absolutely within it.
 */

interface AvatarSVGProps {
  skin: string;
  hair: string;
  eyes: string;
  accessory: string;
  size?: number;
  className?: string;
}

// ── Skin tone palette ──
const SKIN_COLORS: Record<string, { base: string; shadow: string }> = {
  clair: { base: "#FDDCB5", shadow: "#F0C8A0" },
  medium: { base: "#D4A574", shadow: "#C49060" },
  fonce: { base: "#8B5E3C", shadow: "#7A4F30" },
  mate: { base: "#B07D56", shadow: "#9D6B45" },
};

// ── Hair color palette ──
const HAIR_COLORS: Record<string, { main: string; highlight: string }> = {
  court: { main: "#3D2314", highlight: "#5A3A2A" },
  long: { main: "#3D2314", highlight: "#5A3A2A" },
  boucle: { main: "#3D2314", highlight: "#6B4530" },
  tresse: { main: "#1A1A2E", highlight: "#2E2E4A" },
  rase: { main: "#4A4A4A", highlight: "#6A6A6A" },
  colore: { main: "var(--color-bw-violet)", highlight: "#A78BFA" },
};

// ── Eye color palette ──
const EYE_COLORS: Record<string, { iris: string; pupil: string }> = {
  ronds: { iris: "#4A3728", pupil: "#1A1A1A" },
  amande: { iris: "#2D5016", pupil: "#1A1A1A" },
  perçants: { iris: "#1E40AF", pupil: "#0F172A" },
  doux: { iris: "#78716C", pupil: "#292524" },
};

export function AvatarSVG({ skin, hair, eyes, accessory, size = 120, className }: AvatarSVGProps) {
  const s = SKIN_COLORS[skin] || SKIN_COLORS.medium;
  const h = HAIR_COLORS[hair] || HAIR_COLORS.court;
  const e = EYE_COLORS[eyes] || EYE_COLORS.ronds;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circle */}
      <circle cx="100" cy="100" r="96" fill="rgba(6,182,212,0.08)" stroke="rgba(6,182,212,0.2)" strokeWidth="2" />

      {/* Neck */}
      <rect x="82" y="148" width="36" height="24" rx="8" fill={s.base} />

      {/* Shoulders hint */}
      <ellipse cx="100" cy="184" rx="52" ry="18" fill={s.shadow} opacity="0.5" />

      {/* Head shape */}
      <ellipse cx="100" cy="100" rx="54" ry="60" fill={s.base} />
      {/* Face shadow */}
      <ellipse cx="100" cy="108" rx="46" ry="48" fill={s.shadow} opacity="0.15" />

      {/* Ears */}
      <ellipse cx="46" cy="100" rx="8" ry="12" fill={s.base} />
      <ellipse cx="46" cy="100" rx="5" ry="8" fill={s.shadow} opacity="0.3" />
      <ellipse cx="154" cy="100" rx="8" ry="12" fill={s.base} />
      <ellipse cx="154" cy="100" rx="5" ry="8" fill={s.shadow} opacity="0.3" />

      {/* ── HAIR ── */}
      <HairLayer style={hair} color={h.main} highlight={h.highlight} />

      {/* ── EYES ── */}
      <EyesLayer style={eyes} iris={e.iris} pupil={e.pupil} />

      {/* Nose */}
      <path d="M98 108 Q100 116 102 108" stroke={s.shadow} strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Mouth — slight smile */}
      <path d="M86 126 Q100 136 114 126" stroke={s.shadow} strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Eyebrows */}
      <path d="M70 78 Q80 72 90 76" stroke={h.main} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M110 76 Q120 72 130 78" stroke={h.main} strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* ── ACCESSORY ── */}
      <AccessoryLayer type={accessory} skinColor={s.base} />
    </svg>
  );
}

// ── Hair styles ──
function HairLayer({ style, color, highlight }: { style: string; color: string; highlight: string }) {
  switch (style) {
    case "court":
      return (
        <g>
          {/* Short hair — clean crop */}
          <path
            d="M50 90 Q50 42 100 38 Q150 42 150 90 Q148 72 130 60 Q110 52 100 52 Q90 52 70 60 Q52 72 50 90Z"
            fill={color}
          />
          <path d="M58 82 Q60 55 100 48 Q130 52 138 70" stroke={highlight} strokeWidth="2" fill="none" opacity="0.4" />
        </g>
      );
    case "long":
      return (
        <g>
          {/* Long hair — flowing down */}
          <path
            d="M46 90 Q44 42 100 36 Q156 42 154 90 Q154 72 140 58 Q120 46 100 46 Q80 46 60 58 Q46 72 46 90Z"
            fill={color}
          />
          {/* Side hair flowing down */}
          <path d="M46 90 Q42 120 44 148 Q46 156 52 152 Q54 130 50 100Z" fill={color} />
          <path d="M154 90 Q158 120 156 148 Q154 156 148 152 Q146 130 150 100Z" fill={color} />
          <path
            d="M54 75 Q60 50 100 44 Q135 48 144 68"
            stroke={highlight}
            strokeWidth="2.5"
            fill="none"
            opacity="0.3"
          />
        </g>
      );
    case "boucle":
      return (
        <g>
          {/* Curly hair — rounded puffs */}
          <path
            d="M44 92 Q42 38 100 32 Q158 38 156 92 Q155 70 135 55 Q115 42 100 42 Q85 42 65 55 Q45 70 44 92Z"
            fill={color}
          />
          {/* Curly texture dots */}
          {[
            [56, 56],
            [72, 44],
            [90, 38],
            [110, 38],
            [128, 44],
            [144, 56],
            [48, 72],
            [60, 50],
            [80, 40],
            [120, 40],
            [140, 50],
            [152, 72],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="6" fill={highlight} opacity="0.3" />
          ))}
        </g>
      );
    case "tresse":
      return (
        <g>
          {/* Braids / cornrows */}
          <path
            d="M48 90 Q46 42 100 36 Q154 42 152 90 Q150 70 134 56 Q114 44 100 44 Q86 44 66 56 Q50 70 48 90Z"
            fill={color}
          />
          {/* Braid lines */}
          <path d="M62 48 L56 100 L52 140" stroke={highlight} strokeWidth="2" fill="none" opacity="0.4" />
          <path d="M80 42 L76 85 L74 130" stroke={highlight} strokeWidth="2" fill="none" opacity="0.4" />
          <path d="M100 38 L100 80" stroke={highlight} strokeWidth="2" fill="none" opacity="0.4" />
          <path d="M120 42 L124 85 L126 130" stroke={highlight} strokeWidth="2" fill="none" opacity="0.4" />
          <path d="M138 48 L144 100 L148 140" stroke={highlight} strokeWidth="2" fill="none" opacity="0.4" />
          {/* Braid tips */}
          <circle cx="52" cy="142" r="4" fill={color} />
          <circle cx="74" cy="132" r="4" fill={color} />
          <circle cx="126" cy="132" r="4" fill={color} />
          <circle cx="148" cy="142" r="4" fill={color} />
        </g>
      );
    case "rase":
      return (
        <g>
          {/* Shaved — very subtle stubble */}
          <path
            d="M52 92 Q50 48 100 42 Q150 48 148 92 Q146 74 132 62 Q114 50 100 50 Q86 50 68 62 Q54 74 52 92Z"
            fill={color}
            opacity="0.25"
          />
        </g>
      );
    case "colore":
      return (
        <g>
          {/* Colored spiky/creative hair */}
          <path
            d="M46 92 Q44 38 100 30 Q156 38 154 92 Q152 68 136 54 Q116 40 100 40 Q84 40 64 54 Q48 68 46 92Z"
            fill={color}
          />
          {/* Spiky top */}
          <path d="M70 46 L64 22 L82 40" fill={color} />
          <path d="M90 38 L86 16 L102 34" fill={color} />
          <path d="M110 34 L114 14 L120 38" fill={color} />
          <path d="M130 40 L138 20 L140 48" fill={color} />
          {/* Highlight streaks */}
          <path d="M68 50 L66 28" stroke={highlight} strokeWidth="3" fill="none" opacity="0.5" />
          <path d="M92 40 L90 20" stroke={highlight} strokeWidth="3" fill="none" opacity="0.5" />
          <path d="M116 38 L118 18" stroke={highlight} strokeWidth="3" fill="none" opacity="0.5" />
        </g>
      );
    default:
      return null;
  }
}

// ── Eye styles ──
function EyesLayer({ style, iris, pupil }: { style: string; iris: string; pupil: string }) {
  switch (style) {
    case "ronds":
      return (
        <g>
          {/* Round eyes */}
          <ellipse cx="78" cy="94" rx="10" ry="10" fill="white" />
          <ellipse cx="122" cy="94" rx="10" ry="10" fill="white" />
          <circle cx="78" cy="94" r="6" fill={iris} />
          <circle cx="122" cy="94" r="6" fill={iris} />
          <circle cx="78" cy="94" r="3" fill={pupil} />
          <circle cx="122" cy="94" r="3" fill={pupil} />
          {/* Eye shine */}
          <circle cx="81" cy="91" r="2" fill="white" opacity="0.8" />
          <circle cx="125" cy="91" r="2" fill="white" opacity="0.8" />
        </g>
      );
    case "amande":
      return (
        <g>
          {/* Almond eyes */}
          <path d="M66 94 Q78 82 90 94 Q78 102 66 94Z" fill="white" />
          <path d="M110 94 Q122 82 134 94 Q122 102 110 94Z" fill="white" />
          <circle cx="78" cy="94" r="5.5" fill={iris} />
          <circle cx="122" cy="94" r="5.5" fill={iris} />
          <circle cx="78" cy="94" r="2.5" fill={pupil} />
          <circle cx="122" cy="94" r="2.5" fill={pupil} />
          <circle cx="80" cy="92" r="1.5" fill="white" opacity="0.8" />
          <circle cx="124" cy="92" r="1.5" fill="white" opacity="0.8" />
        </g>
      );
    case "perçants":
      return (
        <g>
          {/* Piercing/intense eyes — narrower, more angular */}
          <path d="M64 94 Q78 86 92 94 Q78 100 64 94Z" fill="white" />
          <path d="M108 94 Q122 86 136 94 Q122 100 108 94Z" fill="white" />
          <circle cx="78" cy="94" r="5" fill={iris} />
          <circle cx="122" cy="94" r="5" fill={iris} />
          <circle cx="78" cy="94" r="2.5" fill={pupil} />
          <circle cx="122" cy="94" r="2.5" fill={pupil} />
          {/* Intense shine */}
          <circle cx="80" cy="92" r="2" fill="white" opacity="0.9" />
          <circle cx="124" cy="92" r="2" fill="white" opacity="0.9" />
          {/* Lower lash line for intensity */}
          <path d="M66 96 Q78 102 90 96" stroke={pupil} strokeWidth="0.8" fill="none" opacity="0.3" />
          <path d="M110 96 Q122 102 134 96" stroke={pupil} strokeWidth="0.8" fill="none" opacity="0.3" />
        </g>
      );
    case "doux":
      return (
        <g>
          {/* Soft/gentle eyes — larger, more rounded */}
          <ellipse cx="78" cy="94" rx="11" ry="10" fill="white" />
          <ellipse cx="122" cy="94" rx="11" ry="10" fill="white" />
          <circle cx="78" cy="95" r="6.5" fill={iris} />
          <circle cx="122" cy="95" r="6.5" fill={iris} />
          <circle cx="78" cy="95" r="3" fill={pupil} />
          <circle cx="122" cy="95" r="3" fill={pupil} />
          {/* Big sparkle */}
          <circle cx="82" cy="91" r="2.5" fill="white" opacity="0.9" />
          <circle cx="126" cy="91" r="2.5" fill="white" opacity="0.9" />
          <circle cx="76" cy="97" r="1" fill="white" opacity="0.5" />
          <circle cx="120" cy="97" r="1" fill="white" opacity="0.5" />
        </g>
      );
    default:
      return null;
  }
}

// ── Accessory styles ──
function AccessoryLayer({ type, skinColor }: { type: string; skinColor: string }) {
  switch (type) {
    case "lunettes":
      return (
        <g>
          {/* Glasses */}
          <rect x="62" y="84" width="28" height="22" rx="6" fill="none" stroke="#1A1A2E" strokeWidth="2.5" />
          <rect x="110" y="84" width="28" height="22" rx="6" fill="none" stroke="#1A1A2E" strokeWidth="2.5" />
          {/* Bridge */}
          <path d="M90 94 Q100 90 110 94" stroke="#1A1A2E" strokeWidth="2" fill="none" />
          {/* Arms */}
          <path d="M62 90 L48 88" stroke="#1A1A2E" strokeWidth="2" />
          <path d="M138 90 L152 88" stroke="#1A1A2E" strokeWidth="2" />
          {/* Lens tint */}
          <rect x="64" y="86" width="24" height="18" rx="5" fill="rgba(59,130,246,0.08)" />
          <rect x="112" y="86" width="24" height="18" rx="5" fill="rgba(59,130,246,0.08)" />
        </g>
      );
    case "casquette":
      return (
        <g>
          {/* Cap */}
          <path d="M42 78 Q42 44 100 40 Q158 44 158 78 L42 78Z" fill="#1E293B" />
          <path d="M42 78 Q42 44 100 40 Q158 44 158 78" fill="none" stroke="#334155" strokeWidth="1" />
          {/* Brim */}
          <path d="M36 78 Q38 72 100 70 Q162 72 164 78 Q162 84 100 82 Q38 84 36 78Z" fill="#0F172A" />
          {/* Cap logo circle */}
          <circle cx="100" cy="62" r="8" fill="none" stroke="#06B6D4" strokeWidth="1.5" opacity="0.7" />
          <text x="100" y="66" textAnchor="middle" fill="#06B6D4" fontSize="10" fontWeight="bold" opacity="0.7">
            B
          </text>
        </g>
      );
    case "ecouteurs":
      return (
        <g>
          {/* Headphones band */}
          <path
            d="M44 92 Q44 36 100 30 Q156 36 156 92"
            stroke="#1E293B"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M44 92 Q44 36 100 30 Q156 36 156 92"
            stroke="#334155"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          {/* Left ear cup */}
          <rect x="34" y="84" width="16" height="24" rx="6" fill="#1E293B" />
          <rect x="36" y="88" width="12" height="16" rx="4" fill="#0F172A" />
          <rect x="38" y="92" width="8" height="8" rx="2" fill="#334155" opacity="0.4" />
          {/* Right ear cup */}
          <rect x="150" y="84" width="16" height="24" rx="6" fill="#1E293B" />
          <rect x="152" y="88" width="12" height="16" rx="4" fill="#0F172A" />
          <rect x="154" y="92" width="8" height="8" rx="2" fill="#334155" opacity="0.4" />
        </g>
      );
    case "cicatrice":
      return (
        <g>
          {/* Scar across left eyebrow */}
          <path
            d="M62 72 L74 82 L68 78 L80 90"
            stroke="#CD5C5C"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          />
          {/* Small scar marks */}
          <path d="M66 74 L72 76" stroke={skinColor} strokeWidth="1" opacity="0.4" />
          <path d="M70 78 L76 80" stroke={skinColor} strokeWidth="1" opacity="0.4" />
        </g>
      );
    case "piercing":
      return (
        <g>
          {/* Nose ring */}
          <circle cx="104" cy="114" r="3" fill="none" stroke="#C0C0C0" strokeWidth="1.5" />
          <circle cx="104" cy="117" r="1" fill="#E5E5E5" />
          {/* Ear stud */}
          <circle cx="46" cy="98" r="2.5" fill="#FFD700" />
          <circle cx="46" cy="98" r="1.2" fill="#FFF8DC" />
        </g>
      );
    case "aucun":
    default:
      return null;
  }
}

/** Mini version for display in lists/cards (no background circle) */
export function AvatarSVGMini({ skin, hair, eyes, accessory, size = 40, className }: AvatarSVGProps) {
  return <AvatarSVG skin={skin} hair={hair} eyes={eyes} accessory={accessory} size={size} className={className} />;
}
