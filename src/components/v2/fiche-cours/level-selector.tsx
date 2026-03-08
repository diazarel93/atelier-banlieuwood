"use client";

import { GlassCardV2 } from "@/components/v2/glass-card";

const LEVEL_OPTIONS = [
  { value: "primaire", label: "Primaire (Cycle 3)" },
  { value: "college", label: "Collège (Cycle 4)" },
  { value: "lycee", label: "Lycée" },
] as const;

interface LevelSelectorProps {
  level: string;
  onLevelChange: (level: string) => void;
  onGenerate: () => void;
  loading: boolean;
}

export function LevelSelector({
  level,
  onLevelChange,
  onGenerate,
  loading,
}: LevelSelectorProps) {
  return (
    <GlassCardV2 className="p-6 space-y-4">
      <p className="text-sm font-medium text-bw-muted">Niveau</p>
      <div className="flex gap-3">
        {LEVEL_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onLevelChange(opt.value)}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              level === opt.value
                ? "bg-bw-primary text-white"
                : "border border-[var(--color-bw-border)] text-bw-heading hover:bg-[var(--color-bw-surface-dim)]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <button
        onClick={onGenerate}
        disabled={loading}
        className="w-full rounded-xl bg-bw-primary px-4 py-3 text-sm font-semibold text-white hover:bg-bw-primary-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed btn-glow"
      >
        {loading ? "Génération en cours..." : "Générer la fiche"}
      </button>
    </GlassCardV2>
  );
}
