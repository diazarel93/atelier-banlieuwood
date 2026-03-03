"use client";

import { motion } from "motion/react";

// ——— Reusable cinema-themed SVG illustrations ———
// Optimized for Deep Slate background #08090E.
// Brand palette: #FF6B35 (orange), #4ECDC4 (teal), #D4A843 (gold), #8B5CF6 (violet).

interface IllustrationProps {
  size?: number;
  className?: string;
}

export function ClapperboardIllustration({ size = 120, className = "" }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className}>
      <defs>
        <linearGradient id="clap-arm-g" x1="18" y1="18" x2="102" y2="38">
          <stop stopColor="#FF6B35" /><stop offset="1" stopColor="#D4A843" />
        </linearGradient>
        <linearGradient id="clap-body-g" x1="18" y1="42" x2="102" y2="100">
          <stop stopColor="#FF6B35" stopOpacity="0.9" /><stop offset="1" stopColor="#D4A843" stopOpacity="0.8" />
        </linearGradient>
        <clipPath id="clap-arm-c">
          <rect x="18" y="16" width="84" height="22" rx="4" />
        </clipPath>
      </defs>

      {/* Ambient glow behind */}
      <ellipse cx="60" cy="62" rx="42" ry="38" fill="url(#clap-arm-g)" opacity="0.06" />

      {/* ── Clapper Arm with diagonal stripes ── */}
      <g clipPath="url(#clap-arm-c)">
        <rect x="18" y="16" width="84" height="22" fill="url(#clap-arm-g)" />
        {/* Classic diagonal stripes */}
        <path d="M28 38L36 38L48 16L40 16Z" fill="#08090E" opacity="0.8" />
        <path d="M50 38L58 38L70 16L62 16Z" fill="#08090E" opacity="0.8" />
        <path d="M72 38L80 38L92 16L84 16Z" fill="#08090E" opacity="0.8" />
        <path d="M94 38L102 38L114 16L106 16Z" fill="#08090E" opacity="0.8" />
      </g>

      {/* Hinge pivots */}
      <circle cx="22" cy="38" r="4" fill="url(#clap-arm-g)" />
      <circle cx="98" cy="38" r="4" fill="url(#clap-arm-g)" />

      {/* ── Slate Body ── */}
      <rect x="18" y="42" width="84" height="58" rx="6" fill="url(#clap-body-g)" />

      {/* ── Inner frame ── */}
      <rect x="24" y="48" width="72" height="46" rx="4" fill="#08090E" />

      {/* ── Minimal "BW" text inside frame ── */}
      <text x="60" y="78" textAnchor="middle" fontSize="22" fontWeight="800" fontFamily="system-ui, sans-serif" letterSpacing="-0.04em" fill="url(#clap-arm-g)" opacity="0.15">
        BW
      </text>
    </svg>
  );
}

export function FilmReelIllustration({ size = 120, className = "" }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className}>
      <defs>
        <linearGradient id="reel-ring" x1="12" y1="12" x2="108" y2="108">
          <stop stopColor="#FF6B35" /><stop offset="1" stopColor="#D4A843" />
        </linearGradient>
      </defs>
      {/* Ambient glow */}
      <circle cx="60" cy="60" r="44" fill="url(#reel-ring)" opacity="0.05" />
      {/* Outer ring */}
      <circle cx="60" cy="60" r="44" stroke="url(#reel-ring)" strokeWidth="2" fill="none" />
      {/* Sprocket holes — minimal */}
      {[0, 60, 120, 180, 240, 300].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const cx = 60 + 34 * Math.cos(rad);
        const cy = 60 + 34 * Math.sin(rad);
        return <circle key={angle} cx={cx} cy={cy} r="4" fill="none" stroke="url(#reel-ring)" strokeWidth="1.5" opacity="0.5" />;
      })}
      {/* Center hub */}
      <circle cx="60" cy="60" r="14" fill="#08090E" stroke="url(#reel-ring)" strokeWidth="2" />
      <circle cx="60" cy="60" r="5" fill="url(#reel-ring)" opacity="0.3" />
    </svg>
  );
}

