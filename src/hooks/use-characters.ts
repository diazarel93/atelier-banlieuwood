"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Character, CreateCharacter } from "@/lib/models/character";

export function useCharacters(slug: string) {
  return useQuery<Character[]>({
    queryKey: ["characters", slug],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${slug}/characters`);
      if (!res.ok) throw new Error("Failed to fetch characters");
      return res.json();
    },
    enabled: !!slug,
  });
}

export function useCharacter(slug: string, id: string) {
  return useQuery<Character>({
    queryKey: ["characters", slug, id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${slug}/characters/${id}`);
      if (!res.ok) throw new Error("Failed to fetch character");
      return res.json();
    },
    enabled: !!slug && !!id,
  });
}

export function useCreateCharacter(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCharacter) => {
      const res = await fetch(`/api/projects/${slug}/characters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create character");
      return res.json() as Promise<Character>;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["characters", slug] }),
  });
}

export function useUpdateCharacter(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateCharacter>;
    }) => {
      const res = await fetch(`/api/projects/${slug}/characters/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update character");
      return res.json() as Promise<Character>;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["characters", slug] });
      queryClient.invalidateQueries({
        queryKey: ["characters", slug, vars.id],
      });
    },
  });
}

export function useDeleteCharacter(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/projects/${slug}/characters/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete character");
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["characters", slug] }),
  });
}
