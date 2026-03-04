"use client";

import { memo, useCallback } from "react";
import { motion } from "motion/react";
import type { StudentState } from "./pulse-ring";

interface StudentPulse {
  id: string;
  display_name: string;
  avatar: string;
  state: StudentState;
}

interface Team {
  id: string;
  team_name: string;
  team_color: string;
  team_number: number;
  students: { id: string }[];
}

interface StudentPulseGridProps {
  students: StudentPulse[];
  onRemove?: (studentId: string) => void;
  teams?: Team[];
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

const StudentPulseItem = memo(function StudentPulseItem({
  student,
  onRemove,
}: {
  student: StudentPulse;
  onRemove?: (studentId: string) => void;
}) {
  const handleRemove = useCallback(() => {
    if (confirm(`Retirer ${student.display_name} ?`)) onRemove!(student.id);
  }, [student.id, student.display_name, onRemove]);

  return (
    <motion.div
      layout
      className={`flex items-center gap-2 px-2.5 py-2 rounded-xl ring-1 ${STATE_RING[student.state]} ${STATE_BG[student.state]} group relative`}
    >
      {student.state === "active" && (
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 rounded-xl ring-1 ring-bw-teal/30 pointer-events-none"
        />
      )}
      <span className="text-sm">{student.avatar}</span>
      <span className="text-xs truncate flex-1">{student.display_name}</span>
      {student.state === "responded" && (
        <span className="text-[9px] text-bw-teal font-bold">OK</span>
      )}
      {student.state === "stuck" && (
        <span className="text-[9px] text-bw-amber font-bold">?</span>
      )}
      {onRemove && (
        <button
          onClick={handleRemove}
          className="opacity-0 group-hover:opacity-100 text-bw-muted hover:text-red-400 text-xs cursor-pointer transition-opacity"
        >
          ✕
        </button>
      )}
    </motion.div>
  );
});

function StudentPulseGridInner({ students, onRemove, teams }: StudentPulseGridProps) {
  if (students.length === 0) {
    return <p className="text-sm text-bw-muted text-center py-4">Aucun joueur</p>;
  }

  const sorted = [...students].sort((a, b) => STATE_ORDER[a.state] - STATE_ORDER[b.state]);

  // Group by team if teams are present
  if (teams && teams.length > 0) {
    const teamStudentIds = new Map<string, Set<string>>();
    for (const t of teams) {
      teamStudentIds.set(t.id, new Set(t.students.map((s) => s.id)));
    }

    const unassigned = sorted.filter((s) => !teams.some((t) => teamStudentIds.get(t.id)?.has(s.id)));

    return (
      <div className="space-y-3">
        <h4 className="text-[10px] uppercase tracking-wider font-bold flex items-center gap-2">
          <span className="text-bw-teal">Joueurs</span>
          <span className="px-1.5 py-0.5 rounded-full bg-bw-teal/10 text-bw-teal text-[9px] tabular-nums">{students.length}</span>
        </h4>
        {teams.map((team) => {
          const teamMembers = sorted.filter((s) => teamStudentIds.get(team.id)?.has(s.id));
          if (teamMembers.length === 0) return null;
          return (
            <div key={team.id} className="space-y-1">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: team.team_color }} />
                <span className="text-[10px] font-semibold">{team.team_name}</span>
                <span className="text-[9px] text-bw-muted">({teamMembers.length})</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {teamMembers.map((s) => (
                  <StudentPulseItem key={s.id} student={s} onRemove={onRemove} />
                ))}
              </div>
            </div>
          );
        })}
        {unassigned.length > 0 && (
          <div className="space-y-1">
            <span className="text-[10px] text-bw-muted font-semibold">Non assigne</span>
            <div className="grid grid-cols-2 gap-1.5">
              {unassigned.map((s) => (
                <StudentPulseItem key={s.id} student={s} onRemove={onRemove} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-[10px] uppercase tracking-wider font-bold flex items-center gap-2">
        <span className="text-bw-teal">Joueurs</span>
        <span className="px-1.5 py-0.5 rounded-full bg-bw-teal/10 text-bw-teal text-[9px] tabular-nums">{students.length}</span>
      </h4>
      <div className="grid grid-cols-2 gap-1.5">
        {sorted.map((s) => (
          <StudentPulseItem key={s.id} student={s} onRemove={onRemove} />
        ))}
      </div>
    </div>
  );
}

export const StudentPulseGrid = memo(StudentPulseGridInner);
