"use client";

import { useQuery } from "@tanstack/react-query";

export interface QuestionAnalyticsItem {
  situationId: string;
  module: string | null;
  category: string | null;
  label: string;
  responseCount: number;
  avgAiScore: number | null;
  avgResponseTimeMs: number | null;
}

interface QuestionAnalyticsData {
  questions: QuestionAnalyticsItem[];
}

export function useQuestionAnalytics(sessionId?: string | null, classLabel?: string | null) {
  return useQuery<QuestionAnalyticsData>({
    queryKey: ["v2", "question-analytics", sessionId ?? null, classLabel ?? null],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (sessionId) params.set("sessionId", sessionId);
      if (classLabel) params.set("classLabel", classLabel);
      const qs = params.toString();
      const res = await fetch(`/api/v2/question-analytics${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error("Erreur chargement analytics");
      return res.json();
    },
    staleTime: 30_000,
  });
}
