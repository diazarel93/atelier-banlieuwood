"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Character } from "@/lib/models/character";

const ROLE_LABELS: Record<string, string> = {
  protagoniste: "Protagoniste",
  antagoniste: "Antagoniste",
  secondaire: "Secondaire",
  figurant: "Figurant",
};

export function CharacterCard({
  character,
  slug,
}: {
  character: Character;
  slug: string;
}) {
  return (
    <Link href={`/project/${slug}/bible/characters/${character.id}`}>
      <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full shrink-0 transition-shadow duration-300"
              style={{
                backgroundColor: character.color,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 8px ${character.color}40`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}
            />
            <h3 className="font-semibold group-hover:text-primary transition-colors truncate">
              {character.name}
            </h3>
          </div>
          {character.role && (
            <Badge variant="secondary" className="w-fit text-xs">
              {ROLE_LABELS[character.role] || character.role}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-1">
          {character.occupation && (
            <p className="text-sm text-muted-foreground">
              {character.occupation}
            </p>
          )}
          {character.psychology.flaw && (
            <p className="text-xs text-muted-foreground italic">
              Faille : {character.psychology.flaw}
            </p>
          )}
          {character.traits.length > 0 && (
            <div className="flex gap-1 flex-wrap mt-2">
              {character.traits.slice(0, 3).map((t) => (
                <Badge key={t.name} variant="outline" className="text-[10px]">
                  {t.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
