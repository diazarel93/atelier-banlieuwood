import { NextRequest, NextResponse } from "next/server";
import { requireFacilitator, withErrorHandler } from "@/lib/api-utils";
import { createAdminClient } from "@/lib/supabase/admin";

// GET — export the collective story as structured data
export const GET = withErrorHandler(async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sessionId } = await params;

  // Auth: only the facilitator who owns this session
  const auth = await requireFacilitator(sessionId);
  if ("error" in auth) return auth.error;

  const supabase = createAdminClient();

  // Get session
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  }

  // Get all collective choices ordered by situation position
  const { data: choices } = await supabase
    .from("collective_choices")
    .select("*, situations(position, seance, category, restitution_label)")
    .eq("session_id", sessionId)
    .order("validated_at", { ascending: true });

  // Get students
  const { data: students } = await supabase.from("students").select("display_name, avatar").eq("session_id", sessionId);

  // Get budget data if exists
  const { data: budgets } = await supabase
    .from("module2_budgets")
    .select("choices, students(display_name)")
    .eq("session_id", sessionId);

  // Build markdown export
  const lines: string[] = [];
  lines.push(`# ${session.title}`);
  lines.push("");
  lines.push(`**Niveau :** ${session.level}`);
  lines.push(`**Date :** ${new Date(session.created_at).toLocaleDateString("fr-FR")}`);
  lines.push(`**Élèves :** ${students?.map((s) => `${s.avatar} ${s.display_name}`).join(", ") || "Aucun"}`);
  lines.push("");

  // Group choices by category
  const CATEGORY_ORDER = [
    "personnage",
    "liens",
    "environnement",
    "conflit",
    "trajectoire",
    "intention",
    "renforcement",
  ];
  const CATEGORY_LABELS: Record<string, string> = {
    personnage: "Personnage",
    liens: "Liens",
    environnement: "Environnement",
    conflit: "Conflit",
    trajectoire: "Trajectoire",
    intention: "Intention",
    renforcement: "Renforcement",
  };

  if (choices && choices.length > 0) {
    lines.push("---");
    lines.push("");
    lines.push("## L'Histoire Collective");
    lines.push("");

    // Group by seance
    const bySeance: Record<number, typeof choices> = {};
    for (const c of choices) {
      const seance = (c.situations as { seance: number })?.seance || 1;
      if (!bySeance[seance]) bySeance[seance] = [];
      bySeance[seance].push(c);
    }

    for (const [seance, seanceChoices] of Object.entries(bySeance)) {
      lines.push(`### Séance ${seance}`);
      lines.push("");

      // Sort by category order then position
      const sorted = seanceChoices.sort((a, b) => {
        const catA = CATEGORY_ORDER.indexOf(a.category);
        const catB = CATEGORY_ORDER.indexOf(b.category);
        if (catA !== catB) return catA - catB;
        return (
          ((a.situations as { position: number })?.position || 0) -
          ((b.situations as { position: number })?.position || 0)
        );
      });

      let currentCategory = "";
      for (const choice of sorted) {
        if (choice.category !== currentCategory) {
          currentCategory = choice.category;
          lines.push(`#### ${CATEGORY_LABELS[currentCategory] || currentCategory}`);
          lines.push("");
        }
        const label = choice.restitution_label || CATEGORY_LABELS[choice.category] || choice.category;
        lines.push(`- **${label}** : ${choice.chosen_text}`);
      }
      lines.push("");
    }
  } else {
    lines.push("*Aucun choix collectif enregistré.*");
  }

  // Budget summary
  if (budgets && budgets.length > 0) {
    lines.push("---");
    lines.push("");
    lines.push("## Répartition Budget (Module 2)");
    lines.push("");

    const avgBudget: Record<string, number> = {};
    for (const cat of CATEGORY_ORDER) {
      const vals = budgets.map((b) => (b.choices as Record<string, number>)?.[cat] || 0);
      avgBudget[cat] = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    }

    for (const cat of CATEGORY_ORDER) {
      const bar = "█".repeat(Math.round(avgBudget[cat] / 5));
      lines.push(`- ${CATEGORY_LABELS[cat]} : ${avgBudget[cat]} crédits ${bar}`);
    }
    lines.push("");
  }

  // Get all responses with scores/flags for teacher report
  const { data: responses } = await supabase
    .from("responses")
    .select("id, student_id, text, teacher_score, teacher_comment, teacher_flag, is_highlighted, ai_score, ai_feedback")
    .eq("session_id", sessionId)
    .order("submitted_at");

  const studentMap = new Map((students || []).map((s) => [s.display_name, s]));

  // Starred responses section
  const starred = (responses || []).filter((r) => r.teacher_flag === "star");
  if (starred.length > 0) {
    lines.push("---");
    lines.push("");
    lines.push("## ⭐ Réponses Excellentes");
    lines.push("");
    for (const r of starred) {
      const sName = (students || []).find((s) => s.display_name)?.display_name || "";
      lines.push(
        `- ${r.text}${r.teacher_score ? ` (${r.teacher_score}/5)` : ""}${r.teacher_comment ? ` — _${r.teacher_comment}_` : ""}`,
      );
    }
    lines.push("");
  }

  // Flagged responses section
  const flagged = (responses || []).filter((r) => r.teacher_flag === "flag");
  if (flagged.length > 0) {
    lines.push("## 🚩 À Revoir");
    lines.push("");
    for (const r of flagged) {
      lines.push(`- ${r.text}${r.teacher_comment ? ` — _${r.teacher_comment}_` : ""}`);
    }
    lines.push("");
  }

  // Participation stats
  lines.push("---");
  lines.push("");
  lines.push("## Statistiques");
  lines.push("");
  lines.push(`- **Élèves** : ${students?.length || 0}`);
  lines.push(`- **Réponses totales** : ${responses?.length || 0}`);
  lines.push(`- **Choix collectifs** : ${choices?.length || 0}`);
  const highlighted = (responses || []).filter((r) => r.is_highlighted).length;
  if (highlighted > 0) lines.push(`- **Réponses mises en avant** : ${highlighted}`);
  lines.push("");

  lines.push("---");
  lines.push(`*Exporté depuis Banlieuwood Atelier — ${new Date().toLocaleDateString("fr-FR")}*`);

  const markdown = lines.join("\n");

  return NextResponse.json({
    markdown,
    session: {
      title: session.title,
      level: session.level,
      date: session.created_at,
    },
    choicesCount: choices?.length || 0,
    studentsCount: students?.length || 0,
    stats: {
      totalResponses: responses?.length || 0,
      starredCount: starred.length,
      flaggedCount: flagged.length,
      highlightedCount: highlighted,
    },
  });
});
