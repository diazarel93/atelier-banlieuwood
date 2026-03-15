import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, actor, sessionId, details } = body as {
      action: string;
      actor: string;
      sessionId: string;
      details?: Record<string, unknown>;
    };

    if (!action || !actor || !sessionId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const admin = createAdminClient();
    await admin.from("audit_logs").insert({
      action,
      actor_id: actor,
      session_id: sessionId,
      details: details || {},
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
