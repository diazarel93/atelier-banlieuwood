"use client";

import { motion } from "motion/react";
import type { StudentState } from "./pulse-ring";

interface StudentPulse {
  id: string;
  display_name: string;
  avatar: string;
  state: StudentState;
}

interface StudentPulseGridProps {
  students: StudentPulse[];
  onRemove?: (studentId: string) => void;
}

const STATE_RING: Record<StudentState, string> = {
  responded: "ring-bw-teal/60",
  active: "ring-bw-primary/40",
  stuck: "ring-bw-amber/60",
  disconnected: "ring-white/[0.06]",
};

const STATE_BG: Record<StudentState, string> = {
  responded: "bg-bw-teal/10",
  active: "bg-bw-bg",
  stuck: "bg-bw-amber/10",
  disconnected: "bg-bw-bg opacity-40",
};

const STATE_ORDER: Record<StudentState, number> = {
  stuck: 0,
  active: 1,
  responded: 2,
  disconnected: 3,
};

export function StudentPulseGrid({ students, onRemove }: StudentPulseGridProps) {
  if (students.length === 0) {
    return <p className="text-sm text-bw-muted text-center py-4">Aucun joueur</p>;
  }

  const sorted = [...students].sort((a, b) => STATE_ORDER[a.state] - STATE_ORDER[b.state]);

  return (
    <div className="space-y-2">
      <h4 className="text-[10px] uppercase tracking-wider font-bold flex items-center gap-2">
        <span className="text-bw-teal">Joueurs</span>
        <span className="px-1.5 py-0.5 rounded-full bg-bw-teal/10 text-bw-teal text-[9px] tabular-nums">{students.length}</span>
      </h4>
      <div className="grid grid-cols-2 gap-1.5">
        {sorted.map((s) => (
          <motion.div
            key={s.id}
            layout
            className={`flex items-center gap-2 px-2.5 py-2 rounded-xl ring-1 ${STATE_RING[s.state]} ${STATE_BG[s.state]} group relative`}
          >
            {s.state === "active" && (
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 rounded-xl ring-1 ring-bw-teal/30 pointer-events-none"
              />
            )}
            <span className="text-sm">{s.avatar}</span>
            <span className="text-xs truncate flex-1">{s.display_name}</span>
            {s.state === "responded" && (
              <span className="text-[9px] text-bw-teal font-bold">OK</span>
            )}
            {s.state === "stuck" && (
              <span className="text-[9px] text-bw-amber font-bold">?</span>
            )}
            {onRemove && (
              <button
                onClick={() => {
                  if (confirm(`Retirer ${s.display_name} ?`)) onRemove(s.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-bw-muted hover:text-red-400 text-xs cursor-pointer transition-opacity"
              >
                ✕
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
