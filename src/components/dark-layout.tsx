export function DarkLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="theme-lavande dark min-h-dvh text-bw-heading"
      data-theme="dark"
      style={{
        backgroundColor: "#0c0c18",
        background: "linear-gradient(145deg, #0c0c18 0%, #0a0a16 35%, #0c0c18 100%)",
      }}
    >
      {/* Cinematic ambient glow spots */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(ellipse at center, rgba(255,107,53,0.045) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-48 -right-48 w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(ellipse at center, rgba(78,205,196,0.03) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px]"
          style={{
            background: "radial-gradient(ellipse at center, rgba(139,92,246,0.02) 0%, transparent 60%)",
          }}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
