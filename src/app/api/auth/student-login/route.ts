import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

// POST /api/auth/student-login — Magic link login for students
export async function POST(req: NextRequest) {
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Lien magique envoye ! Verifie tes emails." });
}
