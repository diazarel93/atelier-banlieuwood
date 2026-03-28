/**
 * Server-side auth helpers — loads facilitator profile from DB.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuthUser } from "./auth";

/**
 * Load the full AuthUser profile for the currently authenticated user.
 * Returns null if not authenticated or no facilitator profile exists.
 */
export async function getAuthUser(supabase: SupabaseClient): Promise<AuthUser | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: facilitator } = await supabase
    .from("facilitators")
    .select("id, email, name, role, status, institution, org_id")
    .eq("id", user.id)
    .single();

  if (!facilitator) return null;

  return facilitator as AuthUser;
}
