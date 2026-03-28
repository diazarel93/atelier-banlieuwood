"use client";

import { memo, useMemo } from "react";
import { motion } from "motion/react";

// ═══════════════════════════════════════════════════════════════
// COMPREHENSION HEATMAP — Visual grid of student understanding
// Rows = students, Columns = situations/questions
// ═══════════════════════════════════════════════════════════════

interface HeatmapStudent {
  id: string;
  display_name: string;
  avatar: string;
}

interface HeatmapResponse {
  student_id: string;
  situation_index: number;
  score?: number | null; // 0-5
  has_response: boolean;
  was_retained: boolean;
}

interface ComprehensionHeatmapProps {
  students: HeatmapStudent[];
  responses: HeatmapResponse[];
  totalSituations: number;
  currentSituation: number;
}

function getHeatColor(score: number | null | undefined, hasResponse: boolean): string {
  if (!hasResponse) return "rgba(0,0,0,0.02)"; // no response
  if (score === null || score === undefined) return "rgba(78,205,196,0.15)"; // responded but no score
  if (score >= 4) return "rgba(16,185,129,0.5)"; // green — excellent
  if (score >= 3) return "rgba(78,205,196,0.4)"; // teal — good
  if (score >= 2) return "rgba(245,158,11,0.35)"; // amber — okay
  return "rgba(239,68,68,0.35)"; // red — needs help
}

function ComprehensionHeatmapInner({
  students,
  responses,
  totalSituations,
  currentSituation,
}: ComprehensionHeatmapProps) {
  const responseMap = useMemo(() => {
    const map = new Map<string, HeatmapResponse>();
    for (const r of responses) {
      map.set(`${r.student_id}-${r.situation_index}`, r);
    }
    return map;
  }, [responses]);

  const situations = Array.from({ length: totalSituations }, (_, i) => i);

  if (students.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-xs text-bw-muted">Pas de donnees pour la heatmap</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-black/[0.04] overflow-hidden">
      <div className="px-3 py-2 border-b border-black/[0.04] flex items-center gap-2">
        <span className="text-sm">🗺️</span>
        <span className="text-xs font-semibold text-bw-heading">Heatmap Comprehension</span>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-fit">
          {/* Header row */}
          <div className="flex items-center border-b border-black/[0.04]">
            <div className="w-24 flex-shrink-0 px-2 py-1.5">
              <span className="text-xs text-bw-muted">Eleve</span>
            </div>
            {situations.map((si) => (
              <div
                key={si}
                className={`w-8 h-8 flex-shrink-0 flex items-center justify-center text-xs font-mono ${
                  si === currentSituation ? "text-bw-primary font-bold" : "text-bw-muted"
                }`}
              >
                {si + 1}
              </div>
            ))}
          </div>

          {/* Student rows */}
          {students.map((student, si) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: si * 0.02 }}
              className="flex items-center border-b border-black/[0.02] hover:bg-black/[0.02]"
            >
              <div className="w-24 flex-shrink-0 px-2 py-1 flex items-center gap-1.5 overflow-hidden">
                <span className="text-xs">{student.avatar}</span>
                <span className="text-xs truncate text-bw-text">{student.display_name}</span>
              </div>
              {situations.map((qi) => {
                const response = responseMap.get(`${student.id}-${qi}`);
                const hasResponse = response?.has_response ?? false;
                const score = response?.score;
                const wasRetained = response?.was_retained ?? false;

                return (
                  <div key={qi} className="w-8 h-8 flex-shrink-0 flex items-center justify-center relative">
                    <motion.div
                      className="w-6 h-6 rounded-md flex items-center justify-center"
                      style={{ background: getHeatColor(score, hasResponse) }}
                      whileHover={{ scale: 1.3 }}
                      title={
                        hasResponse
                          ? `${student.display_name} Q${qi + 1}: ${score !== null && score !== undefined ? `${score}/5` : "repondu"}${wasRetained ? " ★" : ""}`
                          : `${student.display_name} Q${qi + 1}: pas repondu`
                      }
                    >
                      {wasRetained && <span className="text-xs">⭐</span>}
                    </motion.div>
                  </div>
                );
              })}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-3 py-2 border-t border-black/[0.04] flex items-center gap-3 flex-wrap">
        <span className="text-xs text-bw-muted">Legende :</span>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ background: "rgba(16,185,129,0.5)" }} />
          <span className="text-xs text-bw-muted">Excellent</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ background: "rgba(78,205,196,0.4)" }} />
          <span className="text-xs text-bw-muted">Bon</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ background: "rgba(245,158,11,0.35)" }} />
          <span className="text-xs text-bw-muted">Moyen</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ background: "rgba(239,68,68,0.35)" }} />
          <span className="text-xs text-bw-muted">Difficile</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ background: "rgba(0,0,0,0.02)" }} />
          <span className="text-xs text-bw-muted">Pas repondu</span>
        </div>
      </div>
    </div>
  );
}

export const ComprehensionHeatmap = memo(ComprehensionHeatmapInner);
