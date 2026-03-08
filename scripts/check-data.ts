import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env.local") });

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  // 1. Check sessions
  const { data: sessions, error: sessErr } = await db
    .from("sessions")
    .select("id, title, status, facilitator_id, join_code, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  console.log("=== SESSIONS ===");
  if (sessErr) console.error("Error:", sessErr.message);
  console.log(`Found: ${sessions?.length || 0}`);
  for (const s of sessions || []) {
    console.log(`  [${s.status}] ${s.title} (code: ${s.join_code}) facilitator: ${s.facilitator_id}`);
  }

  // 2. Check facilitators
  const { data: facilitators } = await db
    .from("facilitators")
    .select("id, email, org_id")
    .limit(5);

  console.log("\n=== FACILITATORS ===");
  for (const f of facilitators || []) {
    console.log(`  ${f.id} — ${f.email} (org: ${f.org_id})`);
  }

  // 3. Check students for simulated sessions
  const simSessions = (sessions || []).filter(s => s.title?.includes("simulée"));
  if (simSessions.length > 0) {
    const { data: students } = await db
      .from("students")
      .select("id, display_name, session_id")
      .eq("session_id", simSessions[0].id);

    console.log(`\n=== STUDENTS for "${simSessions[0].title}" ===`);
    console.log(`Found: ${students?.length || 0}`);
  }

  // 4. Check OIE scores
  const { data: oie, count } = await db
    .from("session_oie_scores")
    .select("id", { count: "exact" })
    .limit(1);

  console.log(`\n=== OIE SCORES ===`);
  console.log(`Total: ${count}`);

  // 5. Check responses
  const { count: respCount } = await db
    .from("responses")
    .select("id", { count: "exact" })
    .limit(1);

  console.log(`\n=== RESPONSES ===`);
  console.log(`Total: ${respCount}`);
}

main();
