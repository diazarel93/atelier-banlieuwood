"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getModuleByDb } from "@/lib/modules-data";
import { logAudit, type AuditAction } from "@/lib/audit-log";

// ── Types ──

export interface Session {
  id: string;
  title: string;
  level: string;
  status: string;
  join_code: string;
  current_module: number;
  current_seance: number;
  current_situation_index: number;
  timer_ends_at: string | null;
  completed_modules: string[];
  sharing_enabled: boolean;
  help_enabled: boolean;
  mute_sounds: boolean;
  reveal_phase: number | null;
  students: Student[];
}

export interface Student {
  id: string;
  display_name: string;
  avatar: string;
  is_active: boolean;
  last_seen_at: string;
  warnings: number;
  kicked: boolean;
  hand_raised_at?: string | null;
}

export interface Response {
  id: string;
  student_id: string;
  situation_id: string;
  text: string;
  submitted_at: string;
  is_hidden: boolean;
  is_vote_option: boolean;
  is_highlighted: boolean;
  teacher_comment: string | null;
  teacher_score?: number;
  ai_score?: number;
  ai_feedback?: string | null;
  reset_at?: string | null;
  previous_text?: string | null;
  students: { display_name: string; avatar: string };
}

export interface VoteResult {
  response: { id: string; text: string; students: { display_name: string; avatar: string } };
  count: number;
  voters: { display_name: string; avatar: string }[];
}

export type CollectiveChoice = import("@/components/pilot/choices-history").CollectiveChoice;

// ── Hook ──

