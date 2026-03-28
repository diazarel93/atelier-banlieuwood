import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { safeJson, withErrorHandler } from "@/lib/api-utils";
import { createSessionSchema, formatZodError } from "@/lib/schemas";
import { getEnabledModulesForFormula, type FormulaId } from "@/lib/formulas";
import { getAuthUser } from "@/lib/auth-helpers";
import { checkRateLimit, getIP } from "@/lib/rate-limit";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

// GET — list facilitator's sessions (admin sees all)
// Query params:
//   ?archived=true — return only soft-deleted sessions (bypasses RLS via admin client)
export const GET = withErrorHandler<Record<string, never>>(async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const authUser = await getAuthUser(supabase);
  const isAdmin = authUser?.role === "admin";
  const showArchived = req.nextUrl.searchParams.get("archived") === "true";

  const page = parseInt(req.nextUrl.searchParams.get("page") || "1", 10);
  const pageSize = 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // For archived sessions, use admin client to bypass RLS (which filters deleted_at IS NOT NULL)
  const client = showArchived ? createAdminClient() : supabase;

  let query = client
    .from("sessions")
    .select("*, students(id, is_active, last_seen_at)")
    .order("created_at", { ascending: false })
    .range(from, to);

  // Admin sees all sessions; others see only their own
  if (!isAdmin) {
    query = query.eq("facilitator_id", user.id);
  }

  // Filter by archived status
  if (showArchived) {
    query = query.not("deleted_at", "is", null);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[sessions GET]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  // Compute per-session student status counts
  const now = Date.now();
  const TWO_MINUTES = 2 * 60 * 1000;

  // Get current situation responses for active sessions
  const activeSessionIds = (data || [])
    .filter((s: Record<string, unknown>) => s.status === "responding")
    .map((s: Record<string, unknown>) => s.id as string);

  const responseMap: Record<string, Set<string>> = {};
  if (activeSessionIds.length > 0) {
    const { data: responses } = await supabase
      .from("responses")
      .select("session_id, student_id, situation_id")
      .in("session_id", activeSessionIds);

    // Group by session_id — we only care about latest situation's responses
    if (responses) {
      // We need to know each session's current situation — stored in sessions table as current_situation_index
      const sessionSituationMap: Record<string, number> = {};
      for (const s of data || []) {
        const sess = s as Record<string, unknown>;
        sessionSituationMap[sess.id as string] = (sess.current_situation_index as number) ?? 0;
      }

      for (const r of responses) {
        const key = r.session_id;
        if (!responseMap[key]) responseMap[key] = new Set();
        responseMap[key].add(r.student_id);
      }
    }
  }

  const sessions = (data || []).map((s: Record<string, unknown>) => {
    const students = s.students as { id: string; is_active: boolean; last_seen_at: string }[] | undefined;
    const studentList = students || [];
    const respondedStudents = responseMap[s.id as string] || new Set();

    let respondedCount = 0;
    let activeCount = 0;
    let disconnectedCount = 0;
    let stuckCount = 0;

    for (const st of studentList) {
      const lastSeen = st.last_seen_at ? now - new Date(st.last_seen_at).getTime() : Infinity;
      const isDisconnected = !st.is_active || lastSeen > 5 * 60 * 1000;
      const hasResponded = respondedStudents.has(st.id);

      if (isDisconnected) {
        disconnectedCount++;
      } else if (hasResponded) {
        respondedCount++;
      } else {
        activeCount++;
        // Stuck: active but last_seen > 2 min without responding
        if (s.status === "responding" && lastSeen > TWO_MINUTES && !hasResponded) {
          stuckCount++;
        }
      }
    }

    return {
      ...s,
      students: undefined, // don't send raw student list
      studentCount: studentList.length,
      respondedCount,
      activeCount,
      disconnectedCount,
      stuckCount,
    };
  });

  return NextResponse.json(sessions);
});

// POST — create a new session
export const POST = withErrorHandler<Record<string, never>>(async function POST(req: NextRequest) {
  const rl = checkRateLimit(getIP(req), "sessions-create", { max: 10, windowSec: 60 });
  if (rl) {
    return NextResponse.json({ error: rl.error }, { status: 429 });
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const parsed = await safeJson(req);
  if ("error" in parsed) return parsed.error;

  const validated = createSessionSchema.safeParse(parsed.data);
  if (!validated.success) {
    return NextResponse.json({ error: formatZodError(validated.error) }, { status: 400 });
  }

  const { title, level, template, description, question_timer, thematique, scheduled_at, class_label, formula } =
    validated.data;
  const cleanTitle = title.slice(0, 60);
  const cleanTemplate = template || null;
  const formulaId = (formula || "F0") as FormulaId;
  const modulesEnabled = getEnabledModulesForFormula(formulaId);

  // Get facilitator's org
  const { data: facilitator } = await supabase.from("facilitators").select("org_id").eq("id", user.id).single();

  if (!facilitator) {
    return NextResponse.json({ error: "Profil facilitateur introuvable" }, { status: 404 });
  }

  // Generate unique 6-char join code
  const joinCode = nanoid();

  const cleanDescription = description ? description.trim().slice(0, 200) : null;
  const cleanTimer = question_timer ?? null;

  const { data, error } = await supabase
    .from("sessions")
    .insert({
      org_id: facilitator.org_id,
      facilitator_id: user.id,
      title: cleanTitle,
      level,
      join_code: joinCode,
      template: cleanTemplate,
      ...(cleanDescription && { description: cleanDescription }),
      ...(cleanTimer && { question_timer: cleanTimer }),
      ...(thematique && { thematique }),
      ...(scheduled_at && { scheduled_at }),
      ...(class_label && { class_label }),
      formula: formulaId,
      modules_enabled: modulesEnabled,
    })
    .select()
    .single();

  if (error) {
    console.error("[sessions POST]", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json(data);
});
