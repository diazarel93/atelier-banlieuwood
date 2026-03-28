import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { withErrorHandler } from "@/lib/api-utils";
import { checkRateLimit, getIP } from "@/lib/rate-limit";

export const GET = withErrorHandler<Record<string, never>>(async function GET() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  if (error && error.code === "PGRST116") {
    // No profile yet — upsert to avoid race condition with concurrent requests
    const { data: newProfile, error: createError } = await supabase
      .from("student_profiles")
      .upsert(
        {
          auth_user_id: user.id,
          display_name: user.user_metadata?.display_name || user.email?.split("@")[0] || "Joueur",
          avatar: user.user_metadata?.avatar || "🎬",
          email: user.email,
        },
        { onConflict: "auth_user_id" },
      )
      .select()
      .single();

    if (createError) {
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
    return NextResponse.json(newProfile);
  }

  if (error) {
    console.error("[student-profile GET]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json(profile);
});

export const PATCH = withErrorHandler<Record<string, never>>(async function PATCH(req: NextRequest) {
  const rl = checkRateLimit(getIP(req), "student-profile", { max: 20, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const body = await req.json();
  const allowedFields = [
    "display_name",
    "avatar",
    "avatar_accessories",
    "avatar_frame",
    "custom_title",
    "particle_effect",
  ];

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      const val = body[field];
      // Validate string length
      if (typeof val === "string" && val.length > 200) {
        return NextResponse.json({ error: `${field} trop long (max 200)` }, { status: 400 });
      }
      updates[field] = val;
    }
  }

  const { data, error } = await supabase
    .from("student_profiles")
    .update(updates)
    .eq("auth_user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("[student-profile PATCH]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json(data);
});
