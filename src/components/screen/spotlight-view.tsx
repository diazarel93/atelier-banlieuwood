"use client";

import { motion } from "motion/react";

// ═══════════════════════════════════════════════════════════════
// SPOTLIGHT VIEW — Single response displayed large on projector
// Teacher selects which response to spotlight from the cockpit.
// ═══════════════════════════════════════════════════════════════

interface SpotlightResponse {
  id: string;
  text: string;
  students?: { display_name: string; avatar?: string } | null;
}

interface SpotlightViewProps {
  responses: SpotlightResponse[];
  moduleColor?: string;
}

export function SpotlightView({ responses, moduleColor = "#FF6B35" }: SpotlightViewProps) {
  if (!responses || responses.length === 0) return null;

  // Show the most recently highlighted response as the spotlight
  const response = responses[responses.length - 1];

  return (
    <motion.div
      key="screen-mode-spotlight"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center p-8"
      style={{ background: "radial-gradient(ellipse at center, rgba(26,26,46,0.95) 0%, rgba(10,10,20,0.98) 100%)" }}
    >
      {/* Subtle glow behind the card */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${moduleColor}15 0%, transparent 60%)`,
        }}
      />

      {/* Label */}
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-sm text-white/40 uppercase tracking-[0.3em] font-semibold mb-8 relative z-10"
      >
        Reponse mise en avant
      </motion.p>

      {/* Main spotlight card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
        className="relative z-10 max-w-3xl w-full rounded-3xl px-10 py-8"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: `1px solid ${moduleColor}30`,
          boxShadow: `0 0 60px ${moduleColor}10, 0 20px 60px rgba(0,0,0,0.3)`,
        }}
      >
        {/* Quote marks */}
        <span
          className="absolute top-4 left-6 text-6xl font-serif leading-none opacity-20"
          style={{ color: moduleColor }}
        >
          &ldquo;
        </span>

        {/* Response text */}
        <p className="text-2xl sm:text-3xl text-white/90 leading-relaxed font-medium pl-8 pr-4">{response.text}</p>

        {/* Student name */}
        {response.students?.display_name && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-3 mt-6 pt-4"
            style={{ borderTop: `1px solid ${moduleColor}15` }}
          >
            {response.students.avatar && <span className="text-2xl">{response.students.avatar}</span>}
            <span className="text-lg text-white/50 font-medium">— {response.students.display_name}</span>
          </motion.div>
        )}
      </motion.div>

      {/* Response count indicator */}
      {responses.length > 1 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-sm text-white/30 mt-6 tabular-nums relative z-10"
        >
          {responses.length} reponse{responses.length > 1 ? "s" : ""} mise{responses.length > 1 ? "s" : ""} en avant
        </motion.p>
      )}
    </motion.div>
  );
}
