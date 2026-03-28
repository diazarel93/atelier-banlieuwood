import { Resend } from "resend";

let resendInstance: Resend | null = null;

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!resendInstance) {
    resendInstance = new Resend(key);
  }
  return resendInstance;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Banlieuwood <noreply@banlieuwood.fr>";

/**
 * Send an email via Resend. No-op if RESEND_API_KEY is not set.
 * Fire-and-forget — never throws, logs errors.
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
  } catch {
    // Best-effort — don't crash the request
  }
}
