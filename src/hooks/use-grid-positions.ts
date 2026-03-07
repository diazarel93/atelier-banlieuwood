"use client";

import { useState, useCallback, useMemo } from "react";

export interface GridPosition {
  row: number;
  col: number;
}

export type GridPositions = Record<string, GridPosition>;

const STORAGE_KEY_PREFIX = "bw-free-grid-";
const DEFAULT_COLS = 8;
const DEFAULT_ROWS = 6;

function loadFromStorage(sessionId: string): GridPositions {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${sessionId}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveToStorage(sessionId: string, positions: GridPositions) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${sessionId}`, JSON.stringify(positions));
  } catch {
    // storage full — silently ignore
  }
}

export function useGridPositions(sessionId: string, cols = DEFAULT_COLS, rows = DEFAULT_ROWS) {
  const [positions, setPositions] = useState<GridPositions>(() => loadFromStorage(sessionId));

  const persist = useCallback((next: GridPositions) => {
    setPositions(next);
    saveToStorage(sessionId, next);
  }, [sessionId]);

  /** Inverse map: "row-col" → studentId */
  const cellToStudent = useMemo(() => {
    const m = new Map<string, string>();
    for (const [studentId, pos] of Object.entries(positions)) {
      m.set(`${pos.row}-${pos.col}`, studentId);
    }
    return m;
  }, [positions]);

  const placeStudent = useCallback((studentId: string, row: number, col: number) => {
    setPositions(prev => {
      const next = { ...prev, [studentId]: { row, col } };
      saveToStorage(sessionId, next);
      return next;
    });
  }, [sessionId]);

  const removeStudent = useCallback((studentId: string) => {
    setPositions(prev => {
      const next = { ...prev };
      delete next[studentId];
      saveToStorage(sessionId, next);
      return next;
    });
  }, [sessionId]);

  const moveStudent = useCallback((studentId: string, row: number, col: number) => {
    placeStudent(studentId, row, col);
  }, [placeStudent]);

  const swapStudents = useCallback((studentA: string, studentB: string) => {
    setPositions(prev => {
      const posA = prev[studentA];
      const posB = prev[studentB];
      if (!posA || !posB) return prev;
      const next = { ...prev, [studentA]: posB, [studentB]: posA };
      saveToStorage(sessionId, next);
      return next;
    });
  }, [sessionId]);

  const clearAll = useCallback(() => {
    persist({});
  }, [persist]);

  /** Auto-place unplaced students left-to-right, top-to-bottom, skipping occupied cells */
  const autoPlace = useCallback((studentIds: string[]) => {
    setPositions(prev => {
      const next = { ...prev };
      const occupied = new Set(
        Object.values(next).map(p => `${p.row}-${p.col}`)
      );
      const unplaced = studentIds.filter(id => !next[id]);
      let idx = 0;
      for (let r = 0; r < rows && idx < unplaced.length; r++) {
        for (let c = 0; c < cols && idx < unplaced.length; c++) {
          const key = `${r}-${c}`;
          if (!occupied.has(key)) {
            next[unplaced[idx]] = { row: r, col: c };
            occupied.add(key);
            idx++;
          }
        }
      }
      saveToStorage(sessionId, next);
      return next;
    });
  }, [sessionId, cols, rows]);

  return {
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
  };
}
