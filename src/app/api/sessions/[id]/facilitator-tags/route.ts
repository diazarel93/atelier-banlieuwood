import { NextRequest, NextResponse } from "next/server";
import { requireFacilitator, safeJson, withErrorHandler } from "@/lib/api-utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getIP } from "@/lib/rate-limit";

// Adrian: "L'intervenant peut ajouter des tags simples :
// très créatif, force de proposition, bonne écoute, perturbateur, très investi"
// These tags feed into M8 points calculation.

const VALID_TAGS = [
  "tres_creatif", "force_de_proposition", "bonne_ecoute",
  "tres_investi", "bonne_cooperation", "leadership",
  "perturbateur", "decrochage",
] as const;

// GET — List all tags for a session (facilitator only)
export const GET = withErrorHandler(async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const auth = await requireFacilitator(sessionId);
  if ("error" in auth) return auth.error;

  const admin = createAdminClient();

  const studentId = req.nextUrl.searchParams.get("studentId");

  let query = admin
    .from("facilitator_tags")
    .select("id, student_id, tag, created_at")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false });

  if (studentId) {
    query = query.eq("student_id", studentId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[facilitator-tags GET]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({ tags: data || [] });
});

// POST — Add a tag to a student (facilitator only)
export const POST = withErrorHandler(async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rl = checkRateLimit(getIP(req), "facilitator-tags", { max: 30, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

  const { id: sessionId } = await params;
  const auth = await requireFacilitator(sessionId);
  if ("error" in auth) return auth.error;

  const admin = createAdminClient();

  const parsed = await safeJson(req);
  if ("error" in parsed) return parsed.error;
  const { studentId, tag } = parsed.data;

  if (!studentId || !tag) {
    return NextResponse.json({ error: "studentId et tag requis" }, { status: 400 });
  }

  if (!VALID_TAGS.includes(tag)) {
    return NextResponse.json(
      { error: `Tag invalide. Tags valides : ${VALID_TAGS.join(", ")}` },
      { status: 400 }
    );
  }

  const { data, error } = await admin
    .from("facilitator_tags")
    .upsert(
      { session_id: sessionId, student_id: studentId, tag },
      { onConflict: "session_id,student_id,tag" }
    )
    .select()
    .single();

  if (error) {
    console.error("[facilitator-tags POST]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({ success: true, tag: data });
});

// DELETE — Remove a tag from a student (facilitator only)
export const DELETE = withErrorHandler(async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rl = checkRateLimit(getIP(req), "facilitator-tags", { max: 30, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

  const { id: sessionId } = await params;
  const auth = await requireFacilitator(sessionId);
  if ("error" in auth) return auth.error;

  const admin = createAdminClient();

  const parsed = await safeJson(req);
  if ("error" in parsed) return parsed.error;
  const { studentId, tag } = parsed.data;

  if (!studentId || !tag) {
    return NextResponse.json({ error: "studentId et tag requis" }, { status: 400 });
  }

  const { error } = await admin
    .from("facilitator_tags")
    .delete()
    .eq("session_id", sessionId)
    .eq("student_id", studentId)
    .eq("tag", tag);

  if (error) {
    console.error("[facilitator-tags DELETE]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
});
