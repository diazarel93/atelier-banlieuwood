/** Scene backdrop SVGs — sketch/line-art style matching DiceBear Notionists.
 *  Bold white strokes on dark background, simple recognizable shapes.
 *  viewBox 0 0 200 60, displayed in card header. */

interface SceneBackgroundProps {
  scene: string;
  className?: string;
}

const S = "rgba(255,255,255,0.3)"; // stroke
const SL = "rgba(255,255,255,0.15)"; // stroke light
const AMBER = "rgba(245,158,11,0.6)";
const CYAN = "rgba(6,182,212,0.5)";
const RED = "rgba(239,68,68,0.45)";
const GREEN = "rgba(34,197,94,0.4)";
const VIOLET = "rgba(139,92,246,0.45)";

function SceneCite() {
  return (
    <>
      {/* Buildings — bold outlines */}
      <rect x="4" y="14" width="26" height="46" rx="1" fill="none" stroke={S} strokeWidth="1.2" />
      <rect x="34" y="4" width="22" height="56" rx="1" fill="none" stroke={S} strokeWidth="1.2" />
      <rect x="62" y="18" width="28" height="42" rx="1" fill="none" stroke={S} strokeWidth="1.2" />
      <rect x="96" y="8" width="22" height="52" rx="1" fill="none" stroke={S} strokeWidth="1.2" />
      <rect x="124" y="14" width="26" height="46" rx="1" fill="none" stroke={S} strokeWidth="1.2" />
      <rect x="156" y="6" width="20" height="54" rx="1" fill="none" stroke={S} strokeWidth="1.2" />
      <rect x="180" y="20" width="18" height="40" rx="1" fill="none" stroke={S} strokeWidth="1.2" />
      {/* Lit windows */}
      <rect x="10" y="20" width="5" height="4" rx="0.5" fill={AMBER} />
      <rect x="18" y="20" width="5" height="4" rx="0.5" fill={CYAN} />
      <rect x="10" y="30" width="5" height="4" rx="0.5" fill={CYAN} />
      <rect x="18" y="38" width="5" height="4" rx="0.5" fill={AMBER} />
      <rect x="38" y="10" width="5" height="4" rx="0.5" fill={AMBER} />
      <rect x="47" y="20" width="5" height="4" rx="0.5" fill={CYAN} />
      <rect x="38" y="32" width="5" height="4" rx="0.5" fill={AMBER} />
      <rect x="47" y="42" width="5" height="4" rx="0.5" fill={CYAN} />
      <rect x="68" y="24" width="5" height="4" rx="0.5" fill={CYAN} />
      <rect x="78" y="34" width="5" height="4" rx="0.5" fill={AMBER} />
      <rect x="100" y="14" width="5" height="4" rx="0.5" fill={AMBER} />
      <rect x="109" y="28" width="5" height="4" rx="0.5" fill={CYAN} />
      <rect x="130" y="22" width="5" height="4" rx="0.5" fill={AMBER} />
      <rect x="140" y="34" width="5" height="4" rx="0.5" fill={CYAN} />
      <rect x="160" y="12" width="5" height="4" rx="0.5" fill={AMBER} />
      <rect x="168" y="30" width="5" height="4" rx="0.5" fill={CYAN} />
      {/* Antenna */}
      <line x1="45" y1="4" x2="45" y2="-2" stroke={S} strokeWidth="1" />
      <line x1="42" y1="0" x2="48" y2="0" stroke={S} strokeWidth="0.8" />
      {/* Satellite dish */}
      <path d="M166 6 Q168 2 172 4" fill="none" stroke={S} strokeWidth="0.8" />
    </>
  );
}

