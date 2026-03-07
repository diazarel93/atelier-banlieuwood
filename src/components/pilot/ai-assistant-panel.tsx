"use client";

import { useState, useEffect, useCallback, memo, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { computeCognitiveState, type CognitiveStateResult } from "@/components/pilot/class-cognitive-state";

// ═══════════════════════════════════════════════════════════════
// AI ASSISTANT — 4-bloc restructured panel
// Bloc 1: Alerts (hands + stuck)
// Bloc 2: Analyse IA (cognitive state + live stats)
// Bloc 3: Suggestions pédagogiques (grouped)
// Bloc 4: Qui a voté quoi (QCM vote columns)
// ═══════════════════════════════════════════════════════════════

interface SessionContext {
  status: string;
  responsesCount: number;
  totalStudents: number;
  stuckCount: number;
  stuckNames?: string[];
  handsRaised: number;
  handsNames?: string[];
  handsRaisedAt?: (string | null)[]; // timestamps for duration
  elapsedSeconds: number;
  currentModule: number;
  currentSeance: number;
  currentSituation: number;
  averageResponseTime?: number;
  optionDistribution?: Record<string, number>;
}

// QCM vote data passed from page.tsx
interface QCMVoteData {
  options: { key: string; label: string }[];
  votesByOption: Record<string, { avatar: string; name: string; id: string }[]>;
  totalVotes: number;
  totalStudents: number;
}

interface AISuggestion {
  id: string;
  type: "tip" | "alert" | "insight" | "action";
  message: string;
  priority: "low" | "medium" | "high";
  group?: "stimulation" | "interaction" | "analyse";
  actionLabel?: string;
  onAction?: () => void;
}

const SUGGESTION_ICONS: Record<string, string> = {
  tip: "💡",
  alert: "⚠️",
  insight: "📊",
  action: "🎬",
};

const PRIORITY_STYLES: Record<string, { bg: string; border: string; accent: string }> = {
  low: { bg: "rgba(247,243,234,0.7)", border: "rgba(239,228,216,0.6)", accent: "#6B8CFF" },
  medium: { bg: "rgba(255,248,240,0.7)", border: "rgba(240,223,200,0.6)", accent: "#F5A45B" },
  high: { bg: "rgba(255,244,232,0.7)", border: "rgba(240,212,184,0.6)", accent: "#E53935" },
};

const ACTION_COLORS: Record<string, string> = {
  "all-responded": "#4CAF50",
  "stuck-alert": "#F5A45B",
  "classe-partagee": "#E040FB",
  "slow-responses": "#6B8CFF",
  "low-participation": "#6B8CFF",
  "send-example": "#8B6914",
  "launch-debate": "#5B3A8E",
  "launch-poll": "#1B5E50",
};

const GROUP_LABELS: Record<string, { label: string; icon: string }> = {
  stimulation: { label: "Stimulation", icon: "💡" },
  interaction: { label: "Interaction", icon: "💬" },
  analyse: { label: "Analyse", icon: "📊" },
};

function generateSuggestions(ctx: SessionContext): AISuggestion[] {
  const suggestions: AISuggestion[] = [];

  // Stuck students — stimulation group
  if (ctx.stuckCount > 0 && ctx.status === "responding") {
    const names = ctx.stuckNames?.slice(0, 3);
    const nameStr = names?.length
      ? names.join(", ") + (ctx.stuckCount > 3 ? ` +${ctx.stuckCount - 3}` : "")
      : `${ctx.stuckCount} eleve${ctx.stuckCount > 1 ? "s" : ""}`;
    suggestions.push({
      id: "stuck-alert",
      type: "alert",
      message: ctx.stuckCount === 1
        ? `${nameStr} semble bloque. Donnez un exemple ou reformulez.`
        : `${nameStr} semblent bloques. Envisagez un indice ou une reformulation.`,
      priority: ctx.stuckCount >= 3 ? "high" : "medium",
      group: "stimulation",
      actionLabel: "Envoyer un indice",
    });
  }

  // Slow response → stimulation
  if (ctx.status === "responding" && ctx.elapsedSeconds > 120 && ctx.responsesCount < ctx.totalStudents * 0.5) {
    suggestions.push({
      id: "slow-responses",
      type: "insight",
      message: "Moins de la moitie ont repondu apres 2 min. Proposez un exemple concret.",
      priority: "medium",
      group: "stimulation",
      actionLabel: "Reformuler",
    });
  }

  // Send example — stimulation (new)
  if (ctx.status === "responding" && ctx.responsesCount > 0 && ctx.responsesCount < ctx.totalStudents * 0.5 && ctx.elapsedSeconds > 60) {
    suggestions.push({
      id: "send-example",
      type: "tip",
      message: "Proposer un exemple concret pour debloquer les hesitants.",
      priority: "low",
      group: "stimulation",
      actionLabel: "Exemple",
    });
  }

  // All responded → interaction
  if (ctx.status === "responding" && ctx.responsesCount === ctx.totalStudents && ctx.totalStudents > 0) {
    suggestions.push({
      id: "all-responded",
      type: "action",
      message: "Tous les eleves ont repondu ! Lancez le vote.",
      priority: "high",
      group: "interaction",
      actionLabel: "Lancer le vote",
    });
  }

  // Classe partagee → interaction (debate)
  if (ctx.optionDistribution) {
    const counts = Object.entries(ctx.optionDistribution).sort((a, b) => b[1] - a[1]);
    const totalVotes = counts.reduce((sum, [, v]) => sum + v, 0);
    if (totalVotes >= 3 && counts.length >= 2) {
      const [topKey, topCount] = counts[0];
      const [secondKey, secondCount] = counts[1];
      const topPct = (topCount / totalVotes) * 100;
      const secondPct = (secondCount / totalVotes) * 100;
      if (topPct >= 30 && secondPct >= 30 && (topPct - secondPct) < 15) {
        suggestions.push({
          id: "classe-partagee",
          type: "insight",
          message: `Classe partagee entre ${topKey.toUpperCase()} (${Math.round(topPct)}%) et ${secondKey.toUpperCase()} (${Math.round(secondPct)}%). Parfait pour un debat !`,
          priority: "high",
          group: "interaction",
          actionLabel: "Lancer un debat",
        });
      }
    }
  }

  // Low participation → interaction
  if (ctx.status === "responding" && ctx.totalStudents > 5 && ctx.responsesCount < 2 && ctx.elapsedSeconds > 60) {
    suggestions.push({
      id: "low-participation",
      type: "insight",
      message: "Tres peu de reponses. Lisez la question a voix haute ou donnez un exemple.",
      priority: "medium",
      group: "interaction",
      actionLabel: "Message classe",
    });
  }

  // Great engagement → analyse
  if (ctx.status === "responding" && ctx.responsesCount >= ctx.totalStudents * 0.8 && ctx.elapsedSeconds < 90) {
    suggestions.push({
      id: "good-pace",
      type: "tip",
      message: "Excellent rythme ! Les eleves sont tres engages.",
      priority: "low",
      group: "analyse",
    });
  }

  // Long session → analyse
  if (ctx.elapsedSeconds > 600) {
    suggestions.push({
      id: "long-session",
      type: "tip",
      message: "Plus de 10 minutes. Variez le rythme (vote, pause, discussion orale).",
      priority: "low",
      group: "analyse",
    });
  }

  return suggestions.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });
}

