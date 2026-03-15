"use client";

import { useState, useCallback } from "react";

/**
 * All modal/overlay visibility state for the cockpit.
 * Extracted from CockpitContent for clarity.
 */
export function useCockpitModals() {
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastPrefill, setBroadcastPrefill] = useState("");
  const [broadcastTitle, setBroadcastTitle] = useState<string | undefined>();
  const [broadcastIcon, setBroadcastIcon] = useState<string | undefined>();
  const [showExport, setShowExport] = useState(false);
  const [spotlightResponse, setSpotlightResponse] = useState<{
    studentName: string;
    studentAvatar: string;
    text: string;
    score?: number | null;
    highlighted?: boolean;
  } | null>(null);
  const [showDebate, setShowDebate] = useState(false);
  const [showWordCloud, setShowWordCloud] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [showRevealAnswer, setShowRevealAnswer] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [kickTarget, setKickTarget] = useState<{ id: string; name: string } | null>(null);

  const openBroadcast = useCallback(() => {
    setBroadcastPrefill("");
    setBroadcastTitle(undefined);
    setBroadcastIcon(undefined);
    setShowBroadcast(true);
  }, []);

  const openBroadcastWith = useCallback((prefill: string, title?: string, icon?: string) => {
    setBroadcastPrefill(prefill);
    setBroadcastTitle(title);
    setBroadcastIcon(icon);
    setShowBroadcast(true);
  }, []);

  const closeAllModals = useCallback(() => {
    setShowBroadcast(false);
    setShowExport(false);
    setShowCompare(false);
    setShowShortcuts(false);
    setShowRevealAnswer(false);
    setShowDebate(false);
    setShowWordCloud(false);
    setSpotlightResponse(null);
  }, []);

  return {
    showBroadcast,
    setShowBroadcast,
    broadcastPrefill,
    broadcastTitle,
    broadcastIcon,
    openBroadcast,
    openBroadcastWith,
    showExport,
    setShowExport,
    spotlightResponse,
    setSpotlightResponse,
    showDebate,
    setShowDebate,
    showWordCloud,
    setShowWordCloud,
    showCompare,
    setShowCompare,
    showRevealAnswer,
    setShowRevealAnswer,
    showShortcuts,
    setShowShortcuts,
    kickTarget,
    setKickTarget,
    closeAllModals,
  };
}
