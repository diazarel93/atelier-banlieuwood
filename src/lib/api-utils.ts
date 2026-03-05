import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;


/**
 * Validate a string is a valid UUIDv4 format.
 */
export function isValidUUID(value: string): boolean {
  return UUID_RE.test(value);
}

/**
 * Require an authenticated facilitator who owns the given session.
 * Returns { supabase, user } on success, or a NextResponse error.
 */
export async function requireFacilitator(sessionId: string) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };
  }

  // RLS already filters by facilitator_id = auth.uid(), so if we can't find
  // the session, the user doesn't own it (or it doesn't exist).
  const { data: session } = await supabase
    .from("sessions")
    .select("id")
    .eq("id", sessionId)
    .single();

  if (!session) {
    return { error: NextResponse.json({ error: "Session introuvable ou accès refusé" }, { status: 403 }) };
  }

  return { supabase, user };
}

/**
 * Broadcast a session update to all connected clients via Supabase Realtime.
 * Uses REST API (no WebSocket server-side). Best-effort, never throws.
 */
export function broadcastSessionUpdate(sessionId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  fetch(`${supabaseUrl}/realtime/v1/api/broadcast`, {
    method: "POST",
    headers: { apikey: serviceKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{
        topic: `realtime:session-${sessionId}`,
        event: "session-update",
        payload: {},
      }],
    }),
  }).catch(() => { /* best-effort */ });
}

/**
 * Safely parse JSON body from a request.
 * Returns parsed body on success, or a 400 NextResponse on failure.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function safeJson<T = Record<string, any>>(
  req: NextRequest
): Promise<{ data: T } | { error: NextResponse }> {
  try {
    const data = await req.json();
    return { data: data as T };
  } catch {
    return {
      error: NextResponse.json(
        { error: "Corps de requête JSON invalide" },
        { status: 400 }
      ),
    };
  }
}
