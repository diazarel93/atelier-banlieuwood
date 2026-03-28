"use client";

import { useState, useCallback, memo, useMemo, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { computeCognitiveState, type CognitiveStateResult } from "@/components/pilot/class-cognitive-state";
import { NarrativeRadar, computeNarrativeScores } from "@/components/pilot/narrative-radar";
import { ClassDynamicsRadar, computeClassDynamics } from "@/components/pilot/class-dynamics-radar";
import { AttentionPriority, computeAttentionQueue, type AttentionSignals } from "@/components/pilot/attention-priority";
import { generateSuggestions, type SessionContext, type AISuggestion } from "@/lib/ai-suggestions";

// ═══════════════════════════════════════════════════════════════
// AI ASSISTANT — 5-bloc restructured panel
// Pure suggestion logic extracted to src/lib/ai-suggestions.ts
// ═══════════════════════════════════════════════════════════════

// QCM vote data passed from page.tsx
interface QCMVoteData {
  options: { key: string; label: string }[];
  votesByOption: Record<string, { avatar: string; name: string; id: string }[]>;
  totalVotes: number;
  totalStudents: number;
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
  "total-silence": "#C62828",
};

const GROUP_LABELS: Record<string, { label: string; icon: string }> = {
  stimulation: { label: "Stimulation", icon: "💡" },
  interaction: { label: "Interaction", icon: "💬" },
  analyse: { label: "Analyse", icon: "📊" },
};

// ── Collapsible section for radars ──
function CollapsibleRadar({
  icon,
  label,
  color,
  bg,
  border,
  defaultOpen = false,
  children,
}: {
  icon: string;
  label: string;
  color: string;
  bg: string;
  border: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: bg, border: `1px solid ${border}` }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 cursor-pointer hover:brightness-95 transition-all"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">{icon}</span>
          <span className="text-[12px] font-bold" style={{ color }}>
            {label}
          </span>
        </div>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          style={{ opacity: 0.5 }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
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

  const suggestions = useMemo(
    () => generateSuggestions(context).filter((s) => !dismissed.has(s.id)),
    [context, dismissed],
  );

  const dismiss = useCallback((id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
  }, []);

  // Cognitive state for analysis bloc
  const cognitiveState = useMemo<CognitiveStateResult | null>(
    () =>
      computeCognitiveState(
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
    return context.handsNames
      .map((name, i) => {
        const ts = context.handsRaisedAt?.[i];
        const raisedMs = ts ? Date.now() - new Date(ts).getTime() : 0;
        const raisedMin = Math.floor(raisedMs / 60000);
        return { name, duration: raisedMin >= 1 ? `depuis ${raisedMin}min` : "a l'instant", ms: raisedMs };
      })
      .sort((a, b) => b.ms - a.ms);
  }, [context.handsNames, context.handsRaisedAt]);

  // Detect class division from optionDistribution
  const divisionInfo = useMemo(() => {
    if (!context.optionDistribution) return null;
    const counts = Object.entries(context.optionDistribution).sort((a, b) => b[1] - a[1]);
    const totalVotes = counts.reduce((sum, [, v]) => sum + v, 0);
    if (totalVotes < 3 || counts.length < 2) return null;
    const [topKey, topCount] = counts[0];
    const [secondKey, secondCount] = counts[1];
    const topPct = Math.round((topCount / totalVotes) * 100);
    const secondPct = Math.round((secondCount / totalVotes) * 100);
    if (topPct >= 30 && secondPct >= 30 && topPct - secondPct < 15) {
      return {
        isDivided: true,
        label: `${topKey.toUpperCase()} (${topPct}%) vs ${secondKey.toUpperCase()} (${secondPct}%)`,
      };
    }
    return null;
  }, [context.optionDistribution]);

  // Attention signals for priority system
  const attentionSignals = useMemo<AttentionSignals>(
    () => ({
      stuckCount: context.stuckCount,
      stuckNames: context.stuckNames,
      handsRaised: context.handsRaised,
      handsNames: context.handsNames,
      handsRaisedAt: context.handsRaisedAt,
      responsesCount: context.responsesCount,
      totalStudents: context.totalStudents,
      onlineStudents: context.totalStudents - (context.disconnectedCount || 0),
      elapsedSeconds: context.elapsedSeconds,
      status: context.status,
      isClassDivided: divisionInfo?.isDivided || false,
      divisionLabel: divisionInfo?.label,
    }),
    [
      context.stuckCount,
      context.stuckNames,
      context.handsRaised,
      context.handsNames,
      context.handsRaisedAt,
      context.responsesCount,
      context.totalStudents,
      context.disconnectedCount,
      context.elapsedSeconds,
      context.status,
      divisionInfo,
    ],
  );

  // Check if attention priority has an active alert (for deduplication)
  const attentionQueue = useMemo(() => computeAttentionQueue(attentionSignals), [attentionSignals]);
  const hasPrimaryAttention = attentionQueue.length > 0;
  const primaryCoversHands = attentionQueue[0]?.id === "urgent-hand" || attentionQueue[0]?.id === "multiple-hands";
  const primaryCoversStuck = attentionQueue[0]?.id === "mass-stuck";

  // Group suggestions — exclude those duplicated by attention priority
  const ATTENTION_COVERED_IDS = new Set(["stuck-alert", "total-silence", "all-responded", "classe-partagee"]);
  const grouped = useMemo(() => {
    const groups: Record<string, AISuggestion[]> = { stimulation: [], interaction: [], analyse: [] };
    for (const s of suggestions) {
      if (hasPrimaryAttention && ATTENTION_COVERED_IDS.has(s.id)) continue;
      const g = s.group || "analyse";
      if (!groups[g]) groups[g] = [];
      groups[g].push(s);
    }
    return groups;
  }, [suggestions, hasPrimaryAttention]);

  // Route attention actions to existing callbacks
  const handleAttentionAction = useCallback(
    (actionId: string) => {
      switch (actionId) {
        case "broadcast":
          onBroadcast?.();
          break;
        case "hint":
          onSendHint?.();
          break;
        case "debate":
          onDebate?.();
          break;
        case "vote":
          onLaunchVote?.();
          break;
        case "see-hand":
        case "see-alerts":
          // Scroll down to the alerts bloc
          break;
      }
    },
    [onBroadcast, onSendHint, onDebate, onLaunchVote],
  );

  function handleSuggestionAction(suggestion: AISuggestion) {
    if (suggestion.id === "stuck-alert" && onSendHint) onSendHint();
    else if (suggestion.id === "slow-responses" && onReformulate) onReformulate();
    else if (suggestion.id === "send-example" && onBroadcast) onBroadcast();
    else if (suggestion.id === "total-silence" && onBroadcast) onBroadcast();
    else if (suggestion.id === "all-responded" && onLaunchVote) onLaunchVote();
    else if (suggestion.id === "low-participation" && onBroadcast) onBroadcast();
    else if (suggestion.id === "classe-partagee" && onDebate) onDebate();
    dismiss(suggestion.id);
  }

  return (
    <div className="space-y-3">
      {/* ═══ BLOC 0: ATTENTION PRIORITY — single primary focus ═══ */}
      <AttentionPriority signals={attentionSignals} onAction={handleAttentionAction} />

      {/* ═══ BLOC 1: ALERTES — subdued when primary covers same signal ═══ */}
      {(sortedHands.length > 0 || context.stuckCount > 0) && (
        <div
          className="rounded-xl overflow-hidden transition-opacity duration-300"
          style={{
            background: "rgba(255,244,232,0.6)",
            border: "1px solid rgba(232,168,87,0.15)",
            opacity: hasPrimaryAttention ? 0.55 : 1,
          }}
        >
          <div
            className="px-3.5 py-2.5 flex items-center gap-2"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.4)" }}
          >
            <span className="text-sm">🔔</span>
            <span className="text-[12px] font-bold text-[#8B4513] uppercase tracking-wider">
              {hasPrimaryAttention ? "Details" : "Alertes"}
            </span>
          </div>
          <div className="px-3.5 py-2 space-y-1.5">
            {/* Hands raised with duration — always show for detail */}
            {sortedHands.map((h, i) => (
              <div key={i} className="flex items-center gap-2 text-[12px]">
                <span className="text-sm flex-shrink-0">✋</span>
                <span className="font-semibold text-[#8B4513]">{h.name}</span>
                <span className="text-[10px] text-[#B0A99E]">{h.duration}</span>
              </div>
            ))}
            {/* Stuck names */}
            {context.stuckNames && context.stuckNames.length > 0 && sortedHands.length === 0 && (
              <div className="flex items-center gap-2 text-[12px]">
                <span className="text-sm flex-shrink-0">⚠️</span>
                <span className="font-semibold text-[#C62828]">
                  {context.stuckNames.slice(0, 3).join(", ")}
                  {context.stuckCount > 3 ? ` +${context.stuckCount - 3}` : ""} bloque
                  {context.stuckCount > 1 ? "s" : ""}
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
          <div className="space-y-2">
            {/* Cognitive state phrase — skip "reflexion active" (already shown in left panel suggestion) */}
            {cognitiveState && cognitiveState.severity !== "calm" && (
              <p className="text-[12px] font-semibold leading-relaxed" style={{ color: "#4A6FA5" }}>
                {cognitiveState.icon} {cognitiveState.text}
              </p>
            )}
            {/* Contextual pedagogical advice — skips alerts already covered by AttentionPriority */}
            <p className="text-[12px] text-[#4A6FA5] leading-relaxed">
              {context.responsesCount === 0 && context.elapsedSeconds < 30
                ? "Les eleves decouvrent la question. Laissez-les lire."
                : context.responsesCount === 0 && context.elapsedSeconds >= 30 && context.elapsedSeconds < 90
                  ? "La classe reflechit. Pas de reponse encore — c'est normal."
                  : context.responsesCount === 0 && context.elapsedSeconds >= 90
                    ? // Silence — already handled by AttentionPriority, show softer version
                      hasPrimaryAttention
                      ? "La classe ne repond pas encore. Observez les reactions."
                      : "Aucune reponse apres 1min30. Reformulez ou donnez un exemple concret."
                    : context.responsesCount < context.totalStudents * 0.3 && context.stuckCount >= 3
                      ? // Stuck — already handled by AttentionPriority
                        hasPrimaryAttention
                        ? `${context.stuckCount} eleves en difficulte. Suivez la suggestion ci-dessus.`
                        : `${context.stuckCount} eleves bloques. Donnez un indice ou lisez la question a voix haute.`
                      : context.responsesCount < context.totalStudents * 0.3 && context.elapsedSeconds > 120
                        ? "Peu de reponses apres 2 min. Proposez un exemple pour debloquer."
                        : context.responsesCount < context.totalStudents * 0.5
                          ? `${Math.round((context.responsesCount / context.totalStudents) * 100)}% ont repondu. Encouragez les hesitants.`
                          : context.responsesCount >= context.totalStudents * 0.8 && context.elapsedSeconds < 120
                            ? "Excellente dynamique ! La classe est tres engagee."
                            : context.responsesCount >= context.totalStudents
                              ? hasPrimaryAttention
                                ? "Phase de reponse terminee."
                                : "Tout le monde a repondu. Lancez le vote ou passez a la discussion."
                              : `${Math.round((context.responsesCount / context.totalStudents) * 100)}% ont repondu. Rythme correct.`}
            </p>
            {/* Actionable micro-suggestion — only when AttentionPriority doesn't cover it */}
            {!hasPrimaryAttention && context.stuckCount > 0 && context.stuckCount < 3 && (
              <p className="text-[11px] italic" style={{ color: "#7B9BD4" }}>
                Conseil : cliquez sur un eleve bloque pour lui envoyer un indice prive.
              </p>
            )}
            {!hasPrimaryAttention && context.responsesCount > 0 && context.responsesCount === context.totalStudents && (
              <p className="text-[11px] italic" style={{ color: "#7B9BD4" }}>
                Conseil : comparez les reponses ou lancez un debat.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ═══ BLOC 2.5: RADAR NARRATIF (hidden until responses arrive) ═══ */}
      {context.completedModules &&
        context.completedModules.length > 0 &&
        context.responsesCount > 0 &&
        (() => {
          const responsePct =
            context.totalStudents > 0 ? Math.round((context.responsesCount / context.totalStudents) * 100) : 0;
          const stuckPct =
            context.totalStudents > 0 ? Math.round((context.stuckCount / context.totalStudents) * 100) : 0;
          const radarScores = computeNarrativeScores(
            context.completedModules!,
            context.totalModuleCount || 20,
            context.currentPhaseId || null,
            responsePct,
            stuckPct,
          );
          return (
            <CollapsibleRadar
              icon="🎯"
              label="Radar narratif"
              color="#6B3FA0"
              bg="rgba(245,243,255,0.6)"
              border="rgba(139,92,246,0.12)"
            >
              <NarrativeRadar scores={radarScores} size={170} />
            </CollapsibleRadar>
          );
        })()}

      {/* ═══ BLOC 2.75: RADAR DYNAMIQUE DE CLASSE (hidden until responses arrive) ═══ */}
      {context.status === "responding" &&
        context.totalStudents > 0 &&
        context.responsesCount > 0 &&
        (() => {
          const optSpread = (() => {
            if (!context.optionDistribution) return 0;
            const counts = Object.values(context.optionDistribution);
            const total = counts.reduce((s, c) => s + c, 0);
            if (total < 2 || counts.length < 2) return 0;
            const sorted = [...counts].sort((a, b) => b - a);
            return sorted.length >= 2 ? Math.min(1, sorted[1] / sorted[0]) : 0;
          })();
          const dynamicsScores = computeClassDynamics({
            responsePct: context.totalStudents > 0 ? (context.responsesCount / context.totalStudents) * 100 : 0,
            avgResponseTimeSec: context.averageResponseTime || 0,
            stuckPct: context.totalStudents > 0 ? (context.stuckCount / context.totalStudents) * 100 : 0,
            handsRaisedPct: context.totalStudents > 0 ? (context.handsRaised / context.totalStudents) * 100 : 0,
            optionSpread: optSpread,
            activeTimeSec: context.elapsedSeconds,
            disconnectedPct:
              context.totalStudents > 0 ? ((context.disconnectedCount || 0) / context.totalStudents) * 100 : 0,
            totalResponses: context.responsesCount,
            totalStudents: context.totalStudents,
          });
          return (
            <CollapsibleRadar
              icon="📡"
              label="Dynamique de classe"
              color="#3B5998"
              bg="rgba(59,89,152,0.04)"
              border="rgba(59,89,152,0.10)"
            >
              <ClassDynamicsRadar scores={dynamicsScores} size={160} />
            </CollapsibleRadar>
          );
        })()}

      {/* ═══ BLOC 3: SUGGESTIONS PÉDAGOGIQUES — grouped ═══ */}
      {suggestions.length > 0 && (
        <div className="space-y-2">
          {(["stimulation", "interaction", "analyse"] as const).map((groupKey) => {
            const items = grouped[groupKey];
            if (!items || items.length === 0) return null;
            const groupInfo = GROUP_LABELS[groupKey];
            return (
              <div key={groupKey}>
                <div className="flex items-center gap-1.5 mb-1.5 px-0.5">
                  <span className="text-[10px]">{groupInfo.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#B0A99E]">
                    {groupInfo.label}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {items.map((suggestion, i) => {
                    const color =
                      ACTION_COLORS[suggestion.id] || PRIORITY_STYLES[suggestion.priority]?.accent || "#6B8CFF";
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
                          <span
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                            style={{ background: `${color}15` }}
                          >
                            {SUGGESTION_ICONS[suggestion.type]}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[12px] font-bold" style={{ color }}>
                                {suggestion.actionLabel}
                              </span>
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke={color}
                                strokeWidth="2"
                                strokeLinecap="round"
                                className="flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity"
                              >
                                <path d="M9 18l6-6-6-6" />
                              </svg>
                            </div>
                            <p className="text-[11px] text-[#7A7A7A] leading-relaxed line-clamp-2">
                              {suggestion.message}
                            </p>
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
                        style={{
                          background: PRIORITY_STYLES[suggestion.priority]?.bg,
                          border: `1px solid ${PRIORITY_STYLES[suggestion.priority]?.border}`,
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-sm flex-shrink-0 mt-0.5">{SUGGESTION_ICONS[suggestion.type]}</span>
                          <p className="flex-1 text-[12px] text-[#4A4A4A] leading-relaxed">{suggestion.message}</p>
                          <button
                            onClick={() => dismiss(suggestion.id)}
                            className="text-[#B0A99E] hover:text-[#7A7A7A] text-xs cursor-pointer flex-shrink-0"
                          >
                            ✕
                          </button>
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
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.4)" }}
        >
          <div
            className="px-4 py-2.5 flex items-center justify-between"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.5)" }}
          >
            <span className="text-[13px] font-semibold text-[#2C2C2C]">Qui a vote quoi</span>
            <span
              className="text-[13px] font-bold tabular-nums"
              style={{ color: qcmVoteData.totalVotes > 0 ? "#4CAF50" : "#B0A99E" }}
            >
              {qcmVoteData.totalVotes}/{qcmVoteData.totalStudents}
            </span>
          </div>
          <div className="max-h-[320px] overflow-y-auto px-3 py-2.5 space-y-2.5">
            {qcmVoteData.totalVotes === 0 ? (
              <div className="py-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "#F2C94C" }}
                      animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.3 }}
                    />
                  ))}
                </div>
                <p className="text-[12px] text-[#B0A99E]">En attente des votes...</p>
              </div>
            ) : (
              qcmVoteData.options.map((opt) => {
                const voters = qcmVoteData.votesByOption[opt.key] || [];
                if (voters.length === 0) return null;
                const color = VOTE_COLORS[opt.key] || "#7A7A7A";
                const bg = VOTE_BG[opt.key] || "#1a1a35";
                return (
                  <div key={opt.key}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                        style={{ background: color }}
                      >
                        {opt.key.toUpperCase()}
                      </span>
                      <span className="text-[12px] font-semibold text-[#4A4A4A] truncate">{opt.label}</span>
                      <span className="text-[11px] font-bold tabular-nums ml-auto flex-shrink-0" style={{ color }}>
                        {voters.length}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 ml-7">
                      {voters.map((v) => (
                        <motion.button
                          key={v.id}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          onClick={() => onStudentClick?.(v.id)}
                          className="flex items-center gap-1 h-6 px-2 rounded-full text-[11px] font-medium cursor-pointer transition-colors hover:brightness-95"
                          style={{ background: bg, border: `1px solid ${color}30`, color: "#4A4A4A" }}
                        >
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
                style={{
                  background: "rgba(255,255,255,0.7)",
                  color: "#C62828",
                  border: "1px solid rgba(235,87,87,0.15)",
                }}
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
