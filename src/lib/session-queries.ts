import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Shared session query helpers.
 * Used by both v1 and v2 API routes to reduce Supabase query duplication.
 */

// ── Session queries ──

export async function fetchSessionById(client: SupabaseClient, sessionId: string, opts?: { withStudents?: boolean }) {
  const select = opts?.withStudents ? "*, students(*)" : "*";
  const { data, error } = await client
    .from("sessions")
    .select(select)
    .eq("id", sessionId)
    .is("deleted_at", null)
    .single();
  return { data, error };
}

export async function fetchSessionsByFacilitator(
  client: SupabaseClient,
  facilitatorId: string | null,
  opts?: {
    select?: string;
    classLabel?: string;
  },
) {
  const select =
    opts?.select ||
    "id, title, status, level, template, created_at, scheduled_at, class_label, completed_modules, students(id)";
  let query = client.from("sessions").select(select).is("deleted_at", null).order("created_at", { ascending: false });

  if (facilitatorId) {
    query = query.eq("facilitator_id", facilitatorId);
  }

  if (opts?.classLabel) {
    query = query.eq("class_label", opts.classLabel);
  }

  return query;
}

// ── Student queries ──

export async function fetchStudentsBySessionIds(
  client: SupabaseClient,
  sessionIds: string[],
  opts?: { select?: string },
) {
  const select = opts?.select || "id, display_name, avatar, profile_id, session_id, is_active, joined_at";
  const { data, error } = await client.from("students").select(select).in("session_id", sessionIds);
  return { data: data || [], error };
}

export async function fetchActiveStudentCount(client: SupabaseClient, sessionId: string) {
  const { count } = await client
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .eq("is_active", true);
  return count || 0;
}

// ── Response queries ──

export async function fetchResponses(client: SupabaseClient, sessionId: string, situationId: string) {
  const { data, error } = await client
    .from("responses")
    .select("*, students(display_name, avatar)")
    .eq("session_id", sessionId)
    .eq("situation_id", situationId)
    .is("reset_at", null)
    .order("submitted_at", { ascending: true });
  return { data: data || [], error };
}

export async function fetchVoteOptions(client: SupabaseClient, sessionId: string, situationId: string) {
  const { data, error } = await client
    .from("responses")
    .select("id, text")
    .eq("session_id", sessionId)
    .eq("situation_id", situationId)
    .eq("is_hidden", false)
    .eq("is_vote_option", true);
  return { data: data || [], error };
}

// ── Collective choices ──

export async function fetchCollectiveChoice(client: SupabaseClient, sessionId: string, situationId: string) {
  const { data, error } = await client
    .from("collective_choices")
    .select("*")
    .eq("session_id", sessionId)
    .eq("situation_id", situationId)
    .maybeSingle();
  return { data, error };
}

// ── Utility: build index map from array ──

/**
 * Build a Map from array, grouping items by a key.
 * Replaces O(n*m) filter-in-loop patterns with O(n+m) Map lookup.
 */
export function groupBy<T>(items: T[], keyFn: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    const arr = map.get(key);
    if (arr) {
      arr.push(item);
    } else {
      map.set(key, [item]);
    }
  }
  return map;
}
