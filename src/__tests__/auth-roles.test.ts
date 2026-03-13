import { describe, it, expect } from "vitest";
import {
  isActive,
  canCreateSession,
  canPilotSession,
  canAccessAdmin,
  canManageUsers,
  canViewSessions,
  type AuthUser,
} from "@/lib/auth";

function makeUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: "test-id",
    email: "test@example.com",
    name: "Test User",
    role: "intervenant",
    status: "active",
    institution: null,
    org_id: "org-id",
    ...overrides,
  };
}

describe("Auth permission helpers", () => {
  describe("isActive", () => {
    it("returns true for active users", () => {
      expect(isActive(makeUser({ status: "active" }))).toBe(true);
    });

    it("returns false for pending users", () => {
      expect(isActive(makeUser({ status: "pending" }))).toBe(false);
    });

    it("returns false for rejected users", () => {
      expect(isActive(makeUser({ status: "rejected" }))).toBe(false);
    });

    it("returns false for deactivated users", () => {
      expect(isActive(makeUser({ status: "deactivated" }))).toBe(false);
    });
  });

  describe("canCreateSession", () => {
    it("allows active admin", () => {
      expect(canCreateSession(makeUser({ role: "admin" }))).toBe(true);
    });

    it("allows active intervenant", () => {
      expect(canCreateSession(makeUser({ role: "intervenant" }))).toBe(true);
    });

    it("denies active client", () => {
      expect(canCreateSession(makeUser({ role: "client" }))).toBe(false);
    });

    it("denies pending intervenant", () => {
      expect(canCreateSession(makeUser({ role: "intervenant", status: "pending" }))).toBe(false);
    });
  });

  describe("canPilotSession", () => {
    it("allows active admin", () => {
      expect(canPilotSession(makeUser({ role: "admin" }))).toBe(true);
    });

    it("allows active intervenant", () => {
      expect(canPilotSession(makeUser({ role: "intervenant" }))).toBe(true);
    });

    it("denies client", () => {
      expect(canPilotSession(makeUser({ role: "client" }))).toBe(false);
    });
  });

  describe("canAccessAdmin", () => {
    it("allows active admin", () => {
      expect(canAccessAdmin(makeUser({ role: "admin" }))).toBe(true);
    });

    it("denies intervenant", () => {
      expect(canAccessAdmin(makeUser({ role: "intervenant" }))).toBe(false);
    });

    it("denies client", () => {
      expect(canAccessAdmin(makeUser({ role: "client" }))).toBe(false);
    });

    it("denies pending admin", () => {
      expect(canAccessAdmin(makeUser({ role: "admin", status: "pending" }))).toBe(false);
    });
  });

  describe("canManageUsers", () => {
    it("allows active admin", () => {
      expect(canManageUsers(makeUser({ role: "admin" }))).toBe(true);
    });

    it("denies intervenant", () => {
      expect(canManageUsers(makeUser({ role: "intervenant" }))).toBe(false);
    });
  });

  describe("canViewSessions", () => {
    it("allows all active roles", () => {
      expect(canViewSessions(makeUser({ role: "admin" }))).toBe(true);
      expect(canViewSessions(makeUser({ role: "intervenant" }))).toBe(true);
      expect(canViewSessions(makeUser({ role: "client" }))).toBe(true);
    });

    it("denies inactive users", () => {
      expect(canViewSessions(makeUser({ status: "pending" }))).toBe(false);
    });
  });
});
