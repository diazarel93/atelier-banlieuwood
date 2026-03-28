"use client";

import { motion } from "motion/react";

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
  const threshold = expectedStudents ? Math.ceil(expectedStudents * 0.8) : null;
  const readyToStart = threshold ? activeStudents.length >= threshold : activeStudents.length > 0;
  const totalExpected = expectedStudents || 25;
  const pct = Math.round((activeStudents.length / totalExpected) * 100);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-120px)] px-4 py-8">
      <div className="w-full max-w-md space-y-6" style={{ animation: "fadeIn 0.4s ease" }}>
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="text-5xl"
          >
            🎬
          </motion.div>
          <h1 className="text-2xl font-black text-[#f0f0f8]">
            {(sessionTitle || "Session").replace(/\s*[-—]\s*$/, "")}
          </h1>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold px-3 py-1 rounded-lg bg-[#1a1a35] border border-[#2a2a50] text-[#94a3b8]">
              {level}
            </span>
            {classLabel && (
              <span className="text-[11px] font-semibold px-3 py-1 rounded-lg bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 text-[#c4b5fd]">
                {classLabel}
              </span>
            )}
            {formula && (
              <span className="text-[11px] font-semibold px-3 py-1 rounded-lg bg-emerald-900/20 border border-emerald-500/30 text-emerald-400">
                {formula} — {FORMULA_LABELS[formula] || formula}
              </span>
            )}
          </div>
        </div>

        {/* QR Code card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden bg-[#161633] border border-[#2a2a50]"
          style={{ boxShadow: "0 8px 32px rgba(139,92,246,0.1)" }}
        >
          <div className="p-6 text-center space-y-4">
            <p className="text-[11px] uppercase tracking-[0.15em] text-[#64748b] font-semibold">
              Scannez pour rejoindre
            </p>

            {/* QR placeholder */}
            <button
              onClick={onOpenQR}
              className="w-48 h-48 mx-auto rounded-2xl bg-[#1a1a35] border-2 border-[#8b5cf6]/30 flex items-center justify-center cursor-pointer hover:border-[#8b5cf6]/60 transition-colors"
              style={{ boxShadow: "0 0 24px rgba(139,92,246,0.15)" }}
            >
              <svg
                width="100"
                height="100"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8b5cf6"
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
              <p className="text-[11px] text-[#64748b] mb-2">Ou entrer le code :</p>
              <button onClick={onCopyCode} className="cursor-pointer group">
                <div className="flex gap-2 justify-center">
                  {joinCode.split("").map((char, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.06 }}
                      className="w-10 h-12 rounded-xl flex items-center justify-center text-xl font-black font-mono text-[#8b5cf6] bg-[#1a1a35] border border-[#2a2a50] group-hover:border-[#8b5cf6]/50 transition-colors"
                    >
                      {char}
                    </motion.span>
                  ))}
                </div>
                <span className="text-[11px] text-[#64748b] mt-2 inline-block group-hover:text-[#8b5cf6] transition-colors">
                  Cliquer pour copier
                </span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Connection status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl bg-[#161633] border border-[#2a2a50] p-4"
        >
          {/* Counter */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <motion.span
                className="w-2.5 h-2.5 rounded-full bg-emerald-500"
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
              <span className="text-[14px] font-bold text-emerald-400">{activeStudents.length}</span>
              <span className="text-[13px] text-[#64748b]">/ {totalExpected} connectes</span>
            </div>
            <span className="text-[13px] font-bold text-[#8b5cf6]">{pct}%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-[#1a1a35] overflow-hidden mb-3">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #34d399, #8b5cf6)" }}
              animate={{ width: `${Math.min(pct, 100)}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          {/* Threshold indicator */}
          {threshold && (
            <p className="text-[11px] text-[#64748b] text-center">
              {readyToStart ? (
                <span className="text-emerald-400 font-semibold">Seuil 80% atteint — pret a demarrer</span>
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
                  transition={{ delay: i * 0.03 }}
                  className="text-[11px] h-7 px-2.5 rounded-lg flex items-center gap-1 font-medium bg-[#1a1a35] border border-[#2a2a50] text-[#c4b5fd]"
                >
                  <span className="text-sm">{s.avatar}</span>
                  {s.display_name}
                </motion.span>
              ))}
              {activeStudents.length > 20 && (
                <span className="text-[11px] text-[#64748b] self-center">+{activeStudents.length - 20}</span>
              )}
            </div>
          )}
        </motion.div>

        {/* CTA */}
        <div className="text-center space-y-3">
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center bg-[#8b5cf6]/10 border border-[#8b5cf6]/30"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </motion.div>
          <p className="text-[13px] text-[#94a3b8] font-medium">Selectionnez un module dans le menu</p>
        </div>
      </div>
    </div>
  );
}
