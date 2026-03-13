export function invitationEmail(
  email: string,
  token: string,
  baseUrl: string,
  institution?: string
): { subject: string; html: string } {
  const signupUrl = `${baseUrl}/login?token=${token}`;

  return {
    subject: "Invitation Banlieuwood",
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px;">
        <h1 style="font-size: 24px; color: #1a1a2e; margin-bottom: 16px;">Vous etes invite !</h1>
        <p style="color: #555; line-height: 1.6;">
          Vous avez ete invite a rejoindre Banlieuwood${institution ? ` pour ${institution}` : ""}.
          Cliquez sur le lien ci-dessous pour creer votre compte (activation immediate).
        </p>
        <a href="${signupUrl}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #FF6B35; color: white; text-decoration: none; border-radius: 12px; font-weight: 600;">
          Creer mon compte
        </a>
        <p style="color: #999; font-size: 12px; margin-top: 16px;">
          Ou copiez ce lien : ${signupUrl}
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="font-size: 12px; color: #999;">
          Banlieuwood — Le jeu collaboratif de creation cinematographique
        </p>
      </div>
    `,
  };
}
