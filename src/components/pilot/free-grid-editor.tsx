"use client";

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { SeatStudent } from "./seat-card";
import { STATE_STYLE } from "./state-styles";
import { useGridPositions } from "@/hooks/use-grid-positions";

interface FreeGridEditorProps {
  sessionId: string;
  students: SeatStudent[];
  responseMap: Map<string, string>;
  onStudentClick?: (studentId: string) => void;
}

const MIN_CELL = 56;
const MAX_CELL = 80;

// ── Draggable chip placed on the grid ──
function DraggableFreeChip({
  student,
  cellSize,
  row,
  col,
  responseMap,
  onDragEnd,
  onRemove,
  onClick,
}: {
  student: SeatStudent;
  cellSize: number;
  row: number;
  col: number;
  responseMap: Map<string, string>;
  onDragEnd: (studentId: string, info: { point: { x: number; y: number } }, offset: { x: number; y: number }) => void;
  onRemove: (studentId: string) => void;
  onClick: (studentId: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const s = STATE_STYLE[student.state] || STATE_STYLE.disconnected;
  const response = responseMap.get(student.id) || null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      onDragEnd={(_e, info) => onDragEnd(student.id, info, info.offset)}
      onClick={(e) => {
        // Only fire click if no drag happened
        e.stopPropagation();
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="absolute z-10 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing select-none"
      style={{
        width: cellSize - 4,
        height: cellSize - 4,
        left: col * cellSize + 2,
        top: row * cellSize + 2,
        background: s.bg,
        border: `1.5px solid ${s.border}`,
        borderRadius: 12,
        opacity: student.state === "disconnected" ? 0.4 : 1,
        boxShadow: student.state === "stuck" ? `0 0 8px ${s.dot}30` : "0 1px 3px rgba(61,43,16,0.04)",
      }}
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.03, zIndex: 20 }}
      layout
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {/* Remove button */}
      <AnimatePresence>
        {hovered && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(student.id);
            }}
            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white z-30"
            style={{ background: "#EB5757" }}
            aria-label={`Retirer ${student.display_name}`}
          >
            ✕
          </motion.button>
        )}
      </AnimatePresence>

      <div
        className="relative"
        onClick={(e) => {
          e.stopPropagation();
          onClick(student.id);
        }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
          style={{ background: "#FFFFFF", border: `2px solid ${s.dot}` }}
        >
          {student.avatar}
        </div>
        {student.hand_raised_at && (
          <motion.span
            animate={{ y: [0, -2, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="absolute -top-1 -right-1 text-[9px]"
          >
            ✋
          </motion.span>
        )}
        {student.state === "responded" && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center"
            style={{ background: "#4CAF50", boxShadow: "0 1px 3px rgba(76,175,80,0.4)" }}
          >
            <svg
              width="7"
              height="7"
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
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center text-[7px] font-black text-white"
            style={{ background: "#EB5757" }}
          >
            !
          </motion.span>
        )}
      </div>
      <span
        className="text-[10px] font-semibold truncate leading-tight"
        style={{ color: s.text, maxWidth: cellSize - 12 }}
      >
        {student.display_name.split(" ")[0]}
      </span>

      {/* Tooltip */}
      <AnimatePresence>
        {hovered && response && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute z-40 bottom-full mb-2 left-1/2 -translate-x-1/2 w-[180px] rounded-[10px] p-2.5 pointer-events-none"
            style={{ background: "#FFFFFF", border: "1px solid #2a2a50", boxShadow: "0 8px 24px rgba(61,43,16,0.12)" }}
          >
            <p className="text-[11px] text-[#5B5B5B] leading-snug line-clamp-3">{response}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Tray chip (unplaced student) ──
function TrayChip({ student, selected, onClick }: { student: SeatStudent; selected: boolean; onClick: () => void }) {
  const s = STATE_STYLE[student.state] || STATE_STYLE.disconnected;
  return (
    <motion.button
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 p-1.5 rounded-[10px] cursor-pointer transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#6B8CFF]"
      style={{
        background: selected ? "#E8F0FF" : s.bg,
        border: selected ? "2px solid #6B8CFF" : `1.5px solid ${s.border}`,
        opacity: student.state === "disconnected" ? 0.4 : 1,
      }}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
    >
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
        style={{ background: "#FFFFFF", border: `2px solid ${selected ? "#6B8CFF" : s.dot}` }}
      >
        {student.avatar}
      </div>
      <span className="text-[9px] font-semibold truncate max-w-[48px] leading-tight" style={{ color: s.text }}>
        {student.display_name.split(" ")[0]}
      </span>
    </motion.button>
  );
}

// ── Main component ──
export function FreeGridEditor({ sessionId, students, responseMap, onStudentClick }: FreeGridEditorProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [selectedTrayStudent, setSelectedTrayStudent] = useState<string | null>(null);

  const {
    positions,
    cellToStudent,
    placeStudent,
    removeStudent,
    moveStudent,
    swapStudents,
    clearAll,
    autoPlace,
    cols,
    rows,
  } = useGridPositions(sessionId);

  // Measure container width
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const cellSize = useMemo(() => {
    if (containerWidth === 0) return MAX_CELL;
    return Math.max(MIN_CELL, Math.min(MAX_CELL, Math.floor(containerWidth / cols)));
  }, [containerWidth, cols]);

  const gridWidth = cellSize * cols;
  const gridHeight = cellSize * rows;

  // Student lookup
  const studentMap = useMemo(() => {
    const m = new Map<string, SeatStudent>();
    for (const s of students) m.set(s.id, s);
    return m;
  }, [students]);

  // Placed vs unplaced
  const placedStudentIds = useMemo(() => {
    // Only keep ids that are still in the students list
    const validIds = new Set(students.map((s) => s.id));
    return Object.keys(positions).filter((id) => validIds.has(id));
  }, [positions, students]);

  const unplacedStudents = useMemo(() => students.filter((s) => !positions[s.id]), [students, positions]);

  // Handle clicking an empty cell
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (selectedTrayStudent) {
        placeStudent(selectedTrayStudent, row, col);
        setSelectedTrayStudent(null);
      }
    },
    [selectedTrayStudent, placeStudent],
  );

  // Handle drag end — snap to nearest cell, swap if occupied, remove if out
  const handleDragEnd = useCallback(
    (studentId: string, info: { point: { x: number; y: number } }, offset: { x: number; y: number }) => {
      // Check if it was just a click (minimal movement)
      if (Math.abs(offset.x) + Math.abs(offset.y) < 4) {
        if (onStudentClick) onStudentClick(studentId);
        return;
      }

      if (!gridRef.current) return;
      const rect = gridRef.current.getBoundingClientRect();
      const relX = info.point.x - rect.left;
      const relY = info.point.y - rect.top;

      // Out of grid bounds → remove
      if (relX < 0 || relY < 0 || relX >= gridWidth || relY >= gridHeight) {
        removeStudent(studentId);
        return;
      }

      const targetCol = Math.min(cols - 1, Math.max(0, Math.floor(relX / cellSize)));
      const targetRow = Math.min(rows - 1, Math.max(0, Math.floor(relY / cellSize)));

      const occupant = cellToStudent.get(`${targetRow}-${targetCol}`);
      if (occupant && occupant !== studentId) {
        // Swap
        swapStudents(studentId, occupant);
      } else {
        // Move to empty cell
        moveStudent(studentId, targetRow, targetCol);
      }
    },
    [
      gridRef,
      gridWidth,
      gridHeight,
      cols,
      rows,
      cellSize,
      cellToStudent,
      removeStudent,
      moveStudent,
      swapStudents,
      onStudentClick,
    ],
  );

  const handleAutoPlace = useCallback(() => {
    autoPlace(students.map((s) => s.id));
  }, [autoPlace, students]);

  const handleStudentClick = useCallback(
    (studentId: string) => {
      if (onStudentClick) onStudentClick(studentId);
    },
    [onStudentClick],
  );

  return (
    <div ref={containerRef} className="space-y-3">
      {/* Grid area */}
      <div className="flex justify-center overflow-hidden">
        <div ref={gridRef} className="relative" style={{ width: gridWidth, height: gridHeight }}>
          {/* Background grid cells */}
          {Array.from({ length: rows }, (_, r) =>
            Array.from({ length: cols }, (_, c) => {
              const key = `${r}-${c}`;
              const isOccupied = cellToStudent.has(key);
              const isHighlighted = selectedTrayStudent !== null && !isOccupied;
              return (
                <div
                  key={key}
                  onClick={() => !isOccupied && handleCellClick(r, c)}
                  className="absolute transition-colors"
                  style={{
                    width: cellSize - 2,
                    height: cellSize - 2,
                    left: c * cellSize + 1,
                    top: r * cellSize + 1,
                    borderRadius: 10,
                    border: isHighlighted ? "1.5px dashed #6B8CFF" : isOccupied ? "none" : "1px dashed #E0D8CC",
                    background: isHighlighted ? "#F0F4FF" : "transparent",
                    cursor: isHighlighted ? "pointer" : "default",
                  }}
                />
              );
            }),
          )}

          {/* Placed students */}
          <AnimatePresence>
            {placedStudentIds.map((id) => {
              const student = studentMap.get(id);
              const pos = positions[id];
              if (!student || !pos) return null;
              return (
                <DraggableFreeChip
                  key={id}
                  student={student}
                  cellSize={cellSize}
                  row={pos.row}
                  col={pos.col}
                  responseMap={responseMap}
                  onDragEnd={handleDragEnd}
                  onRemove={removeStudent}
                  onClick={handleStudentClick}
                />
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Unplaced tray */}
      {(unplacedStudents.length > 0 || placedStudentIds.length > 0) && (
        <div className="rounded-[12px] p-3 space-y-2" style={{ background: "#1a1a35", border: "1px solid #2a2a50" }}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#B0A99E] uppercase tracking-wider">
              {unplacedStudents.length > 0 ? `Non places (${unplacedStudents.length})` : "Tous places"}
            </span>
            <div className="flex gap-2">
              {unplacedStudents.length > 0 && (
                <button
                  onClick={handleAutoPlace}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-[8px] transition-colors cursor-pointer"
                  style={{ background: "#6B8CFF", color: "#FFFFFF" }}
                >
                  Placer tous
                </button>
              )}
              {placedStudentIds.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-[8px] transition-colors cursor-pointer"
                  style={{ background: "#FFFFFF", color: "#7A7A7A", border: "1px solid #2a2a50" }}
                >
                  Tout retirer
                </button>
              )}
            </div>
          </div>

          {unplacedStudents.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {unplacedStudents.map((student) => (
                <TrayChip
                  key={student.id}
                  student={student}
                  selected={selectedTrayStudent === student.id}
                  onClick={() => setSelectedTrayStudent(selectedTrayStudent === student.id ? null : student.id)}
                />
              ))}
            </div>
          )}

          {selectedTrayStudent && (
            <p className="text-[10px] text-[#6B8CFF] font-medium">
              Cliquez sur une case vide pour placer {studentMap.get(selectedTrayStudent)?.display_name.split(" ")[0]}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
