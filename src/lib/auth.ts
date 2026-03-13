/**
 * Auth types & permission helpers — single source of truth for role logic.
 */

export type UserRole = "admin" | "intervenant" | "client";
export type UserStatus = "pending" | "active" | "rejected" | "deactivated";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  institution: string | null;
  org_id: string;
}

// ── Permission checks ────────────────────────

export function isActive(user: AuthUser): boolean {
  return user.status === "active";
}

export function canCreateSession(user: AuthUser): boolean {
  return isActive(user) && (user.role === "admin" || user.role === "intervenant");
}

export function canPilotSession(user: AuthUser): boolean {
  return isActive(user) && (user.role === "admin" || user.role === "intervenant");
}

export function canAccessAdmin(user: AuthUser): boolean {
  return isActive(user) && user.role === "admin";
}

export function canManageUsers(user: AuthUser): boolean {
  return isActive(user) && user.role === "admin";
}

export function canViewSessions(user: AuthUser): boolean {
  return isActive(user);
}
