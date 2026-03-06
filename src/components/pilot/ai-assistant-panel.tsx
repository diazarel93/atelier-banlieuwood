"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "motion/react";

// ═══════════════════════════════════════════════════════════════
// AI ASSISTANT — Real-time suggestions for teachers
// Collapsible panel in the cockpit sidebar
// ═══════════════════════════════════════════════════════════════

interface SessionContext {
  status: string;
  responsesCount: number;
  totalStudents: number;
  stuckCount: number;
  handsRaised: number;
  elapsedSeconds: number;
  currentModule: number;
  currentSeance: number;
  currentSituation: number;
  averageResponseTime?: number;
}

interface AISuggestion {
  id: string;
  type: "tip" | "alert" | "insight" | "action";
  message: string;
  priority: "low" | "medium" | "high";
  actionLabel?: string;
  onAction?: () => void;
}

const SUGGESTION_ICONS: Record<string, string> = {
  tip: "💡",
  alert: "⚠️",
  insight: "📊",
  action: "🎬",
};

const PRIORITY_STYLES: Record<string, string> = {
  low: "border-white/[0.06] bg-white/[0.02]",
  medium: "border-bw-amber/20 bg-bw-amber/5",
  high: "border-bw-danger/20 bg-bw-danger/5",
};

function generateSuggestions(ctx: SessionContext): AISuggestion[] {
  const suggestions: AISuggestion[] = [];

  // Stuck students alert
  if (ctx.stuckCount > 0 && ctx.status === "responding") {
    suggestions.push({
      id: "stuck-alert",
      type: "alert",
      message: `${ctx.stuckCount} eleve${ctx.stuckCount > 1 ? "s" : ""} semble${ctx.stuckCount > 1 ? "nt" : ""} bloque${ctx.stuckCount > 1 ? "s" : ""}. Envisagez un indice ou une reformulation.`,
      priority: ctx.stuckCount >= 3 ? "high" : "medium",
      actionLabel: "Envoyer un indice",
    });
  }

  // Hands raised
  if (ctx.handsRaised > 0) {
    suggestions.push({
      id: "hands-raised",
      type: "alert",
      message: `${ctx.handsRaised} main${ctx.handsRaised > 1 ? "s" : ""} levee${ctx.handsRaised > 1 ? "s" : ""}. Quelqu'un a besoin d'aide !`,
      priority: "high",
    });
  }

  // Slow response rate
  if (ctx.status === "responding" && ctx.elapsedSeconds > 120 && ctx.responsesCount < ctx.totalStudents * 0.5) {
    suggestions.push({
      id: "slow-responses",
      type: "insight",
      message: "Moins de la moitie des eleves ont repondu apres 2 minutes. La question est peut-etre trop difficile.",
      priority: "medium",
      actionLabel: "Reformuler",
    });
  }

  // Great engagement
  if (ctx.status === "responding" && ctx.responsesCount >= ctx.totalStudents * 0.8 && ctx.elapsedSeconds < 90) {
    suggestions.push({
      id: "good-pace",
      type: "tip",
      message: "Excellent rythme ! Les eleves sont tres engages sur cette question.",
      priority: "low",
    });
  }

  // All responded
  if (ctx.status === "responding" && ctx.responsesCount === ctx.totalStudents && ctx.totalStudents > 0) {
    suggestions.push({
      id: "all-responded",
      type: "action",
      message: "Tous les eleves ont repondu ! Lancez le vote.",
      priority: "high",
      actionLabel: "Lancer le vote",
    });
  }

  // Long session
  if (ctx.elapsedSeconds > 600) {
    suggestions.push({
      id: "long-session",
      type: "tip",
      message: "Session en cours depuis plus de 10 minutes. Pensez a varier le rythme (vote rapide, pause, discussion orale).",
      priority: "low",
    });
  }

  // Low participation
  if (ctx.status === "responding" && ctx.totalStudents > 5 && ctx.responsesCount < 2 && ctx.elapsedSeconds > 60) {
    suggestions.push({
      id: "low-participation",
      type: "insight",
      message: "Tres peu de reponses. Essayez de lire la question a voix haute ou de donner un exemple.",
      priority: "medium",
    });
  }

  return suggestions.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });
}

function AIAssistantPanelInner({
  context,
  onSendHint,
  onReformulate,
}: {
  context: SessionContext;
  onSendHint?: () => void;
  onReformulate?: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
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
  const hasHighPriority = activeSuggestions.some((s) => s.priority === "high");

  return (
    <div className="rounded-xl border border-white/[0.06] overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-white/[0.03] transition-colors"
      >
        <div className="flex items-center gap-2">
          <motion.span
            animate={hasHighPriority ? { scale: [1, 1.2, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-sm"
          >
            🤖
          </motion.span>
          <span className="text-xs font-semibold text-bw-violet">Assistant IA</span>
          {activeSuggestions.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-bw-violet/20 text-bw-violet text-xs font-bold tabular-nums">
              {activeSuggestions.length}
            </span>
          )}
        </div>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-bw-muted transition-transform ${expanded ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2">
              {activeSuggestions.length === 0 ? (
                <p className="text-xs text-bw-muted text-center py-3">
                  Tout roule ! Pas de suggestion pour le moment.
                </p>
              ) : (
                activeSuggestions.map((suggestion, i) => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ delay: i * 0.05 }}
                    className={`rounded-lg border p-2.5 ${PRIORITY_STYLES[suggestion.priority]}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-sm flex-shrink-0 mt-0.5">
                        {SUGGESTION_ICONS[suggestion.type]}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-bw-text leading-relaxed">
                          {suggestion.message}
                        </p>
                        {suggestion.actionLabel && (
                          <button
                            onClick={() => {
                              if (suggestion.id === "stuck-alert" && onSendHint) onSendHint();
                              else if (suggestion.id === "slow-responses" && onReformulate) onReformulate();
                              dismiss(suggestion.id);
                            }}
                            className="mt-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-bw-violet/20 text-bw-violet hover:bg-bw-violet/30 transition-colors cursor-pointer"
                          >
                            {suggestion.actionLabel}
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => dismiss(suggestion.id)}
                        className="text-bw-muted hover:text-bw-text text-xs cursor-pointer flex-shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const AIAssistantPanel = memo(AIAssistantPanelInner);
