import { describe, it, expect } from "vitest";
import { isValidUUID } from "@/lib/api-utils";

describe("isValidUUID", () => {
  it("accepts valid UUIDv4", () => {
    expect(isValidUUID("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    expect(isValidUUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")).toBe(true);
  });

  it("accepts uppercase UUID", () => {
    expect(isValidUUID("550E8400-E29B-41D4-A716-446655440000")).toBe(true);
  });

  it("rejects invalid strings", () => {
    expect(isValidUUID("")).toBe(false);
    expect(isValidUUID("not-a-uuid")).toBe(false);
    expect(isValidUUID("550e8400-e29b-41d4-a716")).toBe(false);
    expect(isValidUUID("550e8400e29b41d4a716446655440000")).toBe(false); // no dashes
    expect(isValidUUID("gggggggg-gggg-gggg-gggg-gggggggggggg")).toBe(false);
  });
});
