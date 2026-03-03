"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { scoreColor, getScoreLabel, type StepProgress } from "@/lib/models/atelier";
import {
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  Eye,
  Sparkles,
  Target,
  Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Stars } from "./stars";
import { CriteriaStat } from "./criteria-stat";
import { MentorAvatar, type MentorMood } from "./mentor-avatar";
import { useCountUp } from "@/hooks/use-count-up";

type RevealPhase = "suspense" | "reveal" | "criteria";

export function ScoreRevealView({
  step,
  questionIndex,
  totalQuestions,
  hint,
  mentorMood,
  onNext,
  onPrev,
  hasPrev,
  hasNext,
}: {
  step: StepProgress;
  questionIndex: number;
  totalQuestions: number;
  hint: string | null;
  mentorMood: MentorMood;
  onNext: () => void;
  onPrev: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  const exchanges = step.exchanges || [];
  const lastExchange = exchanges[exchanges.length - 1];
  const criteria = lastExchange?.criteria;
  const [showExchanges, setShowExchanges] = useState(false);
  const [phase, setPhase] = useState<RevealPhase>("suspense");
  const [starsRevealed, setStarsRevealed] = useState(0);

  const xpAnimated = useCountUp(step.score, 600, phase === "reveal");

  // Animated phases
  useEffect(() => {
    setPhase("suspense");
    setStarsRevealed(0);
    setShowExchanges(false);

    const t1 = setTimeout(() => setPhase("reveal"), 1200);
    const t2 = setTimeout(() => setPhase("criteria"), 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [step.stepId]);

  // Stars reveal one by one
  useEffect(() => {
    if (phase !== "reveal") return;
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setStarsRevealed(count);
      if (count >= step.score) clearInterval(interval);
    }, 200);
    return () => clearInterval(interval);
  }, [phase, step.score]);

  return (
    <motion.div
      key="score-reveal"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex-1 flex flex-col items-center justify-center gap-6 w-full max-w-2xl mx-auto px-4"
    >
      {/* Score display */}
      <AnimatePresence mode="wait">
        {phase === "suspense" ? (
          <motion.div
            key="suspense"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-4"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/20 flex items-center justify-center mx-auto"
            >
              <MentorAvatar mood="thinking" size="sm" showMessage={false} />
            </motion.div>
            <p className="text-sm text-muted-foreground font-medium animate-pulse">
              Le mentor reflechit...
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="text-center space-y-4"
          >
            {/* Mentor reacts */}
            <MentorAvatar mood={mentorMood} size="sm" />

            <div className="relative inline-block">
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className={`w-24 h-24 rounded-3xl flex items-center justify-center ${
                  step.score >= 3
                    ? "bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-2 border-emerald-500/30"
                    : step.score >= 2
                      ? "bg-gradient-to-br from-accent/20 to-accent/10 border-2 border-accent/30"
                      : "bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-2 border-orange-500/30"
                } ${step.score === 1 ? "animate-shake" : ""}`}
              >
                <span className="text-4xl font-black">
                  +{xpAnimated}
                </span>
              </motion.div>
              <div className="absolute -top-1 -right-1">
                <Stars count={starsRevealed} size="sm" />
              </div>
            </div>

            <div>
              <h2
                className={`text-2xl font-black ${scoreColor(step.score)}`}
              >
                {getScoreLabel(step.score)}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                +{step.score} / 3 XP
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: phase !== "suspense" ? 1 : 0, y: phase !== "suspense" ? 0 : 20 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full rounded-2xl border bg-card overflow-hidden"
      >
        {/* Question tag */}
        <div className="px-5 pt-4 pb-3 border-b bg-muted/30">
          <p className="text-sm font-bold">
            Q{questionIndex + 1}/{totalQuestions} &mdash;{" "}
            <span className="font-normal text-muted-foreground">
              {step.question}
            </span>
          </p>
        </div>

        <div className="p-5 space-y-4">
          {/* Answer */}
          <div className="rounded-xl bg-muted/40 px-4 py-3 border border-border/50">
            <p className="text-sm leading-relaxed">{step.answer}</p>
          </div>

          {/* Mentor feedback */}
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">
              Retour du mentor
            </p>
            <p className="text-sm leading-relaxed">
              {lastExchange?.feedback || step.feedback}
            </p>
          </div>

          {/* Criteria with stagger animation */}
          {criteria && phase === "criteria" && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.15 } },
                hidden: {},
              }}
              className="space-y-2 pt-3 border-t"
            >
              {[
                { icon: Target, label: "Pertinence", value: criteria.pertinence },
                { icon: Shield, label: "Profondeur", value: criteria.profondeur },
                { icon: Sparkles, label: "Creativite", value: criteria.creativite },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: {
                      opacity: 1,
                      x: 0,
                      transition: { type: "spring", stiffness: 300, damping: 20 },
                    },
                  }}
                >
                  <CriteriaStat
                    icon={item.icon}
                    label={item.label}
                    value={item.value}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Previous exchanges */}
          {exchanges.length > 1 && (
            <div className="pt-3 border-t">
              <button
                onClick={() => setShowExchanges(!showExchanges)}
                className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                <Eye className="h-3.5 w-3.5" />
                {showExchanges ? "Masquer" : "Voir"} les{" "}
                {exchanges.length} echanges
              </button>
              {showExchanges && (
                <div className="mt-3 space-y-2">
                  {exchanges.map((ex, i) => (
                    <div
                      key={i}
                      className="rounded-xl bg-muted/30 p-3 space-y-2 text-sm border"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold bg-muted px-2 py-0.5 rounded-lg">
                          {i === 0
                            ? "Reponse initiale"
                            : `Approfondissement ${i}`}
                        </span>
                        <Stars count={ex.score} size="sm" />
                      </div>
                      <p className="text-muted-foreground">
                        &laquo; {ex.answer} &raquo;
                      </p>
                      <p className="italic text-sm">
                        {ex.feedback}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Hint */}
          {hint && (
            <details className="pt-3 border-t group">
              <summary className="flex items-center gap-2 text-xs font-bold text-muted-foreground cursor-pointer hover:text-foreground">
                <Lightbulb className="h-3.5 w-3.5" />
                Conseil du mentor
              </summary>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {hint}
              </p>
            </details>
          )}
        </div>
      </motion.div>

      {/* Navigation */}
      <div className="flex items-center gap-3">
        {hasPrev && (
          <Button
            variant="outline"
            onClick={onPrev}
            className="rounded-xl"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Precedente
          </Button>
        )}
        {hasNext && (
          <Button
            onClick={onNext}
            className="rounded-xl px-6 shadow-lg shadow-primary/20"
          >
            Question suivante
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}
