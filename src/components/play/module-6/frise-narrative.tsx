"use client";

import { motion } from "motion/react";
import type { Module6Data } from "@/hooks/use-session-polling";

interface FriseNarrativeProps {
  module6: Module6Data;
}

export function FriseNarrative({ module6 }: FriseNarrativeProps) {
  const steps = module6.friseSteps || [];

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">La Frise Narrative</h2>
        <p className="text-sm text-white/50 mt-1">
          Les 8 ingrédients de votre film
        </p>
      </div>

      <div className="w-full space-y-4">
        {steps.map((step, i) => (
          <motion.div
            key={step.key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="flex gap-4 items-start"
          >
            {/* Timeline dot + line */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step.winnerText
                    ? "bg-emerald-500 text-white"
                    : "bg-white/10 text-white/40"
                }`}
              >
                {i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className="w-0.5 h-8 bg-white/10 mt-1" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <p className="text-sm font-semibold text-white">{step.label}</p>
              <p className="text-xs text-white/50 mt-0.5">{step.description}</p>
              {step.winnerText && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.15 + 0.3 }}
                  className="mt-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                >
                  <p className="text-sm text-emerald-300">{step.winnerText}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
