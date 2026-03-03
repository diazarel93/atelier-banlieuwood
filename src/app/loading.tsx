export default function Loading() {
  return (
    <div className="bg-studio relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-bw-primary/[0.05] blur-[100px] animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo / Brand mark with pulsating glow */}
        <div className="relative flex items-center justify-center">
          {/* Outer glow ring */}
          <div className="absolute h-28 w-28 animate-[pulse_2.5s_cubic-bezier(0.4,0,0.6,1)_infinite] rounded-full bg-bw-primary/10 blur-2xl" />

          {/* Glass container */}
          <div className="glass-card relative flex h-20 w-20 items-center justify-center rounded-2xl shadow-[0_0_24px_rgba(255,107,53,0.15)]">
            <span className="bw-display text-gradient-cinema text-3xl tracking-widest select-none">
              BW
            </span>
          </div>
        </div>

        {/* Spinner bar */}
        <div className="flex flex-col items-center gap-4">
          {/* Progress bar with gradient */}
          <div className="h-0.5 w-48 overflow-hidden rounded-full bg-bw-border">
            <div
              className="h-full w-1/2 rounded-full bg-gradient-to-r from-bw-primary via-bw-gold to-bw-primary"
              style={{
                animation: "loading-slide 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite",
              }}
            />
          </div>

          {/* Text */}
          <p className="text-xs tracking-[0.2em] uppercase text-bw-muted animate-pulse">
            Chargement...
          </p>
        </div>
      </div>

      {/* Keyframe for the sliding bar */}
      <style>{`
        @keyframes loading-slide {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  )
}
