"use client";

import { useEffect, useRef } from "react";
import type { Character } from "@/lib/models/character";

interface TableReadDisplayProps {
  text: string;
  characters: Character[];
  isStreaming?: boolean;
}

interface ParsedLine {
  type: "dialogue" | "didascalie" | "narration" | "empty";
  characterName?: string;
  characterColor?: string;
  text: string;
}

function parseLines(
  text: string,
  characters: Character[]
): ParsedLine[] {
  if (!text) return [];

  const charMap = new Map(
    characters.map((c) => [c.name.toUpperCase(), c])
  );
  const lines = text.split("\n");
  const parsed: ParsedLine[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      parsed.push({ type: "empty", text: "" });
      continue;
    }

    // Didascalie: *(text)*
    if (/^\*\(.*\)\*$/.test(trimmed) || /^\*.*\*$/.test(trimmed)) {
      parsed.push({
        type: "didascalie",
        text: trimmed.replace(/^\*\(?|\)?\*$/g, ""),
      });
      continue;
    }

    // Dialogue: [NOM] text
    const dialogueMatch = trimmed.match(/^\[([^\]]+)\]\s*(.+)/);
    if (dialogueMatch) {
      const name = dialogueMatch[1];
      const char = charMap.get(name.toUpperCase());
      parsed.push({
        type: "dialogue",
        characterName: name,
        characterColor: char?.color || "#6366f1",
        text: dialogueMatch[2],
      });
      continue;
    }

    // Narration: (text)
    if (trimmed.startsWith("(") && trimmed.endsWith(")")) {
      parsed.push({
        type: "narration",
        text: trimmed.slice(1, -1),
      });
      continue;
    }

    // Fallback: check if line starts with a character name
    for (const [upperName, char] of charMap) {
      if (
        trimmed.toUpperCase().startsWith(upperName + " ") ||
        trimmed.toUpperCase().startsWith(upperName + ":")
      ) {
        const sep = trimmed.indexOf(":") === upperName.length ? ":" : " ";
        parsed.push({
          type: "dialogue",
          characterName: char.name,
          characterColor: char.color,
          text: trimmed.slice(upperName.length + sep.length).trim(),
        });
        break;
      }
    }

    // If nothing matched, treat as narration
    if (
      parsed.length === 0 ||
      parsed[parsed.length - 1].text !== trimmed.slice(trimmed.indexOf(" ") + 1).trim()
    ) {
      // Only add if we didn't already add from the character name check
      const lastParsed = parsed[parsed.length - 1];
      if (lastParsed?.type === "empty" || !lastParsed || lastParsed.text !== trimmed) {
        // Check if it was already captured above
        const wasCaptured = parsed.length > 0 && parsed[parsed.length - 1].type === "dialogue";
        if (!wasCaptured) {
          parsed.push({ type: "narration", text: trimmed });
        }
      }
    }
  }

  return parsed;
}

export function TableReadDisplay({
  text,
  characters,
  isStreaming,
}: TableReadDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lines = parseLines(text, characters);

  useEffect(() => {
    if (isStreaming && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [text, isStreaming]);

  if (!text && !isStreaming) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        Le dialogue apparaitra ici...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="space-y-2 max-h-[600px] overflow-y-auto p-4 bg-card/30 backdrop-blur-sm rounded-xl border border-border/30"
    >
      {lines.map((line, i) => {
        if (line.type === "empty") return <div key={i} className="h-2" />;

        if (line.type === "didascalie") {
          return (
            <p key={i} className="text-sm italic text-muted-foreground px-4">
              {line.text}
            </p>
          );
        }

        if (line.type === "narration") {
          return (
            <p key={i} className="text-sm text-muted-foreground px-4">
              ({line.text})
            </p>
          );
        }

        if (line.type === "dialogue") {
          return (
            <div key={i} className="flex gap-3 items-start">
              <span
                className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold text-white shrink-0 min-w-[80px] text-center"
                style={{ backgroundColor: line.characterColor }}
              >
                {line.characterName}
              </span>
              <p className="text-sm flex-1 font-mono">{line.text}</p>
            </div>
          );
        }

        return null;
      })}

      {isStreaming && (
        <div className="flex items-center gap-2 px-4">
          <span className="led-working" />
          <span className="text-xs text-muted-foreground">
            Generation en cours...
          </span>
        </div>
      )}
    </div>
  );
}
