/** Minimal dark SVG skyline — subtle Banlieuwood backdrop */
export function CitySkyline({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 60" fill="none" className={className} preserveAspectRatio="xMidYMax slice">
      {/* buildings */}
      <rect x="10" y="20" width="22" height="40" rx="1" fill="rgba(255,255,255,0.04)" />
      <rect x="40" y="8" width="18" height="52" rx="1" fill="rgba(255,255,255,0.05)" />
      <rect x="65" y="25" width="26" height="35" rx="1" fill="rgba(255,255,255,0.035)" />
      <rect x="100" y="14" width="20" height="46" rx="1" fill="rgba(255,255,255,0.045)" />
      <rect x="128" y="22" width="24" height="38" rx="1" fill="rgba(255,255,255,0.04)" />
      <rect x="160" y="10" width="16" height="50" rx="1" fill="rgba(255,255,255,0.05)" />
      {/* windows */}
      <rect x="15" y="26" width="3" height="3" rx="0.5" fill="rgba(245,158,11,0.35)" />
      <rect x="22" y="34" width="3" height="3" rx="0.5" fill="rgba(6,182,212,0.3)" />
      <rect x="44" y="14" width="3" height="3" rx="0.5" fill="rgba(6,182,212,0.25)" />
      <rect x="50" y="24" width="3" height="3" rx="0.5" fill="rgba(245,158,11,0.3)" />
      <rect x="104" y="20" width="3" height="3" rx="0.5" fill="rgba(245,158,11,0.3)" />
      <rect x="112" y="30" width="3" height="3" rx="0.5" fill="rgba(6,182,212,0.25)" />
      <rect x="133" y="28" width="3" height="3" rx="0.5" fill="rgba(6,182,212,0.3)" />
      <rect x="164" y="18" width="3" height="3" rx="0.5" fill="rgba(245,158,11,0.25)" />
    </svg>
  );
}
