import { describe, it, expect } from "vitest";
import {
  SPEC_MODULES,
  getSpecModuleFromDb,
  getDbMappingsForSpec,
  isExtraModule,
  getAllSpecModuleIds,
  getSpecModule,
} from "@/lib/spec-modules";
import { MODULES } from "@/lib/modules-data";

describe("SPEC_MODULES", () => {
  it("defines exactly 8 spec modules M1-M8", () => {
    expect(SPEC_MODULES).toHaveLength(8);
    expect(SPEC_MODULES.map((m) => m.specId)).toEqual(["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8"]);
  });

  it("every spec module except M2 has at least one dbMapping", () => {
    for (const sm of SPEC_MODULES) {
      if (sm.specId === "M2") continue; // M2 = B_QCM, embedded in M3
      expect(sm.dbMappings.length).toBeGreaterThan(0);
    }
  });

  it("every spec module except M2 has at least one moduleId", () => {
    for (const sm of SPEC_MODULES) {
      if (sm.specId === "M2") continue; // M2 = B_QCM, embedded in M3
      expect(sm.moduleIds.length).toBeGreaterThan(0);
    }
  });
});

describe("getSpecModuleFromDb", () => {
  it("maps dbModule 1 to M1", () => {
    expect(getSpecModuleFromDb(1)?.specId).toBe("M1");
  });

  it("M2 has no dbModule (B_QCM embedded in M3 flow)", () => {
    // M2 = B_QCM only, embedded in M3's etsi-writer
    // dbModule 2 ("Émotion Cachée") is legacy bonus
    const m2 = getSpecModule("M2");
    expect(m2?.dbMappings).toEqual([]);
    expect(m2?.moduleIds).toEqual([]);
  });

  it("dbModule 2 is a bonus module (not spec M2)", () => {
    expect(isExtraModule(2)).toBe(true);
    expect(getSpecModuleFromDb(2)).toBeUndefined();
  });

  it("maps dbModule 10 seance 1 to M3", () => {
    expect(getSpecModuleFromDb(10, 1)?.specId).toBe("M3");
  });

  it("maps dbModule 10 seance 2 to M4", () => {
    expect(getSpecModuleFromDb(10, 2)?.specId).toBe("M4");
  });

  it("maps dbModule 12 to M5", () => {
    expect(getSpecModuleFromDb(12)?.specId).toBe("M5");
  });

  it("maps dbModule 5 to M6", () => {
    expect(getSpecModuleFromDb(5)?.specId).toBe("M6");
  });

  it("maps dbModule 7 to M7", () => {
    expect(getSpecModuleFromDb(7)?.specId).toBe("M7");
  });

  it("maps dbModule 8 to M8", () => {
    expect(getSpecModuleFromDb(8)?.specId).toBe("M8");
  });

  it("returns undefined for bonus modules", () => {
    expect(getSpecModuleFromDb(2)).toBeUndefined(); // "Émotion Cachée" = bonus
    expect(getSpecModuleFromDb(3)).toBeUndefined();
    expect(getSpecModuleFromDb(9)).toBeUndefined();
    expect(getSpecModuleFromDb(11)).toBeUndefined();
    expect(getSpecModuleFromDb(13)).toBeUndefined();
  });
});

describe("getDbMappingsForSpec", () => {
  it("returns correct dbModule for M1", () => {
    const mappings = getDbMappingsForSpec("M1");
    expect(mappings).toEqual([{ dbModule: 1 }]);
  });

  it("returns correct dbModule+seance for M3", () => {
    const mappings = getDbMappingsForSpec("M3");
    expect(mappings).toEqual([{ dbModule: 10, dbSeance: 1 }]);
  });
});

describe("isExtraModule", () => {
  it("identifies bonus dbModules", () => {
    expect(isExtraModule(2)).toBe(true); // "Émotion Cachée" = bonus
    expect(isExtraModule(3)).toBe(true);
    expect(isExtraModule(4)).toBe(true);
    expect(isExtraModule(9)).toBe(true);
    expect(isExtraModule(11)).toBe(true);
    expect(isExtraModule(13)).toBe(true);
  });

  it("returns false for spec modules", () => {
    expect(isExtraModule(1)).toBe(false);
    expect(isExtraModule(5)).toBe(false);
    expect(isExtraModule(7)).toBe(false);
    expect(isExtraModule(8)).toBe(false);
    expect(isExtraModule(10)).toBe(false);
    expect(isExtraModule(12)).toBe(false);
  });
});

describe("getAllSpecModuleIds", () => {
  it("returns M1-M8 in order", () => {
    expect(getAllSpecModuleIds()).toEqual(["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8"]);
  });
});

describe("getSpecModule", () => {
  it("returns spec module by ID", () => {
    const m3 = getSpecModule("M3");
    expect(m3?.specName).toBe("Generer l'idee");
    expect(m3?.arc).toBe("T2");
    expect(m3?.maturity).toBe("A");
  });
});

describe("MODULES specModule consistency", () => {
  it("every non-bonus MODULES entry has a specModule", () => {
    const specEntries = MODULES.filter((m) => !m.bonus && !m.disabled);
    for (const m of specEntries) {
      expect(m.specModule, `Module ${m.id} should have specModule`).toBeDefined();
    }
  });

  it("every bonus MODULES entry has no specModule", () => {
    const bonusEntries = MODULES.filter((m) => m.bonus);
    for (const m of bonusEntries) {
      expect(m.specModule, `Bonus module ${m.id} should not have specModule`).toBeUndefined();
    }
  });
});
