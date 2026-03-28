"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import type { Session } from "@/hooks/use-pilot-session";

interface PreviewState {
  previewIndex: number | null;
  setPreviewIndex: (index: number | null) => void;
  isPreviewing: boolean;
  displayIndex: number;
  autoAdvance: boolean;
  setAutoAdvance: (v: boolean) => void;
  autoAdvanceCountdown: number;
  allSituations: { position: number; category: string; restitutionLabel: string; prompt: string }[];
  goToSituation: (index: number) => void;
  nextSituation: () => void;
  prevSituation: () => void;
  skipSituation: () => void;
}

export function useCockpitPreview(
  session: Session,
  canGoNext: boolean,
  maxSituations: number,
  allResponded: boolean,
  updateSession: { mutate: (updates: Record<string, unknown>) => void },
): PreviewState {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState(0);
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentQIndex = session.current_situation_index || 0;
  const isPreviewing = previewIndex !== null && previewIndex !== currentQIndex;
  const displayIndex = previewIndex ?? currentQIndex;

  // Situations preview data
  const [allSituations, setAllSituations] = useState<
    { position: number; category: string; restitutionLabel: string; prompt: string }[]
  >([]);
  const { data: situationsPreviewData } = useQuery<{ situations: typeof allSituations }>({
    queryKey: ["situations-preview", session?.id, session?.current_module, session?.current_seance],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${session.id}/situations-preview`);
      if (!res.ok) return { situations: [] };
      return res.json();
    },
    enabled: !!session?.id,
    staleTime: 60_000,
  });
  useEffect(() => {
    if (situationsPreviewData?.situations) setAllSituations(situationsPreviewData.situations);
  }, [situationsPreviewData]);

  // Reset preview when live index catches up
  useEffect(() => {
    if (previewIndex !== null && previewIndex === currentQIndex) setPreviewIndex(null);
  }, [currentQIndex, previewIndex]);

  // Auto-advance when all responded
  useEffect(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    setAutoAdvanceCountdown(0);
    if (!autoAdvance || !allResponded || session.status !== "responding") return;
    let remaining = 4;
    setAutoAdvanceCountdown(remaining);
    const countdownInterval = setInterval(() => {
      remaining -= 1;
      setAutoAdvanceCountdown(remaining);
      if (remaining <= 0) clearInterval(countdownInterval);
    }, 1000);
    autoAdvanceTimerRef.current = setTimeout(() => {
      if (currentQIndex < maxSituations - 1) goToSituation(currentQIndex + 1);
    }, 4000);
    return () => {
      clearInterval(countdownInterval);
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoAdvance, allResponded, session.status]);

  // Navigation
  const goToSituation = useCallback(
    (index: number) => {
      setPreviewIndex(null);
      updateSession.mutate({
        current_situation_index: index,
        status: "responding",
        timer_ends_at: null,
        reveal_phase: null,
      });
    },
    [updateSession],
  );

  const nextSituation = useCallback(() => {
    if (!canGoNext) return;
    goToSituation(session.current_situation_index + 1);
  }, [canGoNext, session.current_situation_index, goToSituation]);

  const prevSituation = useCallback(() => {
    const idx = session.current_situation_index || 0;
    if (idx <= 0) return;
    goToSituation(idx - 1);
    toast("Retour à la question précédente");
  }, [session.current_situation_index, goToSituation]);

  const skipSituation = useCallback(() => {
    if (!canGoNext) return;
    goToSituation(session.current_situation_index + 1);
    toast("Question passée");
  }, [canGoNext, session.current_situation_index, goToSituation]);

  return {
    previewIndex,
    setPreviewIndex,
    isPreviewing,
    displayIndex,
    autoAdvance,
    setAutoAdvance,
    autoAdvanceCountdown,
    allSituations,
    goToSituation,
    nextSituation,
    prevSituation,
    skipSituation,
  };
}
