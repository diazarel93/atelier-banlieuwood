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
  moduleResponseTexts?: Map<string, string>;
  sessionStatus: string;
  onNudge: (studentId: string, text: string) => void;
  onWarn: (studentId: string) => void;
  onBroadcast?: () => void;
  onNudgeAllStuck?: (text: string) => void;
  onStudentClick?: (studentId: string) => void;
}

const STATE_ORDER: Record<StudentState, number> = {
  stuck: 0,
  active: 1,
  responded: 2,
  disconnected: 3,
};

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
  moduleResponseTexts,
  sessionStatus,
  onNudge,
  onWarn,
  onBroadcast,
  onNudgeAllStuck,
  onStudentClick,
}: ClassroomMapProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Build merged response map
  const { responseMap, responseIdMap } = useMemo(() => {
    const rMap = new Map<string, string>();
    const idMap = new Map<string, string>();
    for (const r of responses) {
      if (!r.is_hidden && !r.reset_at && !rMap.has(r.student_id)) {
        rMap.set(r.student_id, r.text);
        idMap.set(r.student_id, r.id);
      }
    }
    if (moduleResponseTexts) {
      for (const [studentId, text] of moduleResponseTexts) {
        if (!rMap.has(studentId)) rMap.set(studentId, text);
      }
    }
    return { responseMap: rMap, responseIdMap: idMap };
  }, [responses, moduleResponseTexts]);

  // Stats
  const { respondedCount, disconnectedCount } = useMemo(() => {
    let responded = 0, disconnected = 0;
    for (const s of students) {
      if (s.state === "responded") responded++;
      else if (s.state === "disconnected") disconnected++;
    }
    return { respondedCount: responded, disconnectedCount: disconnected };
  }, [students]);

  const total = students.length;
  const onlineTotal = total - disconnectedCount;
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
    if (onStudentClick) {
      onStudentClick(studentId);
    } else {
      setSelectedStudentId(studentId);
    }
  }, [onStudentClick]);

  const handleNudge = useCallback(
    (studentId: string, text: string) => {
      const responseId = responseIdMap.get(studentId);
      if (responseId) onNudge(responseId, text);
    },
    [responseIdMap, onNudge]
  );

  // Build desk rows
  const deskRows = useMemo(() => {
    if (hasTeams) {
      const rows: { teamId: string; teamName: string; teamColor: string; pairs: [SeatStudent, SeatStudent | undefined][] }[] = [];
      for (const team of teams) {
        const idSet = new Set(team.students.map((s) => s.id));
        const members = sortedStudents.filter((s) => idSet.has(s.id));
        if (members.length === 0) continue;
        rows.push({ teamId: team.id, teamName: team.team_name, teamColor: team.team_color, pairs: toPairs(members) });
      }
      const allIds = new Set(teams.flatMap((t) => t.students.map((s) => s.id)));
      const unassigned = sortedStudents.filter((s) => !allIds.has(s.id));
      if (unassigned.length > 0) {
        rows.push({ teamId: "__unassigned__", teamName: "Non assignés", teamColor: "#666", pairs: toPairs(unassigned) });
      }
      return rows;
    }
    return [{ teamId: "__all__", teamName: "", teamColor: "", pairs: toPairs(sortedStudents) }];
  }, [hasTeams, teams, sortedStudents]);

  return (
    <div className="space-y-3">

      {/* ── CLASSROOM FLOOR PLAN ── */}
      <div
        className="relative rounded-2xl border border-white/[0.10] overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.03)",
          boxShadow: "inset 0 0 40px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15)",
        }}
      >

        <div className="relative p-4 sm:p-5 space-y-3">

          {/* Teacher's desk — minimal */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2 px-5 py-1.5 rounded-lg border border-white/[0.12] bg-white/[0.04]">
              <span className="text-xs font-bold text-bw-muted uppercase tracking-widest">Tableau</span>
            </div>
          </div>

          {/* Separator */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />

          {/* Desk rows */}
          <div className="space-y-3">
            {deskRows.map((group, gi) => (
              <motion.div
                key={group.teamId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.04 }}
                className="space-y-1.5"
              >
                {/* Team label */}
                {group.teamName && (
                  <div className="flex items-center gap-2 px-1">
                    {group.teamColor && group.teamColor !== "#666" && (
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: group.teamColor, boxShadow: `0 0 6px ${group.teamColor}40` }} />
                    )}
                    <span className="text-xs font-semibold uppercase tracking-wider text-bw-text">
                      {group.teamName}
                    </span>
                    <div className="flex-1 h-px bg-white/[0.06]" />
                    <span className="text-xs text-bw-muted tabular-nums">
                      {group.pairs.reduce((n, [l, r]) => n + (l.state === "responded" ? 1 : 0) + (r?.state === "responded" ? 1 : 0), 0)}/
                      {group.pairs.reduce((n, [, r]) => n + 1 + (r ? 1 : 0), 0)}
                    </span>
                  </div>
                )}

                {/* Rows of desks */}
                {(() => {
                  const desksPerRow = 3;
                  const rows: [SeatStudent, SeatStudent | undefined][][] = [];
                  for (let i = 0; i < group.pairs.length; i += desksPerRow) {
                    rows.push(group.pairs.slice(i, i + desksPerRow));
                  }
                  return rows.map((row, rowIdx) => (
                    <div key={rowIdx} className="flex justify-center gap-2 sm:gap-3">
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

          {/* Empty state */}
          {total === 0 && (
            <div className="text-center py-10 text-bw-muted space-y-2">
              <span className="text-2xl">🪑</span>
              <p className="text-sm">Aucun élève connecté</p>
            </div>
          )}

          {/* All responded */}
          {total > 0 && respondedCount === onlineTotal && onlineTotal > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center pt-1"
            >
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bw-teal/12 border border-bw-teal/25" style={{ boxShadow: "0 0 16px rgba(78,205,196,0.15)" }}>
                <span className="text-xs font-semibold text-bw-teal">Tout le monde a répondu</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Legend — minimal */}
      <div className="flex items-center justify-center gap-4 text-xs text-bw-muted">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-bw-teal" /> Répondu</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#8894A0" }} /> En cours</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#EF6461" }} /> Bloqué</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#555" }} /> Hors ligne</span>
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
