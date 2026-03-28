"use client";

import { useEffect } from "react";

interface Shortcut {
  /** Key to listen for (e.g. "n", "e", "s") */
  key: string;
  /** Modifier: none (default), meta (Cmd/Ctrl), shift */
  modifier?: "meta" | "shift" | "alt";
  /** Action to run */
  action: () => void;
  /** Description (for display in help) */
  label?: string;
}

/**
 * Register keyboard shortcuts for a page.
 * Skips shortcuts when focus is in an input, textarea, or contenteditable.
 */
export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    if (shortcuts.length === 0) return;

    function handleKey(e: KeyboardEvent) {
      // Skip when typing in form elements
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (e.target as HTMLElement).isContentEditable) {
        return;
      }

      for (const shortcut of shortcuts) {
        const wantsMeta = shortcut.modifier === "meta";
        const wantsShift = shortcut.modifier === "shift";
        const wantsAlt = shortcut.modifier === "alt";

        const metaMatch = wantsMeta ? e.metaKey || e.ctrlKey : !e.metaKey && !e.ctrlKey;
        const shiftMatch = wantsShift ? e.shiftKey : !e.shiftKey;
        const altMatch = wantsAlt ? e.altKey : !e.altKey;

        if (e.key.toLowerCase() === shortcut.key.toLowerCase() && metaMatch && shiftMatch && altMatch) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [shortcuts]);
}
