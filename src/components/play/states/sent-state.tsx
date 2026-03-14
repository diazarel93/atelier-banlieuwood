"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CINEMA_TIPS, type CinemaTip } from "@/lib/cinema-tips";
import { BONUS_TRIVIA, pickBonusQuestions, type BonusQuestion } from "@/lib/bonus-trivia";
import { MiniLeaderboard } from "@/components/play/mini-leaderboard";

function pickTips(module?: number, seance?: number): CinemaTip[] {
  if (!module) return CINEMA_TIPS.slice(0, 30);
  const moduleTips = CINEMA_TIPS.filter((t) => t.module === module);
  const seanceTips = seance ? moduleTips.filter((t) => !t.seance || t.seance === seance) : moduleTips;
  return seanceTips.length > 0 ? seanceTips : moduleTips.length > 0 ? moduleTips : CINEMA_TIPS.slice(0, 30);
}

const TYPE_ICONS: Record<string, string> = {
  technique: "🎬", quote: "💬", fact: "📖", rule: "📏",
  reflection: "💭", anecdote: "🎪", "métier": "🎥", "réalisateur": "🎬",
  acteur: "🌟", rappel: "📌", motivation: "💪",
};

export interface SentStateProps {
  responsesCount?: number;
  connectedCount?: number;
  streak?: number;
  lastXpGain?: number;
  sessionId?: string;
  studentId?: string;
  currentModule?: number;
  currentSeance?: number;
  topStudents?: { id: string; displayName: string; avatar: string; xp: number }[];
  currentStudentId?: string;
}

