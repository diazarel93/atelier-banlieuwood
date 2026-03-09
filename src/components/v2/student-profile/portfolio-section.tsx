"use client";

import { GlassCardV2 } from "../glass-card";

interface Portfolio {
  personnage: {
    prenom: string;
    traitDominant: string | null;
    force: string | null;
    faiblesse: string | null;
    avatarData: Record<string, unknown>;
  } | null;
  pitch: {
    objectif: string;
    obstacle: string;
    pitchText: string;
    chronoSeconds: number | null;
  } | null;
  talentCard: {
    talentCategory: string;
    strengths: string[];
    roleKey: string | null;
  } | null;
  filmRole: {
    roleKey: string;
    isVeto: boolean;
  } | null;
}

const TALENT_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  jeu: { label: "Jeu d'acteur", emoji: "🎭", color: "#E54D2E" },
  image: { label: "Image & Visuel", emoji: "📸", color: "#9B59B6" },
  technique: { label: "Technique", emoji: "🎬", color: "#3498DB" },
};

const ROLE_LABELS: Record<string, { label: string; emoji: string }> = {
  realisateur: { label: "Réalisateur", emoji: "🎬" },
  scenariste: { label: "Scénariste", emoji: "✍️" },
  cameraman: { label: "Cadreur", emoji: "📹" },
  acteur: { label: "Acteur", emoji: "🎭" },
  decorateur: { label: "Décorateur", emoji: "🎨" },
  monteur: { label: "Monteur", emoji: "✂️" },
  ingeson: { label: "Ingénieur son", emoji: "🎧" },
  producteur: { label: "Producteur", emoji: "💼" },
};

interface PortfolioSectionProps {
  portfolio: Portfolio;
}

export function PortfolioSection({ portfolio }: PortfolioSectionProps) {
  const { personnage, pitch, talentCard, filmRole } = portfolio;
  const hasAny = personnage || pitch || talentCard || filmRole;

  if (!hasAny) return null;

  return (
    <GlassCardV2 className="p-5">
      <h3 className="label-caps mb-4">Portfolio Créatif</h3>

      <div className="space-y-4">
        {/* Personnage M10 */}
        {personnage && (
          <div className="rounded-xl border border-[var(--color-bw-border-subtle)] p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">🧑‍🎤</span>
              <span className="text-body-sm font-semibold text-bw-heading">
                {personnage.prenom}
              </span>
              {personnage.traitDominant && (
                <span className="text-body-xs text-bw-muted">
                  — {personnage.traitDominant}
                </span>
              )}
            </div>
            <div className="flex gap-4 text-body-xs text-bw-muted">
              {personnage.force && (
                <span>
                  <span className="text-[var(--color-bw-green)] font-medium">Force :</span>{" "}
                  {personnage.force}
                </span>
              )}
              {personnage.faiblesse && (
                <span>
                  <span className="text-[var(--color-bw-danger)] font-medium">Faiblesse :</span>{" "}
                  {personnage.faiblesse}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Pitch M10 */}
        {pitch && (
          <div className="rounded-xl border border-[var(--color-bw-border-subtle)] p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">🎤</span>
              <span className="text-body-sm font-semibold text-bw-heading">Pitch</span>
              {pitch.chronoSeconds != null && (
                <span className="text-body-xs text-bw-muted tabular-nums">
                  ({pitch.chronoSeconds}s)
                </span>
              )}
            </div>
            <p className="text-body-xs text-bw-heading leading-relaxed line-clamp-3">
              {pitch.pitchText}
            </p>
            <div className="flex gap-4 mt-2 text-body-xs text-bw-muted">
              <span>
                <span className="font-medium">Objectif :</span> {pitch.objectif}
              </span>
              <span>
                <span className="font-medium">Obstacle :</span> {pitch.obstacle}
              </span>
            </div>
          </div>
        )}

        {/* Talent Card + Film Role M8 */}
        {(talentCard || filmRole) && (
          <div className="rounded-xl border border-[var(--color-bw-border-subtle)] p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">🎬</span>
              <span className="text-body-sm font-semibold text-bw-heading">Équipe du film</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {filmRole && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-bw-primary/10 text-body-xs font-semibold text-bw-primary">
                  {ROLE_LABELS[filmRole.roleKey]?.emoji || "🎬"}{" "}
                  {ROLE_LABELS[filmRole.roleKey]?.label || filmRole.roleKey}
                  {filmRole.isVeto && " (Véto)"}
                </span>
              )}
              {talentCard && (() => {
                const tc = TALENT_LABELS[talentCard.talentCategory];
                return (
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-body-xs font-semibold"
                    style={{
                      background: `${tc?.color || "#666"}15`,
                      color: tc?.color || "#666",
                    }}
                  >
                    {tc?.emoji || "🏆"} {tc?.label || talentCard.talentCategory}
                  </span>
                );
              })()}
            </div>
            {talentCard && talentCard.strengths.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {talentCard.strengths.map((s, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-[var(--color-bw-surface-dim)] text-body-xs text-bw-muted"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </GlassCardV2>
  );
}
