"use client";

import { GlassCardV2 } from "@/components/v2/glass-card";
import { OIERadar, OIERadarMini } from "@/components/pilot/oie-radar";
import type { OIEScores } from "@/lib/oie-profile";
import type { FeedbackData } from "@/hooks/use-results-data";

const DOMINANT_LABELS: Record<string, string> = {
  O: "Observateurs",
  I: "Imaginatifs",
  E: "Expressifs",
};
const DOMINANT_COLORS: Record<string, string> = {
  O: "#8B5CF6",
  I: "#06B6D4",
  E: "#F59E0B",
};

interface OieProfileSectionProps {
  scores: Record<string, OIEScores>;
  feedback: FeedbackData | null;
}

export function OieProfileSection({ scores, feedback }: OieProfileSectionProps) {
  const entries = Object.entries(scores);
  if (entries.length === 0) return null;

  const avgO = Math.round(entries.reduce((s, [, v]) => s + v.O, 0) / entries.length);
  const avgI = Math.round(entries.reduce((s, [, v]) => s + v.I, 0) / entries.length);
  const avgE = Math.round(entries.reduce((s, [, v]) => s + v.E, 0) / entries.length);

  let classDom: "O" | "I" | "E" = "O";
  if (avgI >= avgO && avgI >= avgE) classDom = "I";
  else if (avgE >= avgO && avgE >= avgI) classDom = "E";

  const classAvg: OIEScores = {
    O: avgO,
    I: avgI,
    E: avgE,
    dominant: classDom,
    responseCount: entries.reduce((s, [, v]) => s + v.responseCount, 0),
    isReliable: true,
  };

  const countO = entries.filter(([, v]) => v.dominant === "O").length;
  const countI = entries.filter(([, v]) => v.dominant === "I").length;
  const countE = entries.filter(([, v]) => v.dominant === "E").length;

  // student names from feedback
  const studentNames: Record<string, { name: string; avatar: string }> = {};
  if (feedback?.students) {
    for (const s of feedback.students)
      studentNames[s.id] = { name: s.name, avatar: s.avatar };
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-bw-heading uppercase tracking-wide">
        Profils créatifs O-I-E
      </h3>

      {/* Class average + Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCardV2 className="p-5">
          <p className="text-xs font-semibold text-bw-heading uppercase tracking-wide mb-3">
            Profil moyen de la classe
          </p>
          <div className="flex justify-center">
            <OIERadar scores={classAvg} size={180} showLabel={false} />
          </div>
        </GlassCardV2>

        <GlassCardV2 className="p-5 space-y-3">
          <p className="text-xs font-semibold text-bw-heading uppercase tracking-wide mb-1">
            Distribution
          </p>
          {(["O", "I", "E"] as const).map((axis) => {
            const count = axis === "O" ? countO : axis === "I" ? countI : countE;
            const pct =
              entries.length > 0
                ? Math.round((count / entries.length) * 100)
                : 0;
            return (
              <div key={axis} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span
                    className="font-medium"
                    style={{ color: DOMINANT_COLORS[axis] }}
                  >
                    {DOMINANT_LABELS[axis]}
                  </span>
                  <span className="text-bw-muted">
                    {count} ({pct}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[var(--color-bw-border-subtle)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      backgroundColor: DOMINANT_COLORS[axis],
                      width: `${pct}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
          <p className="text-[11px] text-bw-muted mt-2">
            {countI > countO && countI > countE && "La classe est très imaginative"}
            {countO > countI && countO > countE && "La classe est très analytique"}
            {countE > countO && countE > countI && "La classe est très expressive"}
            {countO === countI && countO === countE && "Profil de classe équilibré"}
          </p>
        </GlassCardV2>
      </div>

      {/* Individual mini radars */}
      <GlassCardV2 className="p-5">
        <p className="text-xs font-semibold text-bw-heading uppercase tracking-wide mb-3">
          Profils individuels
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {entries.map(([studentId, sc]) => {
            const info = studentNames[studentId];
            return (
              <div
                key={studentId}
                className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-[var(--color-bw-surface-dim)] transition-colors"
              >
                <OIERadarMini scores={sc} size={56} />
                <span className="text-[10px] font-medium text-bw-heading truncate max-w-[80px]">
                  {info?.avatar} {info?.name || "Élève"}
                </span>
                <span
                  className="text-[9px] font-semibold"
                  style={{ color: DOMINANT_COLORS[sc.dominant] }}
                >
                  {DOMINANT_LABELS[sc.dominant]?.slice(0, -1)}
                </span>
              </div>
            );
          })}
        </div>
      </GlassCardV2>
    </div>
  );
}
