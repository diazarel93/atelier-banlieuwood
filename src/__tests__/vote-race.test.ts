import { describe, it, expect } from "vitest";
import { getSessionState } from "@/lib/session-state";
import { getSeanceMax, MODULE_SEANCE_SITUATIONS } from "@/lib/constants";

/**
 * Tests for the vote 409 race condition guard.
 * Validates that situation position checks correctly detect stale votes.
 */

describe("Vote race condition guard", () => {
  // Simulates the server-side check logic from vote/route.ts
  function isVoteStale(
    voteSituation: { position: number; module: number; seance: number },
    session: { current_module: number; current_seance: number; current_situation_index: number }
  ): boolean {
    return (
      voteSituation.module !== session.current_module ||
      voteSituation.seance !== session.current_seance ||
      voteSituation.position !== session.current_situation_index
    );
  }

  it("should detect stale vote when session has advanced to next situation", () => {
    const voteSituation = { position: 2, module: 3, seance: 1 };
    const session = { current_module: 3, current_seance: 1, current_situation_index: 3 };
    expect(isVoteStale(voteSituation, session)).toBe(true);
  });

  it("should detect stale vote when session has advanced to next seance", () => {
    const voteSituation = { position: 8, module: 3, seance: 1 };
    const session = { current_module: 3, current_seance: 2, current_situation_index: 0 };
    expect(isVoteStale(voteSituation, session)).toBe(true);
  });

  it("should detect stale vote when session has advanced to next module", () => {
    const voteSituation = { position: 5, module: 3, seance: 2 };
    const session = { current_module: 4, current_seance: 1, current_situation_index: 0 };
    expect(isVoteStale(voteSituation, session)).toBe(true);
  });

  it("should accept vote matching current session state", () => {
    const voteSituation = { position: 3, module: 3, seance: 1 };
    const session = { current_module: 3, current_seance: 1, current_situation_index: 3 };
    expect(isVoteStale(voteSituation, session)).toBe(false);
  });

  it("should accept vote at position 0 (first question)", () => {
    const voteSituation = { position: 0, module: 3, seance: 1 };
    const session = { current_module: 3, current_seance: 1, current_situation_index: 0 };
    expect(isVoteStale(voteSituation, session)).toBe(false);
  });

  it("should detect stale when only module differs", () => {
    expect(isVoteStale(
      { position: 3, module: 2, seance: 1 },
      { current_module: 3, current_seance: 1, current_situation_index: 3 }
    )).toBe(true);
  });

  it("should detect stale when only seance differs", () => {
    expect(isVoteStale(
      { position: 3, module: 3, seance: 1 },
      { current_module: 3, current_seance: 2, current_situation_index: 3 }
    )).toBe(true);
  });

  it("should handle high position numbers", () => {
    expect(isVoteStale(
      { position: 99, module: 10, seance: 5 },
      { current_module: 10, current_seance: 5, current_situation_index: 99 }
    )).toBe(false);
  });
});

describe("Respond race condition guard", () => {
  // Simulates the server-side check logic from respond/route.ts
  function isResponseStale(
    responseSituation: { position: number; module: number; seance: number },
    session: { current_module: number; current_seance: number; current_situation_index: number }
  ): boolean {
    return (
      responseSituation.module !== session.current_module ||
      responseSituation.seance !== session.current_seance ||
      responseSituation.position !== session.current_situation_index
    );
  }

  it("should reject response for a past situation", () => {
    expect(
      isResponseStale(
        { position: 1, module: 3, seance: 1 },
        { current_module: 3, current_seance: 1, current_situation_index: 5 }
      )
    ).toBe(true);
  });

  it("should accept response for current situation", () => {
    expect(
      isResponseStale(
        { position: 5, module: 3, seance: 1 },
        { current_module: 3, current_seance: 1, current_situation_index: 5 }
      )
    ).toBe(false);
  });
});

describe("Session state utility", () => {
  it("returns 'live' for voting status", () => {
    const state = getSessionState("voting");
    expect(state.phase).toBe("live");
    expect(state.canPilot).toBe(true);
  });

  it("returns 'done' for done status", () => {
    const state = getSessionState("done");
    expect(state.phase).toBe("done");
    expect(state.canViewResults).toBe(true);
    expect(state.canPilot).toBe(false);
  });

  it("returns 'waiting' for unknown status", () => {
    const state = getSessionState("waiting");
    expect(state.phase).toBe("waiting");
    expect(state.canPrepare).toBe(true);
  });
});

describe("getSeanceMax", () => {
  it("returns correct situation count for module 3 seance 1", () => {
    expect(getSeanceMax(3, 1)).toBe(8);
  });

  it("returns correct situation count for module 3 seance 3", () => {
    expect(getSeanceMax(3, 3)).toBe(5);
  });

  it("falls back to 8 for unknown module/seance", () => {
    expect(getSeanceMax(999, 1)).toBe(8);
  });

  it("MODULE_SEANCE_SITUATIONS has entries for all standard modules", () => {
    const modules = Object.keys(MODULE_SEANCE_SITUATIONS).map(Number);
    expect(modules).toContain(3);
    expect(modules).toContain(4);
    expect(modules).toContain(9);
    expect(modules).toContain(10);
  });
});
