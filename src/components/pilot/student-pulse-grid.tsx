"use client";

import { memo, useCallback } from "react";
import { motion } from "motion/react";
import type { StudentState } from "./pulse-ring";

interface StudentPulse {
  id: string;
  display_name: string;
  avatar: string;
  state: StudentState;
  hand_raised_at?: string | null;
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
  disconnected: "ring-black/[0.06]",
};

const STATE_BG: Record<StudentState, string> = {
  responded: "bg-bw-teal/10",
  active: "bg-black/[0.03]",
  stuck: "bg-bw-amber/10",
  disconnected: "bg-bw-bg/60",
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

  const STATE_GLOW: Record<StudentState, string | undefined> = {
    responded: "0 0 8px rgba(78,205,196,0.15)",
    active: undefined,
    stuck: "0 0 8px rgba(245,158,11,0.15)",
    disconnected: undefined,
  };

  return (
    <motion.div
      layout
      className={`flex items-center gap-2 px-2.5 py-2 rounded-xl ring-1 ${STATE_RING[student.state]} ${STATE_BG[student.state]} group relative`}
      style={{ boxShadow: STATE_GLOW[student.state] }}
    >
      {student.state === "active" && (
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 rounded-xl ring-1 ring-bw-primary/30 pointer-events-none"
        />
      )}
      <motion.span
        className="text-sm"
        animate={
          student.state === "responded"
            ? { scale: [1, 1.15, 1] }
            : student.state === "stuck"
              ? { rotate: [-3, 3, -3] }
              : student.state === "active"
                ? { scale: [1, 1.06, 1] }
                : {}
        }
        transition={
          student.state === "responded"
            ? { duration: 0.5, ease: "easeOut" }
            : student.state === "stuck"
              ? { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
              : student.state === "active"
                ? { repeat: Infinity, duration: 3, ease: "easeInOut" }
                : {}
        }
      >
        {student.avatar}
      </motion.span>
      <span className="text-xs truncate flex-1">{student.display_name}</span>
      {student.state === "responded" && <span className="text-xs text-bw-teal font-bold">OK</span>}
      {student.state === "stuck" && !student.hand_raised_at && (
        <span className="text-xs text-bw-amber font-bold">?</span>
      )}
      {student.hand_raised_at && (
        <motion.span
          animate={{ y: [0, -2, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="text-sm"
          title="Main levée — a besoin d'aide"
        >
          ✋
        </motion.span>
      )}
      {onRemove && (
        <button
          onClick={handleRemove}
          className="opacity-0 group-hover:opacity-100 text-bw-muted hover:text-bw-danger text-xs cursor-pointer transition-opacity"
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
        <h4 className="text-xs uppercase tracking-wider font-bold flex items-center gap-2">
          <span className="text-bw-teal">Joueurs</span>
          <span className="px-1.5 py-0.5 rounded-full bg-bw-teal/10 text-bw-teal text-xs tabular-nums">
            {students.length}
          </span>
        </h4>
        {teams.map((team) => {
          const teamMembers = sorted.filter((s) => teamStudentIds.get(team.id)?.has(s.id));
          if (teamMembers.length === 0) return null;
          return (
            <div key={team.id} className="space-y-1">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: team.team_color }} />
                <span className="text-xs font-semibold">{team.team_name}</span>
                <span className="text-xs text-bw-muted">({teamMembers.length})</span>
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
            <span className="text-xs text-bw-muted font-semibold">Non assigne</span>
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
      <h4 className="text-xs uppercase tracking-wider font-bold flex items-center gap-2">
        <span className="text-bw-teal">Joueurs</span>
        <span className="px-1.5 py-0.5 rounded-full bg-bw-teal/10 text-bw-teal text-xs tabular-nums">
          {students.length}
        </span>
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
