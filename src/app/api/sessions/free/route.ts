import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getIP } from "@/lib/rate-limit";
import { safeJson, withErrorHandler } from "@/lib/api-utils";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

// POST — create a free (solo) session without auth
export const POST = withErrorHandler<Record<string, never>>(async function POST(req: NextRequest) {
  const rl = checkRateLimit(getIP(req), "free-session", { max: 5, windowSec: 60 });
  if (rl) {
    return NextResponse.json({ error: rl.error }, { status: 429 });
  }

  const parsed = await safeJson<{ displayName: string; avatar: string; level: string }>(req);
  if ("error" in parsed) return parsed.error;
  const { displayName, avatar, level } = parsed.data;

  if (!displayName?.trim() || !avatar || !level) {
    return NextResponse.json({ error: "Nom, avatar et niveau requis" }, { status: 400 });
  }

  const VALID_LEVELS = ["primaire", "college", "lycee"];
  if (!VALID_LEVELS.includes(level)) {
    return NextResponse.json({ error: "Niveau invalide" }, { status: 400 });
  }

  const cleanName = String(displayName).trim().slice(0, 30);
  const joinCode = nanoid();

  const admin = createAdminClient();

  // Create session in free mode (no facilitator, no org)
  const { data: session, error: sessionError } = await admin
    .from("sessions")
    .insert({
      title: `Film de ${cleanName}`,
      level,
      join_code: joinCode,
      mode: "free",
      status: "responding", // start immediately
      current_module: 3,
      current_seance: 1,
      current_situation_index: 0,
    })
    .select()
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: sessionError?.message || "Erreur lors de la création" }, { status: 500 });
  }

  // Create the solo student
  const { data: student, error: studentError } = await admin
    .from("students")
    .insert({
      session_id: session.id,
      display_name: cleanName,
      avatar: String(avatar),
    })
    .select("id")
    .single();

  if (studentError || !student) {
    return NextResponse.json({ error: "Erreur lors de l'inscription" }, { status: 500 });
  }

  return NextResponse.json({
    sessionId: session.id,
    studentId: student.id,
  });
});
