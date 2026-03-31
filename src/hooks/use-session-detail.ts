"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRealtimeInvalidation, getPollingInterval } from "@/hooks/use-realtime-invalidation";
import { getModuleByDb, getPhaseForModule } from "@/lib/modules-data";
import { getModuleGuide } from "@/lib/guide-data";
import { getSessionState, getSessionUrls } from "@/lib/session-state";
import { DEMO_STUDENT_NAMES } from "@/lib/demo-data";
import { toast } from "sonner";

export interface SessionDetailData {
  id: string;
  title: string;
  status: string;
  level: string;
  join_code: string;
  current_module: number;
  current_seance: number;
  current_situation_index: number;
  template: string | null;
  thematique: string | null;
  scheduled_at: string | null;
  class_label: string | null;
  completed_modules: string[];
  teacher_notes: string | null;
  deleted_at: string | null;
  students: {
    id: string;
    display_name: string;
    avatar: string;
    is_active: boolean;
  }[];
  created_at: string;
  studentCount: number;
}

export interface SessionEditPayload {
  title?: string;
  class_label?: string | null;
  level?: string;
  scheduled_at?: string | null;
  thematique?: string | null;
}

export function useSessionDetail(id: string) {
  const queryClient = useQueryClient();
  const { status: realtimeStatus } = useRealtimeInvalidation(id);

  const query = useQuery<SessionDetailData>({
    queryKey: ["session", id],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${id}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Erreur ${res.status}`);
      }
      return res.json();
    },
    enabled: !!id,
    retry: 1,
    refetchInterval: getPollingInterval(realtimeStatus, 10_000, 30_000),
  });

  const session = query.data;

  const currentModule = session ? (getModuleByDb(session.current_module, session.current_seance) ?? null) : null;
  const currentPhase = currentModule ? (getPhaseForModule(currentModule.id) ?? null) : null;
  const guide = currentModule ? (getModuleGuide(currentModule.id) ?? null) : null;
  const sessionState = session ? getSessionState(session.status) : null;
  const sessionUrls = session ? getSessionUrls(session.id, session.status) : null;
  const joinUrl = typeof window !== "undefined" ? `${window.location.origin}/join` : "https://banlieuwood.fr/join";

  const activeStudents = session?.students?.filter((s) => s.is_active) ?? [];
  const demoStudents = activeStudents.filter((s) => DEMO_STUDENT_NAMES.includes(s.display_name));
  const realStudents = activeStudents.filter((s) => !DEMO_STUDENT_NAMES.includes(s.display_name));
  const hasDemoStudents = demoStudents.length > 0;

  const activateDemo = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/sessions/${id}/demo`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erreur" }));
        throw new Error(err.error || "Erreur");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(`${data.students.length} élèves virtuels ont rejoint !`);
      queryClient.invalidateQueries({ queryKey: ["session", id] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deactivateDemo = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/sessions/${id}/demo`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erreur" }));
        throw new Error(err.error || "Erreur");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(`${data.deleted} élèves virtuels supprimés`);
      queryClient.invalidateQueries({ queryKey: ["session", id] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const duplicateSession = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/sessions/${id}/duplicate`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erreur" }));
        throw new Error(err.error || "Erreur lors de la duplication");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Séance dupliquée avec succès");
      queryClient.invalidateQueries({ queryKey: ["v2", "sessions"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateSession = useMutation({
    mutationFn: async (payload: SessionEditPayload) => {
      const res = await fetch(`/api/sessions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erreur" }));
        throw new Error(err.error || "Erreur lors de la mise à jour");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Séance mise à jour");
      queryClient.invalidateQueries({ queryKey: ["session", id] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const archiveSession = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erreur" }));
        throw new Error(err.error || "Erreur lors de l'archivage");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Séance archivée");
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateNotes = useMutation({
    mutationFn: async (teacher_notes: string) => {
      const res = await fetch(`/api/sessions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacher_notes: teacher_notes || null }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erreur" }));
        throw new Error(err.error || "Erreur lors de la sauvegarde des notes");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session", id] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return {
    session,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    currentModule,
    currentPhase,
    guide,
    sessionState,
    sessionUrls,
    joinUrl,
    activeStudents,
    demoStudents,
    realStudents,
    hasDemoStudents,
    activateDemo,
    deactivateDemo,
    duplicateSession,
    updateSession,
    archiveSession,
    updateNotes,
  };
}
