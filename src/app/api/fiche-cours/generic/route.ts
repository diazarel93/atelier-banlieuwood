import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { generateFicheCours } from "@/lib/ai";
import { checkRateLimit, getIP } from "@/lib/rate-limit";
import { withErrorHandler } from "@/lib/api-utils";

const VALID_LEVELS = ["primaire", "college", "lycee"];

// POST — generate a generic (pre-session) fiche de cours
export const POST = withErrorHandler<Record<string, never>>(async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const limited = checkRateLimit(getIP(req), "fiche-generic", { max: 3, windowSec: 60 });
  if (limited) {
    return NextResponse.json({ error: limited.error }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const level = body.level as string;
  const template = (body.template as string) || null;

  if (!level || !VALID_LEVELS.includes(level)) {
    return NextResponse.json({ error: "Niveau requis : primaire, college, lycee" }, { status: 400 });
  }

  const admin = createAdminClient();
  const force = req.nextUrl.searchParams.get("force") === "true";

  // Check cache
  if (!force) {
    const { data: cached } = await admin
      .from("course_guides")
      .select("content, ai_provider, generated_at")
      .eq("level", level)
      .is("template", template ? undefined : null);

    // Match by level + template
    const match = template
      ? cached?.find((c: { content: unknown; ai_provider: string; generated_at: string }) => true) // single row expected from unique constraint
      : cached?.[0];

    if (match) {
      return NextResponse.json(
        {
          fiche: match.content,
          provider: match.ai_provider,
          generatedAt: match.generated_at,
        },
        { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=7200" } },
      );
    }
  }

  const { fiche, provider } = await generateFicheCours({ level, template });

  // Upsert into course_guides
  await admin.from("course_guides").upsert(
    {
      level,
      template,
      content: fiche,
      ai_provider: provider,
      generated_at: new Date().toISOString(),
    },
    { onConflict: "level,COALESCE(template, '__none__')" },
  );

  return NextResponse.json(
    {
      fiche,
      provider,
      generatedAt: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=7200" } },
  );
});
