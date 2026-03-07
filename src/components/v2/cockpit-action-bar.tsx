"use client";

import { cn } from "@/lib/utils";

interface CockpitActionBarProps {
  onNext?: () => void;
  onPrevious?: () => void;
  onPause?: () => void;
  onEnd?: () => void;
  isPaused?: boolean;
  currentLabel?: string;
  className?: string;
}

export function CockpitActionBar({
  onNext,
  onPrevious,
  onPause,
  onEnd,
  isPaused,
  currentLabel,
  className,
}: CockpitActionBarProps) {
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t border-[#DDD7EC] bg-white/90 backdrop-blur-xl",
        className
      )}
    >
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 sm:px-6">
        {/* Left: navigation */}
        <div className="flex items-center gap-2">
          {onPrevious && (
            <button
              type="button"
              onClick={onPrevious}
              className="rounded-lg border border-[#DDD7EC] px-3 py-1.5 text-sm font-medium text-bw-muted hover:text-bw-heading hover:bg-[#EDE9F7] transition-colors"
            >
              Précédent
            </button>
          )}
        </div>

        {/* Center: current label */}
        {currentLabel && (
          <span className="text-sm font-medium text-bw-heading">
            {currentLabel}
          </span>
        )}

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          {onPause && (
            <button
              type="button"
              onClick={onPause}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                isPaused
                  ? "border-amber-300 bg-amber-50 text-amber-700"
                  : "border-[#DDD7EC] text-bw-muted hover:text-bw-heading hover:bg-[#EDE9F7]"
              )}
            >
              {isPaused ? "Reprendre" : "Pause"}
            </button>
          )}
          {onNext && (
            <button
              type="button"
              onClick={onNext}
              className="rounded-lg bg-bw-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-bw-primary-500 transition-colors btn-glow"
            >
              Suivant
            </button>
          )}
          {onEnd && (
            <button
              type="button"
              onClick={onEnd}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              Terminer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