export function usePilotSession(sessionId: string, checkingAuth: boolean, actorId: string = "system") {
  const queryClient = useQueryClient();

  // ── Queries ──

  const { data: session, isLoading: sessionLoading } = useQuery<Session>({
    queryKey: ["pilot-session", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}`);
      if (!res.ok) throw new Error("Session introuvable");
      return res.json();
    },
    refetchInterval: 10_000,
    enabled: !checkingAuth,
  });

  const { data: teams } = useQuery<
    { id: string; team_name: string; team_color: string; team_number: number; students: { id: string; display_name: string; avatar: string }[] }[]
  >({
    queryKey: ["pilot-teams", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}/teams`);
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 15_000,
    enabled: !checkingAuth && !!session,
  });

  // Determine active module
  const activeModule = session ? getModuleByDb(session.current_module, session.current_seance || 1) : undefined;
  const hasActiveModule = !!activeModule && !activeModule.disabled;

  // Current situation
  const { data: situationData } = useQuery({
    queryKey: ["pilot-situation", sessionId, session?.current_module, session?.current_seance, session?.current_situation_index],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}/situation`);
      if (!res.ok) return null;
      return res.json();
    },
    refetchInterval: 10_000,
    enabled: !checkingAuth && !!session && hasActiveModule,
  });

  const situation = (situationData as { situation?: { id: string } })?.situation;

  // Module 1 situation IDs
  const isModule1 = session?.current_module === 1;
  const m1SituationIds = isModule1
    ? (() => {
        const m1 = (situationData as { module1?: { type: string; questions?: { situationId: string | null }[]; question?: { situationId: string } } })?.module1;
        if (!m1) return [];
        if (m1.type === "positioning" && m1.questions) {
          return m1.questions.map((q) => q.situationId).filter((id): id is string => !!id);
        }
        if ((m1.type === "image" || m1.type === "notebook") && m1.question?.situationId) {
          return [m1.question.situationId];
        }
        return [];
      })()
    : [];

  // Responses
  const { data: responses = [] } = useQuery<Response[]>({
    queryKey: ["pilot-responses", sessionId, isModule1 ? `m1-seance${session?.current_seance}` : situation?.id],
    queryFn: async () => {
      if (isModule1) {
        if (m1SituationIds.length === 0) return [];
        const params = new URLSearchParams();
        m1SituationIds.forEach((id) => params.append("situationIds", id));
        const res = await fetch(`/api/sessions/${sessionId}/responses?${params.toString()}`);
        if (!res.ok) return [];
        return res.json();
      }
      if (!situation?.id) return [];
      const res = await fetch(`/api/sessions/${sessionId}/responses?situationId=${situation.id}`);
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 10_000,
    enabled: !checkingAuth && (!!situation || (isModule1 && m1SituationIds.length > 0)) && hasActiveModule,
  });

  // Vote results
  const { data: voteData } = useQuery<{ totalVotes: number; results: VoteResult[] }>({
    queryKey: ["pilot-votes", sessionId, situation?.id],
    queryFn: async () => {
      if (!situation?.id) return { totalVotes: 0, results: [] };
      const res = await fetch(`/api/sessions/${sessionId}/votes?situationId=${situation.id}`);
      if (!res.ok) return { totalVotes: 0, results: [] };
      return res.json();
    },
    refetchInterval: 10_000,
    enabled: !checkingAuth && !!situation && hasActiveModule && (session?.status === "voting" || session?.status === "reviewing"),
  });

  // Collective choices (Module 3/4)
  const { data: collectiveChoices = [] } = useQuery<CollectiveChoice[]>({
    queryKey: ["pilot-choices", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}/collective-choice`);
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 10_000,
    enabled: !checkingAuth && !!session && hasActiveModule && (session?.current_module === 3 || session?.current_module === 4),
  });

  // O-I-E creative profile scores
  const { data: oieData } = useQuery<{ scores: Record<string, import("@/lib/oie-profile").OIEScores> }>({
    queryKey: ["pilot-oie", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}/oie-profile?debug=true`);
      if (!res.ok) return { scores: {} };
      return res.json();
    },
    refetchInterval: 30_000,
    enabled: !checkingAuth && !!session,
  });

  // ── Mutations ──

  const updateSession = useMutation({
    mutationFn: async (updates: Record<string, unknown>) => {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: (_data, updates) => {
      queryClient.invalidateQueries({ queryKey: ["pilot-session", sessionId] });
      // Auto-audit status transitions
      const status = updates.status as string | undefined;
      if (status === "paused") logAudit({ action: "session_pause", actor: actorId, sessionId });
      else if (status === "responding" && session?.status === "paused") logAudit({ action: "session_resume", actor: actorId, sessionId });
      else if (status === "voting") logAudit({ action: "vote_start", actor: actorId, sessionId });
      else if (status === "done") logAudit({ action: "session_end", actor: actorId, sessionId });
    },
    onError: () => toast.error("Erreur de mise à jour"),
  });

  const removeStudent = useMutation({
    mutationFn: async (studentId: string) => {
      const res = await fetch(`/api/sessions/${sessionId}/students/${studentId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: (_data, studentId) => {
      queryClient.invalidateQueries({ queryKey: ["pilot-session", sessionId] });
      toast.success("Joueur retiré");
      logAudit({ action: "student_remove", actor: actorId, sessionId, details: { studentId } });
    },
    onError: () => toast.error("Erreur"),
  });

  const validateChoice = useMutation({
    mutationFn: async ({ response, text }: { response: Response; text: string }) => {
      const sit = (situationData as { situation?: { id: string; category: string; restitutionLabel: string } })?.situation;
      const res = await fetch(`/api/sessions/${sessionId}/collective-choice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          situationId: sit?.id,
          category: sit?.category,
          restitutionLabel: sit?.restitutionLabel,
          chosenText: text,
          sourceResponseId: response.id,
        }),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Choix collectif validé !");
      updateSession.mutate({ status: "reviewing" });
    },
    onError: () => toast.error("Erreur de validation"),
  });

  const toggleHide = useMutation({
    mutationFn: async ({ responseId, is_hidden }: { responseId: string; is_hidden: boolean }) => {
      const res = await fetch(`/api/sessions/${sessionId}/responses/${responseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_hidden }),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pilot-responses", sessionId] }),
    onError: () => toast.error("Erreur de modération"),
  });

  const toggleVoteOption = useMutation({
    mutationFn: async ({ responseId, is_vote_option }: { responseId: string; is_vote_option: boolean }) => {
      const res = await fetch(`/api/sessions/${sessionId}/responses/${responseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_vote_option }),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pilot-responses", sessionId] }),
    onError: () => toast.error("Erreur de sélection"),
  });

  const commentResponse = useMutation({
    mutationFn: async ({ responseId, comment }: { responseId: string; comment: string | null }) => {
      const res = await fetch(`/api/sessions/${sessionId}/responses/${responseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacher_comment: comment }),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pilot-responses", sessionId] });
      toast.success("Commentaire envoyé");
    },
    onError: () => toast.error("Erreur"),
  });

  const highlightResponse = useMutation({
    mutationFn: async ({ responseId, highlighted }: { responseId: string; highlighted: boolean }) => {
      const res = await fetch(`/api/sessions/${sessionId}/responses/${responseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_highlighted: highlighted }),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pilot-responses", sessionId] });
    },
    onError: () => toast.error("Erreur"),
  });

  const nudgeStudent = useMutation({
    mutationFn: async ({ responseId, nudgeText }: { responseId: string; nudgeText: string }) => {
      const res = await fetch(`/api/sessions/${sessionId}/responses/${responseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacher_nudge: nudgeText }),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: () => toast.success("Message envoyé à l'élève"),
    onError: () => toast.error("Erreur d'envoi"),
  });

  const warnStudent = useMutation({
    mutationFn: async (studentId: string) => {
      const res = await fetch(`/api/sessions/${sessionId}/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "warn" }),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: (data: { warnings: number; kicked: boolean }, studentId) => {
      queryClient.invalidateQueries({ queryKey: ["pilot-session", sessionId] });
      if (data.kicked) {
        toast.error("Élève exclu (3 avertissements)");
      } else {
        toast("Avertissement envoyé (" + data.warnings + "/3)", { icon: "⚠️" });
      }
      logAudit({ action: "student_warn", actor: actorId, sessionId, details: { studentId, warnings: data.warnings, kicked: data.kicked } });
    },
    onError: () => toast.error("Erreur"),
  });

  const lowerHand = useMutation({
    mutationFn: async (studentId: string) => {
      const res = await fetch(`/api/sessions/${sessionId}/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear_hand" }),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pilot-session", sessionId] });
      toast.success("Main baissée");
    },
  });

  const scoreResponse = useMutation({
    mutationFn: async ({ responseId, score }: { responseId: string; score: number }) => {
      const res = await fetch(`/api/sessions/${sessionId}/responses/${responseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacher_score: score }),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pilot-responses", sessionId] });
      toast.success("Note enregistrée");
    },
    onError: () => toast.error("Erreur de notation"),
  });

  const aiEvaluate = useMutation({
    mutationFn: async (responseIds: string[]) => {
      const res = await fetch(`/api/sessions/${sessionId}/responses/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responseIds }),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pilot-responses", sessionId] });
      toast.success("Évaluation IA terminée");
    },
    onError: () => toast.error("Erreur évaluation IA"),
  });

  const resetResponse = useMutation({
    mutationFn: async (responseId: string) => {
      const res = await fetch(`/api/sessions/${sessionId}/responses/${responseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: (_data, responseId) => {
      queryClient.invalidateQueries({ queryKey: ["pilot-responses", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["pilot-session", sessionId] });
      toast.success("Question relancée pour cet élève");
      logAudit({ action: "response_reset", actor: actorId, sessionId, details: { responseId } });
    },
    onError: () => toast.error("Erreur de relance"),
  });

  const resetAllResponses = useMutation({
    mutationFn: async (situationId: string) => {
      const res = await fetch(`/api/sessions/${sessionId}/reset-responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situationId }),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: (data: { resetCount: number }, situationId) => {
      queryClient.invalidateQueries({ queryKey: ["pilot-responses", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["pilot-session", sessionId] });
      toast.success(`Question relancée pour ${data.resetCount} élève${data.resetCount > 1 ? "s" : ""}`);
      logAudit({ action: "response_reset_all", actor: actorId, sessionId, details: { situationId, resetCount: data.resetCount } });
    },
    onError: () => toast.error("Erreur de relance"),
  });

  return {
    // Queries
    session,
    sessionLoading,
    teams: teams || [],
    situationData,
    situation,
    responses,
    voteData,
    collectiveChoices,
    oieScores: oieData?.scores,
    // Derived
    activeModule,
    hasActiveModule,
    isModule1,
    m1SituationIds,
    // Mutations
    updateSession,
    removeStudent,
    validateChoice,
    toggleHide,
    toggleVoteOption,
    commentResponse,
    highlightResponse,
    nudgeStudent,
    warnStudent,
    lowerHand,
    scoreResponse,
    aiEvaluate,
    resetResponse,
    resetAllResponses,
  };
}
