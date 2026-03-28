import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const HEALTH_TIMEOUT_MS = 5000;

/**
 * GET /api/health
 * Lightweight health check with DB connectivity validation.
 * Returns 200 if healthy, 503 if degraded.
 * Includes latency measurement and explicit timeout protection.
 */
export async function GET() {
  const start = Date.now();
  let dbOk = false;
  let dbError: string | null = null;
  const admin = createAdminClient();

  try {
    // Race the DB query against a timeout to prevent hanging
    const result = await Promise.race([
      admin.from("sessions").select("id").limit(1),
      new Promise<{ error: { message: string } }>((resolve) =>
        setTimeout(() => resolve({ error: { message: "Health check timeout" } }), HEALTH_TIMEOUT_MS),
      ),
    ]);

    if (result.error) {
      dbOk = false;
      dbError = result.error.message;
      console.error("[health] DB check failed:", dbError);
    } else {
      dbOk = true;
    }
  } catch (e) {
    dbOk = false;
    dbError = e instanceof Error ? e.message : "Unknown error";
    console.error("[health] DB check exception:", dbError);
  }

  const latencyMs = Date.now() - start;

  // Realtime check — try a lightweight broadcast
  let realtimeOk = false;
  try {
    const channel = admin.channel(`health-check-${Date.now()}`);
    await channel.subscribe();
    await channel.unsubscribe();
    realtimeOk = true;
  } catch {
    realtimeOk = false;
  }

  return NextResponse.json(
    {
      status: dbOk ? "ok" : "degraded",
      db: dbOk,
      realtime: realtimeOk,
      latency_ms: latencyMs,
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "dev",
      node_env: process.env.NODE_ENV,
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      ...(dbError && { error: dbError }),
    },
    {
      status: dbOk ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
