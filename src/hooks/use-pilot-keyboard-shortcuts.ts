"use client";

import { useEffect } from "react";

interface UsePilotKeyboardShortcutsProps {
  sessionStatus: string;
  responsesCount: number;
  onPauseToggle: () => void;
  onShowBroadcast: () => void;
  onShowExport: () => void;
  onShowCompare: () => void;
  onToggleShortcuts: () => void;
  onCloseAll: () => void;
  onNextAction?: () => void;
  onToggleFocus?: () => void;
  onToggleIntervention?: () => void;
  onTimerShortcut?: () => void;
  onSetTimerPreset?: (n: number) => void;
  timerModeActive?: boolean;
}

/**
 * Handles keyboard shortcuts for the pilot cockpit.
 * Space = pause/resume, B = broadcast, E = export, C = compare, ? = shortcuts, Esc = close all.
 */
export function usePilotKeyboardShortcuts({
  sessionStatus,
  responsesCount,
  onPauseToggle,
  onShowBroadcast,
  onShowExport,
  onShowCompare,
  onToggleShortcuts,
  onCloseAll,
  onNextAction,
  onToggleFocus,
  onToggleIntervention,
  onTimerShortcut,
  onSetTimerPreset,
  timerModeActive,
}: UsePilotKeyboardShortcutsProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case " ": // Space = pause/resume
          e.preventDefault();
          onPauseToggle();
          break;
        case "b": // B = broadcast
          e.preventDefault();
          onShowBroadcast();
          break;
        case "e": // E = export
          e.preventDefault();
          onShowExport();
          break;
        case "c": // C = compare
          if (responsesCount >= 2) { e.preventDefault(); onShowCompare(); }
          break;
        case "n": // N = next action
          if (onNextAction && sessionStatus !== "done" && sessionStatus !== "paused") {
            e.preventDefault();
            onNextAction();
          }
          break;
        case "f": // F = toggle focus mode
          if (onToggleFocus) {
            e.preventDefault();
            onToggleFocus();
          }
          break;
        case "h": // H = toggle intervention/help mode
          if (onToggleIntervention) {
            e.preventDefault();
            onToggleIntervention();
          }
          break;
        case "t": // T = timer mode
          if (onTimerShortcut) {
            e.preventDefault();
            onTimerShortcut();
          }
          break;
        case "1": case "2": case "3": case "4": case "5": // Timer presets
          if (timerModeActive && onSetTimerPreset) {
            e.preventDefault();
            onSetTimerPreset(parseInt(e.key));
          }
          break;
        case "?": // ? = shortcuts help
          e.preventDefault();
          onToggleShortcuts();
          break;
        case "Escape":
          onCloseAll();
          break;
      }
    }
    function handleBroadcastEvent() { onShowBroadcast(); }
    function handleShortcutsEvent() { onToggleShortcuts(); }
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pilot-broadcast", handleBroadcastEvent);
    window.addEventListener("pilot-shortcuts", handleShortcutsEvent);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pilot-broadcast", handleBroadcastEvent);
      window.removeEventListener("pilot-shortcuts", handleShortcutsEvent);
    };
  }, [sessionStatus, responsesCount, onPauseToggle, onShowBroadcast, onShowExport, onShowCompare, onToggleShortcuts, onCloseAll, onNextAction, onToggleFocus, onToggleIntervention, onTimerShortcut, onSetTimerPreset, timerModeActive]);
}
