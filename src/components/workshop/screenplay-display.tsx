"use client";

import { useEffect, useRef } from "react";

interface ScreenplayDisplayProps {
  text: string;
  isStreaming?: boolean;
}

interface ScreenplayLine {
  type: "scene-header" | "action" | "character-name" | "parenthetical" | "dialogue" | "transition" | "empty";
  text: string;
}

function parseScreenplay(text: string): ScreenplayLine[] {
  if (!text) return [];

  const lines = text.split("\n");
  const parsed: ScreenplayLine[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      parsed.push({ type: "empty", text: "" });
      continue;
    }

    // Scene header: INT./EXT.
    if (/^(INT\.|EXT\.|INT\/EXT\.)/.test(trimmed.toUpperCase())) {
      parsed.push({ type: "scene-header", text: trimmed.toUpperCase() });
      continue;
    }

    // Transition: CUT TO, FONDU, FADE, etc. (all caps ending with :)
    if (
      /^(CUT TO:|FONDU|FADE|SMASH CUT|MATCH CUT|DISSOLVE)/.test(
        trimmed.toUpperCase()
      ) ||
      (trimmed === trimmed.toUpperCase() && trimmed.endsWith(":") && trimmed.length < 30)
    ) {
      parsed.push({ type: "transition", text: trimmed.toUpperCase() });
      continue;
    }

    // Parenthetical: (text)
    if (trimmed.startsWith("(") && trimmed.endsWith(")")) {
      parsed.push({ type: "parenthetical", text: trimmed });
      continue;
    }

    // Character name: ALL CAPS, short, and next line is dialogue
    if (
      trimmed === trimmed.toUpperCase() &&
      trimmed.length < 40 &&
      /^[A-ZÀ-Ÿ\s.'-]+$/.test(trimmed)
    ) {
      parsed.push({ type: "character-name", text: trimmed });
      continue;
    }

    // If previous line was character-name or parenthetical, this is dialogue
    const prev = parsed[parsed.length - 1];
    if (
      prev &&
      (prev.type === "character-name" || prev.type === "parenthetical")
    ) {
      parsed.push({ type: "dialogue", text: trimmed });
      continue;
    }

    // Default: action
    parsed.push({ type: "action", text: trimmed });
  }

  return parsed;
}

export function ScreenplayDisplay({
  text,
  isStreaming,
}: ScreenplayDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lines = parseScreenplay(text);

  useEffect(() => {
    if (isStreaming && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [text, isStreaming]);

  if (!text && !isStreaming) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        La scene apparaitra ici...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="max-h-[700px] overflow-y-auto bg-card/30 backdrop-blur-sm border border-border/30 rounded-lg p-8 font-mono text-sm leading-relaxed"
    >
      {lines.map((line, i) => {
        if (line.type === "empty") return <div key={i} className="h-4" />;

        if (line.type === "scene-header") {
          return (
            <p
              key={i}
              className="text-center font-bold uppercase underline mb-4 mt-6"
            >
              {line.text}
            </p>
          );
        }

        if (line.type === "transition") {
          return (
            <p key={i} className="text-right uppercase mt-4 mb-2">
              {line.text}
            </p>
          );
        }

        if (line.type === "character-name") {
          return (
            <p key={i} className="text-center uppercase font-bold mt-4">
              {line.text}
            </p>
          );
        }

        if (line.type === "parenthetical") {
          return (
            <p key={i} className="text-center italic text-muted-foreground">
              {line.text}
            </p>
          );
        }

        if (line.type === "dialogue") {
          return (
            <p key={i} className="mx-auto max-w-[70%] mb-2">
              {line.text}
            </p>
          );
        }

        // action
        return (
          <p key={i} className="mb-2">
            {line.text}
          </p>
        );
      })}

      {isStreaming && (
        <div className="flex items-center gap-2 mt-4">
          <span className="led-working" />
          <span className="text-xs text-muted-foreground">
            Ecriture en cours...
          </span>
        </div>
      )}
    </div>
  );
}
