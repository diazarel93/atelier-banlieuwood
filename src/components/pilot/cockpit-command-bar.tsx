"use client";

import { Breadcrumb } from "@/components/breadcrumb";
import { CountdownTimer } from "@/components/countdown-timer";
import { PulseRing, type StudentState } from "./pulse-ring";
import { getSeanceMax } from "@/lib/constants";

interface CommandBarProps {
  sessionTitle: string;
  moduleLabel: string;
  moduleColor: string;
  currentModule: number;
  currentSeance: number;
  currentIndex: number;
  status: string;
  timerEndsAt: string | null;
  studentStates: { id: string; state: StudentState }[];
  showGuide: boolean;
  onBack: () => void;
  onGoToQuestion: (index: number) => void;
  onToggleGuide: () => void;
  sessionId: string;
}

export function CockpitCommandBar({
  sessionTitle,
  moduleLabel,
  currentModule,
  currentSeance,
  currentIndex,
  status,
  timerEndsAt,
  studentStates,
  showGuide,
  onBack,
  onGoToQuestion,
  onToggleGuide,
  sessionId,
}: CommandBarProps) {
  const maxSituations = getSeanceMax(currentModule, currentSeance);

  return (
    <header className="glass sticky top-0 z-20 h-14 flex items-center px-4 flex-shrink-0 border-b border-white/[0.06]">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Back button */}
        <button
          onClick={onBack}
          className="text-bw-muted hover:text-white transition-colors cursor-pointer text-sm flex-shrink-0"
        >
          ←
        </button>

        {/* Breadcrumb — hidden on small screens */}
        <div className="hidden md:block">
          <Breadcrumb
            items={[
              { label: sessionTitle || "Session" },
              { label: moduleLabel },
              { label: `Q${currentIndex + 1}/${maxSituations}` },
            ]}
          />
        </div>

        {/* Mobile compact title */}
        <span className="md:hidden text-sm text-bw-muted truncate">
          Q{currentIndex + 1}/{maxSituations}
        </span>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-1 mx-4">
        {Array.from({ length: maxSituations }, (_, i) => (
          <button
            key={i}
            onClick={() => onGoToQuestion(i)}
            className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all ${
              i === currentIndex
                ? "bg-bw-primary scale-125"
                : i < currentIndex
                  ? "bg-bw-teal"
                  : "bg-bw-elevated hover:bg-bw-muted/30"
            }`}
          />
        ))}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Timer */}
        {timerEndsAt && new Date(timerEndsAt).getTime() > Date.now() && (
          <CountdownTimer endsAt={timerEndsAt} size="sm" />
        )}

        {/* Pulse ring */}
        <PulseRing students={studentStates} size={36} />

        {/* Projection */}
        <button
          onClick={() => window.open(`/session/${sessionId}/screen`, "_blank")}
          className="hidden md:block btn-glow px-3 py-1.5 rounded-xl border border-bw-violet/20 hover:border-bw-violet/40 text-xs cursor-pointer text-bw-violet hover:bg-bw-violet/10 transition-colors"
        >
          Écran ↗
        </button>

        {/* Guide toggle */}
        <button
          onClick={onToggleGuide}
          className={`btn-glow px-3 py-1.5 rounded-xl border text-xs cursor-pointer transition-colors font-medium ${
            showGuide
              ? "bg-bw-primary/15 border-bw-primary/40 text-bw-primary"
              : "bg-bw-elevated border-bw-gold/20 text-bw-gold hover:border-bw-gold/40 hover:bg-bw-gold/10"
          }`}
        >
          Guide
        </button>
      </div>
    </header>
  );
}
