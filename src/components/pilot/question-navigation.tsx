"use client";

export interface QuestionNavigationProps {
  maxSituations: number;
  currentQIndex: number;
  displayIndex: number;
  isPreviewing: boolean;
  moduleColor: string;
  onPreviewSituation: (index: number) => void;
  onPreviewPrev: () => void;
  onPreviewNext: () => void;
}

export function QuestionNavigation({
  maxSituations,
  currentQIndex,
  displayIndex,
  isPreviewing,
  moduleColor,
  onPreviewSituation,
  onPreviewPrev,
  onPreviewNext,
}: QuestionNavigationProps) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {Array.from({ length: maxSituations }, (_, i) => {
        const isLive = i === currentQIndex;
        const isPreview = i === displayIndex;
        const isPast = i < currentQIndex;
        return (
          <button key={i} onClick={() => onPreviewSituation(i)}
            className={`w-9 h-9 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 flex items-center justify-center ${
              isPreview ? "text-white scale-110 shadow-lg"
                : isLive ? "ring-2 ring-offset-1 ring-offset-bw-bg text-white"
                : isPast ? "bg-bw-teal/15 text-bw-teal"
                : "bg-bw-elevated text-bw-muted hover:text-bw-text hover:bg-bw-surface"
            }`}
            style={isPreview
              ? { backgroundColor: isPreviewing ? "#F59E0B" : moduleColor, boxShadow: `0 0 12px ${isPreviewing ? "#F59E0B" : moduleColor}40` }
              : isLive && isPreviewing ? { backgroundColor: moduleColor } : undefined
            }>
            {isPast && !isPreview ? (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 12l5 5L20 7"/></svg>
            ) : i + 1}
          </button>
        );
      })}
      <div className="flex-1" />
      <button onClick={onPreviewPrev} disabled={displayIndex <= 0}
        className="px-3 py-2 rounded-xl text-sm text-bw-muted hover:text-bw-heading bg-bw-elevated border border-black/[0.04] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200">
        ←
      </button>
      <button onClick={onPreviewNext} disabled={displayIndex >= maxSituations - 1}
        className="px-3 py-2 rounded-xl text-sm text-bw-muted hover:text-bw-heading bg-bw-elevated border border-black/[0.04] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200">
        →
      </button>
    </div>
  );
}
