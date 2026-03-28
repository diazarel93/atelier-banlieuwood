/**
 * Spec Module Mapping — Source of truth for Banlieuwood M1-M8 ↔ code dbModules.
 *
 * The official Banlieuwood spec defines 8 pedagogical modules (M1-M8).
 * The codebase uses dbModule numbers (1-13) that don't map 1:1.
 * This file provides the canonical mapping and helper functions.
 *
 * Reference: docs/_A_ENVOYER_AU_DEV/VALIDATION_MODULES/SPEC_MODULES_VALIDATION_DEV.md
 */

export type SpecModuleId = "M1" | "M2" | "M3" | "M4" | "M5" | "M6" | "M7" | "M8";

export type Maturity = "A" | "B" | "C";

export type Arc = "T1" | "T2" | "T3" | "T4";

export interface SpecModuleDef {
  specId: SpecModuleId;
  specName: string;
  arc: Arc;
  arcLabel: string;
  maturity: Maturity;
  /** Which dbModule(s) + dbSeance(s) implement this spec module */
  dbMappings: { dbModule: number; dbSeance?: number }[];
  /** Which MODULES[].id entries belong to this spec module */
  moduleIds: string[];
  /** Which PHASES[].id this maps to */
  phaseId: string;
}

export const SPEC_MODULES: SpecModuleDef[] = [
  {
    specId: "M1",
    specName: "Le Regard",
    arc: "T1",
    arcLabel: "Observer",
    maturity: "A",
    dbMappings: [{ dbModule: 1 }],
    moduleIds: ["m1a", "m1b", "m1c", "m1d", "m1e"],
    phaseId: "regard",
  },
  {
    specId: "M2",
    specName: "Le Mecanisme d'une scene",
    arc: "T1",
    arcLabel: "Observer",
    maturity: "A",
    // M2 = B_QCM only. In F0: integrated in M3 B4a flow. In F1/F2: standalone before M3.
    // dbModule 2 ("Émotion Cachée") is legacy/bonus, NOT spec M2.
    // B_QCM content lives in etsi-writer QCMs (part of dbModule 10 seance 1).
    // M2 has no independent dbModule — it's embedded in M3's flow.
    dbMappings: [],
    moduleIds: [],
    phaseId: "etsi", // Embedded within M3 "Générer l'idée" flow
  },
  {
    specId: "M3",
    specName: "Generer l'idee",
    arc: "T2",
    arcLabel: "Imaginer / Structurer",
    maturity: "A",
    dbMappings: [{ dbModule: 10, dbSeance: 1 }],
    moduleIds: ["m10a"],
    phaseId: "etsi",
  },
  {
    specId: "M4",
    specName: "Le Pitch",
    arc: "T2",
    arcLabel: "Imaginer / Structurer",
    maturity: "B",
    dbMappings: [{ dbModule: 10, dbSeance: 2 }],
    moduleIds: ["m10b"],
    phaseId: "pitch",
  },
  {
    specId: "M5",
    specName: "Le Recit",
    arc: "T2",
    arcLabel: "Imaginer / Structurer",
    maturity: "B",
    dbMappings: [{ dbModule: 12 }],
    moduleIds: ["m12a"],
    phaseId: "collectif",
  },
  {
    specId: "M6",
    specName: "Le Scenario",
    arc: "T3",
    arcLabel: "Produire",
    maturity: "C",
    dbMappings: [{ dbModule: 5 }],
    moduleIds: ["m6"],
    phaseId: "scenario",
  },
  {
    specId: "M7",
    specName: "La Mise en scene",
    arc: "T3",
    arcLabel: "Produire",
    maturity: "C",
    dbMappings: [{ dbModule: 7 }],
    moduleIds: ["m7"],
    phaseId: "mise-en-scene",
  },
  {
    specId: "M8",
    specName: "L'Equipe",
    arc: "T4",
    arcLabel: "Restituer",
    maturity: "C",
    dbMappings: [{ dbModule: 8 }],
    moduleIds: ["m8"],
    phaseId: "equipe",
  },
];

/** dbModule numbers that are outside the M1-M8 spec (bonus/legacy) */
const EXTRA_DB_MODULES = new Set([2, 3, 4, 9, 11, 13]);

/**
 * Get the spec module definition for a given code dbModule + dbSeance.
 * Returns undefined for bonus modules (3, 4, 9, 11, 13).
 */
export function getSpecModuleFromDb(dbModule: number, dbSeance?: number): SpecModuleDef | undefined {
  return SPEC_MODULES.find((sm) =>
    sm.dbMappings.some((m) => m.dbModule === dbModule && (m.dbSeance == null || m.dbSeance === dbSeance)),
  );
}

/**
 * Get all dbModule mappings for a given spec module ID.
 */
export function getDbMappingsForSpec(specId: SpecModuleId): { dbModule: number; dbSeance?: number }[] {
  const spec = SPEC_MODULES.find((sm) => sm.specId === specId);
  return spec?.dbMappings ?? [];
}

/**
 * Check if a dbModule number is a bonus/legacy module outside the M1-M8 spec.
 */
export function isExtraModule(dbModule: number): boolean {
  return EXTRA_DB_MODULES.has(dbModule);
}

/**
 * Get all spec module IDs as an ordered array.
 */
export function getAllSpecModuleIds(): SpecModuleId[] {
  return SPEC_MODULES.map((sm) => sm.specId);
}

/**
 * Get a spec module by its ID.
 */
export function getSpecModule(specId: SpecModuleId): SpecModuleDef | undefined {
  return SPEC_MODULES.find((sm) => sm.specId === specId);
}
