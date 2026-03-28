import { describe, it, expect } from "vitest";
import {
  CATEGORIES,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  PRODUCTION_CATEGORIES,
  BUDGET_TOTAL,
  BUDGET_RESERVE_MIN,
  generateBudgetSummary,
  getSeanceMax,
  TEMPLATES,
  THEMATIQUES,
} from "@/lib/constants";

describe("CATEGORIES", () => {
  it("has unique keys", () => {
    const keys = CATEGORIES.map((c) => c.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("all have valid hex colors", () => {
    for (const cat of CATEGORIES) {
      expect(cat.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("CATEGORY_COLORS maps all categories", () => {
    for (const cat of CATEGORIES) {
      expect(CATEGORY_COLORS[cat.key]).toBe(cat.color);
    }
  });

  it("CATEGORY_LABELS maps all categories", () => {
    for (const cat of CATEGORIES) {
      expect(CATEGORY_LABELS[cat.key]).toBe(cat.label);
    }
  });
});

describe("PRODUCTION_CATEGORIES (Budget)", () => {
  it("all categories have exactly 3 options", () => {
    for (const cat of PRODUCTION_CATEGORIES) {
      expect(cat.options).toHaveLength(3);
    }
  });

  it("options are sorted by cost ascending", () => {
    for (const cat of PRODUCTION_CATEGORIES) {
      for (let i = 1; i < cat.options.length; i++) {
        expect(cat.options[i].cost).toBeGreaterThanOrEqual(cat.options[i - 1].cost);
      }
    }
  });

  it("cheapest full combo fits within budget", () => {
    const minTotal = PRODUCTION_CATEGORIES.reduce((sum, cat) => sum + cat.options[0].cost, 0);
    expect(minTotal).toBeLessThanOrEqual(BUDGET_TOTAL);
  });

  it("BUDGET_TOTAL > BUDGET_RESERVE_MIN", () => {
    expect(BUDGET_TOTAL).toBeGreaterThan(BUDGET_RESERVE_MIN);
  });
});

describe("generateBudgetSummary", () => {
  it("generates summary text from choices", () => {
    const choices = { acteurs: 5, decors: 5, effets: 0, musique: 0, duree: 5 };
    const summary = generateBudgetSummary(choices);
    expect(summary).toContain("casting");
    expect(summary).toContain("décors");
    expect(summary).toContain("Réserve : 85 crédits");
  });

  it("handles empty choices", () => {
    const summary = generateBudgetSummary({});
    expect(summary).toContain("Réserve : 100 crédits");
  });
});

describe("getSeanceMax", () => {
  it("returns correct count for module 3 seance 1", () => {
    expect(getSeanceMax(3, 1)).toBe(8);
  });

  it("returns correct count for module 3 seance 3", () => {
    expect(getSeanceMax(3, 3)).toBe(5);
  });

  it("returns fallback for unknown module", () => {
    expect(getSeanceMax(99, 1)).toBe(8); // falls back to SEANCE_SITUATIONS[1]
  });
});

describe("TEMPLATES", () => {
  it("has unique keys", () => {
    const keys = TEMPLATES.map((t) => t.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("THEMATIQUES", () => {
  it("has unique keys", () => {
    const keys = THEMATIQUES.map((t) => t.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("all have valid hex colors", () => {
    for (const t of THEMATIQUES) {
      expect(t.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});
