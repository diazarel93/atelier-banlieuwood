"use client";

import { useMemo, useState, useCallback } from "react";
import { AnimatePresence } from "motion/react";
import type { StudentState } from "./pulse-ring";
import { SeatCard, type SeatStudent } from "./seat-card";
import { TableGroup } from "./table-group";
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

  // Build a map: studentId → latest response text
  const responseMap = useMemo(() => {
    const map = new Map<string, string>();
    // Sort by submitted_at to get latest first (responses come sorted already, but just in case)
    for (const r of responses) {
      if (!r.is_hidden && !r.reset_at && !map.has(r.student_id)) {
        map.set(r.student_id, r.text);
      }
    }
    return map;
  }, [responses]);

  // Build a map: studentId → response id (for nudge which needs responseId)
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

  // Sort students for flat grid
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
          <div
            className="h-full bg-bw-teal transition-all duration-500"
            style={{ width: `${(respondedCount / Math.max(total, 1)) * 100}%` }}
          />
        )}
        {activeCount > 0 && (
          <div
            className="h-full bg-bw-primary transition-all duration-500"
            style={{ width: `${(activeCount / Math.max(total, 1)) * 100}%` }}
          />
        )}
        {stuckCount > 0 && (
          <div
            className="h-full bg-bw-amber transition-all duration-500"
            style={{ width: `${(stuckCount / Math.max(total, 1)) * 100}%` }}
          />
        )}
      </div>

      {/* Map content */}
      {hasTeams ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {teams.map((team) => {
            const teamStudentIds = new Set(team.students.map((s) => s.id));
            const teamStudents = sortedStudents.filter((s) => teamStudentIds.has(s.id));
            if (teamStudents.length === 0) return null;
            return (
              <TableGroup
                key={team.id}
                team={team}
                students={teamStudents}
                responseMap={responseMap}
                onStudentClick={handleStudentClick}
              />
            );
          })}

          {/* Unassigned students */}
          {(() => {
            const allTeamIds = new Set(teams.flatMap((t) => t.students.map((s) => s.id)));
            const unassigned = sortedStudents.filter((s) => !allTeamIds.has(s.id));
            if (unassigned.length === 0) return null;
            return (
              <div className="glass-card p-3 space-y-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-bw-muted">Non assignés</span>
                  <span className="text-[10px] text-bw-muted ml-auto tabular-nums">{unassigned.length}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                  {unassigned.map((s) => (
                    <SeatCard
                      key={s.id}
                      student={s}
                      lastResponse={responseMap.get(s.id) || null}
                      onClick={() => handleStudentClick(s.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      ) : (
        /* Flat grid when no teams */
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-1">
          {sortedStudents.map((s) => (
            <SeatCard
              key={s.id}
              student={s}
              lastResponse={responseMap.get(s.id) || null}
              onClick={() => handleStudentClick(s.id)}
            />
          ))}
        </div>
      )}

      {/* No students */}
      {total === 0 && (
        <div className="text-center py-12 text-bw-muted">
          <p className="text-sm">Aucun élève connecté</p>
        </div>
      )}

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
