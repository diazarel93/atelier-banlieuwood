import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock state
const mockSession = { id: "sess-001", status: "voting" };
const mockStudent = { id: "stu-001" };
const mockExistingReaction = { id: "react-001" };

let sessionResult: { data: unknown; error: unknown | null } = {
  data: mockSession,
  error: null,
};
let studentResult: { data: unknown; error: unknown | null } = {
  data: mockStudent,
  error: null,
};
let existingReactionResult: { data: unknown; error: unknown | null } = {
  data: null,
  error: { code: "PGRST116" },
};
let insertReactionResult: { data: unknown; error: unknown | null } = {
  data: null,
  error: null,
};

function makeChain(resolveWith: () => { data: unknown; error: unknown | null }) {
  const chain: Record<string, unknown> = {};
  const methods = ["select", "insert", "update", "delete", "eq", "is", "in", "single", "order"];
  for (const m of methods) {
    chain[m] = vi.fn().mockReturnValue(chain);
  }
  chain.single = vi.fn().mockImplementation(() => Promise.resolve(resolveWith()));
  return chain;
}

let querySequence: string[] = [];

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn().mockImplementation(() => ({
    from: vi.fn().mockImplementation((table: string) => {
      querySequence.push(table);

      if (table === "sessions") {
        return makeChain(() => sessionResult);
      }

      if (table === "students") {
        return makeChain(() => studentResult);
      }

      if (table === "response_reactions") {
        const callCount = querySequence.filter((t) => t === "response_reactions").length;

        if (callCount === 1) {
          // Toggle check (existing reaction)
          return makeChain(() => existingReactionResult);
        }
        // Insert or delete
        return makeChain(() => insertReactionResult);
      }

      return makeChain(() => ({ data: null, error: null }));
    }),
  })),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockReturnValue(null),
  getIP: vi.fn().mockReturnValue("127.0.0.1"),
}));

const { POST } = await import("@/app/api/sessions/[id]/reactions/route");

describe("POST /api/sessions/[id]/reactions", () => {
  const params = Promise.resolve({ id: "sess-001" });

  beforeEach(() => {
    querySequence = [];
    sessionResult = { data: mockSession, error: null };
    studentResult = { data: mockStudent, error: null };
    existingReactionResult = {
      data: null,
      error: { code: "PGRST116" },
    };
    insertReactionResult = { data: null, error: null };
  });

  function makeReq(body: Record<string, unknown>) {
    return new NextRequest("http://localhost/api/sessions/sess-001/reactions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  const validUUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

  it("returns 400 when responseId is missing", async () => {
    const res = await POST(makeReq({ studentId: validUUID, emoji: "👍" }), { params });
    expect(res.status).toBe(400);
  });

  it("returns 400 when studentId is missing", async () => {
    const res = await POST(makeReq({ responseId: validUUID, emoji: "👍" }), { params });
    expect(res.status).toBe(400);
  });

  it("returns 400 when emoji is invalid", async () => {
    const res = await POST(
      makeReq({
        responseId: validUUID,
        studentId: validUUID,
        emoji: "🔥",
      }),
      { params },
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when emoji is missing", async () => {
    const res = await POST(
      makeReq({
        responseId: validUUID,
        studentId: validUUID,
      }),
      { params },
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when session is not in a reactable state", async () => {
    sessionResult = {
      data: { id: "sess-001", status: "responding" },
      error: null,
    };
    const res = await POST(
      makeReq({
        responseId: validUUID,
        studentId: validUUID,
        emoji: "👍",
      }),
      { params },
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 when student not found", async () => {
    studentResult = { data: null, error: { code: "PGRST116" } };
    const res = await POST(
      makeReq({
        responseId: validUUID,
        studentId: validUUID,
        emoji: "👍",
      }),
      { params },
    );
    expect(res.status).toBe(404);
  });

  it("accepts valid emojis: 👍 ❤️ 😂 🎯 💡", async () => {
    for (const emoji of ["👍", "❤️", "😂", "🎯", "💡"]) {
      querySequence = [];
      const res = await POST(
        makeReq({
          responseId: validUUID,
          studentId: validUUID,
          emoji,
        }),
        { params },
      );
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.action).toBe("added");
    }
  });

  it("returns 'removed' when reaction already exists", async () => {
    existingReactionResult = {
      data: mockExistingReaction,
      error: null,
    };
    const res = await POST(
      makeReq({
        responseId: validUUID,
        studentId: validUUID,
        emoji: "👍",
      }),
      { params },
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.action).toBe("removed");
  });

  it("allows reactions during reviewing status", async () => {
    sessionResult = {
      data: { id: "sess-001", status: "reviewing" },
      error: null,
    };
    const res = await POST(
      makeReq({
        responseId: validUUID,
        studentId: validUUID,
        emoji: "❤️",
      }),
      { params },
    );
    expect(res.status).toBe(200);
  });

  it("allows reactions during results status", async () => {
    sessionResult = {
      data: { id: "sess-001", status: "results" },
      error: null,
    };
    const res = await POST(
      makeReq({
        responseId: validUUID,
        studentId: validUUID,
        emoji: "🎯",
      }),
      { params },
    );
    expect(res.status).toBe(200);
  });
});
