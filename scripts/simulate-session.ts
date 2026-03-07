#!/usr/bin/env npx tsx
/**
 * simulate-session.ts
 *
 * Creates a complete simulated session:
 *   1. Session (with your facilitator account)
 *   2. 12 students join
 *   3. Loop through 3 situations:
 *      responding → responses → reviewing → vote options → voting → votes
 *   4. Session → done
 *
 * Usage:
 *   npx tsx scripts/simulate-session.ts
 *   # or
 *   npm run simulate-session
 *
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";
import { randomUUID } from "crypto";

// ── Load env ──
config({ path: resolve(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SERVICE_KEY);

// ── Config ──
const MODULE = 3;       // Le Héros — has 8 questions in seance 1
const SEANCE = 1;
const NUM_SITUATIONS = 3; // simulate 3 questions (enough to test)

// ── Fake students ──
const STUDENTS = [
  { display_name: "Yasmine", avatar: "🎬" },
  { display_name: "Karim", avatar: "🎭" },
  { display_name: "Léa", avatar: "🌟" },
  { display_name: "Enzo", avatar: "🎸" },
  { display_name: "Fatou", avatar: "🦋" },
  { display_name: "Nathan", avatar: "🔥" },
  { display_name: "Inès", avatar: "💫" },
  { display_name: "Rayan", avatar: "🚀" },
  { display_name: "Chloé", avatar: "🎨" },
  { display_name: "Mamadou", avatar: "⚡" },
  { display_name: "Sarah", avatar: "🌙" },
  { display_name: "Lucas", avatar: "🎯" },
];

// ── Realistic French responses per situation position ──
const RESPONSE_BANK: string[][] = [
  // Situation 1
  [
    "Le personnage ment parce qu'il a peur d'être rejeté par les autres.",
    "Il cache la vérité pour protéger quelqu'un qu'il aime.",
    "C'est de la manipulation pure, il veut garder le contrôle.",
    "Je pense qu'il ment par habitude, il ne sait plus faire autrement.",
    "Il a honte de ce qu'il a fait et le mensonge c'est plus facile.",
    "Peut-être qu'il ment pour se protéger d'un danger.",
    "Il essaie de préserver son image devant les autres.",
    "Le mensonge c'est sa seule arme, il a rien d'autre.",
    "Il ment parce que la vérité ferait trop mal à tout le monde.",
    "C'est un réflexe de survie, comme un animal acculé.",
    "Il veut garder le pouvoir sur la situation.",
    "Il a peur que la vérité détruise tout ce qu'il a construit.",
  ],
  // Situation 2
  [
    "Un héros c'est quelqu'un qui agit quand les autres ont peur.",
    "Pour moi le héros n'est pas forcément courageux, juste déterminé.",
    "Un héros peut aussi être quelqu'un d'ordinaire dans une situation extraordinaire.",
    "Le vrai héros c'est celui qui doute mais qui y va quand même.",
    "Un héros c'est quelqu'un qui sacrifie quelque chose pour les autres.",
    "Pas besoin de super-pouvoirs, juste de conviction.",
    "Le héros c'est celui qui refuse l'injustice, même seul.",
    "Un héros peut être silencieux, il n'a pas besoin de crier.",
    "C'est quelqu'un qui inspire les autres à être meilleurs.",
    "Un héros c'est quelqu'un qui choisit le difficile au lieu du facile.",
    "Le héros moderne c'est celui qui résiste à la pression du groupe.",
    "Un héros c'est quelqu'un qui a le courage de ses convictions.",
  ],
  // Situation 3
  [
    "Le conflit révèle la vraie nature des personnages.",
    "Sans conflit il n'y a pas d'histoire, c'est le moteur.",
    "Le conflit intérieur est plus intéressant que le conflit physique.",
    "Un bon conflit c'est quand les deux côtés ont raison.",
    "Le conflit force les personnages à faire des choix impossibles.",
    "C'est dans le conflit qu'on voit qui est vraiment loyal.",
    "Le meilleur conflit c'est quand l'ennemi a de bonnes raisons.",
    "Un conflit peut aussi être entre ce qu'on veut et ce qu'on doit faire.",
    "Le conflit crée de la tension et la tension crée de l'émotion.",
    "Sans conflit les personnages ne changent jamais.",
    "Le conflit le plus dur c'est contre soi-même.",
    "Un bon conflit rend le spectateur mal à l'aise, il sait pas qui soutenir.",
  ],
];

// ── Helpers ──
function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Main ──
async function main() {
  console.log("\n🎬 SIMULATION DE SÉANCE\n");

  // 0. Find facilitator (your account)
  const { data: facilitators } = await db
    .from("facilitators")
    .select("id, org_id")
    .limit(1)
    .single();

  if (!facilitators) {
    console.error("No facilitator found. Log in to the app first.");
    process.exit(1);
  }

  const { id: facilitatorId, org_id: orgId } = facilitators;
  console.log(`  Facilitateur: ${facilitatorId}`);

  // 1. Create session
  const joinCode = generateJoinCode();
  const { data: session, error: sessErr } = await db
    .from("sessions")
    .insert({
      id: randomUUID(),
      facilitator_id: facilitatorId,
      org_id: orgId,
      title: `Séance simulée — ${new Date().toLocaleDateString("fr-FR")}`,
      join_code: joinCode,
      level: "college",
      status: "waiting",
      current_module: MODULE,
      current_seance: SEANCE,
      current_situation_index: 0,
      mode: "guided",
    })
    .select()
    .single();

  if (sessErr || !session) {
    console.error("Failed to create session:", sessErr?.message);
    process.exit(1);
  }

  console.log(`  Séance créée: ${session.title}`);
  console.log(`  Code: ${joinCode}`);
  console.log(`  ID: ${session.id}\n`);

  // 2. Create students
  const studentRows = STUDENTS.map((s) => ({
    id: randomUUID(),
    session_id: session.id,
    display_name: s.display_name,
    avatar: s.avatar,
    is_active: true,
    last_seen_at: new Date().toISOString(),
  }));

  const { data: students, error: stuErr } = await db
    .from("students")
    .insert(studentRows)
    .select();

  if (stuErr || !students) {
    console.error("Failed to create students:", stuErr?.message);
    process.exit(1);
  }

  console.log(`  ${students.length} élèves inscrits\n`);

  // 3. Fetch situations for this module/seance
  const { data: situations, error: sitErr } = await db
    .from("situations")
    .select("id, position, prompt_10_13, category")
    .eq("module", MODULE)
    .eq("seance", SEANCE)
    .order("position", { ascending: true })
    .limit(NUM_SITUATIONS);

  if (sitErr) {
    console.error("Failed to fetch situations:", sitErr.message);
    process.exit(1);
  }

  if (!situations || situations.length === 0) {
    console.error("No situations found for module", MODULE, "seance", SEANCE);
    process.exit(1);
  }

  console.log(`  ${situations.length} situations à jouer\n`);

  // 4. Loop through situations
  for (let i = 0; i < situations.length; i++) {
    const sit = situations[i];
    const responses = RESPONSE_BANK[i] || RESPONSE_BANK[0];

    console.log(`  ── Situation ${i + 1}/${situations.length} (position ${sit.position}) ──`);
    console.log(`     ${(sit.prompt_10_13 || "").slice(0, 60)}...\n`);

    // 4a. Status → responding
    await db
      .from("sessions")
      .update({
        status: "responding",
        current_situation_index: i,
        question_opened_at: new Date().toISOString(),
      })
      .eq("id", session.id);

    console.log("     Status: responding");

    // 4b. Submit responses (all students)
    const responseRows = students.map((stu, idx) => ({
      session_id: session.id,
      student_id: stu.id,
      situation_id: sit.id,
      text: responses[idx % responses.length],
    }));

    const { error: respErr } = await db.from("responses").insert(responseRows);

    if (respErr) {
      console.error("     Failed to insert responses:", respErr.message);
      continue;
    }

    console.log(`     ${responseRows.length} réponses soumises`);

    // 4c. Status → reviewing
    await db
      .from("sessions")
      .update({ status: "reviewing" })
      .eq("id", session.id);

    console.log("     Status: reviewing");

    // 4d. Fetch responses and mark 3 as vote options + highlight 1
    const { data: respData } = await db
      .from("responses")
      .select("id")
      .eq("session_id", session.id)
      .eq("situation_id", sit.id);

    if (respData && respData.length >= 3) {
      // Shuffle and pick 3 for vote options
      const shuffled = [...respData].sort(() => Math.random() - 0.5);
      const voteOptions = shuffled.slice(0, 3);

      for (const r of voteOptions) {
        await db
          .from("responses")
          .update({ is_vote_option: true })
          .eq("id", r.id);
      }

      // Highlight the first one
      await db
        .from("responses")
        .update({ is_highlighted: true, teacher_comment: "Excellente réponse !" })
        .eq("id", voteOptions[0].id);

      console.log(`     3 options de vote marquées, 1 highlight`);

      // 4e. Status → voting
      await db
        .from("sessions")
        .update({ status: "voting" })
        .eq("id", session.id);

      console.log("     Status: voting");

      // 4f. Submit votes (each student picks a random vote option)
      const voteRows = students.map((stu) => ({
        session_id: session.id,
        student_id: stu.id,
        situation_id: sit.id,
        chosen_response_id: pick(voteOptions).id,
        voted_at: new Date().toISOString(),
      }));

      const { error: voteErr } = await db.from("votes").insert(voteRows);

      if (voteErr) {
        console.error("     Failed to insert votes:", voteErr.message);
      } else {
        console.log(`     ${voteRows.length} votes enregistrés`);
      }

      // 4g. Record collective choice (winning response)
      const voteCounts = new Map<string, number>();
      for (const v of voteRows) {
        voteCounts.set(v.chosen_response_id, (voteCounts.get(v.chosen_response_id) || 0) + 1);
      }
      const winnerId = [...voteCounts.entries()].sort((a, b) => b[1] - a[1])[0][0];

      await db.from("collective_choices").insert({
        session_id: session.id,
        situation_id: sit.id,
        chosen_response_id: winnerId,
        vote_count: voteCounts.get(winnerId),
      });

      console.log("     Choix collectif enregistré");
    }

    console.log("");
  }

  // 5. End session
  await db
    .from("sessions")
    .update({ status: "done" })
    .eq("id", session.id);

  console.log("  ✅ Séance terminée (status: done)\n");
  console.log("  ── Résumé ──");
  console.log(`  Séance: ${session.title}`);
  console.log(`  Code: ${joinCode}`);
  console.log(`  ${students.length} élèves, ${situations.length} situations`);
  console.log(`  \n  Teste maintenant :`);
  console.log(`    → /v2                          (dashboard)`);
  console.log(`    → /v2/seances/${session.id}     (détail)`);
  console.log(`    → /v2/statistiques              (stats)`);
  console.log(`    → /session/${session.id}/results (résultats)\n`);
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
