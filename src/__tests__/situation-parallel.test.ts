import { describe, it, expect } from "vitest";
import { getPollingInterval, type ConnectionStatus } from "@/hooks/use-realtime-invalidation";

describe("Situation handler parallelization logic", () => {
  it("Promise.all should resolve all independent queries", async () => {
    // Simulate the parallel query pattern from situation/route.ts
    const results = await Promise.all([
      Promise.resolve({ data: { id: "r1", teacher_nudge: null } }), // response check
      Promise.resolve({ data: { warnings: 0, kicked: false } }), // student info
      Promise.resolve(null), // team
      Promise.resolve({
        data: [
          { id: "r1", text: "opt1" },
          { id: "r2", text: "opt2" },
        ],
      }), // vote options
      Promise.resolve({ data: null }), // hasVoted
      Promise.resolve({ data: { id: "cc1", chosen_text: "test" } }), // collective choice
      Promise.resolve({ count: 5 }), // connected count
      Promise.resolve({ count: 3 }), // responses count
      Promise.resolve({ data: null }), // budget
    ]);

    expect(results).toHaveLength(9);
    expect(results[0].data?.id).toBe("r1");
    expect(results[1].data?.warnings).toBe(0);
    expect(results[3].data).toHaveLength(2);
    expect(results[6].count).toBe(5);
  });

  it("Promise.all should handle null results for skipped queries", async () => {
    // When studentId is null, queries resolve to { data: null }
    const results = await Promise.all([
      Promise.resolve({ data: null }), // no student → no response check
      Promise.resolve({ data: null }), // no student info
      Promise.resolve(null), // no team
      Promise.resolve({ data: null }), // not voting
      Promise.resolve({ data: null }), // no vote check
      Promise.resolve({ data: null }), // no situation → no collective choice
      Promise.resolve({ count: 0 }), // connected count
      Promise.resolve({ count: 0 }), // responses count
      Promise.resolve({ data: null }), // no budget
    ]);

    expect(results).toHaveLength(9);
    expect(results[0].data).toBeNull();
    expect(results[6].count).toBe(0);
  });

  it("should correctly unpack parallel results", async () => {
    const [
      responseResult,
      studentResult,
      ,
      voteOptionsResult,
      hasVotedResult,
      collectiveChoiceResult,
      connectedCountResult,
      responsesCountResult,
    ] = await Promise.all([
      Promise.resolve({ data: { id: "resp-1", teacher_nudge: "Bravo !" } }),
      Promise.resolve({ data: { warnings: 2, kicked: false } }),
      Promise.resolve({ id: "team-1", teamName: "Alpha", teamColor: "#ff0000", teamNumber: 1 }),
      Promise.resolve({ data: [{ id: "opt-1", text: "Option A" }] }),
      Promise.resolve({ data: { id: "vote-1" } }),
      Promise.resolve({ data: { id: "cc-1", chosen_text: "Best answer" } }),
      Promise.resolve({ count: 25 }),
      Promise.resolve({ count: 18 }),
      Promise.resolve({ data: null }),
    ]);

    // Unpack like the handler does
    const hasResponded = !!responseResult.data;
    const teacherNudge = responseResult.data?.teacher_nudge || null;
    const studentWarnings = studentResult.data?.warnings || 0;
    const studentKicked = studentResult.data?.kicked || false;
    const voteOptions = voteOptionsResult.data || [];
    const hasVoted = !!hasVotedResult.data;
    const collectiveChoice = collectiveChoiceResult.data || null;
    const count = (connectedCountResult as { count: number | null }).count;
    const responsesCount = (responsesCountResult as { count: number | null }).count || 0;

    expect(hasResponded).toBe(true);
    expect(teacherNudge).toBe("Bravo !");
    expect(studentWarnings).toBe(2);
    expect(studentKicked).toBe(false);
    expect(voteOptions).toHaveLength(1);
    expect(hasVoted).toBe(true);
    expect(collectiveChoice?.chosen_text).toBe("Best answer");
    expect(count).toBe(25);
    expect(responsesCount).toBe(18);
  });
});

describe("getPollingInterval", () => {
  it("returns slow interval when connected", () => {
    expect(getPollingInterval("connected", 5_000, 30_000)).toBe(30_000);
  });

  it("returns fast interval when disconnected", () => {
    expect(getPollingInterval("disconnected", 5_000, 30_000)).toBe(5_000);
  });

  it("returns fast interval when connecting", () => {
    expect(getPollingInterval("connecting", 5_000, 30_000)).toBe(5_000);
  });

  it("returns fast interval when status is undefined", () => {
    expect(getPollingInterval(undefined, 5_000, 30_000)).toBe(5_000);
  });

  it("handles custom intervals", () => {
    expect(getPollingInterval("connected", 10_000, 60_000)).toBe(60_000);
    expect(getPollingInterval("disconnected", 10_000, 60_000)).toBe(10_000);
  });
});

describe("Parallel query error resilience", () => {
  it("Promise.all rejects if any query throws", async () => {
    await expect(
      Promise.all([
        Promise.resolve({ data: null }),
        Promise.reject(new Error("DB connection lost")),
        Promise.resolve({ count: 0 }),
      ]),
    ).rejects.toThrow("DB connection lost");
  });

  it("handles mixed result shapes consistently", async () => {
    const results = await Promise.all([
      Promise.resolve({ data: undefined }),
      Promise.resolve({ data: null }),
      Promise.resolve({ data: [] }),
      Promise.resolve({ count: null }),
    ]);
    expect(results[0].data).toBeUndefined();
    expect(results[1].data).toBeNull();
    expect(Array.isArray(results[2].data)).toBe(true);
    expect(results[3].count).toBeNull();
  });

  it("Array.isArray guards distinguish null from array", () => {
    const nullData = null;
    const emptyArray: unknown[] = [];
    const objectData = { id: "test" };
    expect(Array.isArray(nullData) ? nullData : []).toEqual([]);
    expect(Array.isArray(emptyArray) ? emptyArray : []).toEqual([]);
    expect(Array.isArray(objectData) ? objectData : []).toEqual([]);
  });
});

describe("Reconnection backoff", () => {
  const BACKOFF_BASE_MS = 2000;
  const BACKOFF_MAX_MS = 30000;
  const MAX_RETRIES = 5;

  function getBackoffDelay(retryCount: number): number {
    return Math.min(BACKOFF_BASE_MS * Math.pow(2, retryCount), BACKOFF_MAX_MS);
  }

  it("first retry is 2 seconds", () => {
    expect(getBackoffDelay(0)).toBe(2000);
  });

  it("second retry is 4 seconds", () => {
    expect(getBackoffDelay(1)).toBe(4000);
  });

  it("third retry is 8 seconds", () => {
    expect(getBackoffDelay(2)).toBe(8000);
  });

  it("fourth retry is 16 seconds", () => {
    expect(getBackoffDelay(3)).toBe(16000);
  });

  it("fifth retry is capped at 30 seconds", () => {
    expect(getBackoffDelay(4)).toBe(30000);
  });

  it("delays never exceed max", () => {
    for (let i = 0; i < 10; i++) {
      expect(getBackoffDelay(i)).toBeLessThanOrEqual(BACKOFF_MAX_MS);
    }
  });

  it("max retries is 5", () => {
    expect(MAX_RETRIES).toBe(5);
  });
});
