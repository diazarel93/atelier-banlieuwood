"use client";

import { motion, AnimatePresence } from "motion/react";

interface StuckStudent {
  id: string;
  name: string;
  avatar: string;
}

interface StuckAlertProps {
  students: StuckStudent[];
  onNudgeAll: () => void;
  isPending?: boolean;
}

export function StuckAlert({ students, onNudgeAll, isPending }: StuckAlertProps) {
  return (
    <AnimatePresence>
      {students.length > 0 && (
        <motion.div
          key="stuck-alert"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border border-bw-amber/30"
          style={{
            background: "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.04))",
            boxShadow: "0 0 16px rgba(245,158,11,0.10), inset 0 1px 0 rgba(0,0,0,0.04)",
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm flex-shrink-0">⚠️</span>
            <div className="min-w-0">
              <p className="text-xs text-bw-amber font-semibold">
                {students.length} élève{students.length > 1 ? "s" : ""} bloqué{students.length > 1 ? "s" : ""} depuis +1min
              </p>
              <p className="text-xs text-bw-amber/80 truncate font-medium">
                {students.map(s => s.name).join(", ")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onNudgeAll}
            disabled={isPending}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all hover:brightness-110 disabled:opacity-40 active:scale-95 bg-bw-amber text-black"
          >
            {isPending ? "..." : "Relancer tous"}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
