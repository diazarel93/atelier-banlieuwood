"use client";

import { GlassCardV2 } from "../glass-card";

interface RecentResponse {
  id: string;
  situationLabel: string;
  textResponse: string | null;
  aiScore: number | null;
  teacherScore?: number | null;
  teacherFlag?: string | null;
  isHighlighted?: boolean;
  responseTimeMs?: number | null;
  createdAt: string;
}

interface ResponseHistoryListProps {
  responses: RecentResponse[];
}

function scoreColor(score: number | null): string {
  if (score === null) return "text-bw-muted";
  if (score < 2) return "text-[var(--color-bw-danger)]";
  if (score < 3) return "text-[var(--color-bw-amber)]";
  return "text-[var(--color-bw-green)]";
}

const FLAG_ICONS: Record<string, string> = {
  star: "⭐",
  flag: "🚩",
  bookmark: "🔖",
};

function formatTime(ms: number): string {
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m${String(seconds % 60).padStart(2, "0")}`;
}

export function ResponseHistoryList({ responses }: ResponseHistoryListProps) {
  return (
    <GlassCardV2 className="p-5">
      <h3 className="label-caps mb-3">Réponses récentes</h3>
      {responses.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-bw-muted mb-2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          <p className="text-body-xs text-bw-muted">
            Les réponses apparaîtront après la première séance
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {responses.map((r) => (
            <div key={r.id} className="flex items-start justify-between gap-3 rounded-xl p-2.5 hover:bg-bw-primary/[0.025] transition-colors duration-100">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="text-body-xs font-medium text-bw-muted">
                    {r.situationLabel}
                  </p>
                  {r.isHighlighted && (
                    <span className="text-[10px]" title="Mis en avant par le prof">✨</span>
                  )}
                  {r.teacherFlag && (
                    <span className="text-[10px]" title={r.teacherFlag}>
                      {FLAG_ICONS[r.teacherFlag] || ""}
                    </span>
                  )}
                </div>
                {r.textResponse && (
                  <p className="text-sm text-bw-heading line-clamp-2 leading-snug">
                    {r.textResponse}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {/* Response time */}
                {r.responseTimeMs != null && r.responseTimeMs > 0 && (
                  <span className="text-[11px] text-bw-muted tabular-nums" title="Temps de réponse">
                    {formatTime(r.responseTimeMs)}
                  </span>
                )}
                {/* Teacher score */}
                {r.teacherScore != null && r.teacherScore > 0 && (
                  <span
                    className="text-[11px] font-semibold text-bw-primary tabular-nums"
                    title="Note prof"
                  >
                    {r.teacherScore}/5
                  </span>
                )}
                {/* AI score */}
                {r.aiScore !== null && (
                  <span
                    className={`text-sm font-bold tabular-nums ${scoreColor(r.aiScore)}`}
                    title="Score IA"
                  >
                    {r.aiScore.toFixed(1)}
                  </span>
                )}
                <span className="text-body-xs text-bw-muted">
                  {new Date(r.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCardV2>
  );
}
