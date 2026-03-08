import { describe, it, expect } from "vitest";
import { oieToAxes, aggregateAxes, getAxisDef, AXES } from "@/lib/axes-mapping";
import type { OIEScores } from "@/lib/oie-profile";

describe("oieToAxes", () => {
  it("maps O-I-E scores to axes", () => {
    const oie: OIEScores = {
      O: 75.3,
      I: 42.7,
      E: 88.1,
      dominant: "E",
      responseCount: 10,
      isReliable: false,
    };
    const axes = oieToAxes(oie);
    expect(axes.comprehension).toBe(75);
    expect(axes.creativite).toBe(43);
    expect(axes.expression).toBe(88);
    expect(axes.engagement).toBe(50); // 10/20 * 100
  });

  it("caps engagement at 100", () => {
    const oie: OIEScores = {
      O: 50, I: 50, E: 50,
      dominant: "O",
      responseCount: 30,
      isReliable: true,
    };
    const axes = oieToAxes(oie);
    expect(axes.engagement).toBe(100);
  });

  it("uses custom maxResponses", () => {
    const oie: OIEScores = {
      O: 50, I: 50, E: 50,
      dominant: "O",
      responseCount: 5,
      isReliable: false,
    };
    const axes = oieToAxes(oie, 10);
    expect(axes.engagement).toBe(50); // 5/10 * 100
  });

  it("handles zero responseCount", () => {
    const oie: OIEScores = {
      O: 0, I: 0, E: 0,
      dominant: "O",
      responseCount: 0,
      isReliable: false,
    };
    const axes = oieToAxes(oie);
    expect(axes.engagement).toBe(0);
  });
});

describe("aggregateAxes", () => {
  it("averages multiple students' scores", () => {
    const students = [
      { comprehension: 80, creativite: 60, expression: 40, engagement: 100 },
      { comprehension: 20, creativite: 40, expression: 60, engagement: 50 },
    ];
    const avg = aggregateAxes(students);
    expect(avg.comprehension).toBe(50);
    expect(avg.creativite).toBe(50);
    expect(avg.expression).toBe(50);
    expect(avg.engagement).toBe(75);
  });

  it("returns zeros for empty array", () => {
    const avg = aggregateAxes([]);
    expect(avg).toEqual({
      comprehension: 0, creativite: 0, expression: 0, engagement: 0,
    });
  });

  it("returns same scores for single student", () => {
    const student = { comprehension: 70, creativite: 85, expression: 45, engagement: 90 };
    const avg = aggregateAxes([student]);
    expect(avg).toEqual(student);
  });
});

describe("getAxisDef", () => {
  it("returns correct definition for each axis", () => {
    expect(getAxisDef("comprehension").label).toBe("Compréhension");
    expect(getAxisDef("creativite").label).toBe("Créativité");
    expect(getAxisDef("expression").label).toBe("Expression");
    expect(getAxisDef("engagement").label).toBe("Engagement");
  });

  it("all axes have hex colors", () => {
    for (const axis of AXES) {
      expect(axis.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});
