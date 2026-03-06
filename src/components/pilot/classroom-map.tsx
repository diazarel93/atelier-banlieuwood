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
        rows.push({ teamId: "__unassigned__", teamName: "Non assignes", teamColor: "#B0A99E", pairs: toPairs(unassigned) });
      }
      return rows;
    }
    return [{ teamId: "__all__", teamName: "", teamColor: "", pairs: toPairs(sortedStudents) }];
  }, [hasTeams, teams, sortedStudents]);

  return (
    <div className="space-y-3">

      {/* ── CLASSROOM FLOOR PLAN ── */}
      <div
        className="relative overflow-hidden"
        style={{
          borderRadius: 16,
          background: "#FAF6EE",
          border: "1px solid #E8DFD2",
          boxShadow: "0 2px 8px rgba(61,43,16,0.04), inset 0 1px 2px rgba(61,43,16,0.02)",
        }}
      >

        <div className="relative p-4 sm:p-5 space-y-3">

          {/* Teacher's desk */}
          <div className="flex justify-center">
            <div
              className="flex items-center gap-2 px-5 py-1.5"
              style={{
                borderRadius: 10,
                background: "#FFFFFF",
                border: "1px solid #E8DFD2",
                boxShadow: "0 1px 3px rgba(61,43,16,0.04)",
              }}
            >
              <span className="text-[11px] font-bold text-[#B0A99E] uppercase tracking-widest">Tableau</span>
            </div>
          </div>

          {/* Separator */}
          <div className="h-px" style={{ background: "linear-gradient(to right, transparent, #E8DFD2, transparent)" }} />

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
                    {group.teamColor && group.teamColor !== "#B0A99E" && (
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: group.teamColor,
                          boxShadow: `0 0 6px ${group.teamColor}30`,
                        }}
                      />
                    )}
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-[#5B5B5B]">
                      {group.teamName}
                    </span>
                    <div className="flex-1 h-px" style={{ background: "#EFE4D8" }} />
                    <span className="text-[12px] text-[#B0A99E] tabular-nums font-medium">
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
            <div className="text-center py-10 space-y-2">
              <span className="text-2xl">🪑</span>
              <p className="text-[13px] text-[#B0A99E]">Aucun eleve connecte</p>
            </div>
          )}

          {/* All responded */}
          {total > 0 && respondedCount === onlineTotal && onlineTotal > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center pt-1"
            >
              <div
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full"
                style={{
                  background: "#F0FAF4",
                  border: "1px solid #C6E9D0",
                  boxShadow: "0 2px 8px rgba(76,175,80,0.08)",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
                <span className="text-[12px] font-semibold" style={{ color: "#2E7D32" }}>Tout le monde a repondu</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-[11px] text-[#B0A99E]">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: "#4CAF50" }} /> Repondu</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: "#F2C94C" }} /> En cours</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: "#EB5757" }} /> Bloque</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: "#C4BDB2" }} /> Hors ligne</span>
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
