"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "motion/react";
import { GlassCardV2 } from "@/components/v2/glass-card";

interface Student {
  id: string;
  display_name: string;
  avatar: string;
  is_active: boolean;
}

interface WelcomePanelProps {
  sessionTitle: string;
  level: string;
  joinCode: string;
  activeStudents: Student[];
  onOpenQR: () => void;
  onCopyCode: () => void;
  formula?: string | null;
  expectedStudents?: number;
  classLabel?: string | null;
}

const FORMULA_LABELS: Record<string, string> = {
  F0: "Decouverte (1 seance)",
  F1: "Legere (~3 seances)",
  F2: "Complete (~8 seances)",
};

export function WelcomePanel({
  sessionTitle,
  level,
  joinCode,
  activeStudents,
  onOpenQR,
  onCopyCode,
  formula,
  expectedStudents,
  classLabel,
}: WelcomePanelProps) {
  const prefersReducedMotion = useReducedMotion();
  const threshold = expectedStudents ? Math.ceil(expectedStudents * 0.8) : null;
  const readyToStart = threshold ? activeStudents.length >= threshold : activeStudents.length > 0;
  const totalExpected = expectedStudents || 25;
  const pct = Math.round((activeStudents.length / totalExpected) * 100);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-120px)] px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.div
            animate={prefersReducedMotion ? {} : { scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="text-5xl"
          >
            🎬
          </motion.div>
          <h1 className="text-heading-lg font-black text-bw-heading">
            {(sessionTitle || "Session").replace(/\s*[-—]\s*$/, "")}
          </h1>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="label-caps px-3 py-1 rounded-lg bg-bw-surface border border-[var(--color-bw-cockpit-border)] text-bw-muted">
              {level}
            </span>
            {classLabel && (
              <span className="label-caps px-3 py-1 rounded-lg bg-bw-primary/10 border border-bw-primary/30 text-bw-primary">
                {classLabel}
              </span>
            )}
            {formula && (
              <span className="label-caps px-3 py-1 rounded-lg bg-bw-teal-readable/10 border border-bw-teal-readable/30 text-bw-teal-readable">
                {formula} — {FORMULA_LABELS[formula] || formula}
              </span>
            )}
          </div>
        </div>

        {/* QR Code card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCardV2 variant="elevated">
            <div className="p-6 text-center space-y-4">
              <p className="label-caps text-bw-muted">Scannez pour rejoindre</p>

              {/* QR placeholder */}
              <button
                onClick={onOpenQR}
                aria-label="Agrandir le QR code"
                className="w-48 h-48 min-h-[44px] min-w-[44px] mx-auto rounded-2xl bg-bw-surface border-2 border-bw-primary/30 flex items-center justify-center cursor-pointer hover:border-bw-primary/60 transition-colors"
              >
                <svg
                  width="100"
                  height="100"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-bw-primary)"
                  strokeWidth="1"
                  strokeLinecap="round"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="3" height="3" />
                  <rect x="18" y="14" width="3" height="3" />
                  <rect x="14" y="18" width="3" height="3" />
                  <rect x="18" y="18" width="3" height="3" />
                </svg>
              </button>

              {/* Join code */}
              <div>
                <p className="text-body-xs text-bw-muted mb-2">Ou entrer le code :</p>
                <button onClick={onCopyCode} aria-label="Copier le code de session" className="cursor-pointer group">
                  <div className="flex gap-2 justify-center">
                    {joinCode.split("").map((char, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: prefersReducedMotion ? 0 : 0.3 + i * 0.06 }}
                        className="w-10 h-12 rounded-xl flex items-center justify-center text-xl font-black font-mono text-bw-primary bg-bw-surface border border-[var(--color-bw-cockpit-border)] group-hover:border-bw-primary/50 transition-colors"
                      >
                        {char}
                      </motion.span>
                    ))}
                  </div>
                  <span className="text-body-xs text-bw-muted mt-2 inline-block group-hover:text-bw-primary transition-colors">
                    Cliquer pour copier
                  </span>
                </button>
              </div>
            </div>
          </GlassCardV2>
        </motion.div>

        {/* Connection status */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GlassCardV2 variant="default">
            <div className="p-4">
              {/* Counter */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <motion.span
                    className="w-2.5 h-2.5 rounded-full bg-bw-teal-readable"
                    animate={prefersReducedMotion ? {} : { scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                  <span className="text-heading-xs font-bold text-bw-teal-readable">{activeStudents.length}</span>
                  <span className="text-body-sm text-bw-muted">/ {totalExpected} connectes</span>
                </div>
                <span className="text-body-sm font-bold text-bw-primary">{pct}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-bw-surface border border-[var(--color-bw-cockpit-border-subtle)] overflow-hidden mb-3">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-bw-teal-readable to-bw-primary"
                  animate={{ width: `${Math.min(pct, 100)}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>

              {/* Threshold indicator */}
              {threshold && (
                <p className="text-body-xs text-bw-muted text-center">
                  {readyToStart ? (
                    <span className="text-bw-teal-readable font-semibold">Seuil 80% atteint — pret a demarrer</span>
                  ) : (
                    <>Demarrage auto a 80% ({threshold} eleves)</>
                  )}
                </p>
              )}

              {/* Student pills */}
              {activeStudents.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {activeStudents.slice(0, 20).map((s, i) => (
                    <motion.span
                      key={s.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: prefersReducedMotion ? 0 : i * 0.03 }}
                      className="text-body-xs px-2.5 py-1 rounded-lg flex items-center gap-1 font-medium bg-bw-surface border border-[var(--color-bw-cockpit-border)] text-bw-text"
                    >
                      <span className="text-sm">{s.avatar}</span>
                      {s.display_name}
                    </motion.span>
                  ))}
                  {activeStudents.length > 20 && (
                    <span className="text-body-xs text-bw-muted self-center">+{activeStudents.length - 20}</span>
                  )}
                </div>
              )}
            </div>
          </GlassCardV2>
        </motion.div>

        {/* CTA */}
        <div className="text-center space-y-3">
          <motion.div
            animate={prefersReducedMotion ? {} : { y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center bg-bw-primary/10 border border-bw-primary/30"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-bw-primary)"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </motion.div>
          <p className="text-body-sm text-bw-muted font-medium">Selectionnez un module dans le menu</p>
        </div>
      </div>
    </div>
  );
}