function SceneEcole() {
  return (
    <>
      {/* Main building */}
      <rect x="30" y="14" width="80" height="46" rx="1" fill="none" stroke={S} strokeWidth="1.2" />
      {/* Roof */}
      <path d="M28 14 L70 2 L112 14" fill="none" stroke={S} strokeWidth="1.2" />
      {/* Clock */}
      <circle cx="70" cy="8" r="3.5" fill="none" stroke={S} strokeWidth="1" />
      <line x1="70" y1="8" x2="70" y2="5.5" stroke={S} strokeWidth="0.8" />
      <line x1="70" y1="8" x2="72" y2="8" stroke={S} strokeWidth="0.8" />
      {/* Wing */}
      <rect x="112" y="24" width="38" height="36" rx="1" fill="none" stroke={S} strokeWidth="1.2" />
      {/* Windows */}
      {[38, 52, 66, 80, 96].map((x) => (
        <g key={x}>
          <rect x={x} y={22} width="7" height="6" rx="0.5" fill={CYAN} />
          <rect x={x} y={34} width="7" height="6" rx="0.5" fill={AMBER} />
        </g>
      ))}
      {[118, 132].map((x) => (
        <rect key={x} x={x} y={30} width="7" height="6" rx="0.5" fill={CYAN} />
      ))}
      {/* Door */}
      <rect x="64" y="44" width="12" height="16" rx="1" fill="none" stroke={AMBER} strokeWidth="1" />
      {/* Fence */}
      <line x1="0" y1="50" x2="30" y2="50" stroke={SL} strokeWidth="0.8" />
      <line x1="150" y1="50" x2="200" y2="50" stroke={SL} strokeWidth="0.8" />
      {[4, 12, 20, 155, 165, 175, 185, 195].map((x) => (
        <line key={x} x1={x} y1={46} x2={x} y2={56} stroke={SL} strokeWidth="0.8" />
      ))}
      {/* Flag */}
      <line x1="70" y1="2" x2="70" y2="-4" stroke={S} strokeWidth="0.8" />
      <rect x="70" y="-4" width="8" height="5" fill={RED} />
    </>
  );
}

function SceneCinema() {
  return (
    <>
      {/* Building outline */}
      <rect x="25" y="10" width="150" height="50" rx="2" fill="none" stroke={S} strokeWidth="1.2" />
      {/* Marquee */}
      <rect x="35" y="12" width="130" height="14" rx="1" fill="none" stroke={S} strokeWidth="0.8" />
      {/* Marquee lights */}
      {[42, 52, 62, 72, 82, 92, 102, 112, 122, 132, 142, 152].map((x, i) => (
        <circle key={x} cx={x} cy={16} r="2" fill={i % 3 === 0 ? AMBER : i % 3 === 1 ? RED : CYAN} />
      ))}
      {/* Title bar */}
      <rect x="60" y="19" width="80" height="4" rx="1" fill={CYAN} />
      {/* Posters */}
      <rect x="35" y="30" width="18" height="24" rx="1" fill="none" stroke={RED} strokeWidth="0.8" />
      <rect x="147" y="30" width="18" height="24" rx="1" fill="none" stroke={VIOLET} strokeWidth="0.8" />
      {/* Doors */}
      <rect x="88" y="34" width="10" height="26" rx="1" fill="none" stroke={AMBER} strokeWidth="1" />
      <rect x="102" y="34" width="10" height="26" rx="1" fill="none" stroke={AMBER} strokeWidth="1" />
      {/* Stars on posters */}
      <circle cx="44" cy="40" r="2" fill={AMBER} />
      <circle cx="156" cy="40" r="2" fill={AMBER} />
      {/* Neon signs */}
      <circle cx="28" cy="8" r="3" fill={RED} />
      <circle cx="172" cy="8" r="3" fill={CYAN} />
    </>
  );
}

