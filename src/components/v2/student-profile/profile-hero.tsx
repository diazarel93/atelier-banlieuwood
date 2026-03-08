"use client";

import { GlassCardV2 } from "../glass-card";
import { Avatar } from "../avatar";
import { StatRing } from "../stat-ring";
import { AXES, type AxesScores } from "@/lib/axes-mapping";

interface ProfileHeroProps {
  displayName: string;
  avatar: string | null;
  sessionCount: number;
  totalResponses: number;
  scores?: AxesScores;
  classLabel?: string | null;
  lastActiveAt?: string | null;
}

function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} jours`;
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });
}

export function ProfileHero({
  displayName,
  avatar,
  sessionCount,
  totalResponses,
  scores,
  classLabel,
  lastActiveAt,
}: ProfileHeroProps) {
  const hasScores =
    scores &&
    (scores.comprehension > 0 ||
      scores.creativite > 0 ||
      scores.expression > 0 ||
      scores.engagement > 0);

  return (
    <GlassCardV2 className="p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
        {/* Identity */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Avatar name={displayName} emoji={avatar} size="lg" />
          <div className="min-w-0">
            <h1 className="text-heading-xl text-bw-heading truncate">
              {displayName}
            </h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {classLabel && (
                <span className="text-body-xs text-bw-muted font-medium">
                  {classLabel}
                </span>
              )}
              <span className="text-body-xs text-bw-muted">
                <span className="font-semibold text-bw-heading tabular-nums">
                  {sessionCount}
                </span>{" "}
                séance{sessionCount !== 1 ? "s" : ""}
              </span>
              <span className="text-body-xs text-bw-muted">
                <span className="font-semibold text-bw-heading tabular-nums">
                  {totalResponses}
                </span>{" "}
                réponse{totalResponses !== 1 ? "s" : ""}
              </span>
              {lastActiveAt && (
                <span className="text-body-xs text-bw-muted">
                  Actif {formatRelativeDate(lastActiveAt)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Inline score rings — only if there's actual data */}
        {hasScores && (
          <div className="flex items-center gap-3 shrink-0">
            {AXES.map((axis) => (
              <StatRing
                key={axis.key}
                value={scores[axis.key]}
                label={axis.label}
                color={axis.color}
                size={56}
                strokeWidth={4}
              />
            ))}
          </div>
        )}
      </div>
    </GlassCardV2>
  );
}
