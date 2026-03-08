"use client";

import { useState } from "react";
import { motion } from "motion/react";
import type { Module8Data } from "@/hooks/use-session-polling";

interface RolePickerProps {
  module8: Module8Data;
  sessionId: string;
  studentId: string;
}

export function RolePicker({ module8, sessionId, studentId }: RolePickerProps) {
  const availableRoles = module8.availableRoles || [];
  const takenRoles = module8.takenRoles || [];
  const isMyTurn = module8.isMyTurn || false;
  const [submitting, setSubmitting] = useState(false);
  const [chosen, setChosen] = useState<string | null>(
    takenRoles.find((r) => r.studentId === studentId)?.roleKey || null
  );

  const handleChoose = async (roleKey: string) => {
    if (!isMyTurn || submitting || chosen) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/sessions/${sessionId}/scenario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "choose-role",
          studentId,
          roleKey,
        }),
      });
      if (res.ok) setChosen(roleKey);
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  const hasChosen = !!chosen;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Choix du Rôle</h2>
        {isMyTurn && !hasChosen ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-yellow-400 mt-1 font-semibold"
          >
            C&apos;est ton tour ! Choisis ton rôle.
          </motion.p>
        ) : hasChosen ? (
          <p className="text-sm text-emerald-400 mt-1">Rôle choisi !</p>
        ) : (
          <p className="text-sm text-white/50 mt-1">En attente de ton tour...</p>
        )}
      </div>

      {!module8.pointsComputed && (
        <div className="text-center py-6">
          <div className="w-10 h-10 border-2 border-white/20 border-t-teal-400 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-white/50">Le facilitateur calcule les scores...</p>
        </div>
      )}

      {/* Available roles */}
      {module8.pointsComputed && (
        <div className="w-full space-y-3">
          <p className="text-xs text-white/40 uppercase tracking-wider">Rôles disponibles</p>
          {availableRoles.map((role, i) => (
            <motion.button
              key={role.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => handleChoose(role.key)}
              disabled={!isMyTurn || submitting || hasChosen}
              className={`w-full p-4 rounded-xl text-left transition-all ${
                chosen === role.key
                  ? "bg-teal-500/20 border-2 border-teal-400"
                  : isMyTurn && !hasChosen
                  ? "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 cursor-pointer"
                  : "bg-white/5 border border-white/10 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{role.emoji}</span>
                <div>
                  <p className="text-sm font-bold text-white">{role.label}</p>
                  <p className="text-xs text-white/50">{role.description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Taken roles */}
      {takenRoles.length > 0 && (
        <div className="w-full space-y-2 mt-2">
          <p className="text-xs text-white/40 uppercase tracking-wider">Rôles attribués</p>
          {takenRoles.map((role) => (
            <div
              key={role.roleKey}
              className="flex items-center gap-2 p-2 rounded-lg bg-white/5 text-xs"
            >
              <span className="text-emerald-400 font-semibold">{role.roleLabel}</span>
              <span className="text-white/30">—</span>
              <span className="text-white/50">
                {role.studentId === studentId ? "Toi !" : "Attribué"}
              </span>
              {role.isVeto && (
                <span className="ml-auto text-yellow-400 text-xs">Veto BW</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
