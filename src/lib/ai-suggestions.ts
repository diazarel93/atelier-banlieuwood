// ═══════════════════════════════════════════════════════
// AI Suggestions — Pure logic for cockpit pedagogical suggestions
// Extracted from ai-assistant-panel.tsx for testability
// ═══════════════════════════════════════════════════════

export interface SessionContext {
  status: string;
  responsesCount: number;
  totalStudents: number;
  stuckCount: number;
  stuckNames?: string[];
  handsRaised: number;
  handsNames?: string[];
  handsRaisedAt?: (string | null)[];
  elapsedSeconds: number;
  currentModule: number;
  currentSeance: number;
  currentSituation: number;
  averageResponseTime?: number;
  optionDistribution?: Record<string, number>;
  completedModules?: string[];
  currentPhaseId?: string | null;
  totalModuleCount?: number;
  disconnectedCount?: number;
}

export interface AISuggestion {
  id: string;
  type: "tip" | "alert" | "insight" | "action";
  message: string;
  priority: "low" | "medium" | "high";
  group?: "stimulation" | "interaction" | "analyse";
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Generate pedagogical suggestions based on session state.
 * Returns suggestions sorted by priority (high first).
 */
export function generateSuggestions(ctx: SessionContext): AISuggestion[] {
  const suggestions: AISuggestion[] = [];

  // Stuck students
  if (ctx.stuckCount > 0 && ctx.status === "responding") {
    const names = ctx.stuckNames?.slice(0, 3);
    const nameStr = names?.length
      ? names.join(", ") + (ctx.stuckCount > 3 ? ` +${ctx.stuckCount - 3}` : "")
      : `${ctx.stuckCount} eleve${ctx.stuckCount > 1 ? "s" : ""}`;
    suggestions.push({
      id: "stuck-alert",
      type: "alert",
      message:
        ctx.stuckCount === 1
          ? `${nameStr} semble bloque. Donnez un exemple ou reformulez.`
          : `${nameStr} semblent bloques. Envisagez un indice ou une reformulation.`,
      priority: ctx.stuckCount >= 3 ? "high" : "medium",
      group: "stimulation",
      actionLabel: "Envoyer un indice",
    });
  }

  // Slow response
  if (ctx.status === "responding" && ctx.elapsedSeconds > 120 && ctx.responsesCount < ctx.totalStudents * 0.5) {
    suggestions.push({
      id: "slow-responses",
      type: "insight",
      message:
        "Peu de reponses apres 2 min. Reformulez la question ou donnez un exemple concret pour debloquer la classe.",
      priority: "medium",
      group: "stimulation",
      actionLabel: "Reformuler la question",
    });
  }

  // Send example
  if (
    ctx.status === "responding" &&
    ctx.responsesCount > 0 &&
    ctx.responsesCount < ctx.totalStudents * 0.5 &&
    ctx.elapsedSeconds > 60
  ) {
    suggestions.push({
      id: "send-example",
      type: "tip",
      message: "Les hesitants ont besoin d'un declic. Envoyez un exemple concret ou une piste de reflexion.",
      priority: "low",
      group: "stimulation",
      actionLabel: "Envoyer un exemple",
    });
  }

  // Early silence
  if (ctx.status === "responding" && ctx.responsesCount === 0 && ctx.elapsedSeconds > 90 && ctx.totalStudents > 3) {
    suggestions.push({
      id: "total-silence",
      type: "alert",
      message: "Aucune reponse. Lisez la question a voix haute ou proposez un premier element de reponse.",
      priority: "high",
      group: "stimulation",
      actionLabel: "Relancer la classe",
    });
  }

  // All responded
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

  // Classe partagee
  if (ctx.optionDistribution) {
    const counts = Object.entries(ctx.optionDistribution).sort((a, b) => b[1] - a[1]);
    const totalVotes = counts.reduce((sum, [, v]) => sum + v, 0);
    if (totalVotes >= 3 && counts.length >= 2) {
      const [topKey, topCount] = counts[0];
      const [secondKey, secondCount] = counts[1];
      const topPct = (topCount / totalVotes) * 100;
      const secondPct = (secondCount / totalVotes) * 100;
      if (topPct >= 30 && secondPct >= 30 && topPct - secondPct < 15) {
        suggestions.push({
          id: "classe-partagee",
          type: "insight",
          message: `La classe hesite entre ${topKey.toUpperCase()} (${Math.round(topPct)}%) et ${secondKey.toUpperCase()} (${Math.round(secondPct)}%). Moment ideal pour un debat — demandez a chaque camp de justifier.`,
          priority: "high",
          group: "interaction",
          actionLabel: "Lancer un debat",
        });
      }
    }
  }

  // Low participation
  if (ctx.status === "responding" && ctx.totalStudents > 5 && ctx.responsesCount < 2 && ctx.elapsedSeconds > 60) {
    suggestions.push({
      id: "low-participation",
      type: "insight",
      message: "La classe est silencieuse. Relancez a l'oral ou envoyez un message d'encouragement collectif.",
      priority: "medium",
      group: "interaction",
      actionLabel: "Encourager la classe",
    });
  }

  // Great engagement
  if (ctx.status === "responding" && ctx.responsesCount >= ctx.totalStudents * 0.8 && ctx.elapsedSeconds < 90) {
    suggestions.push({
      id: "good-pace",
      type: "tip",
      message: "Excellent rythme ! Les eleves sont tres engages.",
      priority: "low",
      group: "analyse",
    });
  }

  // Long session
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
