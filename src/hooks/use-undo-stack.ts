"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

interface UndoEntry {
  id: string;
  label: string;
  undo: () => void | Promise<void>;
  redo: () => void | Promise<void>;
  timestamp: number;
}

const MAX_STACK_SIZE = 10;

/**
 * Undo/redo stack for pilot cockpit actions.
 *
 * Supports only client-safe, reversible actions:
 * hide/unhide, vote option toggle, score, comment, highlight.
 *
 * Does NOT support irrecoverable mutations (removeStudent, resetAll).
 *
 * Ctrl+Z / Cmd+Z triggers undo, Ctrl+Shift+Z / Cmd+Shift+Z triggers redo.
 */
export function useUndoStack() {
  const [undoStack, setUndoStack] = useState<UndoEntry[]>([]);
  const [redoStack, setRedoStack] = useState<UndoEntry[]>([]);

  const push = useCallback((entry: Omit<UndoEntry, "id" | "timestamp">) => {
    const full: UndoEntry = {
      ...entry,
      id:
        typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      timestamp: Date.now(),
    };
    setUndoStack((prev) => [...prev.slice(-(MAX_STACK_SIZE - 1)), full]);
    setRedoStack([]); // clear redo on new action
  }, []);

  const undo = useCallback(async () => {
    setUndoStack((prev) => {
      if (prev.length === 0) return prev;
      const entry = prev[prev.length - 1];
      const rest = prev.slice(0, -1);

      // Execute undo — surface errors to user
      Promise.resolve(entry.undo()).catch(() => {
        toast.error("Erreur lors de l'annulation");
      });
      setRedoStack((r) => [...r, entry]);

      toast("Action annulée", {
        description: entry.label,
        action: {
          label: "Refaire",
          onClick: () => {
            Promise.resolve(entry.redo()).catch((_err) => {
              toast.error("Erreur lors du rétablissement");
            });
            setRedoStack((r) => r.filter((e) => e.id !== entry.id));
            setUndoStack((u) => {
              // Only re-add if redo stack was not already cleared by a new push()
              if (u.length > 0 && u[u.length - 1].id === entry.id) return u;
              return [...u, entry];
            });
          },
        },
      });

      return rest;
    });
  }, []);

  const redo = useCallback(async () => {
    setRedoStack((prev) => {
      if (prev.length === 0) return prev;
      const entry = prev[prev.length - 1];
      const rest = prev.slice(0, -1);

      Promise.resolve(entry.redo()).catch(() => {});
      setUndoStack((u) => [...u, entry]);

      return rest;
    });
  }, []);

  // Keyboard shortcut: Ctrl+Z / Cmd+Z
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const isUndo = (e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey;
      const isRedo = (e.metaKey || e.ctrlKey) && e.key === "z" && e.shiftKey;

      if (isUndo) {
        e.preventDefault();
        undo();
      } else if (isRedo) {
        e.preventDefault();
        redo();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  return {
    push,
    undo,
    redo,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    undoCount: undoStack.length,
    redoCount: redoStack.length,
  };
}
