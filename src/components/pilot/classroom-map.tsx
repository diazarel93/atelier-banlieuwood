"use client";

import { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { StudentState } from "./pulse-ring";
import type { SeatStudent } from "./seat-card";
import { DeskPair } from "./desk-pair";
import { StudentActionPopover } from "./student-action-popover";

interface Team {
  id: string;
  team_name: string;
  team_color: string;
  team_number: number;
  students: { id: string; display_name: string; avatar: string }[];
}

interface Response {
  id: string;
  student_id: string;
  text: string;
  is_hidden: boolean;
  reset_at?: string | null;
}

interface ClassroomMapProps {
  students: SeatStudent[];
  teams: Team[];
  responses: Response[];
  sessionStatus: string;
  onNudge: (studentId: string, text: string) => void;
  onWarn: (studentId: string) => void;
  onBroadcast?: () => void;
}

const STATE_ORDER: Record<StudentState, number> = {
  stuck: 0,
  active: 1,
  responded: 2,
  disconnected: 3,
};

/** Chunk an array into pairs */
function toPairs<T>(arr: T[]): [T, T | undefined][] {
  const pairs: [T, T | undefined][] = [];
  for (let i = 0; i < arr.length; i += 2) {
    pairs.push([arr[i], arr[i + 1]]);
  }
  return pairs;
}

export function ClassroomMap({
  students,
  teams,
  responses,
  sessionStatus,
  onNudge,
  onWarn,
  onBroadcast,
}: ClassroomMapProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Build maps
  const responseMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of responses) {
      if (!r.is_hidden && !r.reset_at && !map.has(r.student_id)) {
        map.set(r.student_id, r.text);
      }
    }
    return map;
  }, [responses]);

  const responseIdMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of responses) {
      if (!r.is_hidden && !r.reset_at && !map.has(r.student_id)) {
        map.set(r.student_id, r.id);
      }
    }
    return map;
  }, [responses]);

  // Stats
  const respondedCount = students.filter((s) => s.state === "responded").length;
  const stuckCount = students.filter((s) => s.state === "stuck").length;
  const activeCount = students.filter((s) => s.state === "active").length;
  const disconnectedCount = students.filter((s) => s.state === "disconnected").length;
  const total = students.length;
  const hasTeams = teams.length > 0;

  const sortedStudents = useMemo(
    () => [...students].sort((a, b) => STATE_ORDER[a.state] - STATE_ORDER[b.state]),
    [students]
  );

  const selectedStudent = useMemo(
    () => (selectedStudentId ? students.find((s) => s.id === selectedStudentId) || null : null),
    [selectedStudentId, students]
  );

  const handleStudentClick = useCallback((studentId: string) => {
    setSelectedStudentId(studentId);
  }, []);

  const handleNudge = useCallback(
    (studentId: string, text: string) => {
      const responseId = responseIdMap.get(studentId);
      if (responseId) {
        onNudge(responseId, text);
      }
    },
    [responseIdMap, onNudge]
  );

  // Build desk rows — group by team then pair, or just pair all students
  const deskRows = useMemo(() => {
    if (hasTeams) {
      const rows: { teamId: string; teamName: string; teamColor: string; pairs: [SeatStudent, SeatStudent | undefined][] }[] = [];
      for (const team of teams) {
        const teamStudentIds = new Set(team.students.map((s) => s.id));
        const teamStudents = sortedStudents.filter((s) => teamStudentIds.has(s.id));
        if (teamStudents.length === 0) continue;
        rows.push({
          teamId: team.id,
          teamName: team.team_name,
          teamColor: team.team_color,
          pairs: toPairs(teamStudents),
        });
      }
      // Unassigned
      const allTeamIds = new Set(teams.flatMap((t) => t.students.map((s) => s.id)));
      const unassigned = sortedStudents.filter((s) => !allTeamIds.has(s.id));
      if (unassigned.length > 0) {
        rows.push({
          teamId: "__unassigned__",
          teamName: "Non assignés",
          teamColor: "#666",
          pairs: toPairs(unassigned),
        });
      }
      return rows;
    }
    // No teams — single group
    return [{
      teamId: "__all__",
      teamName: "",
      teamColor: "",
      pairs: toPairs(sortedStudents),
    }];
  }, [hasTeams, teams, sortedStudents]);

  return (
    <div className="space-y-4">
      {/* Stats header */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-bw-teal" />
            <span className="text-bw-muted">Répondu</span>
            <span className="font-bold text-bw-teal tabular-nums">{respondedCount}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-bw-primary" />
            <span className="text-bw-muted">En cours</span>
            <span className="font-bold text-bw-primary tabular-nums">{activeCount}</span>
          </span>
          {stuckCount > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-bw-amber" />
              <span className="text-bw-muted">Bloqués</span>
              <span className="font-bold text-bw-amber tabular-nums">{stuckCount}</span>
            </span>
          )}
          {disconnectedCount > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white/20" />
              <span className="text-bw-muted">Hors ligne</span>
              <span className="font-bold text-bw-muted tabular-nums">{disconnectedCount}</span>
            </span>
          )}
        </div>
        <div className="ml-auto text-xs text-bw-muted tabular-nums">
          {respondedCount}/{total}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden flex">
        {respondedCount > 0 && (
          <div className="h-full bg-bw-teal transition-all duration-500" style={{ width: `${(respondedCount / Math.max(total, 1)) * 100}%` }} />
        )}
        {activeCount > 0 && (
          <div className="h-full bg-bw-primary transition-all duration-500" style={{ width: `${(activeCount / Math.max(total, 1)) * 100}%` }} />
        )}
        {stuckCount > 0 && (
          <div className="h-full bg-bw-amber transition-all duration-500" style={{ width: `${(stuckCount / Math.max(total, 1)) * 100}%` }} />
        )}
      </div>

      {/* ── CLASSROOM FLOOR PLAN ── */}
      <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-5 overflow-hidden">

        {/* Teacher's desk — front of classroom */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2 px-5 py-2 rounded-xl bg-bw-primary/10 border border-bw-primary/20">
            <span className="text-sm">🎓</span>
            <span className="text-[11px] font-semibold text-bw-primary uppercase tracking-wider">Bureau du prof</span>
          </div>
        </div>

        {/* Separator line */}
        <div className="h-px bg-white/[0.06] mx-8" />

        {/* Desk rows by team */}
        <div className="space-y-5">
          {deskRows.map((group) => (
            <motion.div
              key={group.teamId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              {/* Team label */}
              {group.teamName && (
                <div className="flex items-center gap-2 px-1">
                  {group.teamColor && group.teamColor !== "#666" && (
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: group.teamColor }} />
                  )}
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: group.teamColor || undefined }}>
                    {group.teamName}
                  </span>
                  <div className="flex-1 h-px" style={{ background: group.teamColor ? `${group.teamColor}20` : "rgba(255,255,255,0.04)" }} />
                </div>
              )}

              {/* Rows of desks — 3 desks per row (6 students) */}
              {(() => {
                const desksPerRow = 3;
                const rows: [SeatStudent, SeatStudent | undefined][][] = [];
                for (let i = 0; i < group.pairs.length; i += desksPerRow) {
                  rows.push(group.pairs.slice(i, i + desksPerRow));
                }
                return rows.map((row, rowIdx) => (
                  <div key={rowIdx} className="flex justify-center gap-3 flex-wrap">
                    {row.map(([left, right], deskIdx) => (
                      <DeskPair
                        key={`${left.id}-${deskIdx}`}
                        left={left}
                        right={right}
                        responseMap={responseMap}
                        onStudentClick={handleStudentClick}
                        teamColor={group.teamColor || undefined}
                      />
                    ))}
                  </div>
                ));
              })()}
            </motion.div>
          ))}
        </div>

        {/* No students */}
        {total === 0 && (
          <div className="text-center py-8 text-bw-muted">
            <p className="text-sm">Aucun élève connecté</p>
          </div>
        )}
      </div>

      {/* Student action popover */}
      <AnimatePresence>
        {selectedStudent && (
          <StudentActionPopover
            student={selectedStudent}
            lastResponse={responseMap.get(selectedStudent.id) || null}
            onClose={() => setSelectedStudentId(null)}
            onNudge={handleNudge}
            onWarn={onWarn}
            onBroadcast={onBroadcast ? () => { onBroadcast(); setSelectedStudentId(null); } : undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
