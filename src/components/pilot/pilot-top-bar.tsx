"use client";

import { motion } from "motion/react";
import { CountdownTimer } from "@/components/countdown-timer";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

interface Student {
  id: string;
  display_name: string;
  avatar: string;
  is_active: boolean;
}

interface PilotTopBarProps {
  sessionTitle: string;
  activeModuleLabel: string | null;
  moduleColor: string;
  questionCounter: string | null;
  activeStudents: Student[];
  joinCode: string;
  codeCopied: boolean;
  timerEndsAt: string | null;
  isPaused: boolean;
  isDone: boolean;
  moduleView: "briefing" | "cockpit";
  onToggleSidebar: () => void;
  onCopyCode: () => void;
  onToggleQR: () => void;
  onOpenScreen: () => void;
  onTogglePause: () => void;
  onClearTimer: () => void;
  onToggleStudents: () => void;
  showStudents: boolean;
  currentQuestionIndex?: number;
  totalQuestions?: number;
  onBroadcast?: () => void;
  onShortcuts?: () => void;
  muteSounds?: boolean;
  onToggleMute?: () => void;
  onTimerExpired?: () => void;
  onOpenMobileContext?: () => void;
}

export function PilotTopBar({
  sessionTitle,
  activeModuleLabel,
  moduleColor,
  questionCounter,
  activeStudents,
  joinCode,
  codeCopied,
  timerEndsAt,
  isPaused,
  isDone,
  moduleView,
  onToggleSidebar,
  onCopyCode,
  onToggleQR,
  onOpenScreen,
  onTogglePause,
  onClearTimer,
  onToggleStudents,
  showStudents,
  currentQuestionIndex,
  totalQuestions,
  onBroadcast,
  onShortcuts,
  muteSounds,
  onToggleMute,
  onTimerExpired,
  onOpenMobileContext,
}: PilotTopBarProps) {
  const hasTimer = timerEndsAt && new Date(timerEndsAt).getTime() > Date.now();

  return (
    <header className="glass border-b border-white/[0.06] px-3 py-2 flex-shrink-0 z-20">
      <div className="flex items-center gap-2">
        {/* Left: sidebar toggle + branding + session title */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Mobile sidebar toggle */}
          <button
            onClick={onToggleSidebar}
            className="sm:hidden text-bw-muted hover:text-white cursor-pointer transition-colors p-1"
            title="Menu modules"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>

          <Link href="/" className="text-xs font-bold tracking-[0.12em] uppercase hidden lg:inline-flex flex-shrink-0 hover:opacity-80 transition-opacity">
            <BrandLogo />
          </Link>
          <div className="w-px h-4 bg-white/10 hidden lg:block flex-shrink-0" />
          <span className="text-xs text-bw-muted truncate max-w-[160px] hidden md:inline">{sessionTitle}</span>
        </div>

        {/* Center: active module info */}
        {activeModuleLabel && (
          <div className="flex items-center gap-2 ml-2">
            <div className="w-px h-4 bg-white/10 flex-shrink-0" />
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: moduleColor }} />
            <span className="text-sm font-semibold truncate max-w-[120px] md:max-w-[180px] text-gradient-cinema">{activeModuleLabel}</span>
            {questionCounter && (
              <span className="text-sm text-bw-muted">{questionCounter}</span>
            )}
            {/* Mini dots progress */}
            {totalQuestions != null && totalQuestions > 0 && currentQuestionIndex != null && (
              <div className="hidden lg:flex items-center gap-[3px] ml-1">
                {Array.from({ length: totalQuestions }, (_, i) => {
                  const isPast = i < currentQuestionIndex;
                  const isCurrent = i === currentQuestionIndex;
                  return (
                    <div key={i} className="relative">
                      <div
                        className={`w-[5px] h-[5px] rounded-full transition-colors ${
                          isPast ? "bg-bw-teal" : isCurrent ? "" : "bg-bw-elevated"
                        }`}
                        style={isCurrent ? { backgroundColor: moduleColor } : undefined}
                      />
                      {isCurrent && (
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          style={{ backgroundColor: moduleColor }}
                          animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right: students, code, timer, controls */}
        <div className="flex items-center gap-2">
          {/* Timer badge */}
          {hasTimer && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-bw-primary/10 border border-bw-primary/20">
              <CountdownTimer endsAt={timerEndsAt!} size="sm" onExpired={onTimerExpired} />
              <button onClick={onClearTimer}
                className="text-[10px] text-bw-primary hover:text-white cursor-pointer ml-0.5">✕</button>
            </div>
          )}

          {/* Students */}
          <button onClick={onToggleStudents}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl border text-xs cursor-pointer transition-colors duration-200 ${
              showStudents ? "bg-bw-teal/10 border-bw-teal/30 text-bw-teal" : "bg-bw-elevated border-white/[0.06] text-bw-text hover:text-white"
            }`}>
            <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 rounded-full bg-bw-teal" />
            <span className="tabular-nums font-medium">{activeStudents.length}</span>
          </button>

          {/* Join code */}
          <button onClick={onCopyCode}
            className="hidden md:flex items-center gap-1.5 bg-bw-elevated px-2 py-1.5 rounded-xl border border-white/[0.06] hover:border-white/15 cursor-pointer transition-colors duration-200">
            <span className="font-mono font-bold text-[11px] tracking-wider">{joinCode}</span>
            <span className="text-[10px] text-bw-muted">{codeCopied ? "✓" : "Copier"}</span>
          </button>

          {/* QR */}
          <button onClick={onToggleQR}
            className="hidden md:inline-flex px-2 py-1.5 bg-bw-elevated rounded-xl border border-white/[0.06] hover:border-white/15 text-[10px] text-bw-muted hover:text-white cursor-pointer transition-colors duration-200">
            QR
          </button>

          {/* Mute toggle */}
          {onToggleMute && (
            <button onClick={onToggleMute}
              className={`hidden md:inline-flex px-2 py-1.5 rounded-xl border text-[11px] cursor-pointer transition-colors duration-200 ${
                muteSounds ? "bg-bw-amber/10 border-bw-amber/30 text-bw-amber" : "bg-bw-elevated border-white/[0.06] text-bw-muted hover:text-white"
              }`}
              title={muteSounds ? "Réactiver les sons élèves" : "Couper les sons élèves"}>
              {muteSounds ? "\uD83D\uDD07" : "\uD83D\uDD0A"}
            </button>
          )}

          {/* Broadcast */}
          {onBroadcast && activeModuleLabel && (
            <button onClick={onBroadcast}
              className="hidden md:inline-flex px-2 py-1.5 bg-bw-elevated rounded-xl border border-white/[0.06] hover:border-bw-primary/30 hover:bg-bw-primary/10 text-[11px] cursor-pointer text-bw-muted hover:text-bw-primary transition-colors duration-200"
              title="Message à toute la classe (B)">
              📢
            </button>
          )}

          {/* Mobile context panel */}
          {onOpenMobileContext && moduleView === "cockpit" && activeModuleLabel && (
            <button onClick={onOpenMobileContext}
              className="lg:hidden px-2 py-1.5 bg-bw-elevated rounded-xl border border-white/[0.06] hover:border-white/15 text-[11px] cursor-pointer text-bw-muted hover:text-white transition-colors duration-200"
              title="Panneau contexte">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
              </svg>
            </button>
          )}

          {/* Projection */}
          <button onClick={onOpenScreen}
            className="hidden md:inline-flex px-2 py-1.5 bg-bw-elevated rounded-xl border border-white/[0.06] hover:border-white/15 text-[11px] cursor-pointer text-bw-muted hover:text-white transition-colors duration-200"
            title="Ouvrir l'écran de projection">
            Écran ↗
          </button>

          {/* Right panel toggle removed — context docks are always floating */}

          {/* Pause/Resume */}
          {activeModuleLabel && !isDone && (
            <button onClick={onTogglePause}
              className={`px-2 py-1.5 rounded-xl border text-[11px] cursor-pointer transition-colors duration-200 ${
                isPaused ? "bg-bw-amber/10 border-bw-amber/30 text-bw-amber" : "bg-bw-elevated border-white/[0.06] text-bw-muted hover:text-white"
              }`}>
              {isPaused ? "Reprendre" : "Pause"}
            </button>
          )}

          {/* Shortcuts */}
          {onShortcuts && (
            <button onClick={onShortcuts}
              className="hidden lg:inline-flex px-2 py-1.5 bg-bw-elevated rounded-xl border border-white/[0.06] hover:border-white/15 text-[10px] cursor-pointer text-bw-muted hover:text-white transition-colors duration-200"
              title="Raccourcis clavier (?)">
              ⌨️
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
