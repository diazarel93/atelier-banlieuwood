import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireFacilitator, isValidUUID, withErrorHandler } from "@/lib/api-utils";
import { log } from "@/lib/logger";
import { checkRateLimit, getIP } from "@/lib/rate-limit";

/**
 * POST /api/sessions/[id]/postprod
 * Submit student work for Module 13 positions 1-5.
 * Body: { studentId, position, data }
 */
export const POST = withErrorHandler(async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const rl = checkRateLimit(getIP(req), "postprod", { max: 20, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

  const { id: sessionId } = await params;
  const admin = createAdminClient();

  const body = await req.json();
  const { studentId, position, data } = body;

  if (!studentId || !isValidUUID(studentId)) {
    return NextResponse.json({ error: "studentId invalide" }, { status: 400 });
  }
  if (!position || position < 1 || position > 5) {
    return NextResponse.json({ error: "Position invalide (1-5)" }, { status: 400 });
  }

  // Verify student belongs to this session
  const { data: student } = await admin
    .from("students")
    .select("id")
    .eq("id", studentId)
    .eq("session_id", sessionId)
    .single();

  if (!student) {
    return NextResponse.json({ error: "Élève non trouvé" }, { status: 403 });
  }

  try {
    if (position === 1) {
      // Montage — scene order
      const sceneOrder = data?.sceneOrder;
      if (!Array.isArray(sceneOrder)) {
        return NextResponse.json({ error: "sceneOrder requis" }, { status: 400 });
      }
      await admin
        .from("module13_montages")
        .upsert(
          { session_id: sessionId, student_id: studentId, scene_order: sceneOrder },
          { onConflict: "session_id,student_id" },
        );
    } else if (position === 2) {
      // Musique
      const { genre, mood, justification } = data || {};
      if (!genre || !mood) {
        return NextResponse.json({ error: "genre et mood requis" }, { status: 400 });
      }
      await admin
        .from("module13_musiques")
        .upsert(
          { session_id: sessionId, student_id: studentId, genre, mood, justification: justification || null },
          { onConflict: "session_id,student_id" },
        );
    } else if (position === 3) {
      // Titre
      const titre = data?.titre?.trim();
      if (!titre) {
        return NextResponse.json({ error: "titre requis" }, { status: 400 });
      }
      await admin
        .from("module13_titres")
        .upsert({ session_id: sessionId, student_id: studentId, titre }, { onConflict: "session_id,student_id" });
    } else if (position === 4) {
      // Affiche
      const { style, description, tagline } = data || {};
      if (!style || !description) {
        return NextResponse.json({ error: "style et description requis" }, { status: 400 });
      }
      await admin
        .from("module13_affiches")
        .upsert(
          { session_id: sessionId, student_id: studentId, style, description, tagline: tagline || null },
          { onConflict: "session_id,student_id" },
        );
    } else if (position === 5) {
      // Bande-annonce
      const { moments, voixOff } = data || {};
      if (!Array.isArray(moments) || moments.length === 0) {
        return NextResponse.json({ error: "moments requis" }, { status: 400 });
      }
      await admin
        .from("module13_trailers")
        .upsert(
          { session_id: sessionId, student_id: studentId, moments, voix_off: voixOff || null },
          { onConflict: "session_id,student_id" },
        );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    log.error("Module 13 submit error", { route: "/api/sessions/[id]/postprod", error: String(err) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
});

/**
 * PUT /api/sessions/[id]/postprod
 * Facilitator validates a result for a position.
 * Body: { position, resultType, resultData }
 */
export const PUT = withErrorHandler(async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const rl = checkRateLimit(getIP(req), "postprod", { max: 20, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

  const { id: sessionId } = await params;
  const auth = await requireFacilitator(sessionId);
  if ("error" in auth) return auth.error;

  const admin = createAdminClient();
  const body = await req.json();
  const { position, resultType, resultData } = body;

  if (!position || position < 1 || position > 8) {
    return NextResponse.json({ error: "Position invalide" }, { status: 400 });
  }

  await admin.from("module13_results").upsert(
    {
      session_id: sessionId,
      position,
      result_type: resultType || `step-${position}`,
      result_data: resultData || {},
    },
    { onConflict: "session_id,position" },
  );

  return NextResponse.json({ ok: true });
});

/**
 * GET /api/sessions/[id]/postprod
 * Facilitator gets all M13 data for the session.
 */
export const GET = withErrorHandler(async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await params;
  const auth = await requireFacilitator(sessionId);
  if ("error" in auth) return auth.error;

  const admin = createAdminClient();

  const [montages, musiques, titres, affiches, trailers, results] = await Promise.all([
    admin.from("module13_montages").select("*").eq("session_id", sessionId),
    admin.from("module13_musiques").select("*").eq("session_id", sessionId),
    admin.from("module13_titres").select("*").eq("session_id", sessionId),
    admin.from("module13_affiches").select("*").eq("session_id", sessionId),
    admin.from("module13_trailers").select("*").eq("session_id", sessionId),
    admin.from("module13_results").select("*").eq("session_id", sessionId).order("position"),
  ]);

  return NextResponse.json({
    montages: montages.data || [],
    musiques: musiques.data || [],
    titres: titres.data || [],
    affiches: affiches.data || [],
    trailers: trailers.data || [],
    results: results.data || [],
  });
});
