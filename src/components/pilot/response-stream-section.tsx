"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { ResponseStream } from "@/components/pilot/response-stream";
import { type ResponseCardResponse } from "@/components/pilot/response-card";
import { ElapsedTimer } from "@/components/pilot/elapsed-timer";
import { StuckAlert } from "@/components/pilot/stuck-alert";

interface StuckStudent {
  id: string;
  name: string;
  avatar: string;
}

interface QuestionGuide {
  label: string;
  category: string;
  whatToExpect: string;
  relancePhrase?: string;
}

export interface ResponseStreamSectionProps {
  // Data
  filteredResponses: ResponseCardResponse[];
  responses: { id: string; is_hidden: boolean; is_vote_option: boolean; is_highlighted: boolean; ai_score?: number; student_id: string; text: string; submitted_at: string; teacher_comment: string | null; teacher_score?: number; ai_feedback?: string | null; reset_at?: string | null; previous_text?: string | null; students: { display_name: string; avatar: string } }[];
  activeStudents: { id: string }[];
  respondedCount: number;
  highlightedCount: number;
  respondingOpenedAt: number | null;
  sessionStatus: string;
  winnerResponseId: string | undefined;
  stuckStudents: StuckStudent[];
  questionGuide: QuestionGuide | undefined;
  situation: { id: string; position: number; category: string; restitutionLabel: string; prompt: string } | undefined;
  studentWarnings: Record<string, number>;

  // Filter & sort state
  responseFilter: "all" | "visible" | "highlighted";
  setResponseFilter: (f: "all" | "visible" | "highlighted") => void;
  responseSortMode: "time" | "highlighted";
  setResponseSortMode: (m: "time" | "highlighted") => void;

  // Modal togglers
  onShowBroadcast: () => void;
  onShowCompare: () => void;
  onShowExport: () => void;
  showRevealAnswer: boolean;
  onToggleRevealAnswer: () => void;

  // Callbacks
  onClearAllHighlights: () => void;
  onNudgeAllStuck: () => void;

  // Mutations
  toggleVoteOption: { mutate: (args: { responseId: string; is_vote_option: boolean }) => void; isPending: boolean };
  toggleHide: { mutate: (args: { responseId: string; is_hidden: boolean }) => void; isPending: boolean };
  commentResponse: { mutate: (args: { responseId: string; comment: string | null }) => void; isPending: boolean };
  highlightResponse: { mutate: (args: { responseId: string; highlighted: boolean }) => void; isPending: boolean };
  nudgeStudent: { mutate: (args: { responseId: string; nudgeText: string }) => void; isPending: boolean };
  warnStudent: { mutate: (args: string) => void; isPending: boolean };
  scoreResponse: { mutate: (args: { responseId: string; score: number }) => void; isPending: boolean };
  resetResponse: { mutate: (args: string) => void; isPending: boolean };
  aiEvaluate: { mutate: (args: string[]) => void; isPending: boolean };
  resetAllResponses: { mutate: (args: string) => void; isPending: boolean };

  // Reformulation callback
  onReformulate: (r: ResponseCardResponse) => void;

  // Bulk actions
  onHighlightAllVisible?: () => void;
  onHideAllVisible?: () => void;
}

