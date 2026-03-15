export type AuditAction =
  | "module_switch"
  | "student_remove"
  | "student_warn"
  | "student_toggle_active"
  | "session_pause"
  | "session_resume"
  | "response_reset"
  | "response_reset_all"
  | "vote_start"
  | "session_end";

interface AuditLogEntry {
  action: AuditAction;
  actor: string; // user ID or "system"
  sessionId: string;
  details?: Record<string, unknown>;
}

/**
 * Fire-and-forget audit log via POST /api/audit.
 * Safe to call from client components — no server-only imports.
 * Never throws — failures are silently ignored.
 */
export function logAudit({ action, actor, sessionId, details }: AuditLogEntry) {
  try {
    fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, actor, sessionId, details }),
    }).catch(() => {});
  } catch {
    // Silent — audit logging should never block the main flow
  }
}
