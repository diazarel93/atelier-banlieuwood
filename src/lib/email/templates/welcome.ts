export function welcomeEmail(name: string): { subject: string; html: string } {
  return {
    subject: "Bienvenue sur Banlieuwood !",
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px;">
        <h1 style="font-size: 24px; color: #1a1a2e; margin-bottom: 16px;">Bienvenue ${name} !</h1>
        <p style="color: #555; line-height: 1.6;">
          Votre compte Banlieuwood a ete cree avec succes. Un administrateur va
          examiner votre demande et activer votre acces dans les plus brefs delais.
        </p>
        <p style="color: #555; line-height: 1.6;">
          Vous recevrez un email de confirmation des que votre compte sera valide.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="font-size: 12px; color: #999;">
          Banlieuwood — Le jeu collaboratif de creation cinematographique
        </p>
      </div>
    `,
  };
}