const VOTE_COLORS: Record<string, string> = { a: "#7EA7F5", b: "#F3A765", c: "#6EC6B0", d: "#E78BB4" };
const VOTE_BG: Record<string, string> = { a: "#EEF3FF", b: "#FFF3E8", c: "#E9F8F4", d: "#FDECF4" };

function AIAssistantPanelInner({
  context,
  onSendHint,
  onReformulate,
  onLaunchVote,
  onBroadcast,
  onDebate,
  qcmVoteData,
  onStudentClick,
}: {
  context: SessionContext;
  onSendHint?: () => void;
  onReformulate?: () => void;
  onLaunchVote?: () => void;
  onBroadcast?: () => void;
  onDebate?: () => void;
  qcmVoteData?: QCMVoteData;
  onStudentClick?: (id: string) => void;
}) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);

  const updateSuggestions = useCallback(() => {
    const newSuggestions = generateSuggestions(context).filter(
      (s) => !dismissed.has(s.id),
    );
    setSuggestions(newSuggestions);
  }, [context, dismissed]);

  useEffect(() => {
    updateSuggestions();
  }, [updateSuggestions]);

  const dismiss = useCallback((id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
  }, []);

  const activeSuggestions = suggestions.filter((s) => !dismissed.has(s.id));

  // Group suggestions
  const grouped = useMemo(() => {
    const groups: Record<string, AISuggestion[]> = { stimulation: [], interaction: [], analyse: [] };
    for (const s of activeSuggestions) {
      const g = s.group || "analyse";
      if (!groups[g]) groups[g] = [];
      groups[g].push(s);
    }
    return groups;
  }, [activeSuggestions]);

  // Cognitive state for analysis bloc
  const cognitiveState = useMemo<CognitiveStateResult | null>(
    () => computeCognitiveState(
      Array.from({ length: context.totalStudents }, (_, i) => {
        // Approximate state distribution from context numbers
        if (i < context.responsesCount) return { id: String(i), state: "responded" as const };
        if (i < context.responsesCount + context.stuckCount) return { id: String(i), state: "stuck" as const };
        return { id: String(i), state: "active" as const };
      }),
      context.optionDistribution,
    ),
    [context.totalStudents, context.responsesCount, context.stuckCount, context.optionDistribution],
  );

  // Hands sorted by duration (longest first)
  const sortedHands = useMemo(() => {
    if (!context.handsNames || context.handsNames.length === 0) return [];
    return context.handsNames.map((name, i) => {
      const ts = context.handsRaisedAt?.[i];
      const raisedMs = ts ? Date.now() - new Date(ts).getTime() : 0;
      const raisedMin = Math.floor(raisedMs / 60000);
      return { name, duration: raisedMin >= 1 ? `depuis ${raisedMin}min` : "a l'instant", ms: raisedMs };
    }).sort((a, b) => b.ms - a.ms);
  }, [context.handsNames, context.handsRaisedAt]);

  function handleSuggestionAction(suggestion: AISuggestion) {
    if (suggestion.id === "stuck-alert" && onSendHint) onSendHint();
    else if (suggestion.id === "slow-responses" && onReformulate) onReformulate();
    else if (suggestion.id === "send-example" && onBroadcast) onBroadcast();
    else if (suggestion.id === "all-responded" && onLaunchVote) onLaunchVote();
    else if (suggestion.id === "low-participation" && onBroadcast) onBroadcast();
    else if (suggestion.id === "classe-partagee" && onDebate) onDebate();
    dismiss(suggestion.id);
  }

  return (
    <div className="space-y-3">
      {/* ═══ BLOC 1: ALERTES — always on top ═══ */}
      {(sortedHands.length > 0 || context.stuckCount > 0) && (
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "rgba(255,244,232,0.6)", border: "1px solid rgba(232,168,87,0.15)" }}
        >
          <div className="px-3.5 py-2.5 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.4)" }}>
            <span className="text-sm">🔔</span>
            <span className="text-[12px] font-bold text-[#8B4513] uppercase tracking-wider">Alertes</span>
          </div>
          <div className="px-3.5 py-2 space-y-1.5">
            {/* Hands raised with duration */}
            {sortedHands.map((h, i) => (
              <div key={i} className="flex items-center gap-2 text-[12px]">
                <span className="text-sm flex-shrink-0">✋</span>
                <span className="font-semibold text-[#8B4513]">{h.name}</span>
                <span className="text-[10px] text-[#B0A99E]">{h.duration}</span>
              </div>
            ))}
            {/* Stuck names (not already shown in suggestions) */}
            {context.stuckNames && context.stuckNames.length > 0 && sortedHands.length === 0 && (
              <div className="flex items-center gap-2 text-[12px]">
                <span className="text-sm flex-shrink-0">⚠️</span>
                <span className="font-semibold text-[#C62828]">
                  {context.stuckNames.slice(0, 3).join(", ")}
                  {context.stuckCount > 3 ? ` +${context.stuckCount - 3}` : ""}
                  {" "}bloque{context.stuckCount > 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ BLOC 2: ANALYSE IA ═══ */}
      {context.status === "responding" && context.totalStudents > 0 && (
        <div
          className="rounded-xl p-3.5"
          style={{ background: "rgba(235,242,255,0.6)", border: "1px solid rgba(107,140,255,0.15)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">✨</span>
            <span className="text-[12px] font-bold text-[#3B5998]">Analyse en direct</span>
          </div>
          <div className="space-y-1.5">
            {/* Cognitive state phrase */}
            {cognitiveState && (
              <p className="text-[12px] font-semibold leading-relaxed" style={{ color: "#4A6FA5" }}>
                {cognitiveState.icon} {cognitiveState.text}
              </p>
            )}
            {/* Response rate */}
            <p className="text-[12px] text-[#4A6FA5] leading-relaxed">
              {Math.round((context.responsesCount / context.totalStudents) * 100)}% des eleves ont repondu
              {context.stuckCount > 0 ? ` — ${context.stuckCount} en difficulte.` : "."}
              {context.elapsedSeconds > 180 ? " Rythme lent, pensez a relancer." : ""}
              {context.responsesCount >= context.totalStudents * 0.8 && context.elapsedSeconds < 120 ? " Bonne dynamique !" : ""}
            </p>
          </div>
        </div>
      )}

      {/* ═══ BLOC 3: SUGGESTIONS PÉDAGOGIQUES — grouped ═══ */}
      {activeSuggestions.length > 0 && (
        <div className="space-y-2">
          {(["stimulation", "interaction", "analyse"] as const).map((groupKey) => {
            const items = grouped[groupKey];
            if (!items || items.length === 0) return null;
            const groupInfo = GROUP_LABELS[groupKey];
            return (
              <div key={groupKey}>
                <div className="flex items-center gap-1.5 mb-1.5 px-0.5">
                  <span className="text-[10px]">{groupInfo.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#B0A99E]">{groupInfo.label}</span>
                </div>
                <div className="space-y-1.5">
                  {items.map((suggestion, i) => {
                    const color = ACTION_COLORS[suggestion.id] || PRIORITY_STYLES[suggestion.priority]?.accent || "#6B8CFF";
                    return suggestion.actionLabel ? (
                      <motion.button
                        key={suggestion.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => handleSuggestionAction(suggestion)}
                        className="w-full rounded-xl p-3 text-left cursor-pointer transition-all hover:shadow-md group"
                        style={{
                          background: "rgba(255,255,255,0.7)",
                          border: `1.5px solid ${color}30`,
                          boxShadow: "0 1px 4px rgba(61,43,16,0.04)",
                        }}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0" style={{ background: `${color}15` }}>
                            {SUGGESTION_ICONS[suggestion.type]}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[12px] font-bold" style={{ color }}>{suggestion.actionLabel}</span>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
                                <path d="M9 18l6-6-6-6" />
                              </svg>
                            </div>
                            <p className="text-[11px] text-[#7A7A7A] leading-relaxed line-clamp-2">{suggestion.message}</p>
                          </div>
                        </div>
                      </motion.button>
                    ) : (
                      <motion.div
                        key={suggestion.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="rounded-xl p-3"
                        style={{ background: PRIORITY_STYLES[suggestion.priority]?.bg, border: `1px solid ${PRIORITY_STYLES[suggestion.priority]?.border}` }}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-sm flex-shrink-0 mt-0.5">{SUGGESTION_ICONS[suggestion.type]}</span>
                          <p className="flex-1 text-[12px] text-[#4A4A4A] leading-relaxed">{suggestion.message}</p>
                          <button onClick={() => dismiss(suggestion.id)} className="text-[#B0A99E] hover:text-[#7A7A7A] text-xs cursor-pointer flex-shrink-0">✕</button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ BLOC 4: QUI A VOTÉ QUOI (QCM only) ═══ */}
      {qcmVoteData && qcmVoteData.options.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.4)" }}>
          <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.5)" }}>
            <span className="text-[13px] font-semibold text-[#2C2C2C]">Qui a vote quoi</span>
            <span className="text-[13px] font-bold tabular-nums" style={{ color: qcmVoteData.totalVotes > 0 ? "#4CAF50" : "#B0A99E" }}>
              {qcmVoteData.totalVotes}/{qcmVoteData.totalStudents}
            </span>
          </div>
          <div className="max-h-[320px] overflow-y-auto px-3 py-2.5 space-y-2.5">
            {qcmVoteData.totalVotes === 0 ? (
              <div className="py-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[0, 1, 2].map(i => (
                    <motion.span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: "#F2C94C" }}
                      animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.3 }} />
                  ))}
                </div>
                <p className="text-[12px] text-[#B0A99E]">En attente des votes...</p>
              </div>
            ) : (
              qcmVoteData.options.map(opt => {
                const voters = qcmVoteData.votesByOption[opt.key] || [];
                if (voters.length === 0) return null;
                const color = VOTE_COLORS[opt.key] || "#7A7A7A";
                const bg = VOTE_BG[opt.key] || "#F7F3EA";
                return (
                  <div key={opt.key}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                        style={{ background: color }}>{opt.key.toUpperCase()}</span>
                      <span className="text-[12px] font-semibold text-[#4A4A4A] truncate">{opt.label}</span>
                      <span className="text-[11px] font-bold tabular-nums ml-auto flex-shrink-0" style={{ color }}>{voters.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 ml-7">
                      {voters.map(v => (
                        <motion.button key={v.id} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                          onClick={() => onStudentClick?.(v.id)}
                          className="flex items-center gap-1 h-6 px-2 rounded-full text-[11px] font-medium cursor-pointer transition-colors hover:brightness-95"
                          style={{ background: bg, border: `1px solid ${color}30`, color: "#4A4A4A" }}>
                          <span className="text-xs">{v.avatar}</span>
                          <span>{v.name.split(" ")[0]}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── Students in difficulty — avatars at bottom ── */}
      {context.stuckNames && context.stuckNames.length > 0 && (
        <div
          className="rounded-xl p-3"
          style={{
            background: "rgba(255,235,238,0.5)",
            border: "1px solid rgba(235,87,87,0.12)",
          }}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#C62828] mb-2 block">
            En difficulte ({context.stuckCount})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {context.stuckNames.slice(0, 6).map((name, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 h-6 px-2 rounded-lg text-[11px] font-medium"
                style={{ background: "rgba(255,255,255,0.7)", color: "#C62828", border: "1px solid rgba(235,87,87,0.15)" }}
              >
                {name}
              </span>
            ))}
            {context.stuckCount > 6 && (
              <span className="text-[11px] text-[#C62828] self-center">+{context.stuckCount - 6}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export const AIAssistantPanel = memo(AIAssistantPanelInner);
