"use client";

import { motion } from "motion/react";
import type { Module8Data } from "@/hooks/use-session-polling";

interface TalentCardProps {
  module8: Module8Data;
}

export function TalentCard({ module8 }: TalentCardProps) {
  const card = module8.talentCard;

  if (!card) {
    return (
      <div className="flex flex-col items-center gap-4 text-center py-12">
        <div className="w-10 h-10 border-2 border-white/20 border-t-bw-teal rounded-full animate-spin" />
        <p className="text-sm text-white/50">Génération de ta carte talent en cours...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto px-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-full rounded-2xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${card.talentCategoryColor}20, ${card.talentCategoryColor}05)`,
          border: `2px solid ${card.talentCategoryColor}40`,
        }}
      >
        {/* Header gradient — dynamic color from data */}
        <div
          className="h-2"
          style={{ background: `linear-gradient(90deg, ${card.talentCategoryColor}, ${card.talentCategoryColor}80)` }}
        />

        <div className="p-6 space-y-4">
          {/* Avatar + Name */}
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
              style={{ backgroundColor: card.talentCategoryColor + "20" }}
            >
              {card.roleEmoji}
            </div>
            <div>
              <p className="text-lg font-bold text-white">{card.displayName}</p>
              <p className="text-sm" style={{ color: card.talentCategoryColor }}>
                {card.roleLabel}
              </p>
            </div>
          </div>

          {/* Category badge — dynamic color from data */}
          <div
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: card.talentCategoryColor + "20",
              color: card.talentCategoryColor,
              border: `1px solid ${card.talentCategoryColor}30`,
            }}
          >
            {card.talentCategoryLabel}
          </div>

          {/* Strengths */}
          <div className="space-y-2">
            <p className="text-xs text-white/40 uppercase tracking-wider">Forces</p>
            <div className="flex flex-wrap gap-2">
              {card.strengths.map((strength, i) => (
                <motion.span
                  key={strength}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.15 }}
                  className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium"
                >
                  {strength}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Banlieuwood badge */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-white/20">BANLIEUWOOD</span>
            {card.isVeto && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-bw-amber/20 border border-bw-amber/30 text-bw-amber font-medium">
                Veto
              </span>
            )}
            <span className="text-xs text-white/20">Carte Talent</span>
          </div>
          {card.isVeto && (
            <p className="text-[10px] text-bw-amber/60 text-center mt-1">
              Rôle attribué par l&apos;intervenant Banlieuwood
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
