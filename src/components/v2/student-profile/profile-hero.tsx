"use client";

import { GlassCardV2 } from "../glass-card";
import { Avatar } from "../avatar";
import { StatRing } from "../stat-ring";
import { AXES, type AxesScores } from "@/lib/axes-mapping";
import { resolveTalentProfile } from "@/lib/talent-profiles";

const TAG_LABELS: Record<string, { label: string; emoji: string }> = {
  tres_creatif: { label: "Très créatif", emoji: "🎨" },
  force_de_proposition: { label: "Force de proposition", emoji: "💡" },
  bonne_ecoute: { label: "Bonne écoute", emoji: "👂" },
  tres_investi: { label: "Très investi", emoji: "🔥" },
  bonne_cooperation: { label: "Bonne coopération", emoji: "🤝" },
  leadership: { label: "Leadership", emoji: "👑" },
  perturbateur: { label: "Perturbateur", emoji: "⚠️" },
  decrochage: { label: "Décrochage", emoji: "📉" },
};

interface ProfileHeroProps {
  displayName: string;
  avatar: string | null;
  sessionCount: number;
  totalResponses: number;
  scores?: AxesScores;
  deltas?: Record<string, number> | null;
  classLabel?: string | null;
  lastActiveAt?: string | null;
  creativeProfile?: string | null;
  avgAiScore?: number | null;
  avgResponseTimeMs?: number | null;
  facilitatorTags?: { tag: string; count: number }[];
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

function DeltaBadge({ value }: { value: number }) {
  if (value === 0) return null;
  const positive = value > 0;
  return (
    <span
      className={`text-[10px] font-semibold tabular-nums ${
        positive ? "text-[var(--color-bw-green)]" : "text-[var(--color-bw-danger)]"
      }`}
    >
      {positive ? "+" : ""}{value}
    </span>
  );
}

export function ProfileHero({
  displayName,
  avatar,
  sessionCount,
  totalResponses,
  scores,
  deltas,
  classLabel,
  lastActiveAt,
  creativeProfile,
  avgAiScore,
  avgResponseTimeMs,
  facilitatorTags,
}: ProfileHeroProps) {
  const hasScores =
    scores &&
    (scores.comprehension > 0 ||
      scores.creativite > 0 ||
      scores.expression > 0 ||
      scores.engagement > 0);

  const cp = resolveTalentProfile(creativeProfile);
  const positiveTags = (facilitatorTags || []).filter(
    (t) => !["perturbateur", "decrochage"].includes(t.tag)
  );
  const warningTags = (facilitatorTags || []).filter(
    (t) => ["perturbateur", "decrochage"].includes(t.tag)
  );

  return (
    <GlassCardV2 className="p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
        {/* Identity */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Avatar name={displayName} emoji={avatar} size="lg" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-heading-xl text-bw-heading truncate">
                {displayName}
              </h1>
              {cp && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                  style={{ background: `${cp.color}15`, color: cp.color }}
                >
                  {cp.emoji} {cp.label}
                </span>
              )}
            </div>
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
              {avgAiScore !== null && avgAiScore !== undefined && (
                <span className="text-body-xs text-bw-muted">
                  Score IA moy.{" "}
                  <span className="font-semibold text-bw-heading tabular-nums">
                    {avgAiScore.toFixed(1)}
                  </span>
                </span>
              )}
              {avgResponseTimeMs != null && avgResponseTimeMs > 0 && (
                <span className="text-body-xs text-bw-muted">
                  Temps moy.{" "}
                  <span className="font-semibold text-bw-heading tabular-nums">
                    {Math.round(avgResponseTimeMs / 1000)}s
                  </span>
                </span>
              )}
              {lastActiveAt && (
                <span className="text-body-xs text-bw-muted">
                  Actif {formatRelativeDate(lastActiveAt)}
                </span>
              )}
            </div>

            {/* Facilitator tags */}
            {(positiveTags.length > 0 || warningTags.length > 0) && (
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {positiveTags.map((t) => {
                  const def = TAG_LABELS[t.tag];
                  return (
                    <span
                      key={t.tag}
                      className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[var(--color-bw-green)]/10 text-[11px] font-medium text-[var(--color-bw-green)]"
                      title={`${def?.label || t.tag} (${t.count}x)`}
                    >
                      {def?.emoji} {def?.label || t.tag}
                      {t.count > 1 && <span className="opacity-60">×{t.count}</span>}
                    </span>
                  );
                })}
                {warningTags.map((t) => {
                  const def = TAG_LABELS[t.tag];
                  return (
                    <span
                      key={t.tag}
                      className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[var(--color-bw-danger)]/10 text-[11px] font-medium text-[var(--color-bw-danger)]"
                      title={`${def?.label || t.tag} (${t.count}x)`}
                    >
                      {def?.emoji} {def?.label || t.tag}
                      {t.count > 1 && <span className="opacity-60">×{t.count}</span>}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Inline score rings with deltas */}
        {hasScores && (
          <div className="flex items-center gap-3 shrink-0">
            {AXES.map((axis) => (
              <div key={axis.key} className="flex flex-col items-center gap-0.5">
                <StatRing
                  value={scores[axis.key]}
                  label={axis.label}
                  color={axis.color}
                  size={56}
                  strokeWidth={4}
                />
                {deltas && deltas[axis.key] !== undefined && (
                  <DeltaBadge value={deltas[axis.key]} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </GlassCardV2>
  );
}
