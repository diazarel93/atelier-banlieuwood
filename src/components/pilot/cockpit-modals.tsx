"use client";

import { SpotlightModal } from "@/components/pilot/spotlight-modal";
import { WordCloud } from "@/components/pilot/word-cloud";
import { DebatePanel } from "@/components/pilot/debate-panel";
import { BroadcastModal } from "@/components/pilot/broadcast-modal";
import { CompareResponsesModal } from "@/components/pilot/compare-responses-modal";
import { SessionExport } from "@/components/pilot/session-export";
import { KeyboardShortcutsModal } from "@/components/pilot/keyboard-shortcuts-modal";
import { ConfirmModal } from "@/components/confirm-modal";
import { useCockpitActions } from "@/components/pilot/cockpit-context";

interface SpotlightData {
  studentName: string;
  studentAvatar: string;
  text: string;
  score?: number | null;
  highlighted?: boolean;
}

interface ResponseForExport {
  id: string;
  text: string;
  studentName: string;
  teacher_comment: string | null;
  teacher_score?: number;
  ai_score?: number;
  is_highlighted: boolean;
  submitted_at: string;
}

interface ResponseForDebate {
  id: string;
  text: string;
  student_id: string;
  studentName: string;
  studentAvatar: string;
  is_highlighted: boolean;
}

interface ResponseForCompare {
  id: string;
  text: string;
  studentName: string;
  studentAvatar: string;
  is_highlighted: boolean;
}

interface RawResponse {
  id: string;
  text: string;
  student_id: string;
  is_hidden: boolean;
  is_highlighted: boolean;
  is_vote_option: boolean;
  teacher_comment: string | null;
  teacher_score?: number;
  ai_score?: number;
  submitted_at: string;
  reset_at?: string | null;
  students: { display_name: string; avatar: string };
}

export interface CockpitModalsProps {
  // Spotlight
  spotlightResponse: SpotlightData | null;
  setSpotlightResponse: (v: SpotlightData | null) => void;
  // Word cloud
  showWordCloud: boolean;
  setShowWordCloud: (v: boolean) => void;
  // Debate
  showDebate: boolean;
  setShowDebate: (v: boolean) => void;
  // Broadcast
  showBroadcast: boolean;
  setShowBroadcast: (v: boolean) => void;
  handleBroadcast: (message: string) => void;
  broadcastHistory: { text: string; sentAt: Date }[];
  broadcastPrefill: string;
  broadcastTitle?: string;
  broadcastIcon?: string;
  updateSessionPending: boolean;
  // Compare
  showCompare: boolean;
  setShowCompare: (v: boolean) => void;
  handleHighlightBoth: (idA: string, idB: string) => void;
  handleClearAllHighlights: () => void;
  // Export
  showExport: boolean;
  setShowExport: (v: boolean) => void;
  sessionTitle: string;
  level: string;
  moduleLabel: string;
  questionPrompt: string;
  activeStudentCount: number;
  sessionId?: string;
  // Shortcuts
  showShortcuts: boolean;
  setShowShortcuts: (v: boolean) => void;
  // Kick
  kickTarget: { id: string; name: string } | null;
  setKickTarget: (v: { id: string; name: string } | null) => void;
  // Raw responses for filtering/mapping
  responses: RawResponse[];
  visibleResponses: RawResponse[];
}

export function CockpitModals({
  spotlightResponse,
  setSpotlightResponse,
  showWordCloud,
  setShowWordCloud,
  showDebate,
  setShowDebate,
  showBroadcast,
  setShowBroadcast,
  handleBroadcast,
  broadcastHistory,
  broadcastPrefill,
  broadcastTitle,
  broadcastIcon,
  updateSessionPending,
  showCompare,
  setShowCompare,
  handleHighlightBoth,
  handleClearAllHighlights,
  showExport,
  setShowExport,
  sessionTitle,
  level,
  moduleLabel,
  questionPrompt,
  activeStudentCount,
  sessionId,
  showShortcuts,
  setShowShortcuts,
  kickTarget,
  setKickTarget,
  responses,
  visibleResponses,
}: CockpitModalsProps) {
  const { removeStudent } = useCockpitActions();
  const debateResponses: ResponseForDebate[] = responses
    .filter(r => !r.is_hidden && !r.reset_at)
    .map(r => ({
      id: r.id,
      text: r.text,
      student_id: r.student_id,
      studentName: r.students?.display_name || "",
      studentAvatar: r.students?.avatar || "",
      is_highlighted: r.is_highlighted || false,
    }));

  const compareResponses: ResponseForCompare[] = visibleResponses.map(r => ({
    id: r.id,
    text: r.text,
    studentName: r.students.display_name,
    studentAvatar: r.students.avatar,
    is_highlighted: r.is_highlighted,
  }));

  const exportResponses: ResponseForExport[] = responses.map(r => ({
    id: r.id,
    text: r.text,
    studentName: r.students.display_name,
    teacher_comment: r.teacher_comment,
    teacher_score: r.teacher_score,
    ai_score: r.ai_score,
    is_highlighted: r.is_highlighted,
    submitted_at: r.submitted_at,
  }));

  return (
    <>
      <SpotlightModal
        open={!!spotlightResponse}
        onClose={() => setSpotlightResponse(null)}
        studentName={spotlightResponse?.studentName || ""}
        studentAvatar={spotlightResponse?.studentAvatar || ""}
        responseText={spotlightResponse?.text || ""}
        teacherScore={spotlightResponse?.score}
        isHighlighted={spotlightResponse?.highlighted}
      />

      <WordCloud
        open={showWordCloud}
        onClose={() => setShowWordCloud(false)}
        responses={responses.filter(r => !r.is_hidden && !r.reset_at)}
      />

      <DebatePanel
        open={showDebate}
        onClose={() => setShowDebate(false)}
        responses={debateResponses}
        onBroadcast={(msg) => { handleBroadcast(msg); setShowDebate(false); }}
        onSpotlight={(r) => { setShowDebate(false); setSpotlightResponse({ studentName: r.studentName, studentAvatar: r.studentAvatar, text: r.text, highlighted: r.is_highlighted }); }}
      />

      <BroadcastModal
        open={showBroadcast}
        onClose={() => setShowBroadcast(false)}
        onSend={handleBroadcast}
        isPending={updateSessionPending}
        history={broadcastHistory}
        prefill={broadcastPrefill}
        title={broadcastTitle}
        icon={broadcastIcon}
      />

      <CompareResponsesModal
        open={showCompare}
        onClose={() => setShowCompare(false)}
        responses={compareResponses}
        onHighlightBoth={handleHighlightBoth}
        onClearHighlights={handleClearAllHighlights}
      />

      <SessionExport
        open={showExport}
        onClose={() => setShowExport(false)}
        sessionTitle={sessionTitle}
        level={level}
        moduleLabel={moduleLabel}
        questionPrompt={questionPrompt}
        responses={exportResponses}
        studentCount={activeStudentCount}
        sessionId={sessionId}
      />

      <KeyboardShortcutsModal showShortcuts={showShortcuts} setShowShortcuts={setShowShortcuts} />

      <ConfirmModal
        open={kickTarget !== null}
        onClose={() => setKickTarget(null)}
        onConfirm={() => { if (kickTarget) { removeStudent.mutate(kickTarget.id); setKickTarget(null); } }}
        title="Retirer cet eleve ?"
        description={`${kickTarget?.name || "L'eleve"} sera retire de la session.`}
        confirmLabel="Retirer"
        confirmVariant="danger"
      />
    </>
  );
}
