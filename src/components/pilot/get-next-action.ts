// Guided flow: the next logical action based on current status

export interface NextAction {
  label: string;
  action: string;
  color: string;
  disabled?: boolean;
  shortcut?: string;
}

export function getNextAction(
  status: string,
  visibleCount: number,
  voteOptionCount: number,
  hasVoteResults: boolean,
  currentModule: number,
  budgetSubmitted: number,
  canGoNext?: boolean,
  currentSeance?: number,
  currentSituationIndex?: number
): NextAction | null {
  // Module 9 séance 2 = budget quiz (special flow, old Module 2)
  const isBudgetQuiz = currentModule === 9 && currentSeance === 2;

  // Module 2 special flows — Émotion Cachée (checklist s1i0, scene builder s2i1)
  if (currentModule === 2) {
    const isChecklist = currentSeance === 1 && currentSituationIndex === 0;
    const isSceneBuilder = currentSeance === 2 && currentSituationIndex === 1;

    if (isChecklist || isSceneBuilder) {
      switch (status) {
        case "waiting":
          return { label: "Ouvrir", action: "responding", color: "#EC4899", shortcut: "N" };
        case "responding":
          return { label: "Question suivante", action: "next", color: "#4ECDC4", shortcut: "N" };
        default:
          return null;
      }
    }
    // Standard Q&A for other module 2 EC steps — fall through to default handler
  }

  if (currentModule === 1) {
    const isImageSeance = currentSeance && currentSeance >= 2 && currentSeance <= 4;
    switch (status) {
      case "waiting":
        return { label: "Ouvrir les réponses", action: "responding", color: "#8B5CF6", shortcut: "N" };
      case "responding":
        if (isImageSeance) {
          // Image séances: go to reviewing for confrontation
          if (visibleCount === 0) return null;
          return { label: "Voir les réponses", action: "reviewing", color: "#8B5CF6", shortcut: "N" };
        }
        // Positioning: auto-advance handled by situation_index, or done
        if (canGoNext === false) {
          return { label: "Terminer le module", action: "done-module", color: "#10B981", shortcut: "N" };
        }
        return { label: "Question suivante", action: "next", color: "#4ECDC4", shortcut: "N" };
      case "reviewing":
        // Image confrontation: teacher is reviewing, highlight 2 responses → project
        return { label: "Terminer le module", action: "done-module", color: "#10B981", shortcut: "N" };
      case "done":
        return null;
      default:
        return null;
    }
  }

  // Module 10 — Et si... + Pitch: special components advance with "next"
  if (currentModule === 10) {
    switch (status) {
      case "waiting":
        return { label: "Ouvrir", action: "responding", color: "#06B6D4", shortcut: "N" };
      case "responding":
        if (canGoNext === false) {
          return { label: "Terminer le module", action: "done-module", color: "#10B981", shortcut: "N" };
        }
        return { label: "Étape suivante", action: "next", color: "#06B6D4", shortcut: "N" };
      case "done":
        return null;
      default:
        return null;
    }
  }

  if (isBudgetQuiz) {
    switch (status) {
      case "waiting":
        return { label: "Lancer les choix", action: "responding", color: "#4ECDC4", shortcut: "N" };
      case "responding":
        if (budgetSubmitted === 0) return null;
        return { label: `Terminer (${budgetSubmitted} soumis)`, action: "reviewing", color: "#8B5CF6", shortcut: "N" };
      case "reviewing":
        return { label: "Terminé", action: "done-module", color: "#10B981", shortcut: "N" };
      default:
        return null;
    }
  }

  switch (status) {
    case "waiting":
      return { label: "Ouvrir les réponses", action: "responding", color: "#4ECDC4", shortcut: "N" };
    case "responding":
      if (visibleCount === 0) return null;
      if (voteOptionCount < 2) return { label: `Sélectionner pour le vote (${voteOptionCount}/2 min)`, action: "", color: "#888", disabled: true };
      return { label: `Lancer le vote (${voteOptionCount} options)`, action: "voting", color: "#FF6B35", shortcut: "N" };
    case "voting":
      if (!hasVoteResults) return null;
      return { label: "Voir les résultats", action: "reviewing", color: "#8B5CF6", shortcut: "N" };
    case "reviewing":
      return { label: "Question suivante", action: "next", color: "#4ECDC4", shortcut: "N" };
    default:
      return null;
  }
}
