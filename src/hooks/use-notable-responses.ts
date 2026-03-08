"use client";

import { useQuery } from "@tanstack/react-query";
import type { NotableResponses } from "@/components/v2/results/notable-responses-card";

export function useNotableResponses(sessionId: string) {
  return useQuery<NotableResponses>({
    queryKey: ["notable-responses", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/v2/notable-responses?sessionId=${sessionId}`);
      if (!res.ok) return { mostVoted: null, mostCreative: null, mostDivisive: null };
      return res.json();
    },
    staleTime: 60_000,
  });
}
