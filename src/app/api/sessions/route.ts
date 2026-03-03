import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

// GET — list facilitator's sessions
export async function GET() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("sessions")
    .select("*, students(count)")
    .eq("facilitator_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Flatten students count for frontend
  const sessions = (data || []).map((s: Record<string, unknown>) => {
    const students = s.students as { count: number }[] | undefined;
    return {
      ...s,
      studentCount: students?.[0]?.count ?? 0,
    };
  });

  return NextResponse.json(sessions);
}

// POST — create a new session
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const { title, level, template } = await req.json();

  if (!title || !level) {
    return NextResponse.json(
      { error: "Titre et niveau requis" },
      { status: 400 }
    );
  }

  // Validate & sanitize inputs
  const cleanTitle = String(title).trim().slice(0, 60);
  const VALID_LEVELS = ["primaire", "college", "lycee"];
  if (!VALID_LEVELS.includes(level)) {
    return NextResponse.json(
      { error: "Niveau invalide" },
      { status: 400 }
    );
  }

  const VALID_TEMPLATES = ["horreur", "comedie", "action", "romance", "drame", "sci-fi", "policier", "fantastique"];
  const cleanTemplate = template && VALID_TEMPLATES.includes(template) ? template : null;

  if (cleanTitle.length < 1) {
    return NextResponse.json(
      { error: "Titre trop court" },
      { status: 400 }
    );
  }

  // Get facilitator's org
  const { data: facilitator } = await supabase
    .from("facilitators")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!facilitator) {
    return NextResponse.json(
      { error: "Profil facilitateur introuvable" },
      { status: 404 }
    );
  }

  // Generate unique 6-char join code
  const joinCode = nanoid();

  const { data, error } = await supabase
    .from("sessions")
    .insert({
      org_id: facilitator.org_id,
      facilitator_id: user.id,
      title: cleanTitle,
      level,
      join_code: joinCode,
      template: cleanTemplate,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
