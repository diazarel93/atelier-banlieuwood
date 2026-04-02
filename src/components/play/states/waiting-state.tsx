"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CINEMA_TIPS, type CinemaTip } from "@/lib/cinema-tips";
import { ROUTES } from "@/lib/routes";
import { PHASES, MAIN_PHASE_IDS, getModuleByDb, getPhaseForModule } from "@/lib/modules-data";
import type { SessionState } from "@/hooks/use-session-polling";

export interface WaitingStateProps {
  session: SessionState["session"];
  connectedCount: number;
  crossSessionStreak?: number;
  onReplayTutorial?: () => void;
}

function pickTips(module: number, seance?: number): CinemaTip[] {
  // Filter tips by module, then by seance if available, fallback to generic module tips
  const moduleTips = CINEMA_TIPS.filter((t) => t.module === module);
  const seanceTips = seance ? moduleTips.filter((t) => !t.seance || t.seance === seance) : moduleTips;
  return seanceTips.length > 0 ? seanceTips : moduleTips.length > 0 ? moduleTips : CINEMA_TIPS.slice(0, 20);
}

const TYPE_ICONS: Record<string, string> = {
  technique: "🎬",
  quote: "💬",
  fact: "📖",
  rule: "📏",
  reflection: "💭",
  anecdote: "🎪",
  métier: "🎥",
  réalisateur: "🎬",
  acteur: "🌟",
  rappel: "📌",
  motivation: "💪",
};

export function WaitingState({ session, connectedCount, crossSessionStreak, onReplayTutorial }: WaitingStateProps) {
  const tips = useMemo(
    () => pickTips(session.currentModule || 1, session.currentSeance),
    [session.currentModule, session.currentSeance],
  );
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * tips.length));

  // Rotate tips every 6s
  useEffect(() => {
    if (tips.length <= 1) return;
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [tips.length]);

  const currentTip = tips[tipIndex % tips.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center gap-6 text-center"
    >
      {/* Animated film reel */}
      <div className="relative">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, rgba(255,107,53,0.2), rgba(212,168,67,0.15))" }}
        >
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 8, ease: "linear" }}>
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-bw-primary)"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
              <circle cx="12" cy="5" r="1" fill="var(--color-bw-gold)" stroke="none" />
              <circle cx="17.5" cy="9" r="1" fill="var(--color-bw-gold)" stroke="none" />
              <circle cx="17.5" cy="15" r="1" fill="var(--color-bw-gold)" stroke="none" />
              <circle cx="12" cy="19" r="1" fill="var(--color-bw-gold)" stroke="none" />
              <circle cx="6.5" cy="15" r="1" fill="var(--color-bw-gold)" stroke="none" />
              <circle cx="6.5" cy="9" r="1" fill="var(--color-bw-gold)" stroke="none" />
            </svg>
          </motion.div>
        </motion.div>
        {/* Glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: "2px solid rgba(255,107,53,0.2)" }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
        />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl tracking-wider font-cinema">EN ATTENTE</h2>
        <div className="h-0.5 w-12 mx-auto rounded-full bg-gradient-to-r from-bw-primary to-bw-gold" />
        <p className="text-bw-muted text-sm">Le prof va bientôt lancer la question...</p>
      </div>

      {/* Cross-session streak */}
      {(crossSessionStreak ?? 0) > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 rounded-full px-3 py-1">
            <span>&#128293;</span>
            <span className="text-xs font-bold text-amber-600">
              {crossSessionStreak} session{crossSessionStreak! > 1 ? "s" : ""} d&apos;affil&eacute;e
            </span>
          </div>
        </motion.div>
      )}

      {/* Phase indicator — "Tu es ici" */}
      {(() => {
        const currentModule = getModuleByDb(session.currentModule || 1, session.currentSeance || 1);
        const currentPhase = currentModule ? getPhaseForModule(currentModule.id) : null;
        if (!currentPhase) return null;
        const mainPhases = PHASES.filter((p) => (MAIN_PHASE_IDS as readonly string[]).includes(p.id));
        const currentIdx = mainPhases.findIndex((p) => p.id === currentPhase.id);
        if (currentIdx < 0) return null;
        return (
          <div className="flex flex-col items-center gap-2 max-w-[280px]">
            <p className="text-xs text-bw-muted uppercase tracking-wider">
              Phase {currentIdx + 1} sur {mainPhases.length}
            </p>
            <div className="flex items-center gap-1.5">
              {mainPhases.map((phase, i) => (
                <div
                  key={phase.id}
                  className="w-2.5 h-2.5 rounded-full transition-all"
                  style={{
                    backgroundColor:
                      i < currentIdx ? phase.color : i === currentIdx ? currentPhase.color : "rgba(255,255,255,0.1)",
                    boxShadow: i === currentIdx ? `0 0 8px ${currentPhase.color}60` : "none",
                    transform: i === currentIdx ? "scale(1.3)" : "scale(1)",
                  }}
                />
              ))}
            </div>
            <p className="text-sm font-medium" style={{ color: currentPhase.color }}>
              {currentPhase.emoji} {currentPhase.label}
            </p>
          </div>
        );
      })()}

      <div
        className="rounded-xl px-4 py-2 sm:px-6 sm:py-3 flex items-center gap-3"
        aria-live="polite"
        aria-atomic="true"
        style={{
          background: "linear-gradient(135deg, rgba(78,205,196,0.08), rgba(78,205,196,0.03))",
          border: "1px solid rgba(78,205,196,0.15)",
        }}
      >
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-2.5 h-2.5 rounded-full bg-bw-teal"
          aria-hidden="true"
        />
        <span className="text-sm text-bw-teal font-medium">
          {connectedCount} connect&eacute;{connectedCount > 1 ? "s" : ""}
        </span>
      </div>

      {/* Cinema tip — contextual to the current module */}
      {currentTip && (
        <div className="max-w-[300px] sm:max-w-xs px-4">
          <div
            className="rounded-xl px-4 py-3"
            style={{
              background: "linear-gradient(135deg, rgba(212,168,67,0.08), rgba(139,92,246,0.05))",
              border: "1px solid rgba(212,168,67,0.12)",
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs uppercase tracking-widest text-bw-gold font-bold">
                {TYPE_ICONS[currentTip.type] || "🎬"} Le saviez-vous ?
              </p>
              <span className="text-xs text-bw-muted">
                {tipIndex + 1}/{tips.length}
              </span>
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={tipIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="text-xs text-bw-text leading-relaxed"
              >
                {currentTip.text}
              </motion.p>
            </AnimatePresence>
            {currentTip.source && <p className="text-xs text-bw-muted mt-1 italic">— {currentTip.source}</p>}
          </div>
        </div>
      )}

      {session.title && <p className="text-xs text-bw-gold tracking-[0.2em] uppercase font-medium">{session.title}</p>}

      {/* Library link */}
      <a
        href={ROUTES.playBibliotheque(session.id)}
        className="flex items-center gap-2 text-xs text-bw-muted hover:text-white/60 transition-colors mt-2"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        </svg>
        Ma biblioth&egrave;que
      </a>

      {/* Replay onboarding tutorial */}
      {onReplayTutorial && (
        <button
          onClick={() => {
            localStorage.removeItem("bw-onboarded");
            onReplayTutorial();
          }}
          aria-label="Revoir le tutoriel"
          className="text-[11px] text-bw-muted/60 hover:text-bw-muted transition-colors mt-1 cursor-pointer"
        >
          ? Revoir le tuto
        </button>
      )}
    </motion.div>
  );
}