export function ResponseStreamSection({
  filteredResponses,
  responses,
  activeStudents,
  respondedCount,
  highlightedCount,
  respondingOpenedAt,
  sessionStatus,
  winnerResponseId,
  stuckStudents,
  questionGuide,
  situation,
  studentWarnings,
  responseFilter,
  setResponseFilter,
  responseSortMode,
  setResponseSortMode,
  onShowBroadcast,
  onShowCompare,
  onShowExport,
  showRevealAnswer,
  onToggleRevealAnswer,
  onClearAllHighlights,
  onNudgeAllStuck,
  toggleVoteOption,
  toggleHide,
  commentResponse,
  highlightResponse,
  nudgeStudent,
  warnStudent,
  scoreResponse,
  resetResponse,
  aiEvaluate,
  resetAllResponses,
  onReformulate,
  onHighlightAllVisible,
  onHideAllVisible,
}: ResponseStreamSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const visibleResponses = responses.filter((r) => !r.is_hidden);

  // Apply search filter to the already-filtered responses
  const searchedResponses = useMemo(() => {
    if (!searchQuery.trim()) return filteredResponses;
    const q = searchQuery.toLowerCase();
    return filteredResponses.filter(
      (r) => r.text.toLowerCase().includes(q) || r.students.display_name.toLowerCase().includes(q)
    );
  }, [filteredResponses, searchQuery]);

  return (
    <div className="space-y-2">
      {/* Prominent response counter + elapsed + action bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Réponses</span>
          <motion.span
            key={respondedCount}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-sm font-bold tabular-nums px-2 py-0.5 rounded-lg ${
              respondedCount >= activeStudents.length
                ? "bg-green-500/15 text-green-400"
                : "bg-bw-teal/10 text-bw-teal"
            }`}
          >
            {respondedCount}/{activeStudents.length}
          </motion.span>
          <ElapsedTimer startedAt={respondingOpenedAt} />
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onShowBroadcast} title="Message classe (B)"
            className="px-2 py-1 rounded-lg text-[10px] text-bw-muted hover:text-bw-primary hover:bg-bw-primary/10 cursor-pointer transition-colors bg-bw-elevated border border-white/[0.06]">
            📢
          </button>
          {responses.length >= 2 && (
            <button onClick={onShowCompare} title="Comparer (C)"
              className="px-2 py-1 rounded-lg text-[10px] text-bw-muted hover:text-bw-violet hover:bg-bw-violet/10 cursor-pointer transition-colors bg-bw-elevated border border-white/[0.06]">
              ⚖️
            </button>
          )}
          {highlightedCount > 0 && (
            <button onClick={onClearAllHighlights} title="Tout dé-projeter"
              className="px-2 py-1 rounded-lg text-[10px] text-bw-amber hover:bg-bw-amber/10 cursor-pointer transition-colors bg-bw-elevated border border-white/[0.06]">
              ✖️ {highlightedCount}
            </button>
          )}
          {questionGuide && (
            <button onClick={onToggleRevealAnswer} title="Réponse attendue"
              className={`px-2 py-1 rounded-lg text-[10px] cursor-pointer transition-colors bg-bw-elevated border border-white/[0.06] ${
                showRevealAnswer ? "text-green-400 bg-green-500/10 border-green-500/30" : "text-bw-muted hover:text-green-400 hover:bg-green-500/10"
              }`}>
              💡
            </button>
          )}
          <button onClick={onShowExport} title="Export (E)"
            className="px-2 py-1 rounded-lg text-[10px] text-bw-muted hover:text-bw-teal hover:bg-bw-teal/10 cursor-pointer transition-colors bg-bw-elevated border border-white/[0.06]">
            📋
          </button>
        </div>
      </div>

      {/* Stuck students alert */}
      <StuckAlert students={stuckStudents} onNudgeAll={onNudgeAllStuck} />

      {/* Reveal expected answer */}
      <AnimatePresence>
        {showRevealAnswer && questionGuide && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 rounded-xl border border-green-500/20" style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.06), transparent)" }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase tracking-wider text-green-400 font-semibold">Réponse attendue</span>
                <button onClick={() => { navigator.clipboard.writeText(questionGuide.whatToExpect); toast.success("Copié !"); }}
                  className="text-[10px] text-bw-muted hover:text-green-400 cursor-pointer">Copier</button>
              </div>
              <p className="text-xs text-bw-text leading-relaxed">{questionGuide.whatToExpect}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search + Filter chips + sort toggle */}
      {responses.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Search input */}
          <div className="relative">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
              className="absolute left-2 top-1/2 -translate-y-1/2 text-bw-muted pointer-events-none">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Chercher..."
              className="w-28 focus:w-40 transition-all duration-200 pl-7 pr-2 py-1 rounded-full text-[10px] bg-bw-elevated border border-white/[0.06] text-bw-text placeholder:text-bw-muted outline-none focus:border-bw-teal/40"
            />
          </div>
          {([
            { key: "all" as const, label: `Toutes (${responses.length})` },
            { key: "visible" as const, label: `Visibles (${visibleResponses.length})` },
            { key: "highlighted" as const, label: `En avant (${highlightedCount})` },
          ]).map((f) => (
            <button
              key={f.key}
              onClick={() => setResponseFilter(f.key)}
              className={`px-2 py-1 rounded-full text-[10px] font-medium cursor-pointer transition-colors duration-200 ${
                responseFilter === f.key
                  ? "bg-bw-teal/15 text-bw-teal border border-bw-teal/30"
                  : "bg-bw-elevated text-bw-muted border border-white/[0.06] hover:text-bw-text"
              }`}
            >
              {f.label}
            </button>
          ))}
          <div className="flex-1" />
          <button
            onClick={() => {
              const ids = visibleResponses.filter((r) => !r.ai_score).map((r) => r.id);
              if (ids.length === 0) { toast("Toutes les réponses sont déjà évaluées"); return; }
              aiEvaluate.mutate(ids.slice(0, 20));
            }}
            disabled={aiEvaluate.isPending}
            className="px-2 py-1 rounded-lg text-[10px] text-bw-violet hover:bg-bw-violet/10 cursor-pointer transition-colors bg-bw-elevated border border-white/[0.06] disabled:opacity-40"
            title="Évaluer les réponses par IA"
          >
            {aiEvaluate.isPending ? "IA..." : "🤖 Évaluer IA"}
          </button>
          {sessionStatus === "responding" && situation && (
            <button
              onClick={() => {
                if (confirm("Relancer la question pour toute la classe ? Les réponses précédentes seront conservées.")) {
                  resetAllResponses.mutate(situation!.id);
                }
              }}
              disabled={resetAllResponses.isPending}
              className="px-2 py-1 rounded-lg text-[10px] text-bw-amber hover:bg-bw-amber/10 cursor-pointer transition-colors bg-bw-elevated border border-white/[0.06] disabled:opacity-40"
              title="Relancer la question pour toute la classe"
            >
              {resetAllResponses.isPending ? "Relance..." : "🔄 Relancer tous"}
            </button>
          )}
          <button
            onClick={() => setResponseSortMode(responseSortMode === "time" ? "highlighted" : "time")}
            className="px-2 py-1 rounded-lg text-[10px] text-bw-muted hover:text-bw-text cursor-pointer transition-colors bg-bw-elevated border border-white/[0.06]"
            title={responseSortMode === "time" ? "Tri chronologique" : "Tri par mise en avant"}
          >
            {responseSortMode === "time" ? "⏱ Chrono" : "⭐ Priorité"}
          </button>
          {/* Bulk actions */}
          {visibleResponses.length > 2 && onHighlightAllVisible && (
            <button
              onClick={onHighlightAllVisible}
              className="px-2 py-1 rounded-lg text-[10px] text-bw-primary hover:bg-bw-primary/10 cursor-pointer transition-colors bg-bw-elevated border border-white/[0.06]"
              title="Projeter toutes les réponses visibles"
            >
              ⭐ Tout projeter
            </button>
          )}
          {visibleResponses.length > 2 && onHideAllVisible && (
            <button
              onClick={onHideAllVisible}
              className="px-2 py-1 rounded-lg text-[10px] text-bw-muted hover:text-bw-danger hover:bg-bw-danger/10 cursor-pointer transition-colors bg-bw-elevated border border-white/[0.06]"
              title="Masquer toutes les réponses visibles"
            >
              👁 Tout masquer
            </button>
          )}
        </div>
      )}

      {searchedResponses.length > 0 ? (
        <ResponseStream
          responses={searchedResponses}
          sessionStatus={sessionStatus}
          winnerResponseId={winnerResponseId}
          onToggleSelect={(id, current) => toggleVoteOption.mutate({ responseId: id, is_vote_option: !current })}
          onToggleHide={(id, current) => toggleHide.mutate({ responseId: id, is_hidden: !current })}
          onValidate={sessionStatus === "reviewing" ? (r) => {
            onReformulate(r);
          } : undefined}
          isPending={toggleVoteOption.isPending || toggleHide.isPending}
          onComment={(id, comment) => commentResponse.mutate({ responseId: id, comment })}
          onHighlight={(id, highlighted) => highlightResponse.mutate({ responseId: id, highlighted })}
          onNudge={(id, text) => nudgeStudent.mutate({ responseId: id, nudgeText: text })}
          onWarn={(sid) => warnStudent.mutate(sid)}
          onScore={(id, score) => scoreResponse.mutate({ responseId: id, score })}
          onReset={(id) => resetResponse.mutate(id)}
          isNudgePending={nudgeStudent.isPending}
          isCommentPending={commentResponse.isPending}
          isWarnPending={warnStudent.isPending}
          isScorePending={scoreResponse.isPending}
          isResetPending={resetResponse.isPending}
          studentWarnings={studentWarnings}
        />
      ) : responses.length > 0 && searchedResponses.length === 0 ? (
        <div className="bg-bw-surface rounded-xl border border-white/[0.06] p-4 text-center">
          <p className="text-xs text-bw-muted">{searchQuery.trim() ? `Aucune réponse pour "${searchQuery}"` : "Aucune réponse dans ce filtre"}</p>
        </div>
      ) : sessionStatus === "responding" ? (
        <div className="bg-bw-surface rounded-xl border border-white/[0.06] p-5 text-center space-y-2">
          <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}
            className="text-2xl">✍️</motion.div>
          <p className="text-sm text-bw-muted">En attente des réponses...</p>
          <p className="text-sm text-bw-muted">{activeStudents.length} élève{activeStudents.length > 1 ? "s" : ""} connecté{activeStudents.length > 1 ? "s" : ""}</p>
        </div>
      ) : null}
    </div>
  );
}
