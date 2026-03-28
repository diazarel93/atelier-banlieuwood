"use client";

import { motion, AnimatePresence } from "motion/react";

export interface QuestionTransitionCelebrationProps {
  showTransition: boolean;
  completedQuestion: number;
  moduleColor: string;
}

export function QuestionTransitionCelebration({
  showTransition,
  completedQuestion,
  moduleColor,
}: QuestionTransitionCelebrationProps) {
  return (
    <AnimatePresence>
      {showTransition && (
        <motion.div
          key="q-transition"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-30 flex items-center justify-center pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex items-center gap-4"
          >
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: `${moduleColor}25`, border: `2px solid ${moduleColor}` }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke={moduleColor}
                strokeWidth="3"
                strokeLinecap="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </motion.div>
            <span className="text-3xl font-bold text-white">
              Question {completedQuestion} <span style={{ color: moduleColor }}>{"\u2713"}</span>
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
