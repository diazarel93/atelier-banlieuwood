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
  activeStudents: { id: string; display_name?: string; avatar?: string }[];
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
  const [overflowOpen, setOverflowOpen] = useState(false);
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
          <ElapsedTimer startedAt={respondingOpenedAt} />
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onShowBroadcast} title="Message classe (B)"
            className="px-2 py-1 rounded-lg text-sm text-bw-muted hover:text-bw-primary hover:bg-bw-primary/10 cursor-pointer transition-colors bg-bw-elevated border border-white/[0.10]">
            📢
          </button>
          {responses.length >= 2 && (
            <button onClick={onShowCompare} title="Comparer (C)"
              className="px-2 py-1 rounded-lg text-sm text-bw-muted hover:text-bw-violet hover:bg-bw-violet/10 cursor-pointer transition-colors bg-bw-elevated border border-white/[0.10]">
              ⚖️
            </button>
          )}
          {highlightedCount > 0 && (
            <button onClick={onClearAllHighlights} title="Tout dé-projeter"
              className="px-2 py-1 rounded-lg text-xs text-bw-amber hover:bg-bw-amber/10 cursor-pointer transition-colors bg-bw-elevated border border-white/[0.10]">
              ✖️ {highlightedCount}
            </button>
          )}
          {questionGuide && (
            <button onClick={onToggleRevealAnswer} title="Réponse attendue"
              className={`px-2 py-1 rounded-lg text-sm cursor-pointer transition-colors bg-bw-elevated border border-white/[0.10] ${
                showRevealAnswer ? "text-green-400 bg-green-500/10 border-green-500/30" : "text-bw-muted hover:text-green-400 hover:bg-green-500/10"
              }`}>
              💡
            </button>
          )}
          <button onClick={onShowExport} title="Export (E)"
            className="px-2 py-1 rounded-lg text-sm text-bw-muted hover:text-bw-teal hover:bg-bw-teal/10 cursor-pointer transition-colors bg-bw-elevated border border-white/[0.10]">
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
                <span className="text-xs uppercase tracking-wider text-green-400 font-semibold">Réponse attendue</span>
                <button onClick={() => { navigator.clipboard.writeText(questionGuide.whatToExpect); toast.success("Copié !"); }}
                  className="text-xs text-bw-muted hover:text-green-400 cursor-pointer">Copier</button>
              </div>
              <p className="text-sm text-bw-text leading-relaxed">{questionGuide.whatToExpect}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search + Filter chips + sort toggle + overflow */}
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
              className="w-28 focus:w-40 transition-all duration-200 pl-7 pr-2 py-1 rounded-full text-xs bg-bw-elevated border border-white/[0.10] text-bw-text placeholder:text-bw-muted outline-none focus:border-bw-teal/40"
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
              className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors duration-200 ${
                responseFilter === f.key
                  ? "bg-bw-teal/15 text-bw-teal border border-bw-teal/30"
                  : "bg-bw-elevated text-bw-muted border border-white/[0.10] hover:text-bw-text"
              }`}
            >
              {f.label}
            </button>
          ))}
          <div className="flex-1" />
          <button
            onClick={() => setResponseSortMode(responseSortMode === "time" ? "highlighted" : "time")}
            className="px-2 py-1 rounded-lg text-xs text-bw-muted hover:text-bw-text cursor-pointer transition-colors bg-bw-elevated border border-white/[0.10]"
            title={responseSortMode === "time" ? "Tri chronologique" : "Tri par mise en avant"}
          >
            {responseSortMode === "time" ? "⏱ Chrono" : "⭐ Priorité"}
          </button>

          {/* Overflow menu for bulk actions */}
          <div className="relative">
            <button
              onClick={() => setOverflowOpen(!overflowOpen)}
              className="px-2 py-1 rounded-lg text-xs text-bw-muted hover:text-bw-text cursor-pointer transition-colors bg-bw-elevated border border-white/[0.10]"
              title="Plus d'actions"
            >
              ⋯
            </button>
            <AnimatePresence>
              {overflowOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setOverflowOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1.5 z-50 w-52 bg-bw-surface border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden"
                  >
                    <button
                      onClick={() => {
                        const ids = visibleResponses.filter((r) => !r.ai_score).map((r) => r.id);
                        if (ids.length === 0) { toast("Toutes les réponses sont déjà évaluées"); setOverflowOpen(false); return; }
                        aiEvaluate.mutate(ids.slice(0, 20));
                        setOverflowOpen(false);
                      }}
                      disabled={aiEvaluate.isPending}
                      className="w-full text-left px-3 py-2 text-xs text-bw-text hover:bg-white/[0.08] cursor-pointer transition-colors flex items-center gap-2 disabled:opacity-40"
                    >
                      <span className="w-5 text-center text-sm">🤖</span>
                      {aiEvaluate.isPending ? "Évaluation..." : "Évaluer par IA"}
                    </button>
                    {sessionStatus === "responding" && situation && (
                      <button
                        onClick={() => {
                          if (confirm("Relancer la question pour toute la classe ? Les réponses précédentes seront conservées.")) {
                            resetAllResponses.mutate(situation!.id);
                          }
                          setOverflowOpen(false);
                        }}
                        disabled={resetAllResponses.isPending}
                        className="w-full text-left px-3 py-2 text-xs text-bw-text hover:bg-white/[0.08] cursor-pointer transition-colors flex items-center gap-2 disabled:opacity-40"
                      >
                        <span className="w-5 text-center text-sm">🔄</span>
                        {resetAllResponses.isPending ? "Relance..." : "Relancer tous"}
                      </button>
                    )}
                    {visibleResponses.length > 2 && onHighlightAllVisible && (
                      <button
                        onClick={() => { onHighlightAllVisible(); setOverflowOpen(false); }}
                        className="w-full text-left px-3 py-2 text-xs text-bw-text hover:bg-white/[0.08] cursor-pointer transition-colors flex items-center gap-2"
                      >
                        <span className="w-5 text-center text-sm">⭐</span>
                        Tout projeter
                      </button>
                    )}
                    {visibleResponses.length > 2 && onHideAllVisible && (
                      <button
                        onClick={() => { onHideAllVisible(); setOverflowOpen(false); }}
                        className="w-full text-left px-3 py-2 text-xs text-bw-text hover:bg-white/[0.08] cursor-pointer transition-colors flex items-center gap-2"
                      >
                        <span className="w-5 text-center text-sm">👁</span>
                        Tout masquer
                      </button>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
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
        <div className="bg-bw-surface rounded-xl border border-white/[0.10] p-4 text-center">
          <p className="text-xs text-bw-muted">{searchQuery.trim() ? `Aucune réponse pour "${searchQuery}"` : "Aucune réponse dans ce filtre"}</p>
        </div>
      ) : sessionStatus === "responding" ? (
        <div
          className="rounded-xl border border-white/[0.08] p-8 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(78,205,196,0.04), rgba(139,92,246,0.03), transparent)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          {/* Animated progress ring */}
          <div className="relative w-16 h-16 mx-auto mb-3">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
              <motion.circle
                cx="32" cy="32" r="28" fill="none"
                stroke="url(#waitGradient)" strokeWidth="3" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 28}`}
                animate={{ strokeDashoffset: [2 * Math.PI * 28, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              />
              <defs>
                <linearGradient id="waitGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#4ECDC4" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.4" />
                </linearGradient>
              </defs>
            </svg>
            <motion.span
              className="absolute inset-0 flex items-center justify-center text-2xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              ✍️
            </motion.span>
          </div>
          <p className="text-sm text-bw-text font-semibold">En attente des réponses</p>
          <p className="text-xs text-bw-muted mt-1">
            <span className="tabular-nums font-medium text-bw-teal">{activeStudents.length}</span> élève{activeStudents.length > 1 ? "s" : ""} connecté{activeStudents.length > 1 ? "s" : ""}
          </p>
          <div className="flex justify-center gap-1.5 mt-3">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-bw-teal"
                animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                transition={{ repeat: Infinity, duration: 1.4, delay: i * 0.3, ease: "easeInOut" }}
              />
            ))}
          </div>
        </div>
      ) : null}

      {/* Pas encore répondu */}
      {sessionStatus === "responding" && (() => {
        const respondedIds = new Set(responses.map((r) => r.student_id));
        const notResponded = activeStudents.filter((s) => !respondedIds.has(s.id));
        if (notResponded.length === 0) return null;
        return (
          <div
            className="rounded-xl border border-white/[0.08] p-3 mt-2"
            style={{
              background: "linear-gradient(135deg, rgba(136,148,160,0.04), transparent)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 1px 3px rgba(0,0,0,0.12)",
            }}
          >
            <p className="text-xs uppercase tracking-wider font-semibold text-bw-muted mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-bw-muted/50" />
              Pas encore répondu ({notResponded.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {notResponded.map((s) => (
                <div key={s.id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-200">
                  <span className="text-sm">{s.avatar || "🎭"}</span>
                  <span className="text-xs text-bw-muted font-medium">{s.display_name || "Élève"}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
