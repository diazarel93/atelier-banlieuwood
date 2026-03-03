import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, getIP } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  // Each test uses a unique route to avoid state leaking
  let testRoute: string;
  beforeEach(() => {
    testRoute = `test-${Date.now()}-${Math.random()}`;
  });

  it("allows requests under the limit", () => {
    const result = checkRateLimit("1.2.3.4", testRoute, { max: 5, windowSec: 60 });
    expect(result).toBeNull();
  });

  it("allows exactly max requests", () => {
    for (let i = 0; i < 5; i++) {
      const result = checkRateLimit("1.2.3.4", testRoute, { max: 5, windowSec: 60 });
      expect(result).toBeNull();
    }
  });

  it("blocks requests over the limit", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("1.2.3.4", testRoute, { max: 5, windowSec: 60 });
    }
    const result = checkRateLimit("1.2.3.4", testRoute, { max: 5, windowSec: 60 });
    expect(result).not.toBeNull();
    expect(result!.error).toBeTruthy();
    expect(result!.retryAfterSec).toBeGreaterThan(0);
  });

  it("isolates different IPs", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("1.1.1.1", testRoute, { max: 5, windowSec: 60 });
    }
    // Different IP should still be allowed
    const result = checkRateLimit("2.2.2.2", testRoute, { max: 5, windowSec: 60 });
    expect(result).toBeNull();
  });

  it("isolates different routes", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("1.1.1.1", `${testRoute}-a`, { max: 5, windowSec: 60 });
    }
    // Different route should still be allowed
    const result = checkRateLimit("1.1.1.1", `${testRoute}-b`, { max: 5, windowSec: 60 });
    expect(result).toBeNull();
  });
});

describe("getIP", () => {
  it("extracts IP from x-forwarded-for header", () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "203.0.113.50, 70.41.3.18" },
    });
    expect(getIP(req)).toBe("203.0.113.50");
  });

  it("extracts IP from x-real-ip header", () => {
    const req = new Request("http://localhost", {
      headers: { "x-real-ip": "203.0.113.50" },
    });
    expect(getIP(req)).toBe("203.0.113.50");
  });

  it("returns unknown when no IP headers", () => {
    const req = new Request("http://localhost");
    expect(getIP(req)).toBe("unknown");
  });
});
