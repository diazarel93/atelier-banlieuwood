/**
 * CockpitLayoutV2 — Direction C "Cabine de Projection"
 * Dark cinema canvas with orange cinema ambient glow.
 * Uses --color-bw-cockpit-* tokens (globals.css).
 */
export function CockpitLayoutV2({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-dvh"
      style={{
        backgroundColor: "var(--color-bw-cockpit-canvas)",
        color: "var(--color-bw-cockpit-text)",
      }}
    >
      {/* Ambient glow — halo cinéma orange */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(ellipse at center, rgba(255,107,53,0.06) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-48 -right-48 w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(ellipse at center, rgba(212,168,67,0.04) 0%, transparent 70%)",
          }}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
