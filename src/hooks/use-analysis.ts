"use client";

import { useQuery, useMutation } from "@tanstack/react-query";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnalysisData = any;

export function useCharacterAudit(slug: string) {
  return useQuery<AnalysisData>({
    queryKey: ["analysis", "characters", slug],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${slug}/analysis/characters`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!slug,
  });
}

export function useRelationshipAnalysis(slug: string) {
  return useQuery<AnalysisData>({
    queryKey: ["analysis", "relationships", slug],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${slug}/analysis/relationships`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!slug,
  });
}

export function useWorkshopStats(slug: string) {
  return useQuery<AnalysisData>({
    queryKey: ["analysis", "workshop", slug],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${slug}/analysis/workshop`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!slug,
  });
}

export function useCoherenceCheck(slug: string) {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/projects/${slug}/analysis/coherence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
}
