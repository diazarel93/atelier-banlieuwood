"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Module12Data } from "@/hooks/use-session-polling";

interface MancheVoteStateProps {
  module12: Module12Data;
  sessionId: string;
  studentId: string;
  onVote?: () => void;
}

export function MancheVoteState({ module12, sessionId, studentId, onVote }: MancheVoteStateProps) {
  const [voting, setVoting] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(module12.studentVote);

  const handleVote = async (cardId: string) => {
    if (voting) return;
    setVoting(true);
    setSelectedCard(cardId);

    try {
      const res = await fetch(`/api/sessions/${sessionId}/manche-vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, manche: module12.manche, cardId }),
      });
      if (!res.ok) {
        setSelectedCard(module12.studentVote);
      } else {
        onVote?.();
      }
    } catch {
      setSelectedCard(module12.studentVote);
    } finally {
      setVoting(false);
    }
  };

  const hasVoted = !!selectedCard;
  const hasWinner = !!module12.winner;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4">
      {/* Progress dots */}
      <div className="flex gap-2">
        {Array.from({ length: 8 }, (_, i) => {
          const m = i + 1;
          const won = module12.allWinners.some((w) => w.manche === m);
          const isCurrent = m === module12.manche;
          return (
            <div
              key={m}
              className={`w-3 h-3 rounded-full transition-all ${
                won
                  ? "bg-emerald-400 scale-110"
                  : isCurrent
                  ? "bg-yellow-400 animate-pulse"
                  : "bg-white/20"
              }`}
            />
          );
        })}
      </div>

      {/* Manche label */}
      <div className="text-center">
        <p className="text-sm text-white/50 uppercase tracking-wider">
          Manche {module12.manche}/8
        </p>
        <h2 className="text-2xl font-bold text-white mt-1">
          {module12.mancheLabel}
        </h2>
      </div>

      {/* Cards grid */}
      {!module12.poolReady ? (
        <div className="text-center text-white/50 py-12">
          <p>Les cartes ne sont pas encore pretes.</p>
          <p className="text-sm mt-2">Le prof prepare les cartes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 w-full">
          <AnimatePresence mode="wait">
            {module12.cards.map((card, i) => {
              const isSelected = selectedCard === card.cardId;
              const isWinner = hasWinner && module12.winner?.cardId === card.cardId;

              return (
                <motion.button
                  key={card.cardId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => !hasWinner && handleVote(card.cardId)}
                  disabled={voting || hasWinner}
                  className={`relative p-4 rounded-xl text-left transition-all ${
                    isWinner
                      ? "bg-emerald-500/30 border-2 border-emerald-400 ring-2 ring-emerald-400/30"
                      : isSelected
                      ? "bg-teal-500/30 border-2 border-teal-400"
                      : "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20"
                  } ${voting ? "opacity-60" : ""}`}
                >
                  <p className="text-white text-sm leading-relaxed">{card.text}</p>
                  {card.isBanlieuwood && (
                    <span className="absolute top-2 right-2 text-xs text-white/30">BW</span>
                  )}
                  {isSelected && !isWinner && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-5 h-5 rounded-full bg-teal-400 flex items-center justify-center"
                    >
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  )}
                  {isWinner && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 text-lg"
                    >
                      🏆
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Status messages */}
      {hasVoted && !hasWinner && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-teal-400 text-sm text-center"
        >
          Vote enregistre ! En attente du resultat...
        </motion.p>
      )}

      {hasWinner && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-2"
        >
          <p className="text-emerald-400 font-semibold">
            Le choix collectif est retenu !
          </p>
        </motion.div>
      )}

      {/* Winners history */}
      {module12.allWinners.length > 0 && (
        <div className="w-full mt-4 space-y-2">
          <p className="text-xs text-white/40 uppercase tracking-wider">Choix collectifs</p>
          {module12.allWinners.map((w) => (
            <div key={w.manche} className="flex gap-2 text-xs text-white/60">
              <span className="text-emerald-400 font-mono">M{w.manche}</span>
              <span className="truncate">{w.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
