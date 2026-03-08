import { describe, it, expect } from "vitest";
import { getSessionState } from "@/lib/session-state";

describe("getSessionState", () => {
  it("returns 'done' phase for status 'done'", () => {
    const s = getSessionState("done");
    expect(s.phase).toBe("done");
    expect(s.canViewResults).toBe(true);
    expect(s.canPilot).toBe(false);
    expect(s.canPrepare).toBe(false);
  });

  it("returns 'paused' phase for status 'paused'", () => {
    const s = getSessionState("paused");
    expect(s.phase).toBe("paused");
    expect(s.canPilot).toBe(true);
    expect(s.canPrepare).toBe(true);
    expect(s.canViewResults).toBe(false);
  });

  it("returns 'live' phase for 'responding'", () => {
    const s = getSessionState("responding");
    expect(s.phase).toBe("live");
    expect(s.canPilot).toBe(true);
    expect(s.canViewResults).toBe(false);
    expect(s.canPrepare).toBe(false);
  });

  it("returns 'live' phase for 'reviewing'", () => {
    expect(getSessionState("reviewing").phase).toBe("live");
  });

  it("returns 'live' phase for 'voting'", () => {
    expect(getSessionState("voting").phase).toBe("live");
  });

  it("returns 'waiting' phase for 'waiting' or unknown status", () => {
    const s = getSessionState("waiting");
    expect(s.phase).toBe("waiting");
    expect(s.canPilot).toBe(true);
    expect(s.canPrepare).toBe(true);
    expect(s.canViewResults).toBe(false);
  });

  it("defaults to 'waiting' for unknown status", () => {
    const s = getSessionState("unknown_status");
    expect(s.phase).toBe("waiting");
  });

  it("returns ctaLabel and ctaShort for all phases", () => {
    for (const status of ["done", "paused", "responding", "waiting"]) {
      const s = getSessionState(status);
      expect(s.ctaLabel).toBeTruthy();
      expect(s.ctaShort).toBeTruthy();
    }
  });
});
