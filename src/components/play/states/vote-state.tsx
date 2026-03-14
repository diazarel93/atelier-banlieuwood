"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { CATEGORY_COLORS } from "@/lib/constants";
import { ReactionBar, type ReactionCounts } from "@/components/reaction-bar";
import type { SessionState } from "@/hooks/use-session-polling";
import type { SoundName } from "@/hooks/use-sound";

export interface VoteStateProps {
  voteOptions: SessionState["voteOptions"];
  situation: NonNullable<SessionState["situation"]>;
  sessionId: string;
  studentId: string;
  onVote: (responseId: string) => void;
  voting: boolean;
  playSound?: (name: SoundName) => void;
}

export function VoteState({
  voteOptions,
  situation,
  sessionId,
  studentId,
  onVote,
  voting,
  playSound,
}: VoteStateProps) {
  const [votedId, setVotedId] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Record<string, ReactionCounts>>({});
  const categoryColor = CATEGORY_COLORS[situation.category] || "#FF6B35";
  const letters = ["A", "B", "C", "D", "E", "F"];

  // Fetch reactions
  useEffect(() => {
    if (!situation.id) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(
          `/api/sessions/${sessionId}/reactions?situationId=${situation.id}`
        );
        if (res.ok) {
          const json = await res.json();
          if (!cancelled) setReactions(json.reactions || {});
        }
      } catch { /* ignore */ }
    }
    load();
    const interval = setInterval(load, 8000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [sessionId, situation.id]);

  function handleTap(optionId: string) {
    if (voting) return;
    setVotedId(optionId);
    playSound?.("tap");
    onVote(optionId);
    if (navigator.vibrate) navigator.vibrate(15);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col gap-5 w-full"
    >
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-10 h-10 sm:w-14 sm:h-14 rounded-full mx-auto flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${categoryColor}30, ${categoryColor}15)` }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={categoryColor} strokeWidth="2" strokeLinecap="round">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" />
          </svg>
        </motion.div>
        <h2
          className="text-xl sm:text-2xl tracking-wider font-cinema"
        >
          CHOISIS LA MEILLEURE
        </h2>
        <div className="h-0.5 w-12 mx-auto rounded-full" style={{ background: `linear-gradient(90deg, ${categoryColor}, ${categoryColor}60)` }} />
        <p className="text-xs text-bw-muted">Tap pour voter</p>
      </div>

      <div className="space-y-3">
        {voteOptions.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-6 h-6 border-2 border-bw-primary border-t-transparent rounded-full"
            />
            <p className="text-sm text-bw-muted">Chargement des propositions...</p>
          </div>
        )}
        {voteOptions.map((option, index) => {
          const isVoted = votedId === option.id;
          const hasVoted = votedId !== null;
          const letter = letters[index] || `${index + 1}`;
          return (
            <motion.button
              key={option.id}
              aria-label={`Option ${letter} : ${option.text}`}
              aria-pressed={isVoted}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: hasVoted && !isVoted ? 0.4 : 1,
                y: 0,
                scale: isVoted ? 1.02 : 1,
              }}
              transition={{ delay: index * 0.12, type: "spring", stiffness: 300, damping: 25 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTap(option.id)}
              disabled={voting}
              className={`w-full text-left rounded-2xl border-2 transition-all cursor-pointer overflow-hidden ${
                isVoted
                  ? "border-bw-primary shadow-[0_0_20px_rgba(255,107,53,0.15)]"
                  : "border-white/[0.06] hover:border-white/20"
              }`}
            >
              <div className="flex items-start gap-3 p-3 sm:p-4">
                {/* Letter badge */}
                <div
                  className={`w-7 h-7 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold transition-colors ${
                    isVoted ? "text-white" : "text-bw-muted"
                  }`}
                  style={isVoted ? { backgroundColor: categoryColor } : { backgroundColor: "#15181F" }}
                >
                  {letter}
                </div>
                <div className="flex-1 pt-1.5">
                  <p className={`text-sm leading-relaxed ${isVoted ? "text-white" : "text-bw-text"}`}>
                    {option.text}
                  </p>
                  <ReactionBar
                    responseId={option.id}
                    studentId={studentId}
                    sessionId={sessionId}
                    counts={reactions[option.id]}
                    compact
                    onReact={() => {
                      // Refresh reactions after toggle
                      fetch(`/api/sessions/${sessionId}/reactions?situationId=${situation.id}`)
                        .then((r) => r.json())
                        .then((j) => setReactions(j.reactions || {}))
                        .catch(() => {});
                    }}
                  />
                </div>
              </div>
              {/* Selection bar */}
              {isVoted && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  className="h-1 origin-left"
                  style={{ backgroundColor: categoryColor }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {votedId && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2"
        >
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: 1, duration: 0.3 }}
            className="w-2 h-2 rounded-full bg-bw-teal"
          />
          <span className="text-sm text-bw-teal">Vote enregistr&eacute; &mdash; tu peux changer d&apos;avis</span>
        </motion.div>
      )}
    </motion.div>
  );
}
