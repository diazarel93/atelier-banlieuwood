"use client";

import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════
   BANLIEUWOOD — Cinema Mascot / Director Avatar
   A cute geometric "Director" character with beret & megaphone.
   Moods: happy, thinking, excited, surprised
   Optional speech bubble. Idle floating animation.
   ═══════════════════════════════════════════════════════════════ */

type MascotMood = "happy" | "thinking" | "excited" | "surprised";
type MascotSize = "sm" | "md" | "lg";

const SIZE_MAP: Record<MascotSize, number> = {
  sm: 64,
  md: 96,
  lg: 144,
};

const BUBBLE_TEXT_SIZE: Record<MascotSize, string> = {
  sm: "text-xs",
  md: "text-xs",
  lg: "text-sm",
};

const BUBBLE_OFFSET: Record<MascotSize, string> = {
  sm: "-top-8 -right-2",
  md: "-top-10 -right-4",
  lg: "-top-12 -right-6",
};

/* ── Mood-specific expression parts ── */

interface MoodExpressions {
  leftEye: React.ReactNode;
  rightEye: React.ReactNode;
  mouth: React.ReactNode;
  extras?: React.ReactNode;
}

function getExpressions(mood: MascotMood): MoodExpressions {
  switch (mood) {
    case "happy":
      return {
        /* Round open eyes with small highlights */
        leftEye: (
          <g>
            <ellipse cx="38" cy="52" rx="4" ry="4.5" fill="#08090E" />
            <circle cx="39.5" cy="50.5" r="1.2" fill="#E8EAED" />
          </g>
        ),
        rightEye: (
          <g>
            <ellipse cx="58" cy="52" rx="4" ry="4.5" fill="#08090E" />
            <circle cx="59.5" cy="50.5" r="1.2" fill="#E8EAED" />
          </g>
        ),
        /* Wide smile arc */
        mouth: <path d="M42 62 Q48 68 54 62" fill="none" stroke="#08090E" strokeWidth="2.5" strokeLinecap="round" />,
      };

    case "thinking":
      return {
        /* One eye squinting (flat line), other eye looking up */
        leftEye: (
          <g>
            <ellipse cx="38" cy="52" rx="4" ry="4.5" fill="#08090E" />
            <circle cx="37" cy="50.5" r="1.2" fill="#E8EAED" />
          </g>
        ),
        rightEye: <line x1="54" y1="52" x2="62" y2="52" stroke="#08090E" strokeWidth="2.5" strokeLinecap="round" />,
        /* Small flat mouth, slightly offset */
        mouth: <path d="M44 63 Q48 65 52 63" fill="none" stroke="#08090E" strokeWidth="2" strokeLinecap="round" />,
        /* Thought dots rising from head */
        extras: (
          <g className="bw-mascot-thought">
            <circle cx="68" cy="30" r="2" fill="#7D828A" opacity="0.5" />
            <circle cx="72" cy="24" r="2.5" fill="#7D828A" opacity="0.4" />
            <circle cx="77" cy="17" r="3" fill="#7D828A" opacity="0.3" />
          </g>
        ),
      };

    case "excited":
      return {
        /* Star-shaped eyes */
        leftEye: (
          <g>
            <polygon
              points="38,47 39.5,50 43,50.5 40.5,53 41,56.5 38,55 35,56.5 35.5,53 33,50.5 36.5,50"
              fill="#FF6B35"
            />
          </g>
        ),
        rightEye: (
          <g>
            <polygon
              points="58,47 59.5,50 63,50.5 60.5,53 61,56.5 58,55 55,56.5 55.5,53 53,50.5 56.5,50"
              fill="#FF6B35"
            />
          </g>
        ),
        /* Big open mouth "O" */
        mouth: <ellipse cx="48" cy="64" rx="5" ry="4" fill="#08090E" />,
        /* Sparkle effects */
        extras: (
          <g className="bw-mascot-sparkle">
            <line
              x1="22"
              y1="38"
              x2="18"
              y2="34"
              stroke="#D4A843"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.7"
            />
            <line
              x1="20"
              y1="42"
              x2="14"
              y2="42"
              stroke="#D4A843"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.5"
            />
            <line
              x1="72"
              y1="38"
              x2="76"
              y2="34"
              stroke="#D4A843"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.7"
            />
            <line
              x1="74"
              y1="44"
              x2="80"
              y2="44"
              stroke="#D4A843"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.5"
            />
          </g>
        ),
      };

    case "surprised":
      return {
        /* Wide round eyes */
        leftEye: (
          <g>
            <circle cx="38" cy="52" r="5.5" fill="#08090E" />
            <circle cx="39" cy="50.5" r="2" fill="#E8EAED" />
          </g>
        ),
        rightEye: (
          <g>
            <circle cx="58" cy="52" r="5.5" fill="#08090E" />
            <circle cx="59" cy="50.5" r="2" fill="#E8EAED" />
          </g>
        ),
        /* Small O mouth */
        mouth: <circle cx="48" cy="65" r="3.5" fill="#08090E" />,
        /* Surprise lines above head */
        extras: (
          <g>
            <line
              x1="48"
              y1="18"
              x2="48"
              y2="12"
              stroke="#FF6B35"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.6"
            />
            <line
              x1="40"
              y1="20"
              x2="36"
              y2="14"
              stroke="#FF6B35"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.4"
            />
            <line
              x1="56"
              y1="20"
              x2="60"
              y2="14"
              stroke="#FF6B35"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.4"
            />
          </g>
        ),
      };
  }
}

