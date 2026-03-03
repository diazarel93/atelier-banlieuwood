"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { ScriptBlock } from "./script-block";
import { ScriptToolbar } from "./script-toolbar";
import type { ScriptBlock as ScriptBlockType } from "@/lib/models/workshop";

interface ScriptEditorProps {
  slug: string;
  scriptId: string;
  blocks: ScriptBlockType[];
  onChange: (blocks: ScriptBlockType[]) => void;
}

export function ScriptEditor({
  slug,
  scriptId,
  blocks,
  onChange,
}: ScriptEditorProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [selectedText, setSelectedText] = useState("");
  const [showToolbar, setShowToolbar] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Listen for text selection
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection()?.toString().trim();
      if (selection && selection.length > 5) {
        setSelectedText(selection);
        setShowToolbar(true);
      }
    };

    document.addEventListener("mouseup", handleSelection);
    return () => document.removeEventListener("mouseup", handleSelection);
  }, []);

  const updateBlock = useCallback(
    (index: number, block: ScriptBlockType) => {
      const newBlocks = [...blocks];
      newBlocks[index] = block;
      onChange(newBlocks);
    },
    [blocks, onChange]
  );

  const deleteBlock = useCallback(
    (index: number) => {
      if (blocks.length <= 1) return;
      const newBlocks = blocks.filter((_, i) => i !== index);
      onChange(newBlocks);
      setFocusedIndex(Math.max(0, index - 1));
    },
    [blocks, onChange]
  );

  const insertAfter = useCallback(
    (index: number, type: ScriptBlockType["type"]) => {
      const newBlock: ScriptBlockType =
        type === "dialogue"
          ? {
              type: "dialogue",
              id: nanoid(10),
              characterName: "",
              parenthetical: "",
              text: "",
            }
          : { type, id: nanoid(10), text: "" };

      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      onChange(newBlocks);
      setFocusedIndex(index + 1);
    },
    [blocks, onChange]
  );

  const addBlock = (type: ScriptBlockType["type"]) => {
    insertAfter(blocks.length - 1, type);
  };

  return (
    <div className="relative">
      {/* Floating toolbar */}
      {showToolbar && selectedText && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-strong rounded-2xl p-2">
          <ScriptToolbar
            slug={slug}
            scriptId={scriptId}
            selectedText={selectedText}
            onResult={(text) => {
              // Insert AI result as new action block
              const newBlock: ScriptBlockType = {
                type: "action",
                id: nanoid(10),
                text,
              };
              onChange([...blocks, newBlock]);
              setShowToolbar(false);
              setSelectedText("");
            }}
            onClose={() => {
              setShowToolbar(false);
              setSelectedText("");
            }}
          />
        </div>
      )}

      <div ref={containerRef} className="space-y-1 pl-24 pr-8 py-8 font-mono">
        {blocks.map((block, i) => (
          <ScriptBlock
            key={block.id}
            block={block}
            isFocused={focusedIndex === i}
            onFocus={() => setFocusedIndex(i)}
            onChange={(b) => updateBlock(i, b)}
            onDelete={() => deleteBlock(i)}
            onInsertAfter={(type) => insertAfter(i, type)}
            onFocusPrev={() => setFocusedIndex(Math.max(0, i - 1))}
            onFocusNext={() =>
              setFocusedIndex(Math.min(blocks.length - 1, i + 1))
            }
          />
        ))}
      </div>

      {/* Quick add buttons */}
      <div className="flex items-center justify-center gap-2 py-4 border-t">
        <span className="text-xs text-muted-foreground mr-2">Ajouter :</span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => addBlock("scene-header")}
        >
          En-tete
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => addBlock("action")}
        >
          Action
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => addBlock("dialogue")}
        >
          Dialogue
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => addBlock("transition")}
        >
          Transition
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground pb-4">
        Enter = nouveau bloc | Tab = changer type | Backspace vide = supprimer | Fleches = naviguer
      </p>
    </div>
  );
}
