"use client";

import { useMutation } from "@tanstack/react-query";

interface AiRequest {
  slug: string;
  action: string;
  characterId?: string;
  prompt?: string;
}

export function useAi() {
  return useMutation({
    mutationFn: async ({ slug, action, characterId, prompt }: AiRequest) => {
      const res = await fetch(`/api/projects/${slug}/ai/character-voice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, characterId, prompt }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "AI generation failed");
      }
      const data = await res.json();
      return data.result as string;
    },
  });
}
