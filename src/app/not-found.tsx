import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-studio relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-bw-primary/[0.04] blur-[140px]" />
        <div className="absolute bottom-1/4 left-1/4 h-[300px] w-[300px] rounded-full bg-bw-teal/[0.03] blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center animate-[page-fade-in_600ms_cubic-bezier(0.4,0,0.2,1)_forwards]">
        {/* 404 monumental */}
        <div className="relative">
          {/* Ghost glow behind the number */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="bw-display text-[12rem] leading-none tracking-wider text-bw-primary/[0.06] blur-2xl select-none sm:text-[16rem]"
              aria-hidden="true"
            >
              404
            </span>
          </div>
          <h1 className="bw-display text-gradient-cinema relative text-[10rem] leading-none tracking-wider select-none sm:text-[14rem]">
            404
          </h1>
        </div>

        {/* Separator */}
        <div className="mt-2 h-px w-32 bg-gradient-to-r from-transparent via-bw-primary/30 to-transparent" />

        {/* Subtitle */}
        <p className="bw-display mt-6 text-2xl uppercase tracking-[0.15em] text-bw-heading sm:text-3xl">
          Scene introuvable
        </p>

        {/* Description */}
        <p className="mt-4 max-w-md text-sm leading-relaxed text-bw-muted">
          Cette page n&apos;existe pas dans le scenario. Le realisateur a du couper cette scene au montage.
        </p>

        {/* CTA — glass button */}
        <Link
          href="/"
          className="glass-card btn-glow group mt-10 inline-flex items-center gap-3 rounded-xl px-8 py-3.5 text-sm font-semibold tracking-wide text-bw-heading transition-all duration-300 hover:border-bw-primary/20 hover:shadow-[0_0_24px_rgba(255,107,53,0.15)] hover:text-white"
        >
          <svg
            className="h-4 w-4 text-bw-muted transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:text-bw-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Retour a l&apos;accueil
        </Link>

        {/* Film strip decoration */}
        <div className="mt-16 flex items-center gap-2 opacity-20">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-1.5 w-6 rounded-full bg-bw-muted" style={{ opacity: i === 3 ? 1 : 0.4 }} />
          ))}
        </div>
      </div>
    </div>
  );
}
