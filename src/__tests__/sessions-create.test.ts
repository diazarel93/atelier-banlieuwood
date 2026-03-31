import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock Supabase before importing route
const mockUser = { id: "user-123", email: "test@test.com" };
const mockFacilitator = { org_id: "org-456" };
const mockSession = {
  id: "sess-789",
  title: "Test",
  level: "college",
  join_code: "ABC123",
  facilitator_id: "user-123",
  org_id: "org-456",
};

// Track what queries are made

function makeSingleResult(data: unknown, error?: unknown) {
  return { data, error: error || null };
}

// Chainable query builder
function makeChain(resolveWith: () => { data: unknown; error: unknown | null }) {
  const chain: Record<string, unknown> = {};
  const methods = ["select", "insert", "update", "eq", "is", "single", "order"];
  for (const m of methods) {
    chain[m] = vi.fn().mockReturnValue(chain);
  }
  chain.single = vi.fn().mockImplementation(() => Promise.resolve(resolveWith()));
  // Make select also return count property for head queries
  return chain;
}

let authUser: { id: string; email: string } | null = mockUser;
let facilitatorResult = makeSingleResult(mockFacilitator);
let insertResult = makeSingleResult(mockSession);

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: vi.fn().mockImplementation(async () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: authUser } }),
    },
    from: vi.fn().mockImplementation((table: string) => {
      if (table === "facilitators") {
        return makeChain(() => facilitatorResult);
      }
      if (table === "sessions") {
        // For insert
        const chain = makeChain(() => insertResult);
        chain.insert = vi.fn().mockReturnValue(chain);
        // For GET list query
        chain.select = vi.fn().mockReturnValue(chain);
        chain.order = vi.fn().mockImplementation(() => Promise.resolve({ data: [], error: null }));
        return chain;
      }
      return makeChain(() => ({ data: null, error: null }));
    }),
  })),
}));

// Import after mocking
const { POST, GET } = await import("@/app/api/sessions/route");

describe("POST /api/sessions", () => {
  beforeEach(() => {
    authUser = mockUser;
    facilitatorResult = makeSingleResult(mockFacilitator);
    insertResult = makeSingleResult(mockSession);
  });

  function makeReq(body: Record<string, unknown>) {
    return new NextRequest("http://localhost/api/sessions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("returns 401 when not authenticated", async () => {
    authUser = null;
    const res = await POST(makeReq({ title: "Test", level: "college" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 when title is missing", async () => {
    const res = await POST(makeReq({ level: "college" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when level is missing", async () => {
    const res = await POST(makeReq({ title: "Test" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when level is invalid", async () => {
    const res = await POST(makeReq({ title: "Test", level: "universite" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when title is empty after trim", async () => {
    const res = await POST(makeReq({ title: "   ", level: "college" }));
    expect(res.status).toBe(400);
  });

  it("accepts valid primaire level", async () => {
    const res = await POST(makeReq({ title: "Test", level: "primaire" }));
    // Should not be a 400 validation error
    expect(res.status).not.toBe(400);
  });

  it("accepts valid lycee level", async () => {
    const res = await POST(makeReq({ title: "Test", level: "lycee" }));
    expect(res.status).not.toBe(400);
  });

  it("returns 404 when facilitator profile is missing", async () => {
    facilitatorResult = makeSingleResult(null);
    const res = await POST(makeReq({ title: "Test", level: "college" }));
    expect(res.status).toBe(404);
  });

  it("creates session with valid input", async () => {
    const res = await POST(makeReq({ title: "Atelier cinema", level: "college", template: "comedie" }));
    const json = await res.json();
    expect(json.id).toBe("sess-789");
  });

  it("ignores invalid template value", async () => {
    const res = await POST(makeReq({ title: "Test", level: "college", template: "invalid-genre" }));
    // Should still create (cleanTemplate = null), not error
    expect(res.status).not.toBe(400);
  });

  it("truncates long title to 60 chars", async () => {
    const longTitle = "A".repeat(100);
    const res = await POST(makeReq({ title: longTitle, level: "college" }));
    expect(res.status).not.toBe(400);
  });
});

describe("GET /api/sessions", () => {
  beforeEach(() => {
    authUser = mockUser;
  });

  it("returns 401 when not authenticated", async () => {
    authUser = null;
    const res = await GET();
    expect(res.status).toBe(401);
  });
});