/* ── Speech Bubble ── */

function SpeechBubble({ message, size }: { message: string; size: MascotSize }) {
  return (
    <div
      className={cn(
        "absolute z-10",
        BUBBLE_OFFSET[size],
        "px-2.5 py-1.5 rounded-lg",
        "bg-bw-elevated border border-white/[0.08]",
        "shadow-[0_4px_16px_rgba(0,0,0,0.4)]",
        "max-w-[160px]",
        BUBBLE_TEXT_SIZE[size],
        "text-bw-text leading-snug",
        "after:content-[''] after:absolute after:-bottom-1.5 after:left-4",
        "after:w-3 after:h-3 after:rotate-45",
        "after:bg-bw-elevated after:border-r after:border-b after:border-white/[0.08]",
      )}
    >
      {message}
    </div>
  );
}

/* ── Main Mascot Component ── */

interface CinemaMascotProps {
  mood?: MascotMood;
  size?: MascotSize;
  message?: string;
  className?: string;
  animated?: boolean;
}

export function CinemaMascot({ mood = "happy", size = "md", message, className, animated = true }: CinemaMascotProps) {
  const px = SIZE_MAP[size];
  const expressions = getExpressions(mood);

  return (
    <div className={cn("relative inline-flex", className)}>
      {/* Speech bubble */}
      {message && <SpeechBubble message={message} size={size} />}

      <svg
        width={px}
        height={px}
        viewBox="0 0 96 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", animated && "bw-mascot-float")}
        aria-label={`Director mascot, mood: ${mood}`}
        role="img"
      >
        {/* ── Beret ── */}
        <ellipse cx="48" cy="32" rx="22" ry="6" fill="#15181F" />
        <path d="M28 32 Q30 18 48 16 Q66 18 68 32" fill="#15181F" />
        {/* Beret nub / pompom */}
        <circle cx="48" cy="16" r="3" fill="#FF6B35" />
        {/* Beret band */}
        <path d="M28 32 Q48 36 68 32" fill="none" stroke="#FF6B35" strokeWidth="1.5" opacity="0.5" />

        {/* ── Head (rounded rectangle face) ── */}
        <rect x="30" y="34" width="36" height="40" rx="14" fill="#D4A843" />

        {/* Subtle face shadow */}
        <rect x="30" y="58" width="36" height="16" rx="14" fill="#A47C2A" opacity="0.3" />

        {/* Cheek blush */}
        <circle cx="33" cy="58" r="4" fill="#FF6B35" opacity="0.2" />
        <circle cx="63" cy="58" r="4" fill="#FF6B35" opacity="0.2" />

        {/* ── Eyebrows ── */}
        {mood === "surprised" ? (
          <>
            <path d="M33 44 Q38 40 43 44" fill="none" stroke="#08090E" strokeWidth="2" strokeLinecap="round" />
            <path d="M53 44 Q58 40 63 44" fill="none" stroke="#08090E" strokeWidth="2" strokeLinecap="round" />
          </>
        ) : mood === "thinking" ? (
          <>
            <path d="M33 45 L43 44" fill="none" stroke="#08090E" strokeWidth="2" strokeLinecap="round" />
            <path d="M53 44 Q58 42 63 45" fill="none" stroke="#08090E" strokeWidth="2" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M33 46 Q38 43 43 46" fill="none" stroke="#08090E" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M53 46 Q58 43 63 46" fill="none" stroke="#08090E" strokeWidth="1.5" strokeLinecap="round" />
          </>
        )}

        {/* ── Eyes (mood-specific) ── */}
        {expressions.leftEye}
        {expressions.rightEye}

        {/* ── Nose (tiny) ── */}
        <ellipse cx="48" cy="58" rx="2" ry="1.5" fill="#A47C2A" opacity="0.6" />

        {/* ── Mouth (mood-specific) ── */}
        {expressions.mouth}

        {/* ── Megaphone (held to the right) ── */}
        <g transform="translate(64, 54) rotate(-15)">
          {/* Handle */}
          <rect x="0" y="0" width="8" height="4" rx="1" fill="#7D828A" />
          {/* Cone */}
          <path d="M8 -4 L22 -10 L22 14 L8 8 Z" fill="#FF6B35" opacity="0.9" />
          {/* Cone opening ring */}
          <line x1="22" y1="-10" x2="22" y2="14" stroke="#D4A843" strokeWidth="1.5" />
          {/* Sound waves (when excited) */}
          {mood === "excited" && (
            <g className="bw-mascot-sound">
              <path d="M24 -4 Q28 2 24 8" fill="none" stroke="#FF6B35" strokeWidth="1" opacity="0.5" />
              <path d="M27 -6 Q32 2 27 10" fill="none" stroke="#FF6B35" strokeWidth="1" opacity="0.3" />
            </g>
          )}
        </g>

        {/* ── Small hand holding megaphone ── */}
        <circle cx="66" cy="56" r="3" fill="#D4A843" />

        {/* ── Extras (mood-specific sparkles, thought bubbles, etc.) ── */}
        {expressions.extras}
      </svg>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   CSS: Idle float animation, thought/sparkle anims
   ══════════════════════════════════════════════════ */

