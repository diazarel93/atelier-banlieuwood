"use client";

import { motion } from "motion/react";
import type { Module8Data } from "@/hooks/use-session-polling";

interface TeamRecapProps {
  module8: Module8Data;
}

export function TeamRecap({ module8 }: TeamRecapProps) {
  const team = module8.team || [];

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Votre Équipe</h2>
        <p className="text-sm text-white/50 mt-1">
          {team.length} membres prêts pour le tournage !
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full">
        {team.map((member, i) => (
          <motion.div
            key={member.studentId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 rounded-xl bg-white/5 border border-white/10 text-center"
          >
            {/* Avatar */}
            <div
              className="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-2xl mb-2"
              style={{ backgroundColor: member.roleColor + "20" }}
            >
              {member.roleEmoji}
            </div>

            {/* Name */}
            <p className="text-sm font-bold text-white truncate">{member.displayName}</p>

            {/* Role */}
            <p
              className="text-xs font-medium mt-1"
              style={{ color: member.roleColor }}
            >
              {member.roleLabel}
            </p>

            {member.isVeto && (
              <span className="inline-block mt-1 text-xs text-yellow-400/60">
                Veto BW
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
