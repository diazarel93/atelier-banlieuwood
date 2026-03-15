"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { UseMutationResult } from "@tanstack/react-query";
import type { Session, Student, Response, VoteResult } from "@/hooks/use-pilot-session";
import type { CollectiveChoice } from "@/components/pilot/choices-history";

// ── Mutation type aliases (shorter than full ReturnType<typeof useMutation<...>>) ──

type Mut<TData, TVariables> = Pick<
  UseMutationResult<TData, Error, TVariables>,
  "mutate" | "mutateAsync" | "isPending" | "isError"
>;

export interface CockpitContextValue {
  // ── Session data ──
  session: Session;
  sessionId: string;
  responses: Response[];
  activeStudents: Student[];
  voteData: { totalVotes: number; results: VoteResult[] } | undefined;
  collectiveChoices: CollectiveChoice[];
  situationData: Record<string, unknown> | null;
  oieScores?: Record<string, import("@/lib/oie-profile").OIEScores>;
  teams: { id: string; team_name: string; team_color: string; team_number: number; students: { id: string; display_name: string; avatar: string }[] }[];

  // ── Mutations ──
  updateSession: Mut<unknown, Record<string, unknown>>;
  toggleHide: Mut<unknown, { responseId: string; is_hidden: boolean }>;
  toggleVoteOption: Mut<unknown, { responseId: string; is_vote_option: boolean }>;
  validateChoice: Mut<unknown, { response: Response; text: string }>;
  removeStudent: Mut<unknown, string>;
  commentResponse: Mut<unknown, { responseId: string; comment: string | null }>;
  highlightResponse: Mut<unknown, { responseId: string; highlighted: boolean }>;
  nudgeStudent: Mut<unknown, { responseId: string; nudgeText: string }>;
  warnStudent: Mut<unknown, string>;
  toggleStudentActive: Mut<unknown, { studentId: string; isActive: boolean }>;
  lowerHand: Mut<unknown, string>;
  scoreResponse: Mut<unknown, { responseId: string; score: number }>;
  aiEvaluate: Mut<unknown, string[]>;
  resetResponse: Mut<unknown, string>;
  resetAllResponses: Mut<{ resetCount: number }, string>;

  // ── Callbacks ──
  onModuleComplete: () => void;
  onSelectStudent: (student: Student) => void;
  onOpenModules?: () => void;
  onOpenScreen?: () => void;

  // ── Student warnings map ──
  studentWarnings: Record<string, number>;
}

const CockpitContext = createContext<CockpitContextValue | null>(null);

export function CockpitProvider({
  value,
  children,
}: {
  value: CockpitContextValue;
  children: ReactNode;
}) {
  return (
    <CockpitContext.Provider value={value}>{children}</CockpitContext.Provider>
  );
}

export function useCockpit(): CockpitContextValue {
  const ctx = useContext(CockpitContext);
  if (!ctx) throw new Error("useCockpit must be used within <CockpitProvider>");
  return ctx;
}
