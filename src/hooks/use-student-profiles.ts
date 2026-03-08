"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxesScores } from "@/lib/axes-mapping";

// ── List types ──

export interface StudentProfileSummary {
  profileId: string;
  displayName: string;
  avatar: string | null;
  classLabel: string | null;
  sessionCount: number;
  lastActiveAt: string;
  totalResponses: number;
}

// ── Detail types ──

interface SessionHistoryEntry {
  sessionId: string;
  sessionTitle: string;
  classLabel: string | null;
  date: string;
  scores: AxesScores;
}

interface RecentResponse {
  id: string;
  situationLabel: string;
  textResponse: string | null;
  aiScore: number | null;
  responseTimeMs: number | null;
  createdAt: string;
}

interface TeacherNote {
  id: string;
  note_type: string;
  content: string;
  session_id: string | null;
  created_at: string;
}

interface Achievement {
  id: string;
  name: string;
  tier: string;
  unlockedAt: string;
}

export interface StudentProfileDetail {
  profileId: string;
  displayName: string;
  avatar: string | null;
  sessionCount: number;
  totalResponses: number;
  scores: AxesScores;
  sessionHistory: SessionHistoryEntry[];
  recentResponses: RecentResponse[];
  achievements: Achievement[];
  notes: TeacherNote[];
}

// ── Hooks ──

export function useStudentProfiles(classLabel?: string | null) {
  return useQuery<{ profiles: StudentProfileSummary[] }>({
    queryKey: ["v2", "student-profiles", classLabel ?? null],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (classLabel) params.set("classLabel", classLabel);
      const qs = params.toString();
      const res = await fetch(
        `/api/v2/student-profiles${qs ? `?${qs}` : ""}`
      );
      if (!res.ok) throw new Error("Erreur chargement élèves");
      return res.json();
    },
    staleTime: 30_000,
  });
}

export function useStudentProfile(profileId: string) {
  return useQuery<StudentProfileDetail>({
    queryKey: ["v2", "student-profile", profileId],
    queryFn: async () => {
      const res = await fetch(`/api/v2/student-profiles/${profileId}`);
      if (!res.ok) throw new Error("Erreur chargement profil élève");
      return res.json();
    },
    enabled: !!profileId,
    staleTime: 30_000,
  });
}

export function useCreateNote(profileId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      noteType: string;
      content: string;
      sessionId?: string;
    }) => {
      const res = await fetch(`/api/v2/student-profiles/${profileId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erreur" }));
        throw new Error(err.error || "Erreur lors de la création de la note");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Note ajoutée");
      queryClient.invalidateQueries({
        queryKey: ["v2", "student-profile", profileId],
      });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteNote(profileId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      const res = await fetch(
        `/api/v2/student-profiles/${profileId}/notes?noteId=${noteId}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erreur" }));
        throw new Error(err.error || "Erreur lors de la suppression");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Note supprimée");
      queryClient.invalidateQueries({
        queryKey: ["v2", "student-profile", profileId],
      });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
