export function accountRejectedEmail(name: string): { subject: string; html: string } {
  return {
    subject: "Banlieuwood — Demande d'acces",
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px;">
        <h1 style="font-size: 24px; color: #1a1a2e; margin-bottom: 16px;">Demande d'acces non retenue</h1>
        <p style="color: #555; line-height: 1.6;">
          Bonjour ${name}, nous avons examine votre demande d'acces a Banlieuwood.
          Malheureusement, nous ne sommes pas en mesure d'activer votre compte pour le moment.
        </p>
        <p style="color: #555; line-height: 1.6;">
          Si vous pensez qu'il s'agit d'une erreur, n'hesitez pas a nous contacter
          a <a href="mailto:contact@banlieuwood.fr" style="color: #FF6B35;">contact@banlieuwood.fr</a>.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="font-size: 12px; color: #999;">
          Banlieuwood — Le jeu collaboratif de creation cinematographique
        </p>
      </div>
    `,
  };
}
