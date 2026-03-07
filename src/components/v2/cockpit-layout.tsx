/**
 * CockpitLayoutV2 — Light lavande renforcé
 * Replaces DarkLayout for the pilot cockpit.
 * Denser lavande than the dashboard, higher contrast surfaces.
 */
export function CockpitLayoutV2({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="theme-lavande min-h-dvh text-bw-heading"
      style={{
        backgroundColor: "#F0EBF5",
        background:
          "linear-gradient(145deg, #F0EBF5 0%, #EDE8F3 35%, #F0EBF5 100%)",
      }}
    >
      {/* Ambient glow spots — lavande tint */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(107,70,193,0.06) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-48 -right-48 w-[600px] h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(99,102,241,0.04) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(139,92,246,0.03) 0%, transparent 60%)",
          }}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