function ScenePlage() {
  return (
    <>
      {/* Sun */}
      <circle cx="155" cy="14" r="10" fill="none" stroke={AMBER} strokeWidth="1.5" />
      <circle cx="155" cy="14" r="5" fill={AMBER} />
      {/* Sun rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <line
            key={angle}
            x1={155 + Math.cos(rad) * 13}
            y1={14 + Math.sin(rad) * 13}
            x2={155 + Math.cos(rad) * 18}
            y2={14 + Math.sin(rad) * 18}
            stroke={AMBER}
            strokeWidth="0.8"
          />
        );
      })}
      {/* Waves */}
      <path
        d="M0 32 Q15 28 30 32 Q45 36 60 32 Q75 28 90 32 Q105 36 120 32 Q135 28 150 32 Q165 36 180 32 Q195 28 200 32"
        fill="none"
        stroke={CYAN}
        strokeWidth="1.2"
      />
      <path
        d="M0 38 Q20 34 40 38 Q60 42 80 38 Q100 34 120 38 Q140 42 160 38 Q180 34 200 38"
        fill="none"
        stroke={CYAN}
        strokeWidth="0.8"
      />
      {/* Sand line */}
      <line x1="0" y1="44" x2="200" y2="44" stroke={SL} strokeWidth="0.8" />
      {/* Umbrella */}
      <line x1="40" y1="26" x2="40" y2="56" stroke={S} strokeWidth="1.2" />
      <path d="M26 26 Q40 14 54 26" fill="none" stroke={RED} strokeWidth="1.5" />
      <line x1="40" y1="22" x2="40" y2="26" stroke={RED} strokeWidth="0.8" />
      {/* Palm tree */}
      <line x1="130" y1="20" x2="130" y2="56" stroke={S} strokeWidth="2" />
      <path d="M116 20 Q130 8 144 20" fill="none" stroke={GREEN} strokeWidth="1.5" />
      <path d="M120 16 Q130 6 140 16" fill="none" stroke={GREEN} strokeWidth="1.2" />
      {/* Birds */}
      <path d="M30 8 Q34 4 38 8" fill="none" stroke={S} strokeWidth="0.6" />
      <path d="M45 5 Q48 2 51 5" fill="none" stroke={S} strokeWidth="0.6" />
    </>
  );
}

function SceneConcert() {
  return (
    <>
      {/* Stage */}
      <rect x="15" y="32" width="170" height="28" rx="1" fill="none" stroke={S} strokeWidth="1.2" />
      {/* Spot beams */}
      <path d="M50 0 L30 32 L70 32 Z" fill="none" stroke={VIOLET} strokeWidth="0.8" />
      <path d="M100 0 L80 32 L120 32 Z" fill="none" stroke={CYAN} strokeWidth="0.8" />
      <path d="M150 0 L130 32 L170 32 Z" fill="none" stroke={AMBER} strokeWidth="0.8" />
      {/* Spot sources */}
      <circle cx="50" cy="3" r="4" fill={VIOLET} />
      <circle cx="100" cy="3" r="4" fill={CYAN} />
      <circle cx="150" cy="3" r="4" fill={AMBER} />
      {/* Speakers */}
      <rect x="20" y="36" width="14" height="18" rx="1" fill="none" stroke={S} strokeWidth="1" />
      <circle cx="27" cy="44" r="4" fill="none" stroke={S} strokeWidth="0.8" />
      <rect x="166" y="36" width="14" height="18" rx="1" fill="none" stroke={S} strokeWidth="1" />
      <circle cx="173" cy="44" r="4" fill="none" stroke={S} strokeWidth="0.8" />
      {/* Mic */}
      <line x1="100" y1="36" x2="100" y2="54" stroke={S} strokeWidth="1.2" />
      <circle cx="100" cy="35" r="3" fill="none" stroke={S} strokeWidth="1" />
      {/* Music notes */}
      <text x="60" y="28" fill={AMBER} fontSize="8" fontFamily="serif">
        &#9834;
      </text>
      <text x="135" y="26" fill={CYAN} fontSize="6" fontFamily="serif">
        &#9835;
      </text>
    </>
  );
}

