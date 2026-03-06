"use client";

import { motion } from "motion/react";

export interface ObjectiveBannerProps {
  seanceIntro: {
    icon: string;
    description: string;
    steps: string[];
  } | undefined;
  connectedCount: number;
  /** Cinema fun fact text */
  objectifText: string;
  moduleColor: string;
}

export function ObjectiveBanner({ seanceIntro, connectedCount, objectifText, moduleColor }: ObjectiveBannerProps) {
  if (!seanceIntro) {
    return (
      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 2 }} className="flex items-center justify-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-bw-amber" />
        <span className="text-lg text-bw-muted">En attente du facilitateur</span>
      </motion.div>
    );
  }
  return (
    <div className="space-y-5">
      {/* Objective */}
      <div className="flex items-center justify-center gap-3">
        <span className="text-2xl">{seanceIntro.icon}</span>
        <span className="text-lg font-medium" style={{ color: moduleColor }}>
          Objectif : {seanceIntro.description}
        </span>
      </div>
      {/* First step highlighted */}
      {seanceIntro.steps[0] && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-2"
        >
          <span className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center"
            style={{ backgroundColor: `${moduleColor}25`, color: moduleColor }}>1</span>
          <span className="text-base text-bw-text">{seanceIntro.steps[0]}</span>
        </motion.div>
      )}
      {/* Connected count */}
      {connectedCount > 0 && (
        <motion.div
          key={connectedCount}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="flex items-center justify-center gap-2"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-bw-teal" />
          <span className="text-base text-bw-teal font-medium">
            {connectedCount} élève{connectedCount > 1 ? "s" : ""} connecté{connectedCount > 1 ? "s" : ""}
          </span>
        </motion.div>
      )}
      {/* Fun fact */}
      <motion.p
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ repeat: Infinity, duration: 8 }}
        className="text-xs text-bw-muted/60 italic text-center"
      >
        {objectifText}
      </motion.p>
    </div>
  );
}
