import { createAdminClient } from "@/lib/supabase/admin";

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
 * Fire-and-forget audit log insert.
 * Logs pilot actions for accountability and debugging.
 * Never throws — failures are silently ignored.
 */
export function logAudit({ action, actor, sessionId, details }: AuditLogEntry) {
  try {
    const admin = createAdminClient();
    admin
      .from("audit_logs")
      .insert({
        action,
        actor_id: actor,
        session_id: sessionId,
        details: details || {},
      })
      .then(
        () => {},
        () => {}
      );
  } catch {
    // Silent — audit logging should never block the main flow
  }
}
