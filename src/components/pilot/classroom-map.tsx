"use client";

import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { StudentState as _StudentState } from "./pulse-ring";
import type { SeatStudent } from "./seat-card";
import { DeskPair, type DeskSize } from "./desk-pair";
import { STATE_STYLE } from "./state-styles";
import { FreeGridEditor } from "./free-grid-editor";

export type ClassroomLayout = "rows" | "u-shape" | "islands" | "free";

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
  layout?: ClassroomLayout;
  desksPerRow?: number;
  deskSize?: DeskSize;
  sessionId?: string;
}

function toPairs<T>(arr: T[]): [T, T | undefined][] {
  const pairs: [T, T | undefined][] = [];
  for (let i = 0; i < arr.length; i += 2) {
    pairs.push([arr[i], arr[i + 1]]);
  }
  return pairs;
}

/** Sort priority: hand raised > stuck > active > responded > disconnected */
function studentSortKey(s: SeatStudent): number {
  if (s.hand_raised_at) return -1;
  if (s.state === "stuck") return 0;
  if (s.state === "active") return 1;
  if (s.state === "responded") return 2;
  return 3; // disconnected
}

/** Free-layout individual student chip */
function FreeStudentChip({
  student,
  response,
  onClick,
}: {
  student: SeatStudent;
  response: string | null;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const s = STATE_STYLE[student.state] || STATE_STYLE.disconnected;
  const stateLabel =
    student.state === "responded"
      ? "a repondu"
      : student.state === "stuck"
        ? "bloque"
        : student.state === "active"
          ? "en reflexion"
          : "absent";

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`${student.display_name} — ${stateLabel}${student.hand_raised_at ? ", main levee" : ""}`}
      className="relative flex flex-col items-center gap-1 p-2.5 rounded-[12px] cursor-pointer transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#6B8CFF]"
      style={{
        background: s.bg,
        border: `1.5px solid ${s.border}`,
        opacity: student.state === "disconnected" ? 0.4 : 1,
        boxShadow: student.state === "stuck" ? `0 0 8px ${s.dot}30` : "0 1px 3px rgba(61,43,16,0.04)",
      }}
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.03 }}
    >
      <div className="relative">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-base"
          style={{ background: "#FFFFFF", border: `2px solid ${s.dot}` }}
        >
          {student.avatar}
        </div>
        {student.hand_raised_at && (
          <motion.span
            animate={{ y: [0, -2, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="absolute -top-1 -right-1 text-[10px]"
          >
            ✋
          </motion.span>
        )}
        {student.state === "responded" && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
            style={{ background: "#4CAF50", boxShadow: "0 1px 3px rgba(76,175,80,0.4)" }}
          >
            <svg
              width="8"
              height="8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
            >
              <path d="M5 12l5 5L20 7" />
            </svg>
          </motion.span>
        )}
        {student.state === "stuck" && (
          <motion.span
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black text-white"
            style={{ background: "#EB5757" }}
          >
            !
          </motion.span>
        )}
      </div>
      <span className="text-[11px] font-semibold truncate max-w-[56px] leading-tight" style={{ color: s.text }}>
        {student.display_name.split(" ")[0]}
      </span>

      {/* Tooltip */}
      <AnimatePresence>
        {hovered && response && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute z-30 bottom-full mb-2 left-1/2 -translate-x-1/2 w-[200px] rounded-[12px] p-3 pointer-events-none"
            style={{ background: "#FFFFFF", border: "1px solid #2a2a50", boxShadow: "0 8px 24px rgba(61,43,16,0.12)" }}
          >
            <p className="text-[12px] text-[#5B5B5B] leading-snug line-clamp-3">{response}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export function ClassroomMap({
  students,
  teams,
  responses,
  moduleResponseTexts,
  sessionStatus: _sessionStatus,
  onNudge: _onNudge,
  onWarn: _onWarn,
  onBroadcast: _onBroadcast,
  onNudgeAllStuck: _onNudgeAllStuck,
  onStudentClick,
  layout = "rows",
  desksPerRow = 3,
  deskSize = "md",
  sessionId,
}: ClassroomMapProps) {
  // Build merged response map
  const { responseMap } = useMemo(() => {
    const rMap = new Map<string, string>();
    for (const r of responses) {
      if (!r.is_hidden && !r.reset_at && !rMap.has(r.student_id)) {
        rMap.set(r.student_id, r.text);
      }
    }
    if (moduleResponseTexts) {
      for (const [studentId, text] of moduleResponseTexts) {
        if (!rMap.has(studentId)) rMap.set(studentId, text);
      }
    }
    return { responseMap: rMap };
  }, [responses, moduleResponseTexts]);

  // Stats
  const { respondedCount, disconnectedCount } = useMemo(() => {
    let responded = 0,
      disconnected = 0;
    for (const s of students) {
      if (s.state === "responded") responded++;
      else if (s.state === "disconnected") disconnected++;
    }
    return { respondedCount: responded, disconnectedCount: disconnected };
  }, [students]);

  const total = students.length;
  const onlineTotal = total - disconnectedCount;
  const hasTeams = teams.length > 0;

  // Sort: hand raised first, then stuck, active, responded, disconnected
  const sortedStudents = useMemo(() => [...students].sort((a, b) => studentSortKey(a) - studentSortKey(b)), [students]);

  const handleStudentClick = useCallback(
    (studentId: string) => {
      if (onStudentClick) onStudentClick(studentId);
    },
    [onStudentClick],
  );

  // Build desk rows (pairs grouped by team)
  const deskRows = useMemo(() => {
    if (hasTeams) {
      const rows: {
        teamId: string;
        teamName: string;
        teamColor: string;
        pairs: [SeatStudent, SeatStudent | undefined][];
      }[] = [];
      for (const team of teams) {
        const idSet = new Set(team.students.map((s) => s.id));
        const members = sortedStudents.filter((s) => idSet.has(s.id));
        if (members.length === 0) continue;
        rows.push({ teamId: team.id, teamName: team.team_name, teamColor: team.team_color, pairs: toPairs(members) });
      }
      const allIds = new Set(teams.flatMap((t) => t.students.map((s) => s.id)));
      const unassigned = sortedStudents.filter((s) => !allIds.has(s.id));
      if (unassigned.length > 0) {
        rows.push({
          teamId: "__unassigned__",
          teamName: "Non assignes",
          teamColor: "#B0A99E",
          pairs: toPairs(unassigned),
        });
      }
      return rows;
    }
    return [{ teamId: "__all__", teamName: "", teamColor: "", pairs: toPairs(sortedStudents) }];
  }, [hasTeams, teams, sortedStudents]);

  // Flat pairs list for U-shape / islands layouts
  const allPairs = useMemo(() => deskRows.flatMap((g) => g.pairs), [deskRows]);

  // ── LAYOUT RENDERERS ──

  function renderRowsLayout(pairs: [SeatStudent, SeatStudent | undefined][], teamColor?: string) {
    const rows: [SeatStudent, SeatStudent | undefined][][] = [];
    for (let i = 0; i < pairs.length; i += desksPerRow) {
      rows.push(pairs.slice(i, i + desksPerRow));
    }
    const hasAisle = desksPerRow >= 4;
    const aisleAt = Math.ceil(desksPerRow / 2);

    return rows.map((row, rowIdx) => (
      <div key={rowIdx} className="flex items-center gap-1.5 sm:gap-2">
        {/* Row number */}
        <span className="w-5 text-[10px] font-bold text-[#C4BDB2] text-right flex-shrink-0 tabular-nums select-none">
          R{rowIdx + 1}
        </span>
        <div className="flex justify-center items-start gap-1.5 sm:gap-2 flex-1">
          {hasAisle ? (
            <>
              {row.slice(0, aisleAt).map(([left, right], deskIdx) => (
                <DeskPair
                  key={`${left.id}-${deskIdx}`}
                  left={left}
                  right={right}
                  responseMap={responseMap}
                  onStudentClick={handleStudentClick}
                  teamColor={teamColor || undefined}
                  size={deskSize}
                />
              ))}
              {row.length > aisleAt && (
                <div className="w-4 sm:w-6 flex-shrink-0 self-stretch flex items-center justify-center">
                  <div
                    className="w-px h-full"
                    style={{
                      background: "linear-gradient(to bottom, transparent, #D9CFC0 20%, #D9CFC0 80%, transparent)",
                    }}
                  />
                </div>
              )}
              {row.slice(aisleAt).map(([left, right], deskIdx) => (
                <DeskPair
                  key={`${left.id}-r-${deskIdx}`}
                  left={left}
                  right={right}
                  responseMap={responseMap}
                  onStudentClick={handleStudentClick}
                  teamColor={teamColor || undefined}
                  size={deskSize}
                />
              ))}
            </>
          ) : (
            row.map(([left, right], deskIdx) => (
              <DeskPair
                key={`${left.id}-${deskIdx}`}
                left={left}
                right={right}
                responseMap={responseMap}
                onStudentClick={handleStudentClick}
                teamColor={teamColor || undefined}
                size={deskSize}
              />
            ))
          )}
        </div>
      </div>
    ));
  }

  function renderUShape() {
    const n = allPairs.length;
    const leftCount = Math.floor(n / 3);
    const rightCount = Math.floor(n / 3);
    const bottomCount = n - leftCount - rightCount;
    const leftPairs = allPairs.slice(0, leftCount);
    const bottomPairs = allPairs.slice(leftCount, leftCount + bottomCount);
    const rightPairs = allPairs.slice(leftCount + bottomCount);

    return (
      <div className="space-y-3">
        {/* U sides: left + center open area + right */}
        <div className="flex justify-between gap-3">
          <div className="flex flex-col gap-2">
            {leftPairs.map(([left, right], i) => (
              <DeskPair
                key={`l-${left.id}-${i}`}
                left={left}
                right={right}
                responseMap={responseMap}
                onStudentClick={handleStudentClick}
                size={deskSize}
              />
            ))}
          </div>
          {/* Center: teacher area marker */}
          <div className="flex-1 min-w-[60px] flex items-center justify-center">
            <div className="px-3 py-1 rounded-[8px]" style={{ background: "#2a2a50", border: "1px dashed #D9CFC0" }}>
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#B0A99E]">Prof</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {rightPairs.map(([left, right], i) => (
              <DeskPair
                key={`r-${left.id}-${i}`}
                left={left}
                right={right}
                responseMap={responseMap}
                onStudentClick={handleStudentClick}
                size={deskSize}
              />
            ))}
          </div>
        </div>
        {/* Bottom row — closing the U */}
        {bottomPairs.length > 0 && (
          <div className="flex justify-center gap-2 sm:gap-3 flex-wrap">
            {bottomPairs.map(([left, right], i) => (
              <DeskPair
                key={`b-${left.id}-${i}`}
                left={left}
                right={right}
                responseMap={responseMap}
                onStudentClick={handleStudentClick}
                size={deskSize}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderIslands() {
    const islands: [SeatStudent, SeatStudent | undefined][][] = [];
    for (let i = 0; i < allPairs.length; i += 2) {
      islands.push(allPairs.slice(i, i + 2));
    }
    return (
      <div className="flex flex-wrap justify-center gap-5">
        {islands.map((island, idx) => (
          <div
            key={idx}
            className="flex flex-col gap-1.5 p-2.5 rounded-[16px]"
            style={{ background: "#1a1a35", border: "1px solid #2a2a50", boxShadow: "0 1px 4px rgba(61,43,16,0.04)" }}
          >
            {island.map(([left, right], pairIdx) => (
              <div key={`is-${left.id}-${pairIdx}`} style={pairIdx === 1 ? { transform: "scaleY(-1)" } : undefined}>
                <div style={pairIdx === 1 ? { transform: "scaleY(-1)" } : undefined}>
                  <DeskPair
                    left={left}
                    right={right}
                    responseMap={responseMap}
                    onStudentClick={handleStudentClick}
                    size={deskSize}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  function renderFreeLayout() {
    if (sessionId) {
      return (
        <FreeGridEditor
          sessionId={sessionId}
          students={students}
          responseMap={responseMap}
          onStudentClick={handleStudentClick}
        />
      );
    }
    // Fallback: adaptive grid (no sessionId = no persistence)
    const count = sortedStudents.length;
    const cols = Math.min(Math.max(Math.ceil(Math.sqrt(count)), 3), 6);
    return (
      <div
        className="grid gap-2 justify-items-center"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {sortedStudents.map((student) => (
          <FreeStudentChip
            key={student.id}
            student={student}
            response={responseMap.get(student.id) || null}
            onClick={() => handleStudentClick(student.id)}
          />
        ))}
      </div>
    );
  }

  // ── Auto-scale: shrink content to fit container width ──
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    function measure() {
      const cw = container!.clientWidth;
      const sw = content!.scrollWidth;
      setFitScale(sw > cw ? Math.max(cw / sw, 0.6) : 1);
    }

    measure();
    // Re-measure on resize
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [layout, students.length, desksPerRow]);

  return (
    <div className="space-y-2" role="region" aria-label="Plan de classe">
      {/* ── CLASSROOM FLOOR PLAN ── */}
      <div
        ref={containerRef}
        className="relative overflow-hidden"
        style={{
          borderRadius: 16,
          background: "#FAF6EE",
          border: "1px solid #2a2a50",
          boxShadow: "0 2px 8px rgba(61,43,16,0.04), inset 0 1px 2px rgba(61,43,16,0.02)",
        }}
      >
        <div
          ref={contentRef}
          className="relative p-3 sm:p-4 space-y-2"
          style={{
            transform: fitScale < 1 ? `scale(${fitScale})` : undefined,
            transformOrigin: "top center",
            height: fitScale < 1 ? `calc(100% * ${fitScale})` : undefined,
          }}
        >
          {/* Teacher's desk / Tableau */}
          <div className="flex justify-center">
            <div
              className="flex items-center gap-2 px-5 py-1.5"
              style={{
                borderRadius: 10,
                background: "#FFFFFF",
                border: "1px solid #2a2a50",
                boxShadow: "0 1px 3px rgba(61,43,16,0.04)",
              }}
            >
              <span className="text-[11px] font-bold text-[#B0A99E] uppercase tracking-widest">Tableau</span>
            </div>
          </div>

          {/* Separator */}
          <div
            className="h-px"
            style={{ background: "linear-gradient(to right, transparent, #2a2a50, transparent)" }}
          />

          {/* Desk layout — animated layout transitions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={layout}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              {layout === "u-shape"
                ? renderUShape()
                : layout === "islands"
                  ? renderIslands()
                  : layout === "free"
                    ? renderFreeLayout()
                    : /* rows */ deskRows.map((group, gi) => (
                        <motion.div
                          key={group.teamId}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: gi * 0.04 }}
                          className="space-y-1"
                        >
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
                              <div className="flex-1 h-px" style={{ background: "#2a2a50" }} />
                              <span className="text-[12px] text-[#B0A99E] tabular-nums font-medium">
                                {group.pairs.reduce(
                                  (n, [l, r]) =>
                                    n + (l.state === "responded" ? 1 : 0) + (r?.state === "responded" ? 1 : 0),
                                  0,
                                )}
                                /{group.pairs.reduce((n, [, r]) => n + 1 + (r ? 1 : 0), 0)}
                              </span>
                            </div>
                          )}
                          {renderRowsLayout(group.pairs, group.teamColor)}
                        </motion.div>
                      ))}
            </motion.div>
          </AnimatePresence>

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
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4CAF50"
                  strokeWidth="3"
                  strokeLinecap="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span className="text-[12px] font-semibold" style={{ color: "#2E7D32" }}>
                  Tout le monde a repondu
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div
        className="flex items-center justify-center gap-4 text-[11px] text-[#B0A99E]"
        role="list"
        aria-label="Legende des etats"
      >
        <span className="flex items-center gap-1.5" role="listitem">
          <span className="w-2 h-2 rounded-full" style={{ background: "#4CAF50" }} /> Repondu
        </span>
        <span className="flex items-center gap-1.5" role="listitem">
          <span className="w-2 h-2 rounded-full" style={{ background: "#F2C94C" }} /> En cours
        </span>
        <span className="flex items-center gap-1.5" role="listitem">
          <span className="w-2 h-2 rounded-full" style={{ background: "#EB5757" }} /> Bloque
        </span>
        <span className="flex items-center gap-1.5" role="listitem">
          <span className="w-2 h-2 rounded-full" style={{ background: "#C4BDB2" }} /> Hors ligne
        </span>
      </div>
    </div>
  );
}
