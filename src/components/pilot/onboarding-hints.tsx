"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { type OnboardingStep } from "@/hooks/use-pilot-onboarding";

interface OnboardingHintsProps {
  show: boolean;
  step: OnboardingStep | null;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onDismiss: () => void;
}

export function OnboardingHints({ show, step, stepIndex, totalSteps, onNext, onDismiss }: OnboardingHintsProps) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!show || !step) {
      setPosition(null);
      return;
    }

    const el = document.querySelector(step.target);
    if (!el) {
      // Target not found, skip to next
      onNext();
      return;
    }

    const rect = el.getBoundingClientRect();
    const tooltip = { width: 240, height: 80 };

    let top = 0;
    let left = 0;

    switch (step.position) {
      case "top":
        top = rect.top - tooltip.height - 8;
        left = rect.left + rect.width / 2 - tooltip.width / 2;
        break;
      case "bottom":
        top = rect.bottom + 8;
        left = rect.left + rect.width / 2 - tooltip.width / 2;
        break;
      case "left":
        top = rect.top + rect.height / 2 - tooltip.height / 2;
        left = rect.left - tooltip.width - 8;
        break;
      case "right":
        top = rect.top + rect.height / 2 - tooltip.height / 2;
        left = rect.right + 8;
        break;
    }

    // Clamp to viewport
    left = Math.max(8, Math.min(left, window.innerWidth - tooltip.width - 8));
    top = Math.max(8, Math.min(top, window.innerHeight - tooltip.height - 8));

    setPosition({ top, left });
  }, [show, step, onNext]);

  if (!show || !step || !position) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={tooltipRef}
        key={step.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed z-[60] w-60 bg-bw-surface border border-bw-teal/30 rounded-xl p-3 shadow-2xl"
        style={{
          top: position.top,
          left: position.left,
          boxShadow: "0 4px 24px rgba(0,0,0,0.4), 0 0 12px rgba(78,205,196,0.15)",
        }}
      >
        <p className="text-xs text-bw-text leading-relaxed">{step.text}</p>
        <div className="flex items-center justify-between mt-2.5">
          <span className="text-[10px] text-bw-muted tabular-nums">
            {stepIndex + 1}/{totalSteps}
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={onDismiss}
              className="px-2 py-1 text-[10px] text-bw-muted hover:text-bw-text cursor-pointer transition-colors"
            >
              Passer
            </button>
            <button
              onClick={onNext}
              className="px-2.5 py-1 rounded-lg bg-bw-teal text-black text-[10px] font-bold cursor-pointer hover:brightness-110 transition-all"
            >
              {stepIndex >= totalSteps - 1 ? "Termine" : "Suivant"}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
