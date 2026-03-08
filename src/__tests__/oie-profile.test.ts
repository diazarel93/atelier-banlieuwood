import { describe, it, expect } from "vitest";
import { computeOIE, aggregateOIE } from "@/lib/oie-profile";

describe("computeOIE", () => {
  it("returns zeros for no responses", () => {
    const result = computeOIE([], undefined, undefined);
    expect(result.O).toBe(0);
    expect(result.I).toBe(0);
    expect(result.E).toBe(0);
    expect(result.responseCount).toBe(0);
    expect(result.isReliable).toBe(false);
  });

  it("scores pure O category correctly", () => {
    const responses = Array.from({ length: 5 }, (_, i) => ({
      studentId: "s1",
      category: "observation",
      responseTimeMs: 30000,
      textLength: 50,
      aiScore: null,
      isHighlighted: false,
    }));
    const result = computeOIE(responses, undefined, undefined);
    expect(result.O).toBeGreaterThan(0);
    expect(result.dominant).toBe("O");
  });

  it("scores pure I category correctly", () => {
    const responses = Array.from({ length: 5 }, () => ({
      studentId: "s1",
      category: "imagination",
      responseTimeMs: 20000,
      textLength: 200,
      aiScore: null,
      isHighlighted: false,
    }));
    const result = computeOIE(responses, undefined, undefined);
    expect(result.I).toBeGreaterThan(0);
    expect(result.dominant).toBe("I");
  });

  it("boosts E with votes", () => {
    // Use enough responses so normalization volume bonus is stable
    const makeResponses = (n: number) => Array.from({ length: n }, () => ({
      studentId: "s1", category: "collectif", responseTimeMs: 10000,
      textLength: 30, aiScore: null, isHighlighted: false,
    }));
    const responses = makeResponses(5);
    const withVotes = computeOIE(responses, { studentId: "s1", voteCount: 5 }, undefined, true);
    const withoutVotes = computeOIE(responses, undefined, undefined, true);
    // Votes add E signals, so raw E score should be higher
    const withVotesESignals = withVotes.signals!.filter(s => s.axis === "E").reduce((a, s) => a + s.value, 0);
    const withoutVotesESignals = withoutVotes.signals!.filter(s => s.axis === "E").reduce((a, s) => a + s.value, 0);
    expect(withVotesESignals).toBeGreaterThan(withoutVotesESignals);
  });

  it("boosts E with collective choices", () => {
    const responses = Array.from({ length: 5 }, () => ({
      studentId: "s1", category: "collectif", responseTimeMs: 10000,
      textLength: 30, aiScore: null, isHighlighted: false,
    }));
    const withChoices = computeOIE(responses, undefined, { studentId: "s1", choiceCount: 2 }, true);
    const withoutChoices = computeOIE(responses, undefined, undefined, true);
    const withESignals = withChoices.signals!.filter(s => s.axis === "E").reduce((a, s) => a + s.value, 0);
    const withoutESignals = withoutChoices.signals!.filter(s => s.axis === "E").reduce((a, s) => a + s.value, 0);
    expect(withESignals).toBeGreaterThan(withoutESignals);
  });

  it("adds O signal for slow responses (>45s)", () => {
    const slow = [{ studentId: "s1", category: "observation", responseTimeMs: 60000, textLength: 50, aiScore: null, isHighlighted: false }];
    const result = computeOIE(slow, undefined, undefined, true);
    const slowSignal = result.signals!.find(s => s.reason.includes("temps > 45s"));
    expect(slowSignal).toBeDefined();
    expect(slowSignal!.axis).toBe("O");
  });

  it("adds I signal for long text (>150 chars)", () => {
    const long = [{ studentId: "s1", category: "imagination", responseTimeMs: 20000, textLength: 200, aiScore: null, isHighlighted: false }];
    const result = computeOIE(long, undefined, undefined, true);
    const longSignal = result.signals!.find(s => s.reason.includes("texte long"));
    expect(longSignal).toBeDefined();
    expect(longSignal!.axis).toBe("I");
  });

  it("marks reliable when 15+ responses", () => {
    const responses = Array.from({ length: 15 }, () => ({
      studentId: "s1", category: "observation", responseTimeMs: 20000,
      textLength: 50, aiScore: null, isHighlighted: false,
    }));
    expect(computeOIE(responses, undefined, undefined).isReliable).toBe(true);
  });

  it("includes signals when requested", () => {
    const responses = [
      { studentId: "s1", category: "observation", responseTimeMs: 20000, textLength: 50, aiScore: null, isHighlighted: false },
    ];
    const result = computeOIE(responses, undefined, undefined, true);
    expect(result.signals).toBeDefined();
    expect(result.signals!.length).toBeGreaterThan(0);
  });

  it("scores are capped at 100", () => {
    const responses = Array.from({ length: 30 }, () => ({
      studentId: "s1", category: "observation", responseTimeMs: 60000,
      textLength: 200, aiScore: 5, isHighlighted: true,
    }));
    const result = computeOIE(
      responses,
      { studentId: "s1", voteCount: 20 },
      { studentId: "s1", choiceCount: 10 }
    );
    expect(result.O).toBeLessThanOrEqual(100);
    expect(result.I).toBeLessThanOrEqual(100);
    expect(result.E).toBeLessThanOrEqual(100);
  });
});

describe("aggregateOIE", () => {
  it("weighted average across sessions", () => {
    const scores = [
      { observation: 80, imagination: 20, expression: 50, response_count: 10 },
      { observation: 40, imagination: 60, expression: 50, response_count: 10 },
    ];
    const result = aggregateOIE(scores);
    expect(result.O).toBe(60);
    expect(result.I).toBe(40);
    expect(result.E).toBe(50);
    expect(result.responseCount).toBe(20);
  });

  it("weights by response_count", () => {
    const scores = [
      { observation: 100, imagination: 0, expression: 0, response_count: 1 },
      { observation: 0, imagination: 100, expression: 0, response_count: 9 },
    ];
    const result = aggregateOIE(scores);
    expect(result.O).toBe(10); // (100*1 + 0*9) / 10
    expect(result.I).toBe(90); // (0*1 + 100*9) / 10
  });

  it("returns zeros for empty input", () => {
    const result = aggregateOIE([]);
    expect(result.O).toBe(0);
    expect(result.I).toBe(0);
    expect(result.E).toBe(0);
    expect(result.responseCount).toBe(0);
  });
});
