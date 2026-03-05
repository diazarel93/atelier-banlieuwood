export function CinemaLoader({ label }: { label?: string }) {
  return (
    <div className="min-h-[60dvh] flex flex-col items-center justify-center gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-bw-primary/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-bw-primary animate-spin" />
      </div>
      {label && <p className="text-sm text-bw-muted animate-pulse">{label}</p>}
    </div>
  );
}
