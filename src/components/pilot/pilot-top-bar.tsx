"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CountdownTimer } from "@/components/countdown-timer";

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
  onBroadcast,
  onShortcuts,
  muteSounds,
  onToggleMute,
  onTimerExpired,
  onOpenMobileContext,
}: PilotTopBarProps) {
  const hasTimer = timerEndsAt && new Date(timerEndsAt).getTime() > Date.now();
  const [kebabOpen, setKebabOpen] = useState(false);

  return (
    <header className="glass border-b border-white/[0.06] px-3 py-2 flex-shrink-0 z-20">
      <div className="flex items-center gap-2">
        {/* Left: sidebar toggle + session title */}
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
          <span className="text-xs text-bw-muted truncate max-w-[160px] hidden md:inline">{sessionTitle}</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right: timer, students, code, pause, projection, kebab */}
        <div className="flex items-center gap-2">
          {/* Timer badge */}
          {hasTimer && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-bw-primary/10 border border-bw-primary/20">
              <CountdownTimer endsAt={timerEndsAt!} size="sm" onExpired={onTimerExpired} />
              <button onClick={onClearTimer}
                className="text-xs text-bw-primary hover:text-white cursor-pointer ml-0.5">✕</button>
            </div>
          )}

          {/* Students */}
          <button onClick={onToggleStudents}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs cursor-pointer transition-colors duration-200 ${
              showStudents ? "bg-bw-teal/10 border-bw-teal/30 text-bw-teal" : "bg-bw-elevated border-white/[0.06] text-bw-text hover:text-white"
            }`}>
            <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 rounded-full bg-bw-teal" />
            <span className="tabular-nums font-medium">{activeStudents.length}</span>
          </button>

          {/* Join code */}
          <button onClick={onCopyCode}
            className="hidden md:flex items-center gap-1.5 bg-bw-elevated px-2.5 py-1.5 rounded-xl border border-white/[0.06] hover:border-white/15 cursor-pointer transition-colors duration-200">
            <span className="font-mono font-bold text-xs tracking-wider">{joinCode}</span>
            <span className="text-xs text-bw-muted">{codeCopied ? "✓" : "Copier"}</span>
          </button>

          {/* Pause/Resume */}
          {activeModuleLabel && !isDone && (
            <button onClick={onTogglePause}
              className={`px-2.5 py-1.5 rounded-xl border text-xs cursor-pointer transition-colors duration-200 ${
                isPaused ? "bg-bw-amber/10 border-bw-amber/30 text-bw-amber" : "bg-bw-elevated border-white/[0.06] text-bw-muted hover:text-white"
              }`}>
              {isPaused ? "Reprendre" : "Pause"}
            </button>
          )}

          {/* Projection */}
          <button onClick={onOpenScreen}
            className="hidden md:inline-flex px-2.5 py-1.5 bg-bw-elevated rounded-xl border border-white/[0.06] hover:border-white/15 text-xs cursor-pointer text-bw-muted hover:text-white transition-colors duration-200"
            title="Ouvrir l'écran de projection">
            Écran ↗
          </button>

          {/* Mobile context panel */}
          {onOpenMobileContext && moduleView === "cockpit" && activeModuleLabel && (
            <button onClick={onOpenMobileContext}
              className="lg:hidden px-2.5 py-1.5 bg-bw-elevated rounded-xl border border-white/[0.06] hover:border-white/15 text-xs cursor-pointer text-bw-muted hover:text-white transition-colors duration-200"
              title="Panneau contexte">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
              </svg>
            </button>
          )}

          {/* Kebab overflow menu */}
          <div className="relative">
            <button
              onClick={() => setKebabOpen(!kebabOpen)}
              className="hidden md:inline-flex px-2 py-1.5 bg-bw-elevated rounded-xl border border-white/[0.06] hover:border-white/15 text-xs cursor-pointer text-bw-muted hover:text-white transition-colors duration-200"
              title="Plus d'options"
            >
              ⋯
            </button>
            <AnimatePresence>
              {kebabOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setKebabOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1.5 z-50 w-48 bg-bw-surface border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden"
                  >
                    <button onClick={() => { onToggleQR(); setKebabOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs text-bw-text hover:bg-white/[0.06] cursor-pointer transition-colors flex items-center gap-2">
                      <span className="w-5 text-center text-sm">📱</span> QR Code
                    </button>
                    {onToggleMute && (
                      <button onClick={() => { onToggleMute(); setKebabOpen(false); }}
                        className="w-full text-left px-3 py-2 text-xs text-bw-text hover:bg-white/[0.06] cursor-pointer transition-colors flex items-center gap-2">
                        <span className="w-5 text-center text-sm">{muteSounds ? "\uD83D\uDD07" : "\uD83D\uDD0A"}</span>
                        {muteSounds ? "Réactiver les sons" : "Couper les sons"}
                      </button>
                    )}
                    {onBroadcast && activeModuleLabel && (
                      <button onClick={() => { onBroadcast(); setKebabOpen(false); }}
                        className="w-full text-left px-3 py-2 text-xs text-bw-text hover:bg-white/[0.06] cursor-pointer transition-colors flex items-center gap-2">
                        <span className="w-5 text-center text-sm">📢</span> Message classe
                      </button>
                    )}
                    {onShortcuts && (
                      <button onClick={() => { onShortcuts(); setKebabOpen(false); }}
                        className="w-full text-left px-3 py-2 text-xs text-bw-text hover:bg-white/[0.06] cursor-pointer transition-colors flex items-center gap-2">
                        <span className="w-5 text-center text-sm">⌨️</span> Raccourcis clavier
                      </button>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
