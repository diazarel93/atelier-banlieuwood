"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { UseMutationResult } from "@tanstack/react-query";
import type { Session, Student, Response, VoteResult } from "@/hooks/use-pilot-session";
import type { CollectiveChoice } from "@/components/pilot/choices-history";

// ── Mutation type aliases (shorter than full ReturnType<typeof useMutation<...>>) ──

type Mut<TData, TVariables> = Pick<
  UseMutationResult<TData, Error, TVariables>,
  "mutate" | "mutateAsync" | "isPending" | "isError"
>;

// ── Data context: changes on every poll cycle ──

export interface CockpitDataValue {
  session: Session;
  sessionId: string;
  responses: Response[];
  activeStudents: Student[];
  voteData: { totalVotes: number; results: VoteResult[] } | undefined;
  collectiveChoices: CollectiveChoice[];
  situationData: Record<string, unknown> | null;
  teams: { id: string; team_name: string; team_color: string; team_number: number; students: { id: string; display_name: string; avatar: string }[] }[];
  studentWarnings: Record<string, number>;
}

// ── Actions context: stable identity (mutations + callbacks) ──

export interface CockpitActionsValue {
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
  onModuleComplete: () => void;
  onSelectStudent: (student: Student) => void;
  onOpenModules?: () => void;
  onOpenScreen?: () => void;
}

// ── Combined type (backwards-compatible) ──

export type CockpitContextValue = CockpitDataValue & CockpitActionsValue;

// ── Contexts ──

const CockpitDataContext = createContext<CockpitDataValue | null>(null);
const CockpitActionsContext = createContext<CockpitActionsValue | null>(null);

export function CockpitProvider({
  value,
  children,
}: {
  value: CockpitContextValue;
  children: ReactNode;
}) {
  // Split into stable actions ref — mutations from useMutation keep stable identity,
  // so this object only changes when the provider re-renders (not on data changes).
  const actions = useMemo<CockpitActionsValue>(() => ({
    updateSession: value.updateSession,
    toggleHide: value.toggleHide,
    toggleVoteOption: value.toggleVoteOption,
    validateChoice: value.validateChoice,
    removeStudent: value.removeStudent,
    commentResponse: value.commentResponse,
    highlightResponse: value.highlightResponse,
    nudgeStudent: value.nudgeStudent,
    warnStudent: value.warnStudent,
    toggleStudentActive: value.toggleStudentActive,
    lowerHand: value.lowerHand,
    scoreResponse: value.scoreResponse,
    aiEvaluate: value.aiEvaluate,
    resetResponse: value.resetResponse,
    resetAllResponses: value.resetAllResponses,
    onModuleComplete: value.onModuleComplete,
    onSelectStudent: value.onSelectStudent,
    onOpenModules: value.onOpenModules,
    onOpenScreen: value.onOpenScreen,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  const data = useMemo<CockpitDataValue>(() => ({
    session: value.session,
    sessionId: value.sessionId,
    responses: value.responses,
    activeStudents: value.activeStudents,
    voteData: value.voteData,
    collectiveChoices: value.collectiveChoices,
    situationData: value.situationData,
    teams: value.teams,
    studentWarnings: value.studentWarnings,
  }), [
    value.session, value.sessionId, value.responses, value.activeStudents,
    value.voteData, value.collectiveChoices, value.situationData,
    value.teams, value.studentWarnings,
  ]);

  return (
    <CockpitActionsContext.Provider value={actions}>
      <CockpitDataContext.Provider value={data}>
        {children}
      </CockpitDataContext.Provider>
    </CockpitActionsContext.Provider>
  );
}

/** Get all cockpit data + actions (backwards-compatible) */
export function useCockpit(): CockpitContextValue {
  const data = useContext(CockpitDataContext);
  const actions = useContext(CockpitActionsContext);
  if (!data || !actions) throw new Error("useCockpit must be used within <CockpitProvider>");
  return { ...data, ...actions };
}

/** Get only cockpit data (re-renders on data changes) */
export function useCockpitData(): CockpitDataValue {
  const ctx = useContext(CockpitDataContext);
  if (!ctx) throw new Error("useCockpitData must be used within <CockpitProvider>");
  return ctx;
}

/** Get only cockpit actions (stable identity — no re-renders on data changes) */
export function useCockpitActions(): CockpitActionsValue {
  const ctx = useContext(CockpitActionsContext);
  if (!ctx) throw new Error("useCockpitActions must be used within <CockpitProvider>");
  return ctx;
}
