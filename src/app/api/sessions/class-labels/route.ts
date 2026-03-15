import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { withErrorHandler } from "@/lib/api-utils";

/**
 * GET /api/sessions/class-labels
 * Returns distinct class_label values for the current facilitator's sessions.
 * Used for autocomplete in the session create wizard.
 */
export const GET = withErrorHandler<Record<string, never>>(async function GET() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("sessions")
    .select("class_label")
    .eq("facilitator_id", user.id)
    .not("class_label", "is", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[class-labels GET]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  // Extract unique non-empty class labels
  const seen = new Set<string>();
  const labels: string[] = [];
  for (const row of data || []) {
    const label = (row.class_label as string)?.trim();
    if (label && !seen.has(label)) {
      seen.add(label);
      labels.push(label);
    }
  }

  return NextResponse.json({ labels });
});