function SceneMarche() {
  return (
    <>
      {/* String lights */}
      <path d="M0 6 Q50 14 100 6 Q150 14 200 6" fill="none" stroke={AMBER} strokeWidth="0.8" />
      {[20, 40, 60, 80, 100, 120, 140, 160, 180].map((x, i) => (
        <circle
          key={x}
          cx={x}
          cy={i % 2 === 0 ? 8 : 12}
          r="2.5"
          fill={i % 3 === 0 ? AMBER : i % 3 === 1 ? RED : CYAN}
        />
      ))}
      {/* Stall 1 */}
      <path d="M8 20 Q18 12 28 20 Q38 12 48 20" fill="none" stroke={RED} strokeWidth="1.2" />
      <rect x="8" y="20" width="40" height="22" rx="1" fill="none" stroke={S} strokeWidth="1" />
      {/* Fruits */}
      <circle cx="16" cy="30" r="3" fill={AMBER} />
      <circle cx="24" cy="30" r="3" fill={GREEN} />
      <circle cx="32" cy="30" r="3" fill={RED} />
      <circle cx="40" cy="30" r="3" fill={AMBER} />
      {/* Stall 2 */}
      <path d="M58 18 Q68 10 78 18 Q88 10 98 18" fill="none" stroke={CYAN} strokeWidth="1.2" />
      <rect x="58" y="18" width="40" height="22" rx="1" fill="none" stroke={S} strokeWidth="1" />
      {/* Textiles */}
      <rect x="64" y="24" width="10" height="10" rx="1" fill={VIOLET} />
      <rect x="78" y="24" width="10" height="10" rx="1" fill={CYAN} />
      {/* Stall 3 */}
      <path d="M108 20 Q118 12 128 20 Q138 12 148 20" fill="none" stroke={AMBER} strokeWidth="1.2" />
      <rect x="108" y="20" width="40" height="22" rx="1" fill="none" stroke={S} strokeWidth="1" />
      {/* Spices jars */}
      <rect x="114" y="26" width="7" height="10" rx="1" fill={RED} />
      <rect x="124" y="26" width="7" height="10" rx="1" fill={AMBER} />
      <rect x="134" y="26" width="7" height="10" rx="1" fill={GREEN} />
      {/* Stall 4 */}
      <path d="M158 18 Q168 10 178 18 Q188 10 198 18" fill="none" stroke={GREEN} strokeWidth="1.2" />
      <rect x="158" y="18" width="40" height="22" rx="1" fill="none" stroke={S} strokeWidth="1" />
      {/* Ground */}
      <line x1="0" y1="44" x2="200" y2="44" stroke={SL} strokeWidth="0.6" />
    </>
  );
}

function SceneMontagne() {
  return (
    <>
      {/* Stars */}
      {[
        [15, 5],
        [38, 3],
        [65, 7],
        [92, 2],
        [120, 6],
        [148, 4],
        [175, 5],
        [55, 10],
        [140, 9],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={0.8} fill="rgba(255,255,255,0.35)" />
      ))}
      {/* Moon */}
      <circle cx="170" cy="10" r="6" fill="none" stroke={S} strokeWidth="1" />
      <circle cx="172" cy="8" r="5" fill="rgba(15,23,42,0.9)" />
      {/* Back mountains */}
      <path d="M-10 60 L30 16 L50 28 L90 8 L120 22 L160 12 L200 28 L210 60 Z" fill="none" stroke={SL} strokeWidth="1" />
      {/* Front mountains */}
      <path
        d="M-10 60 L20 28 L45 40 L80 20 L110 34 L150 22 L190 38 L210 60 Z"
        fill="none"
        stroke={S}
        strokeWidth="1.5"
      />
      {/* Snow caps */}
      <path d="M86 8 L90 8 L94 8 L92 14 L88 14 Z" fill="rgba(255,255,255,0.2)" stroke={S} strokeWidth="0.6" />
      <path d="M156 12 L160 12 L164 12 L162 16 L158 16 Z" fill="rgba(255,255,255,0.15)" stroke={S} strokeWidth="0.6" />
      {/* Pine trees */}
      {[12, 42, 68, 108, 142, 175, 194].map((x) => (
        <g key={x}>
          <line x1={x} y1={50} x2={x} y2={58} stroke={GREEN} strokeWidth="1.5" />
          <path d={`M${x - 5} 52 L${x} 42 L${x + 5} 52 Z`} fill="none" stroke={GREEN} strokeWidth="1" />
          <path d={`M${x - 4} 48 L${x} 38 L${x + 4} 48 Z`} fill="none" stroke={GREEN} strokeWidth="0.8" />
        </g>
      ))}
    </>
  );
}

