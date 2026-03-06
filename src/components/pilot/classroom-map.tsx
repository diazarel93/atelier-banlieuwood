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
  /** Nudge all students that are stuck */
  onNudgeAllStuck?: (text: string) => void;
  /** Navigate to student fiche in right panel */
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
  const { respondedCount, stuckCount, activeCount, disconnectedCount, handRaisedCount, warningCount } = useMemo(() => {
    let responded = 0, stuck = 0, active = 0, disconnected = 0, handRaised = 0, warned = 0;
    for (const s of students) {
      if (s.state === "responded") responded++;
      else if (s.state === "stuck") stuck++;
      else if (s.state === "active") active++;
      else disconnected++;
      if (s.hand_raised_at) handRaised++;
      if ((s.warnings ?? 0) > 0) warned++;
    }
    return { respondedCount: responded, stuckCount: stuck, activeCount: active, disconnectedCount: disconnected, handRaisedCount: handRaised, warningCount: warned };
  }, [students]);

  const total = students.length;
  const onlineTotal = total - disconnectedCount;
  const hasTeams = teams.length > 0;
  const progressPct = onlineTotal > 0 ? Math.round((respondedCount / onlineTotal) * 100) : 0;

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

      {/* ── STATS — clean, teacher-friendly ── */}
      <div className="flex items-center gap-3">
        {/* Progress ring */}
        <div className="relative w-11 h-11 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
            <motion.circle
              cx="18" cy="18" r="15" fill="none" stroke="#4ECDC4" strokeWidth="3"
              strokeDasharray={`${progressPct * 0.94} 100`}
              strokeLinecap="round"
              initial={{ strokeDasharray: "0 100" }}
              animate={{ strokeDasharray: `${progressPct * 0.94} 100` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-bw-teal tabular-nums">
            {progressPct}%
          </span>
        </div>

        {/* Main counter */}
        <div className="flex-1">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-bw-teal tabular-nums">{respondedCount}</span>
            <span className="text-sm text-bw-muted">/ {onlineTotal} répondu</span>
            {disconnectedCount > 0 && (
              <span className="text-[10px] text-bw-muted ml-1">({disconnectedCount} hors ligne)</span>
            )}
          </div>
          {/* Urgences — only show if something needs attention */}
          <div className="flex items-center gap-3 mt-0.5">
            {stuckCount > 0 && (
              <span className="text-[11px] text-[#EF6461] font-medium">{stuckCount} bloqué{stuckCount > 1 ? "s" : ""}</span>
            )}
            {handRaisedCount > 0 && (
              <span className="text-[11px] text-[#EF6461] font-medium">✋ {handRaisedCount} main{handRaisedCount > 1 ? "s" : ""}</span>
            )}
            {activeCount > 0 && stuckCount === 0 && handRaisedCount === 0 && (
              <span className="text-[11px] text-bw-muted">{activeCount} en cours</span>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex gap-1.5 flex-shrink-0">
          {stuckCount > 0 && (
            <button
              onClick={() => onNudgeAllStuck?.("Besoin d'aide ? N'hésite pas à lever la main.")}
              className="text-[10px] font-medium px-2.5 py-1.5 rounded-lg bg-[#EF6461]/10 border border-[#EF6461]/20 text-[#EF6461] hover:bg-[#EF6461]/20 cursor-pointer transition-colors"
            >
              Relancer {stuckCount} bloqué{stuckCount > 1 ? "s" : ""}
            </button>
          )}
          {handRaisedCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              ✋ {handRaisedCount}
            </span>
          )}
        </div>
      </div>

      {/* ── CLASSROOM FLOOR PLAN ── */}
      <div className="relative rounded-2xl border border-white/[0.06] overflow-hidden bg-white/[0.015]">

        <div className="relative p-4 sm:p-5 space-y-3">

          {/* Teacher's desk — minimal */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2 px-5 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02]">
              <span className="text-[10px] font-bold text-bw-muted uppercase tracking-widest">Tableau</span>
            </div>
          </div>

          {/* Separator */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

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
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: group.teamColor }} />
                    )}
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-bw-muted">
                      {group.teamName}
                    </span>
                    <div className="flex-1 h-px bg-white/[0.04]" />
                    <span className="text-[9px] text-bw-muted tabular-nums">
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
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bw-teal/8 border border-bw-teal/15">
                <span className="text-xs font-medium text-bw-teal">Tout le monde a répondu</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Legend — minimal */}
      <div className="flex items-center justify-center gap-4 text-[9px] text-bw-muted/60">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#4ECDC4]" /> Répondu</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#8894A0]" /> En cours</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#EF6461]" /> Bloqué</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#555]" /> Hors ligne</span>
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
