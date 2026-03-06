"use client";

import { memo } from "react";
import { motion } from "motion/react";
import { SeatCard, type SeatStudent } from "./seat-card";

interface Team {
  id: string;
  team_name: string;
  team_color: string;
  team_number: number;
  students: { id: string }[];
}

function TableGroupInner({
  team,
  students,
  responseMap,
  onStudentClick,
}: {
  team: Team;
  students: SeatStudent[];
  responseMap: Map<string, string>;
  onStudentClick: (studentId: string) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-3 space-y-2"
      style={{ borderColor: `${team.team_color}30` }}
    >
      {/* Team header */}
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: team.team_color }} />
        <span className="text-xs font-semibold text-bw-heading truncate">{team.team_name}</span>
        <span className="text-xs text-bw-muted ml-auto tabular-nums">{students.length}</span>
      </div>

      {/* Seats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
        {students.map((s) => (
          <SeatCard
            key={s.id}
            student={s}
            lastResponse={responseMap.get(s.id) || null}
            onClick={() => onStudentClick(s.id)}
          />
        ))}
      </div>
    </motion.div>
  );
}

export const TableGroup = memo(TableGroupInner);
