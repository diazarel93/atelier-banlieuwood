/**
 * Auth types & permission helpers — single source of truth for role logic.
 */

export type UserRole = "admin" | "intervenant" | "professeur" | "client";
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

// ── R4(2b) Role separation ──────────────────

/** Professeur: dashboard post-séance (tendances groupe, anonymisé) */
export function canAccessDashboard(user: AuthUser): boolean {
  return isActive(user) && (user.role === "admin" || user.role === "professeur" || user.role === "intervenant");
}

/** Professeur-only views: stats, élèves, tendances */
export function canViewStudentTrends(user: AuthUser): boolean {
  return isActive(user) && (user.role === "admin" || user.role === "professeur");
}

/** Intervenant cannot see past session data or student trends */
export function isIntervenant(user: AuthUser): boolean {
  return user.role === "intervenant";
}

/** Professeur cannot pilot sessions */
export function isProfesseur(user: AuthUser): boolean {
  return user.role === "professeur";
}
