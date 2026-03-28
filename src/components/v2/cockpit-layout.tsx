/**
 * CockpitLayoutV2 — V6 deep dark cinema
 * Dark ambient glows with violet/indigo accents.
 */
export function CockpitLayoutV2({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-dvh text-bw-heading"
      style={{
        backgroundColor: "var(--color-bw-bg)",
      }}
    >
      {/* V6 ambient glow spots — deep violet/indigo */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(ellipse at center, rgba(139,92,246,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-48 -right-48 w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(ellipse at center, rgba(99,102,241,0.06) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[500px]"
          style={{
            background: "radial-gradient(ellipse at center, rgba(139,92,246,0.04) 0%, transparent 55%)",
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full"
          style={{
            background: "radial-gradient(ellipse at center, rgba(34,211,238,0.03) 0%, transparent 65%)",
          }}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
