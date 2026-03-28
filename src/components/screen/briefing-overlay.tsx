"use client";

import { motion, AnimatePresence } from "motion/react";

export interface SeanceIntroData {
  icon: string;
  title: string;
  subtitle: string;
  duration: string;
  description: string;
  activityType: string;
  color: string;
  steps: string[];
}

export interface BriefingOverlayProps {
  showBriefing: boolean;
  seanceIntro: SeanceIntroData | undefined;
  onComplete?: () => void;
}

export function BriefingOverlay({ showBriefing, seanceIntro }: BriefingOverlayProps) {
  return (
    <AnimatePresence>
      {showBriefing && seanceIntro && (
        <motion.div
          key="briefing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center"
          style={{ background: "rgba(10,12,16,0.95)" }}
        >
          <div className="max-w-3xl w-full text-center space-y-5 px-8">
            {/* Phase 1: Icon with halo */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-28 h-28 rounded-3xl mx-auto flex items-center justify-center text-5xl relative"
              style={{
                background: `${seanceIntro.color}20`,
                border: `2px solid ${seanceIntro.color}40`,
                boxShadow: `0 0 80px ${seanceIntro.color}30, 0 0 160px ${seanceIntro.color}10`,
              }}
            >
              {seanceIntro.icon}
            </motion.div>
            {/* Phase 2: Title + details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="space-y-4"
            >
              <span
                className="text-sm font-bold uppercase tracking-[0.3em] px-4 py-1.5 rounded-full inline-block"
                style={{ backgroundColor: `${seanceIntro.color}20`, color: seanceIntro.color }}
              >
                {seanceIntro.activityType}
              </span>
              <h2 className="text-5xl font-bold text-white">{seanceIntro.title}</h2>
              <p className="text-xs uppercase tracking-wider font-medium" style={{ color: seanceIntro.color }}>
                {seanceIntro.subtitle} · {seanceIntro.duration}
              </p>
              <p className="text-xl text-bw-muted max-w-xl mx-auto">{seanceIntro.description}</p>
            </motion.div>
            {/* Phase 3: Steps appear one by one */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.5 }}
              className="flex items-center justify-center gap-3 flex-wrap"
            >
              {seanceIntro.steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 4 + i * 0.4 }}
                  className="flex items-center gap-2"
                >
                  <span
                    className="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: `${seanceIntro.color}25`,
                      color: seanceIntro.color,
                      border: `1px solid ${seanceIntro.color}40`,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm text-bw-text">{step}</span>
                  {i < seanceIntro.steps.length - 1 && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.3 }}
                      transition={{ delay: 4.2 + i * 0.4 }}
                      className="mx-1 text-bw-muted"
                    >
                      {"\u2192"}
                    </motion.span>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