function SceneStudio() {
  return (
    <>
      {/* Ceiling rail */}
      <line x1="0" y1="4" x2="200" y2="4" stroke={S} strokeWidth="1" />
      {/* Spot beams */}
      <path d="M30 8 L14 38 L46 38 Z" fill="none" stroke={AMBER} strokeWidth="0.6" />
      <path d="M100 8 L84 38 L116 38 Z" fill="none" stroke={CYAN} strokeWidth="0.6" />
      <path d="M170 8 L154 38 L186 38 Z" fill="none" stroke={AMBER} strokeWidth="0.6" />
      {/* Spot fixtures */}
      <rect x="24" y="2" width="12" height="8" rx="2" fill="none" stroke={S} strokeWidth="1" />
      <circle cx="30" cy="10" r="3" fill={AMBER} />
      <rect x="94" y="2" width="12" height="8" rx="2" fill="none" stroke={S} strokeWidth="1" />
      <circle cx="100" cy="10" r="3" fill={CYAN} />
      <rect x="164" y="2" width="12" height="8" rx="2" fill="none" stroke={S} strokeWidth="1" />
      <circle cx="170" cy="10" r="3" fill={AMBER} />
      {/* Camera */}
      <rect x="145" y="34" width="22" height="14" rx="2" fill="none" stroke={S} strokeWidth="1.2" />
      <rect x="167" y="38" width="10" height="6" rx="1" fill="none" stroke={S} strokeWidth="0.8" />
      <circle cx="156" cy="41" r="5" fill="none" stroke={CYAN} strokeWidth="1" />
      <circle cx="156" cy="41" r="2" fill={CYAN} />
      {/* Tripod */}
      <line x1="150" y1="48" x2="142" y2="60" stroke={S} strokeWidth="1" />
      <line x1="156" y1="48" x2="156" y2="60" stroke={S} strokeWidth="1" />
      <line x1="162" y1="48" x2="170" y2="60" stroke={S} strokeWidth="1" />
      {/* Clapperboard */}
      <rect x="22" y="36" width="26" height="18" rx="1" fill="none" stroke={S} strokeWidth="1.2" />
      <line x1="22" y1="44" x2="48" y2="44" stroke={S} strokeWidth="0.8" />
      <line x1="28" y1="36" x2="32" y2="44" stroke={S} strokeWidth="1.5" />
      <line x1="38" y1="36" x2="42" y2="44" stroke={S} strokeWidth="1.5" />
      {/* Director chair */}
      <rect x="78" y="40" width="16" height="18" rx="1" fill="none" stroke={RED} strokeWidth="1" />
      <line x1="78" y1="48" x2="94" y2="48" stroke={RED} strokeWidth="0.8" />
      {/* Film reel */}
      <circle cx="78" cy="16" r="7" fill="none" stroke={S} strokeWidth="1" />
      <circle cx="78" cy="16" r="2.5" fill="none" stroke={S} strokeWidth="0.8" />
    </>
  );
}

const SCENE_MAP: Record<string, React.FC> = {
  cite: SceneCite,
  ecole: SceneEcole,
  cinema: SceneCinema,
  plage: ScenePlage,
  concert: SceneConcert,
  marche: SceneMarche,
  montagne: SceneMontagne,
  studio: SceneStudio,
};

export function SceneBackground({ scene, className }: SceneBackgroundProps) {
  const Component = SCENE_MAP[scene] ?? SceneCite;
  return (
    <svg viewBox="0 0 200 60" fill="none" className={className} preserveAspectRatio="xMidYMax slice">
      <Component />
    </svg>
  );
}
