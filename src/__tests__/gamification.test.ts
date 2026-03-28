import { describe, it, expect } from "vitest";
import {
  getLevel,
  LEVEL_THRESHOLDS,
  LEVEL_NAMES,
  XP_RESPOND,
  XP_VOTE,
  XP_RETAINED,
  XP_STREAK_BONUS_PER,
  XP_COMBO_PER,
} from "@/lib/xp";

describe("XP Constants", () => {
  it("should have correct XP values", () => {
    expect(XP_RESPOND).toBe(10);
    expect(XP_VOTE).toBe(5);
    expect(XP_RETAINED).toBe(25);
    expect(XP_STREAK_BONUS_PER).toBe(5);
    expect(XP_COMBO_PER).toBe(15);
  });

  it("should have ascending level thresholds", () => {
    for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
      expect(LEVEL_THRESHOLDS[i]).toBeGreaterThan(LEVEL_THRESHOLDS[i - 1]);
    }
  });

  it("should have same number of level names and thresholds", () => {
    expect(LEVEL_NAMES.length).toBe(LEVEL_THRESHOLDS.length);
  });

  it("first threshold should be 0", () => {
    expect(LEVEL_THRESHOLDS[0]).toBe(0);
  });
});

describe("getLevel", () => {
  it("returns level 0 for 0 XP", () => {
    const result = getLevel(0);
    expect(result.level).toBe(0);
    expect(result.name).toBe("Figurant");
    expect(result.progress).toBe(0);
  });

  it("returns level 0 for XP below first threshold", () => {
    const result = getLevel(50);
    expect(result.level).toBe(0);
    expect(result.name).toBe("Figurant");
    expect(result.progress).toBeGreaterThan(0);
    expect(result.progress).toBeLessThan(1);
  });

  it("returns level 1 at 100 XP", () => {
    const result = getLevel(100);
    expect(result.level).toBe(1);
    expect(result.name).toBe("Stagiaire");
    expect(result.progress).toBe(0);
  });

  it("returns progress between levels", () => {
    // Between 100 (level 1) and 250 (level 2)
    const result = getLevel(175);
    expect(result.level).toBe(1);
    expect(result.progress).toBeCloseTo(0.5, 1);
  });

  it("returns max level for very high XP", () => {
    const result = getLevel(50000);
    const maxLevel = LEVEL_THRESHOLDS.length - 1;
    expect(result.level).toBe(maxLevel);
    expect(result.name).toBe("Oscar");
  });

  it("progress never exceeds 1", () => {
    const result = getLevel(99999);
    expect(result.progress).toBeLessThanOrEqual(1);
  });

  it("returns correct nextThreshold", () => {
    const result = getLevel(0);
    expect(result.nextThreshold).toBe(100);
  });

  it("returns currentXp matching input", () => {
    const result = getLevel(42);
    expect(result.currentXp).toBe(42);
  });

  it("handles exact threshold values correctly", () => {
    for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
      const result = getLevel(LEVEL_THRESHOLDS[i]);
      expect(result.level).toBe(i);
    }
  });
});

describe("getLevel edge cases", () => {
  it("handles negative XP gracefully", () => {
    const result = getLevel(-10);
    expect(result.level).toBe(0);
    expect(result.name).toBe("Figurant");
  });

  it("progress is 0 at exact threshold boundary", () => {
    const result = getLevel(LEVEL_THRESHOLDS[2]);
    expect(result.level).toBe(2);
    expect(result.progress).toBe(0);
  });

  it("progress is near 1 just below next threshold", () => {
    const justBelow = LEVEL_THRESHOLDS[1] - 1;
    const result = getLevel(justBelow);
    expect(result.level).toBe(0);
    expect(result.progress).toBeGreaterThan(0.9);
  });

  it("all XP constants are positive integers", () => {
    expect(XP_RESPOND).toBeGreaterThan(0);
    expect(XP_VOTE).toBeGreaterThan(0);
    expect(XP_RETAINED).toBeGreaterThan(0);
    expect(XP_STREAK_BONUS_PER).toBeGreaterThan(0);
    expect(XP_COMBO_PER).toBeGreaterThan(0);
    expect(Number.isInteger(XP_RESPOND)).toBe(true);
    expect(Number.isInteger(XP_VOTE)).toBe(true);
  });
});

describe("Level tier progression", () => {
  it("all tier names are unique", () => {
    const unique = new Set(LEVEL_NAMES);
    expect(unique.size).toBe(LEVEL_NAMES.length);
  });

  it("XP rewards compound to reasonable level progression", () => {
    // Simulate 50 responses + 20 votes + 5 retained answers
    const xp = 50 * XP_RESPOND + 20 * XP_VOTE + 5 * XP_RETAINED;
    const result = getLevel(xp);
    // 500 + 100 + 125 = 725 XP => should be level 3 (500-849)
    expect(result.level).toBe(3);
    expect(result.name).toBe("Cameraman");
  });
});
