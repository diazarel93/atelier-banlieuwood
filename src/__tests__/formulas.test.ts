import { describe, it, expect } from "vitest";
import {
  FORMULAS,
  getEnabledModulesForFormula,
  getCoreModulesForFormula,
  isModuleActiveInFormula,
} from "@/lib/formulas";

describe("FORMULAS", () => {
  it("defines F0, F1, F2", () => {
    expect(Object.keys(FORMULAS)).toEqual(["F0", "F1", "F2"]);
  });

  it("every formula has all 8 spec modules defined", () => {
    for (const formula of Object.values(FORMULAS)) {
      expect(Object.keys(formula.modules).sort()).toEqual(["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8"].sort());
    }
  });
});

describe("getEnabledModulesForFormula", () => {
  it("F0 enables M1, M2, M3 only", () => {
    const enabled = getEnabledModulesForFormula("F0");
    expect(enabled).toEqual(["M1", "M2", "M3"]);
  });

  it("F1 enables M1 through M5", () => {
    const enabled = getEnabledModulesForFormula("F1");
    expect(enabled).toEqual(["M1", "M2", "M3", "M4", "M5"]);
  });

  it("F2 enables all M1-M8", () => {
    const enabled = getEnabledModulesForFormula("F2");
    expect(enabled).toEqual(["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8"]);
  });
});

describe("getCoreModulesForFormula", () => {
  it("F0 has M1 and M3 as core", () => {
    expect(getCoreModulesForFormula("F0")).toEqual(["M1", "M3"]);
  });

  it("F1 has M2 and M3 as core", () => {
    expect(getCoreModulesForFormula("F1")).toEqual(["M2", "M3"]);
  });

  it("F2 has all 8 as core", () => {
    expect(getCoreModulesForFormula("F2")).toHaveLength(8);
  });
});

describe("isModuleActiveInFormula", () => {
  it("M4 is inactive in F0", () => {
    expect(isModuleActiveInFormula("F0", "M4")).toBe(false);
  });

  it("M4 is active (probable) in F1", () => {
    expect(isModuleActiveInFormula("F1", "M4")).toBe(true);
  });

  it("M8 is active in F2", () => {
    expect(isModuleActiveInFormula("F2", "M8")).toBe(true);
  });

  it("M6 is inactive in F1", () => {
    expect(isModuleActiveInFormula("F1", "M6")).toBe(false);
  });
});
