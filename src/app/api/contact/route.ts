import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { log } from "@/lib/logger";
import { withErrorHandler } from "@/lib/api-utils";
import { checkRateLimit, getIP } from "@/lib/rate-limit";

interface ContactPayload {
  name: string;
  email: string;
  type: string;
  message: string;
}

const VALID_TYPES = ["general", "institution", "partenariat", "presse"];

const TYPE_LABELS: Record<string, string> = {
  general: "Question générale",
  institution: "Institution / Établissement",
  partenariat: "Partenariat",
  presse: "Presse / Médias",
};

export const POST = withErrorHandler<Record<string, never>>(async function POST(request: NextRequest) {
  const rl = checkRateLimit(getIP(request), "contact", { max: 10, windowSec: 60 });
  if (rl) return NextResponse.json({ error: rl.error }, { status: 429 });

  try {
    const body = (await request.json()) as ContactPayload;

    // ── Validation ──
    const errors: string[] = [];

    if (!body.name || body.name.trim().length < 2) {
      errors.push("Le nom doit contenir au moins 2 caractères.");
    }

    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      errors.push("Adresse email invalide.");
    }

    if (!body.type || !VALID_TYPES.includes(body.type)) {
      errors.push("Type de demande invalide.");
    }

    if (!body.message || body.message.trim().length < 10) {
      errors.push("Le message doit contenir au moins 10 caractères.");
    }

    if (errors.length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const name = body.name.trim();
    const email = body.email.trim();
    const type = body.type;
    const message = body.message.trim();

    // ── Send email via Resend ──
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: "Banlieuwood <noreply@banlieuwood.fr>",
        to: ["contact@banlieuwood.fr"],
        replyTo: email,
        subject: `[Contact] ${TYPE_LABELS[type] || type} — ${name}`,
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 600px;">
            <h2 style="color: #1a1a2e;">Nouveau message de contact</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 12px; font-weight: 600; color: #666; width: 120px;">Nom</td>
                <td style="padding: 8px 12px;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; font-weight: 600; color: #666;">Email</td>
                <td style="padding: 8px 12px;"><a href="mailto:${email}">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; font-weight: 600; color: #666;">Type</td>
                <td style="padding: 8px 12px;">${TYPE_LABELS[type] || type}</td>
              </tr>
            </table>
            <div style="margin-top: 16px; padding: 16px; background: #f5f3ef; border-radius: 8px;">
              <p style="white-space: pre-wrap; margin: 0; color: #1a1a2e;">${message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
            </div>
            <p style="margin-top: 24px; font-size: 12px; color: #999;">
              Envoyé depuis le formulaire de contact Banlieuwood — ${new Date().toLocaleDateString("fr-FR")}
            </p>
          </div>
        `,
      });
    } else {
      // Fallback: log to console if no API key configured
      log.info("Contact form submitted (no RESEND_API_KEY)", {
        route: "/api/contact",
        name,
        email,
        type,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    log.error("Contact form error", { route: "/api/contact", error: String(err) });
    return NextResponse.json({ success: false, errors: ["Erreur serveur. Réessayez plus tard."] }, { status: 500 });
  }
});
