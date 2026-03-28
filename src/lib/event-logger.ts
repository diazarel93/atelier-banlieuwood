import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Log a session event — fire-and-forget, never blocks the critical path.
 */
export function logSessionEvent(event: {
  sessionId: string;
  eventType: string;
  studentId?: string | null;
  situationId?: string | null;
  payload?: Record<string, unknown>;
}): void {
  const admin = createAdminClient();
  admin
    .from("session_events")
    .insert({
      session_id: event.sessionId,
      event_type: event.eventType,
      student_id: event.studentId ?? null,
      situation_id: event.situationId ?? null,
      payload: event.payload ?? {},
    })
    .then(
      () => {},
      (err) => console.error("[event-logger]", err.message),
    ); // fire-and-forget
}
