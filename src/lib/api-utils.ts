import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth-helpers";
import type { AuthUser } from "@/lib/auth";
import * as Sentry from "@sentry/nextjs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;


/**
 * Validate a string is a valid UUIDv4 format.
 */
export function isValidUUID(value: string): boolean {
  return UUID_RE.test(value);
}

/**
 * Require any authenticated, active user.
 * Returns { supabase, user, authUser } on success, or a NextResponse error.
 */
export async function requireAuth() {
  const supabase = await createServerSupabase();
  const authUser = await getAuthUser(supabase);

  if (!authUser) {
    return { error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };
  }

  if (authUser.status !== "active") {
    return { error: NextResponse.json({ error: "Compte inactif" }, { status: 403 }) };
  }

  const { data: { user } } = await supabase.auth.getUser();

  return { supabase, user: user!, authUser };
}

/**
 * Require an admin user.
 * Returns { supabase, user, authUser } on success, or a NextResponse error.
 */
export async function requireAdmin() {
  const result = await requireAuth();
  if ("error" in result) return result;

  if (result.authUser.role !== "admin") {
    return { error: NextResponse.json({ error: "Accès admin requis" }, { status: 403 }) };
  }

  return result;
}

/**
 * Require an authenticated facilitator who owns the given session.
 * Returns { supabase, user, authUser } on success, or a NextResponse error.
 * Backward compatible: authUser is added but existing callers don't need it.
 * Admins can access any session via updated RLS policy.
 */
export async function requireFacilitator(sessionId: string) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };
  }

  // RLS already filters by facilitator_id = auth.uid() OR is_admin(),
  // so if we can't find the session, the user doesn't own it (or it doesn't exist).
  const { data: session } = await supabase
    .from("sessions")
    .select("id")
    .eq("id", sessionId)
    .single();

  if (!session) {
    return { error: NextResponse.json({ error: "Session introuvable ou accès refusé" }, { status: 403 }) };
  }

  // Load authUser (optional — doesn't break if facilitator profile missing)
  const authUser = await getAuthUser(supabase);

  return { supabase, user, authUser };
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

/**
 * Wrap an API route handler with try/catch + Sentry error reporting.
 * Catches unhandled exceptions, logs them, reports to Sentry, and
 * returns a consistent 500 JSON response.
 */
export function withErrorHandler<
  P extends Record<string, string> = { id: string }
>(
  handler: (
    req: NextRequest,
    ctx: { params: Promise<P> }
  ) => Promise<NextResponse | undefined>
) {
  return async (
    req: NextRequest,
    ctx: { params: Promise<P> }
  ): Promise<NextResponse> => {
    try {
      const result = await handler(req, ctx);
      if (!result) {
        console.error(
          `[API Error] ${req.method} ${req.nextUrl.pathname}: handler returned undefined`
        );
        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500 }
        );
      }
      return result;
    } catch (error) {
      console.error(
        `[API Error] ${req.method} ${req.nextUrl.pathname}:`,
        error
      );
      Sentry.captureException(error, {
        extra: { method: req.method, url: req.nextUrl.pathname },
      });
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}
