"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  TableReadSession,
  CreateTableRead,
  Scene,
  CreateScene,
  Script,
  CreateScript,
  ConflictAnalysis,
  CreateConflict,
} from "@/lib/models/workshop";

// ── Table Reads ─────────────────────────────────────────────────

export function useTableReads(slug: string) {
  return useQuery<TableReadSession[]>({
    queryKey: ["table-reads", slug],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${slug}/workshop/table-reads`);
      if (!res.ok) throw new Error("Failed to fetch table reads");
      return res.json();
    },
    enabled: !!slug,
  });
}

export function useTableRead(slug: string, id: string) {
  return useQuery<TableReadSession>({
    queryKey: ["table-reads", slug, id],
    queryFn: async () => {
      const res = await fetch(
        `/api/projects/${slug}/workshop/table-reads/${id}`
      );
      if (!res.ok) throw new Error("Failed to fetch table read");
      return res.json();
    },
    enabled: !!slug && !!id,
  });
}

export function useCreateTableRead(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateTableRead) => {
      const res = await fetch(`/api/projects/${slug}/workshop/table-reads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create table read");
      return res.json() as Promise<TableReadSession>;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["table-reads", slug] }),
  });
}

export function useUpdateTableRead(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<TableReadSession>;
    }) => {
      const res = await fetch(
        `/api/projects/${slug}/workshop/table-reads/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) throw new Error("Failed to update table read");
      return res.json() as Promise<TableReadSession>;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["table-reads", slug] });
      qc.invalidateQueries({ queryKey: ["table-reads", slug, vars.id] });
    },
  });
}

export function useDeleteTableRead(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(
        `/api/projects/${slug}/workshop/table-reads/${id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete table read");
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["table-reads", slug] }),
  });
}

// ── Scenes ──────────────────────────────────────────────────────

export function useScenes(slug: string) {
  return useQuery<Scene[]>({
    queryKey: ["scenes", slug],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${slug}/workshop/scenes`);
      if (!res.ok) throw new Error("Failed to fetch scenes");
      return res.json();
    },
    enabled: !!slug,
  });
}

export function useScene(slug: string, id: string) {
  return useQuery<Scene>({
    queryKey: ["scenes", slug, id],
    queryFn: async () => {
      const res = await fetch(
        `/api/projects/${slug}/workshop/scenes/${id}`
      );
      if (!res.ok) throw new Error("Failed to fetch scene");
      return res.json();
    },
    enabled: !!slug && !!id,
  });
}

export function useCreateScene(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateScene) => {
      const res = await fetch(`/api/projects/${slug}/workshop/scenes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create scene");
      return res.json() as Promise<Scene>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scenes", slug] }),
  });
}

export function useUpdateScene(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Scene> }) => {
      const res = await fetch(
        `/api/projects/${slug}/workshop/scenes/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) throw new Error("Failed to update scene");
      return res.json() as Promise<Scene>;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["scenes", slug] });
      qc.invalidateQueries({ queryKey: ["scenes", slug, vars.id] });
    },
  });
}

export function useDeleteScene(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(
        `/api/projects/${slug}/workshop/scenes/${id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete scene");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scenes", slug] }),
  });
}

// ── Scripts ─────────────────────────────────────────────────────

export function useScripts(slug: string) {
  return useQuery<Script[]>({
    queryKey: ["scripts", slug],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${slug}/workshop/scripts`);
      if (!res.ok) throw new Error("Failed to fetch scripts");
      return res.json();
    },
    enabled: !!slug,
  });
}

export function useScript(slug: string, id: string) {
  return useQuery<Script>({
    queryKey: ["scripts", slug, id],
    queryFn: async () => {
      const res = await fetch(
        `/api/projects/${slug}/workshop/scripts/${id}`
      );
      if (!res.ok) throw new Error("Failed to fetch script");
      return res.json();
    },
    enabled: !!slug && !!id,
  });
}

export function useCreateScript(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateScript) => {
      const res = await fetch(`/api/projects/${slug}/workshop/scripts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create script");
      return res.json() as Promise<Script>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scripts", slug] }),
  });
}

export function useUpdateScript(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Script>;
    }) => {
      const res = await fetch(
        `/api/projects/${slug}/workshop/scripts/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) throw new Error("Failed to update script");
      return res.json() as Promise<Script>;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["scripts", slug] });
      qc.invalidateQueries({ queryKey: ["scripts", slug, vars.id] });
    },
  });
}

export function useDeleteScript(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(
        `/api/projects/${slug}/workshop/scripts/${id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete script");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scripts", slug] }),
  });
}

// ── Conflicts ───────────────────────────────────────────────────

export function useConflicts(slug: string) {
  return useQuery<ConflictAnalysis[]>({
    queryKey: ["conflicts", slug],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${slug}/workshop/conflicts`);
      if (!res.ok) throw new Error("Failed to fetch conflicts");
      return res.json();
    },
    enabled: !!slug,
  });
}

export function useConflict(slug: string, id: string) {
  return useQuery<ConflictAnalysis>({
    queryKey: ["conflicts", slug, id],
    queryFn: async () => {
      const res = await fetch(
        `/api/projects/${slug}/workshop/conflicts/${id}`
      );
      if (!res.ok) throw new Error("Failed to fetch conflict");
      return res.json();
    },
    enabled: !!slug && !!id,
  });
}

export function useCreateConflict(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateConflict) => {
      const res = await fetch(`/api/projects/${slug}/workshop/conflicts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create conflict");
      return res.json() as Promise<ConflictAnalysis>;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["conflicts", slug] }),
  });
}

export function useUpdateConflict(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<ConflictAnalysis>;
    }) => {
      const res = await fetch(
        `/api/projects/${slug}/workshop/conflicts/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) throw new Error("Failed to update conflict");
      return res.json() as Promise<ConflictAnalysis>;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["conflicts", slug] });
      qc.invalidateQueries({ queryKey: ["conflicts", slug, vars.id] });
    },
  });
}

export function useDeleteConflict(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(
        `/api/projects/${slug}/workshop/conflicts/${id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete conflict");
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["conflicts", slug] }),
  });
}
