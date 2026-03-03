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
  rightPanelOpen: boolean;
  moduleView: "briefing" | "cockpit";
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onCopyCode: () => void;
  onToggleQR: () => void;
  onOpenScreen: () => void;
  onToggleRightPanel: () => void;
  onTogglePause: () => void;
  onClearTimer: () => void;
  onToggleStudents: () => void;
  showStudents: boolean;
  currentQuestionIndex?: number;
  totalQuestions?: number;
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
  rightPanelOpen,
  moduleView,
  sidebarCollapsed,
  onToggleSidebar,
  onCopyCode,
  onToggleQR,
  onOpenScreen,
  onToggleRightPanel,
  onTogglePause,
  onClearTimer,
  onToggleStudents,
  showStudents,
  currentQuestionIndex,
  totalQuestions,
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
            className="lg:hidden text-bw-muted hover:text-white cursor-pointer transition-colors p-1"
            title="Menu modules"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>

          <Link href="/" className="text-xs font-bold tracking-[0.12em] uppercase hidden sm:inline-flex flex-shrink-0 hover:opacity-80 transition-opacity">
            <BrandLogo />
          </Link>
          <div className="w-px h-4 bg-white/10 hidden sm:block flex-shrink-0" />
          <span className="text-xs text-bw-muted truncate max-w-[120px]">{sessionTitle}</span>
        </div>

        {/* Center: active module info */}
        {activeModuleLabel && (
          <div className="flex items-center gap-2 ml-2">
            <div className="w-px h-4 bg-white/10 flex-shrink-0" />
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: moduleColor }} />
            <span className="text-sm font-semibold whitespace-nowrap text-gradient-cinema">{activeModuleLabel}</span>
            {questionCounter && (
              <span className="text-sm text-bw-muted">{questionCounter}</span>
            )}
            {/* Mini dots progress */}
            {totalQuestions != null && totalQuestions > 0 && currentQuestionIndex != null && (
              <div className="hidden sm:flex items-center gap-[3px] ml-1">
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
        <div className="flex items-center gap-1.5">
          {/* Timer badge */}
          {hasTimer && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-bw-primary/10 border border-bw-primary/20">
              <CountdownTimer endsAt={timerEndsAt!} size="sm" />
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
            className="hidden sm:flex items-center gap-1.5 bg-bw-elevated px-2 py-1.5 rounded-xl border border-white/[0.06] hover:border-white/15 cursor-pointer transition-colors duration-200">
            <span className="font-mono font-bold text-[11px] tracking-wider">{joinCode}</span>
            <span className="text-[10px] text-bw-muted">{codeCopied ? "✓" : "Copier"}</span>
          </button>

          {/* QR */}
          <button onClick={onToggleQR}
            className="hidden sm:block px-2 py-1.5 bg-bw-elevated rounded-xl border border-white/[0.06] hover:border-white/15 text-[10px] text-bw-muted hover:text-white cursor-pointer transition-colors duration-200">
            QR
          </button>

          {/* Projection */}
          <button onClick={onOpenScreen}
            className="px-2 py-1.5 bg-bw-elevated rounded-xl border border-white/[0.06] hover:border-white/15 text-[11px] cursor-pointer text-bw-muted hover:text-white transition-colors duration-200"
            title="Ouvrir l'écran de projection">
            Écran ↗
          </button>

          {/* Right panel toggle — desktop only, cockpit view only */}
          {moduleView === "cockpit" && activeModuleLabel && (
            <button onClick={onToggleRightPanel}
              className={`hidden lg:inline-flex px-2 py-1.5 rounded-xl border text-[11px] cursor-pointer transition-colors duration-200 ${
                rightPanelOpen ? "bg-bw-primary/10 border-bw-primary/30 text-bw-primary" : "bg-bw-elevated border-white/[0.06] text-bw-muted hover:text-white"
              }`}
              title={rightPanelOpen ? "Masquer le panneau" : "Afficher le panneau"}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M15 3v18" />
              </svg>
            </button>
          )}

          {/* Pause/Resume */}
          {activeModuleLabel && !isDone && (
            <button onClick={onTogglePause}
              className={`px-2 py-1.5 rounded-xl border text-[11px] cursor-pointer transition-colors duration-200 ${
                isPaused ? "bg-bw-amber/10 border-bw-amber/30 text-bw-amber" : "bg-bw-elevated border-white/[0.06] text-bw-muted hover:text-white"
              }`}>
              {isPaused ? "Reprendre" : "Pause"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