export function CameraIllustration({ size = 120, className = "" }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className}>
      <defs>
        <linearGradient id="cam-body" x1="20" y1="35" x2="85" y2="85">
          <stop stopColor="#0E1017" /><stop offset="1" stopColor="#15181F" />
        </linearGradient>
        <linearGradient id="cam-border" x1="20" y1="35" x2="85" y2="85">
          <stop stopColor="rgba(78,205,196,0.35)" /><stop offset="1" stopColor="rgba(139,92,246,0.25)" />
        </linearGradient>
        <linearGradient id="cam-lens" x1="34" y1="42" x2="70" y2="78">
          <stop stopColor="#4ECDC4" /><stop offset="1" stopColor="#2B9A93" />
        </linearGradient>
        <linearGradient id="cam-flash" x1="30" y1="28" x2="50" y2="38">
          <stop stopColor="#D4A843" /><stop offset="1" stopColor="#FF6B35" />
        </linearGradient>
      </defs>
      {/* Ambient glow */}
      <ellipse cx="55" cy="60" rx="38" ry="30" fill="rgba(78,205,196,0.04)" />
      {/* Camera body */}
      <rect x="20" y="35" width="65" height="50" rx="8" fill="url(#cam-body)" stroke="url(#cam-border)" strokeWidth="1.5" />
      {/* Lens — teal tones */}
      <circle cx="52" cy="60" r="18" fill="#08090E" stroke="url(#cam-lens)" strokeWidth="2" />
      <circle cx="52" cy="60" r="12" fill="rgba(78,205,196,0.08)" stroke="rgba(78,205,196,0.3)" strokeWidth="1" />
      <circle cx="52" cy="60" r="5" fill="rgba(78,205,196,0.2)" />
      {/* Lens flare */}
      <circle cx="47" cy="55" r="2" fill="rgba(255,255,255,0.35)" />
      {/* Viewfinder */}
      <rect x="85" y="45" width="18" height="12" rx="3" fill="#0E1017" stroke="rgba(255,107,53,0.3)" strokeWidth="1" />
      <path d="M85 50L78 46V54L85 50Z" fill="rgba(255,107,53,0.4)" />
      {/* Top flash */}
      <rect x="30" y="28" width="20" height="10" rx="3" fill="url(#cam-flash)" />
      {/* Recording light */}
      <circle cx="75" cy="42" r="3" fill="#EF4444" />
      <circle cx="75" cy="42" r="5" fill="none" stroke="rgba(239,68,68,0.3)" strokeWidth="1" />
    </svg>
  );
}

export function PopcornIllustration({ size = 120, className = "" }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className}>
      {/* Bucket */}
      <path d="M35 50L42 100H78L85 50" fill="url(#pop-bucket)" stroke="url(#pop-bucket-stroke)" strokeWidth="1.5" />
      {/* Stripes on bucket */}
      <path d="M37 60H83" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      <path d="M39 70H81" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <path d="M40 80H80" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <path d="M41 90H79" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      {/* Popcorn kernels — warm tones, bright enough on dark */}
      <circle cx="45" cy="40" r="10" fill="#F59E0B" />
      <circle cx="60" cy="35" r="12" fill="#FFD166" />
      <circle cx="75" cy="40" r="10" fill="#F59E0B" />
      <circle cx="52" cy="28" r="9" fill="#FFE299" />
      <circle cx="68" cy="28" r="9" fill="#FFD166" />
      <circle cx="60" cy="20" r="8" fill="#F59E0B" />
      {/* Highlights on kernels */}
      <circle cx="42" cy="37" r="3" fill="rgba(255,255,255,0.4)" />
      <circle cx="57" cy="32" r="3" fill="rgba(255,255,255,0.4)" />
      <circle cx="72" cy="37" r="3" fill="rgba(255,255,255,0.4)" />
      <defs>
        <linearGradient id="pop-bucket" x1="35" y1="50" x2="85" y2="100">
          <stop stopColor="#EF4444" /><stop offset="1" stopColor="#DC2626" />
        </linearGradient>
        <linearGradient id="pop-bucket-stroke" x1="35" y1="50" x2="85" y2="100">
          <stop stopColor="#F87171" /><stop offset="1" stopColor="#B91C1C" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function StarIllustration({ size = 120, className = "" }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className}>
      {/* Outer glow halo for depth on dark */}
      <path d="M60 15L72 45L105 48L80 72L87 105L60 88L33 105L40 72L15 48L48 45L60 15Z"
        fill="url(#star-glow)" filter="url(#star-blur)" opacity="0.35" />
      <path d="M60 15L72 45L105 48L80 72L87 105L60 88L33 105L40 72L15 48L48 45L60 15Z"
        fill="url(#star-fill)" stroke="url(#star-stroke)" strokeWidth="2" strokeLinejoin="round" />
      {/* Inner glow */}
      <path d="M60 30L68 50L90 52L73 67L78 90L60 78L42 90L47 67L30 52L52 50L60 30Z"
        fill="rgba(255,255,255,0.12)" />
      <defs>
        <linearGradient id="star-fill" x1="15" y1="15" x2="105" y2="105">
          <stop stopColor="#D4A843" /><stop offset="1" stopColor="#FF6B35" />
        </linearGradient>
        <linearGradient id="star-stroke" x1="15" y1="15" x2="105" y2="105">
          <stop stopColor="#FFD166" /><stop offset="1" stopColor="#FF6B35" />
        </linearGradient>
        <linearGradient id="star-glow" x1="15" y1="15" x2="105" y2="105">
          <stop stopColor="#D4A843" /><stop offset="1" stopColor="#FF6B35" />
        </linearGradient>
        <filter id="star-blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
        </filter>
      </defs>
    </svg>
  );
}

