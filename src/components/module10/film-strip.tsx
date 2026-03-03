/** Decorative horizontal film strip with perforations */
export function FilmStrip({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 16" fill="none" className={className} preserveAspectRatio="none">
      <rect x="0" y="0" width="200" height="16" rx="2" fill="rgba(6,182,212,0.08)" />
      <rect x="0" y="0" width="200" height="2" fill="rgba(6,182,212,0.15)" />
      <rect x="0" y="14" width="200" height="2" fill="rgba(6,182,212,0.15)" />
      {[20, 60, 100, 140, 180].map((x) => (
        <rect key={x} x={x - 4} y="5" width="8" height="6" rx="1.5" fill="rgba(6,182,212,0.12)" />
      ))}
    </svg>
  );
}
