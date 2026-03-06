"use client";

import { motion } from "motion/react";

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

export function VotingResults({
  voteData,
  sessionStatus,
  onValidateWinner,
}: VotingResultsProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Resultats du vote</span>
        <span className="text-sm text-bw-muted">{voteData.totalVotes} vote{voteData.totalVotes > 1 ? "s" : ""}</span>
      </div>
      {voteData.results.map((vr, i) => {
        const pct = voteData.totalVotes > 0 ? Math.round((vr.count / voteData.totalVotes) * 100) : 0;
        return (
          <motion.div key={vr.response.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-xl p-4 border transition-all ${
              i === 0
                ? "border-bw-primary/35 bg-bw-primary/[0.06]"
                : "border-white/[0.10] bg-bw-surface"
            }`}
            style={i === 0 ? { boxShadow: "0 0 20px rgba(255,107,53,0.12), 0 2px 8px rgba(0,0,0,0.2)" } : { boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span>{vr.response.students?.avatar}</span>
                <span className="text-sm font-medium text-bw-text">{vr.response.students?.display_name}</span>
              </div>
              <span className="text-lg font-bold tabular-nums" style={{ color: i === 0 ? "var(--color-bw-primary)" : "var(--color-bw-muted)" }}>{pct}%</span>
            </div>
            <p className="text-sm mb-2 text-bw-heading">{vr.response.text}</p>
            <div className="w-full bg-white/[0.06] rounded-full h-2 overflow-hidden mb-2">
              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="h-full rounded-full"
                style={{
                  backgroundColor: i === 0 ? "var(--color-bw-primary)" : "var(--color-bw-teal)",
                  boxShadow: i === 0 ? "0 0 8px rgba(255,107,53,0.4)" : undefined,
                }} />
            </div>
            {vr.voters.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {vr.voters.map((v, j) => (
                  <span key={j} className="text-xs bg-white/[0.05] px-2 py-0.5 rounded-full text-bw-text border border-white/[0.08]">
                    {v.avatar} {v.display_name}
                    {v.team_name && (
                      <span className="ml-1 text-xs font-medium" style={{ color: v.team_color }}>{v.team_name}</span>
                    )}
                  </span>
                ))}
              </div>
            )}
            {i === 0 && vr.count > 0 && sessionStatus === "reviewing" && (
              <button onClick={() => onValidateWinner(vr.response.id, vr.response.text, vr.response.students)}
                className="btn-glow mt-3 px-4 py-2 bg-bw-primary text-white rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 hover:brightness-110 shadow-md shadow-bw-primary/20">
                Valider comme choix collectif
              </button>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
