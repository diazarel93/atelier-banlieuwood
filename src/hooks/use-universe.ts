"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UniverseData } from "@/lib/models/universe";

export function useUniverse(slug: string) {
  return useQuery<UniverseData>({
    queryKey: ["universe", slug],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${slug}/universe`);
      if (!res.ok) throw new Error("Failed to fetch universe");
      return res.json();
    },
    enabled: !!slug,
  });
}

export function useAddUniverseItem(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { type: string; [key: string]: unknown }) => {
      const res = await fetch(`/api/projects/${slug}/universe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add item");
      return res.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["universe", slug] }),
  });
}

export function useDeleteUniverseItem(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ type, id }: { type: string; id: string }) => {
      const res = await fetch(
        `/api/projects/${slug}/universe?type=${type}&id=${id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete item");
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["universe", slug] }),
  });
}
