import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { getSessionFullData } from "@/lib/session-data";
import { generateFicheCours } from "@/lib/ai";
import { checkRateLimit, getIP } from "@/lib/rate-limit";

// GET — return cached fiche de cours for this session
export async function GET(
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
    .eq("report_type", "fiche_cours")
    .single();

  if (!data) {
    return NextResponse.json({ error: "Fiche non générée" }, { status: 404 });
  }

  return NextResponse.json({
    fiche: data.content,
    provider: data.ai_provider,
    generatedAt: data.generated_at,
  });
}

// POST — generate fiche de cours linked to this session
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const limited = checkRateLimit(getIP(req), "fiche-cours", { max: 3, windowSec: 60 });
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
      .eq("report_type", "fiche_cours")
      .single();

    if (cached) {
      return NextResponse.json({
        fiche: cached.content,
        provider: cached.ai_provider,
        generatedAt: cached.generated_at,
      });
    }
  }

  // Fetch session data for context
  let sessionData;
  try {
    sessionData = await getSessionFullData(sessionId);
  } catch {
    return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  }

  // Try to get existing bilan narrative for the session recap
  let sessionRecap: string | null = null;
  const { data: bilanReport } = await admin
    .from("session_reports")
    .select("content")
    .eq("session_id", sessionId)
    .eq("report_type", "bilan")
    .single();

  if (bilanReport?.content) {
    const bilanContent = bilanReport.content as { narrativeSummary?: string };
    sessionRecap = bilanContent.narrativeSummary || null;
  }

  const { fiche, provider } = await generateFicheCours({
    level: sessionData.session.level,
    template: sessionData.session.template,
    sessionRecap,
  });

  await admin.from("session_reports").upsert(
    {
      session_id: sessionId,
      report_type: "fiche_cours",
      content: fiche,
      ai_provider: provider,
      generated_at: new Date().toISOString(),
    },
    { onConflict: "session_id,report_type" }
  );

  return NextResponse.json({
    fiche,
    provider,
    generatedAt: new Date().toISOString(),
  });
}