const MASCOT_STYLES = `
/* Gentle idle floating / bobbing */
.bw-mascot-float {
  animation: bw-mascot-bob 3s ease-in-out infinite;
}

@keyframes bw-mascot-bob {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

/* Thinking dots float upward */
.bw-mascot-thought circle {
  animation: bw-thought-rise 2.5s ease-in-out infinite;
}
.bw-mascot-thought circle:nth-child(2) {
  animation-delay: 0.3s;
}
.bw-mascot-thought circle:nth-child(3) {
  animation-delay: 0.6s;
}

@keyframes bw-thought-rise {
  0%, 100% {
    transform: translateY(0);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-3px);
    opacity: 0.6;
  }
}

/* Sparkle pulse for excited mood */
.bw-mascot-sparkle line {
  animation: bw-sparkle-pulse 1s ease-in-out infinite alternate;
}
.bw-mascot-sparkle line:nth-child(2n) {
  animation-delay: 0.2s;
}

@keyframes bw-sparkle-pulse {
  0% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  100% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

/* Sound wave pulse for megaphone */
.bw-mascot-sound path {
  animation: bw-sound-wave 1.2s ease-out infinite;
}
.bw-mascot-sound path:nth-child(2) {
  animation-delay: 0.3s;
}

@keyframes bw-sound-wave {
  0% {
    opacity: 0.5;
    transform: translateX(0);
  }
  100% {
    opacity: 0;
    transform: translateX(4px);
  }
}
`;

/* Inject mascot styles once */
let mascotStylesInjected = false;

export function MascotStyles() {
  if (typeof window === "undefined") return null;
  if (mascotStylesInjected) return null;
  mascotStylesInjected = true;

  return <style dangerouslySetInnerHTML={{ __html: MASCOT_STYLES }} />;
}

/* ── Convenience export with styles auto-included ── */

export function CinemaMascotWithStyles(props: CinemaMascotProps) {
  return (
    <>
      <MascotStyles />
      <CinemaMascot {...props} />
    </>
  );
}

export default CinemaMascotWithStyles;