function BonusTrivia() {
  const [questionIndices, setQuestionIndices] = useState<number[]>(() => pickBonusQuestions(5));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  const q: BonusQuestion | undefined = BONUS_TRIVIA[questionIndices[currentIdx]];

  const handleSelect = useCallback((optionIdx: number) => {
    if (selected !== null) return;
    setSelected(optionIdx);
    setTotal((t) => t + 1);
    if (optionIdx === q.correct) setScore((s) => s + 1);
  }, [selected, q]);

  const handleNext = useCallback(() => {
    if (currentIdx < questionIndices.length - 1) {
      setCurrentIdx((i) => i + 1);
      setSelected(null);
    } else {
      // Reload new batch
      setQuestionIndices(pickBonusQuestions(5, questionIndices));
      setCurrentIdx(0);
      setSelected(null);
    }
  }, [currentIdx, questionIndices]);

  if (!q) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full max-w-[320px]"
    >
      <div className="rounded-xl overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(78,205,196,0.05))", border: "1px solid rgba(139,92,246,0.15)" }}>
        <div className="px-4 py-2 flex items-center justify-between" style={{ background: "rgba(139,92,246,0.08)" }}>
          <span className="text-xs uppercase tracking-widest text-bw-violet font-bold">Quiz Bonus</span>
          {total > 0 && (
            <span className="text-xs text-bw-violet font-semibold">{score}/{total}</span>
          )}
        </div>
        <div className="px-4 py-3 space-y-2.5">
          <AnimatePresence mode="wait">
            <motion.div key={questionIndices[currentIdx]} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <p className="text-xs text-bw-text font-medium leading-relaxed mb-2.5">{q.question}</p>
              <div className="grid grid-cols-1 gap-1.5">
                {q.options.map((opt, i) => {
                  const isCorrect = i === q.correct;
                  const isSelected = selected === i;
                  const revealed = selected !== null;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(i)}
                      disabled={revealed}
                      className={`text-left px-3 py-2 rounded-lg text-xs transition-all cursor-pointer ${
                        revealed
                          ? isCorrect
                            ? "bg-bw-teal/15 border border-bw-teal/30 text-bw-teal font-medium"
                            : isSelected
                              ? "bg-bw-danger/10 border border-bw-danger/20 text-bw-danger line-through"
                              : "bg-bw-bg border border-white/[0.04] text-bw-muted"
                          : "bg-bw-bg border border-white/[0.06] text-bw-text hover:border-bw-violet/30 hover:bg-bw-violet/5"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {selected !== null && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-2 space-y-2">
                  <p className="text-xs text-bw-muted leading-relaxed">{q.explanation}</p>
                  <button onClick={handleNext} className="w-full py-1.5 rounded-lg text-xs font-semibold bg-bw-violet/15 text-bw-violet hover:bg-bw-violet/25 cursor-pointer transition-colors">
                    Question suivante →
                  </button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export function SentState({ responsesCount, connectedCount, streak, lastXpGain, sessionId, studentId, currentModule, currentSeance, topStudents, currentStudentId }: SentStateProps) {
  const tips = useMemo(() => pickTips(currentModule, currentSeance), [currentModule, currentSeance]);
  const [showBonus, setShowBonus] = useState(false);
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * tips.length));

  // After 6s, offer bonus trivia
  useEffect(() => {
    const t = setTimeout(() => setShowBonus(true), 6000);
    return () => clearTimeout(t);
  }, []);

  // Rotate tips every 5s
  useEffect(() => {
    if (showBonus) return;
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [showBonus, tips.length]);

  const currentTip = tips[tipIndex % tips.length];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center gap-5 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, rgba(78,205,196,0.25), rgba(16,185,129,0.15))" }}
      >
        <motion.svg
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4ECDC4"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-10 h-10"
        >
          <motion.path d="M5 13l4 4L19 7" />
        </motion.svg>
      </motion.div>

      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl tracking-wider font-cinema">ENVOY&Eacute; !</h2>
        <div className="h-0.5 w-10 mx-auto rounded-full bg-gradient-to-r from-bw-teal to-bw-green" />
        <p className="text-bw-muted text-sm">En attente des autres joueurs...</p>
      </div>

      {/* Streak + XP badge */}
      <div className="flex items-center gap-2">
        {(streak ?? 0) >= 2 && (
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-bw-amber/20 to-bw-primary/20 border border-bw-amber/40 rounded-full px-4 py-1.5"
          >
            <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="text-base">
              {"\uD83D\uDD25"}
            </motion.span>
            <span className="text-sm font-bold text-bw-amber">x{streak}</span>
            <span className="text-xs text-bw-amber/70">série</span>
          </motion.div>
        )}
        {(lastXpGain ?? 0) > 0 && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 }} className="text-sm font-bold text-bw-gold">
            +{lastXpGain} pts
          </motion.span>
        )}
      </div>

      {/* Live counter */}
      {responsesCount != null && connectedCount != null && connectedCount > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card px-5 py-3" aria-live="polite" aria-atomic="true">
          <p className="text-sm text-bw-muted">
            <span className="text-bw-teal font-semibold">{responsesCount}</span>
            <span className="text-bw-muted">/{connectedCount}</span>
            {" "}ont r&eacute;pondu
          </p>
        </motion.div>
      )}

      {/* Mini leaderboard — top 3 */}
      {topStudents && topStudents.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <MiniLeaderboard entries={topStudents} currentStudentId={currentStudentId} />
        </motion.div>
      )}

      {/* Contextual cinema tip → then transition to bonus trivia */}
      <AnimatePresence mode="wait">
        {!showBonus ? (
          <motion.div key="tips" className="max-w-[300px] sm:max-w-xs px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }} transition={{ delay: 1.5 }}>
            {currentTip && (
              <div className="rounded-xl px-4 py-3" style={{ background: "linear-gradient(135deg, rgba(212,168,67,0.08), rgba(139,92,246,0.05))", border: "1px solid rgba(212,168,67,0.12)" }}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs uppercase tracking-widest text-bw-gold font-bold">
                    {TYPE_ICONS[currentTip.type] || "🎬"} Le saviez-vous ?
                  </p>
                  <span className="text-xs text-bw-muted">{tipIndex + 1}/{tips.length}</span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.p key={tipIndex} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} className="text-xs text-bw-text leading-relaxed">
                    {currentTip.text}
                  </motion.p>
                </AnimatePresence>
                {currentTip.source && (
                  <p className="text-xs text-bw-muted mt-1 italic">— {currentTip.source}</p>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="bonus" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full flex justify-center px-4">
            <BonusTrivia />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }} className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div key={i} animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }} className="w-2 h-2 rounded-full bg-bw-teal" />
        ))}
      </motion.div>
    </motion.div>
  );
}
