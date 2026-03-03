"use client";

export function XpBar({
  current,
  max,
  label,
}: {
  current: number;
  max: number;
  label?: string;
}) {
  const pct = max > 0 ? Math.round((current / max) * 100) : 0;
  return (
    <div className="space-y-1">
      {label && (
        <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
          <span>{label}</span>
          <span>
            {current}/{max} XP
          </span>
        </div>
      )}
      <div className="h-3 bg-black/20 dark:bg-white/10 rounded-full overflow-hidden relative">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-400 transition-all duration-1000 ease-out relative"
          style={{ width: `${pct}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/25 to-transparent rounded-full" />
        </div>
      </div>
    </div>
  );
}
