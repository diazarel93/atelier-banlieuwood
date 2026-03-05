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

  // Build maps in a single pass
  const { responseMap, responseIdMap } = useMemo(() => {
    const rMap = new Map<string, string>();
    const idMap = new Map<string, string>();
    for (const r of responses) {
      if (!r.is_hidden && !r.reset_at && !rMap.has(r.student_id)) {
        rMap.set(r.student_id, r.text);
        idMap.set(r.student_id, r.id);
      }
    }
    return { responseMap: rMap, responseIdMap: idMap };
  }, [responses]);

  // Stats — single pass
  const { respondedCount, stuckCount, activeCount, disconnectedCount, handRaisedCount } = useMemo(() => {
    let responded = 0, stuck = 0, active = 0, disconnected = 0, handRaised = 0;
    for (const s of students) {
      if (s.state === "responded") responded++;
      else if (s.state === "stuck") stuck++;
      else if (s.state === "active") active++;
      else disconnected++;
      if (s.hand_raised_at) handRaised++;
    }
    return { respondedCount: responded, stuckCount: stuck, activeCount: active, disconnectedCount: disconnected, handRaisedCount: handRaised };
  }, [students]);

  const total = students.length;
  const hasTeams = teams.length > 0;
  const progressPct = total > 0 ? Math.round((respondedCount / total) * 100) : 0;

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

      {/* ── STATS BAR ── */}
      <div className="flex items-center gap-2">
        {/* Big progress circle */}
        <div className="relative w-12 h-12 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
            <motion.circle
              cx="18" cy="18" r="15" fill="none" stroke="#4ECDC4" strokeWidth="3"
              strokeDasharray={`${progressPct * 0.94} 100`}
              strokeLinecap="round"
              initial={{ strokeDasharray: "0 100" }}
              animate={{ strokeDasharray: `${progressPct * 0.94} 100` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-bw-teal tabular-nums">
            {progressPct}%
          </span>
        </div>

        {/* Stat chips */}
        <div className="flex flex-wrap gap-1.5 flex-1">
          <StatChip color="#4ECDC4" label="Répondu" count={respondedCount} />
          <StatChip color="#FF6B35" label="En cours" count={activeCount} />
          {stuckCount > 0 && <StatChip color="#F59E0B" label="Bloqué" count={stuckCount} pulse />}
          {handRaisedCount > 0 && <StatChip color="#F59E0B" label="✋ Main" count={handRaisedCount} pulse />}
          {disconnectedCount > 0 && <StatChip color="#666" label="Hors ligne" count={disconnectedCount} />}
        </div>

        {/* Counter */}
        <div className="text-right flex-shrink-0">
          <span className="text-lg font-bold text-bw-teal tabular-nums">{respondedCount}</span>
          <span className="text-sm text-bw-muted">/{total}</span>
        </div>
      </div>

      {/* ── CLASSROOM FLOOR PLAN ── */}
      <div className="relative rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)" }}>

        {/* Perspective grid background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

        <div className="relative p-4 sm:p-5 space-y-4">

          {/* Teacher's desk — "tableau" */}
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl border"
              style={{
                background: "linear-gradient(135deg, rgba(255,107,53,0.08), rgba(139,92,246,0.05))",
                borderColor: "rgba(255,107,53,0.20)",
              }}
            >
              <span className="text-base">🎓</span>
              <span className="text-[11px] font-bold text-bw-primary uppercase tracking-widest">Tableau</span>
              <div className="w-px h-4 bg-white/10 mx-1" />
              <span className="text-[10px] text-bw-muted tabular-nums">{respondedCount}/{total}</span>
            </motion.div>
          </div>

          {/* Allée centrale marker */}
          <div className="flex items-center gap-3 px-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
          </div>

          {/* Desk rows */}
          <div className="space-y-4">
            {deskRows.map((group, gi) => (
              <motion.div
                key={group.teamId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.05 }}
                className="space-y-2"
              >
                {/* Team label */}
                {group.teamName && (
                  <div className="flex items-center gap-2 px-1">
                    {group.teamColor && group.teamColor !== "#666" && (
                      <div className="w-2 h-2 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: group.teamColor, boxShadow: `0 0 6px ${group.teamColor}40` }} />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: group.teamColor || undefined }}>
                      {group.teamName}
                    </span>
                    <div className="flex-1 h-px" style={{ background: group.teamColor ? `linear-gradient(90deg, ${group.teamColor}25, transparent)` : "rgba(255,255,255,0.04)" }} />
                    <span className="text-[9px] text-bw-muted tabular-nums">
                      {group.pairs.reduce((n, [l, r]) => n + (l.state === "responded" ? 1 : 0) + (r?.state === "responded" ? 1 : 0), 0)}/
                      {group.pairs.reduce((n, [, r]) => n + 1 + (r ? 1 : 0), 0)}
                    </span>
                  </div>
                )}

                {/* Rows of desks — 3 per row */}
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
              <span className="text-3xl">🪑</span>
              <p className="text-sm">Aucun élève connecté</p>
            </div>
          )}

          {/* All responded celebration */}
          {total > 0 && respondedCount === total && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-bw-teal/10 border border-bw-teal/20">
                <span className="text-sm">🎉</span>
                <span className="text-xs font-semibold text-bw-teal">Tout le monde a répondu !</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── LEGEND ── */}
      <div className="flex items-center justify-center gap-4 text-[10px] text-bw-muted">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: "#4ECDC4" }} /> Répondu</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: "#FF6B35" }} /> En cours</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: "#F59E0B" }} /> Bloqué</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: "#444" }} /> Hors ligne</span>
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

/** Small stat chip */
function StatChip({ color, label, count, pulse }: { color: string; label: string; count: number; pulse?: boolean }) {
  return (
    <motion.span
      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border"
      style={{ borderColor: `${color}25`, background: `${color}08`, color }}
      animate={pulse ? { opacity: [1, 0.7, 1] } : undefined}
      transition={pulse ? { repeat: Infinity, duration: 1.5 } : undefined}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {label} <span className="font-bold tabular-nums">{count}</span>
    </motion.span>
  );
}
