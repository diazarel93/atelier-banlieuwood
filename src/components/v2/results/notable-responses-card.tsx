"use client";

import { GlassCardV2 } from "@/components/v2/glass-card";

export interface NotableResponse {
  id: string;
  text: string;
  studentName: string;
  avatar: string;
  metric: string;
}

export interface NotableResponses {
  mostVoted: NotableResponse | null;
  mostCreative: NotableResponse | null;
  mostDivisive: NotableResponse | null;
}

interface NotableResponsesCardProps {
  data: NotableResponses | null;
}

const CARDS = [
  {
    key: "mostVoted" as const,
    label: "La plus votée",
    icon: "\uD83D\uDD25",
    borderColor: "#FF6B35",
  },
  {
    key: "mostCreative" as const,
    label: "Interprétation originale",
    icon: "\uD83D\uDCA1",
    borderColor: "#8B5CF6",
  },
  {
    key: "mostDivisive" as const,
    label: "Réponse qui divise",
    icon: "\u26A1",
    borderColor: "#EF4444",
  },
] as const;

export function NotableResponsesCard({ data }: NotableResponsesCardProps) {
  if (!data) return null;

  const visible = CARDS.filter((c) => data[c.key] !== null);
  if (visible.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-bw-heading uppercase tracking-wide">
        Réponses marquantes
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {visible.map((card) => {
          const item = data[card.key]!;
          return (
            <GlassCardV2
              key={card.key}
              className="p-4 border-t-2"
              style={{ borderTopColor: card.borderColor }}
            >
              <p className="text-xs font-semibold text-bw-muted mb-2">
                {card.icon} {card.label}
              </p>
              <p className="text-sm italic text-bw-heading leading-relaxed line-clamp-3 mb-3">
                &ldquo;{item.text}&rdquo;
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{item.avatar}</span>
                  <span className="text-xs text-bw-muted">{item.studentName}</span>
                </div>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${card.borderColor}15`,
                    color: card.borderColor,
                  }}
                >
                  {item.metric}
                </span>
              </div>
            </GlassCardV2>
          );
        })}
      </div>
    </div>
  );
}
