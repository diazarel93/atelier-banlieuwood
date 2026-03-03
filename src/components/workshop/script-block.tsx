"use client";

import { useRef, useEffect, KeyboardEvent } from "react";
import type { ScriptBlock as ScriptBlockType } from "@/lib/models/workshop";

interface ScriptBlockProps {
  block: ScriptBlockType;
  isFocused: boolean;
  onFocus: () => void;
  onChange: (block: ScriptBlockType) => void;
  onDelete: () => void;
  onInsertAfter: (type: ScriptBlockType["type"]) => void;
  onFocusPrev: () => void;
  onFocusNext: () => void;
}

const BLOCK_TYPES: ScriptBlockType["type"][] = [
  "action",
  "dialogue",
  "scene-header",
  "transition",
];

function getNextType(
  current: ScriptBlockType["type"]
): ScriptBlockType["type"] {
  const idx = BLOCK_TYPES.indexOf(current);
  return BLOCK_TYPES[(idx + 1) % BLOCK_TYPES.length];
}

export function ScriptBlock({
  block,
  isFocused,
  onFocus,
  onChange,
  onDelete,
  onInsertAfter,
  onFocusPrev,
  onFocusNext,
}: ScriptBlockProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter: new block after
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onInsertAfter("action");
    }

    // Tab: cycle type
    if (e.key === "Tab") {
      e.preventDefault();
      const newType = getNextType(block.type);
      if (newType === "dialogue") {
        onChange({
          type: "dialogue",
          id: block.id,
          characterName: "",
          parenthetical: "",
          text: block.type === "dialogue" ? block.text : ("text" in block ? block.text : ""),
        } as ScriptBlockType);
      } else {
        const text = block.type === "dialogue" ? block.text : ("text" in block ? block.text : "");
        onChange({
          type: newType,
          id: block.id,
          text,
        } as ScriptBlockType);
      }
    }

    // Backspace on empty: delete
    if (e.key === "Backspace" && getText() === "" && getCharName() === "") {
      e.preventDefault();
      onDelete();
    }

    // Arrow up: focus prev
    if (e.key === "ArrowUp" && inputRef.current?.selectionStart === 0) {
      e.preventDefault();
      onFocusPrev();
    }

    // Arrow down: focus next
    if (
      e.key === "ArrowDown" &&
      inputRef.current?.selectionStart === inputRef.current?.value.length
    ) {
      e.preventDefault();
      onFocusNext();
    }
  };

  const getText = () => ("text" in block ? block.text : "");
  const getCharName = () =>
    block.type === "dialogue" ? block.characterName : "";

  const updateText = (newText: string) => {
    if (block.type === "dialogue") {
      onChange({ ...block, text: newText });
    } else {
      onChange({ ...block, text: newText } as ScriptBlockType);
    }
  };

  const blockStyles: Record<string, string> = {
    "scene-header":
      "text-center font-mono font-bold uppercase bg-primary/5 border-l-2 border-primary/30 rounded px-4",
    action: "font-mono w-full",
    dialogue: "font-mono mx-auto max-w-[70%]",
    transition: "text-right font-mono uppercase",
  };

  const typeLabel: Record<string, string> = {
    "scene-header": "EN-TETE",
    action: "ACTION",
    dialogue: "DIALOGUE",
    transition: "TRANSITION",
  };

  return (
    <div
      className={`group relative ${isFocused ? "ring-1 ring-accent/40 rounded" : ""}`}
      onClick={onFocus}
    >
      {/* Type badge */}
      <span className="absolute -left-20 top-1 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
        {typeLabel[block.type]}
      </span>

      <div className={blockStyles[block.type] || ""}>
        {block.type === "dialogue" && (
          <input
            className="w-full text-center uppercase font-bold bg-transparent border-none outline-none text-sm mb-1"
            value={block.characterName}
            onChange={(e) =>
              onChange({ ...block, characterName: e.target.value })
            }
            placeholder="NOM DU PERSONNAGE"
          />
        )}

        {block.type === "dialogue" && (
          <input
            className="w-full text-center italic text-muted-foreground bg-transparent border-none outline-none text-xs mb-1"
            value={block.parenthetical}
            onChange={(e) =>
              onChange({ ...block, parenthetical: e.target.value })
            }
            placeholder="(parenthetique)"
          />
        )}

        <textarea
          ref={inputRef}
          className="w-full bg-transparent border-none outline-none resize-none text-sm leading-relaxed min-h-[1.5em]"
          value={getText()}
          onChange={(e) => updateText(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          rows={Math.max(1, getText().split("\n").length)}
          placeholder={
            block.type === "scene-header"
              ? "INT./EXT. LIEU - MOMENT"
              : block.type === "transition"
                ? "CUT TO:"
                : block.type === "dialogue"
                  ? "Replique..."
                  : "Description de l'action..."
          }
        />
      </div>
    </div>
  );
}
