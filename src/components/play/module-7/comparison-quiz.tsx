"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { Module7Data } from "@/hooks/use-session-polling";

// Map comparison keys + sides to their illustration URLs
const COMPARISON_IMAGES: Record<string, { imageA: string; imageB: string }> = {
  comp1: {
    imageA: "/images/plans/comparisons/comp1-large.svg",
    imageB: "/images/plans/comparisons/comp1-gros.svg",
  },
  comp2: {
    imageA: "/images/plans/comparisons/comp2-moyen.svg",
    imageB: "/images/plans/comparisons/comp2-reaction.svg",
  },
  comp3: {
    imageA: "/images/plans/comparisons/comp3-large.svg",
    imageB: "/images/plans/comparisons/comp3-reaction.svg",
  },
};

interface ComparisonQuizProps {
  module7: Module7Data;
  sessionId: string;
  studentId: string;
}

export function ComparisonQuiz({ module7, sessionId, studentId }: ComparisonQuizProps) {
  const comparisons = module7.comparisons || [];
  const answered = new Set((module7.studentComparisons || []).map((c) => c.comparisonKey));
  const [currentIndex, setCurrentIndex] = useState(
    Math.min(answered.size, comparisons.length - 1)
  );
  const [submitting, setSubmitting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [reasoning, setReasoning] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);

  const current = comparisons[currentIndex];
  if (!current) return null;

  const isAnswered = answered.has(current.key);
  const images = COMPARISON_IMAGES[current.key];

  const handleSubmit = async (plan: string) => {
    if (submitting || isAnswered) return;
    setSubmitting(true);
    setSelectedPlan(plan);

    try {
      await fetch(`/api/sessions/${sessionId}/scenario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "comparison",
          studentId,
          comparisonKey: current.key,
          chosenPlan: plan,
          reasoning,
        }),
      });
      setShowExplanation(true);
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < comparisons.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedPlan(null);
      setReasoning("");
      setShowExplanation(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4"
    >
      {/* Progress */}
      <div className="flex gap-2">
        {comparisons.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${
              i < currentIndex || answered.has(comparisons[i].key)
                ? "bg-bw-teal"
                : i === currentIndex
                ? "bg-bw-amber animate-pulse"
                : "bg-white/20"
            }`}
          />
        ))}
      </div>

      <div className="text-center">
        <h2 className="text-xl font-bold text-white">{current.question}</h2>
        <p className="text-sm text-white/50 mt-1">{current.sceneDescription}</p>
      </div>

      {/* Split comparison — image + text cards */}
      <div className="grid grid-cols-1 gap-3 w-full">
        {[
          { side: "A" as const, plan: current.planA, image: current.imageA || images?.imageA },
          { side: "B" as const, plan: current.planB, image: current.imageB || images?.imageB },
        ].map(({ side, plan, image }) => (
          <motion.button
            key={side}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSubmit(plan.type)}
            disabled={submitting || isAnswered || showExplanation}
            className={`rounded-xl text-left transition-all overflow-hidden ${
              selectedPlan === plan.type
                ? "bg-bw-teal/20 border-2 border-bw-teal"
                : "bg-white/5 border border-white/[0.06] hover:bg-white/10"
            } ${(submitting || isAnswered) ? "opacity-60" : ""}`}
          >
            {/* Comparison illustration */}
            {image && (
              <div className="w-full border-b border-white/5">
                <Image
                  src={image}
                  alt={`Option ${side} : ${plan.type.replace("-", " ")} \u2014 ${current.sceneDescription}`}
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
            )}

            {/* Text label */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-white/40">Option {side}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                  {plan.type.replace("-", " ")}
                </span>
              </div>
              <p className="text-sm text-white">{plan.description}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Reasoning (optional) */}
      {!showExplanation && !isAnswered && (
        <div className="w-full">
          <textarea
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
            placeholder="Pourquoi ce choix ? (optionnel)"
            className="w-full h-20 rounded-xl bg-bw-elevated border border-white/[0.06] p-3 text-xs text-bw-text placeholder:text-bw-muted resize-none focus:outline-none focus:border-bw-teal transition-colors"
          />
        </div>
      )}

      {/* Explanation after answering */}
      {showExplanation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full p-4 rounded-xl bg-bw-amber/10 border border-bw-amber/20"
        >
          <p className="text-sm text-bw-amber">{current.explanation}</p>
          {currentIndex < comparisons.length - 1 && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="btn-glow mt-3 px-6 py-2.5 rounded-xl bg-bw-teal text-white text-sm font-semibold cursor-pointer"
            >
              Suivant
            </motion.button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
