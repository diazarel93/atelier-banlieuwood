"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  AtelierSession,
  CreateAtelier,
  EvaluateRequest,
  EvaluateResponse,
} from "@/lib/models/atelier";
import type { AchievementsData } from "@/lib/models/achievements";

export function useAtelierSessions(slug: string) {
  return useQuery<AtelierSession[]>({
    queryKey: ["atelier", slug],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${slug}/atelier`);
      if (!res.ok) throw new Error("Failed to fetch atelier sessions");
      return res.json();
    },
    enabled: !!slug,
  });
}

export function useAtelierSession(slug: string, id: string) {
  return useQuery<AtelierSession>({
    queryKey: ["atelier", slug, id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${slug}/atelier/${id}`);
      if (!res.ok) throw new Error("Failed to fetch atelier session");
      return res.json();
    },
    enabled: !!slug && !!id,
  });
}

export function useCreateAtelier(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAtelier) => {
      const res = await fetch(`/api/projects/${slug}/atelier`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create atelier session");
      return res.json() as Promise<AtelierSession>;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["atelier", slug] }),
  });
}

export function useUpdateAtelier(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<AtelierSession>;
    }) => {
      const res = await fetch(`/api/projects/${slug}/atelier/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update atelier session");
      return res.json() as Promise<AtelierSession>;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["atelier", slug] });
      qc.invalidateQueries({ queryKey: ["atelier", slug, vars.id] });
    },
  });
}

export function useDeleteAtelier(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/projects/${slug}/atelier/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete atelier session");
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["atelier", slug] }),
  });
}

export function useEvaluateStep(slug: string, sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: EvaluateRequest) => {
      const res = await fetch(
        `/api/projects/${slug}/atelier/${sessionId}/evaluate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Evaluation echouee");
      }
      return res.json() as Promise<EvaluateResponse & { badge?: string | null }>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["atelier", slug, sessionId] });
      qc.invalidateQueries({ queryKey: ["atelier", slug] });
      qc.invalidateQueries({ queryKey: ["achievements", slug] });
    },
  });
}

export function useAchievements(slug: string) {
  return useQuery<AchievementsData>({
    queryKey: ["achievements", slug],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${slug}/atelier/achievements`);
      if (!res.ok) throw new Error("Failed to fetch achievements");
      return res.json();
    },
    enabled: !!slug,
  });
}
