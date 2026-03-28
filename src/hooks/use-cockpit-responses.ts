"use client";

import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import type { Response } from "@/hooks/use-pilot-session";

type ResponseFilter = "all" | "visible" | "highlighted";
type ResponseSortMode = "time" | "highlighted";

interface ResponsesState {
  filteredResponses: Response[];
  responseFilter: ResponseFilter;
  setResponseFilter: (f: ResponseFilter) => void;
  responseSortMode: ResponseSortMode;
  setResponseSortMode: (m: ResponseSortMode) => void;
  selectedResponseIds: Set<string>;
  setSelectedResponseIds: (ids: Set<string>) => void;
  reformulating: Response | null;
  setReformulating: (r: Response | null) => void;
  handleHighlightAllVisible: () => void;
  handleClearAllHighlights: () => void;
  handleHighlightBoth: (idA: string, idB: string) => void;
}

export function useCockpitResponses(
  responses: Response[],
  highlightResponse: { mutate: (args: { responseId: string; highlighted: boolean }) => void },
): ResponsesState {
  const [responseFilter, setResponseFilter] = useState<ResponseFilter>("all");
  const [responseSortMode, setResponseSortMode] = useState<ResponseSortMode>("time");
  const [selectedResponseIds, setSelectedResponseIds] = useState<Set<string>>(new Set());
  const [reformulating, setReformulating] = useState<Response | null>(null);

  const filteredResponses = useMemo(() => {
    let filtered = responses;
    if (responseFilter === "visible") filtered = filtered.filter((r) => !r.is_hidden);
    else if (responseFilter === "highlighted") filtered = filtered.filter((r) => r.is_highlighted);
    if (responseSortMode === "highlighted") {
      filtered = [...filtered].sort((a, b) => {
        if (a.is_highlighted && !b.is_highlighted) return -1;
        if (!a.is_highlighted && b.is_highlighted) return 1;
        if (a.is_hidden && !b.is_hidden) return 1;
        if (!a.is_hidden && b.is_hidden) return -1;
        return 0;
      });
    }
    return filtered;
  }, [responses, responseFilter, responseSortMode]);

  const handleHighlightAllVisible = useCallback(() => {
    const toHighlight = responses.filter((r) => !r.is_hidden && !r.is_highlighted);
    for (const r of toHighlight) highlightResponse.mutate({ responseId: r.id, highlighted: true });
    toast.success(
      `${toHighlight.length} réponse${toHighlight.length > 1 ? "s" : ""} projetée${toHighlight.length > 1 ? "s" : ""}`,
    );
  }, [responses, highlightResponse]);

  const handleClearAllHighlights = useCallback(() => {
    const highlighted = responses.filter((r) => r.is_highlighted);
    for (const r of highlighted) highlightResponse.mutate({ responseId: r.id, highlighted: false });
    toast.success(
      `${highlighted.length} réponse${highlighted.length > 1 ? "s" : ""} dé-projetée${highlighted.length > 1 ? "s" : ""}`,
    );
  }, [responses, highlightResponse]);

  const handleHighlightBoth = useCallback(
    (idA: string, idB: string) => {
      highlightResponse.mutate({ responseId: idA, highlighted: true });
      highlightResponse.mutate({ responseId: idB, highlighted: true });
      toast.success("2 réponses projetées pour comparaison");
    },
    [highlightResponse],
  );

  return {
    filteredResponses,
    responseFilter,
    setResponseFilter,
    responseSortMode,
    setResponseSortMode,
    selectedResponseIds,
    setSelectedResponseIds,
    reformulating,
    setReformulating,
    handleHighlightAllVisible,
    handleClearAllHighlights,
    handleHighlightBoth,
  };
}
