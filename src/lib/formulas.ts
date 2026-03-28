/**
 * Formula definitions for Banlieuwood session configurations.
 *
 * F0 — Découverte : 1 séance (55-60 min), terrain imminent
 * F1 — Légère : ~3 séances, modules M1-M5
 * F2 — Complète : ~8 séances, modules M1-M8
 *
 * Reference: SPEC_MODULES_VALIDATION_DEV.md — Section 2
 */

import type { SpecModuleId } from "./spec-modules";

export type FormulaId = "F0" | "F1" | "F2";

export type ModuleRole = "core" | "support" | "optional" | "probable" | "plausible" | "inactive";

export interface FormulaConfig {
  id: FormulaId;
  label: string;
  description: string;
  duration: string;
  sessionFormat: string;
  /** Role of each spec module in this formula */
  modules: Record<SpecModuleId, ModuleRole>;
  /** Ordered sequence of active modules for this formula */
  sequence: SpecModuleId[];
}

export const FORMULAS: Record<FormulaId, FormulaConfig> = {
  F0: {
    id: "F0",
    label: "Decouverte",
    description: "Seance unique de decouverte. Ideal pour un premier contact.",
    duration: "55-60 min",
    sessionFormat: "1 seance",
    modules: {
      M1: "core",
      M2: "optional", // B_QCM integre dans M3 B4a selon dynamique de groupe
      M3: "core",
      M4: "inactive",
      M5: "inactive",
      M6: "inactive",
      M7: "inactive",
      M8: "inactive",
    },
    sequence: ["M1", "M3"], // M2 (B_QCM) est integre dans le flux M3
  },
  F1: {
    id: "F1",
    label: "Legere",
    description: "Programme court sur ~3 seances. Observation, idee et pitch.",
    duration: "~3 x 60 min",
    sessionFormat: "3 seances minimum",
    modules: {
      M1: "support", // Rappel condense, pas re-enseigne integralement
      M2: "core",    // B_QCM enseigne formellement avant M3
      M3: "core",
      M4: "probable", // Non valide terrain — pitch individuel
      M5: "plausible", // Tres conditionnel — n'activer qu'apres M4 valide
      M6: "inactive",
      M7: "inactive",
      M8: "inactive",
    },
    sequence: ["M1", "M2", "M3", "M4", "M5"],
  },
  F2: {
    id: "F2",
    label: "Complete",
    description: "Programme complet avec tous les modules. Du regard au tournage.",
    duration: "~8 x 60 min",
    sessionFormat: "8 seances (noyau) + extensions",
    modules: {
      M1: "core",
      M2: "core",
      M3: "core",
      M4: "core",
      M5: "core",
      M6: "core",
      M7: "core",
      M8: "core",
    },
    sequence: ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8"],
  },
};

/**
 * Get the spec module IDs that are enabled (not inactive) for a formula.
 */
export function getEnabledModulesForFormula(formulaId: FormulaId): SpecModuleId[] {
  const config = FORMULAS[formulaId];
  return (Object.entries(config.modules) as [SpecModuleId, ModuleRole][])
    .filter(([, role]) => role !== "inactive")
    .map(([id]) => id);
}

/**
 * Get only the core modules for a formula.
 */
export function getCoreModulesForFormula(formulaId: FormulaId): SpecModuleId[] {
  const config = FORMULAS[formulaId];
  return (Object.entries(config.modules) as [SpecModuleId, ModuleRole][])
    .filter(([, role]) => role === "core")
    .map(([id]) => id);
}

/**
 * Check if a spec module is active (any role except inactive) in a formula.
 */
export function isModuleActiveInFormula(
  formulaId: FormulaId,
  specId: SpecModuleId,
): boolean {
  return FORMULAS[formulaId].modules[specId] !== "inactive";
}
