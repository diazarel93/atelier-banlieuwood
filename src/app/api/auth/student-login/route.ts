import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { withErrorHandler } from "@/lib/api-utils";
import { checkRateLimit, getIP } from "@/lib/rate-limit";

// POST /api/auth/student-login — Magic link login for students
export const POST = withErrorHandler<Record<string, never>>(async function POST(req: NextRequest) {
  const rl = checkRateLimit(getIP(req), "student-login", { max: 10, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

  const supabase = await createServerSupabase();
  const { email, displayName, avatar } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email requis" }, { status: 400 });
  }

  // Send magic link
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      data: {
        display_name: displayName || email.split("@")[0],
        avatar: avatar || "🎬",
        role: "student",
      },
      emailRedirectTo: `${req.nextUrl.origin}/auth/callback?next=/studio`,
    },
  });

  if (error) {
    console.error("[student-login]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({ message: "Lien magique envoye ! Verifie tes emails." });
});
