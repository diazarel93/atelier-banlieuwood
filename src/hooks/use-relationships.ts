"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Relationship, CreateRelationship } from "@/lib/models/relationship";

export function useRelationships(slug: string) {
  return useQuery<Relationship[]>({
    queryKey: ["relationships", slug],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${slug}/relationships`);
      if (!res.ok) throw new Error("Failed to fetch relationships");
      return res.json();
    },
    enabled: !!slug,
  });
}

export function useCreateRelationship(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateRelationship) => {
      const res = await fetch(`/api/projects/${slug}/relationships`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create relationship");
      return res.json() as Promise<Relationship>;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["relationships", slug] }),
  });
}

export function useDeleteRelationship(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/projects/${slug}/relationships?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete relationship");
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["relationships", slug] }),
  });
}