export function TicketIllustration({ size = 120, className = "" }: IllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className}>
      {/* Ticket body */}
      <path d="M15 35H50C50 35 50 42 55 42C60 42 60 35 60 35H105V85H60C60 85 60 78 55 78C50 78 50 85 50 85H15V35Z"
        fill="url(#ticket-fill)" stroke="url(#ticket-stroke)" strokeWidth="1.5" />
      {/* Perforated line */}
      {[40, 47, 54, 61, 68, 75].map((y) => (
        <rect key={y} x="53" y={y} width="4" height="2" rx="1" fill="rgba(255,255,255,0.18)" />
      ))}
      {/* Text lines */}
      <rect x="25" y="48" width="18" height="3" rx="1.5" fill="rgba(255,255,255,0.3)" />
      <rect x="25" y="56" width="12" height="2" rx="1" fill="rgba(255,255,255,0.2)" />
      <rect x="25" y="63" width="15" height="2" rx="1" fill="rgba(255,255,255,0.15)" />
      {/* Star on right side */}
      <path d="M82 55L85 61L92 62L87 67L88 74L82 70L76 74L77 67L72 62L79 61L82 55Z"
        fill="#D4A843" />
      <defs>
        <linearGradient id="ticket-fill" x1="15" y1="35" x2="105" y2="85">
          <stop stopColor="#8B5CF6" /><stop offset="1" stopColor="#6D28D9" />
        </linearGradient>
        <linearGradient id="ticket-stroke" x1="15" y1="35" x2="105" y2="85">
          <stop stopColor="#A78BFA" /><stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ——— Animated decorative film strip for backgrounds ———
export function FilmStripDecoration({ className = "" }: { className?: string }) {
  return (
    <motion.div
      animate={{ y: [0, -20, 0] }}
      transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
      className={`absolute opacity-[0.08] pointer-events-none ${className}`}
    >
      <svg width="40" height="300" viewBox="0 0 40 300" fill="none">
        {Array.from({ length: 10 }).map((_, i) => (
          <g key={i}>
            <rect x="4" y={i * 30 + 2} width="6" height="12" rx="1.5" fill="rgba(255,255,255,0.6)" />
            <rect x="30" y={i * 30 + 2} width="6" height="12" rx="1.5" fill="rgba(255,255,255,0.6)" />
            <rect x="14" y={i * 30} width="12" height="18" rx="2" fill="rgba(255,255,255,0.25)" />
          </g>
        ))}
      </svg>
    </motion.div>
  );
}

// ——— Cinema quote banner ———
export function CinemaQuoteBanner({ quote, author }: { quote: string; author: string }) {
  return (
    <div className="relative px-6 py-4 rounded-xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-bw-primary/8 via-bw-gold/5 to-bw-violet/8" />
      <div className="relative flex items-start gap-3">
        <span className="text-3xl text-bw-gold font-serif leading-none">&ldquo;</span>
        <div>
          <p className="text-sm italic text-bw-text leading-relaxed">{quote}</p>
          <p className="text-xs text-bw-placeholder mt-1">— {author}</p>
        </div>
      </div>
    </div>
  );
}
