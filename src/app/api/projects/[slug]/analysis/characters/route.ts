import { NextResponse } from "next/server";
import { listCharacters } from "@/lib/storage/character-store";

export interface CharacterAudit {
  id: string;
  name: string;
  color: string;
  role: string;
  scores: {
    identity: number;
    psychology: number;
    voice: number;
    arc: number;
    total: number;
  };
  missing: string[];
}

function auditCharacter(char: {
  id: string;
  name: string;
  color: string;
  role: string;
  age: string;
  occupation: string;
  backstory: string;
  psychology: { goal: string; need: string; flaw: string; fear: string; secret: string };
  traits: { name: string; intensity: number }[];
  voice: { vocabulary: string; register: string; verbalTics: string[]; examplePhrases: string[] };
  arc: { act: number; description: string }[];
  notes: string;
}): CharacterAudit {
  const missing: string[] = [];

  // Identity score (0-100): name, age, occupation, role, backstory
  let identity = 20; // name always present
  if (char.age) identity += 15;
  else missing.push("age");
  if (char.occupation) identity += 20;
  else missing.push("occupation");
  if (char.role) identity += 15;
  else missing.push("role");
  if (char.backstory && char.backstory.length > 50) identity += 30;
  else if (char.backstory) identity += 15;
  else missing.push("backstory");

  // Psychology score (0-100): goal, need, flaw, fear, secret + traits
  let psychology = 0;
  const p = char.psychology;
  if (p.goal) psychology += 15;
  else missing.push("objectif");
  if (p.need) psychology += 15;
  else missing.push("besoin");
  if (p.flaw) psychology += 20;
  else missing.push("faille");
  if (p.fear) psychology += 15;
  else missing.push("peur");
  if (p.secret) psychology += 15;
  else missing.push("secret");
  if (char.traits.length >= 3) psychology += 20;
  else if (char.traits.length > 0) psychology += 10;
  else missing.push("traits");

  // Voice score (0-100): vocabulary, register, tics, phrases
  let voice = 0;
  const v = char.voice;
  if (v.vocabulary) voice += 25;
  else missing.push("vocabulaire");
  if (v.register) voice += 25;
  else missing.push("registre");
  if (v.verbalTics?.length > 0) voice += 25;
  else missing.push("tics verbaux");
  if (v.examplePhrases?.length > 0) voice += 25;
  else missing.push("phrases exemples");

  // Arc score (0-100)
  let arc = 0;
  if (char.arc.length >= 3) arc = 100;
  else if (char.arc.length === 2) arc = 60;
  else if (char.arc.length === 1) arc = 30;
  else missing.push("arc narratif");

  const total = Math.round((identity + psychology + voice + arc) / 4);

  return {
    id: char.id,
    name: char.name,
    color: char.color,
    role: char.role,
    scores: { identity, psychology, voice, arc, total },
    missing,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const characters = await listCharacters(slug);
  const audits = characters.map(auditCharacter);

  const avgTotal =
    audits.length > 0
      ? Math.round(audits.reduce((s, a) => s + a.scores.total, 0) / audits.length)
      : 0;

  return NextResponse.json({
    audits,
    summary: {
      totalCharacters: audits.length,
      averageScore: avgTotal,
      fullyDefined: audits.filter((a) => a.scores.total >= 80).length,
      needsWork: audits.filter((a) => a.scores.total < 50).length,
    },
  });
}
