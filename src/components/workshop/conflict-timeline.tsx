"use client";

import type { ConflictPhase } from "@/lib/models/workshop";
import type { Character } from "@/lib/models/character";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface ConflictTimelineProps {
  phases: ConflictPhase[];
  characters: Character[];
}

const PHASE_COLORS = [
  "bg-yellow-500",
  "bg-primary",
  "bg-destructive",
  "bg-accent",
];

const TRAIT_CATEGORY_LABELS: Record<string, string> = {
  faille: "Faille",
  peur: "Peur",
  objectif: "Objectif",
  besoin: "Besoin",
  secret: "Secret",
};

export function ConflictTimeline({
  phases,
  characters,
}: ConflictTimelineProps) {
  const charMap = new Map(characters.map((c) => [c.id, c]));

  if (!phases.length) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        L&apos;analyse apparaitra ici...
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border/50" />

      <div className="space-y-8">
        {phases.map((phase, i) => (
          <div key={phase.phase} className="relative pl-16">
            {/* Phase dot */}
            <div
              className={`absolute left-4 w-5 h-5 rounded-full ${PHASE_COLORS[i] || "bg-muted"} flex items-center justify-center`}
            >
              <span className="text-[10px] text-white font-bold">
                {phase.phase}
              </span>
            </div>

            <Card className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-sm">
                  Phase {phase.phase} — {phase.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {phase.description}
                </p>
              </div>

              {phase.characterReactions?.length > 0 && (
                <div className="space-y-2">
                  {phase.characterReactions.map((reaction, j) => {
                    const char =
                      charMap.get(reaction.characterId) ||
                      characters.find(
                        (c) =>
                          c.name.toLowerCase() ===
                          reaction.characterName?.toLowerCase()
                      );
                    return (
                      <div
                        key={j}
                        className="flex gap-3 items-start p-2 rounded bg-card/30 backdrop-blur-sm"
                      >
                        <span
                          className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                          style={{
                            backgroundColor: char?.color || "#6366f1",
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">
                              {reaction.characterName}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0"
                            >
                              {TRAIT_CATEGORY_LABELS[reaction.traitCategory] ||
                                reaction.traitCategory}
                              : {reaction.drivingTrait}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {reaction.reaction}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
