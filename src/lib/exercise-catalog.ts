/**
 * Exercise Catalog — derived from MODULES + PHASES static data.
 * No new DB table needed. Used by the Bibliothèque page.
 */

import { MODULES, PHASES, type ModuleDef, type PhaseDef } from "./modules-data";

export interface ExerciseEntry {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  level: "all" | "primaire" | "college" | "lycee";
  phase: string;
  phaseLabel: string;
  phaseColor: string;
  phaseEmoji: string;
  questions: number;
  tags: string[];
  color: string;
}

function moduleToExercise(mod: ModuleDef, phase: PhaseDef | undefined): ExerciseEntry {
  const tags: string[] = [];
  if (mod.questions <= 3) tags.push("court");
  else if (mod.questions >= 8) tags.push("long");
  if (mod.iconKey === "image") tags.push("visuel");
  if (mod.id.startsWith("m10")) tags.push("imagination");
  if (mod.id.startsWith("m12")) tags.push("collectif");

  return {
    id: mod.id,
    title: mod.title,
    subtitle: mod.subtitle,
    description: mod.description,
    duration: mod.duration,
    level: "all",
    phase: phase?.id || "other",
    phaseLabel: phase?.label || "Autre",
    phaseColor: phase?.color || mod.color,
    phaseEmoji: phase?.emoji || "",
    questions: mod.questions,
    tags,
    color: mod.color,
  };
}

/**
 * Build the full exercise catalog from static module data.
 */
export function buildExerciseCatalog(): ExerciseEntry[] {
  return MODULES.filter((m) => !m.disabled && !m.comingSoon).map((mod) => {
    const phase = PHASES.find((p) => p.moduleIds.includes(mod.id));
    return moduleToExercise(mod, phase);
  });
}

/**
 * Get all unique phases from the catalog for filtering.
 */
export function getCatalogPhases(): { id: string; label: string; color: string; emoji: string }[] {
  const seen = new Set<string>();
  const result: { id: string; label: string; color: string; emoji: string }[] = [];

  for (const phase of PHASES) {
    if (!seen.has(phase.id)) {
      seen.add(phase.id);
      result.push({
        id: phase.id,
        label: phase.label,
        color: phase.color,
        emoji: phase.emoji,
      });
    }
  }

  return result;
}
