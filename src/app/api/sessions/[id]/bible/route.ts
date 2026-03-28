import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { getSessionFullData } from "@/lib/session-data";
import { generateBibleFilm } from "@/lib/ai";
import { checkRateLimit, getIP } from "@/lib/rate-limit";
import { withErrorHandler } from "@/lib/api-utils";

// GET — return cached bible (404 if not generated)
export const GET = withErrorHandler(async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await params;
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("session_reports")
    .select("content, ai_provider, generated_at")
    .eq("session_id", sessionId)
    .eq("report_type", "bible")
    .single();

  if (!data) {
    return NextResponse.json({ error: "Bible non générée" }, { status: 404 });
  }

  return NextResponse.json({
    bible: data.content,
    provider: data.ai_provider,
    generatedAt: data.generated_at,
  });
});

// POST — generate (or re-generate with ?force=true)
export const POST = withErrorHandler(async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await params;
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const limited = checkRateLimit(getIP(req), "bible", { max: 3, windowSec: 60 });
  if (limited) {
    return NextResponse.json({ error: limited.error }, { status: 429 });
  }

  const force = req.nextUrl.searchParams.get("force") === "true";
  const admin = createAdminClient();

  if (!force) {
    const { data: cached } = await admin
      .from("session_reports")
      .select("content, ai_provider, generated_at")
      .eq("session_id", sessionId)
      .eq("report_type", "bible")
      .single();

    if (cached) {
      return NextResponse.json({
        bible: cached.content,
        provider: cached.ai_provider,
        generatedAt: cached.generated_at,
      });
    }
  }

  let data;
  try {
    data = await getSessionFullData(sessionId);
  } catch {
    return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  }

  const { bible, provider } = await generateBibleFilm(data);

  await admin.from("session_reports").upsert(
    {
      session_id: sessionId,
      report_type: "bible",
      content: bible,
      ai_provider: provider,
      generated_at: new Date().toISOString(),
    },
    { onConflict: "session_id,report_type" },
  );

  return NextResponse.json({
    bible,
    provider,
    generatedAt: new Date().toISOString(),
  });
});
