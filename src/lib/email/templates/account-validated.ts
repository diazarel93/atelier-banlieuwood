export function accountValidatedEmail(name: string, loginUrl: string): { subject: string; html: string } {
  return {
    subject: "Votre compte Banlieuwood est active !",
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px;">
        <h1 style="font-size: 24px; color: #1a1a2e; margin-bottom: 16px;">Compte active !</h1>
        <p style="color: #555; line-height: 1.6;">
          Bonjour ${name}, votre compte a ete valide par un administrateur.
          Vous pouvez maintenant acceder a la plateforme.
        </p>
        <a href="${loginUrl}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #FF6B35; color: white; text-decoration: none; border-radius: 12px; font-weight: 600;">
          Se connecter
        </a>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="font-size: 12px; color: #999;">
          Banlieuwood — Le jeu collaboratif de creation cinematographique
        </p>
      </div>
    `,
  };
}
