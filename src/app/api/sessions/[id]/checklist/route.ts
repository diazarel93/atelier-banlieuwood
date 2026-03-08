import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getIP } from "@/lib/rate-limit";
import { CONTENT_CATALOG, isValidContentKey, MIN_CHECKLIST } from "@/lib/module5-data";
import { safeJson } from "@/lib/api-utils";

// POST — student submits checklist (Module 2 séance 1)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rl = checkRateLimit(getIP(req), "checklist", { max: 10, windowSec: 60 });
  if (rl) {
    return NextResponse.json({ error: rl.error }, { status: 429 });
  }

  const { id: sessionId } = await params;
  const parsed = await safeJson(req);
  if ("error" in parsed) return parsed.error;
  const { studentId, selectedItems, chosenItem, sceneMarquante, deeperReflection } = parsed.data;

  if (!studentId || !Array.isArray(selectedItems)) {
    return NextResponse.json(
      { error: "studentId et selectedItems requis" },
      { status: 400 }
    );
  }

  // Validate minimum items
  if (selectedItems.length < MIN_CHECKLIST) {
    return NextResponse.json(
      { error: `Minimum ${MIN_CHECKLIST} contenus à sélectionner` },
      { status: 400 }
    );
  }

  // Validate all keys
  for (const key of selectedItems) {
    if (!isValidContentKey(key)) {
      return NextResponse.json(
        { error: `Contenu invalide : ${key}` },
        { status: 400 }
      );
    }
  }

  // Validate chosenItem if provided
  if (chosenItem && !selectedItems.includes(chosenItem)) {
    return NextResponse.json(
      { error: "Le contenu choisi doit faire partie de la sélection" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Verify session is module 2, séance 1, responding
  const { data: session } = await admin
    .from("sessions")
    .select("status, current_module, current_seance")
    .eq("id", sessionId)
    .is("deleted_at", null)
    .single();

  if (!session || session.current_module !== 2 || (session.current_seance || 1) !== 1) {
    return NextResponse.json(
      { error: "La checklist n'est pas disponible pour cette séance" },
      { status: 400 }
    );
  }

  if (session.status !== "responding") {
    return NextResponse.json(
      { error: "Les réponses ne sont pas ouvertes" },
      { status: 400 }
    );
  }

  // Verify student belongs to session
  const { data: student } = await admin
    .from("students")
    .select("id")
    .eq("id", studentId)
    .eq("session_id", sessionId)
    .single();

  if (!student) {
    return NextResponse.json(
      { error: "Joueur introuvable dans cette partie" },
      { status: 404 }
    );
  }

  // Upsert checklist
  const { data, error } = await admin
    .from("module5_checklists")
    .upsert(
      {
        session_id: sessionId,
        student_id: studentId,
        selected_items: selectedItems,
        chosen_item: chosenItem || null,
        scene_marquante: sceneMarquante && typeof sceneMarquante === "string" ? sceneMarquante.trim() : null,
        deeper_reflection: deeperReflection && typeof deeperReflection === "string" ? deeperReflection.trim() : null,
      },
      { onConflict: "session_id,student_id" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// GET — all checklists for session + top items
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("module5_checklists")
    .select("*, students(display_name, avatar)")
    .eq("session_id", sessionId)
    .order("submitted_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Compute top items
  const itemCounts: Record<string, number> = {};
  for (const checklist of data || []) {
    for (const key of (checklist.selected_items as string[]) || []) {
      itemCounts[key] = (itemCounts[key] || 0) + 1;
    }
  }

  const topItems = Object.entries(itemCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([key, count]) => {
      const item = CONTENT_CATALOG.find((c) => c.key === key);
      return { key, label: item?.label || key, emoji: item?.emoji || "", count };
    });

  return NextResponse.json({
    checklists: data || [],
    topItems,
    count: data?.length || 0,
  });
}
