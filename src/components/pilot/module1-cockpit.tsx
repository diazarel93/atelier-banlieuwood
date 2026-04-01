"use client";

import { motion } from "motion/react";
import { SafeImage } from "@/components/safe-image";

interface Module1Option {
  key: string;
  label: string;
}

interface Module1CockpitProps {
  /** M1 positioning: show option distribution bars */
  isPositioning: boolean;
  /** M1 image: show image display */
  isImage: boolean;
  /** Module1 situationData */
  module1Data:
    | {
        type: string;
        questions?: { index: number; situationId: string; text: string; measure: string; options?: Module1Option[] }[];
        optionDistribution?: Record<string, number> | null;
        image?: { position: number; title: string; description: string; url: string } | null;
      }
    | undefined;
  currentQIndex: number;
  activeStudentCount: number;
  isPreviewing: boolean;
}

const OPTION_COLORS: Record<string, { bg: string; bgLight: string }> = {
  a: { bg: "#7EA7F5", bgLight: "#EEF3FF" },
  b: { bg: "#F3A765", bgLight: "#FFF3E8" },
  c: { bg: "#6EC6B0", bgLight: "#E9F8F4" },
  d: { bg: "#E78BB4", bgLight: "#FDECF4" },
};

export function Module1Cockpit({
  isPositioning,
  isImage,
  module1Data,
  currentQIndex,
  activeStudentCount,
  isPreviewing,
}: Module1CockpitProps) {
  return (
    <>
      {/* M1 Positioning: option distribution bars */}
      {isPositioning &&
        module1Data?.type === "positioning" &&
        !isPreviewing &&
        module1Data.questions?.[currentQIndex]?.options &&
        (() => {
          const allCounts =
            module1Data.questions![currentQIndex].options?.map((o) => module1Data.optionDistribution?.[o.key] || 0) ||
            [];
          const maxCount = Math.max(...allCounts, 0);
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="group" aria-label="Distribution des reponses">
              {module1Data.questions![currentQIndex].options?.map((opt) => {
                const count = module1Data.optionDistribution?.[opt.key] || 0;
                const total = activeStudentCount;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                const colors = OPTION_COLORS[opt.key] || OPTION_COLORS.a;
                const hasVotes = count > 0;
                const isDominant =
                  count > 0 && count === maxCount && allCounts.filter((c) => c === maxCount).length === 1;
                return (
                  <motion.div
                    key={opt.key}
                    role="region"
                    aria-label={`Option ${opt.key.toUpperCase()}: ${opt.label} — ${pct}%, ${count} sur ${total} eleves`}
                    animate={isDominant ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                    transition={isDominant ? { repeat: Infinity, duration: 2.5, ease: "easeInOut" } : undefined}
                    className="rounded-[18px] transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
                    style={{
                      padding: "20px 22px",
                      minHeight: 152,
                      background: hasVotes ? colors.bg : colors.bgLight,
                      border: hasVotes ? "none" : `1px solid ${colors.bg}20`,
                      boxShadow: isDominant
                        ? `0 8px 32px ${colors.bg}45, 0 4px 12px ${colors.bg}20`
                        : hasVotes
                          ? `0 6px 24px ${colors.bg}35, 0 2px 6px ${colors.bg}15`
                          : "0 2px 8px rgba(61,43,16,0.04)",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-bold flex-shrink-0"
                        style={{
                          backgroundColor: hasVotes ? "rgba(255,255,255,0.25)" : colors.bg,
                          color: "#fff",
                        }}
                      >
                        {opt.key.toUpperCase()}
                      </span>
                      <span
                        className={`text-[16px] font-medium leading-snug flex-1 min-w-0 ${hasVotes ? "text-white" : "text-[#2C2C2C]"}`}
                      >
                        {opt.label}
                      </span>
                    </div>
                    <div className="mt-auto pt-3 flex items-end gap-4">
                      <span
                        className="text-[40px] font-extrabold tabular-nums leading-none flex-shrink-0"
                        style={{ color: hasVotes ? "#fff" : `${colors.bg}50` }}
                      >
                        {pct}%
                      </span>
                      <div className="flex-1 space-y-1.5">
                        <div
                          className={`h-3 rounded-full overflow-hidden ${hasVotes ? "bg-white/20" : "bg-black/[0.04]"}`}
                        >
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: hasVotes ? "#fff" : colors.bg }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                          />
                        </div>
                        <span
                          className={`text-[12px] tabular-nums font-medium ${hasVotes ? "text-white/80" : "text-[#7A7A7A]"}`}
                        >
                          {count} / {total} eleves
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          );
        })()}

      {/* M1 Image: image display */}
      {isImage && module1Data?.type === "image" && (
        <>
          {module1Data.image ? (
            <div className="space-y-2">
              <div className="rounded-xl overflow-hidden border border-[var(--color-bw-cockpit-border)] bg-bw-cockpit-surface">
                <SafeImage
                  src={module1Data.image.url}
                  alt={module1Data.image.title}
                  width={1200}
                  height={750}
                  className="w-full aspect-[16/10] object-cover"
                />
              </div>
              <p className="text-xs text-bw-muted text-center">{module1Data.image.title}</p>
            </div>
          ) : (
            <div className="rounded-xl bg-bw-cockpit-surface border border-[var(--color-bw-cockpit-border)] aspect-[16/10] flex items-center justify-center">
              <p className="text-sm text-bw-muted">Image non disponible</p>
            </div>
          )}
        </>
      )}
    </>
  );
}
