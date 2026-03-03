"use client";

import { useQuery } from "@tanstack/react-query";

export interface Module1Data {
  type: "positioning" | "image" | "notebook";
  // Positioning (séance 1)
  questions?: {
    index: number;
    situationId: string | null;
    text: string;
    measure: string;
    options?: { key: string; label: string }[];
  }[];
  answeredQuestions?: Record<number, boolean>;
  answeredOptions?: Record<number, string>;
  responseCounts?: Record<number, number>;
  optionDistribution?: Record<string, number> | null;
  // Image (séances 2-4)
  image?: { position: number; title: string; description: string; url: string } | null;
  question?: { situationId: string; text: string; relance: string; measure: string };
  hasResponded?: boolean;
  responsesCount?: number;
  confrontation?: { responseA: string; responseB: string } | null;
  // Notebook (séance 5)
  existingText?: string;
  // Common
  totalSeances: number;
  currentSeance: number;
}

export interface Module5Data {
  type: "checklist" | "scene-builder" | "comparison";
  // Checklist (séance 1 index 0)
  checklist?: { selected_items: string[]; chosen_item: string | null } | null;
  topItems?: { key: string; count: number }[];
  submitted?: boolean;
  submittedCount?: number;
  // Scene builder (séance 2 index 1)
  scene?: {
    id: string;
    emotion: string;
    intention: string;
    obstacle: string;
    changement: string;
    elements: { key: string; label: string; tier: number; cost: number }[];
    tokens_used: number;
    slots_used: number;
    ai_feedback: { strengths: string[]; suggestions: string[]; summary: string } | null;
  } | null;
  chosenEmotion?: string | null;
  emotionDistribution?: Record<string, number>;
  // Comparison (séance 3)
  comparison?: {
    sceneA: {
      id: string;
      emotion: string;
      intention: string;
      obstacle: string;
      changement: string;
      elements: { key: string; label: string; tier: number; cost: number }[];
    };
    sceneB: {
      id: string;
      emotion: string;
      intention: string;
      obstacle: string;
      changement: string;
      elements: { key: string; label: string; tier: number; cost: number }[];
    };
  } | null;
}

export interface Module10Data {
  type: "etsi" | "qcm" | "idea-bank" | "avatar" | "objectif" | "pitch" | "chrono" | "confrontation";
  // Et si (seance 1)
  image?: { id: string; url: string; title: string; description: string } | null;
  etsiText?: string;
  helpUsed?: boolean;
  submitted?: boolean;
  ideaBankCount?: number;
  ideaBankItems?: { id: string; text: string; votes: number }[];
  // Pitch (seance 2)
  personnage?: { prenom: string; age: string; trait: string; avatar: Record<string, string> } | null;
  objectif?: string | null;
  obstacle?: string | null;
  pitchText?: string | null;
  chronoSeconds?: number | null;
  // Confrontation
  confrontation?: { pitchA: { text: string; prenom: string }; pitchB: { text: string; prenom: string } } | null;
  // Shared
  submittedCount?: number;
  // Facilitator view: all student submissions for M10 special positions
  allSubmissions?: { studentName: string; text: string; studentId: string; avatar?: Record<string, unknown> }[];
}

export interface SessionState {
  session: {
    id: string;
    status: "waiting" | "responding" | "reviewing" | "voting" | "paused" | "done";
    currentModule: number;
    currentSeance: number;
    currentSituationIndex: number;
    level: string;
    title: string;
    joinCode?: string;
    template?: string | null;
    timerEndsAt?: string | null;
    mode: "guided" | "free";
    sharingEnabled?: boolean;
  };
  situation: {
    id: string;
    position: number;
    category: string;
    restitutionLabel: string;
    prompt: string;
    nudgeText: string | null;
  } | null;
  module1?: Module1Data;
  module5?: Module5Data;
  module10?: Module10Data;
  hasResponded: boolean;
  hasVoted: boolean;
  voteOptions: { id: string; text: string }[];
  collectiveChoice: {
    id: string;
    chosen_text: string;
    category: string;
    restitution_label: string;
  } | null;
  connectedCount: number;
  responsesCount: number;
  budgetStats: {
    averages: Record<string, number>;
    submittedCount: number;
  } | null;
  isMyResponseChosen: boolean;
  teacherNudge: string | null;
  studentWarnings: number;
  studentKicked: boolean;
}

export function useSessionPolling(sessionId: string, studentId: string | null, opts?: { skipStudentCheck?: boolean }) {
  return useQuery<SessionState>({
    queryKey: ["session-state", sessionId, studentId],
    queryFn: async () => {
      const params = studentId ? `?studentId=${studentId}` : "";
      const res = await fetch(`/api/sessions/${sessionId}/situation${params}`);
      if (!res.ok) throw new Error("Session introuvable");
      return res.json();
    },
    refetchInterval: 3000, // Poll every 3 seconds
    // Wait for studentId to be loaded unless explicitly skipped (e.g. screen page)
    enabled: !!sessionId && (opts?.skipStudentCheck || studentId !== null),
  });
}
