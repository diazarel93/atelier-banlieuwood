import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock state
let sessionResult: { data: unknown; error: unknown | null } = {
  data: { status: "voting" },
  error: null,
};
let studentResult: { data: unknown; error: unknown | null } = {
  data: { id: "stu-001" },
  error: null,
};
let situationResult: { data: unknown; error: unknown | null } = {
  data: { position: 1, module: 3, seance: 1 },
  error: null,
};
let responseResult: { data: unknown; error: unknown | null } = {
  data: { id: "resp-001" },
  error: null,
};
let voteResult: { data: unknown; error: unknown | null } = {
  data: {
    id: "vote-001",
    session_id: "sess-001",
    student_id: "stu-001",
    situation_id: "sit-001",
    chosen_response_id: "resp-001",
  },
  error: null,
};

let querySequence: string[] = [];

function makeChain(resolveWith: () => { data: unknown; error: unknown | null }) {
  const chain: Record<string, unknown> = {};
  const methods = ["select", "insert", "update", "upsert", "eq", "is", "single", "order"];
  for (const m of methods) {
    chain[m] = vi.fn().mockReturnValue(chain);
  }
  chain.single = vi.fn().mockImplementation(() => Promise.resolve(resolveWith()));
  // Support .then() for fire-and-forget patterns (e.g. logSessionEvent)
  chain.then = vi.fn().mockImplementation((onFulfilled?: () => void) => {
    if (onFulfilled) onFulfilled();
    return Promise.resolve();
  });
  return chain;
}

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn().mockImplementation(() => ({
    from: vi.fn().mockImplementation((table: string) => {
      querySequence.push(table);

      if (table === "sessions") return makeChain(() => sessionResult);
      if (table === "students") return makeChain(() => studentResult);
      if (table === "situations") return makeChain(() => situationResult);
      if (table === "responses") return makeChain(() => responseResult);
      if (table === "votes") return makeChain(() => voteResult);
      return makeChain(() => ({ data: null, error: null }));
    }),
  })),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockReturnValue(null),
  getIP: vi.fn().mockReturnValue("127.0.0.1"),
}));

const { POST } = await import("@/app/api/sessions/[id]/vote/route");

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";
const VALID_UUID2 = "660e8400-e29b-41d4-a716-446655440001";
const VALID_UUID3 = "770e8400-e29b-41d4-a716-446655440002";

describe("POST /api/sessions/[id]/vote", () => {
  beforeEach(() => {
    querySequence = [];
    sessionResult = {
      data: { status: "voting", current_module: 3, current_seance: 1, current_situation_index: 0 },
      error: null,
    };
    situationResult = { data: { position: 1, module: 3, seance: 1 }, error: null };
    studentResult = { data: { id: "stu-001" }, error: null };
    responseResult = { data: { id: "resp-001" }, error: null };
    voteResult = {
      data: {
        id: "vote-001",
        session_id: "sess-001",
        student_id: VALID_UUID,
        situation_id: VALID_UUID2,
        chosen_response_id: VALID_UUID3,
      },
      error: null,
    };
  });

  function makeReq(body: Record<string, unknown>) {
    return new NextRequest("http://localhost/api/sessions/sess-001/vote", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  const params = Promise.resolve({ id: "sess-001" });

  it("returns 400 when studentId is missing", async () => {
    const res = await POST(makeReq({ situationId: VALID_UUID2, chosenResponseId: VALID_UUID3 }), { params });
    expect(res.status).toBe(400);
  });

  it("returns 400 when situationId is missing", async () => {
    const res = await POST(makeReq({ studentId: VALID_UUID, chosenResponseId: VALID_UUID3 }), { params });
    expect(res.status).toBe(400);
  });

  it("returns 400 when chosenResponseId is missing", async () => {
    const res = await POST(makeReq({ studentId: VALID_UUID, situationId: VALID_UUID2 }), { params });
    expect(res.status).toBe(400);
  });

  it("returns 400 when UUIDs are invalid", async () => {
    const res = await POST(
      makeReq({
        studentId: "not-a-uuid",
        situationId: VALID_UUID2,
        chosenResponseId: VALID_UUID3,
      }),
      { params },
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("invalide");
  });

  it("returns 400 when session is not in voting state", async () => {
    sessionResult = { data: { status: "responding" }, error: null };
    const res = await POST(
      makeReq({
        studentId: VALID_UUID,
        situationId: VALID_UUID2,
        chosenResponseId: VALID_UUID3,
      }),
      { params },
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("vote");
  });

  it("returns 404 when student not in session", async () => {
    studentResult = { data: null, error: null };
    const res = await POST(
      makeReq({
        studentId: VALID_UUID,
        situationId: VALID_UUID2,
        chosenResponseId: VALID_UUID3,
      }),
      { params },
    );
    expect(res.status).toBe(404);
  });

  it("returns 400 when response is not a valid vote option", async () => {
    responseResult = { data: null, error: null };
    const res = await POST(
      makeReq({
        studentId: VALID_UUID,
        situationId: VALID_UUID2,
        chosenResponseId: VALID_UUID3,
      }),
      { params },
    );
    expect(res.status).toBe(400);
  });

  it("creates vote with valid input", async () => {
    const res = await POST(
      makeReq({
        studentId: VALID_UUID,
        situationId: VALID_UUID2,
        chosenResponseId: VALID_UUID3,
      }),
      { params },
    );
    const json = await res.json();
    expect(json.id).toBe("vote-001");
  });
});
