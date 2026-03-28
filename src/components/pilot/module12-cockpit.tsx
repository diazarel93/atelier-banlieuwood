"use client";

import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MANCHES } from "@/lib/module12-data";

interface Module12CockpitProps {
  sessionId: string;
  currentSituationIndex: number;
  module12: {
    type: string;
    manche: number;
    mancheLabel: string;
    cards: { cardId: string; text: string; isBanlieuwood: boolean }[];
    studentVote: string | null;
    voteCounts: Record<string, number> | null;
    winner: { cardId: string; text: string } | null;
    allWinners: { manche: number; text: string }[];
    poolReady: boolean;
  };
  connectedCount: number;
}

export function Module12Cockpit({ sessionId, module12, connectedCount }: Module12CockpitProps) {
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);

  // Generate pools mutation
  const generatePools = async (force = false) => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/collective-pools`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Cartes generees !");
      queryClient.invalidateQueries({ queryKey: ["session-cockpit", sessionId] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setGenerating(false);
    }
  };

  // Validate winner mutation
  const validateWinner = useMutation({
    mutationFn: async ({ cardId, text }: { cardId: string; text: string }) => {
      const res = await fetch(`/api/sessions/${sessionId}/manche-winner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manche: module12.manche, cardId, winningText: text }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Choix validé !");
      queryClient.invalidateQueries({ queryKey: ["session-cockpit", sessionId] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Erreur");
    },
  });

  const voteCounts = module12.voteCounts || {};
  const totalVotes = Object.values(voteCounts).reduce((a, b) => a + b, 0);
  const mancheConfig = MANCHES[module12.manche - 1];

  // Sort cards by vote count for display
  const sortedCards = useMemo(() => {
    return [...module12.cards].sort((a, b) => {
      return (voteCounts[b.cardId] || 0) - (voteCounts[a.cardId] || 0);
    });
  }, [module12.cards, voteCounts]);

  // ── Pools not generated yet ──
  if (!module12.poolReady) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white">Preparation inter-seance</h3>
          <p className="text-sm text-white/60 mt-2 max-w-md">
            Generez les cartes a partir des idees du Module 10 (Et si... + Pitch). Les contributions des eleves seront
            anonymisees et melangees.
          </p>
        </div>
        <button
          onClick={() => generatePools(false)}
          disabled={generating}
          className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
        >
          {generating ? "Generation en cours..." : "Preparer les cartes"}
        </button>
        <button
          onClick={() => generatePools(true)}
          disabled={generating}
          className="text-xs text-white/30 hover:text-bw-heading/60 transition-colors"
        >
          Regenerer (ecrase les existantes)
        </button>
      </div>
    );
  }

  // ── Séance active ──
  return (
    <div className="space-y-6">
      {/* Progress dots + manche info */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/50">
            Manche {module12.manche}/{mancheConfig?.optional ? "bonus" : "5"}
            {mancheConfig?.optional && <span className="ml-1.5 text-xs text-amber-400 font-semibold">BONUS</span>}
          </p>
          <h3 className="text-lg font-bold text-white">{module12.mancheLabel}</h3>
          {mancheConfig && <p className="text-xs text-white/40 mt-1">{mancheConfig.description}</p>}
        </div>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 8 }, (_, i) => {
            const m = i + 1;
            const won = module12.allWinners.some((w) => w.manche === m);
            const isCurrent = m === module12.manche;
            const isOptional = m > 5;
            return (
              <span key={m} className="contents">
                {m === 6 && <div className="w-px h-3 bg-white/20 mx-0.5" />}
                <div
                  className={`w-3 h-3 rounded-full transition-all ${
                    won
                      ? "bg-emerald-400"
                      : isCurrent
                        ? "bg-yellow-400 animate-pulse"
                        : isOptional
                          ? "bg-white/8 ring-1 ring-white/15"
                          : "bg-white/15"
                  }`}
                  title={`Manche ${m}${isOptional ? " (bonus)" : ""}${won ? " — validee" : isCurrent ? " — en cours" : ""}`}
                />
              </span>
            );
          })}
        </div>
      </div>

      {/* Vote toolbar */}
      <div className="flex items-center gap-4 text-sm text-white/60">
        <span>
          Votes : {totalVotes}/{connectedCount}
        </span>
        {module12.winner && <span className="text-emerald-400 font-semibold">Choix retenu</span>}
      </div>

      {/* Cards with vote bars */}
      <div className="space-y-3">
        {sortedCards.map((card) => {
          const count = voteCounts[card.cardId] || 0;
          const pct = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
          const isWinner = module12.winner?.cardId === card.cardId;

          return (
            <motion.div
              key={card.cardId}
              layout
              className={`relative p-4 rounded-xl border transition-all ${
                isWinner ? "bg-emerald-500/20 border-emerald-400" : "bg-[rgba(139,92,246,0.1)] border-[#2a2a50]"
              }`}
            >
              {/* Vote progress bar */}
              <div className="absolute inset-0 rounded-xl overflow-hidden">
                <motion.div
                  className={`h-full ${isWinner ? "bg-emerald-500/15" : "bg-teal-500/10"}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <div className="relative flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-white text-sm">{card.text}</p>
                  {card.isBanlieuwood && <span className="text-xs text-white/30 mt-1">Banlieuwood</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-white/60">
                    {count} {pct > 0 && <span className="text-xs">({Math.round(pct)}%)</span>}
                  </span>
                  {!module12.winner && (
                    <button
                      onClick={() => validateWinner.mutate({ cardId: card.cardId, text: card.text })}
                      disabled={validateWinner.isPending}
                      className="px-3 py-1.5 text-xs bg-teal-500/20 hover:bg-teal-500/40 text-teal-300 rounded-lg transition-colors border border-teal-500/30"
                    >
                      Valider
                    </button>
                  )}
                  {isWinner && <span className="text-lg">🏆</span>}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Winners history */}
      {module12.allWinners.length > 0 && (
        <div className="mt-6 pt-4 border-t border-[#2a2a50]">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-3">
            Choix de la classe ({module12.allWinners.length}/8)
          </p>
          <div className="space-y-2">
            {module12.allWinners.map((w) => {
              const config = MANCHES[w.manche - 1];
              return (
                <div key={w.manche} className="flex gap-3 text-sm">
                  <span className="text-emerald-400 font-semibold w-36 flex-shrink-0">
                    {config?.label || `Manche ${w.manche}`}
                  </span>
                  <span className="text-white/70">{w.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Regenerate button */}
      <div className="flex justify-end">
        <button
          onClick={() => generatePools(true)}
          disabled={generating}
          className="text-xs text-white/20 hover:text-bw-heading/50 transition-colors"
        >
          Regenerer les cartes
        </button>
      </div>
    </div>
  );
}
