"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Episode,
  CreateEpisode,
  ProductionNote,
  CreateProductionNote,
} from "@/lib/models/war-room";

// ── Episodes ────────────────────────────────────────────────────

export function useEpisodes(slug: string) {
  return useQuery<Episode[]>({
    queryKey: ["episodes", slug],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${slug}/war-room/episodes`);
      if (!res.ok) throw new Error("Failed to fetch episodes");
      return res.json();
    },
    enabled: !!slug,
  });
}

export function useEpisode(slug: string, id: string) {
  return useQuery<Episode>({
    queryKey: ["episodes", slug, id],
    queryFn: async () => {
      const res = await fetch(
        `/api/projects/${slug}/war-room/episodes/${id}`
      );
      if (!res.ok) throw new Error("Failed to fetch episode");
      return res.json();
    },
    enabled: !!slug && !!id,
  });
}

export function useCreateEpisode(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateEpisode) => {
      const res = await fetch(`/api/projects/${slug}/war-room/episodes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create episode");
      return res.json() as Promise<Episode>;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["episodes", slug] }),
  });
}

export function useUpdateEpisode(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Episode>;
    }) => {
      const res = await fetch(
        `/api/projects/${slug}/war-room/episodes/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) throw new Error("Failed to update episode");
      return res.json() as Promise<Episode>;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["episodes", slug] });
      qc.invalidateQueries({ queryKey: ["episodes", slug, vars.id] });
    },
  });
}

export function useDeleteEpisode(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(
        `/api/projects/${slug}/war-room/episodes/${id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete episode");
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["episodes", slug] }),
  });
}

// ── Production Notes ────────────────────────────────────────────

export function useNotes(slug: string) {
  return useQuery<ProductionNote[]>({
    queryKey: ["notes", slug],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${slug}/war-room/notes`);
      if (!res.ok) throw new Error("Failed to fetch notes");
      return res.json();
    },
    enabled: !!slug,
  });
}

export function useCreateNote(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateProductionNote) => {
      const res = await fetch(`/api/projects/${slug}/war-room/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create note");
      return res.json() as Promise<ProductionNote>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes", slug] }),
  });
}

export function useUpdateNote(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<ProductionNote>;
    }) => {
      const res = await fetch(
        `/api/projects/${slug}/war-room/notes/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) throw new Error("Failed to update note");
      return res.json() as Promise<ProductionNote>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes", slug] }),
  });
}

export function useDeleteNote(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(
        `/api/projects/${slug}/war-room/notes/${id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete note");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes", slug] }),
  });
}
