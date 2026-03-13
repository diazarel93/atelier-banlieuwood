import { describe, it, expect } from "vitest";
import {
  deriveTalentProfile,
  resolveTalentProfile,
  TALENT_PROFILES,
  TALENT_TO_MISSION_ROLE,
} from "@/lib/talent-profiles";

describe("deriveTalentProfile", () => {
  it("returns imaginatif when I dominant (I-O ≥ 10)", () => {
    expect(deriveTalentProfile({ O: 30, I: 70, E: 40 })).toBe("imaginatif");
  });

  it("returns observateur when O dominant (O-I ≥ 10)", () => {
    expect(deriveTalentProfile({ O: 70, I: 30, E: 40 })).toBe("observateur");
  });

  it("returns narrateur when I ≈ E and both > O", () => {
    expect(deriveTalentProfile({ O: 30, I: 60, E: 62 })).toBe("narrateur");
  });

  it("returns metteur_en_scene when O ≈ E and both > I", () => {
    expect(deriveTalentProfile({ O: 60, I: 30, E: 62 })).toBe("metteur_en_scene");
  });

  it("returns acteur when E dominant (E-I ≥ 10)", () => {
    expect(deriveTalentProfile({ O: 40, I: 30, E: 70 })).toBe("acteur");
  });

  it("returns organisateur when all balanced", () => {
    expect(deriveTalentProfile({ O: 50, I: 52, E: 48 })).toBe("organisateur");
  });

  it("returns organisateur for all zeros", () => {
    expect(deriveTalentProfile({ O: 0, I: 0, E: 0 })).toBe("organisateur");
  });

  it("handles edge case: I slightly above O (gap < 10)", () => {
    // I=55, O=50, E=30 → I dominant but gap only 5, not ≥10
    // O < I, O < E? O=50 > E=30, so not narrateur
    // falls through to organisateur or another
    const result = deriveTalentProfile({ O: 50, I: 55, E: 30 });
    // I is highest but gap < 10 from O, not balanced (E is far)
    // Should still resolve — I >= O, I >= E, but I-O = 5 < 10
    // Then O >= I? no. Then I ≈ E? no (gap 25). Then O ≈ E? no (gap 20).
    // Then E >= O? no. Fallback → organisateur
    expect(result).toBe("organisateur");
  });
});

describe("resolveTalentProfile", () => {
  it("resolves new 6-profile keys", () => {
    const p = resolveTalentProfile("imaginatif");
    expect(p).not.toBeNull();
    expect(p!.key).toBe("imaginatif");
    expect(p!.label).toBe("Imaginatif");
    expect(p!.emoji).toBe("🎨");
  });

  it("resolves legacy key 'creatif' → imaginatif", () => {
    const p = resolveTalentProfile("creatif");
    expect(p).not.toBeNull();
    expect(p!.key).toBe("imaginatif");
  });

  it("resolves legacy key 'detective' → observateur", () => {
    const p = resolveTalentProfile("detective");
    expect(p).not.toBeNull();
    expect(p!.key).toBe("observateur");
  });

  it("resolves legacy key 'provocateur' → narrateur", () => {
    const p = resolveTalentProfile("provocateur");
    expect(p).not.toBeNull();
    expect(p!.key).toBe("narrateur");
  });

  it("resolves legacy key 'stratege' → organisateur", () => {
    const p = resolveTalentProfile("stratege");
    expect(p).not.toBeNull();
    expect(p!.key).toBe("organisateur");
  });

  it("resolves legacy key 'acteur' → acteur (same key)", () => {
    const p = resolveTalentProfile("acteur");
    expect(p).not.toBeNull();
    expect(p!.key).toBe("acteur");
  });

  it("returns null for unknown key", () => {
    expect(resolveTalentProfile("unknown")).toBeNull();
  });

  it("returns null for null/undefined", () => {
    expect(resolveTalentProfile(null)).toBeNull();
    expect(resolveTalentProfile(undefined)).toBeNull();
  });

  it("all 6 profiles have required fields", () => {
    for (const def of Object.values(TALENT_PROFILES)) {
      expect(def.key).toBeTruthy();
      expect(def.label).toBeTruthy();
      expect(def.emoji).toBeTruthy();
      expect(def.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(def.description).toBeTruthy();
    }
  });
});

describe("TALENT_TO_MISSION_ROLE", () => {
  it("maps all 6 talent keys to valid M6 mission roles", () => {
    const validRoles = ["dialogue", "description", "coherence", "tension", "structure"];
    for (const [key, role] of Object.entries(TALENT_TO_MISSION_ROLE)) {
      expect(validRoles).toContain(role);
      expect(key in TALENT_PROFILES).toBe(true);
    }
  });
});
