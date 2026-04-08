"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface VoteResultItem {
  response: { id: string; text: string; students: { display_name: string; avatar: string } };
  count: number;
  voters: { display_name: string; avatar: string; team_name?: string; team_color?: string }[];
}

interface VotingResultsProps {
  voteData: { totalVotes: number; results: VoteResultItem[] };
  sessionStatus: string;
  onValidateWinner: (responseId: string, text: string, students: { display_name: string; avatar: string }) => void;
}

const BAR_COLORS = ["var(--color-bw-violet)", "#f472b6", "#fbbf24", "#22d3ee", "#34d399", "#fb923c"];

export function VotingResults({ voteData, sessionStatus, onValidateWinner }: VotingResultsProps) {
  const [revealed, setRevealed] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const isReviewing = sessionStatus === "reviewing";

  // F5: Reveal animation — countdown 3-2-1 then show results
  function startReveal() {
    setCountdown(3);
    setTimeout(() => setCountdown(2), 1000);
    setTimeout(() => setCountdown(1), 2000);
    setTimeout(() => {
      setCountdown(null);
      setRevealed(true);
    }, 3000);
  }

  // Auto-reveal if already reviewing
  const showResults = revealed || isReviewing;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="label-caps text-bw-cockpit-muted">Résultats du vote</span>
        <div className="flex items-center gap-2">
          <span className="text-xl font-extrabold text-white tabular-nums">{voteData.totalVotes}</span>
          <span className="label-caps text-bw-cockpit-muted">vote{voteData.totalVotes > 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* F5: Countdown animation */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            key={`countdown-${countdown}`}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex items-center justify-center py-12"
          >
            <span className="text-7xl font-extrabold text-bw-primary">{countdown}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reveal button (voting phase) */}
      {!showResults && countdown === null && sessionStatus === "voting" && voteData.totalVotes > 0 && (
        <motion.button
          onClick={startReveal}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-bw-primary to-bw-gold text-white text-body-sm font-bold cursor-pointer shadow-md"
          whileTap={{ scale: 0.97 }}
        >
          ✨ Révéler les résultats
        </motion.button>
      )}

      {/* Results — staggered bars */}
      {showResults &&
        voteData.results.map((vr, i) => {
          const pct = voteData.totalVotes > 0 ? Math.round((vr.count / voteData.totalVotes) * 100) : 0;
          const isWinner = i === 0 && vr.count > 0;
          const barColor = BAR_COLORS[i % BAR_COLORS.length];

          return (
            <motion.div
              key={vr.response.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15, duration: 0.4, ease: "easeOut" }}
              className={`rounded-xl p-4 border transition-all ${
                isWinner
                  ? "border-bw-primary/40 bg-bw-primary/8"
                  : "border-[var(--color-bw-cockpit-border)] bg-bw-cockpit-canvas"
              }`}
              style={
                isWinner
                  ? { boxShadow: "0 0 24px rgba(139,92,246,0.15), 0 2px 8px rgba(0,0,0,0.3)" }
                  : { boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }
              }
            >
              {/* Winner badge */}
              {isWinner && isReviewing && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                  className="flex items-center gap-1.5 mb-2"
                >
                  <span className="text-sm">🏆</span>
                  <span className="label-caps text-bw-amber">Gagnant</span>
                </motion.div>
              )}

              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">{vr.response.students?.avatar}</span>
                  <span className="text-body-sm font-medium text-white">{vr.response.students?.display_name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-body-sm font-bold tabular-nums" style={{ color: barColor }}>
                    {vr.count}
                  </span>
                  <span className="text-lg font-extrabold tabular-nums" style={{ color: barColor }}>
                    {pct}%
                  </span>
                </div>
              </div>

              <p className="text-body-sm mb-3 text-bw-cockpit-muted leading-relaxed">{vr.response.text}</p>

              {/* Progress bar */}
              <div className="w-full h-2.5 rounded-full bg-bw-cockpit-canvas overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, delay: i * 0.15 + 0.2, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: barColor,
                    boxShadow: isWinner ? `0 0 12px ${barColor}60` : undefined,
                  }}
                />
              </div>

              {/* Voters — anonymized count only per doctrine */}
              {vr.voters.length > 0 && (
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="flex -space-x-1">
                    {vr.voters.slice(0, 5).map((v, j) => (
                      <span key={j} className="text-xs">
                        {v.avatar}
                      </span>
                    ))}
                  </div>
                  {vr.voters.length > 5 && (
                    <span className="text-[10px] text-bw-cockpit-muted">+{vr.voters.length - 5}</span>
                  )}
                </div>
              )}

              {/* Validate winner button */}
              {isWinner && isReviewing && (
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={() => onValidateWinner(vr.response.id, vr.response.text, vr.response.students)}
                  className="mt-3 px-4 py-2.5 bg-bw-primary text-white rounded-xl text-body-xs font-bold cursor-pointer transition-all hover:brightness-90 shadow-[0_0_12px_rgba(139,92,246,0.25)]"
                >
                  Valider comme choix collectif
                </motion.button>
              )}
            </motion.div>
          );
        })}
    </div>
  );
}
