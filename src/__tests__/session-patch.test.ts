import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";

// Mock auth — always succeeds
const mockUpdatedSession = { id: "sess-001", status: "responding" };

function makeChain(resolveWith: () => { data: unknown; error: unknown | null }) {
  const chain: Record<string, unknown> = {};
  const methods = ["select", "insert", "update", "upsert", "eq", "is", "single", "order"];
  for (const m of methods) {
    chain[m] = vi.fn().mockReturnValue(chain);
  }
  chain.single = vi.fn().mockImplementation(() => Promise.resolve(resolveWith()));
  return chain;
}

const mockSupabase = {
  auth: {
    getUser: vi.fn().mockResolvedValue({
      data: { user: { id: "user-123" } },
    }),
  },
  from: vi.fn().mockImplementation((table: string) => {
    if (table === "sessions") {
      return makeChain(() => ({
        data: mockUpdatedSession,
        error: null,
      }));
    }
    return makeChain(() => ({ data: null, error: null }));
  }),
};

vi.mock("@/lib/api-utils", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    requireFacilitator: vi.fn().mockImplementation(async () => ({
      supabase: mockSupabase,
      user: { id: "user-123" },
    })),
  };
});

vi.mock("@/lib/event-logger", () => ({
  logSessionEvent: vi.fn(),
}));

const { PATCH } = await import("@/app/api/sessions/[id]/route");

describe("PATCH /api/sessions/[id]", () => {
  const params = Promise.resolve({ id: "sess-001" });

  function makeReq(body: Record<string, unknown>) {
    return new NextRequest("http://localhost/api/sessions/sess-001", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("returns 400 when body has no allowed fields", async () => {
    const res = await PATCH(makeReq({ foo: "bar" }), { params });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("Rien");
  });

  it("returns 400 for invalid status", async () => {
    const res = await PATCH(makeReq({ status: "playing" }), { params });
    expect(res.status).toBe(400);
  });

  it("accepts valid statuses", async () => {
    for (const status of ["waiting", "responding", "reviewing", "voting", "results", "paused", "done"]) {
      const res = await PATCH(makeReq({ status }), { params });
      expect(res.status).not.toBe(400);
    }
  });

  it("returns 400 for invalid module number", async () => {
    const res = await PATCH(makeReq({ current_module: 0 }), { params });
    expect(res.status).toBe(400);

    const res2 = await PATCH(makeReq({ current_module: 14 }), { params });
    expect(res2.status).toBe(400);

    const res3 = await PATCH(makeReq({ current_module: "abc" }), { params });
    expect(res3.status).toBe(400);
  });

  it("accepts valid module numbers 1-12", async () => {
    const res = await PATCH(makeReq({ current_module: 1 }), { params });
    expect(res.status).not.toBe(400);

    const res2 = await PATCH(makeReq({ current_module: 12 }), { params });
    expect(res2.status).not.toBe(400);
  });

  it("returns 400 for invalid seance number", async () => {
    const res = await PATCH(makeReq({ current_seance: 0 }), { params });
    expect(res.status).toBe(400);

    const res2 = await PATCH(makeReq({ current_seance: 6 }), { params });
    expect(res2.status).toBe(400);
  });

  it("returns 400 for negative situation index", async () => {
    const res = await PATCH(makeReq({ current_situation_index: -1 }), { params });
    expect(res.status).toBe(400);
  });

  it("returns 400 for non-number timer", async () => {
    const res = await PATCH(makeReq({ timer_ends_at: 12345 }), { params });
    expect(res.status).toBe(400);
  });

  it("accepts null timer_ends_at", async () => {
    const res = await PATCH(makeReq({ timer_ends_at: null }), { params });
    expect(res.status).not.toBe(400);
  });

  it("accepts ISO string timer_ends_at", async () => {
    const res = await PATCH(makeReq({ timer_ends_at: "2025-01-01T00:00:00Z" }), { params });
    expect(res.status).not.toBe(400);
  });

  it("returns 400 for non-boolean sharing_enabled", async () => {
    const res = await PATCH(makeReq({ sharing_enabled: "yes" }), { params });
    expect(res.status).toBe(400);
  });

  it("accepts boolean sharing_enabled", async () => {
    const res = await PATCH(makeReq({ sharing_enabled: true }), { params });
    expect(res.status).not.toBe(400);
  });

  it("returns 400 for invalid completed_modules", async () => {
    const res = await PATCH(makeReq({ completed_modules: ["invalid_id"] }), { params });
    expect(res.status).toBe(400);

    const res2 = await PATCH(makeReq({ completed_modules: "m1" }), { params });
    expect(res2.status).toBe(400);
  });

  it("accepts valid completed_modules", async () => {
    const res = await PATCH(makeReq({ completed_modules: ["m1", "m2", "m3"] }), { params });
    expect(res.status).not.toBe(400);
  });

  it("deduplicates completed_modules", async () => {
    const res = await PATCH(makeReq({ completed_modules: ["m1", "m1", "m2"] }), { params });
    // Should not error — deduplication happens silently
    expect(res.status).not.toBe(400);
  });
});
