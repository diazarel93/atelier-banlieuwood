import { describe, it, expect } from "vitest";
import {
  COLORS,
  STATUS_COLORS,
  COLLAB_COLORS,
  DEPTH_COLORS,
  MOMENT_COLORS,
  TREND_LABELS,
  scoreColor,
} from "@/lib/design-tokens";

describe("COLORS", () => {
  it("all values are valid hex colors", () => {
    for (const [, color] of Object.entries(COLORS)) {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

describe("STATUS_COLORS", () => {
  it("covers all session statuses", () => {
    for (const status of ["draft", "waiting", "responding", "paused", "done"]) {
      expect(STATUS_COLORS[status]).toBeDefined();
    }
  });
});

describe("COLLAB_COLORS", () => {
  it("covers all collaboration levels", () => {
    for (const level of ["faible", "moyen", "bon", "excellent"]) {
      expect(COLLAB_COLORS[level]).toBeDefined();
    }
  });
});

describe("DEPTH_COLORS", () => {
  it("covers all depth levels", () => {
    for (const depth of ["superficiel", "correct", "approfondi"]) {
      expect(DEPTH_COLORS[depth]).toBeDefined();
    }
  });
});

describe("MOMENT_COLORS", () => {
  it("covers all moment categories", () => {
    for (const cat of ["tournant", "créatif", "collectif", "tension"]) {
      expect(MOMENT_COLORS[cat]).toBeDefined();
    }
  });
});

describe("TREND_LABELS", () => {
  it("has label and icon for each trend", () => {
    for (const trend of ["croissant", "stable", "décroissant"]) {
      expect(TREND_LABELS[trend].label).toBeTruthy();
      expect(TREND_LABELS[trend].icon).toBeTruthy();
    }
  });
});

describe("scoreColor", () => {
  it("returns teal for high scores (>=70)", () => {
    expect(scoreColor(70)).toBe(COLORS.teal);
    expect(scoreColor(100)).toBe(COLORS.teal);
  });

  it("returns amber for medium scores (40-69)", () => {
    expect(scoreColor(40)).toBe(COLORS.amber);
    expect(scoreColor(69)).toBe(COLORS.amber);
  });

  it("returns danger for low scores (<40)", () => {
    expect(scoreColor(39)).toBe(COLORS.danger);
    expect(scoreColor(0)).toBe(COLORS.danger);
  });
});
