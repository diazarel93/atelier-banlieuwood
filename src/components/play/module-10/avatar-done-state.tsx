"use client";

import { motion } from "motion/react";
import { DiceBearAvatar } from "@/components/avatar-dicebear";
import type { AvatarOptions } from "@/components/avatar-dicebear";

export interface AvatarDoneStateProps {
  prenom: string;
  avatar: AvatarOptions;
  responsesCount?: number;
  connectedCount?: number;
}

export function AvatarDoneState({ prenom, avatar, responsesCount, connectedCount }: AvatarDoneStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center gap-5 text-center"
    >
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
      >
        <DiceBearAvatar options={avatar} size={160} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-1">
        <h2 className="text-2xl font-bold text-bw-heading">{prenom}</h2>
        <p className="text-sm text-bw-muted">Personnage créé !</p>
      </motion.div>

      {responsesCount != null && connectedCount != null && connectedCount > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="text-xs text-bw-muted bg-bw-elevated px-4 py-2 rounded-full border border-white/[0.06]">
          {responsesCount}/{connectedCount} ont répondu
        </motion.div>
      )}
    </motion.div>
  );
}
