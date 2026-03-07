import { NextResponse } from "next/server";

interface ContactPayload {
  name: string;
  email: string;
  type: string;
  message: string;
}

const VALID_TYPES = ["general", "institution", "partenariat", "presse"];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactPayload;

    // ── Validation ──
    const errors: string[] = [];

    if (!body.name || body.name.trim().length < 2) {
      errors.push("Le nom doit contenir au moins 2 caracteres.");
    }

    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      errors.push("Adresse email invalide.");
    }

    if (!body.type || !VALID_TYPES.includes(body.type)) {
      errors.push("Type de demande invalide.");
    }

    if (!body.message || body.message.trim().length < 10) {
      errors.push("Le message doit contenir au moins 10 caracteres.");
    }

    if (errors.length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    // ── Log the message (will be replaced by email service later) ──
    console.log("[CONTACT]", {
      name: body.name.trim(),
      email: body.email.trim(),
      type: body.type,
      message: body.message.trim(),
      date: new Date().toISOString(),
    });

    // TODO: Integrate Resend / Sendgrid here
    // await sendEmail({ to: "contact@banlieuwood.fr", ... })

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, errors: ["Erreur serveur. Reessayez plus tard."] },
      { status: 500 },
    );
  }
}
