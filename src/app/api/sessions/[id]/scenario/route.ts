import { NextResponse } from "next/server";

// MODULE 6 — Le Scénario API (stub)
// Full implementation pending Adrian's detailed specs

export async function GET() {
  return NextResponse.json({
    message: "Module Scénario — en cours de développement",
    scenes: [],
    missions: [],
  });
}

export async function POST() {
  return NextResponse.json(
    { error: "Module Scénario non encore implémenté" },
    { status: 501 }
  );
}
