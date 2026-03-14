import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { getSessionFullData } from "@/lib/session-data";
import { generateBilanSession } from "@/lib/ai";
import { checkRateLimit, getIP } from "@/lib/rate-limit";
import { withErrorHandler } from "@/lib/api-utils";

// GET — return cached bilan (404 if not generated)
export const GET = withErrorHandler(async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("session_reports")
    .select("content, ai_provider, generated_at")
    .eq("session_id", sessionId)
    .eq("report_type", "bilan")
    .single();

  if (!data) {
    return NextResponse.json({ error: "Bilan non généré" }, { status: 404 });
  }

  return NextResponse.json({
    bilan: data.content,
    provider: data.ai_provider,
    generatedAt: data.generated_at,
  });
});

// POST — generate (or re-generate with ?force=true)
export const POST = withErrorHandler(async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Rate limit: 3 req/min
  const limited = checkRateLimit(getIP(req), "bilan", { max: 3, windowSec: 60 });
  if (limited) {
    return NextResponse.json({ error: limited.error }, { status: 429 });
  }

  const force = req.nextUrl.searchParams.get("force") === "true";
  const admin = createAdminClient();

  // Check cache unless forced
  if (!force) {
    const { data: cached } = await admin
      .from("session_reports")
      .select("content, ai_provider, generated_at")
      .eq("session_id", sessionId)
      .eq("report_type", "bilan")
      .single();

    if (cached) {
      return NextResponse.json({
        bilan: cached.content,
        provider: cached.ai_provider,
        generatedAt: cached.generated_at,
      });
    }
  }

  // Fetch full session data
  let data;
  try {
    data = await getSessionFullData(sessionId);
  } catch {
    return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  }

  // Generate bilan
  const { bilan, provider } = await generateBilanSession(data);

  // Upsert into session_reports
  await admin.from("session_reports").upsert(
    {
      session_id: sessionId,
      report_type: "bilan",
      content: bilan,
      ai_provider: provider,
      generated_at: new Date().toISOString(),
    },
    { onConflict: "session_id,report_type" }
  );

  return NextResponse.json({
    bilan,
    provider,
    generatedAt: new Date().toISOString(),
  });
});
