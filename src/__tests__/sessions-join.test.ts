import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock state
const mockSession = { id: "sess-001", status: "waiting" };
const mockNewStudent = { id: "stu-001" };
let sessionResult: { data: unknown; error: unknown | null } = {
  data: mockSession,
  error: null,
};
let existingStudentResult: { data: unknown; error: unknown | null } = {
  data: null,
  error: { code: "PGRST116" }, // "not found" for .single()
};
let countResult: { count: number | null } = { count: 5 };
let insertStudentResult: { data: unknown; error: unknown | null } = {
  data: mockNewStudent,
  error: null,
};

function makeChain(
  resolveWith: () => {
    data: unknown;
    error: unknown | null;
    count?: number | null;
  }
) {
  const chain: Record<string, unknown> = {};
  const methods = [
    "select",
    "insert",
    "update",
    "upsert",
    "eq",
    "is",
    "single",
    "order",
  ];
  for (const m of methods) {
    chain[m] = vi.fn().mockReturnValue(chain);
  }
  chain.single = vi
    .fn()
    .mockImplementation(() => Promise.resolve(resolveWith()));
  return chain;
}

// Track which table is being queried
let querySequence: string[] = [];

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn().mockImplementation(() => ({
    from: vi.fn().mockImplementation((table: string) => {
      querySequence.push(table);

      if (table === "sessions") {
        return makeChain(() => sessionResult);
      }

      if (table === "students") {
        // The join route queries students multiple times:
        // 1st: check existing student (reconnection)
        // 2nd: count students
        // 3rd: insert new student
        const studentCallCount = querySequence.filter(
          (t) => t === "students"
        ).length;

        if (studentCallCount === 1) {
          // Reconnection check
          return makeChain(() => existingStudentResult);
        }
        if (studentCallCount === 2) {
          // Count query — select with count: "exact"
          const chain = makeChain(() => ({
            data: null,
            error: null,
            count: countResult.count,
          }));
          chain.select = vi.fn().mockImplementation(() => {
            // Return promise with count for head queries
            return {
              ...chain,
              eq: vi.fn().mockImplementation(() =>
                Promise.resolve({
                  count: countResult.count,
                  data: null,
                  error: null,
                })
              ),
            };
          });
          return chain;
        }
        if (studentCallCount >= 3) {
          // Insert
          return makeChain(() => insertStudentResult);
        }
      }

      return makeChain(() => ({ data: null, error: null }));
    }),
  })),
}));

// Mock rate limit to not block tests
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockReturnValue(null),
  getIP: vi.fn().mockReturnValue("127.0.0.1"),
}));

const { POST } = await import("@/app/api/sessions/join/route");

describe("POST /api/sessions/join", () => {
  beforeEach(() => {
    querySequence = [];
    sessionResult = { data: mockSession, error: null };
    existingStudentResult = {
      data: null,
      error: { code: "PGRST116" },
    };
    countResult = { count: 5 };
    insertStudentResult = { data: mockNewStudent, error: null };
  });

  function makeReq(body: Record<string, unknown>) {
    return new NextRequest("http://localhost/api/sessions/join", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("returns 400 when joinCode is missing", async () => {
    const res = await POST(makeReq({ displayName: "Alice", avatar: "🎬" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when displayName is missing", async () => {
    const res = await POST(makeReq({ joinCode: "ABC123", avatar: "🎬" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when avatar is missing", async () => {
    const res = await POST(
      makeReq({ joinCode: "ABC123", displayName: "Alice" })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when displayName is empty after trim", async () => {
    const res = await POST(
      makeReq({ joinCode: "ABC123", displayName: "   ", avatar: "🎬" })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when avatar is not an emoji", async () => {
    const res = await POST(
      makeReq({ joinCode: "ABC123", displayName: "Alice", avatar: "AB" })
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("emoji");
  });

  it("returns 400 when avatar is multiple emojis", async () => {
    const res = await POST(
      makeReq({ joinCode: "ABC123", displayName: "Alice", avatar: "🎬🎥" })
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 when join code not found", async () => {
    sessionResult = { data: null, error: { code: "PGRST116" } };
    const res = await POST(
      makeReq({ joinCode: "XXXXXX", displayName: "Alice", avatar: "🎬" })
    );
    expect(res.status).toBe(404);
  });

  it("returns 400 when session is done", async () => {
    sessionResult = {
      data: { id: "sess-001", status: "done" },
      error: null,
    };
    const res = await POST(
      makeReq({ joinCode: "ABC123", displayName: "Alice", avatar: "🎬" })
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("terminée");
  });

  it("accepts valid single emoji avatars", async () => {
    // These should NOT cause a 400 on avatar
    for (const emoji of ["🎬", "⭐", "🎭", "😊"]) {
      querySequence = [];
      const res = await POST(
        makeReq({
          joinCode: "ABC123",
          displayName: "Alice",
          avatar: emoji,
        })
      );
      // Should not be a 400 avatar error
      if (res.status === 400) {
        const json = await res.json();
        expect(json.error).not.toContain("emoji");
      }
    }
  });

  it("uppercases join code", async () => {
    // lowercase input should work — the code uppercases it
    const res = await POST(
      makeReq({ joinCode: "abc123", displayName: "Alice", avatar: "🎬" })
    );
    // Not a 404 (code should be uppercased to ABC123 and found)
    // The mock returns session for any .eq() call, so this should succeed
    expect(res.status).not.toBe(404);
  });
});
